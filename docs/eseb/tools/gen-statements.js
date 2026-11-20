// Synthetic driver settlement statements in many layouts (fictional companies), with ground truth.
// usage: node gen.js OUTDIR COUNT SEED
const fs = require('fs'), path = require('path');
const OUT = process.argv[2], N = +process.argv[3] || 100;
let seed = +process.argv[4] || 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = a => a[Math.floor(rnd() * a.length)];
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const money = (c, o = {}) => { const neg = c < 0; c = Math.abs(c); let s = (Math.floor(c / 100)).toLocaleString('en-US') + '.' + String(c % 100).padStart(2, '0');
  if (o.nocomma) s = s.replace(/,/g, ''); if (o.dollar) s = '$' + s; if (neg) s = o.paren ? '(' + s + ')' : '-' + s; return s; };
const CITIES = ['Chicago, IL','Dallas, TX','Atlanta, GA','Columbus, OH','Denver, CO','Phoenix, AZ','Memphis, TN','Laredo, TX','Fontana, CA','Joliet, IL','Indianapolis, IN','Kansas City, MO','Salt Lake City, UT','Reno, NV','Harrisburg, PA','Charlotte, NC','Jacksonville, FL','Nashville, TN','Omaha, NE','Louisville, KY'];
const CO1 = ['NORTHWIND','BLUE RIDGE','IRON EAGLE','SILK ROAD','STEPPE','TIAN SHAN','GOLDEN MILE','PRAIRIE','RED ROCK','SUMMIT','ALTAI','ATLAS','VOLGA','GRANITE','LONE PINE','EVEREST','KOK-BORU','ISSYK','POLAR STAR','MIDWAY'];
const CO2 = ['TRANSPORT INC','LOGISTICS LLC','FREIGHT LLC','CARRIERS INC','EXPRESS CORP','TRUCKING LLC','LINES INC','HAULING LLC'];
const DNAMES = ['Azamat K.','Nurlan B.','Ruslan T.','Bakyt S.','Dmitri V.','Oleksandr P.','Timur A.','Erlan M.','Sergei N.','Daniyar O.'];
const DEDS = [['Fuel',null],['Insurance',[25000,45000]],['Occupational Accident',[3500,6000]],['Physical Damage',[8000,15000]],['ELD / Logbook',[2500,4500]],['IFTA',[1500,3500]],['Trailer Rent',[15000,30000]],['PrePass',[1000,2500]],['Toll',[1500,9000]],['Parking',[2000,6000]],['Escrow',[5000,15000]],['Cash Advance',[10000,50000]],['Truck Payment',[45000,80000]],['Admin Fee',[2000,5000]],['Cargo Insurance',[3000,6000]],['Repair',[5000,40000]]];
const SYN = {
  gross: ['Total Gross','Gross Revenue','Total Revenue','Gross','Linehaul Total','Total Freight','Gross Amount'],
  earn: ['Driver Earnings','Driver Pay','Total Earnings','Your Share','Driver Revenue','Net Revenue'],
  ded: ['Total Deductions','Deductions Total','Total Charges','Total Withholdings','Less Deductions'],
  net: ['Net Pay','Net Settlement','Check Amount','Amount Paid','Settlement Amount','Payout','Net Amount Due'],
  title: ['SETTLEMENT STATEMENT','DRIVER SETTLEMENT','DRIVER PAY STATEMENT','OWNER OPERATOR SETTLEMENT','WEEKLY SETTLEMENT','PAY STATEMENT'],
  deadline: ['DEDUCTIONS','CHARGES','LESS:','EXPENSES','WITHHOLDINGS'],
};
const date = (d, f) => { const m = d.getUTCMonth() + 1, dd = d.getUTCDate(), y = d.getUTCFullYear(), MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return f === 0 ? `${String(m).padStart(2,'0')}/${String(dd).padStart(2,'0')}/${y}` : f === 1 ? `${y}-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}` : f === 2 ? `${MN[m-1]} ${dd}, ${y}` : `${m}/${dd}/${String(y).slice(2)}`; };
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

