// Айдоочунун англисчеси — кирүү сервери (логин/пароль + бир жолку кирүү коду)
// Эч кандай кошумча пакет керек эмес: Node.js 18+ жетиштүү.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || (fs.existsSync("/data") ? "/data" : path.join(__dirname, "data"));
const DB_FILE = path.join(DATA_DIR, "db.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const APP_DIR = path.join(__dirname, "public", "app");
const BRAND = "Айдоочунун англисчеси";

// ---------- маалымат базасы (JSON файл) ----------
fs.mkdirSync(DATA_DIR, { recursive: true });
let db = { users: {}, codes: {}, sessions: {}, admin: {} };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE, "utf8"))); } catch (e) {}
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const tmp = DB_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, DB_FILE);
  }, 50);
}
function saveNow() { clearTimeout(saveTimer); const tmp = DB_FILE + ".tmp"; fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, DB_FILE); }

// ---------- жардамчылар ----------
const rand = (n) => crypto.randomBytes(n).toString("base64url");
function hashPass(p, salt) { salt = salt || rand(16); return salt + ":" + crypto.scryptSync(p, salt, 32).toString("hex"); }
function checkPass(p, h) {
  if (!h) return false; const [salt, hex] = h.split(":");
  const a = Buffer.from(crypto.scryptSync(p, salt, 32).toString("hex")), b = Buffer.from(hex);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function safeEq(a, b) { a = Buffer.from(String(a)); b = Buffer.from(String(b)); return a.length === b.length && crypto.timingSafeEqual(a, b); }
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function newCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; const r = crypto.randomBytes(8);
  const s = [...r].map((b) => A[b % 32]).join(""); return "AE-" + s.slice(0, 4) + "-" + s.slice(4);
}
const normCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^AE/, "");
const fmtDate = (t) => (t ? new Date(t).toISOString().slice(0, 10) : "—");
const DAY = 86400000;

