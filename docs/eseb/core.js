/* Жол Эсеп — accounting core. ES5. All money is integer cents. Rates are integer basis points (88% = 8800). */
(function(G){
"use strict";
var C={};

/* ---------- money ---------- */
C.cents=function(v){ /* "1,234.56", "$12", "(45.10)", "-3.5", 12.3 -> integer cents; null if not a number */
 if(v==null||v==="")return null;if(typeof v==="number"){if(!isFinite(v))return null;v=String(v)}
 var s=String(v).trim(),neg=/^\(.*\)$/.test(s)||/^-|^−|-\s*\$/.test(s);s=s.replace(/[^\d.,]/g,"");
 if(!s)return null;
 /* decimal comma "12,50" vs thousands "1,250" */
 if(/,\d{2}$/.test(s)&&s.indexOf(".")<0)s=s.replace(/,(\d{2})$/,".$1");
 s=s.replace(/,/g,"");var p=s.split(".");if(p.length>2)return null;
 var w=p[0]||"0",f=(p[1]||"")+"00";if(!/^\d+$/.test(w)||!/^\d*$/.test(f))return null;
 var c=parseInt(w,10)*100+parseInt(f.slice(0,2),10);
 if(f.length>2&&+f.charAt(2)>=5)c+=1;
 return neg?-c:c};
C.fmt=function(c,noCents){c=c||0;var neg=c<0;c=Math.abs(c);var d=Math.floor(c/100),r=c%100;
 var s=String(d).replace(/\B(?=(\d{3})+(?!\d))/g,",");return (neg?"−":"")+"$"+s+(noCents?"":"."+(r<10?"0":"")+r)};
C.bp=function(v){ /* "88" / "88.5%" / 0.88 -> basis points */
 if(v==null||v==="")return null;var s=String(v).replace(/[^\d.]/g,"");if(!s)return null;var n=parseFloat(s);if(isNaN(n))return null;if(n<=1&&String(v).indexOf("%")<0&&s.indexOf(".")>=0)n=n*100;return Math.round(n*100)};
C.pct=function(c,bp){ /* round half up, sign-safe, integer only */
 var sg=c<0?-1:1,a=Math.abs(c)*bp;return sg*Math.floor((a+5000)/10000)};
C.sum=function(a,k){var t=0;for(var i=0;i<a.length;i++)t+=(k?a[i][k]:a[i])||0;return t};

/* ---------- categories: 22 + combined IFTA&Logbook, 6 groups ---------- */
C.GROUPS=[["fuel","⛽","Күйүүчү май","Топливо"],["ins","🛡","Страховка","Страховка"],["road","🛣","Жол чыгымдары","Дорожные расходы"],["equip","🚛","Жабдуу (трак, трейлер)","Оборудование (трак, трейлер)"],["admin","📋","Административдик","Административные"],["maint","🔧","Ремонт жана тейлөө","Ремонт и обслуживание"],["fees","💼","Диспетчер / факторинг","Диспетчер / факторинг"],["debt","🏢","Карыз төлөмү (чыгаша эмес)","Погашение долга (не расход)"],["other","🧾","Башка","Другое"]];
C.CATS=[
 ["diesel","fuel","Fuel — Diesel","Fuel (солярка)","Fuel (солярка)"],["def","fuel","DEF","DEF","DEF"],
 ["toll","road","Toll","Toll","Toll"],["scale","road","Scale / CAT Scale","Тараза / CAT Scale","Весы / CAT Scale"],["prepass","road","PrePass","PrePass","PrePass"],["parking","road","Parking","Парковка","Парковка"],
 ["truck_ins","ins","Truck Insurance","Страховка","Страховка"],["bobtail","ins","Bobtail Insurance","Bobtail","Bobtail"],["cargo_ins","ins","Cargo Insurance","Жүк страховкасы","Страховка груза"],
 ["trailer","equip","Trailer Rental / Trailer Van","Трейлер","Трейлер"],["truck_pay","equip","Truck Payment / Leasing","Трак төлөмү / лизинг","Платёж за трак / лизинг"],
 ["ifta","admin","IFTA","IFTA","IFTA"],["eld","admin","ELD / Logbook","ELD / Logbook","ELD / Logbook"],["ifta_eld","admin","IFTA & Logbook — Combined","IFTA & Logbook","IFTA & Logbook"],["phone","admin","Phone / Internet","Телефон / интернет","Телефон / интернет"],["permits","admin","Permits / Registration","Пермит / каттоо","Пермиты / регистрация"],
 ["truck_repair","maint","Truck Repair","Ремонт","Ремонт"],["trailer_repair","maint","Trailer Repair","Трейлер ремонту","Ремонт трейлера"],["pm","maint","Maintenance / PM Service","Тейлөө / PM","ТО / PM сервис"],["parts","maint","Parts","Тетиктер","Запчасти"],["tires","maint","Tires","Дөңгөлөк","Шины"],["wash","maint","Truck Wash","Трак жуу","Мойка трака"],
 ["dispatch","fees","Dispatch Fee","Диспетчер акысы","Оплата диспетчеру"],["factoring","fees","Factoring Fee","Факторинг акысы","Факторинг"],["co_fee","fees","Company Fees","Компаниянын акысы","Сборы компании"],
 ["co_debt","debt","Company Debt Repayment","Компанияга карыз төлөмү","Погашение долга компании"],["escrow","debt","Escrow","Escrow","Escrow"],["reserve","debt","Reserve","Резерв","Резерв"],["shop_debt","debt","Shop Debt Payment","Шопко карыз төлөмү","Оплата долга шопу"],
 ["other","other","Other Expenses","Башка","Прочее"],["pers","other","Personal (not business)","Жеке (бизнеске кирбейт)","Личное (не бизнес)"]];
C.MAIN=["diesel","def","truck_ins","bobtail","trailer","parking","toll","ifta","eld","ifta_eld","prepass","pm","wash","tires","truck_repair","permits","escrow","reserve","co_fee","other"];
C.CAT={};C.CATS.forEach(function(c){C.CAT[c[0]]={id:c[0],g:c[1],en:c[2],kg:c[3],ru:c[4]}});
C.catGroup=function(c){return (C.CAT[c]||C.CAT.other).g};
/* every deduction has a KIND: expense | debt | advance | deposit | holdback | adjust | loan (truck loan payment = interest + principal) */
C.KINDS=["expense","debt","advance","deposit","holdback","adjust"];
C.KIND_DEF={co_debt:"debt",shop_debt:"debt",escrow:"deposit",reserve:"holdback",pers:"personal"};
C.isLoanTruck=function(S){var t=(S&&S.truck||{}).type;return t==="financed"||t==="lto"};
C.custom=function(S,c){var r=null;((S&&S.cats)||[]).forEach(function(x){if(x.id===c)r=x});return r};
C.kindOf=function(c,S,x){if(x&&x.dk)return x.dk;var u=C.custom(S,c);if(u)return u.kind||"expense";if(c==="truck_pay"&&C.isLoanTruck(S))return "loan";return C.KIND_DEF[c]||"expense"};
C.isTaxable=function(c,S,x){if(x&&x.tax!=null)return !!x.tax;var u=C.custom(S,c);if(u&&u.tax!=null)return !!u.tax;var k=C.kindOf(c,S,x);return k==="expense"||k==="loan"};

/* keyword → category for statement / receipt lines (order matters: specific first) */
C.KW=[["escrow",/ESCROW/],["reserve",/RESERVE|MAINT(ENANCE)? (FUND|RESERVE)/],["wash",/TRUCK ?WASH|BLUE ?BEACON|\bWASH\b/],["co_fee",/ADMIN FEE|SERVICE FEE|COMPANY FEE|PROCESSING FEE|PLATFORM FEE/],["tires",/TIRE/],["co_debt",/LOAN REPAY|ADVANCE REPAY|CHARGE ?BACK|COMPANY LOAN|DAMAGE|NEG(ATIVE)? BAL|CARRY ?OVER|PREVIOUS BAL/],["shop_debt",/SHOP (DEBT|LOAN|PAYMENT|INSTALL)|REPAIR (LOAN|INSTALL|ADVANCE)/],["ifta_eld",/\bIF?TA\s*(&|AND|\/|\+)?\s*(LOG|ELD)|(LOG ?BOOK|ELD)\s*(&|AND|\/|\+)\s*IF?TA\b/],["prepass",/PRE ?PASS|BESTPASS|DRIVEWYZE/],["def",/\bDEF\b|DIESEL EXHAUST/],
 ["bobtail",/BOBTAIL/],["cargo_ins",/CARGO/],["truck_ins",/INSUR|OCC(UPATIONAL)? ?ACC|PHYSICAL DAMAGE|\bPD\b|LIABILITY|\bNTL\b|\bINS\b/],
 ["trailer_repair",/TRAILER (REPAIR|MAINT)|REEFER REPAIR/],["trailer",/TRAILER|\bVAN RENT|REEFER RENT/],["truck_pay",/TRUCK PAY|LEASE|TRACTOR|TRUCK LOAN|TRUCK NOTE|FINANC/],
 ["ifta",/\bIFTA\b|FUEL TAX/],["eld",/\bELD\b|LOG ?BOOK|SAMSARA|MOTIVE|KEEP ?TRUCKIN|OMNITRACS/],["phone",/PHONE|INTERNET|VERIZON|T-?MOBILE|AT&T|TABLET|DATA PLAN/],
 ["permits",/PERMIT|\bIRP\b|PLATE|REGISTRATION|HVUT|2290|\bUCR\b|\bKYU\b|NM WEIGHT|OR WEIGHT/],
 ["scale",/SCALE|WEIGH/],["toll",/TOLL|E-?Z ?PASS|I-?PASS|SUN ?PASS|TURNPIKE|PIKEPASS/],["parking",/PARKING/],
 ["diesel",/FUEL|DIESEL|ULSD|COMDATA|\bEFS\b|FLEET ?ONE|\bWEX\b|PILOT|FLYING J|LOVE'?S|PETRO|\bTA\b/],
 ["parts",/PARTS/],["pm",/\bPM\b|PREVENTIVE|OIL CHANGE|LUBE/],["truck_repair",/REPAIR|SHOP|MECHANIC|ROAD ?SERVICE|TOW/],
 ["factoring",/FACTOR/],["dispatch",/DISPATCH/]];
C.MAPOLD={"parts":"parts"};
C.guessCat=function(text){var U=String(text||"").toUpperCase();for(var i=0;i<C.KW.length;i++)if(C.KW[i][1].test(U))return C.KW[i][0];return null};

/* ---------- statements ---------- */
/* st: {gross, rate(bp|null), fee(null|cents), earn(null|cents), ded:[{c,a}], adv, reimb, other, net(stated|null), dedTotal(stated|null)} */
C.stmtCalc=function(st){
 var g=st.gross||0,warn=[],fee,earn,rate=st.rate;
 if(st.earn!=null){earn=st.earn;fee=g-earn; /* company fee implied — never subtract twice */
  if(rate!=null&&g){var e2=C.pct(g,rate);if(Math.abs(e2-earn)>1)warn.push({k:"earnMismatch",exp:e2,got:earn})}
  if(st.fee!=null&&st.fee!==fee)warn.push({k:"feeMismatch",exp:fee,got:st.fee})}
 else if(st.fee!=null){fee=st.fee;earn=g-fee}
 else if(rate!=null){earn=C.pct(g,rate);fee=g-earn}
 else{earn=g;fee=0;warn.push({k:"noRate"})}
 var ded=C.sum(st.ded||[],"a"),adv=st.advInDed?0:(st.adv||0),reimb=st.reimb||0,other=st.other||0;
 var net=earn-ded+reimb+other-adv;
 var rec={stated:st.net==null?null:st.net,calc:net,diff:st.net==null?null:st.net-net,why:[]};
 if(st.dedTotal!=null&&st.dedTotal!==ded)rec.why.push({k:"dedTotal",stated:st.dedTotal,calc:ded,diff:st.dedTotal-ded});
 if(rec.diff){warn.forEach(function(w){if(w.k=="earnMismatch")rec.why.push(w)});if(!rec.why.length)rec.why.push({k:"unknown",diff:rec.diff})}
 var lg=C.sum(st.loads||[],"g");
 var chk={net:st.net!=null?st.net===net:null,ded:st.dedTotal!=null?st.dedTotal===ded:null,gross:(st.loads&&st.loads.length&&g)?lg===g:null};
 rec.status=chk.net===false||chk.ded===false||chk.gross===false?"mismatch":chk.net&&chk.ded&&chk.gross?"full":chk.net?"partial":"none";rec.chk=chk;if(st.loads&&st.loads.length&&lg!==g)rec.why.push({k:"grossLoads",stated:g,calc:lg,diff:g-lg});
 return {gross:g,grossLoads:lg,fee:fee,earn:earn,ded:ded,adv:adv,reimb:reimb,other:other,net:net,rec:rec,warn:warn}};

/* ---------- transactions & double-count protection ----------
 Expense counting rules (the core of "no double counting"):
  1) Statement deductions always count (driver bore them).
  2) A standalone transaction counts ONLY if paidBy=="own" (driver's own money), it is not linked to a statement line,
     and it is not marked as a duplicate of another record.
  3) paidBy=="card" (company fuel card / company paid) never counts by itself — the statement deduction already covers it.
     Such receipts are kept for gallons, prices, MPG and as proof.
  4) Reimbursements received reduce out-of-pocket cost; advances are not expenses. */
C.isPers=function(t){return !!t.pers||t.c==="pers"};
C.counts=function(t,S){return t.kind!="income"&&t.kind!="reimb"&&t.paidBy=="own"&&!t.link&&!t.dupOf&&!C.isPers(t)&&!/^shp/.test(t.id||"")&&C.kindOf(t.c,S,t)==="expense"};
C.persCounts=function(t){return t.kind=="exp"&&C.isPers(t)&&!t.dupOf};
C.sameish=function(a,b,days){ /* candidate duplicate test */
 if(!a||!b||a===b)return 0;if(Math.abs((a.a||0)-(b.a||0))>1)return 0;var dd=Math.abs(C.days(a.d,b.d));if(dd>(days==null?1:days))return 0;
 var s=2;if(a.v&&b.v){var x=String(a.v).toUpperCase().replace(/[^A-Z]/g,"").slice(0,5),y=String(b.v).toUpperCase().replace(/[^A-Z]/g,"").slice(0,5);if(x&&y&&x===y)s++}
 if(a.gal&&b.gal&&Math.abs(a.gal-b.gal)<2)s++;if(a.ref&&b.ref&&a.ref===b.ref)s+=2;if(dd===0)s++;return s};
C.findDups=function(t,S){ /* returns [{type:'tx'|'stline'|'stfuel', id, score, ...}] */
 var out=[];(S.tx||[]).forEach(function(o){if(o.id===t.id)return;var sc=C.sameish(t,o);if(sc>=3)out.push({type:"tx",id:o.id,score:sc,o:o})});
 (S.stmts||[]).forEach(function(st){(st.fuel||[]).forEach(function(f,i){var sc=C.sameish(t,{a:f.a,d:f.d,v:f.v,gal:f.gal,ref:f.ref});if(sc>=3)out.push({type:"stfuel",id:st.id,i:i,score:sc,o:f,st:st})});
  /* receipt fuel inside a statement period while the statement has a fuel deduction with no detail lines */
  if(t.c&&C.catGroup(t.c)==="fuel"&&!(st.fuel&&st.fuel.length)&&st.p0&&st.p1&&t.d>=st.p0&&t.d<=st.p1&&(st.ded||[]).some(function(x){return C.catGroup(x.c)==="fuel"}))out.push({type:"stperiod",id:st.id,score:2,st:st});
  (st.ded||[]).forEach(function(x,i){if(x.c===t.c&&Math.abs(x.a-t.a)<=1&&st.p0&&t.d>=C.addDays(st.p0,-7)&&t.d<=C.addDays(st.p1||st.d,1))out.push({type:"stline",id:st.id,i:i,score:3,o:x,st:st})})});
 out.sort(function(a,b){return b.score-a.score});return out};
C.stHasFuelLines=function(S,id){var r=false;(S.stmts||[]).forEach(function(s){if(s.id===id&&(s.fuel||[]).some(function(f){return f.gal}))r=true});return r};
C.stDay=function(st){return st.p1||st.d}; /* statement belongs to the week it covers */
C.norm=function(x){return String(x||"").toUpperCase().replace(/[^A-Z0-9]/g,"")};
C.stmtDup=function(st,S){ /* same statement = same company AND (same settlement # or same covered week/money). Different company, driver, unit or number → never a duplicate */
 var k=C.key(st),f=null;(S.stmts||[]).forEach(function(o){if(f||o.id===st.id)return;
  var ok2=C.key(o);if(k&&ok2===k){f=o;return}if(k&&ok2&&ok2!==k)return;
  if(st.company&&o.company&&C.norm(st.company)!==C.norm(o.company))return;
  if(st.driver&&o.driver&&C.norm(st.driver)!==C.norm(o.driver))return;
  if(st.unit&&o.unit&&C.norm(st.unit)!==C.norm(o.unit))return;
  var sameWeek=(st.p1&&o.p1&&Math.abs(C.days(st.p1,o.p1))<=1)||(st.p0&&o.p0&&st.p0===o.p0);
  var sameMoney=(st.gross&&st.gross===o.gross)||(st.net!=null&&o.net!=null&&st.net===o.net);
  if(sameWeek&&(sameMoney||!st.gross||!o.gross)||sameMoney&&sameWeek)f=o;else if(sameMoney&&Math.abs(C.days(C.stDay(st),C.stDay(o)))<=3&&!(st.p1&&o.p1))f=o});return f};
C.dupPairs=function(S){var out=[],a=S.stmts||[];for(var i=0;i<a.length;i++)for(var j=i+1;j<a.length;j++){var x=C.stmtDup(a[j],{stmts:[a[i]]});if(x)out.push([a[i],a[j]])}return out};
C.mergeStmt=function(a,b){ /* add b's loads/deductions that a does not already have (same source line, or same label+amount) */
 var o=JSON.parse(JSON.stringify(a));function same(x,y){if(x.pg&&y.pg&&x.ln&&y.ln)return x.pg===y.pg&&x.ln===y.ln;return x.a===y.a&&x.c===y.c&&C.norm(x.v)===C.norm(y.v)&&!!x.v}
 (b.loads||[]).forEach(function(l){if(!o.loads.some(function(y){return (l.num&&y.num)?l.num===y.num:(y.g===l.g&&y.f===l.f&&y.t===l.t)}))o.loads.push(l)});
 (b.ded||[]).forEach(function(d){if(!o.ded.some(function(y){return same(d,y)}))o.ded.push(d)});(b.fuel||[]).forEach(function(f){o.fuel=o.fuel||[];if(!o.fuel.some(function(y){return y.a===f.a&&y.d===f.d&&y.gal===f.gal}))o.fuel.push(f)});
 ["company","num","p0","p1","rate","earn","fee","net","dedTotal","fuelRetail","fuelInvoice","driver","unit"].forEach(function(k){if(o[k]==null&&b[k]!=null)o[k]=b[k]});
 ["adv","reimb","other"].forEach(function(k){if(!o[k]&&b[k])o[k]=b[k]});
 var lg=C.sum(o.loads,"g");if(!o.gross||(b.gross&&b.gross>o.gross))o.gross=Math.max(o.gross||0,b.gross||0,lg);return o};
C.key=function(st){if(!st.num)return null;return String(st.company||"").toUpperCase().replace(/[^A-Z0-9]/g,"")+"#"+String(st.num).toUpperCase().replace(/[^A-Z0-9]/g,"")};

/* ---------- dates ---------- */
C.pd=function(s){var p=String(s).split("-");return Date.UTC(+p[0],+p[1]-1,+p[2])};
C.iso=function(ms){var d=new Date(ms);return d.getUTCFullYear()+"-"+C.p2(d.getUTCMonth()+1)+"-"+C.p2(d.getUTCDate())};
C.p2=function(n){return (n<10?"0":"")+n};
C.days=function(a,b){return Math.round((C.pd(b)-C.pd(a))/864e5)};
C.addDays=function(s,n){return C.iso(C.pd(s)+n*864e5)};
C.range=function(per,ref,c0,c1){var r=C.pd(ref),d=new Date(r),y=d.getUTCFullYear(),m=d.getUTCMonth(),a,b;
 if(per=="today")return [ref,ref];
 if(per=="week"){var dw=(d.getUTCDay()+6)%7;a=C.iso(r-dw*864e5);return [a,C.addDays(a,6)]}
 if(per=="month")return [C.iso(Date.UTC(y,m,1)),C.iso(Date.UTC(y,m+1,0))];
 if(per=="year")return [y+"-01-01",y+"-12-31"];
 if(per=="custom")return [c0||ref,c1||ref];
 return ["0000-01-01","9999-12-31"]};
C.inR=function(d,r){return !!d&&d>=r[0]&&d<=r[1]};

/* ---------- period totals ---------- */
C.totals=function(S,r){var r0=r;
 var o={byKind:{},nonTax:0,adjust:0,shopExp:0,ownDebtPaid:0,stDedAll:0,debtPaid:0,escrow:0,pers:0,gross:0,fee:0,earn:0,stDed:0,oop:0,reimb:0,other:0,adv:0,net:0,profit:0,loaded:0,empty:0,
  dieselGal:0,defGal:0,dieselCost:0,fuelCost:0,retail:0,invoice:0,src:{gross:[],fee:[],earn:[],exp:[],net:[],profit:[]},byCat:{},stCount:0,loadCount:0,days:0};
 function addCat(c,a,src){o.byCat[c]=(o.byCat[c]||0)+a;o.src.exp.push(src)}
 (S.stmts||[]).forEach(function(st){if(!C.inR(C.stDay(st),r))return;var k=C.stmtCalc(st);o.stCount++;
  o.gross+=k.gross;o.fee+=k.fee;o.earn+=k.earn;o.stDed+=k.ded;o.stDedAll+=k.ded;o.reimb+=k.reimb;o.other+=k.other;o.adv+=k.adv;o.net+=k.net;o.days+=st.days||0;
  o.src.gross.push({t:"st",id:st.id,a:k.gross});o.src.fee.push({t:"st",id:st.id,a:k.fee});o.src.earn.push({t:"st",id:st.id,a:k.earn});o.src.net.push({t:"st",id:st.id,a:k.net});
  (st.ded||[]).forEach(function(x,i){var kd=C.kindOf(x.c,S,x);o.byKind[kd]=(o.byKind[kd]||0)+x.a;
   if(kd==="expense"||kd==="loan"){addCat(x.c,x.a,{t:"stded",id:st.id,i:i,a:x.a,c:x.c});if(!C.isTaxable(x.c,S,x))o.nonTax+=x.a;return}
   o.stDed-=x.a;if(kd==="debt"||kd==="advance")o.debtPaid+=x.a;else if(kd==="deposit"||kd==="holdback")o.escrow+=x.a;else o.adjust+=x.a});
  var lm=0,ld=0;(st.loads||[]).forEach(function(l){lm+=l.mi||0;ld+=l.dh||0;o.loadCount++});
  if(st.miLoaded!=null){o.loaded+=st.miLoaded;o.empty+=st.miEmpty||0}else if(st.miles){o.loaded+=st.miles;o.empty+=st.dh||0}else{o.loaded+=lm;o.empty+=ld}
  if(st.milesAuto)o.autoMi=true;if(st.miSrc=="doc")o.docMi=true;
  (st.fuel||[]).forEach(function(f){fuelAdd(f)});
  if(st.fuelRetail!=null&&st.fuelInvoice!=null&&!(st.fuel||[]).some(function(f){return f.ret!=null})){o.retail+=st.fuelRetail;o.invoice+=st.fuelInvoice}});
 (S.loads||[]).forEach(function(l){if(!C.inR(l.d,r))return;var e=l.earn!=null?l.earn:l.g;o.gross+=l.g;o.earn+=e;o.fee+=l.g-e;o.loaded+=l.mi||0;o.empty+=l.dh||0;o.loadCount++;
  o.src.gross.push({t:"load",id:l.id,a:l.g});o.src.earn.push({t:"load",id:l.id,a:e});o.src.fee.push({t:"load",id:l.id,a:l.g-e})});
 (S.tx||[]).forEach(function(t){if(!C.inR(t.d,r))return;
  if(t.kind=="reimb"){o.reimb+=t.a;o.txReimb=(o.txReimb||0)+t.a;return}
  if(t.kind=="income"){o.other+=t.a;o.txIncome=(o.txIncome||0)+t.a;return}
  if(t.c&&C.catGroup(t.c)==="fuel"&&!t.dupOf&&!(t.link&&C.stHasFuelLines(S,t.link)))fuelAdd(t);
  if(t.kind=="exp"&&t.paidBy=="own"&&!t.dupOf&&!t.link&&!C.isPers(t)&&C.kindOf(t.c,S,t)!=="expense")o.ownDebtPaid+=t.a;
  if(C.counts(t,S)){o.oop+=t.a;if(!C.isTaxable(t.c,S,t))o.nonTax+=t.a;addCat(t.c,t.a,{t:"tx",id:t.id,a:t.a,c:t.c})}else if(C.persCounts(t))o.pers=(o.pers||0)+t.a});
 function fuelAdd(f){var cost=f.inv!=null?f.inv:(f.a||0);if(f.c==="def"){o.defGal+=f.gal||0}else if(f.gal){o.dieselGal+=f.gal;o.dieselCost+=cost}
  if(f.ret!=null&&f.inv!=null){o.retail+=f.ret;o.invoice+=f.inv}}
 var tk=C.truckCalc(S);o.principal=0;o.interest=0;tk.pays.forEach(function(p){if(!C.inR(p.d,r))return;o.interest+=p.interest;if(tk.isLoan&&p.principal){o.principal+=p.principal;if(p.src==="st"){o.stDed-=p.principal;o.byCat.truck_pay=(o.byCat.truck_pay||0)-p.principal}}});
 C.shopCalc(S).forEach(function(x){var r=x.r;if(!C.inR(r.d,r0)||x.total==null)return;var pa=r.paidAmt!=null?r.paidAmt:(r.drv||0)+(r.co||0),notDriver=(x.payer==="company"&&!r.transfer)||x.payer==="owner"?pa:0;var cost=Math.max(0,x.total-notDriver);if(!cost)return;o.shopExp+=cost;addCat("truck_repair",cost,{t:"shop",id:r.id,a:cost,c:"truck_repair"})});
 o.shopOwnPaid=0;C.shopCalc(S).forEach(function(x){var r=x.r;if(x.payer==="driver"&&C.inR(r.d,r0))o.shopOwnPaid+=r.paidAmt!=null?r.paidAmt:(r.drv||0);}); /* later own-money payments to the shop are 'shop_debt' tx → already in ownDebtPaid */
 o.exp=o.stDed+o.oop+o.shopExp;o.fuelSaved=o.retail&&o.invoice?o.retail-o.invoice:0;
 o.fuelCost=(o.byCat.diesel||0)+(o.byCat.def||0); /* authoritative: counted fuel expenses only */
 o.profit=o.earn+o.other+o.reimb-o.stDed-o.oop-o.shopExp;
 o.cashFlow=o.net-o.oop-o.ownDebtPaid-o.shopOwnPaid+(o.txReimb||0)+(o.txIncome||0); /* money actually received minus money spent from own pocket */
 o.miles=o.loaded+o.empty;
 o.perMile=function(c){return o.miles>0?Math.round(c/o.miles):null};
 o.rpm={gross:o.perMile(o.gross),driver:o.perMile(o.earn),net:o.perMile(o.net),loaded:o.loaded>0?Math.round(o.gross/o.loaded):null};
 o.mpg=o.miles>0&&o.dieselGal>0?Math.round(o.miles*10000/o.dieselGal)/100:null; /* gal stored as hundredths */
 return o};

/* route legs for estimated miles: PU→DEL is loaded; previous DEL→next PU is empty; no guessed start/end legs */
C.legs=function(loads){var ls=(loads||[]).slice().sort(function(a,b){return (a.pd||"")<(b.pd||"")?-1:(a.pd||"")>(b.pd||"")?1:0}),pts=[],types=[];
 function norm(c){return String(c||"").trim().toUpperCase().replace(/\s+/g," ")}
 ls.forEach(function(l){var f=norm(l.f),t=norm(l.t);if(!f||!t)return;if(!pts.length)pts.push(l.f);else if(norm(pts[pts.length-1])!==f){pts.push(l.f);types.push("empty")}pts.push(l.t);types.push("loaded")});
 return {pts:pts,types:types}};
C.sumLegs=function(types,meters,pts){var list=types.map(function(t,i){return {type:t,f:pts?pts[i]:null,t:pts?pts[i+1]:null,mi:Math.round((meters[i]||0)/1609.344)}}),o={loaded:0,empty:0};list.forEach(function(x){o[x.type]+=x.mi});return {loaded:o.loaded,empty:o.empty,legs:list}};
/* ---------- truck / lease / loan ---------- */
C.truckCalc=function(S){var T=S.truck||{},pays=[],tc=C.norm(T.company);
 (S.stmts||[]).forEach(function(st){if(tc&&st.company&&C.norm(st.company)!==tc)return;if(T.num&&st.unit&&C.norm(st.unit).indexOf(C.norm(T.num))<0&&C.norm(T.num).indexOf(C.norm(st.unit))<0)return;
  (st.ded||[]).forEach(function(x,i){if(x.c==="truck_pay")pays.push({d:C.stDay(st),a:x.a,src:"st",id:st.id,i:i})})});
 (T.manual||[]).forEach(function(p){pays.push({d:p.d,a:p.a,src:"man",id:p.id})});pays.sort(function(a,b){return a.d<b.d?-1:1});
 var fin=T.type==="financed"||T.type==="lto",bal=T.balance||0,apr=T.aprBp||0,per=T.period==="month"?12:52,intT=0,prinT=0,rows=[];
 pays.forEach(function(p){var it=0,pr=0;if(fin){it=Math.min(p.a,Math.round(bal*apr/10000/per));pr=p.a-it;bal=Math.max(0,bal-pr)}rows.push({d:p.d,a:p.a,interest:it,principal:pr,bal:fin?bal:null,src:p.src,id:p.id,i:p.i});intT+=it;prinT+=pr});
 return {pays:rows,paid:C.sum(pays,"a"),interest:intT,principal:prinT,lease:fin?0:C.sum(pays,"a"),balance:fin?bal:null,isLoan:fin}};
/* ---------- company debts ---------- */
C.debtCalc=function(S){var out=[];(S.debts||[]).forEach(function(d){var items=(d.items||[]).slice();
  (S.stmts||[]).forEach(function(st){(st.ded||[]).forEach(function(x){if(x.c==="co_debt"&&x.debt===d.id)items.push({d:C.stDay(st),a:-x.a,src:"st",id:st.id})});
   if(st.negCarry===d.id){var k=C.stmtCalc(st);if(k.net<0)items.push({d:C.stDay(st),a:-k.net,src:"neg",id:st.id})}});
  var nw=0,pay=0;items.forEach(function(i){if(i.a>0)nw+=i.a;else pay+=-i.a});var unk=d.opening==null&&!nw;out.push({id:d.id,company:d.company,type:d.type,opening:d.opening||0,newDebt:nw,payments:pay,remaining:unk?null:(d.opening||0)+nw-pay,unknown:unk,items:items.sort(function(a,b){return a.d<b.d?-1:1})})});return out};
C.unassignedDebt=function(S){var u=[];(S.stmts||[]).forEach(function(st){(st.ded||[]).forEach(function(x,i){if(x.c==="co_debt"&&!x.debt)u.push({st:st,i:i,a:x.a,v:x.v})})});return u};
C.debtCandidates=function(S,st){return (S.debts||[]).filter(function(d){return d.type!=="neg"&&(!d.company||!st.company||C.norm(d.company)===C.norm(st.company))})};
/* ---------- truck shop ---------- */
C.shopCalc=function(S){return (S.shop||[]).map(function(r){
  var pa=r.paidAmt!=null?r.paidAmt:(r.drv||0)+(r.co||0),payer=r.payer||(r.drv?"driver":r.co?"company":"driver");
  var paid=(payer==="credit"||payer==="install")?0:pa; /* shop credit / installment = still owed to the shop */
  var pays=(r.pays||[]).slice();(S.stmts||[]).forEach(function(st){(st.ded||[]).forEach(function(x){if(x.c==="shop_debt"&&x.shop===r.id)pays.push({d:C.stDay(st),a:x.a,src:"st",id:st.id})})});
  var p2=C.sum(pays,"a"),known=r.total!=null||r.parts!=null||r.labor!=null,total=r.total!=null?r.total:(r.parts||0)+(r.labor||0);
  var owedTo=payer==="company"&&r.transfer?"company":"shop";
  return {id:r.id,r:r,total:known?total:null,payer:payer,paid:paid+p2,remaining:known?Math.max(0,total-paid-p2):null,owedTo:owedTo,movedToCompany:owedTo==="company"?pa:0,pays:pays}})};
/* one source for the Expenses screen: every row and whether it counts */
C.expRows=function(S,r){var rows=[],rr=r;
 (S.stmts||[]).forEach(function(s){if(!C.inR(C.stDay(s),r))return;(s.ded||[]).forEach(function(x,i){var kd=C.kindOf(x.c,S,x);rows.push({src:"st",id:s.id,i:i,d:C.stDay(s),a:x.a,c:x.c,v:x.v,pers:false,kind:kd,cnt:kd==="expense"||kd==="loan"})})});
 (S.tx||[]).forEach(function(t){if(t.kind!=="exp"||!C.inR(t.d,r))return;var p=C.isPers(t);rows.push({src:"tx",id:t.id,d:t.d,a:t.a,c:t.c||"other",v:t.v,pers:p,cnt:p?C.persCounts(t):C.counts(t,S),kind:C.kindOf(t.c||"other",S,t),t:t})});
 C.shopCalc(S).forEach(function(x){var r=x.r;if(!C.inR(r.d,rr)||x.total==null)return;var pa=r.paidAmt!=null?r.paidAmt:(r.drv||0)+(r.co||0),nd=(x.payer==="company"&&!r.transfer)||x.payer==="owner"?pa:0,cost=Math.max(0,x.total-nd);if(cost)rows.push({src:"shop",id:r.id,d:r.d,a:cost,c:"truck_repair",v:r.name||"Shop",kind:"expense",cnt:true})});
 rows.sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0});var biz=0,pers=0,tk=C.truckCalc(S);rows.forEach(function(x){if(!x.cnt)return;if(x.pers)pers+=x.a;else biz+=x.a});
 tk.pays.forEach(function(p){if(tk.isLoan&&p.src==="st"&&C.inR(p.d,rr))biz-=p.principal});return {rows:rows,biz:biz,pers:pers}};
/* statement saved after manual entries: own-money entries equal to a statement line are linked (counted once) */
C.linkCandidates=function(st,S){var out=[];(S.tx||[]).forEach(function(t){if(t.kind!=="exp"||t.link||t.dupOf||C.isPers(t))return;
  var inP=st.p0&&st.p1?(t.d>=C.addDays(st.p0,-7)&&t.d<=C.addDays(st.p1,1)):Math.abs(C.days(t.d,C.stDay(st)))<=7;if(!inP)return;
  var line=null;(st.ded||[]).forEach(function(x){if(!line&&Math.abs(x.a-t.a)<=1&&(x.c===t.c||C.catGroup(x.c)===C.catGroup(t.c)))line=x});
  (st.fuel||[]).forEach(function(f){if(!line&&Math.abs((f.inv!=null?f.inv:f.a)-t.a)<=1&&C.catGroup(t.c)==="fuel")line=f});
  if(line){var strong=!!(t.ref&&(line.ref||line.v)&&C.norm(line.ref||line.v).indexOf(C.norm(t.ref))>=0);out.push({t:t,line:line,strong:strong})}});return out};
C.linkMatching=function(st,S,confirmIds){ /* links only strong matches (same invoice/transaction #) or the ones the user confirmed */
 var ids=[];C.linkCandidates(st,S).forEach(function(c){if(c.strong||(confirmIds&&confirmIds.indexOf(c.t.id)>=0)){c.t.link=st.id;ids.push(c.t.id)}});return ids};
/* ---------- tax estimate 2026 (owner-operator, Schedule C + SE). Estimates only. ---------- */
C.TAX={BR:{single:[[1240000,1000],[5040000,1200],[10570000,2200],[20177500,2400],[25622500,3200],[64060000,3500],[1e15,3700]],
 mfj:[[2480000,1000],[10080000,1200],[21140000,2200],[40355000,2400],[51245000,3200],[76870000,3500],[1e15,3700]],
 hoh:[[1770000,1000],[6745000,1200],[10570000,2200],[20175000,2400],[25620000,3200],[64060000,3500],[1e15,3700]]},
 STD:{single:1610000,mfj:3220000,hoh:2415000},SSB:18450000,PD:8000,PDP:8000};
C.fedTax=function(ti,st){var b=C.TAX.BR[st]||C.TAX.BR.single,t=0,lo=0;for(var i=0;i<b.length&&ti>lo;i++){var hi=b[i][0];t+=C.pct(Math.min(ti,hi)-lo,b[i][1]);lo=hi}return t};
C.TAXST=["w2","1099","sole","smllc","llc_other","scorp"];
C.taxStatus=function(S){return S.taxSt||(S.role==="company"?"w2":"1099")};
C.MACRS3=[3333,4445,1481,741]; /* over-the-road tractor units: 3-year MACRS, half-year convention (IRS Pub 946) */
C.depr=function(S,y){var T=S.truck||{};if(!T.price||!T.inService||!(T.type==="owned"||T.type==="financed"||T.type==="lto"||T.type==="oo"))return 0;var y0=+String(T.inService).slice(0,4),k=y-y0;if(k<0)return 0;
 if(T.dep==="bonus")return k===0?T.price:0;if(T.dep==="none")return 0;return k<C.MACRS3.length?C.pct(T.price,C.MACRS3[k]):0};
C.tax=function(S,y,today){var r=[y+"-01-01",y+"-12-31"],o=C.totals(S,r),days=o.days+C.tripDays(S,r),st=C.taxStatus(S),res={status:st,t:o,days:days,ok:true,why:null,prelim:true};
 var hasData=o.stCount+o.loadCount>0||o.oop>0;if(!hasData){res.ok=false;res.why="noData";return res}
 if(st==="llc_other"||st==="scorp"){res.ok=false;res.why="entity";return res}
 var std=C.TAX.STD[S.status]||C.TAX.STD.single;
 if(st==="w2"){var wages=o.earn+o.other;var ti=Math.max(0,wages-std);res.taxable=ti;res.se=0;res.fed=C.fedTax(ti,S.status);res.stt=C.pct(wages,S.stBp||0);res.pdd=0;res.dep=0;res.sc=null}
 else{res.pdd=C.pct(days*C.TAX.PD,C.TAX.PDP);res.dep=C.depr(S,y);res.sc=o.profit+o.nonTax-res.pdd-res.dep; /* non-deductible expenses lowered Business Profit but are not deductible → add back */
  var base=C.pct(Math.max(0,res.sc),9235);res.se=C.pct(Math.min(base,C.TAX.SSB),1240)+C.pct(base,290);var half=Math.floor(res.se/2),agi=Math.max(0,res.sc-half),pre=Math.max(0,agi-std);
  var qbi=Math.min(C.pct(Math.max(0,res.sc-half),2000),C.pct(pre,2000));res.taxable=Math.max(0,pre-qbi);res.fed=C.fedTax(res.taxable,S.status);res.stt=C.pct(agi,S.stBp||0)}
 res.tot=res.se+res.fed+res.stt;res.paid=(S.paid&&S.paid[y])||0;res.left=Math.max(0,res.tot-res.paid);
 if(today&&today.slice(0,4)===String(y)){var doy=C.days(y+"-01-01",today)+1;if(doy>=14&&doy<365){res.fcProfit=Math.round(o.profit*365/doy);res.fcTot=Math.round(res.tot*365/doy)}}
 res.st=res.stt;res.pdd=res.pdd||0;return res};
C.tripDays=function(S,r){var set={};(S.trips||[]).forEach(function(t){for(var d=t.a;d<=t.b;d=C.addDays(d,1))if(C.inR(d,r))set[d]=1});return Object.keys(set).length};

/* ---------- statement text reader (rules only; unknown stays null — never invented) ---------- */
var STS="AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|ON|QC|BC|AB|MB";
C.MONEY=/\(?[-−]?\s?\$?\s?(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2}\)?(?![\d%])/g;
function moneys(s){var m=s.match(C.MONEY)||[];return m.map(C.cents).filter(function(x){return x!=null})}
function lastMoney(s){var m=moneys(s);return m.length?m[m.length-1]:null}
function dates(U){var out=[],re=/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/g,m;while((m=re.exec(U))){var mo=+m[1],da=+m[2],yr=+m[3];if(yr<100)yr+=2000;if(mo>=1&&mo<=12&&da>=1&&da<=31&&yr>2015&&yr<2100)out.push(yr+"-"+C.p2(mo)+"-"+C.p2(da))}
 var MN={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,SEPT:9,OCT:10,NOV:11,DEC:12};
 var re2=/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEPT?|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?,?\s+(20\d{2})/g;
 while((m=re2.exec(U))){out.push(m[4]+"-"+C.p2(MN[m[1]])+"-"+C.p2(+m[2]));if(m[3])out.push(m[4]+"-"+C.p2(MN[m[1]])+"-"+C.p2(+m[3]))}
 var re3=/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEPT?|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2})\s*[-–]\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEPT?|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2}),?\s+(20\d{2})/g;
 while((m=re3.exec(U))){out.unshift(m[5]+"-"+C.p2(MN[m[3]])+"-"+C.p2(+m[4]));out.unshift(m[5]+"-"+C.p2(MN[m[1]])+"-"+C.p2(+m[2]))}return out}
