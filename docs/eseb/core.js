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
 if(/^\d{1,3}(\.\d{3})+,\d{2}$/.test(s))s=s.replace(/\./g,""); /* 18.294,61 */
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
C.KW=[["pers",/FEDERAL\s+(INCOME\s+)?(TAX|WITHHOLDING)|STATE\s+(INCOME\s+)?(TAX|WITHHOLDING)|SOCIAL\s+SECURITY|MEDICARE|\bFICA\b|\bOASDI\b/],["escrow",/ESCROW/],["reserve",/RESERVE|MAINT(ENANCE)? (FUND|RESERVE)/],["wash",/TRUCK ?WASH|BLUE ?BEACON|\bWASH\b/],["co_fee",/ADMIN(ISTRATION|ISTRATIVE)? FEE|SERVICE FEE|COMPANY FEE|PROCESSING FEE|PLATFORM FEE/],["tires",/TIRE/],["co_debt",/DRIVER DEBT|CASH ADVANCE|\bADVANCE\b|\bDR\.?\s*DEBT\b|^(?!.*SHOP).*\bDEBT\b|DEBT (REPAY|PAYMENT|DEDUCT)|LOAN REPAY|ADVANCE REPAY|CHARGE ?BACK|COMPANY LOAN|DAMAGE (CHARGE|CLAIM|DEDUCT|REPAIR|FEE)|CLAIM DEDUCT|NEG(ATIVE)? BAL|CARRY ?OVER|PREVIOUS BAL/],["shop_debt",/SHOP (DEBT|LOAN|PAYMENT|INSTALL)|REPAIR (LOAN|INSTALL|ADVANCE)/],["ifta_eld",/\bIF?TA\s*(&|AND|\/|\+)?\s*(LOG|ELD)|(LOG ?BOOK|ELD)\s*(&|AND|\/|\+)\s*IF?TA\b/],["prepass",/PRE ?PASS|BESTPASS|DRIVEWYZE/],["def",/\bDEF\b|DIESEL EXHAUST/],
 ["bobtail",/BOBTAIL/],["cargo_ins",/CARGO/],["truck_ins",/INSUR|OCC(UPATIONAL)? ?ACC|\bOCCAC\b|PHYSICAL DAMAGE|\bPD\b|LIABILITY|\bNTL\b|\bINS\b/],
 ["trailer_repair",/TRAILER (REPAIR|MAINT)|REEFER REPAIR/],["trailer",/TRAILER|\bVAN RENT|REEFER RENT/],["truck_pay",/TRUCK PAY|LEASE|TRACTOR|TRUCK LOAN|TRUCK NOTE|FINANC/],
 ["ifta",/\bIFTA\b|FUEL TAX|OREGON\s*(MILES?|MILEAGE|TAX|WMT)|WEIGHT[- ]?MILE|\bWMT\b|\bKYU\b|NY\s*HUT|HIGHWAY USE TAX|NM\s*WEIGHT/],["eld",/\bELD\b|LOG ?BOOK|SAMSARA|MOTIVE|KEEP ?TRUCKIN|OMNITRACS/],["phone",/PHONE|INTERNET|VERIZON|T-?MOBILE|AT&T|TABLET|DATA PLAN/],
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
/* a pay-statement line that repays the company (Debts section) */
C.isCoDebt=function(x,S){if(!x||x.c==='shop_debt'||x.c==='truck_pay'||x.c==='escrow'||x.c==='reserve')return false;if(x.c==='co_debt')return true;var k=C.kindOf(x.c,S||{},x);return k==='debt'||k==='advance'};
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
C.stDay=function(st){if(st.p0&&st.p1&&st.p1>=st.p0){var n=C.days(st.p0,st.p1);if(n>=0&&n<=31)return C.addDays(st.p0,Math.floor(n/2))}return st.p1||st.d}; /* statement belongs to the week most of its days fall in (middle of the period) */
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
/* loan payment: only the interest is a business expense; principal never. Unknown split → nothing counted, flagged. */
C.loanMap=function(S){var tk=C.truckCalc(S),m={};tk.pays.forEach(function(p){m[p.src+":"+p.id+":"+(p.i==null?"":p.i)]=p});return {tk:tk,m:m}};
C.loanPart=function(LM,src,id,i,a){var p=LM.m[src+":"+id+":"+(i==null?"":i)];if(!p||!LM.tk.isLoan)return {exp:0,principal:p?0:a,unsplit:p?0:a};return {exp:p.interest,principal:p.principal,unsplit:0}};
C.totals=function(S,r){var r0=r,LM=C.loanMap(S);
 var o={byKind:{},principal:0,interest:0,loanUnsplit:0,loanIntOwn:0,manDebtPaid:0,nonTax:0,adjust:0,shopExp:0,ownDebtPaid:0,stDedAll:0,debtPaid:0,escrow:0,pers:0,gross:0,fee:0,earn:0,stDed:0,oop:0,reimb:0,other:0,adv:0,net:0,profit:0,loaded:0,empty:0,
  dieselGal:0,defGal:0,dieselCost:0,fuelCost:0,retail:0,invoice:0,src:{gross:[],fee:[],earn:[],exp:[],net:[],profit:[]},byCat:{},stCount:0,loadCount:0,days:0};
 function addCat(c,a,src){o.byCat[c]=(o.byCat[c]||0)+a;o.src.exp.push(src)}
 (S.stmts||[]).forEach(function(st){if(!C.inR(C.stDay(st),r))return;var k=C.stmtCalc(st);o.stCount++;
  o.gross+=k.gross;o.fee+=k.fee;o.earn+=k.earn;o.stDed+=k.ded;o.stDedAll+=k.ded;o.reimb+=k.reimb;o.other+=k.other;o.adv+=k.adv;o.net+=k.net;o.days+=st.days||0;
  o.src.gross.push({t:"st",id:st.id,a:k.gross});o.src.fee.push({t:"st",id:st.id,a:k.fee});o.src.earn.push({t:"st",id:st.id,a:k.earn});o.src.net.push({t:"st",id:st.id,a:k.net});
  (st.ded||[]).forEach(function(x,i){var kd=C.kindOf(x.c,S,x);o.byKind[kd]=(o.byKind[kd]||0)+x.a;
   if(kd==="expense"){addCat(x.c,x.a,{t:"stded",id:st.id,i:i,a:x.a,c:x.c});if(!C.isTaxable(x.c,S,x))o.nonTax+=x.a;return}
   if(kd==="loan"){var lp=C.loanPart(LM,"st",st.id,i,x.a);o.stDed-=x.a-lp.exp;o.principal+=lp.principal;o.loanUnsplit+=lp.unsplit;if(lp.exp){addCat(x.c,lp.exp,{t:"stded",id:st.id,i:i,a:lp.exp,c:x.c});o.interest+=lp.exp}return}
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
  if(t.kind=="exp"&&t.paidBy=="own"&&!t.dupOf&&!t.link&&!C.isPers(t)&&C.kindOf(t.c,S,t)==="loan"){var lq=C.loanPart(LM,"tx",t.id,null,t.a);o.principal+=lq.principal;o.loanUnsplit+=lq.unsplit;if(lq.exp){o.loanIntOwn+=lq.exp;o.interest+=lq.exp;addCat(t.c,lq.exp,{t:"tx",id:t.id,a:lq.exp,c:t.c})}}
  if(C.counts(t,S)){o.oop+=t.a;if(!C.isTaxable(t.c,S,t))o.nonTax+=t.a;addCat(t.c,t.a,{t:"tx",id:t.id,a:t.a,c:t.c})}else if(C.persCounts(t))o.pers=(o.pers||0)+t.a});
 function fuelAdd(f){var cost=f.inv!=null?f.inv:(f.a||0);if(f.c==="def"){o.defGal+=f.gal||0}else if(f.gal){o.dieselGal+=f.gal;o.dieselCost+=cost}
  if(f.ret!=null&&f.inv!=null){o.retail+=f.ret;o.invoice+=f.inv}}
 /* debt paid by hand (Debts → payment) is the driver's own money */
 (S.debts||[]).forEach(function(d){(d.items||[]).forEach(function(i){if(i.src==="man"&&i.a<0&&C.inR(i.d,r0))o.manDebtPaid+=-i.a})});
 C.shopCalc(S).forEach(function(x){var r=x.r;if(!C.inR(r.d,r0)||x.total==null)return;var pa=r.paidAmt!=null?r.paidAmt:(r.drv||0)+(r.co||0),notDriver=(x.payer==="company"&&!r.transfer)||x.payer==="owner"?pa:0;var cost=Math.max(0,x.total-notDriver);if(!cost)return;o.shopExp+=cost;addCat("truck_repair",cost,{t:"shop",id:r.id,a:cost,c:"truck_repair"})});
 o.shopOwnPaid=0;C.shopCalc(S).forEach(function(x){var r=x.r;if(x.payer==="driver"&&C.inR(r.d,r0))o.shopOwnPaid+=r.paidAmt!=null?r.paidAmt:(r.drv||0);}); /* later own-money payments to the shop are 'shop_debt' tx → already in ownDebtPaid */
 o.exp=o.stDed+o.oop+o.shopExp+o.loanIntOwn;o.fuelSaved=o.retail&&o.invoice?o.retail-o.invoice:0;
 o.fuelCost=(o.byCat.diesel||0)+(o.byCat.def||0); /* authoritative: counted fuel expenses only */
 o.profit=o.earn+o.other+o.reimb-o.stDed-o.oop-o.shopExp-o.loanIntOwn;
 o.cashFlow=o.net-o.oop-o.ownDebtPaid-o.manDebtPaid-o.shopOwnPaid+(o.txReimb||0)+(o.txIncome||0); /* money actually received minus money spent from own pocket */
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
 (S.tx||[]).forEach(function(t){if(t.kind==="exp"&&t.c==="truck_pay"&&t.paidBy==="own"&&!t.dupOf&&!t.link&&!C.isPers(t))pays.push({d:t.d,a:t.a,src:"tx",id:t.id})});
 (T.manual||[]).forEach(function(p){pays.push({d:p.d,a:p.a,src:"man",id:p.id})});pays.sort(function(a,b){return a.d<b.d?-1:1});
 var fin=T.type==="financed"||T.type==="lto",bal=T.balance||0,apr=T.aprBp||0,per=T.period==="month"?12:52,intT=0,prinT=0,rows=[];
 pays.forEach(function(p){var it=0,pr=0;if(fin){it=Math.min(p.a,Math.round(bal*apr/10000/per));pr=p.a-it;bal=Math.max(0,bal-pr)}rows.push({d:p.d,a:p.a,interest:it,principal:pr,bal:fin?bal:null,src:p.src,id:p.id,i:p.i});intT+=it;prinT+=pr});
 return {pays:rows,paid:C.sum(pays,"a"),interest:intT,principal:prinT,lease:fin?0:C.sum(pays,"a"),balance:fin?bal:null,isLoan:fin}};
/* ---------- company debts ---------- */
C.debtCalc=function(S){var out=[];(S.debts||[]).forEach(function(d){var items=(d.items||[]).map(function(i){return {d:i.d,a:i.a,src:i.src||"man",note:i.note}}),snaps=[],origs={};
  (S.stmts||[]).forEach(function(st){var day=st.p1||st.d||C.stDay(st),mine=false,tag={id:st.id,co:st.company||"",p0:st.p0||null,p1:st.p1||st.d||null};
   (st.ded||[]).forEach(function(x){if(x.debt===d.id&&C.isCoDebt(x,S)){mine=true;items.push({d:day,a:-x.a,src:"st",id:st.id,st:tag,v:x.v||""});
     if(x.orig!=null){var lk=C.norm(x.v||"");origs[lk]={a:x.orig,d:day,full:x.orig===x.a&&x.bal==null}}}});
   if(st.advDebt===d.id&&st.adv>0&&!st.advInDed){mine=true;items.push({d:day,a:st.adv,src:"st",id:st.id,st:tag,v:"Advance",isNew:1})} /* money advanced on the statement = new debt */
   if(st.negCarry===d.id){var k=C.stmtCalc(st);if(k.net<0){mine=true;items.push({d:day,a:-k.net,src:"neg",id:st.id,st:tag,isNew:1})}}
   var b=(st.bal||[]).filter(function(x){return x.k==="co"})[0];if(mine&&b)snaps.push({d:day,a:b.a,id:st.id,st:tag})}); /* balance printed on the statement */
  items.sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:(b.a>0?1:-1)});
  var nw=0,pay=0;items.forEach(function(i){if(i.a>0)nw+=i.a;else pay+=-i.a});
  var rem=null,how="unknown";snaps.sort(function(a,b){return a.d<b.d?-1:1});
  if(snaps.length){var sn=snaps[snaps.length-1];rem=sn.a;items.forEach(function(i){if(i.d>sn.d||i.d===sn.d&&i.id!==sn.id&&i.src!=="st")rem+=i.a>0?i.a:i.a});how="statement"} /* latest printed balance, then later movements */
  else if(d.opening!=null&&(d.opening>0||d.zeroOk)){rem=d.opening+nw-pay;how="start"}            /* older data: a start amount that was entered */
  else if(items.length&&items[0].a>0){rem=nw-pay;how="fromZero"}                                 /* the debt began inside the app (first record is new debt) */
  var ok=Object.keys(origs);if(rem==null&&ok.length&&ok.every(function(k){return origs[k].full})){rem=0;how="printedFull"} /* "Total Amount" = this week's charge: the whole sum was taken at once */
  var printedTotal=ok.length?ok.reduce(function(t,k){return t+origs[k].a},0):null;              /* the whole debt amount printed on the statement ("Total Amount") */
  var st2=d.closed?"paid":rem==null?"unknown":rem<=0?"paid":"active",total=rem==null?printedTotal:Math.max(0,rem)+pay;
  out.push({id:d.id,company:d.company,type:d.type,opening:d.opening==null?null:d.opening,openKnown:how!=="unknown",newDebt:nw,payments:pay,total:total,remaining:rem,unknown:rem==null,how:how,status:st2,closed:!!d.closed,over:rem!=null&&rem<0?-rem:0,items:items,snaps:snaps,printedTotal:printedTotal})});return out};
C.unassignedDebt=function(S){var u=[];(S.stmts||[]).forEach(function(st){(st.ded||[]).forEach(function(x,i){if(C.isCoDebt(x,S)&&!x.debt)u.push({st:st,i:i,a:x.a,v:x.v})})});return u};
C.debtCandidates=function(S,st){return (S.debts||[]).filter(function(d){return d.type!=="neg"&&(!d.company||!st.company||C.norm(d.company)===C.norm(st.company))})};
/* fully automatic: every company-debt line and every advance of a statement goes to that company's debt record */
C.autoDebts=function(S,st,uid){var lines=(st.ded||[]).filter(function(x){return C.isCoDebt(x,S)}),adv=st.adv>0&&!st.advInDed;if(!lines.length&&!adv)return null;S.debts=S.debts||[];
 var free=lines.filter(function(x){return !x.debt});if(!free.length&&(!adv||st.advDebt))return null; /* already linked → nothing new (no empty debt) */
 var key=C.norm(st.company||""),dd=S.debts.filter(function(x){return x.type!=="neg"&&C.norm(x.company||"")===key})[0];
 if(!dd){var lb=String((lines[0]||{}).v||"").toUpperCase();dd={id:"d"+uid(),company:st.company||"",type:/ADVANCE/.test(lb)||adv?"advance":/FUEL/.test(lb)?"fuel_adv":/REPAIR/.test(lb)?"repair_adv":/CHARGE|DAMAGE/.test(lb)?"damage":"loan",opening:null,items:[],auto:true};S.debts.push(dd)}
 lines.forEach(function(x){if(!x.debt)x.debt=dd.id});if(adv)st.advDebt=dd.id;return dd};
/* one debt per company: duplicates (e.g. an old 'paid' copy and a new empty one) are joined, empty auto records removed */
C.mergeDebts=function(S){var ds=(S.debts||[]).filter(function(d){return d.type!=="neg"}),by={},drop={};
 function used(id){return (S.stmts||[]).some(function(st){return st.advDebt===id||st.negCarry===id||(st.ded||[]).some(function(x){return x.debt===id})})}
 ds.forEach(function(d){var k=C.norm(d.company||"");if(!k)return;if(!by[k]){by[k]=d;return}var keep=by[k];if(!used(keep.id)&&used(d.id)){by[k]=d;d=keep;keep=by[k]}
  (S.stmts||[]).forEach(function(st){if(st.advDebt===d.id)st.advDebt=keep.id;(st.ded||[]).forEach(function(x){if(x.debt===d.id)x.debt=keep.id})});
  keep.items=(keep.items||[]).concat(d.items||[]);if(keep.opening==null&&d.opening!=null){keep.opening=d.opening;keep.zeroOk=d.zeroOk}drop[d.id]=1});
 S.debts=(S.debts||[]).filter(function(d){if(drop[d.id])return false;if(d.type!=="neg"&&!used(d.id)&&!(d.items||[]).length&&(d.opening==null||d.opening===0))return false;return true});
 (S.debts||[]).forEach(function(d){if(d.closed&&d.auto)delete d.closed}); /* status comes from the statements only */
 return S};
/* a hand-entered payment that is already recorded: same day & amount (exact), or the same amount taken from a statement within 7 days (probably the same money) */
C.debtPayDup=function(S,id,d,a){var c=C.debtCalc(S).filter(function(x){return x.id===id})[0];if(!c)return null;var hit=null;
 c.items.forEach(function(i){if(i.a>=0||hit)return;var amt=-i.a;if(amt!==a)return;if(i.src==="man"&&i.d===d)hit="same";else if(i.src==="st"&&Math.abs(C.days(i.d,d))<=7)hit="statement"});return hit};
/* all debts in one list for the Debts screen: company · truck loan · truck shop · other */
C.allDebts=function(S){var out=[],unitOf=function(co){var u=null;(S.stmts||[]).forEach(function(st){if(st.unit&&(!co||C.norm(st.company)===C.norm(co)))u=st.unit});return u||(S.truck&&S.truck.num)||null};
 C.debtCalc(S).forEach(function(d){out.push({grp:d.type==="other"?"other":"co",id:d.id,name:d.company||"",to:d.company||"",unit:unitOf(d.company),opening:d.opening,total:d.total,paid:d.payments,newDebt:d.newDebt,remaining:d.remaining,status:d.status,over:d.over,items:d.items,type:d.type,src:"debt"})});
 var tk=C.truckCalc(S),T=S.truck||{};if(tk.isLoan){var op=T.balance||null;out.push({grp:"truck",id:"truck",name:T.owner||T.company||"",to:T.owner||T.company||"",unit:T.num||unitOf(T.company),opening:op,paid:tk.principal,interest:tk.interest,remaining:op==null?null:tk.balance,status:op==null?"unknown":tk.balance<=0?"paid":"active",items:tk.pays.map(function(p){return {d:p.d,a:-p.a,src:p.src,principal:p.principal,interest:p.interest}}),src:"truck"})}
 C.shopCalc(S).forEach(function(x){if(x.owedTo==="company")return; /* moved to a company debt */var r=x.r,owes=x.payer==="credit"||x.payer==="install"||x.pays.length;if(!owes)return;
  out.push({grp:"shop",id:x.id,name:r.name||"Shop",to:r.name||"Shop",unit:unitOf(null),opening:x.total,paid:x.paid,remaining:x.remaining,status:r.closed||x.remaining===0?"paid":x.remaining==null?"unknown":"active",items:x.pays.map(function(p){return {d:p.d,a:-p.a,src:p.src}}),src:"shop"})});
 return out};

C.unassignedDebt=function(S){var u=[];(S.stmts||[]).forEach(function(st){(st.ded||[]).forEach(function(x,i){if(C.isCoDebt(x,S)&&!x.debt)u.push({st:st,i:i,a:x.a,v:x.v})})});return u};
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
C.expRows=function(S,r){var rows=[],rr=r,LM=C.loanMap(S);
 (S.stmts||[]).forEach(function(s){if(!C.inR(C.stDay(s),r))return;(s.ded||[]).forEach(function(x,i){var kd=C.kindOf(x.c,S,x),ca=kd==="expense"?x.a:kd==="loan"?C.loanPart(LM,"st",s.id,i,x.a).exp:0;
  rows.push({src:"st",id:s.id,i:i,d:C.stDay(s),a:x.a,ca:ca,c:x.c,v:x.v,pers:false,kind:kd,cnt:ca!==0})})});
 (S.tx||[]).forEach(function(t){if(t.kind!=="exp"||!C.inR(t.d,r))return;var p=C.isPers(t),kd=C.kindOf(t.c||"other",S,t),cnt=p?C.persCounts(t):C.counts(t,S),ca=cnt?t.a:0;
  if(!p&&kd==="loan"&&t.paidBy==="own"&&!t.dupOf&&!t.link){ca=C.loanPart(LM,"tx",t.id,null,t.a).exp;cnt=ca!==0}
  rows.push({src:"tx",id:t.id,d:t.d,a:t.a,ca:ca,c:t.c||"other",v:t.v,pers:p,cnt:cnt,kind:kd,t:t})});
 C.shopCalc(S).forEach(function(x){var r=x.r;if(!C.inR(r.d,rr)||x.total==null)return;var pa=r.paidAmt!=null?r.paidAmt:(r.drv||0)+(r.co||0),nd=(x.payer==="company"&&!r.transfer)||x.payer==="owner"?pa:0,cost=Math.max(0,x.total-nd);if(cost)rows.push({src:"shop",id:r.id,d:r.d,a:cost,ca:cost,c:"truck_repair",v:r.name||"Shop",kind:"expense",cnt:true})});
 rows.sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0});var biz=0,pers=0;rows.forEach(function(x){if(!x.cnt)return;if(x.pers)pers+=x.ca;else biz+=x.ca});return {rows:rows,biz:biz,pers:pers}};
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
/* European format: "18 294,61", "18.294,61", "-780,45", dates 01.11.2026 = 1 November */
C.numFormat=function(t){t=String(t||"").replace(/[\u00A0\u202F\u2009]/g," ");var eu=(t.match(/(?:^|[^\d,.])-?\d{1,3}(?:[ .]\d{3})*,\d{2}(?![\d,])/g)||[]).length,us=(t.match(/\d,\d{3}\.\d{2}(?!\d)|(?:^|[^\d,])\d{1,3}\.\d{2}(?![\d.,])/g)||[]).length;return eu>us&&eu>=2?"eu":"us"};
C.normNumbers=function(t){t=String(t||"").replace(/[\u00A0\u202F\u2009]/g," ");var f=C.numFormat(t);
 if(f==="eu"){t=t.replace(/([-−]?)(\d{1,3}(?:[ .]\d{3})+|\d+),(\d{2})(?![\d,])/g,function(m,sg,i,d){return sg+i.replace(/[ .]/g,"").replace(/\B(?=(\d{3})+$)/g,",")+"."+d})
  .replace(/(^|[^\d#,.\/-])(\d{1,3}) (\d{3})(?![\d.,\/])/g,"$1$2$3")}
 t=t.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g,function(m,a,b,y){var d=+a,mo=+b;if(f!=="eu"&&d<=12)return m;return mo>=1&&mo<=12&&d>=1&&d<=31?C.p2(mo)+"/"+C.p2(d)+"/"+y:m});return {text:t,fmt:f}};
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
C.parseStatement=function(txt){txt=C.fixLig(txt);var NF=C.normNumbers(txt);txt=NF.text;
 var RAWL=String(txt||"").split(/\n/).filter(function(l){return l.trim()&&!/^\[\[PAGE/.test(l)}),lines=String(txt||"").split(/\n/).map(function(l){return l.replace(/\s+/g," ").trim()}).filter(Boolean),U=lines.join("\n").toUpperCase();
 var R={company:null,driver:null,num:null,d:null,p0:null,p1:null,gross:null,rate:null,earn:null,fee:null,adv:null,reimb:null,other:null,net:null,dedTotal:null,loads:[],ded:[],fuel:[],fuelRetail:null,fuelInvoice:null,unknown:[]};
 for(var i=0;i<Math.min(4,lines.length);i++){var cl=lines[i].replace(/\s*(STATEMENT DATE|SETTLEMENT DATE|PERIOD|DATE|PAGE|DRIVER\s*:|CONTRACTOR\b|UNIT\s*:|CELL\s*:|EMAIL\s*:|PHONE\s*:)(.*)$/i,"").trim();if(/[A-Za-z]{3}/.test(cl)&&!/^(STATEMENT|SETTLEMENT|PAGE|DRIVER|PERIOD)/i.test(cl)&&!moneys(cl).length&&(cl.toUpperCase().match(/\b(LOAD|PICK ?UP|DELIVERY|ORIGIN|DESTINATION|MILES|MILEAGE|AMOUNT|RATE|GROSS|TRIP|DATE|DESCRIPTION)\b/g)||[]).length<2){R.company=cl.slice(0,60);break}}
 (function(){var CO=/^[A-Z0-9][A-Za-z0-9&.,' \-]{1,40}?\b(INC|LLC|L\.L\.C|CORP|CORPORATION|LTD|TRANSPORT(ATION)?|LOGISTICS|TRUCKING|FREIGHT|EXPRESS|LINES|CARRIERS?)\.?$/i,first=null;
  for(var i=0;i<Math.min(8,RAWL.length);i++){var segs=String(RAWL[i]).trim().split(/\s{2,}|\t/);for(var j=0;j<segs.length;j++){var sg=segs[j].trim();if(CO.test(sg)&&!/\d{3,}/.test(sg)){if(R.company!==sg){var fl=String(RAWL[0]).trim().split(/\s{2,}/)[0].trim();if(!R.driver&&fl!==sg&&/^[A-Z][A-Za-z'\-]+( [A-Z][A-Za-z'\-]+){1,3}$/.test(fl))R.driver=fl;R.company=sg}return}}}})();
 lines.forEach(function(l){var u=l.toUpperCase(),mm;
  if(!R.num&&(mm=u.match(/(?:SETTLEMENT|STATEMENT|STMT)\s*(?:#|NO\.?|NUMBER|ID)?\s*[:#]\s*([A-Z]{0,4}-?\d[A-Z0-9\-]*)\b/)))R.num=mm[1];
  if(!R.p0&&/PERIOD|WEEK|DATES?\b/.test(u)&&(mm=u.match(/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s*(\d{1,2})\s*[-–]\s*(?:(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s*)?(\d{1,2})\s*,?\s*(20\d{2})\b/))){var MN="JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC",m1=MN.indexOf(mm[1])/3+1,m2=mm[3]?MN.indexOf(mm[3])/3+1:m1,y2=+mm[5];R.p0=(m1>m2?y2-1:y2)+"-"+C.p2(m1)+"-"+C.p2(+mm[2]);R.p1=y2+"-"+C.p2(m2)+"-"+C.p2(+mm[4])}
  if(/PERIOD\s*START|START\s*DATE|PERIOD\s*FROM/.test(u)){var q1=dates(u);if(q1.length)R.p0=q1[0]}
  if(/PERIOD\s*END|END\s*DATE|PERIOD\s*TO|WEEK\s*ENDING/.test(u)){var q2=dates(u);if(q2.length)R.p1=q2[q2.length-1]}
  if(!R.unit&&(mm=u.match(/(?:UNIT|TRUCK|TRACTOR)\s*(?:NUMBER|NO\.?|#)?\s*[:#]?\s*#?([A-Z]{0,3}\d[A-Z0-9\-]{0,9})\b/)))R.unit=mm[1];
  if((mm=u.match(/\b(?:UNIT|TRUCK|TRACTOR)\b[^A-Z0-9]*[A-HJ-NPR-Z0-9]{17}\s+#?(\d{2,6})\b/)))R.unit=mm[1]; /* VIN + short truck number */
  if(!R.week&&(mm=u.match(/\bWEEK\s*#?\s*(\d{1,2})\b/)))R.week=+mm[1];
  if(!R.driver&&(mm=l.match(/DRIVER(?: NAME)?\s*:\s*([A-Za-z][A-Za-z .'\-]{2,40})/i)))R.driver=mm[1].replace(/\s+(UNIT|TRUCK).*$/i,"").trim();
  if(/PERIOD|WEEK|FROM\b/.test(u)&&!R.p0){var ds=dates(u);if(ds.length>=2){R.p0=ds[0];R.p1=ds[1]}else if(ds.length===1&&/ENDING/.test(u)){R.p1=ds[0];R.p0=C.addDays(ds[0],-6)}}
  if(!R.d&&/(STATEMENT|SETTLEMENT|CHECK|PAY)\s*DATE/.test(u)){var d1=dates(u);if(d1.length)R.d=d1[0]}
 });
 if(!R.p0){var ds2=dates(U.split("\n").slice(0,8).join(" "));if(ds2.length>=2){R.p0=ds2[0];R.p1=ds2[1]}}
 var sec="",page=1,ln=0;
 /* every key value remembers the page and line it came from */
 var FK=["gross","earn","fee","rate","net","dedTotal","adv","reimb","other","fuelDisc"];R.from={};
 lines.forEach(function(l){var b4=FK.map(function(k){return R[k]});one(l);FK.forEach(function(k,i){if(R[k]!==b4[i]&&R[k]!=null)R.from[k]={pg:page,ln:ln,t:String(l).trim().slice(0,110)}})});
 function one(l){ln++;if(/^\[\[PAGE (\d+)\]\]$/.test(l)){page=+l.match(/\d+/)[0];ln=0;return}var u=l.toUpperCase(),a=lastMoney(l),ls=locs(u),mm;
  if(/^FUEL\s*TRANSACTIONS|^FUEL\s*(PURCHASES|DETAIL)/.test(u)){sec="fuel";return}
  if(/^TOLL\s*TRANSACTIONS|^TOLL\s*DETAIL/.test(u)){sec="toll";return}
  if(/^DEDUCTION\s*TYPE|^((OTHER|RECURRING|FIXED|WEEKLY|SCHEDULED|VARIABLE|ONE[- ]TIME)\s+)?(DEDUCTIONS?|EXPENSES?|CHARGES|DEDUCTIONS? (AND|&) EXPENSES)\s*:?$/.test(u)){sec="ded";R._dsec=(R._dsec||0)+1;return}
  if(/^EARNINGS$|^LOAD\s*(NUMBER|#)/.test(u)){sec="loads";return}
  if(sec==="toll"){if(a!=null&&!/TOTAL/.test(u)){R.tolls=R.tolls||[];R.tolls.push({d:dates(u)[0]||null,a:a})}return} /* detail of the Toll deduction — info only */
  if(sec==="fuel"){if(a==null)return;var dl=(l.match(/\(?[-−]?\$\s?(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2}\)?/g)||[]).map(C.cents),ms=dl.length?dl:moneys(l);
   if(/^TOTAL/.test(u)){if(ms.length>=2){R.fuelRetail=ms[0];R.fuelInvoice=ms[ms.length-1]}else R.fuelInvoice=ms[0];return}
   var qty=(u.replace(/\$\s?[\d,]+\.\d{2}/g," ").replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g," ").match(/\b(\d{1,4}\.\d{1,3})\b/)||[])[1];
   var stt=(u.match(new RegExp("\\b("+STS+")\\b(?=\\s+\\d)"))||[])[1]||null;
   R.fuel.push({d:dates(u)[0]||null,v:(l.match(/(DIESEL|DEF|REEFER|GAS)\s+(.*?)\s+[A-Z]{2}\s+\d/i)||[0,"",""])[2],state:stt,gal:qty?Math.round(parseFloat(qty)*100):null,c:/\bDEF\b/.test(u)?"def":"diesel",ret:ms.length>=2?ms[0]:null,inv:ms[ms.length-1],a:ms[ms.length-1]});return}
  if(a!=null&&/^TOTAL\s+(OTHER|RECURRING|FIXED|WEEKLY|SCHEDULED|VARIABLE|ONE[- ]TIME)\s+(DEDUCTIONS?|EXPENSES?|CHARGES)\b/.test(u)){(R.dedSubs=R.dedSubs||[]).push(Math.abs(a));(R._subF=R._subF||[]).push({pg:page,ln:ln,t:String(l).trim().slice(0,110)});if(R.ded.length)R._dtAfter=1;return} /* section subtotal */
  if(/^TOTAL\s+(LOADED|DEADHEAD|EMPTY|MILES)\b/.test(u)&&(mm=u.match(/([\d,]+(?:\.\d+)?)\s*(MI|MILES)?\s*$/))){var mv=Math.round(parseFloat(mm[1].replace(/,/g,""))*100)/100;if(/LOADED/.test(u))R.docLoaded=mv;else if(/DEADHEAD|EMPTY/.test(u))R.docEmpty=mv;else R.docMiles=mv;return}
  if(a!=null&&/^(TOTAL\s+)?PAY\s*OUT\b|^PAYOUT\b/.test(u)){R.net=a;R.netLbl="Payout";return}                      /* "Payout" = what is paid */
  if(a!=null&&/^(TOTAL\s+)?NET\s+AMOUNT\b/.test(u)&&!/PAY/.test(u)){if(/^TOTAL/.test(u)||R.netAmt==null)R.netAmt=a;return} /* decided at the end: earnings or net */
  if(a!=null&&/^(TOTAL\s+)?EARNINGS?\b/.test(u)&&!/DEDUCT|YTD/.test(u)&&!/:\s*$/.test(u)){if(/^TOTAL/.test(u)||R.earn==null)R.earn=a;return}
  if(a!=null&&/^TOTAL\s+(TRIP|LOAD|FREIGHT|LINE ?HAUL)?\s*GROSS\b/.test(u)){var tg=moneys(l);if(tg.length>=2&&tg[0]>tg[tg.length-1]){R.gross=tg[0];if(R.earn==null)R.earn=tg[tg.length-1]}else R.gross=a;return}                      /* a printed total always wins over a per-trip gross */
  if(/^\s*EARNINGS\s*:/.test(u)&&a!=null&&R.earn==null){R.earn=a;return}
  if(/^\s*DEDUCTIONS\s*:/.test(u)&&a!=null){R.dedTotal=Math.abs(a);return}
  if(/^\s*ADVANCES?\s*:/.test(u)&&a!=null){R.adv=Math.abs(a);return}
  if(/^\s*REIMBURSEMENTS?\s*:/.test(u)&&a!=null){R.reimb=Math.abs(a);return}
  if(/^\s*OTHER\s*PAY\s*:/.test(u)&&a!=null){R.other=Math.abs(a);return}
  if(sec==="loads"&&/^TOTAL/.test(u)){var tm=moneys(l);if(tm.length&&R.gross==null)R.gross=tm[0];if(tm.length>1&&R.earn==null)R.earn=tm[tm.length-1];return}
  if(sec==="ded"&&/^TOTAL/.test(u)&&!/PAY|NET|SETTLEMENT/.test(u)){if(a!=null){R._secT=R._secT||{};if(R._secT[R._dsec||0]==null){R._secT[R._dsec||0]=Math.abs(a);(R.dedSubs=R.dedSubs||[]).push(Math.abs(a));(R._subF=R._subF||[]).push({pg:page,ln:ln,t:String(l).trim().slice(0,110)})}if(R.ded.length)R._dtAfter=1}return}
  if(/(DRIVER|CONTRACTOR|OWNER OPERATOR|O\/O)\s*(RATE|%|PERCENT)|\bRATE\s*:?\s*\d{1,3}(\.\d+)?\s*%|\b\d{1,3}(\.\d+)?\s*%\s*(DRIVER|TO DRIVER|PAY)/.test(u)&&(mm=u.match(/(\d{1,3}(?:\.\d+)?)\s*%/))&&R.rate==null&&!/COMMISSION|COMPANY|FEE/.test(u))R.rate=C.bp(mm[1]);
  if(ls.length>=2&&a!=null){var nums=u.replace(C.MONEY," ").replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g," ").replace(/\d+(\.\d+)?\s*%/g," ").replace(/\b\d{5,}\b/g," ");
   var lr=u.match(/(\d{1,3}(?:\.\d+)?)\s*%/);if(lr&&R.rate==null)R.rate=C.bp(lr[1]);var mi=null,m2=nums.match(/(\d{2,4})\s*(?:MI|MILES?|LM|LOADED)\b/);
   if(m2)mi=+m2[1];else{var ns=(nums.match(/\b\d{2,4}\b/g)||[]).map(Number).filter(function(n){return n>=20&&n<=3500});if(ns.length)mi=ns[ns.length-1]}
   var lnum=(u.match(/^\s*#?([A-Z]{0,4}-?\d{4,})/)||[])[1]||null,dd=dates(u);
   R.loads.push({pg:page,ln:ln,num:lnum,f:ls[0],t:ls[ls.length-1],pd:dd[0]||null,g:Math.max.apply(null,moneys(l)),mi:mi,dh:null});return}
  if(a==null)return;
  if(/GALLONS?|\bGAL\b|\bGL\b/.test(u)&&/(DIESEL|ULSD|DEF|FUEL|PILOT|LOVE|PETRO|\bTA\b|FLYING)/.test(u)&&!/TOTAL/.test(u)){var g=(u.match(/(\d{1,4}(?:\.\d{1,3})?)\s*(?:GALLONS?|GAL|GL)\b/)||[])[1];var ds3=dates(u);
   R.fuel.push({d:ds3[0]||null,v:(l.match(/^[^\d$]{3,30}/)||[""])[0].trim(),gal:g!=null?Math.round(parseFloat(g)*100):null,c:/\bDEF\b/.test(u)?"def":"diesel",a:a,inv:a,ret:null});return}
  if(/RETAIL/.test(u)&&/FUEL|TOTAL/.test(u)){R.fuelRetail=a;return}
  if(/INVOICE|DISCOUNTED/.test(u)&&/FUEL|TOTAL/.test(u)){R.fuelInvoice=a;return}
  if(/TOTAL\s*DEDUCTION|DEDUCTIONS?\s*TOTAL|TOTAL\s*(EXPENSES|CHARGES)/.test(u)){R.dedTotal=Math.abs(a);if(R.ded.length)R._dtAfter=1;return}
  if(/FUEL/.test(u)&&/DISCOUNT|REBATE|SAVINGS/.test(u)&&!/TOTAL\s*(EXPENSE|DEDUCT)/.test(u)){R.fuelDisc=(R.fuelDisc||0)+Math.abs(a);return} /* decided after: reduces fuel once, never income */
  if(/NET\s*(PAY|AMOUNT|SETTLEMENT)|AMOUNT\s*PAID|(?:TOTAL|AMOUNT)\s*PAYABLE|CHECK\s*AMOUNT|SETTLEMENT\s*AMOUNT|TOTAL\s*PAY(?!MENT)/.test(u)&&!/YTD|YEAR/.test(u)){R.net=a;return}
  if(/YTD|YEAR TO DATE/.test(u))return;
  if(/BALANCE|REMAINING|OWED|OUTSTANDING/.test(u)&&!/NET|SETTLEMENT|CHECK|PAY\b/.test(u)){var bk=/SHOP|REPAIR/.test(u)?"shop":/ESCROW|RESERVE/.test(u)?"escrow":/TRUCK|LEASE|TRACTOR/.test(u)?"truck":/LOAN|ADVANCE|DEBT|CHARGE/.test(u)?"co":null;if(bk){R.bal=R.bal||[];R.bal.push({k:bk,a:Math.abs(a)});return}}
  if((mm=u.match(/^(?:DRIVER|CONTRACTOR|O\/O|OWNER(?:\s*OPERATOR)?|YOUR)\b[^%$\d]{0,20}(\d{1,3}(?:\.\d+)?)\s*%/))&&!/DEDUCT|FEE/.test(u)){if(R.rate==null)R.rate=C.bp(mm[1]);if(R.earn==null)R.earn=Math.abs(a);return} /* "Driver 88%   16,099.26" */
  if((mm=u.match(/^(?:COMPANY|CARRIER)\b[^%$\d]{0,20}(\d{1,3}(?:\.\d+)?)\s*%/))){if(R.fee==null)R.fee=Math.abs(a);return} /* "Company 12%   2,195.35" */
  if(/(DRIVER|CONTRACTOR|YOUR|O\/O)\s*(EARNINGS|GROSS|PAY|SHARE|REVENUE)|EARNINGS\s*\(\s*\d/.test(u)&&R.earn==null){R.earn=a;return}
  if(/COMMISSION|COMPANY\s*(FEE|SHARE|PORTION)|CARRIER\s*(FEE|SHARE)/.test(u)&&R.fee==null){R.fee=Math.abs(a);return}
  if(/GROSS|TOTAL\s*REVENUE|LINE ?HAUL\s*TOTAL|TOTAL\s*LINE ?HAUL|TOTAL\s*LOAD(?!ED)S?\b|LOAD\s*TOTAL|TOTAL\s*FREIGHT/.test(u)&&!/NET|YTD|MILE|DEADHEAD|\bMI\b/.test(u)&&R.gross==null){var gm=moneys(l);if(gm.length>=2&&gm[0]>gm[gm.length-1]){R.gross=gm[0];if(R.earn==null)R.earn=gm[gm.length-1]}else R.gross=a;return} /* "Total  $gross … $driver share" */
  if(/ADVANCE|CASH ADV|COMCHECK/.test(u)&&sec!=="ded"){R.adv=(R.adv||0)+Math.abs(a);return}
  if(/ADVANCE|CASH ADV|COMCHECK/.test(u)&&sec==="ded"&&!/TOTAL/.test(u)){R.ded.push({post:R._dtAfter||undefined,pg:page,ln:ln,c:"co_debt",a:Math.abs(a),v:l.replace(C.MONEY,"").replace(/\s+/g," ").trim().slice(0,48)});return}
  if(/REIMB/.test(u)){R.reimb=(R.reimb||0)+Math.abs(a);return}
  if(/DETENTION|LAYOVER|BONUS|STOP PAY|EXTRA STOP|TARP|OTHER PAY|ACCESSORIAL/.test(u)&&!/DEDUCT/.test(u)){R.other=(R.other||0)+Math.abs(a);return}
  var c=C.guessCat(u);var lab=l.replace(C.MONEY,"").replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g,"").replace(/\s+/g," ").trim().slice(0,48);
  if(c&&!/TOTAL|SUBTOTAL/.test(u)&&a!==0){R.ded.push({post:R._dtAfter||undefined,pg:page,ln:ln,c:c,a:/REFUND|REBATE|CREDIT|RETURN/.test(u)?-Math.abs(a):Math.abs(a),v:lab,raw:(l.match(C.MONEY)||[]).pop()||""});return}
  if(!/TOTAL|SUBTOTAL|BALANCE|PAGE/.test(u))R.unknown.push({pg:page,ln:ln,v:lab||l.slice(0,48),a:Math.abs(a)});
 }
 if(R.netAmt!=null){if(R.net==null)R.net=R.netAmt;else if(R.earn==null&&R.netAmt!==R.net)R.earn=R.netAmt} /* "Net Amount" is earnings when a Payout is printed */
 if(R.dedSubs&&R.dedTotal==null){R.dedTotal=R.dedSubs.reduce(function(a,b){return a+b},0);var sf=R._subF||[];if(sf.length)R.from.dedTotal=sf.length===1?sf[0]:{pg:sf[sf.length-1].pg,ln:sf[sf.length-1].ln,t:sf.map(function(x){return x.t}).join(" + ")}} /* Other + Recurring … = all deductions */
 delete R._secT;delete R._dsec;delete R._subF;
 C.collapseFuel(R);C.fixOcrDollar(R);
 /* lines printed AFTER the deductions total: deductions only if the total needs them; otherwise information (e.g. a debt balance) — never saved as a balance */
 if(R._dtAfter&&R.dedTotal!=null){var pre=R.ded.filter(function(x){return !x.post}),post=R.ded.filter(function(x){return x.post}),D0=R.fuelDisc||0,sp=C.sum(pre,"a"),sa=C.sum(R.ded,"a");
  if(post.length&&(sp===R.dedTotal||sp-D0===R.dedTotal)&&sa!==R.dedTotal&&sa-D0!==R.dedTotal){R.ded=pre;R.info=(R.info||[]).concat(post.map(function(x){return {v:x.v,a:x.a,c:x.c}}))}}
 R.ded.forEach(function(x){delete x.post});delete R._dtAfter;R.numFmt=NF.fmt;
 if(R.gross==null&&R.loads.length)R.gross=C.sum(R.loads,"g");
 if(R.fuelInvoice!=null){var fd=R.ded.filter(function(x){return x.c==="diesel"});if(!fd.length)R.ded.push({c:"diesel",a:R.fuelInvoice,v:"Fuel (invoice)"})}
 if(R.adv){var advLine=R.ded.filter(function(d){return /ADVANCE|COMCHECK|CASH ADV/i.test(d.v)&&d.a===R.adv})[0];if(advLine){advLine.c="co_debt";R.advInDed=true}}
 if(R.fuelDisc){var s0=C.sum(R.ded,"a");var known=R.dedTotal!=null||(R.net!=null&&R.earn!=null),withD=R.dedTotal!=null?s0-R.fuelDisc===R.dedTotal:known?R.earn-(s0-R.fuelDisc)===R.net:true;
  if(withD)R.ded.push({c:"diesel",a:-R.fuelDisc,v:"Fuel discount",disc:true,check:!known}); /* the discount lowers the fuel cost (one time); unverified → user checks */
  else R.fuelDiscInfo=R.fuelDisc} /* already inside the fuel price → info only, not counted again */
 if(!R.p0&&R.week){var yr=(U.match(/\b(20\d{2})\b/)||[])[1];if(yr){var j4=Date.UTC(+yr,0,4),dw=(new Date(j4).getUTCDay()+6)%7,mon=j4-dw*864e5+(R.week-1)*7*864e5;R.p0=C.iso(mon);R.p1=C.iso(mon+6*864e5);R.weekGuess=true}}
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
/* ================= free table reader: rows + columns from word positions (PDF.js items or Tesseract words) ================= */
/* items: [{x0,x1,y,s}] (PDF: y grows upward; OCR: yDown=true). Returns rows of cells [{x0,x1,s}] — a cell is a run of words with small gaps. */
C.cellRows=function(items,yDown){var its=(items||[]).filter(function(i){return i&&i.s&&String(i.s).trim()}).slice().sort(function(a,b){return yDown?a.y-b.y:b.y-a.y}),rows=[];
 its.forEach(function(it){var r=rows[rows.length-1],tol=Math.max(2.5,(it.h||8)*0.45);if(r&&Math.abs(r.y-it.y)<=tol)r.it.push(it);else rows.push({y:it.y,it:[it]})});
 return rows.map(function(r){var a=r.it.sort(function(p,q){return p.x0-q.x0}),cells=[],cur=null,cw=4;
  a.forEach(function(it){var s=String(it.s),w=it.x1-it.x0,t=s.trim();if(t.length&&w>0)cw=Math.max(2,w/Math.max(1,s.length));
   if(cur){var gap=it.x0-cur.x1;if(gap<cw*1.6){cur.s+=(gap>cw*0.3&&!/\s$/.test(cur.s)&&!/^\s/.test(s)?" ":"")+s;cur.x1=Math.max(cur.x1,it.x1);return}}
   if(!t)return;cur={x0:it.x0,x1:it.x1,s:s};cells.push(cur)});
  cells.forEach(function(c){c.s=C.fixLig(c.s.replace(/\s+/g," ").trim())});return {y:r.y,cells:cells.filter(function(c){return c.s})}}).filter(function(r){return r.cells.length})};
var HDR=[["id",/^(LOAD|LOAD\s*(#|NO\.?|NUMBER|ID)|PRO\s*#?|ORDER\s*#?|TRIP\s*#?|REF(ERENCE)?\s*#?|SHIPMENT\s*#?|BOL\s*#?)$/],["from",/^(PU|P\/U|PICK\s*-?UP|ORIGIN|FROM|SHIPPER|PICKUP\s*(CITY|LOCATION))$/],["to",/^(DEL|DELIVERY|DESTINATION|DEST|TO|CONSIGNEE|DROP|DELIVERY\s*(CITY|LOCATION))$/],
 ["date",/DATE$/],["empty",/^(EMPTY|DEADHEAD|DH|EMPTY\s*MI(LES)?|DEADHEAD\s*MI(LES)?|DH\s*MI(LES)?)$/],["miles",/^(LOADED\s*)?(MILES|MILEAGE|MILAGE|MI|LOADED)$/],["note",/^(COMMENTS?|NOTES?|REMARKS?|MEMO)$/],["rate",/^(RATE|%|PERCENT|PCT|DRIVER\s*%|SPLIT)$/],
 ["gross",/^(LOAD\s*GROSS|GROSS|FREIGHT(\s*AMOUNT|\s*CHARGES?)?|LINE\s*HAUL|LINEHAUL|REVENUE|LOAD\s*(PAY|AMOUNT|TOTAL)|RATE\s*CON(FIRMATION)?|INVOICE\s*AMOUNT)$/],
 ["amt",/^(TOTAL\s*AMOUNT|AMOUNT|DRIVER\s*(AMOUNT|PAY|SHARE|GROSS)|EARNINGS|YOUR\s*SHARE|PAY|NET|TOTAL|TOTAL\s*PAY|SETTLEMENT)$/],
 ["desc",/^(DESCRIPTION|DEDUCTION(\s*TYPE)?|TYPE|ITEM|EXPENSE|CHARGE|CHARGES|DETAIL|CATEGORY|CODE)$/],["bal",/^(REMAINING(\s*BALANCE)?|BALANCE(\s*(LEFT|DUE|REMAINING))?|LEFT\s*TO\s*PAY)$/],["sched",/^(SCHEDULE|FREQUENCY|RECURRENCE)$/],["days",/^(OPERATION\s*DAYS|DAYS)$/],["qty",/^(QTY|QUANTITY|GAL(LONS)?)$/],["state",/^(ST|STATE)$/],["city",/^CITY$/]];
function hdrKey(s){var u=String(s).toUpperCase().replace(/[:.]+$/,"").trim().replace(/\s+\d{1,3}(\.\d+)?\s*%$/,"");for(var i=0;i<HDR.length;i++)if(HDR[i][1].test(u))return HDR[i][0];return null}
function colOf(cols,c){var m=(c.x0+c.x1)/2,best=-1,bd=1e9;for(var i=0;i<cols.length;i++){var k=cols[i];if(c.x1>=k.lo&&c.x0<=k.hi){var d=Math.abs(m-(k.x0+k.x1)/2);if(d<bd){bd=d;best=i}}}
 if(best<0)for(i=0;i<cols.length;i++){d=Math.abs(m-(cols[i].x0+cols[i].x1)/2);if(d<bd){bd=d;best=i}}return best}
/* finds header rows (≥3 known column names) and reads the rows under them by column */
C.parseTables=function(rows,fmt){var out={loads:[],ded:[],totals:[],tables:0,detail:0};
 for(var r=0;r<rows.length;r++){var hc=rows[r].cells,keys=hc.map(function(c){return hdrKey(c.s)}),known=keys.filter(Boolean).length,two=known===2&&hc.length===2&&keys.indexOf("desc")>=0&&(keys.indexOf("amt")>=0||keys.indexOf("gross")>=0);if(!two&&(known<3||known<hc.length*0.6))continue; /* also a 2-column "Description | Amount" list */
  /* multi-line header: next row with only header words joins this one */
  var cols=hc.map(function(c,i){return {k:keys[i],x0:c.x0,x1:c.x1,s:c.s}}),skip=0;
  var sub=rows[r+1]&&rows[r+1].cells.every(function(c){return /^(CITY|STATE|ST)$/i.test(c.s)})?rows[r+1].cells:null;
  if(sub){var lab=(rows[r-1]&&rows[r-1].cells||[]).filter(function(c){return /^(FROM|TO|ORIGIN|DESTINATION|PICK\s*UP|DELIVERY)$/i.test(c.s)});var cityN=0;
   sub.forEach(function(c){var side;if(lab.length){var best=null,bd=1e9;lab.forEach(function(L){var d=Math.abs((L.x0+L.x1)/2-(c.x0+c.x1)/2);if(L.x0<=c.x1+40&&d<bd){bd=d;best=L}});
     lab.forEach(function(L){if(L.x0<=c.x1+5&&(!best||L.x0>best.x0&&L.x0<=c.x1+5))best=L});side=best&&/^(TO|DESTINATION|DELIVERY)$/i.test(best.s)?"to":"from"}else side=cityN<2?"from":"to";
    if(/CITY/i.test(c.s))cityN++;cols.push({k:/CITY/i.test(c.s)?side:side+"St",x0:c.x0,x1:c.x1,s:c.s})});
   cols=cols.filter(function(k){return !/^(FROM|TO)$/i.test(k.s)});cols.sort(function(a,b){return a.x0-b.x0});skip=1}cols.forEach(function(k,i){if(k.k==="state"&&cols[i-1]&&(cols[i-1].k==="from"||cols[i-1].k==="to"))k.k=cols[i-1].k+"St"});
  cols.forEach(function(k,i){var prev=cols[i-1],next=cols[i+1];k.lo=prev?(prev.x1+k.x0)/2:-1e9;k.hi=next?(k.x1+next.x0)/2:1e9});
  (function(){var ch=cols.filter(function(k){return /^(CHARGES?|DEDUCTED|THIS\s*(WEEK|PERIOD))$/i.test(k.s)})[0],ds=cols.filter(function(k){return k.k==="desc"}),am=cols.filter(function(k){return k.k==="amt"});
   if(ch&&ds.length>=2&&!cols.some(function(k){return k.k==="from"||k.k==="gross"})){am.forEach(function(k){k.k="orig"});ch.k="amt"}})();
  var title=(rows[r-1]&&rows[r-1].cells.map(function(c){return c.s}).join(" ").toUpperCase())||"",ks={};cols.forEach(function(k){if(k.k)ks[k.k]=1});
  var isDetail=/TRANSACTION|DETAIL|PURCHASES|FUEL\s*CARD/.test(title)||ks.qty&&ks.state&&!ks.from,isLoads=(ks.from&&ks.to)||(ks.id&&(ks.gross||ks.miles)&&!ks.desc),isDed=!isLoads&&ks.desc&&(ks.amt||ks.gross);
  if(!isLoads&&!isDed&&!isDetail)continue;out.tables++;hc.forEach(function(c){var m=String(c.s).match(/AMOUNT\s+(\d{1,3}(?:\.\d+)?)\s*%$/i);if(m&&isLoads&&out.rate==null)out.rate={bp:C.bp(m[1]),t:c.s}});if(isDetail)out.detail++;var miss=0;
  for(var j=r+1+skip;j<rows.length;j++){var rc=rows[j].cells,txt=rc.map(function(c){return c.s}).join(" "),U=txt.toUpperCase();
   if(/^\[\[PAGE/.test(txt))continue;if(rc.length>=3&&rc.filter(function(c){return hdrKey(c.s)}).length>=3)break; /* next header */
   var row={},rcell={};rc.forEach(function(c){var i=colOf(cols,c);if(i<0)return;var k=cols[i].k||("c"+i);row[k]=row[k]?row[k]+" "+c.s:c.s;(rcell[k]=rcell[k]||[]).push(c.s)});
   var lastC=function(k){var a=rcell[k];return a&&a.length?a[a.length-1]:null};
   if(/^(SUB)?TOTALS?\b|^TOTAL\s*:/.test(U)){var ms=rc.map(function(c){return C.cents(c.s)}).filter(function(v){return v!=null});out.totals.push({type:isLoads?"loads":isDed?"ded":"detail",row:row,ms:ms});break}
   if(isDetail)continue;
   if(isDed&&rc[0]&&C.roleOf(rc[0].s).some(function(x){return /^(gross|earn|net|ded|fee)$/.test(x.role)}))break; /* the summary begins: the list has ended */
   var amtS=lastC("amt")||lastC("gross"),am=amtS!=null?C.cents(amtS):null;
   if(isLoads){if(row.gross==null&&row.amt==null&&row.rate!=null&&/\d[.,]\d{2}(?!\d)/.test(row.rate)){row.gross=row.rate;rcell.gross=rcell.rate;row.rate=null}
    var g=row.gross!=null?C.cents(lastC("gross")):null,da=row.amt!=null&&ks.gross?C.cents(lastC("amt")):null;
    if(g==null&&am==null){if(++miss>=2)break;continue}miss=0;
    var lo=function(x){x=String(x||"").replace(/\s+/g," ").trim();var m=x.match(/^(.*?)[,\s]+([A-Z]{2})$/i);return m?m[1].replace(/\b[a-z]/g,function(c){return c.toUpperCase()})+", "+m[2].toUpperCase():x};
    var nm=function(x){x=String(x||"").trim();if(!x)return null;if(/[.,]\d{2}$/.test(x)){var cc=C.cents(x);return cc==null?null:Math.round(cc/100)}var v=x.replace(/[^\d.]/g,"");return v?Math.round(parseFloat(v)):null};
    out.loads.push({num:row.id?String(row.id).split(" ")[0]:null,f:lo(row.from+(row.fromSt?", "+row.fromSt:"")),t:lo(row.to+(row.toSt?", "+row.toSt:"")),pd:row.date?(function(d){var m=String(d).match(/(\d{1,2})([\/\-.])(\d{1,2})[\/\-.](\d{2,4})/);if(!m)return null;var y=+m[4];if(y<100)y+=2000;var mo=+m[1],da=+m[3];if(fmt==="eu"&&m[2]==="."||mo>12){mo=+m[3];da=+m[1]}return y+"-"+C.p2(mo)+"-"+C.p2(da)})(row.date):null,
     g:g!=null?Math.abs(g):Math.abs(am),earn:da!=null?Math.abs(da):null,mi:nm(row.miles)||0,dh:row.empty!=null?nm(row.empty):null,rate:row.rate?C.bp(String(row.rate).replace(/[^\d.]/g,"")):null,tbl:true})}
   else if(isDed){if(am==null){if(++miss>=3)break;continue}miss=0;var dI=cols.map(function(k){return k.k}).indexOf("desc"),d1=cols.filter(function(k){return k.k==="desc"}).length>1?rc.filter(function(c){return colOf(cols,c)===dI}).map(function(c){return c.s}).join(" "):"",lab=String(d1||row.desc||rc[0].s).replace(C.MONEY,"").trim();if(row.c1&&row.desc&&!C.cents(row.c1))lab+=" "+row.c1;
    var u2=(lab+" "+txt).toUpperCase(),cat=C.guessCat(u2),dO={c:cat||null,a:/REFUND|REBATE|CREDIT|RETURN/.test(u2)?-Math.abs(am):Math.abs(am),v:lab.slice(0,48),tbl:true},bv=lastC("bal"),ov=lastC("orig");
    if(bv!=null&&C.cents(bv)!=null)dO.bal=Math.abs(C.cents(bv));if(ov!=null&&C.cents(ov)!=null)dO.orig=Math.abs(C.cents(ov));if(/DEDUCTION|EXPENSE|CHARGE/.test(title)&&title.length<40)dO.grp=rows[r-1].cells.map(function(c){return c.s}).join(" ");out.ded.push(dO)}}
 }
 return out};
C.dropNotes=function(rows){var notes=[],lo=null,out=[];(rows||[]).forEach(function(r){var nc=r.cells.filter(function(c){return /^(COMMENTS?|NOTES?|REMARKS?)$/i.test(c.s)})[0];if(nc){lo=lo==null?nc.x0-3:Math.min(lo,nc.x0-3)}
  if(lo==null){out.push(r);return}var keep=[],drop=[];r.cells.forEach(function(c){((c.x0+c.x1)/2>lo&&!nc?drop:keep).push(c)});
  if(nc)keep=keep.filter(function(c){return c!==nc});
  drop.forEach(function(c){var a=C.cents(c.s);if(a!=null&&/\d/.test(c.s))notes.push({v:(keep[0]&&keep[0].s||"")+" · Comments",a:a,t:c.s})});if(keep.length)out.push({y:r.y,cells:keep})});return {rows:out,notes:notes,found:lo!=null}};
C.kvSplit=function(rows){var ch=false,out=[];(rows||[]).forEach(function(r){var c=r.cells,pairs=[],i=0,ok=c.length>=4&&c.length%2===0;
  while(ok&&i<c.length){var a=c[i].s,b=c[i+1]&&c[i+1].s;if(/[A-Za-z]{2}/.test(a)&&!/\d/.test(a.replace(/#/g,""))&&b!=null&&/\d/.test(b)){pairs.push([c[i],c[i+1]]);i+=2}else ok=false}
  if(ok&&pairs.length>=2){ch=true;pairs.forEach(function(p,k){out.push({y:r.y-k*0.01,cells:[p[0],p[1]]})})}else out.push(r)});return ch?out:null};
C.rowsText=function(rows){return (rows||[]).map(function(r){return r.cells.map(function(c){return c.s}).join("   ")}).join("\n")};
/* unknown lines: if exactly ONE subset of them explains the printed difference, they are deductions (kind unknown → not an expense) */
C.subsetExplain=function(vals,target){if(!vals.length||vals.length>18||!target)return null;var n=vals.length,hit=null,cnt=0;
 for(var m=1;m<(1<<n);m++){var s2=0;for(var i=0;i<n;i++)if(m&(1<<i))s2+=vals[i];if(s2===target){cnt++;hit=m;if(cnt>1)return null}}
 if(!hit)return null;var idx=[];for(i=0;i<n;i++)if(hit&(1<<i))idx.push(i);return idx};
C.resolveUnknown=function(R){var un=(R.unknown||[]).filter(function(u){return u.a>0});if(!un.length)return R;var sum=C.sum(R.ded,"a"),need=null;
 if(R.dedTotal!=null&&R.dedTotal!==sum)need=R.dedTotal-sum;else if(R.dedTotal==null&&R.net!=null){var k=C.stmtCalc(R);if(k.rec.diff)need=-k.rec.diff}
 if(!need||need<0)return R;var pick=C.subsetExplain(un.map(function(u){return u.a}),need);if(!pick)return R;
 pick.forEach(function(i){var u=un[i];R.ded.push({c:"other",a:u.a,v:u.v,pg:u.pg||null,ln:u.ln||null,dk:"adjust",check:true,unclear:true,solved:true})});
 R.unknown=un.filter(function(u,i){return pick.indexOf(i)<0});R.solved=pick.length;return R};
/* combine: the text reader result + the table reader result → candidates; the one whose arithmetic matches the printed totals wins */
C.readAll=function(src){var cands=[],seen={};function add(name,R){if(!R)return;C.resolveUnknown(R);var key=JSON.stringify([R.gross,R.earn,C.sum(R.ded,"a"),R.net,R.loads.map(function(l){return [l.num,l.mi,l.dh,l.g,l.pd]})]);if(seen[key])return;seen[key]=1;R.method=name;R.verdict=C.aiVerdict(R);cands.push(R)}
 (src.texts||[]).forEach(function(t){if(!t||!t.text)return;var A=C.parseStatement(t.text);add(t.name,A);
  if(t.rows&&t.rows.length&&!t.noDict){var DA=C.dictCand(A,t.rows,src.learned);if(DA)add(t.name+"·dict",DA);
   /* pure LAYOUT reading: header fields from the text, trips + deductions only from tables, summary from the dictionary, arithmetic decides */
   var TL=C.parseTables(t.rows,C.numFormat(t.text));if(TL.loads.length||TL.ded.length){var L0=JSON.parse(JSON.stringify(A));L0.gross=L0.earn=L0.fee=L0.net=L0.dedTotal=null;L0.adv=L0.reimb=L0.other=null;L0.fuel=[];L0.unknown=[];L0.from={};
    if(TL.loads.length)L0.loads=TL.loads;L0.ded=TL.ded.map(function(d){var o={c:d.c||"other",a:Math.abs(d.a),v:d.v,tbl:true};if(!d.c)o.check=true;["bal","orig","grp"].forEach(function(k){if(d[k]!=null)o[k]=d[k]});return o});
    var LD=C.dictCand(L0,t.rows,src.learned);if(LD)add(t.name+"·layout",LD)}}
  if(t.rows&&t.rows.length){var T=C.parseTables(t.rows,C.numFormat(t.text));if(T.tables){var B=JSON.parse(JSON.stringify(A)),changed=false;
   var miDiff=C.sum(T.loads,"mi")&&T.loads.some(function(l,i){return !B.loads[i]||B.loads[i].mi!==l.mi||(l.dh!=null&&B.loads[i].dh!==l.dh)});
   if(T.loads.length&&(B.loads.length!==T.loads.length||C.sum(B.loads,"g")!==C.sum(T.loads,"g")||miDiff||B.earn==null&&T.loads.every(function(l){return l.earn!=null}))){B.loads=T.loads;changed=true;if(B.gross==null||B.gross===C.sum(A.loads,"g"))B.gross=C.sum(T.loads,"g");B.grossLoads=C.sum(T.loads,"g");
    if(B.earn==null&&T.loads.every(function(l){return l.earn!=null}))B.earn=C.sum(T.loads,"earn");if(B.rate==null){var rs=T.loads.map(function(l){return l.rate}).filter(Boolean);if(rs.length&&rs.every(function(x){return x===rs[0]}))B.rate=rs[0]}}
   var tt=T.totals.filter(function(x){return x.type==="ded"})[0];if(tt&&B.dedTotal==null&&tt.ms.length)B.dedTotal=Math.abs(tt.ms[tt.ms.length-1]);
   var lt=T.totals.filter(function(x){return x.type==="loads"})[0];if(lt&&C.sum(B.loads,"mi")&&lt.ms.indexOf(C.sum(B.loads,"mi")*100)>=0){B.from=B.from||{};B.from.miles={pg:1,ln:0,t:"Σ "+C.sum(B.loads,"mi")+" mi = table total row "+(C.sum(B.loads,"mi")).toLocaleString("en-US")+".00 ✓"};changed=true}
   if(lt&&lt.ms.length>=2&&B.earn==null){var lg=C.sum(B.loads,"g"),le=C.sum(B.loads,"earn");if(lt.ms.indexOf(lg)>=0)B.gross=lg;if(le&&lt.ms.indexOf(le)>=0){B.earn=le;changed=true}}
   if(T.ded.length){var known=T.ded.filter(function(d){return d.c}),unk=T.ded.filter(function(d){return !d.c});
    if(C.sum(T.ded,"a")!==C.sum(A.ded,"a")||T.ded.length!==A.ded.length){var tUsed=T.ded.map(function(){return false}),lbU=function(v){return String(v||"").toUpperCase().replace(/[^A-Z0-9 ]+/g," ").replace(/\s+/g," ").trim()},rest=A.ded.filter(function(x){if(!x.a)return false;var i,lx=lbU(x.v);
     for(i=0;i<T.ded.length;i++)if(!tUsed[i]&&T.ded[i].a===x.a){tUsed[i]=true;return false}            /* same amount → the same line */
     for(i=0;i<T.ded.length;i++){var lt=lbU(T.ded[i].v);if(!tUsed[i]&&lt.length>=3&&(lx===lt||lx.indexOf(lt+" ")===0)){tUsed[i]=true;return false}} /* same name, other column's number (e.g. remaining balance) → the same line */
     return true});
    B.ded=known.map(function(d){var o={c:d.c,a:d.a,v:d.v,tbl:true};if(d.bal!=null)o.bal=d.bal;if(d.orig!=null)o.orig=d.orig;if(d.grp)o.grp=d.grp;return o}).concat(rest);B.unknown=unk.map(function(d){return {a:Math.abs(d.a),v:d.v}});C.collapseFuel(B);changed=true}}
   if(T.rate&&B.rate==null){B.rate=T.rate.bp;B.from=B.from||{};B.from.rate={pg:1,ln:0,t:T.rate.t+" (table header)"};changed=true}
   if(changed)add(t.name+"+table",B)}}
  /* summary written as several "label value" pairs on one line → read again pair by pair */
  if(t.rows&&t.rows.length&&!t.noKV){var KV=C.kvSplit(t.rows);if(KV){var R3=C.readAll({texts:[{name:t.name+"·kv",text:C.rowsText(KV),rows:KV,noKV:true,noDict:true}],learned:src.learned});(R3.cands2||[R3]).forEach(function(x){add(x.method,x)})}}
  /* a Comments/Notes column: its numbers are notes, not money of the statement → read again without them */
  if(t.rows&&t.rows.length&&!t.noNotes){var DN=C.dropNotes(t.rows);if(DN.found&&DN.notes.length){var R2=C.readAll({texts:[{name:t.name+"−comments",text:C.rowsText(DN.rows),rows:DN.rows,noNotes:true,noDict:true}],learned:src.learned});
   (R2.cands2||[R2]).forEach(function(x){x.info=(x.info||[]).concat(DN.notes.filter(function(n){return n.a}));add(x.method,x)})}}});
 /* the dictionary reader also on top of every table/text reading (it only re-assigns summary numbers; arithmetic decides) */
 var rows0=null;(src.texts||[]).forEach(function(t){if(!rows0&&t.rows&&t.rows.length&&!t.noDict)rows0=t.rows});
 if(rows0)cands.slice().forEach(function(c){if(/·dict/.test(c.method))return;var D=C.dictCand(c,rows0,src.learned);if(D){var m=c.method;add(m+"·dict",D)}});
 cands.sort(function(a,b){function sc(R){var v=R.verdict;return (v.ok?100:0)+(v.status==="full"?20:v.status==="partial"?10:0)-v.why.length*5-(R.unknown||[]).length-(R.solved||0)*2+(R.loads.length?3:0)+R.loads.filter(function(l){return l.num&&l.mi}).length*0.5}return sc(b)-sc(a)});
 var best=cands[0]||C.parseStatement("");try{Object.defineProperty(best,"cands2",{value:cands,enumerable:false,configurable:true,writable:true})}catch(e){best.cands2=cands} /* not saved / not serialized */
 /* commission not printed: derived from printed numbers, and checked against the printed percentage */
 if(best.from&&!best.from.fee&&best.gross>0&&best.earn!=null){var dv=best.gross-best.earn,okp=best.rate!=null&&Math.abs(C.pct(best.gross,best.rate)-best.earn)<=1;
  best.from.fee={pg:(best.from.earn||{}).pg||1,ln:(best.from.earn||{}).ln||0,t:"= Gross "+C.fmt(best.gross)+" − Driver "+C.fmt(best.earn)+" = "+C.fmt(dv)+(best.rate!=null?" · "+(best.rate/100)+"% × Gross = "+C.fmt(C.pct(best.gross,best.rate))+(okp?" ✓":" ≠"):"")}}best.cands=cands.map(function(c){return {m:c.method,ok:c.verdict.ok,st:c.verdict.status,net:C.stmtCalc(c).net,why:c.verdict.why}});
 C.finishRead(best,src);if(rows0)best.kvAll=C.kvPairs(rows0,null,true).filter(function(p){return !p.role}).slice(0,80).map(function(p){return {lbl:p.lbl,v:p.v}});best.agree=cands.filter(function(c){return c.verdict.ok&&C.stmtCalc(c).net===C.stmtCalc(best).net}).length;return best};
/* ===== universal summary reader: field DICTIONARY (data, not code) + token TYPES + POSITION + ARITHMETIC =====
   A new company wording = one more synonym in C.FIELDS (or learned from a confirmed statement), never a new reading rule. */
C.FIELDS=[
 /* role, kind, label pattern (whole label, upper-case, ':' '#' stripped) */
 ["gross","money",/^(TOTAL\s+)?(TRIP\s+|TRIPS\s+|LOAD\s+|LOADS\s+|FREIGHT\s+|LINE\s*HAUL\s+)?(GROSS|REVENUE)(\s+(AMOUNT|TOTAL|REVENUE|INCOME))?$|^(TOTAL\s+)?LINE\s*HAUL(\s+(TOTAL|AMOUNT))?$|^TOTAL\s+(LOADS?|FREIGHT|TRIPS?)(\s+(PAY|AMOUNT))?$|^GROSS\s+(LOAD|FREIGHT|TRIP)\s+(PAY|AMOUNT)$/],
 ["gross","money",/^GROSS\s+PAY$/,"earn"],
 ["earn","money",/^(TOTAL\s+)?(DRIVER|CONTRACTOR|OWNER|O\s*\/?\s*O|OPERATOR|YOUR)?\s*(EARNINGS?|SHARE|COMPENSATION|PORTION)$|^(DRIVER|CONTRACTOR|OWNER\s+OPERATOR|O\s*\/\s*O)\s+(PAY|GROSS|REVENUE|AMOUNT)$|^REVENUE\s+SHARE$/],
 ["earn","money",/^NET\s+(REVENUE|AMOUNT|EARNINGS?)$/,"net"],
 ["fee","money",/^(TOTAL\s+)?(COMMISSION|COMPANY\s+(FEE|SHARE|PORTION|CUT|COMMISSION)|CARRIER\s+(FEE|SHARE|PORTION|COMMISSION)|SERVICE\s+FEE\s+TOTAL)$/],
 ["ded","money",/^(TOTAL\s+)?(DEDUCTIONS?|DEDUCTS|CHARGES|WITHHOLDINGS?|EXPENSES|CHARGEBACKS?)(\s+(TOTAL|AMOUNT))?$|^LESS\s+(TOTAL\s+)?DEDUCTIONS$/],
 ["net","money",/^(TOTAL\s+)?(NET\s+(PAY|PAYMENT|SETTLEMENT|CHECK|DUE|PAID|TO\s+DRIVER)|PAYOUT|SETTLEMENT(\s+(AMOUNT|TOTAL|PAY|NET))?|CHECK\s+(AMOUNT|TOTAL)|AMOUNT\s+(PAID|DUE|PAYABLE)(\s+TO\s+DRIVER)?|PAYABLE|PAY\s+AMOUNT|DIRECT\s+DEPOSIT(\s+AMOUNT)?|DEPOSIT\s+AMOUNT|BALANCE\s+DUE(\s+(DRIVER|TO\s+DRIVER))?)$/],
 ["net","money",/^(TOTAL\s+PAY|NET|NET\s+TOTAL)$/,"earn"],
 ["rate","pct",/^(DRIVER\s+|CONTRACTOR\s+|O\s*\/?\s*O\s+)?(PERCENT(AGE)?|PCT|SPLIT|RATE\s*%?|%)$/],
 ["miles","miles",/^(TOTAL\s+)?(MILES|MILEAGE)$/],["loaded","miles",/^(TOTAL\s+)?(LOADED|LDD)(\s+MI(LES)?)?$/],["empty","miles",/^(TOTAL\s+)?(DEADHEAD|EMPTY|DHD|DH)(\s+MI(LES)?)?$/],
 ["num","id",/^(SETTLEMENT|STATEMENT|STMT|PAYROLL|PAY\s+STUB|CHECK)\s*(#|NO\.?|NUMBER|ID)?$/],["trips","count",/^(TOTAL\s+)?(TRIPS|LOADS|NUMBER\s+OF\s+(TRIPS|LOADS))$/]];
C.SKIPLBL=/\b(YTD|YEAR|PREVIOUS|PRIOR|LAST\s+(WEEK|PERIOD)|TO\s+DATE|ESCROW\s+BALANCE|LIMIT)\b/;
C.lblNorm=function(s){return String(s||"").toUpperCase().replace(/\(.*?\)/g," ").replace(/[:#*]+/g," ").replace(/[^A-Z0-9%\/&' ]+/g," ").replace(/\s+/g," ").trim()};
/* what kind of token a cell is: money / miles / pct / date / count / id / text */
C.tok=function(s){var t=String(s||"").trim(),u=t.toUpperCase(),m;if(!t)return null;
 if((m=u.match(/^\(?-?\$?\s*([\d,]+(?:\.\d+)?)\s*(MI|MILES|MILE)\.?\)?$/)))return {t:"miles",v:Math.round(parseFloat(m[1].replace(/,/g,""))*100)/100};
 if((m=u.match(/^([\d.]+)\s*%$/)))return {t:"pct",v:parseFloat(m[1])};
 if(/^\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}$|^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s+\d{1,2}/.test(u)||/^\d{4}-\d{2}-\d{2}$/.test(u))return {t:"date",s:t};
 if((m=t.match(/^(-|\()?\s*\$\s*(-)?\s*([\d,]*\d(?:\.\d{1,2})?)\s*\)?$|^(-|\()?\s*([\d]{1,3}(?:,\d{3})*\.\d{2}|\d+\.\d{2})\s*\)?$/))){var raw=(m[3]||m[5]||"").replace(/,/g,""),neg=!!(m[1]||m[2]||m[4]);var c=Math.round(parseFloat(raw)*100);if(isFinite(c))return {t:"money",v:neg?-c:c,dollar:/\$/.test(t)}}
 if(/^\d{1,4}$/.test(t))return {t:"count",v:+t,s:t};
 if(/\d/.test(t)&&t.length<=24)return {t:"id",s:t};
 return {t:"text",s:t}};
C.roleOf=function(lbl,learned){var u=C.lblNorm(lbl),out=[];if(!u||C.SKIPLBL.test(u))return out;
 if(learned&&learned[u])out.push({role:learned[u],kind:learned[u]==="rate"?"pct":/miles|loaded|empty/.test(learned[u])?"miles":"money",learned:true});
 C.FIELDS.forEach(function(f){if(f[2].test(u)){if(!out.some(function(o){return o.role===f[0]}))out.push({role:f[0],kind:f[1]});if(f[3]&&!out.some(function(o){return o.role===f[3]}))out.push({role:f[3],kind:f[1],alt:true})}});return out};
/* label → value pairs by position: value to the right on the same line, "Label: value" in one cell, or the value right under a label */
C.kvPairs=function(rows,learned,all){var out=[];(rows||[]).forEach(function(r,ri){var cs=r.cells,pg=r.y<0?Math.floor(-r.y/5000)+1:1,line=cs.map(function(c){return c.s}).join("  ");
  function push(lab,valS,cell){var roles=C.roleOf(lab,learned),tk=C.tok(valS);if(!tk)return;if(!roles.length){if(all&&tk.t==="money"&&!C.SKIPLBL.test(C.lblNorm(lab)))out.push({role:null,lab:lab,lbl:C.lblNorm(lab),v:tk.v,pg:pg,t:line.slice(0,120)});return}
   roles.forEach(function(ro){var ok=ro.kind==="money"?tk.t==="money":ro.kind==="pct"?(tk.t==="pct"||tk.t==="count"&&tk.v<=100):ro.kind==="miles"?(tk.t==="miles"||tk.t==="money"&&!tk.dollar||tk.t==="count"):ro.kind==="id"?(tk.t==="count"||tk.t==="id"):ro.kind==="count"?tk.t==="count":false;
    if(ok)out.push({role:ro.role,alt:!!ro.alt,learned:!!ro.learned,lab:lab,lbl:C.lblNorm(lab),v:ro.kind==="money"?tk.v:ro.kind==="pct"?C.bp(String(tk.v)):ro.kind==="miles"?tk.v:(tk.s||String(tk.v)),pg:pg,row:ri,t:line.slice(0,120)})})}
  cs.forEach(function(c,i){var s2=c.s,m;
   if((m=s2.match(/^(.*?[A-Za-z].*?)\s*[:=]\s*(.+)$/))&&!/\d/.test(m[1])){push(m[1],m[2],c);return}
   if(/[A-Za-z]{2}/.test(s2)&&!/\d{2}/.test(s2.replace(/#/g,""))){var nx=cs[i+1];if(nx&&/\d/.test(nx.s)&&!/[A-Za-z]{3}/.test(nx.s.replace(/\b(mi|miles|USD)\b/i,""))){push(s2,nx.s,nx);return}
    /* header cell → the value right under it (summary as a small table) */
    var below=rows[ri+1];if(below&&cs.length>=2&&cs.filter(function(x){return hdrKey(x.s)}).length<2&&cs.every(function(x){return /[A-Za-z]{2}/.test(x.s)&&!/\d/.test(x.s)})){below.cells.forEach(function(b){if(b.x1>=c.x0-4&&b.x0<=c.x1+4&&/\d/.test(b.s)&&!/[A-Za-z]{3}/.test(b.s))push(s2,b.s,b)})}}})});
 return out};
/* chooses which printed number is which, by the arithmetic the statement itself satisfies (no single formula forced) */
C.solveSummary=function(pairs,A){var P={},lS0=C.sum(A.loads||[],"g");if(lS0>0&&!pairs.some(function(p){return p.role==="gross"&&p.v===lS0}))pairs=pairs.concat([{role:"gross",v:lS0,lab:"Σ trips",lbl:"Σ TRIPS",row:-1,pg:1,t:"Σ "+(A.loads||[]).length+" trips",derived:true}]); /* no printed Gross: the trips table total, checked by the rest */["gross","earn","fee","ded","net"].forEach(function(k){var seen={};P[k]=[null].concat(pairs.filter(function(p){if(p.role!==k||seen[p.v+"|"+p.lbl])return false;seen[p.v+"|"+p.lbl]=1;return true}))});
 var dSum=C.sum(A.ded||[],"a"),lSum=C.sum(A.loads||[],"g"),adj=(A.reimb||0)+(A.other||0)-(A.advInDed?0:(A.adv||0)),rate=(pairs.filter(function(p){return p.role==="rate"})[0]||{}).v||A.rate||null,best=null;
 function same(a,b){return a&&b&&a.row===b.row&&a.lbl===b.lbl}
 P.gross.forEach(function(g){P.earn.forEach(function(e){if(same(g,e))return;P.fee.forEach(function(f){P.ded.forEach(function(d){P.net.forEach(function(n){
  var used=[g,e,f,d,n].filter(Boolean);for(var i=0;i<used.length;i++)for(var j=i+1;j<used.length;j++)if(same(used[i],used[j]))return;
  var G=g&&g.v,E=e?e.v:(G!=null&&f?G-f.v:G!=null&&rate!=null?C.pct(G,rate):null),D=d?Math.abs(d.v):dSum,sc=0,fx=[],sub=null;
  if(g&&e&&f){if(G-f.v===e.v){sc+=3;fx.push(g.lab+" − "+f.lab+" = "+e.lab)}else sc-=3}
  if(g&&e&&rate!=null&&!f){if(Math.abs(C.pct(G,rate)-e.v)<=1){sc+=2;fx.push((rate/100)+"% × "+g.lab+" = "+e.lab)}else if(Math.abs(C.pct(G,rate)-e.v)>100)sc-=1}
  if(n&&E!=null){if(E-D+adj===n.v){sc+=5;fx.push((e?e.lab:"Driver")+" − "+(d?d.lab:"Σ deductions")+(adj?" ± adj.":"")+" = "+n.lab)}else sc-=4}
  if(d&&dSum){if(Math.abs(d.v)===dSum){sc+=2;fx.push("Σ "+(A.ded||[]).length+" lines = "+d.lab)}
   else{var pos=(A.ded||[]).map(function(x,i){return {i:i,a:x.a}}).filter(function(x){return x.a>0}),pk=C.subsetExplain(pos.map(function(x){return x.a}),Math.abs(d.v));
    if(pk){sub=pk.map(function(k){return pos[k].i});sc+=1.5;fx.push("Σ "+sub.length+" lines = "+d.lab)}else sc-=1}} /* only ONE set of lines gives the printed total → those are the deductions */
  if(g&&lSum&&!g.derived){if(G===lSum){sc+=2;fx.push("Σ "+(A.loads||[]).length+" trips = "+g.lab)}else sc-=1}
  if(g&&g.derived&&!fx.some(function(x){return x.indexOf(g.lab)>=0}))sc-=2; /* a Gross not printed must be confirmed by the % or the fee */
  used.forEach(function(u){if(u.alt)sc-=0.5;if(u.learned)sc+=0.5;if(u.derived)sc-=0.3});sc+=used.length*0.1;
  if(!best||sc>best.sc)best={sc:sc,g:g,e:e,f:f,d:d,n:n,fx:fx,sub:sub}})})})})});
 return best};
C.dictCand=function(A,rows,learned){var pairs=C.kvPairs(rows,learned);if(!pairs.length)return null;var sol=C.solveSummary(pairs,A);if(!sol||!(sol.g||sol.n))return null;
 var B=JSON.parse(JSON.stringify(A));B.from=B.from||{};function src(p){return {pg:p.pg,ln:0,t:p.t}}
 if(sol.g){B.gross=sol.g.v;B.from.gross=src(sol.g)}if(sol.e){B.earn=sol.e.v;B.from.earn=src(sol.e)}if(sol.f){B.fee=Math.abs(sol.f.v);B.from.fee=src(sol.f)}if(sol.d){B.dedTotal=Math.abs(sol.d.v);B.from.dedTotal=src(sol.d)}if(sol.n){B.net=sol.n.v;B.from.net=src(sol.n)}
 pairs.forEach(function(p){if(p.role==="rate"&&B.rate==null){B.rate=p.v;B.from.rate={pg:p.pg,ln:0,t:p.t}}if(p.role==="num"&&!B.num)B.num=String(p.v);
  if(p.role==="loaded"&&B.docLoaded==null)B.docLoaded=p.v;if(p.role==="empty"&&B.docEmpty==null)B.docEmpty=p.v;if(p.role==="miles"&&B.docMiles==null)B.docMiles=p.v});
 if(sol.sub){var keep=sol.sub,out2=[];B.ded=B.ded.filter(function(x,i){if(keep.indexOf(i)>=0)return true;out2.push(x);return false});
  B.info=(B.info||[]).concat(out2.map(function(x){return {v:x.v,a:x.a,pg:x.pg||null,ln:x.ln||null,notDed:true}}))} /* lines outside the printed total: shown, not counted */
 B.info=(B.info||[]).filter(function(x){return !x.notDed||[sol.g,sol.e,sol.f,sol.d,sol.n].filter(Boolean).map(function(p){return Math.abs(p.v)}).indexOf(Math.abs(x.a))<0}); /* a summary number caught as a table row */
 /* a leftover line made only of the summary numbers just explained is not an unknown deduction */
 var expl=[sol.g,sol.e,sol.f,sol.d,sol.n].filter(Boolean).map(function(p){return Math.abs(p.v)});
 B.unknown=(B.unknown||[]).filter(function(u){var ms=(String(u.v).match(/\(?-?\$?\s*[\d,]+\.\d{2}\)?/g)||[]).map(function(x){return Math.abs(C.tok(x)?C.tok(x).v||0:0)});return !(ms.length&&ms.every(function(x){return expl.indexOf(x)>=0}))});
 B.formula=sol.fx;B.pairs=pairs.map(function(p){return {role:p.role,lbl:p.lbl,v:p.v}});return B};
/* a printed label the dictionary did not know, whose number the driver confirmed as Gross / Driver pay / Deductions / Net → remembered (this device) */
C.learnLabels=function(S,r,st){var Lr=S.learned=S.learned||{},n=0,F={gross:["gross",st.gross],earn:["earn",st.earn],dedTotal:["ded",st.dedTotal],net:["net",st.net]};
 Object.keys(F).forEach(function(k){var role=F[k][0],v=F[k][1];if(v==null)return;var ls={};(r.kvAll||[]).forEach(function(p){if(Math.abs(p.v)===Math.abs(v))ls[p.lbl]=1});var lb=Object.keys(ls);
  if(lb.length===1&&lb[0].length>=3&&!C.roleOf(lb[0]).some(function(x){return x.role===role})&&Lr[lb[0]]!==role){Lr[lb[0]]=role;n++}});return n};
/* re-check: what differs between a saved statement and a new reading of the same PDF */
C.stDiff=function(a,b){var ka=C.stmtCalc(a),kb=C.stmtCalc(b),out=[];function ad(k,x,y){if(x!==y&&!(x==null&&y==null))out.push([k,x,y])}
 ad("company",a.company||null,b.company||null);ad("num",a.num||null,b.num||null);ad("p0",a.p0||null,b.p0||null);ad("p1",a.p1||null,b.p1||null);ad("gross",ka.gross,kb.gross);ad("earn",ka.earn,kb.earn);ad("ded",ka.ded,kb.ded);ad("net",ka.net,kb.net);
 ad("loads",(a.loads||[]).length,(b.loads||[]).length);ad("miles",a.miles||null,b.miles||null);ad("status",ka.rec.status,kb.rec.status);ad("dedLines",(a.ded||[]).length,(b.ded||[]).length);return out};
/* after the best reading is chosen: advance repayments, printed remaining balances, per-trip miles/dates from the trips table */
C.finishRead=function(R,src){var rows=null;(src.texts||[]).forEach(function(t){if(!rows&&t.rows&&t.rows.length)rows=t.rows});
 (R.ded||[]).forEach(function(x){if(x.c==="co_debt"&&!x.dk&&/CASH\s*ADV|\bADVANCE\b|COMCHECK|EFS\s*CHECK/i.test(x.v||""))x.dk="advance"});
 var dl=(R.ded||[]).filter(function(x){return x.c==="co_debt"});
 if(dl.length&&!(R.bal||[]).some(function(b){return b.k==="co"})&&dl.every(function(x){return x.bal!=null})){(R.bal=R.bal||[]).push({k:"co",a:C.sum(dl,"bal"),t:"Remaining Balance"})} /* printed "Remaining Balance" of the debt lines */
 if(rows&&R.loads&&R.loads.length){var tb=C.tripBlocks(rows,R.loads.length);if(tb){R.loads.forEach(function(l,i){var b=tb.trips[i];if(b.mi!=null){l.mi=b.mi;l.dh=b.dh;l.miSrc="doc"}if(b.pd&&!l.pd)l.pd=b.pd;if(b.dd&&!l.dd)l.dd=b.dd});R.tripsChk=tb.chk}}
 return R};
/* trips table where every trip spans several lines: "1,021.06 mi / DHD: 0.59 / mi/LDD: 1,020.47 mi" and pickup / delivery dates under the cities.
   Used only when the number of blocks = the number of trips and (when printed) Σ miles = the table's total row. */
C.tripBlocks=function(rows,n){var MON={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};
 function num(x){return Math.round(parseFloat(String(x).replace(/,/g,""))*100)/100}
 function dt(x){var m=String(x).toUpperCase().match(/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/);if(m)return m[3]+"-"+C.p2(MON[m[1]])+"-"+C.p2(+m[2]);
  m=String(x).match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);if(m){var y=+m[3];if(y<100)y+=2000;if(+m[1]<=12)return y+"-"+C.p2(+m[1])+"-"+C.p2(+m[2])}return null}
 for(var r=0;r<rows.length;r++){var hc=rows[r].cells,keys=hc.map(function(c){return hdrKey(c.s)});if(keys.indexOf("from")<0||keys.indexOf("to")<0||keys.indexOf("miles")<0)continue;
  var cols=hc.map(function(c,i){return {k:keys[i],x0:c.x0,x1:c.x1}});cols.forEach(function(k,i){var p=cols[i-1],q=cols[i+1];k.lo=p?(p.x1+k.x0)/2:-1e9;k.hi=q?(k.x1+q.x0)/2:1e9});
  var mI=keys.indexOf("miles"),fI=keys.indexOf("from"),tI=keys.indexOf("to"),seq=[],dF=[],dT=[],tot=null;
  for(var j=r+1;j<rows.length;j++){var rc=rows[j].cells,tx=rc.map(function(c){return c.s}).join(" ");if(/^\[\[PAGE/.test(tx))continue;
   if(rc.filter(function(c){return hdrKey(c.s)}).length>=3)break;
   if(/^(SUB)?TOTALS?\b/i.test(tx)){rc.forEach(function(c){if(colOf(cols,c)===mI){var m=c.s.match(/([\d,]+(?:\.\d+)?)/);if(m)tot=num(m[1])}});break}
   rc.forEach(function(c){var i=colOf(cols,c),d;if(i===mI)seq.push(c.s);else if(i===fI&&(d=dt(c.s)))dF.push(d);else if(i===tI&&(d=dt(c.s)))dT.push(d)})}
  var g=[],cur=null,wantL=false,bad=false;
  seq.forEach(function(s){var u=s.toUpperCase().trim(),m;
   if((m=u.match(/^(?:DHD|DH|DEADHEAD|EMPTY)\s*:?\s*([\d,]+(?:\.\d+)?)/))){if(!cur){cur={};g.push(cur)}cur.dh=num(m[1]);return}
   if(/^(?:MI\s*\/\s*)?(?:LDD|LOADED)\s*:?$/.test(u)){wantL=true;return}
   if((m=u.match(/^(?:(?:MI\s*\/\s*)?(LDD|LOADED)\s*:?\s*)?([\d,]+(?:\.\d+)?)\s*(?:MI|MILES)?$/))){var v=num(m[2]);if(wantL||m[1]){if(!cur){bad=true;return}cur.ld=v;wantL=false}else{cur={tot:v};g.push(cur)}return}});
  if(bad||g.length!==n||!g.every(function(b){return b.dh!=null||b.ld!=null}))return null;var sumT=0,ok=true; /* one number per trip → the normal table reader already has it */
  var trips=g.map(function(b){var t=b.tot,dh=b.dh!=null?b.dh:null,ld=b.ld!=null?b.ld:null;
   if(t==null&&dh!=null&&ld!=null)t=Math.round((dh+ld)*100)/100;if(t==null){ok=false;return {}}
   if(dh!=null&&ld!=null&&Math.abs(dh+ld-t)>0.021)ok=false;if(ld==null)ld=dh!=null?Math.round((t-dh)*100)/100:t;sumT+=t;return {mi:ld,dh:dh!=null?dh:0,tot:t}});
  if(!ok)return null;if(tot!=null&&Math.abs(sumT-tot)>0.021)return null;
  if(dF.length===n)trips.forEach(function(t,i){t.pd=dF[i]});if(dT.length===n)trips.forEach(function(t,i){t.dd=dT[i]});
  return {trips:trips,chk:tot!=null?{sum:Math.round(sumT*100)/100,printed:tot}:null}}
 return null};
/* what to do with a reading: save (everything printed matches), confirm (nothing contradicts, but some totals are not printed), warn (cannot trust) */
C.decide=function(R){var v=C.aiVerdict(R);if(v.ok&&v.status==="full"&&!(R.unknown||[]).length)return {act:"save",v:v};if(v.ok)return {act:"confirm",v:v};return {act:"warn",v:v}};
/* ---------- AI reading (server function → JSON) → the same statement shape as the rule reader ---------- */
C.AIKIND={expense:null,debt:"debt",advance:"advance",deposit:"deposit",holdback:"holdback",adjust:"adjust",loan:"loan",unclear:"adjust"};
function aiC(n){return typeof n==="number"&&isFinite(n)?Math.round(n*100):null}
function aiD(s){return typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)?s:null}
function aiS(s,n){return typeof s==="string"&&s.trim()?s.trim().slice(0,n||60):null}
C.fromAI=function(j){if(!j||typeof j!=="object"||!Array.isArray(j.loads)||!Array.isArray(j.deductions))return null;var keys={};C.CATS.forEach(function(c){keys[c[0]]=1});
 var R={src:"ai",company:aiS(j.company),driver:aiS(j.driver),unit:aiS(j.unit,20),num:aiS(j.statement_number,30),d:aiD(j.statement_date),p0:aiD(j.period_start),p1:aiD(j.period_end),
  gross:aiC(j.gross_total),earn:aiC(j.driver_earnings),fee:aiC(j.commission_amount),rate:typeof j.driver_percent==="number"&&j.driver_percent>0&&j.driver_percent<=100?Math.round(j.driver_percent*100):null,
  net:aiC(j.net_pay),dedTotal:j.deductions_total!=null?Math.abs(aiC(j.deductions_total)):null,adv:null,reimb:null,other:null,loads:[],ded:[],fuel:[],unknown:[],aiNotes:[],aiOrder:aiS(j.calculation_order,200)};
 if(R.dedTotal===null||isNaN(R.dedTotal))R.dedTotal=null;
 j.loads.forEach(function(l){if(!l||typeof l!=="object")return;var g=aiC(l.gross);if(g==null&&l.load_id==null)return;
  R.loads.push({num:aiS(l.load_id,30),f:aiS(l.pickup)||"",t:aiS(l.delivery)||"",pd:aiD(l.pickup_date),g:g||0,earn:aiC(l.driver_amount),mi:typeof l.loaded_miles==="number"?Math.round(l.loaded_miles):0,dh:typeof l.empty_miles==="number"?Math.round(l.empty_miles):null,pg:l.page||null})});
 j.deductions.forEach(function(x){if(!x||typeof x!=="object")return;var a=aiC(x.amount);if(a==null||a===0)return;var c=keys[x.category]?x.category:"other",k=x.kind in C.AIKIND?x.kind:"unclear";
  var d={c:c,a:a,v:aiS(x.label,48)||c,pg:x.page||null,ai:true,ev:aiS(x.evidence,120)};var dk=C.AIKIND[k];if(dk&&dk!==C.KIND_DEF[c])d.dk=dk;if(k==="unclear"){d.dk="adjust";d.check=true;d.unclear=true}R.ded.push(d)});
 (Array.isArray(j.additions)?j.additions:[]).forEach(function(x){var a=aiC(x&&x.amount);if(!a)return;a=Math.abs(a);if(x.type==="reimbursement")R.reimb=(R.reimb||0)+a;else if(x.type==="advance_paid_out")R.adv=(R.adv||0)+a;else R.other=(R.other||0)+a});
 (Array.isArray(j.unreadable)?j.unreadable:[]).forEach(function(u){if(typeof u==="string"&&u.trim())R.aiNotes.push(u.slice(0,160))});
 if(R.gross==null&&R.loads.length)R.gross=C.sum(R.loads,"g");R.grossDoc=R.gross;R.grossLoads=C.sum(R.loads,"g");if(!R.d)R.d=R.p1;return R};
/* AI result may be saved automatically only when every printed total it found agrees with our own arithmetic, and Net Pay is printed */
C.aiVerdict=function(R){if(!R)return {ok:false,why:["noResult"]};if(!(R.gross>0))return {ok:false,why:["noGross"]};var k=C.stmtCalc(R),c=k.rec.chk,why=[];
 if(c.net==null)why.push("noNet");if(c.net===false)why.push("net:"+C.fmt(k.rec.stated)+"≠"+C.fmt(k.net));if(c.ded===false)why.push("ded:"+C.fmt(R.dedTotal)+"≠"+C.fmt(k.ded));if(c.gross===false)why.push("gross:"+C.fmt(k.gross)+"≠"+C.fmt(k.grossLoads));
 if(R.earn!=null&&R.rate!=null&&Math.abs(C.pct(R.gross,R.rate)-R.earn)>100&&R.fee==null)why.push("earn:"+C.fmt(R.earn)+"≠"+C.fmt(C.pct(R.gross,R.rate)));
 return {ok:!why.length,why:why,status:k.rec.status,unclear:R.ded.filter(function(d){return d.unclear}).length}};
C.aiFeedback=function(R,v){return "Our arithmetic from your values: gross "+C.fmt(R.gross||0)+", driver earnings "+C.fmt(C.stmtCalc(R).earn)+", deductions sum "+C.fmt(C.sum(R.ded,"a"))+", computed net "+C.fmt(C.stmtCalc(R).net)+". Problems: "+v.why.join("; ")+"."};
/* the very same statement uploaded again (same number or same week, same totals) */
C.stmtSame=function(a,b){if(!a||!b)return false;var ka=C.stmtCalc(a),kb=C.stmtCalc(b);if(a.num&&b.num&&C.norm(a.num)!==C.norm(b.num))return false;
 return ka.gross===kb.gross&&ka.net===kb.net&&ka.ded===kb.ded&&(a.loads||[]).length===(b.loads||[]).length&&C.stDay(a)===C.stDay(b)};
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