function parseCookies(req) {
  const o = {}; (req.headers.cookie || "").split(";").forEach((p) => { const i = p.indexOf("="); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return o;
}
function isHttps(req) { return (req.headers["x-forwarded-proto"] || "").split(",")[0] === "https"; }
function setCookie(res, req, name, val, maxAgeSec) {
  const c = `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}` + (isHttps(req) ? "; Secure" : "");
  const prev = res.getHeader("Set-Cookie"); res.setHeader("Set-Cookie", prev ? [].concat(prev, c) : c);
}
function readBody(req) {
  return new Promise((ok) => { let d = ""; req.on("data", (c) => { d += c; if (d.length > 1e5) req.destroy(); }); req.on("end", () => ok(Object.fromEntries(new URLSearchParams(d)))); });
}
function send(res, code, html, headers) { res.writeHead(code, Object.assign({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }, headers || {})); res.end(html); }
const redirect = (res, to) => { res.writeHead(303, { Location: to, "Cache-Control": "no-store" }); res.end(); };

// жөнөкөй чектөө: бир IP'ден 15 мүнөттө 10 туура эмес аракет
const fails = new Map();
function ipOf(req) { return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress; }
function tooMany(req, key) { const k = key + ":" + ipOf(req); const r = fails.get(k); return r && r.n >= 10 && Date.now() - r.t < 15 * 60000; }
function fail(req, key) { const k = key + ":" + ipOf(req); const r = fails.get(k); if (!r || Date.now() - r.t > 15 * 60000) fails.set(k, { n: 1, t: Date.now() }); else r.n++; }

// түзмөк белгиси (браузерге байлоо)
function deviceOf(req, res) {
  const c = parseCookies(req); let d = c.dev;
  if (!d || d.length < 20) { d = rand(24); setCookie(res, req, "dev", d, 10 * 365 * 86400); }
  return d;
}
function currentUser(req) {
  const c = parseCookies(req); const s = c.sid && db.sessions[c.sid];
  if (!s || s.exp < Date.now()) return null;
  const u = db.users[s.u]; if (!u || u.blocked) return null;
  if (u.expires && u.expires < Date.now()) return null;
  if (u.device && c.dev !== u.device) return null;
  return u;
}

// ---------- баракчалардын көрүнүшү ----------
const CSS = `*{box-sizing:border-box}body{margin:0;font-family:-apple-system,system-ui,Inter,sans-serif;background:#f4f6f2;color:#17241c}
.wrap{max-width:460px;margin:0 auto;padding:28px 18px 40px}h1{font-size:30px;margin:6px 0 18px;color:#1f3d2b;letter-spacing:-.5px}
.card{background:#fff;border:1px solid #dfe5df;border-radius:22px;padding:22px 20px}
label{display:block;font-weight:800;margin:16px 0 8px}input,select{width:100%;font-size:17px;padding:14px;border:1.5px solid #c9d5cc;border-radius:14px;background:#fff;font-family:inherit}
input:focus{outline:3px solid #b5653d55;border-color:#b5653d}
button{width:100%;margin-top:20px;padding:16px;border:0;border-radius:14px;background:#2a5a43;color:#fff;font-size:17px;font-weight:800;font-family:inherit}
.err{background:#f6e6e3;color:#8a3420;border-radius:16px;padding:14px 16px;margin-bottom:16px;font-weight:600}
.ok{background:#e4f1e7;color:#1f4d31;border-radius:16px;padding:14px 16px;margin-bottom:16px;font-weight:600}
p.m{color:#56665c;line-height:1.45}a{color:#2a5a43;font-weight:700}.foot{color:#6b786f;font-size:14px;line-height:1.45;margin-top:22px}
.logo{display:inline-grid;place-items:center;width:52px;height:52px;border-radius:16px;background:#2f6b45;color:#fff;font-size:26px}
table{width:100%;border-collapse:collapse;font-size:14px}td,th{padding:8px 4px;border-bottom:1px solid #eee;text-align:left;vertical-align:top}
.mono{font-family:ui-monospace,Menlo,monospace;font-weight:800}.small{font-size:13px;color:#6b786f}
.row{display:flex;gap:6px;flex-wrap:wrap}.row form{margin:0}.row button{width:auto;margin:0;padding:8px 10px;font-size:13px;border-radius:10px}
.sec{background:#b5653d}.gray{background:#8a958d}.wide{max-width:900px}`;
function page(title, body, wide) {
  return `<!DOCTYPE html><html lang="ky"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#2F6B45"><title>${esc(title)} — ${BRAND}</title><style>${CSS}</style></head>
<body><div class="wrap${wide ? " wide" : ""}">${body}</div></body></html>`;
}
const msg = (e, ok) => (e ? `<div class="err">${esc(e)}</div>` : "") + (ok ? `<div class="ok">${esc(ok)}</div>` : "");
function loginPage(err, ok) {
  return page("Кирүү", `<div class="logo">🚚</div><h1>Аккаунтка кирүү</h1>${msg(err, ok)}
<form class="card" method="post" action="/login" autocomplete="on">
<label>Логин</label><input name="login" autocapitalize="off" autocorrect="off" autocomplete="username" required>
<label>Пароль</label><input name="password" type="password" autocomplete="current-password" required>
<button>Кирүү</button>
<p class="m" style="margin-top:18px">Жаңы сатып алдыңызбы? <a href="/activate">Кодду активдештирүү</a></p></form>
<p class="foot">Жеке окуу аккаунту. Кирүү укугун ээси берет. Суроо болсо, кирүү кодун берген адамга кайрылыңыз.</p>`);
}
function activatePage(err, v) {
  v = v || {};
  return page("Активдештирүү", `<div class="logo">🚚</div><h1>Кирүүнү активдештирүү</h1>${msg(err)}
<form class="card" method="post" action="/activate" autocomplete="off">
<p class="m" style="margin-top:0">Сатып алгандан кийин берилген жеке кодуңузду киргизиңиз. Аккаунт ушул браузерге байланат.</p>
<label>Жеке кирүү коду</label><input name="code" value="${esc(v.code)}" placeholder="AE-XXXX-XXXX" autocapitalize="characters" required>
<label>Жаңы логин (латын тамгалары, сан, . _ -)</label><input name="login" value="${esc(v.login)}" autocapitalize="off" autocorrect="off" autocomplete="username" required>
<label>Жаңы пароль (кеминде 10 белги)</label><input name="password" type="password" autocomplete="new-password" required>
<button>Активдештирүү</button>
<p class="m" style="margin-top:18px">Башка телефонго өтүү үчүн аккаунт ээсине кайрылыңыз.</p>
<p class="m"><a href="/login">Менде аккаунт бар</a></p></form>
<p class="foot">Жеке окуу аккаунту. Кирүү укугун ээси берет. Суроо болсо, кирүү кодун берген адамга кайрылыңыз.</p>`);
}

// ---------- админ ----------
function adminOk(req) {
  const c = parseCookies(req); const s = c.adm && db.admin.sessions && db.admin.sessions[c.adm];
  return !!(s && s > Date.now());
}
function adminLogin(err) {
  return page("Админ", `<h1>🔑 Ээсинин панели</h1>${msg(err)}
${ADMIN_PASSWORD ? "" : `<div class="err">ADMIN_PASSWORD орнотулган эмес. Railway'де Variables бөлүмүнө ADMIN_PASSWORD кошуңуз.</div>`}
<form class="card" method="post" action="/admin/login"><label>Админ пароль</label><input name="password" type="password" required><button>Кирүү</button></form>`);
}
function adminPage(flash, newCodes) {
  const codes = Object.values(db.codes).sort((a, b) => b.created - a.created);
  const users = Object.values(db.users).sort((a, b) => b.created - a.created);
  const fresh = newCodes && newCodes.length ? `<div class="ok">Жаңы коддор (көчүрүп, кардарга жөнөтүңүз):<br>${newCodes.map((c) => `<div class="mono" style="font-size:20px;margin-top:6px;user-select:all">${c}</div>`).join("")}</div>` : "";
  const unused = codes.filter((c) => !c.usedBy);
  return page("Админ", `<div class="row" style="justify-content:space-between;align-items:center"><h1 style="margin:0">🔑 Ээсинин панели</h1><a href="/admin/logout">Чыгуу</a></div>
<p class="small">Колдонуучулар: <b>${users.length}</b> · Колдонулбаган коддор: <b>${unused.length}</b></p>${msg(null, flash)}${fresh}
<form class="card" method="post" action="/admin/codes">
<b>Жаңы кирүү коду чыгаруу</b>
<label>Канча код</label><input name="count" type="number" min="1" max="50" value="1">
<label>Кирүү мөөнөтү</label><select name="days"><option value="0">Түбөлүк</option><option value="30">30 күн</option><option value="90">90 күн</option><option value="180">6 ай</option><option value="365">1 жыл</option></select>
<label>Эскертүү (кардардын аты / телефону)</label><input name="note" placeholder="Мисалы: Азамат, +1 555...">
<button>Код чыгаруу</button></form>

<div class="card" style="margin-top:16px"><b>Колдонуучулар</b>
<table><tr><th>Логин</th><th>Эскертүү</th><th>Мөөнөт</th><th>Акыркы кирүү</th><th></th></tr>
${users.map((u) => `<tr><td class="mono">${esc(u.login)}${u.blocked ? ' <span style="color:#c0392b">⛔</span>' : ""}<div class="small">${u.device ? "📱 байланган" : "📱 бош"}</div></td>
<td>${esc(u.note)}</td><td>${u.expires ? fmtDate(u.expires) : "түбөлүк"}</td><td>${fmtDate(u.lastLogin)}</td>
<td><div class="row">
<form method="post" action="/admin/user"><input type="hidden" name="u" value="${esc(u.login)}"><input type="hidden" name="a" value="reset"><button class="sec" title="Башка телефонго өтүүгө уруксат">Телефонду алмаштыруу</button></form>
<form method="post" action="/admin/user"><input type="hidden" name="u" value="${esc(u.login)}"><input type="hidden" name="a" value="${u.blocked ? "unblock" : "block"}"><button class="gray">${u.blocked ? "Ачуу" : "Бөгөттөө"}</button></form>
<form method="post" action="/admin/user"><input type="hidden" name="u" value="${esc(u.login)}"><input type="hidden" name="a" value="extend"><button>+30 күн</button></form>
<form method="post" action="/admin/user" onsubmit="return confirm('${esc(u.login)} өчүрүлсүнбү?')"><input type="hidden" name="u" value="${esc(u.login)}"><input type="hidden" name="a" value="delete"><button class="gray">Өчүрүү</button></form>
</div></td></tr>`).join("") || `<tr><td colspan="5" class="small">Азырынча жок</td></tr>`}</table></div>

<div class="card" style="margin-top:16px"><b>Коддор</b>
<table><tr><th>Код</th><th>Мөөнөт</th><th>Эскертүү</th><th>Абалы</th><th></th></tr>
${codes.map((c) => `<tr><td class="mono" style="user-select:all">${c.code}</td><td>${c.days ? c.days + " күн" : "түбөлүк"}</td><td>${esc(c.note)}</td>
<td>${c.usedBy ? "✅ " + esc(c.usedBy) + "<div class='small'>" + fmtDate(c.usedAt) + "</div>" : "⏳ колдонула элек"}</td>
<td>${c.usedBy ? "" : `<form method="post" action="/admin/code-del"><input type="hidden" name="c" value="${c.code}"><div class="row"><button class="gray">Өчүрүү</button></div></form>`}</td></tr>`).join("") || `<tr><td colspan="5" class="small">Азырынча жок</td></tr>`}</table></div>`, true);
}

// ---------- статикалык файлдар ----------
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
function serveApp(req, res, rel) {
  rel = decodeURIComponent(rel || "index.html") || "index.html";
  const file = path.normalize(path.join(APP_DIR, rel));
  if (!file.startsWith(APP_DIR)) return send(res, 400, "bad path");
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, page("Табылган жок", "<h1>Табылган жок</h1><a href='/app/'>Башкы бетке</a>"));
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": ext === ".html" ? "no-store" : "private, max-age=604800" });
    fs.createReadStream(file).pipe(res);
  });
}

// ---------- маршруттар ----------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x"); const p = url.pathname;
    res.setHeader("X-Frame-Options", "SAMEORIGIN"); res.setHeader("X-Content-Type-Options", "nosniff");
    const dev = deviceOf(req, res);

    if (p === "/health") return send(res, 200, "ok");
    if (p === "/" ) return redirect(res, currentUser(req) ? "/app/" : "/login");

    if (p === "/login" && req.method === "GET") return currentUser(req) ? redirect(res, "/app/") : send(res, 200, loginPage());
    if (p === "/login" && req.method === "POST") {
      if (tooMany(req, "login")) return send(res, 429, loginPage("Аракет өтө көп болду. 15 мүнөттөн кийин кайра аракет кылыңыз."));
      const b = await readBody(req); const login = String(b.login || "").trim().toLowerCase();
      const u = db.users[login];
      if (!u || !checkPass(String(b.password || ""), u.pass)) { fail(req, "login"); return send(res, 401, loginPage("Кирүү мүмкүн эмес. Логин, пароль же кирүү мөөнөтүн текшериңиз.")); }
      if (u.blocked) return send(res, 403, loginPage("Бул аккаунт бөгөттөлгөн. Аккаунт ээсине кайрылыңыз."));
      if (u.expires && u.expires < Date.now()) return send(res, 403, loginPage("Кирүү мөөнөтү бүттү. Узартуу үчүн аккаунт ээсине кайрылыңыз."));
      if (u.device && u.device !== dev) return send(res, 403, loginPage("Бул аккаунт башка телефонго байланган. Телефонду алмаштыруу үчүн аккаунт ээсине кайрылыңыз."));
      if (!u.device) u.device = dev;
      Object.keys(db.sessions).forEach((k) => { if (db.sessions[k].u === login) delete db.sessions[k]; });
      const sid = rand(32); db.sessions[sid] = { u: login, exp: Date.now() + 180 * DAY };
      u.lastLogin = Date.now(); save();
      setCookie(res, req, "sid", sid, 180 * 86400); return redirect(res, "/app/");
    }
    if (p === "/activate" && req.method === "GET") return send(res, 200, activatePage(null, { code: url.searchParams.get("code") || "" }));
    if (p === "/activate" && req.method === "POST") {
      if (tooMany(req, "act")) return send(res, 429, activatePage("Аракет өтө көп болду. 15 мүнөттөн кийин кайра аракет кылыңыз."));
      const b = await readBody(req); const login = String(b.login || "").trim().toLowerCase(); const pw = String(b.password || "");
      const key = normCode(b.code); const c = Object.values(db.codes).find((x) => normCode(x.code) === key);
      const v = { code: b.code, login: b.login };
      if (!c) { fail(req, "act"); return send(res, 400, activatePage("Код туура эмес. Текшерип, кайра жазыңыз.", v)); }
      if (c.usedBy) { fail(req, "act"); return send(res, 400, activatePage("Бул код мурун колдонулган. Аккаунт ээсине кайрылыңыз.", v)); }
      if (!/^[a-z0-9._-]{3,32}$/.test(login)) return send(res, 400, activatePage("Логин 3–32 белги болсун: латын тамгалары, сан, . _ -", v));
      if (db.users[login]) return send(res, 400, activatePage("Бул логин бош эмес. Башка логин тандаңыз.", v));
      if (pw.length < 10) return send(res, 400, activatePage("Пароль кеминде 10 белги болушу керек.", v));
      db.users[login] = { login, pass: hashPass(pw), device: dev, created: Date.now(), expires: c.days ? Date.now() + c.days * DAY : 0, note: c.note || "", code: c.code, lastLogin: Date.now() };
      c.usedBy = login; c.usedAt = Date.now();
      const sid = rand(32); db.sessions[sid] = { u: login, exp: Date.now() + 180 * DAY }; saveNow();
      setCookie(res, req, "sid", sid, 180 * 86400); return redirect(res, "/app/");
    }
    if (p === "/logout") { const c = parseCookies(req); if (c.sid) { delete db.sessions[c.sid]; save(); } setCookie(res, req, "sid", "", 0); return redirect(res, "/login"); }

    if (p === "/app" ) return redirect(res, "/app/");
    if (p.startsWith("/app/")) {
      if (!currentUser(req)) return redirect(res, "/login");
      return serveApp(req, res, p.slice(5));
    }

    // админ
    if (p === "/admin" && req.method === "GET") return send(res, 200, adminOk(req) ? adminPage() : adminLogin());
    if (p === "/admin/login" && req.method === "POST") {
      if (tooMany(req, "adm")) return send(res, 429, adminLogin("Аракет өтө көп. 15 мүнөттөн кийин."));
      const b = await readBody(req);
      if (!ADMIN_PASSWORD || !safeEq(String(b.password || ""), ADMIN_PASSWORD)) { fail(req, "adm"); return send(res, 401, adminLogin("Пароль туура эмес")); }
      const t = rand(32); db.admin.sessions = db.admin.sessions || {}; db.admin.sessions[t] = Date.now() + 30 * DAY; save();
      setCookie(res, req, "adm", t, 30 * 86400); return redirect(res, "/admin");
    }
    if (p === "/admin/logout") { const c = parseCookies(req); if (c.adm && db.admin.sessions) delete db.admin.sessions[c.adm]; save(); setCookie(res, req, "adm", "", 0); return redirect(res, "/admin"); }
    if (p.startsWith("/admin/") && req.method === "POST") {
      if (!adminOk(req)) return redirect(res, "/admin");
      const b = await readBody(req);
      if (p === "/admin/codes") {
        const n = Math.max(1, Math.min(50, parseInt(b.count) || 1)); const days = Math.max(0, parseInt(b.days) || 0); const out = [];
        for (let i = 0; i < n; i++) { let c; do { c = newCode(); } while (db.codes[c]); db.codes[c] = { code: c, days, note: String(b.note || "").slice(0, 120), created: Date.now() }; out.push(c); }
        saveNow(); return send(res, 200, adminPage(null, out));
      }
      if (p === "/admin/code-del") { const c = db.codes[b.c]; if (c && !c.usedBy) delete db.codes[b.c]; save(); return send(res, 200, adminPage("Код өчүрүлдү")); }
      if (p === "/admin/user") {
        const u = db.users[b.u]; if (!u) return send(res, 200, adminPage("Колдонуучу табылган жок"));
        let f = "";
        if (b.a === "reset") { u.device = null; Object.keys(db.sessions).forEach((k) => { if (db.sessions[k].u === u.login) delete db.sessions[k]; }); f = u.login + ": эми жаңы телефондон кире алат"; }
        if (b.a === "block") { u.blocked = true; f = u.login + " бөгөттөлдү"; }
        if (b.a === "unblock") { u.blocked = false; f = u.login + " ачылды"; }
        if (b.a === "extend") { const base = u.expires && u.expires > Date.now() ? u.expires : Date.now(); u.expires = base + 30 * DAY; f = u.login + ": мөөнөт " + fmtDate(u.expires) + " чейин"; }
        if (b.a === "delete") { delete db.users[u.login]; Object.keys(db.sessions).forEach((k) => { if (db.sessions[k].u === b.u) delete db.sessions[k]; }); f = b.u + " өчүрүлдү"; }
        saveNow(); return send(res, 200, adminPage(f));
      }
    }
    if (p === "/icon-192.png" || p === "/icon-512.png") return serveApp(req, res, p.slice(1));
    return send(res, 404, page("Табылган жок", "<h1>Табылган жок</h1><a href='/login'>Кирүү</a>"));
  } catch (e) {
    console.error(e); send(res, 500, page("Ката", "<h1>Ката кетти</h1><p>Кайра аракет кылыңыз.</p>"));
  }
});
server.listen(PORT, () => console.log(`${BRAND}: http://localhost:${PORT}  (маалымат: ${DB_FILE})`));