function title(s){s=s.replace(/\b([A-Z]{2,})\s(FI|FL)\s([A-Z]{2,})\b/g,"$1$2$3");return s.toLowerCase().replace(/\b[a-z]/g,function(c){return c.toUpperCase()})}
function locs(U){var re=new RegExp("([A-Z][A-Z .'\\-]{1,24}?)[, ]+("+STS+")\\b","g"),out=[],m;while((m=re.exec(U))){var city=m[1].replace(/^(?:\d+|[A-Z]{1,2}\d+)\s+/,"").replace(/^(FROM|TO|ORIGIN|DEST(INATION)?|PICKUP|DELIVERY|SHIPPER|CONSIGNEE|PU|DEL)\s*:?\s*/,"").trim();
 var w=city.split(/\s+/);if(w.length>3)city=w.slice(-3).join(" ");if(city.length>=2&&!/^(TOTAL|FUEL|LOAD|PAY|RATE|MILES?|NET|GROSS)$/.test(city))out.push(title(city)+", "+m[2])}return out}
/* PDF fonts often draw tt/ff/fi/fl/ffi/ffl as ONE glyph that has no text — pdf.js then drops it ("Sea" + "le" for Seattle).
   The PDF reader marks such a gap with \u00A4 (one per missing letter); here it is filled from known words, otherwise "tt"/"ff". */
