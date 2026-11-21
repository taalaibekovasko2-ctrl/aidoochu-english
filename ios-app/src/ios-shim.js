/* Aidoochu English — iPhone app adjustments. Loaded BEFORE the app code, only inside the iPhone app (never on the website).
   1) iPhone-only look: no "install from Safari" hint, no admin button, no GoFundMe frame (fundraising is not allowed inside iOS apps).
   2) Voice: English is spoken by the iPhone's own voice engine (native plugin) when it is present, otherwise by the web voice.
   3) Moving from the website: a "transfer code" made on the website (phase 2) brings the device ID, the activation code,
      game progress and language into the app, so a code bought earlier keeps working and progress is not lost. */
(function () {
  "use strict";
  window.AIDOOCHU_IOS = true;

  // ---------- 1) iPhone-only look ----------
  var css = ".inst{display:none!important}.fadm{display:none!important}iframe.gfm{display:none!important}" +
    /* in the app the full version is bought through Apple; buying a code from a seller (WhatsApp / phone / "send ID to seller") is website-only */
    ".lock>p:not(.ae-keep),.lock>.did,.lock>.lrow,.lock>#acode,.lock>[data-lk=ok],.lock>a.wa{display:none!important}" +
    /* promo codes (free partner unlocks) are website-only: Apple 3.1.1 does not allow unlocking with own codes inside the app;
       promo users move with the transfer code, which carries their promo */
    ".lock>.promo{display:none!important}" +
    "#ae-iap{margin:12px 0;padding:14px;border-radius:14px;background:#fff1dc;text-align:left}#ae-iap b{font-size:16px}" +
    "#ae-iap button{display:block;width:100%;margin-top:8px;padding:12px;border-radius:12px;border:0;font-weight:800;font-size:15px}" +
    "#ae-buy{background:#111;color:#fff}#ae-buy:disabled{background:#999}#ae-restore{background:transparent;color:#111;border:1.5px solid #111!important}#ae-iap-msg{font-size:13px;margin-top:6px}";
  function addCss() { var s = document.createElement("style"); s.id = "ios-shim-css"; s.textContent = css; (document.head || document.documentElement).appendChild(s); }
  if (document.head) addCss(); else document.addEventListener("DOMContentLoaded", addCss);

  // ---------- 2) native voice ----------
  function tts() { var C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.TextToSpeech || null; }
  var syn = window.speechSynthesis;
  if (syn) {
    var webSpeak = syn.speak.bind(syn), webCancel = syn.cancel.bind(syn), busy = 0;
    syn.speak = function (u) {
      var T = tts();
      if (!T) return webSpeak(u);
      busy++;
      try { if (u.onstart) u.onstart({ utterance: u }); } catch (e) {}
      T.speak({ text: String(u.text || ""), lang: u.lang || "en-US", rate: u.rate || 1, pitch: u.pitch || 1, volume: u.volume == null ? 1 : u.volume, category: "playback" })
        .then(function () { busy = Math.max(0, busy - 1); try { if (u.onend) u.onend({ utterance: u }); } catch (e) {} },
              function (err) { busy = Math.max(0, busy - 1); try { if (u.onerror) u.onerror({ utterance: u, error: String(err) }); } catch (e) {} });
    };
    syn.cancel = function () { var T = tts(); busy = 0; if (T) { try { T.stop(); } catch (e) {} } try { webCancel(); } catch (e) {} };
    try { Object.defineProperty(syn, "speaking", { configurable: true, get: function () { return busy > 0; } }); } catch (e) {}
  }


  // ---------- 4) Apple In-App Purchase (test mode until the product exists in App Store Connect; no price is set in code) ----------
  var PRODUCT = "com.aidoochu.english.full";
  var IAP = {
    t: ["🍎 Толук версияны Apple аркылуу ачуу", "🍎 Толық нұсқаны Apple арқылы ашу", "🍎 Открыть полную версию через Apple", "🍎 Unlock the full version with Apple"],
    s: ["Бир жолу төлөйсүз, түбөлүк ачык. Төлөм Apple аркылуу өтөт.", "Бір рет төлейсіз, мәңгі ашық. Төлем Apple арқылы өтеді.", "Платите один раз, открыто навсегда. Оплата через Apple.", "Pay once, unlocked forever. Payment goes through Apple."],
    buy: ["Сатып алуу", "Сатып алу", "Купить", "Buy"],
    restore: ["Сатып алууларды калыбына келтирүү", "Сатып алуларды қалпына келтіру", "Восстановить покупки", "Restore Purchases"],
    na: ["Apple'да азырынча даяр эмес (сыноо версиясы).", "Apple-да әзірге дайын емес (сынақ нұсқасы).", "Пока не доступно в Apple (тестовая версия).", "Not available from Apple yet (test version)."],
    wait: ["⏳ Apple менен байланышууда…", "⏳ Apple-мен байланыс…", "⏳ Связь с Apple…", "⏳ Contacting Apple…"],
    none: ["Бул Apple ID менен сатып алуу табылган жок.", "Бұл Apple ID-мен сатып алу табылмады.", "Покупка для этого Apple ID не найдена.", "No purchase found for this Apple ID."],
    fail: ["Сатып алуу аяктаган жок. Кайра аракет кылыңыз.", "Сатып алу аяқталмады. Қайталап көріңіз.", "Покупка не завершена. Попробуйте ещё раз.", "Purchase not completed. Please try again."]
  };
  function iapP() { var C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.NativePurchases || null; }
  function unlockFull() {
    try { localStorage.setItem("iapOk", "1"); } catch (e) {}
    try { if (typeof __ok !== "undefined") { __ok = true; __lockOpen = false; var nav = document.getElementById("nav"); if (nav) nav.style.display = ""; render(); window.scrollTo(0, 0); } } catch (e) {}
  }
  function owned(list) { return (list || []).some(function (t) { return t && t.productIdentifier === PRODUCT && (t.isActive !== false) && !/refund|revok/i.test(String(t.purchaseState || "")); }); }
  function checkOwned(silent) {
    var P = iapP(); if (!P) return Promise.resolve(null);
    return P.getPurchases({ productType: "inapp", onlyCurrentEntitlements: true }).then(function (r) { var o = owned(r && r.purchases); if (o) unlockFull(); else if (!silent) {} return o; }, function () { return null; });
  }
  window.aidoochuIAP = { product: PRODUCT, checkOwned: checkOwned };
  function addIapBox() {
    var lock = document.querySelector(".lock"); if (!lock || document.getElementById("ae-iap")) return;
    var i = li(), box = document.createElement("div"); box.id = "ae-iap";
    box.innerHTML = '<b>' + IAP.t[i] + '</b><div style="font-size:13px;margin-top:4px">' + IAP.s[i] + '</div>' +
      '<button id="ae-buy" disabled>' + IAP.buy[i] + '</button><button id="ae-restore">' + IAP.restore[i] + '</button><div id="ae-iap-msg"></div>';
    var h = lock.querySelector("h3"); lock.insertBefore(box, h ? h.nextSibling : lock.firstChild);
    var msg = function (t) { var m = document.getElementById("ae-iap-msg"); if (m) m.textContent = t; }, P = iapP(), buy = document.getElementById("ae-buy");
    if (!P) { msg(IAP.na[i]); } else {
      P.getProducts({ productIdentifiers: [PRODUCT], productType: "inapp" }).then(function (r) {
        var pr = r && r.products && r.products[0];
        if (pr) { buy.disabled = false; buy.textContent = IAP.buy[i] + (pr.priceString ? " · " + pr.priceString : ""); } else msg(IAP.na[i]);
      }, function () { msg(IAP.na[i]); });
    }
    buy.onclick = function () { var P2 = iapP(); if (!P2) return; buy.disabled = true; msg(IAP.wait[i]);
      P2.purchaseProduct({ productIdentifier: PRODUCT, productType: "inapp", quantity: 1 }).then(function () { msg(""); unlockFull(); }, function () { buy.disabled = false; msg(IAP.fail[i]); }); };
    document.getElementById("ae-restore").onclick = function () { var P3 = iapP(); if (!P3) { msg(IAP.na[i]); return; } msg(IAP.wait[i]);
      P3.restorePurchases().then(function () { return checkOwned(false); }, function () { return checkOwned(false); }).then(function (o) { if (!o) msg(IAP.none[i]); }); };
  }
  // at start: a purchase made earlier opens the app offline at once, then Apple confirms it in the background
  window.addEventListener("load", function () {
    var had = false; try { had = localStorage.getItem("iapOk") === "1"; } catch (e) {}
    if (had) setTimeout(unlockFull, 0);
    setTimeout(function () { checkOwned(true).then(function (o) { if (o === false && had) { try { localStorage.removeItem("iapOk"); } catch (e) {} } }); }, 1500);
  });

  // ---------- 3) moving from the website (code + progress) ----------
  var TX = {
    t: ["Сайтта сатып алгансызбы?", "Сайтта сатып алдыңыз ба?", "Покупали на сайте?", "Bought on the website?"],
    s: ["Сайттан алган көчүрүү кодун ушул жерге коюңуз. Кодуңуз жана прогрессиңиз ушул колдонмого өтөт.",
        "Сайттан алған көшіру кодын осында қойыңыз. Кодыңыз бен прогресіңіз осы қосымшаға өтеді.",
        "Вставьте код переноса с сайта. Ваш код и прогресс перейдут в это приложение.",
        "Paste the transfer code from the website. Your code and progress move into this app."],
    b: ["Көчүрүү", "Көшіру", "Перенести", "Transfer"],
    bad: ["Көчүрүү коду туура эмес.", "Көшіру коды қате.", "Неверный код переноса.", "Wrong transfer code."],
    limit: ["Бул сатып алуу 3 iPhone'го көчүрүлүп бүткөн. Жардам: taalaibekovasko2@gmail.com", "Бұл сатып алу 3 iPhone-ға көшірілген. Көмек: taalaibekovasko2@gmail.com", "Эта покупка уже перенесена на 3 iPhone. Помощь: taalaibekovasko2@gmail.com", "This purchase has already moved to 3 iPhones. Help: taalaibekovasko2@gmail.com"]
  };
  function li() { var v = null; try { v = localStorage.getItem("lang"); } catch (e) {} var n = ["KG", "KZ", "RU", "US"].indexOf(v); return n < 0 ? 0 : n; }
  function b64uDec(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }
  // format: "AEX1." + base64url(JSON {v, did, act?, game?, lang?, promoOk?, t})  — made by the website ("Move to the iPhone app")
  // Security: size limit; every field checked by type and shape; only known progress fields kept (no __proto__ / unknown objects);
  // the activation code still has to pass the seller's signature check for this device ID (checkCode), so a made-up code unlocks nothing;
  // optional server limit: one purchase moves to at most 3 iPhone apps (supabase/transfer-claim.sql).
  var KEEP_NUM = { xp: 1, streak: 1, pend: 1, mtry: 1 };
  function cleanGame(g) {
    if (!g || typeof g !== "object" || Array.isArray(g)) return null;
    var o = { done: {}, xp: 0, streak: 0, day: "" };
    if (g.done && typeof g.done === "object") Object.keys(g.done).forEach(function (k) { var v = g.done[k]; if (/^\d{1,3}$/.test(k) && +k < 1000 && typeof v === "number" && v >= 0 && v <= 3) o.done[k] = v; });
    Object.keys(KEEP_NUM).forEach(function (k) { var v = g[k]; if (typeof v === "number" && isFinite(v) && v >= 0 && v <= 1e7) o[k] = Math.floor(v); });
    if (typeof g.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(g.day)) o.day = g.day;
    if (typeof g.pid === "string" && /^[A-Za-z0-9_-]{4,40}$/.test(g.pid)) o.pid = g.pid;
    if (typeof g.nm === "string" && g.nm.length <= 20 && !/[<>]/.test(g.nm) && (typeof nameOk !== "function" || nameOk(g.nm))) o.nm = g.nm;
    ["bg", "st"].forEach(function (k) { var v = g[k]; if (v && typeof v === "object" && !Array.isArray(v)) { var c = {}; Object.keys(v).slice(0, 200).forEach(function (kk) { var x = v[kk]; if (/^[A-Za-z0-9_]{1,30}$/.test(kk) && (typeof x === "number" || typeof x === "boolean" || (typeof x === "string" && x.length <= 40))) c[kk] = x; }); o[k] = c; } });
    return o;
  }
  function parseCode(raw) {
    var s = String(raw || "").trim().replace(/\s+/g, ""); if (s.length > 20000) return null;
    var m = s.match(/^AEX1\.([A-Za-z0-9_-]+)$/); if (!m) return null;
    var o; try { o = JSON.parse(b64uDec(m[1])); } catch (e) { return null; }
    if (!o || typeof o !== "object" || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(o.did || "")) return null;
    if (o.act != null && !(typeof o.act === "string" && /^[A-Za-z0-9_-]{20,200}$/.test(o.act))) return null;
    return o;
  }
  function installId() { var v = null; try { v = localStorage.getItem("aeInst"); } catch (e) {} if (!v) { var r = crypto.getRandomValues(new Uint8Array(12)); v = Array.prototype.map.call(r, function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); try { localStorage.setItem("aeInst", v); } catch (e) {} } return v; }
  // server limit → "ok" | "limit"; when the function is not installed yet or there is no internet → "ok" (the transfer is never blocked by our server being absent)
  function claim(did) {
    try { if (typeof SB_URL === "undefined" || typeof SB_KEY === "undefined") return Promise.resolve("ok"); } catch (e) { return Promise.resolve("ok"); }
    var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    return fetch(SB_URL + "/rest/v1/rpc/transfer_claim", { method: "POST", headers: { apikey: SB_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ p_did: did, p_install: installId() }), signal: ctl && ctl.signal })
      .then(function (r) { clearTimeout(tm); if (!r.ok) return "ok"; return r.json().then(function (v) { return v === false ? "limit" : "ok"; }, function () { return "ok"; }); }, function () { clearTimeout(tm); return "ok"; });
  }
  function save(o) {
    var g = cleanGame(o.game), cur = null; try { cur = JSON.parse(localStorage.getItem("game") || "null"); } catch (e) {}
    localStorage.setItem("did", o.did);
    if (o.act) localStorage.setItem("act", o.act);
    if (g && !(cur && (cur.xp || 0) > (g.xp || 0))) localStorage.setItem("game", JSON.stringify(g));   // never replace more progress with less
    if (/^(KG|KZ|RU|US)$/.test(o.lang || "")) localStorage.setItem("lang", o.lang);
    if (typeof o.promoOk === "string" && /^[A-Z]{2,20}$/.test(o.promoOk)) { localStorage.setItem("promo", o.promoOk); localStorage.setItem("promoOk", o.promoOk); }
  }
  // returns Promise<"ok" | "bad" | "limit">
  window.aidoochuImport = function (raw) {
    var o = parseCode(raw); if (!o) return Promise.resolve("bad");
    return claim(o.did).then(function (c) { if (c !== "ok") return c; try { save(o); return "ok"; } catch (e) { return "bad"; } });
  };
  function addTransferBox() {
    var pc = document.getElementById("pcode");
    if (!pc || document.getElementById("ae-xfer")) return;
    var i = li(), box = document.createElement("div");
    box.id = "ae-xfer";
    box.style.cssText = "margin:14px 0;padding:12px;border:1px dashed #bbb;border-radius:12px;text-align:left";
    box.innerHTML = '<b>🔁 ' + TX.t[i] + '</b><div style="font-size:13px;margin:6px 0">' + TX.s[i] + '</div>' +
      '<textarea id="ae-xfer-in" rows="3" style="width:100%;box-sizing:border-box;font:13px monospace" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>' +
      '<button id="ae-xfer-go" style="margin-top:6px;padding:10px 16px;border-radius:10px;border:0;background:#ff9000;color:#fff;font-weight:700">' + TX.b[i] + '</button>' +
      '<div id="ae-xfer-err" style="color:#d63a2b;font-size:13px;margin-top:4px"></div>';
    var host = pc.closest(".promo") || pc.closest("div") || pc.parentNode;   // after the (hidden in app) promo box, not inside it
    host.parentNode.insertBefore(box, host.nextSibling);
    document.getElementById("ae-xfer-go").onclick = function () {
      var btn = this, err = document.getElementById("ae-xfer-err"); btn.disabled = true; err.textContent = "⏳";
      window.aidoochuImport(document.getElementById("ae-xfer-in").value).then(function (r) {
        if (r === "ok") { location.reload(); return; }
        btn.disabled = false; err.textContent = (r === "limit" ? TX.limit : TX.bad)[li()];
      });
    };
  }
  function onDom() { addIapBox(); addTransferBox(); }
  function watch() { new MutationObserver(onDom).observe(document.body, { childList: true, subtree: true }); onDom(); }
  if (document.body) watch(); else document.addEventListener("DOMContentLoaded", watch);
})();