function make(i) {
  const fam = i % 10, mo = { dollar: rnd() < 0.6, paren: rnd() < 0.3, nocomma: rnd() < 0.2 }, df = ri(0, 3);
  const company = pick(CO1) + ' ' + pick(CO2), driver = pick(DNAMES), unit = ri(100, 9999), num = 'ST-' + ri(10000, 99999);
  const start = new Date(Date.UTC(2026, ri(0, 10), ri(1, 21))), end = new Date(start.getTime() + 6 * 864e5);
  const nl = ri(1, 6), loads = [];
  for (let k = 0; k < nl; k++) { const mi = ri(150, 1400), rpm = ri(180, 380); loads.push({ id: String(ri(100000, 99999999)), d: new Date(start.getTime() + k * 864e5), f: pick(CITIES), t: pick(CITIES), mi, g: Math.round(mi * rpm / 100) * 100 + pick([0, 0, 50, 25]) }); }
  const gross = loads.reduce((a, l) => a + l.g, 0);
  const pct = fam === 3 ? null : pick([75, 80, 85, 88, 90]);
  const earn = pct ? Math.round(gross * pct / 100) : gross;
  const fee = gross - earn;
  const dl = []; const pool = DEDS.slice(); const nd = ri(2, 8);
  for (let k = 0; k < nd && pool.length; k++) { const [n, r] = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; dl.push({ n, a: r ? ri(r[0], r[1]) : ri(80000, 450000) }); }
  const dedTotal = dl.reduce((a, d) => a + d.a, 0), net = earn - dedTotal;
  const L = k => pick(SYN[k]), M = c => money(c, mo);
  const truth = { family: fam, gross: pct ? gross : (fam === 3 ? gross : gross), earn, net, dedTotal, nLoads: nl, pct };
  const head = `<div class=h><b>${company}</b><br>${pick(['1200 Industrial Pkwy, Joliet, IL 60431','55 Commerce Dr, Dallas, TX 75201','800 Freight Way, Fontana, CA 92335'])}</div>
   <h2>${L('title')}</h2><div>Driver: ${driver} &nbsp;&nbsp; Truck #${unit} &nbsp;&nbsp; Settlement #: ${num}</div>
   <div>Period: ${date(start, df)} - ${date(end, df)} &nbsp;&nbsp; Pay Date: ${date(new Date(end.getTime() + 4 * 864e5), df)}</div>`;
  const loadTable = (cols) => `<table><tr>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr>${loads.map(l => `<tr>${cols.map(c => `<td>${esc(c[1](l))}</td>`).join('')}</tr>`).join('')}</table>`;
  const C1 = [['Load #', l => l.id], ['Date', l => date(l.d, df)], ['Origin', l => l.f], ['Destination', l => l.t], ['Miles', l => l.mi], ['Rate', l => M(l.g)]];
  const C2 = [['Pro #', l => l.id], ['Pickup', l => l.f], ['Delivery', l => l.t], ['Del Date', l => date(l.d, df)], ['Loaded Mi', l => l.mi], ['Linehaul', l => M(l.g)], ['Driver ' + (pct || 100) + '%', l => M(Math.round(l.g * (pct || 100) / 100))]];
  const dedTable = () => `<table><tr><th>Description</th><th>Amount</th></tr>${dl.map(d => `<tr><td>${d.n}</td><td>${M(d.a)}</td></tr>`).join('')}</table>`;
  const summ = (rows) => `<table class=s>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`;
  let body;
  switch (fam) {
    case 0: body = head + '<h3>LOADS</h3>' + loadTable(C1) + summ([[L('gross'), M(gross)], ['Driver Rate', pct + '%'], [L('earn'), M(earn)]]) + `<h3>${L('deadline')}</h3>` + dedTable() + summ([[L('ded'), M(dedTotal)], [L('net'), M(net)]]); break;
    case 1: body = head + summ([[L('gross'), M(gross)], ['Company Fee (' + (100 - pct) + '%)', M(-fee)], [L('earn'), M(earn)], [L('ded'), M(-dedTotal)], [L('net'), M(net)]]) + '<h3>TRIPS</h3>' + loadTable(C2) + `<h3>${L('deadline')}</h3>` + dedTable(); break;
    case 2: body = head + loadTable(C2) + `<div>${L('gross')}: ${M(gross)}</div><div>${L('earn')}: ${M(earn)}</div><h3>${L('deadline')}</h3>` + dl.map(d => `<div>${d.n} ${M(d.a)}</div>`).join('') + `<div>${L('ded')}: ${M(dedTotal)}</div><div><b>${L('net')}: ${M(net)}</b></div>`; break;
    case 3: body = head + loadTable(C1) + summ([[L('gross'), M(gross)]]) + `<h3>${L('deadline')}</h3>` + dedTable() + summ([[L('ded'), M(dedTotal)], [L('net'), M(net)]]); break; // 100% (no company cut)
    case 4: { // ledger: description | earnings | deductions
      body = head + `<table><tr><th>Date</th><th>Description</th><th>Earnings</th><th>Deductions</th></tr>${loads.map(l => `<tr><td>${date(l.d, df)}</td><td>Load ${l.id} ${l.f} - ${l.t}</td><td>${M(Math.round(l.g * pct / 100))}</td><td></td></tr>`).join('')}${dl.map(d => `<tr><td>${date(end, df)}</td><td>${d.n}</td><td></td><td>${M(d.a)}</td></tr>`).join('')}<tr><td></td><td><b>Totals</b></td><td>${M(earn)}</td><td>${M(dedTotal)}</td></tr></table>` + summ([[L('gross'), M(gross)], ['Driver %', pct + '%'], [L('net'), M(net)]]);
      const sumEarn = loads.reduce((a, l) => a + Math.round(l.g * pct / 100), 0); truth.earn = sumEarn; truth.net = sumEarn - dedTotal; body = body.replace(M(earn), M(sumEarn)).replace(M(net), M(sumEarn - dedTotal)); break; }
    case 5: body = head + summ([[L('gross'), M(gross)], [L('earn') + ` (${pct}%)`, M(earn)], [L('ded'), M(dedTotal)], [L('net'), M(net)]]) + `<h3>${L('deadline')}</h3>` + dedTable() + '<div style="page-break-before:always"></div><h3>LOAD DETAIL</h3>' + loadTable(C1); break; // 2 pages
    case 6: body = head + loadTable(C1) + `<table class=s><tr><th></th><th>Current</th><th>YTD</th></tr><tr><td>${L('gross')}</td><td>${M(gross)}</td><td>${M(gross * 23)}</td></tr><tr><td>${L('earn')}</td><td>${M(earn)}</td><td>${M(earn * 23)}</td></tr><tr><td>${L('ded')}</td><td>${M(dedTotal)}</td><td>${M(dedTotal * 23)}</td></tr><tr><td>${L('net')}</td><td>${M(net)}</td><td>${M(net * 23)}</td></tr></table>` + `<h3>${L('deadline')}</h3>` + dedTable(); break;
    case 7: body = head + `<table><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>${loads.map(l => `<tr><td>Linehaul ${l.id} ${l.f} to ${l.t}</td><td>${l.mi}</td><td>${(l.g / l.mi / 100).toFixed(4)}</td><td>${M(l.g)}</td></tr>`).join('')}</table>` + summ([[L('gross'), M(gross)], ['Carrier Fee ' + (100 - pct) + '%', M(-fee)]]) + `<h3>${L('deadline')}</h3><table><tr><th>Code</th><th>Description</th><th>Amount</th></tr>${dl.map((d, k) => `<tr><td>D${100 + k}</td><td>${d.n}</td><td>${M(-d.a)}</td></tr>`).join('')}</table>` + summ([[L('ded'), M(-dedTotal)], [L('net'), M(net)]]); break;
    case 8: body = head + `<pre>${loads.map(l => `${l.id}  ${date(l.d, df)}  ${l.f} -> ${l.t}  ${l.mi} mi  ${M(l.g)}`).join('\n')}\n\n${L('gross')} ${M(gross)}\nPercentage ${pct}%\n${L('earn')} ${M(earn)}\n\n${dl.map(d => d.n.padEnd(24) + M(d.a)).join('\n')}\n${L('ded')} ${M(dedTotal)}\n\n${L('net')} ${M(net)}</pre>`; break;
    case 9: body = head + `<div style="display:flex;gap:40px"><div style="flex:3"><h3>REVENUE</h3>${loadTable([['Load', l => l.id], ['Route', l => l.f.split(',')[0] + '-' + l.t.split(',')[0]], ['Amount', l => M(l.g)]])}<table class=w>${[[L('gross'), M(gross)], [L('earn') + ' ' + pct + '%', M(earn)]].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table></div><div style="flex:2"><h3>${L('deadline')}</h3>${dedTable()}<table class=w><tr><td>${L('ded')}</td><td>${M(dedTotal)}</td></tr></table></div></div><h2>${L('net')}: ${M(net)}</h2>`; break;
  }
  const font = pick(['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana']), fs_ = pick([9, 10, 11, 12]);
  const html = `<html><head><style>body{font-family:'${font}';font-size:${fs_}px;margin:30px}table{border-collapse:collapse;margin:6px 0;width:100%}th,td{border:${pick(['1px solid #999','0','1px solid #ccc'])};padding:2px 6px;text-align:left}td:last-child{text-align:right}table.s{width:45%;margin-left:auto}td{white-space:nowrap}h2{font-size:1.4em}h3{font-size:1.1em;margin:10px 0 2px}pre{font-family:'Courier New';font-size:${fs_}px}</style></head><body>${body}</body></html>`;
  return { html, truth };
}
fs.mkdirSync(OUT, { recursive: true });
const all = [];
for (let i = 0; i < N; i++) { const { html, truth } = make(i); const n = `s${String(i).padStart(3, '0')}`; fs.writeFileSync(path.join(OUT, n + '.html'), html); all.push({ n, ...truth }); }
fs.writeFileSync(path.join(OUT, 'truth.json'), JSON.stringify(all, null, 1));
console.log('generated', N);