C.LIGW=("seattle,settlement,statement,battle,little,pittsburgh,pittsburg,pittston,scottsdale,scottsbluff,scottsburg,chattanooga,ottawa,ottumwa,mattoon,plattsburgh,hattiesburg,marietta,henrietta,lafayette,fayette,fayetteville,gettysburg,bettendorf,brattleboro,kettleman,rotterdam,"+
 "buffalo,jefferson,jeffersonville,effingham,griffin,tiffin,sheffield,suffolk,cliffside,flagstaff,stafford,clifton,fairfield,springfield,mansfield,bakersfield,wakefield,chesterfield,marshfield,plainfield,westfield,bloomfield,litchfield,clearfield,littlefield,"+
 "afton,after,office,officer,traffic,offset,staff,tariff,affidavit,difference,different,effective,trailer,attn,attention,letter,better,matter,water").split(",");
C.fixLig=function(txt){if(String(txt).indexOf("\u00A4")<0)return String(txt);var C2=["tt","ff","fi","fl","ft","ti","tf"],C3=["ffi","ffl","ttl","tti"];
 return String(txt).replace(/[A-Za-z]*\u00A4+[A-Za-z]*/g,function(w){var n=(w.match(/\u00A4/g)||[]).length,cs=n>=3?C3:C2,lw=w.toLowerCase(),pick=null;
  for(var i=0;i<cs.length&&!pick;i++){var t=lw.replace(/\u00A4+/,cs[i]);if(C.LIGW.indexOf(t)>=0)pick=cs[i]}if(!pick)pick=cs[0];
  var up=w.replace(/\u00A4+/,"").length&&w.replace(/\u00A4+/,"")===w.replace(/\u00A4+/,"").toUpperCase();return w.replace(/\u00A4+/,up?pick.toUpperCase():pick)})};
