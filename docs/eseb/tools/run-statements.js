// Dev tool: serve docs/ on :8765 (python3 -m http.server 8765), then: node gen-statements.js OUT 100 7 && node run-statements.js OUT
// Render generated statements to PDF and read each one with the real app (PDF.js + reader), compare with truth.
// usage: node run.js DIR [only-name]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const DIR = process.argv[2], only = process.argv[3];
  const truth = JSON.parse(fs.readFileSync(path.join(DIR, 'truth.json'), 'utf8')).filter(t => !only || t.n === only);
  const b = await chromium.launch();
  const mk = await b.newPage();
  for (const t of truth) { const pdf = path.join(DIR, t.n + '.pdf'); if (!fs.existsSync(pdf)) { await mk.goto('file://' + path.join(DIR, t.n + '.html')); await mk.pdf({ path: pdf, format: 'Letter' }); } }
  const ctx = await b.newContext({ serviceWorkers: 'block' });
  // test hook: expose the app's reader (inside its closure) without changing the shipped file
  await ctx.route(/\/eseb\/app\.js/, async route => { const r = await route.fetch(); let s = await r.text();
    s = s.replace('function onStatements(', 'window.__onSt=onStatements;window.__pdfi=function(){return PDFI};function onStatements(');
    route.fulfill({ response: r, body: s }); });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8765/eseb/', { waitUntil: 'networkidle' });
  const res = [];
  for (const t of truth) {
    const b64 = fs.readFileSync(path.join(DIR, t.n + '.pdf')).toString('base64');
    const r = await p.evaluate(b64 => new Promise(ok => {
      const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      const f = new File([u], 'st.pdf', { type: 'application/pdf' });
      const C = window.JE; __onSt([f], r => { const k = C.stmtCalc(r), d = C.decide(r);
        ok({ gross: r.gross, earn: k.earn, net: k.net, ded: C.sum(r.ded, 'a'), nLoads: r.loads.length, act: d.act, status: d.v && d.v.status, why: d.v && d.v.why, items: __pdfi().slice(), chk: k.rec.chk, rstatus: k.rec.status, unk: (r.unknown||[]).map(u=>u.v+" "+u.a), dedTotal: r.dedTotal, rate: r.rate }); });
    }), b64);
    const bad = [];
    if (r.net !== t.net) bad.push(`net ${r.net}≠${t.net}`);
    if (r.ded !== t.dedTotal) bad.push(`ded ${r.ded}≠${t.dedTotal}`);
    if (r.gross !== t.gross) bad.push(`gross ${r.gross}≠${t.gross}`);
    if (r.nLoads !== t.nLoads) bad.push(`loads ${r.nLoads}≠${t.nLoads}`);
    const auto = r.act === 'save';
    const wrongSaved = auto && bad.some(x => /^(net|ded|gross)/.test(x));
    res.push({ n: t.n, fam: t.family, auto, ok: !bad.length, wrongSaved, bad, act: r.act, why: r.why, chk: r.chk, rstatus: r.rstatus, unk: r.unk, dedTotal: r.dedTotal, rate: r.rate });
    if (bad.length || !auto) fs.writeFileSync(path.join(DIR, t.n + '.items.json'), JSON.stringify(r.items));
  }
  await b.close();
  fs.writeFileSync(path.join(DIR, 'result.json'), JSON.stringify(res, null, 1));
  const fams = {}; res.forEach(r => { const f = fams[r.fam] = fams[r.fam] || { n: 0, auto: 0, ok: 0, wrong: 0 }; f.n++; if (r.auto && r.ok) f.auto++; if (r.ok) f.ok++; if (r.wrongSaved) f.wrong++; });
  console.log('family  total  auto-saved-correct  read-correct  WRONG-auto-saved');
  Object.keys(fams).forEach(k => console.log(`  ${k}      ${fams[k].n}      ${fams[k].auto}                 ${fams[k].ok}            ${fams[k].wrong}`));
  const tot = res.length, a = res.filter(r => r.auto && r.ok).length;
  console.log(`TOTAL ${a}/${tot} read fully automatically; wrong auto-saves: ${res.filter(r => r.wrongSaved).length}`);
  res.filter(r => !(r.auto && r.ok)).slice(0, 40).forEach(r => console.log(r.n, 'fam' + r.fam, r.act, r.bad.join('; '), (r.why || []).join(',')));
})();