C.parseStatement=function(txt){txt=C.fixLig(txt);
 var lines=String(txt||"").split(/\n/).map(function(l){return l.replace(/\s+/g," ").trim()}).filter(Boolean),U=lines.join("\n").toUpperCase();
 var R={company:null,driver:null,num:null,d:null,p0:null,p1:null,gross:null,rate:null,earn:null,fee:null,adv:null,reimb:null,other:null,net:null,dedTotal:null,loads:[],ded:[],fuel:[],fuelRetail:null,fuelInvoice:null,unknown:[]};
 for(var i=0;i<Math.min(4,lines.length);i++){var cl=lines[i].replace(/\s*(STATEMENT DATE|SETTLEMENT DATE|PERIOD|DATE|PAGE)\b.*$/i,"").trim();if(/[A-Za-z]{3}/.test(cl)&&!/^(STATEMENT|SETTLEMENT|PAGE|DRIVER|PERIOD)/i.test(cl)&&!moneys(cl).length){R.company=cl.slice(0,60);break}}
 lines.forEach(function(l){var u=l.toUpperCase(),mm;
  if(!R.num&&(mm=u.match(/(?:SETTLEMENT|STATEMENT|STMT)\s*(?:#|NO\.?|NUMBER|ID)?\s*[:#]\s*([A-Z]{0,4}-?\d[A-Z0-9\-]{2,})/)))R.num=mm[1];
  if(/PERIOD\s*START|START\s*DATE|PERIOD\s*FROM/.test(u)){var q1=dates(u);if(q1.length)R.p0=q1[0]}
  if(/PERIOD\s*END|END\s*DATE|PERIOD\s*TO|WEEK\s*ENDING/.test(u)){var q2=dates(u);if(q2.length)R.p1=q2[q2.length-1]}
  if(!R.unit&&(mm=u.match(/UNIT\s*(?:NUMBER|NO\.?|#)?\s*:?\s*([A-Z0-9]{2,})/)))R.unit=mm[1];
  if(!R.driver&&(mm=l.match(/DRIVER(?: NAME)?\s*:\s*([A-Za-z][A-Za-z .'\-]{2,40})/i)))R.driver=mm[1].replace(/\s+(UNIT|TRUCK).*$/i,"").trim();
  if(/PERIOD|WEEK|FROM\b/.test(u)&&!R.p0){var ds=dates(u);if(ds.length>=2){R.p0=ds[0];R.p1=ds[1]}else if(ds.length===1&&/ENDING/.test(u)){R.p1=ds[0];R.p0=C.addDays(ds[0],-6)}}
  if(!R.d&&/(STATEMENT|SETTLEMENT|CHECK|PAY)\s*DATE/.test(u)){var d1=dates(u);if(d1.length)R.d=d1[0]}
 });
 if(!R.p0){var ds2=dates(U.split("\n").slice(0,8).join(" "));if(ds2.length>=2){R.p0=ds2[0];R.p1=ds2[1]}}
 var sec="",page=1,ln=0;
 lines.forEach(function(l){ln++;if(/^\[\[PAGE (\d+)\]\]$/.test(l)){page=+l.match(/\d+/)[0];ln=0;return}var u=l.toUpperCase(),a=lastMoney(l),ls=locs(u),mm;
  if(/^FUEL\s*TRANSACTIONS|^FUEL\s*(PURCHASES|DETAIL)/.test(u)){sec="fuel";return}
  if(/^TOLL\s*TRANSACTIONS|^TOLL\s*DETAIL/.test(u)){sec="toll";return}
  if(/^DEDUCTION\s*TYPE|^DEDUCTIONS$/.test(u)){sec="ded";return}
  if(/^EARNINGS$|^LOAD\s*(NUMBER|#)/.test(u)){sec="loads";return}
  if(sec==="toll"){if(a!=null&&!/TOTAL/.test(u)){R.tolls=R.tolls||[];R.tolls.push({d:dates(u)[0]||null,a:a})}return} /* detail of the Toll deduction — info only */
  if(sec==="fuel"){if(a==null)return;var dl=(l.match(/\(?[-−]?\$\s?(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2}\)?/g)||[]).map(C.cents),ms=dl.length?dl:moneys(l);
   if(/^TOTAL/.test(u)){if(ms.length>=2){R.fuelRetail=ms[0];R.fuelInvoice=ms[ms.length-1]}else R.fuelInvoice=ms[0];return}
   var qty=(u.replace(/\$\s?[\d,]+\.\d{2}/g," ").replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g," ").match(/\b(\d{1,4}\.\d{1,3})\b/)||[])[1];
   var stt=(u.match(new RegExp("\\b("+STS+")\\b(?=\\s+\\d)"))||[])[1]||null;
   R.fuel.push({d:dates(u)[0]||null,v:(l.match(/(DIESEL|DEF|REEFER|GAS)\s+(.*?)\s+[A-Z]{2}\s+\d/i)||[0,"",""])[2],state:stt,gal:qty?Math.round(parseFloat(qty)*100):null,c:/\bDEF\b/.test(u)?"def":"diesel",ret:ms.length>=2?ms[0]:null,inv:ms[ms.length-1],a:ms[ms.length-1]});return}
  if(/^\s*EARNINGS\s*:/.test(u)&&a!=null&&R.earn==null){R.earn=a;return}
  if(/^\s*DEDUCTIONS\s*:/.test(u)&&a!=null){R.dedTotal=Math.abs(a);return}
  if(/^\s*ADVANCES?\s*:/.test(u)&&a!=null){R.adv=Math.abs(a);return}
  if(/^\s*REIMBURSEMENTS?\s*:/.test(u)&&a!=null){R.reimb=Math.abs(a);return}
  if(/^\s*OTHER\s*PAY\s*:/.test(u)&&a!=null){R.other=Math.abs(a);return}
  if(sec==="loads"&&/^TOTAL/.test(u)){var tm=moneys(l);if(tm.length&&R.gross==null)R.gross=tm[0];if(tm.length>1&&R.earn==null)R.earn=tm[tm.length-1];return}
  if(sec==="ded"&&/^TOTAL/.test(u)){if(a!=null&&R.dedTotal==null)R.dedTotal=Math.abs(a);return}
  if(/(DRIVER|CONTRACTOR|OWNER OPERATOR|O\/O)\s*(RATE|%|PERCENT)|\bRATE\s*:?\s*\d{1,3}(\.\d+)?\s*%|\b\d{1,3}(\.\d+)?\s*%\s*(DRIVER|TO DRIVER|PAY)/.test(u)&&(mm=u.match(/(\d{1,3}(?:\.\d+)?)\s*%/))&&R.rate==null&&!/COMMISSION|COMPANY|FEE/.test(u))R.rate=C.bp(mm[1]);
  if(ls.length>=2&&a!=null){var nums=u.replace(C.MONEY," ").replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g," ").replace(/\d+(\.\d+)?\s*%/g," ").replace(/\b\d{5,}\b/g," ");
   var lr=u.match(/(\d{1,3}(?:\.\d+)?)\s*%/);if(lr&&R.rate==null)R.rate=C.bp(lr[1]);var mi=null,m2=nums.match(/(\d{2,4})\s*(?:MI|MILES?|LM|LOADED)\b/);
   if(m2)mi=+m2[1];else{var ns=(nums.match(/\b\d{2,4}\b/g)||[]).map(Number).filter(function(n){return n>=20&&n<=3500});if(ns.length)mi=ns[ns.length-1]}
   var lnum=(u.match(/^\s*#?([A-Z]{0,3}\d{4,})/)||[])[1]||null,dd=dates(u);
   R.loads.push({pg:page,ln:ln,num:lnum,f:ls[0],t:ls[ls.length-1],pd:dd[0]||null,g:Math.max.apply(null,moneys(l)),mi:mi,dh:null});return}
  if(a==null)return;
  if(/GALLONS?|\bGAL\b|\bGL\b/.test(u)&&/(DIESEL|ULSD|DEF|FUEL|PILOT|LOVE|PETRO|\bTA\b|FLYING)/.test(u)&&!/TOTAL/.test(u)){var g=(u.match(/(\d{1,4}(?:\.\d{1,3})?)\s*(?:GALLONS?|GAL|GL)\b/)||[])[1];var ds3=dates(u);
   R.fuel.push({d:ds3[0]||null,v:(l.match(/^[^\d$]{3,30}/)||[""])[0].trim(),gal:g!=null?Math.round(parseFloat(g)*100):null,c:/\bDEF\b/.test(u)?"def":"diesel",a:a,inv:a,ret:null});return}
  if(/RETAIL/.test(u)&&/FUEL|TOTAL/.test(u)){R.fuelRetail=a;return}
  if(/INVOICE|DISCOUNTED/.test(u)&&/FUEL|TOTAL/.test(u)){R.fuelInvoice=a;return}
  if(/TOTAL\s*DEDUCTION|DEDUCTIONS?\s*TOTAL/.test(u)){R.dedTotal=Math.abs(a);return}
  if(/NET\s*(PAY|AMOUNT|SETTLEMENT)|AMOUNT\s*PAID|CHECK\s*AMOUNT|SETTLEMENT\s*AMOUNT|TOTAL\s*PAY(?!MENT)/.test(u)&&!/YTD|YEAR/.test(u)){R.net=a;return}
  if(/YTD|YEAR TO DATE/.test(u))return;
  if(/BALANCE|REMAINING|OWED|OUTSTANDING/.test(u)&&!/NET|SETTLEMENT|CHECK|PAY\b/.test(u)){var bk=/SHOP|REPAIR/.test(u)?"shop":/ESCROW|RESERVE/.test(u)?"escrow":/TRUCK|LEASE|TRACTOR/.test(u)?"truck":/LOAN|ADVANCE|DEBT|CHARGE/.test(u)?"co":null;if(bk){R.bal=R.bal||[];R.bal.push({k:bk,a:Math.abs(a)});return}}
  if(/(DRIVER|CONTRACTOR|YOUR|O\/O)\s*(EARNINGS|GROSS|PAY|SHARE|REVENUE)|EARNINGS\s*\(\s*\d/.test(u)&&R.earn==null){R.earn=a;return}
  if(/COMMISSION|COMPANY\s*(FEE|SHARE|PORTION)|CARRIER\s*(FEE|SHARE)/.test(u)&&R.fee==null){R.fee=Math.abs(a);return}
  if(/GROSS|TOTAL\s*REVENUE|LINE ?HAUL\s*TOTAL|TOTAL\s*LINE ?HAUL|TOTAL\s*LOAD|LOAD\s*TOTAL|TOTAL\s*FREIGHT/.test(u)&&!/NET/.test(u)&&R.gross==null){R.gross=a;return}
  if(/ADVANCE|CASH ADV|COMCHECK/.test(u)&&sec!=="ded"){R.adv=(R.adv||0)+Math.abs(a);return}
  if(/ADVANCE|CASH ADV|COMCHECK/.test(u)&&sec==="ded"&&!/TOTAL/.test(u)){R.ded.push({pg:page,ln:ln,c:"co_debt",a:Math.abs(a),v:l.replace(C.MONEY,"").replace(/\s+/g," ").trim().slice(0,48)});return}
  if(/REIMB/.test(u)){R.reimb=(R.reimb||0)+Math.abs(a);return}
  if(/DETENTION|LAYOVER|BONUS|STOP PAY|EXTRA STOP|TARP|OTHER PAY|ACCESSORIAL/.test(u)&&!/DEDUCT/.test(u)){R.other=(R.other||0)+Math.abs(a);return}
  var c=C.guessCat(u);var lab=l.replace(C.MONEY,"").replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g,"").replace(/\s+/g," ").trim().slice(0,48);
  if(c&&!/TOTAL|SUBTOTAL/.test(u)){R.ded.push({pg:page,ln:ln,c:c,a:/REFUND|REBATE|CREDIT|RETURN/.test(u)?-Math.abs(a):Math.abs(a),v:lab,raw:(l.match(C.MONEY)||[]).pop()||""});return}
  if(!/TOTAL|SUBTOTAL|BALANCE|PAGE/.test(u))R.unknown.push({pg:page,ln:ln,v:lab||l.slice(0,48),a:Math.abs(a)});
 });
 C.collapseFuel(R);C.fixOcrDollar(R);
 if(R.gross==null&&R.loads.length)R.gross=C.sum(R.loads,"g");
 if(R.fuelInvoice!=null){var fd=R.ded.filter(function(x){return x.c==="diesel"});if(!fd.length)R.ded.push({c:"diesel",a:R.fuelInvoice,v:"Fuel (invoice)"})}
 if(R.adv){var advLine=R.ded.filter(function(d){return /ADVANCE|COMCHECK|CASH ADV/i.test(d.v)&&d.a===R.adv})[0];if(advLine){advLine.c="co_debt";R.advInDed=true}}
 R.grossDoc=R.gross;R.grossLoads=C.sum(R.loads,"g");
 if(!R.d)R.d=R.p1||null;
 return R};

/* all fuel (diesel + DEF) → ONE "Fuel" deduction; details kept only as info (gallons) */
C.collapseFuel=function(R){var F=[],rest=[];R.ded.forEach(function(d){if(C.catGroup(d.c)==="fuel")F.push(d);else rest.push(d)});
 if(!F.length&&R.fuelInvoice==null)return R;var total=null,details=F;
 if(R.fuelInvoice!=null)total=R.fuelInvoice;
 else{var all=C.sum(F,"a");for(var i=0;i<F.length&&total==null;i++){if(F.length>1&&Math.abs(F[i].a*2-all)<=2||/TOTAL/i.test(F[i].v)){total=F[i].a;details=F.filter(function(x,j){return j!==i})}}
  if(total==null)total=all}
 var hadRows=R.fuel.length>0;if(!hadRows&&!(details.length===1&&details[0].a===total))details.forEach(function(d){R.fuel.push({d:null,v:d.v,gal:null,c:d.c,a:d.a,inv:d.a,ret:null})});
 var src0=F.filter(function(x){return x.a===total})[0]||F[0]||{};rest.push({pg:src0.pg,ln:src0.ln,c:"diesel",a:total,v:"Fuel"+(details.length?" ("+details.length+")":""),fuelN:details.length,raw:F.length===1?F[0].raw:""});R.ded=rest;R.fuelFromDetails=R.fuelInvoice==null&&details.length===F.length;return R};
/* OCR often reads "$" as 5, 8 or S: "$25.65" → "825.65". Use the statement's own totals to pick the right reading. */
C.fixOcrDollar=function(R){var target=R.dedTotal;if(target==null||C.sum(R.ded,"a")===target)return R;
 var amb=[];R.ded.forEach(function(d,i){var raw=String(d.raw||"").replace(/[()\s-]/g,"");if(/^[58S]\d{1,3}(,\d{3})*\.\d{2}$/.test(raw)&&raw.indexOf("$")<0)amb.push({i:i,alt:C.cents(raw.slice(1))})});
 if(!amb.length||amb.length>12)return R;var base=C.sum(R.ded,"a");
 for(var mask=1;mask<(1<<amb.length);mask++){var sum=base;for(var k=0;k<amb.length;k++)if(mask&(1<<k))sum+=amb[k].alt-R.ded[amb[k].i].a;
  if(sum===target){for(var k2=0;k2<amb.length;k2++)if(mask&(1<<k2)){var d=R.ded[amb[k2].i];d.ocrFix=d.a;d.a=amb[k2].alt}R.ocrFixed=true;return R}}
 return R};
/* ---------- receipts ---------- */
C.parseReceipt=function(txt){txt=C.fixLig(txt);var lines=String(txt||"").split(/\n/).map(function(l){return l.trim()}).filter(Boolean),U=lines.join("\n").toUpperCase(),a=null;
 lines.forEach(function(l){var u=l.toUpperCase();if(/(TOTAL|AMOUNT|BALANCE|DUE|SALE|ИТОГО)/.test(u)&&!/SUB\s?TOTAL|TAX|CHANGE|SAVING|DISCOUNT/.test(u)){var v=lastMoney(l);if(v!=null&&v>0)a=v}});
 if(a==null){var all=moneys(U).filter(function(x){return x>0&&x<5000000});if(all.length)a=Math.max.apply(null,all)}
 var ds=dates(U),v="";for(var j=0;j<Math.min(lines.length,6);j++){if(/^[A-Za-z][A-Za-z'&. ]{2}/.test(lines[j])&&!/\d{5}|\d{1,2}[\/\-]\d{1,2}/.test(lines[j])){v=lines[j].replace(/#\s*\d+/g,"").replace(/[^A-Za-z0-9&'.\- ]/g,"").trim();if(v.length>2)break}}
 var gal=(U.match(/(\d{1,4}\.\d{1,3})\s*(?:GALLONS?|GAL|GL)\b/)||U.match(/(?:GALLONS?|GAL|QTY)\s*:?\s*(\d{1,4}\.\d{1,3})/)||[])[1];
 var ret=null,inv=null;lines.forEach(function(l){var u=l.toUpperCase();if(/RETAIL/.test(u))ret=lastMoney(l);if(/INVOICE|DISCOUNTED|YOUR PRICE/.test(u))inv=lastMoney(l)});
 var c=C.guessCat(U);if(/\bDEF\b/.test(U)&&!/DIESEL|ULSD/.test(U))c="def";
 var ref=(U.match(/(?:TRANS(?:ACTION)?|INVOICE|AUTH|REF)\s*(?:#|NO\.?|ID)?\s*:?\s*([A-Z0-9]{4,})/)||[])[1]||null;
 var st=(U.match(new RegExp("\\b[A-Z][A-Z .]{2,20},?\\s+("+STS+")\\s+\\d{5}"))||[])[1]||null;
 return {a:a,d:ds[0]||null,v:v,c:c||"other",gal:gal?Math.round(parseFloat(gal)*100):null,ret:ret,inv:inv,ref:ref,state:st}};

/* ---------- migration v1 → v2 (dollar floats → cents; nothing dropped) ---------- */
C.MAPV1={fuel:"diesel",repair:"truck_repair",tires:"parts",ins:"truck_ins",truck:"truck_pay",tolls:"toll",permits:"permits",eld:"eld",park:"parking",disp:"dispatch",lumper:"other",wash:"other",supp:"other",other:"other",pers:"pers"};
C.migrate=function(d){if(!d||d.v===2)return d;var o={v:2,lang:d.lang||"kg",role:"oo",status:d.status||"single",stBp:Math.round((+d.st||0)*100),paid:{},wd:d.wd==null?6:d.wd,stmts:[],loads:[],tx:[],trips:(d.trips||[]).slice(),log:[]};
 Object.keys(d.paid||{}).forEach(function(y){o.paid[y]=C.cents(d.paid[y])||0});
 var byS={};(d.stmts||[]).forEach(function(s){byS[s.id]={id:s.id,company:null,num:null,d:s.d,p0:C.addDays(s.d,-6),p1:s.d,gross:0,rate:null,earn:null,fee:null,ded:[],adv:0,reimb:0,other:0,net:null,dedTotal:null,loads:[],fuel:[],days:s.days||0,src:"v1"}});
 (d.loads||[]).forEach(function(l){var g=C.cents(l.g)||0;if(l.st&&byS[l.st]){byS[l.st].loads.push({num:null,f:l.f,t:l.t,pd:l.d,g:g,mi:l.mi||0,dh:l.dh||0});byS[l.st].gross+=g}
  else o.loads.push({id:l.id,d:l.d,f:l.f||"",t:l.t||"",g:g,earn:null,mi:l.mi||0,dh:l.dh||0,n:l.n||""})});
 (d.exp||[]).forEach(function(e){var a=C.cents(e.a)||0,c=C.MAPV1[e.c]||"other";if(e.st&&byS[e.st]){byS[e.st].ded.push({c:c,a:a,v:e.v||""})}
  else o.tx.push({id:e.id,kind:"exp",d:e.d,a:a,c:c,v:e.v||"",n:e.n||"",ph:e.ph||"",paidBy:"own",link:null,dupOf:null})});
 Object.keys(byS).forEach(function(k){byS[k].earn=byS[k].gross;o.stmts.push(byS[k])});
 o.log.push({t:new Date().toISOString(),a:"migrate",s:"v1→v2"});return o};

/* a statement may be saved without the user's confirmation ONLY when Gross, the deductions total and Net Pay all match */
C.autoSaveOk=function(st){return !!st&&st.gross>0&&C.stmtCalc(st).rec.status==="full"};
/* ---------- data safety ---------- */
/* never overwrites an existing backup: a second backup with the same name gets a time suffix */
C.safeBackup=function(store,key,raw){if(raw==null)return null;try{var k=key;if(store.getItem(k)!=null){k=key+"_"+new Date().toISOString().replace(/[^0-9]/g,"").slice(0,14);var n=1;while(store.getItem(k)!=null)k=key+"_"+new Date().toISOString().replace(/[^0-9]/g,"").slice(0,14)+"_"+(n++)}store.setItem(k,raw);return store.getItem(k)===raw?k:null}catch(e){return null}};
C.exportData=function(S,drv){return {app:"jolesep",v:2,date:new Date().toISOString(),driver:drv||null,data:S,photos:{}}};
function isObj(x){return !!x&&typeof x==="object"&&!Array.isArray(x)}
function objArr(v){if(!Array.isArray(v))return false;for(var i=0;i<v.length;i++)if(!isObj(v[i]))return false;return true}
function optArr(o,k){return o[k]==null||objArr(o[k])}
/* V2 profile: stmts, tx, loads must be arrays of objects; inside a statement ded/loads/fuel (when present) too */
C.validV2=function(d){if(!isObj(d)||d.v!==2)return false;if(!objArr(d.stmts)||!objArr(d.tx)||!objArr(d.loads))return false;
 var ks=["trips","debts","shop","log","cats","rules"];for(var i=0;i<ks.length;i++)if(!optArr(d,ks[i]))return false;
 for(var j=0;j<d.stmts.length;j++){var st=d.stmts[j];if(!optArr(st,"ded")||!optArr(st,"loads")||!optArr(st,"fuel")||!optArr(st,"tolls"))return false}return true};
/* V1 backup (old format, no version): at least one of loads/exp must exist; every list present must be a list of objects */
C.validV1=function(d){if(!isObj(d)||(d.v!=null&&d.v!==1))return false;if(d.loads==null&&d.exp==null)return false;
 var ks=["loads","exp","stmts","trips"];for(var i=0;i<ks.length;i++)if(!optArr(d,ks[i]))return false;if(d.paid!=null&&!isObj(d.paid))return false;
 for(var j=0;j<(d.loads||[]).length;j++)if(typeof d.loads[j].d!=="string")return false;for(var k=0;k<(d.exp||[]).length;k++)if(typeof d.exp[k].d!=="string")return false;return true};
C.readBackup=function(txt){var o;try{o=JSON.parse(txt)}catch(e){return null}if(!isObj(o)||o.app!=="jolesep"||!isObj(o.data))return null;
 var d;if(o.data.v===2){if(!C.validV2(o.data))return null;d=o.data}
 else{if(!C.validV1(o.data))return null;try{d=C.migrate(o.data)}catch(e){return null}if(!C.validV2(d))return null}
 return {data:d,driver:isObj(o.driver)?o.driver:null,date:o.date||null,photos:isObj(o.photos)?o.photos:{}}};
/* restore: valid file only; the current profile is copied first — if that copy fails, nothing is changed */
C.restoreInto=function(store,key,txt){var o=C.readBackup(txt);if(!o)return {ok:false,why:"badFile"};var cur=null;try{cur=store.getItem(key)}catch(e){return {ok:false,why:"storage"}}
 var bk=null;if(cur!=null){bk=C.safeBackup(store,key+"_backup_before_restore",cur);if(!bk)return {ok:false,why:"backup"}}
 try{store.setItem(key,JSON.stringify(o.data))}catch(e){try{if(cur!=null)store.setItem(key,cur)}catch(e2){}return {ok:false,why:"storage"}}
 return {ok:true,backup:bk,res:o}};
G.JE=C;if(typeof module!=="undefined")module.exports=C;
})(typeof window!=="undefined"?window:this);
