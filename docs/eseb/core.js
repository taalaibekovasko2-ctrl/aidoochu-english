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
C.GROUPS=[["fuel","⛽","Күйүүчү май","Топливо"],["ins","🛡","Страховка","Страховка"],["road","🛣","Жол чыгымдары","Дорожные расходы"],["equip","🚛","Жабдуу (трак, трейлер)","Оборудование (трак, трейлер)"],["admin","📋","Административдик","Административные"],["maint","🔧","Ремонт жана тейлөө","Ремонт и обслуживание"],["fees","💼","Диспетчер / факторинг","Диспетчер / факторинг"],["other","🧾","Башка","Другое"]];
C.CATS=[
 ["diesel","fuel","Fuel — Diesel","Дизель","Дизель"],["def","fuel","DEF","DEF","DEF"],
 ["toll","road","Toll","Toll (акы төлөнүүчү жол)","Toll (платная дорога)"],["scale","road","Scale / CAT Scale","Тараза / CAT Scale","Весы / CAT Scale"],["prepass","road","PrePass","PrePass","PrePass"],["parking","road","Parking","Парковка","Парковка"],
 ["truck_ins","ins","Truck Insurance","Трак страховкасы","Страховка трака"],["bobtail","ins","Bobtail Insurance","Bobtail страховка","Bobtail страховка"],["cargo_ins","ins","Cargo Insurance","Жүк страховкасы","Страховка груза"],
 ["trailer","equip","Trailer Rental / Trailer Van","Трейлер ижарасы","Аренда трейлера"],["truck_pay","equip","Truck Payment / Leasing","Трак төлөмү / лизинг","Платёж за трак / лизинг"],
 ["ifta","admin","IFTA","IFTA","IFTA"],["eld","admin","ELD / Logbook","ELD / Logbook","ELD / Logbook"],["ifta_eld","admin","IFTA & Logbook — Combined","IFTA & Logbook — бириккен","IFTA & Logbook — вместе"],["phone","admin","Phone / Internet","Телефон / интернет","Телефон / интернет"],["permits","admin","Permits / Registration","Пермит / каттоо","Пермиты / регистрация"],
 ["truck_repair","maint","Truck Repair","Трак ремонту","Ремонт трака"],["trailer_repair","maint","Trailer Repair","Трейлер ремонту","Ремонт трейлера"],["pm","maint","Maintenance / PM Service","Тейлөө / PM","ТО / PM сервис"],["parts","maint","Parts / Tires","Тетиктер / дөңгөлөк","Запчасти / шины"],
 ["dispatch","fees","Dispatch Fee","Диспетчер акысы","Оплата диспетчеру"],["factoring","fees","Factoring Fee","Факторинг акысы","Факторинг"],
 ["other","other","Other Expenses","Башка чыгым","Прочие расходы"],["pers","other","Personal (not business)","Жеке (бизнеске кирбейт)","Личное (не бизнес)"]];
C.MAIN=["diesel","toll","ifta_eld","truck_ins","bobtail","trailer","prepass","parking","truck_repair","other"];
C.CAT={};C.CATS.forEach(function(c){C.CAT[c[0]]={id:c[0],g:c[1],en:c[2],kg:c[3],ru:c[4]}});
C.catGroup=function(c){return (C.CAT[c]||C.CAT.other).g};

/* keyword → category for statement / receipt lines (order matters: specific first) */
C.KW=[["ifta_eld",/\bIF?TA\s*(&|AND|\/|\+)?\s*(LOG|ELD)|(LOG ?BOOK|ELD)\s*(&|AND|\/|\+)\s*IF?TA\b/],["prepass",/PRE ?PASS|BESTPASS|DRIVEWYZE/],["def",/\bDEF\b|DIESEL EXHAUST/],
 ["bobtail",/BOBTAIL/],["cargo_ins",/CARGO/],["truck_ins",/INSUR|OCC(UPATIONAL)? ?ACC|PHYSICAL DAMAGE|\bPD\b|LIABILITY|\bNTL\b|\bINS\b/],
 ["trailer_repair",/TRAILER (REPAIR|MAINT)|REEFER REPAIR/],["trailer",/TRAILER|\bVAN RENT|REEFER RENT/],["truck_pay",/TRUCK PAY|LEASE|TRACTOR|TRUCK LOAN|TRUCK NOTE|FINANC/],
 ["ifta",/\bIFTA\b|FUEL TAX/],["eld",/\bELD\b|LOG ?BOOK|SAMSARA|MOTIVE|KEEP ?TRUCKIN|OMNITRACS/],["phone",/PHONE|INTERNET|VERIZON|T-?MOBILE|AT&T|TABLET|DATA PLAN/],
 ["permits",/PERMIT|\bIRP\b|PLATE|REGISTRATION|HVUT|2290|\bUCR\b|\bKYU\b|NM WEIGHT|OR WEIGHT/],
 ["scale",/SCALE|WEIGH/],["toll",/TOLL|E-?Z ?PASS|I-?PASS|SUN ?PASS|TURNPIKE|PIKEPASS/],["parking",/PARKING/],
 ["diesel",/FUEL|DIESEL|ULSD|COMDATA|\bEFS\b|FLEET ?ONE|\bWEX\b|PILOT|FLYING J|LOVE'?S|PETRO|\bTA\b/],
 ["parts",/TIRE|PARTS/],["pm",/\bPM\b|PREVENTIVE|OIL CHANGE|LUBE/],["truck_repair",/REPAIR|SHOP|MECHANIC|ROAD ?SERVICE|TOW/],
 ["factoring",/FACTOR/],["dispatch",/DISPATCH/]];
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
 var ded=C.sum(st.ded||[],"a"),adv=st.adv||0,reimb=st.reimb||0,other=st.other||0;
 var net=earn-ded+reimb+other-adv;
 var rec={stated:st.net==null?null:st.net,calc:net,diff:st.net==null?null:st.net-net,why:[]};
 if(st.dedTotal!=null&&st.dedTotal!==ded)rec.why.push({k:"dedTotal",stated:st.dedTotal,calc:ded,diff:st.dedTotal-ded});
 if(rec.diff){warn.forEach(function(w){if(w.k=="earnMismatch")rec.why.push(w)});if(!rec.why.length)rec.why.push({k:"unknown",diff:rec.diff})}
 return {gross:g,fee:fee,earn:earn,ded:ded,adv:adv,reimb:reimb,other:other,net:net,rec:rec,warn:warn}};

/* ---------- transactions & double-count protection ----------
 Expense counting rules (the core of "no double counting"):
  1) Statement deductions always count (driver bore them).
  2) A standalone transaction counts ONLY if paidBy=="own" (driver's own money), it is not linked to a statement line,
     and it is not marked as a duplicate of another record.
  3) paidBy=="card" (company fuel card / company paid) never counts by itself — the statement deduction already covers it.
     Such receipts are kept for gallons, prices, MPG and as proof.
  4) Reimbursements received reduce out-of-pocket cost; advances are not expenses. */
C.isPers=function(t){return !!t.pers||t.c==="pers"};
C.counts=function(t){return t.kind!="income"&&t.kind!="reimb"&&t.paidBy=="own"&&!t.link&&!t.dupOf&&!C.isPers(t)};
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
C.stmtDup=function(st,S){ /* same company+number, or same covered week, or same money → same statement */
 var k=C.key(st),f=null;(S.stmts||[]).forEach(function(o){if(f||o.id===st.id)return;
  if(k&&C.key(o)===k){f=o;return}
  var sameWeek=(st.p1&&o.p1&&Math.abs(C.days(st.p1,o.p1))<=1)||(st.p0&&o.p0&&st.p0===o.p0);
  var sameMoney=(st.gross&&st.gross===o.gross)||(st.net!=null&&o.net!=null&&st.net===o.net);
  if(sameWeek||sameMoney&&Math.abs(C.days(C.stDay(st),C.stDay(o)))<=10)f=o});return f};
C.dupPairs=function(S){var out=[],a=S.stmts||[];for(var i=0;i<a.length;i++)for(var j=i+1;j<a.length;j++){var x=C.stmtDup(a[j],{stmts:[a[i]]});if(x)out.push([a[i],a[j]])}return out};
C.mergeStmt=function(a,b){ /* add b's loads/deductions that a does not already have */
 var o=JSON.parse(JSON.stringify(a));function has(list,x,keys){return list.some(function(y){return keys.every(function(k){return y[k]===x[k]})})}
 (b.loads||[]).forEach(function(l){if(!has(o.loads,l,["g","f","t"]))o.loads.push(l)});(b.ded||[]).forEach(function(d){if(!has(o.ded,d,["c","a"]))o.ded.push(d)});(b.fuel||[]).forEach(function(f){o.fuel=o.fuel||[];if(!has(o.fuel,f,["a","d"]))o.fuel.push(f)});
 ["company","num","p0","p1","rate","earn","fee","net","dedTotal","fuelRetail","fuelInvoice"].forEach(function(k){if(o[k]==null&&b[k]!=null)o[k]=b[k]});
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
C.totals=function(S,r){
 var o={pers:0,gross:0,fee:0,earn:0,stDed:0,oop:0,reimb:0,other:0,adv:0,net:0,profit:0,loaded:0,empty:0,
  dieselGal:0,defGal:0,dieselCost:0,fuelCost:0,retail:0,invoice:0,src:{gross:[],fee:[],earn:[],exp:[],net:[],profit:[]},byCat:{},stCount:0,loadCount:0,days:0};
 function addCat(c,a,src){o.byCat[c]=(o.byCat[c]||0)+a;o.src.exp.push(src)}
 (S.stmts||[]).forEach(function(st){if(!C.inR(C.stDay(st),r))return;var k=C.stmtCalc(st);o.stCount++;
  o.gross+=k.gross;o.fee+=k.fee;o.earn+=k.earn;o.stDed+=k.ded;o.reimb+=k.reimb;o.other+=k.other;o.adv+=k.adv;o.net+=k.net;o.days+=st.days||0;
  o.src.gross.push({t:"st",id:st.id,a:k.gross});o.src.fee.push({t:"st",id:st.id,a:k.fee});o.src.earn.push({t:"st",id:st.id,a:k.earn});o.src.net.push({t:"st",id:st.id,a:k.net});
  (st.ded||[]).forEach(function(x,i){addCat(x.c,x.a,{t:"stded",id:st.id,i:i,a:x.a,c:x.c})});
  var lm=0;(st.loads||[]).forEach(function(l){lm+=l.mi||0;o.empty+=l.dh||0;o.loadCount++});o.loaded+=st.miles?st.miles:lm;if(st.dh)o.empty+=st.dh;
  (st.fuel||[]).forEach(function(f){fuelAdd(f)});
  if(st.fuelRetail!=null&&st.fuelInvoice!=null&&!(st.fuel||[]).some(function(f){return f.ret!=null})){o.retail+=st.fuelRetail;o.invoice+=st.fuelInvoice}});
 (S.loads||[]).forEach(function(l){if(!C.inR(l.d,r))return;var e=l.earn!=null?l.earn:l.g;o.gross+=l.g;o.earn+=e;o.fee+=l.g-e;o.loaded+=l.mi||0;o.empty+=l.dh||0;o.loadCount++;
  o.src.gross.push({t:"load",id:l.id,a:l.g});o.src.earn.push({t:"load",id:l.id,a:e});o.src.fee.push({t:"load",id:l.id,a:l.g-e})});
 (S.tx||[]).forEach(function(t){if(!C.inR(t.d,r))return;
  if(t.kind=="reimb"){o.reimb+=t.a;return}
  if(t.kind=="income"){o.other+=t.a;return}
  if(t.c&&C.catGroup(t.c)==="fuel"&&!t.dupOf&&!(t.link&&C.stHasFuelLines(S,t.link)))fuelAdd(t);
  if(C.counts(t)){o.oop+=t.a;addCat(t.c,t.a,{t:"tx",id:t.id,a:t.a,c:t.c})}else if(C.persCounts(t))o.pers=(o.pers||0)+t.a});
 function fuelAdd(f){var cost=f.inv!=null?f.inv:(f.a||0);if(f.c==="def"){o.defGal+=f.gal||0}else if(f.gal){o.dieselGal+=f.gal;o.dieselCost+=cost}
  if(f.ret!=null&&f.inv!=null){o.retail+=f.ret;o.invoice+=f.inv}}
 o.exp=o.stDed+o.oop;o.fuelSaved=o.retail&&o.invoice?o.retail-o.invoice:0;
 o.fuelCost=(o.byCat.diesel||0)+(o.byCat.def||0); /* authoritative: counted fuel expenses only */
 o.profit=o.earn+o.other+o.reimb-o.stDed-o.oop;
 o.miles=o.loaded+o.empty;
 o.perMile=function(c){return o.miles>0?Math.round(c/o.miles):null};
 o.mpg=o.miles>0&&o.dieselGal>0?Math.round(o.miles*10000/o.dieselGal)/100:null; /* gal stored as hundredths */
 return o};

/* one source for the Expenses screen: every row and whether it counts */
C.expRows=function(S,r){var rows=[];
 (S.stmts||[]).forEach(function(s){if(!C.inR(C.stDay(s),r))return;(s.ded||[]).forEach(function(x,i){rows.push({src:"st",id:s.id,i:i,d:C.stDay(s),a:x.a,c:x.c,v:x.v,pers:false,cnt:true})})});
 (S.tx||[]).forEach(function(t){if(t.kind!=="exp"||!C.inR(t.d,r))return;var p=C.isPers(t);rows.push({src:"tx",id:t.id,d:t.d,a:t.a,c:t.c||"other",v:t.v,pers:p,cnt:p?C.persCounts(t):C.counts(t),t:t})});
 rows.sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0});var biz=0,pers=0;rows.forEach(function(x){if(!x.cnt)return;if(x.pers)pers+=x.a;else biz+=x.a});return {rows:rows,biz:biz,pers:pers}};
/* statement saved after manual entries: own-money entries equal to a statement line are linked (counted once) */
C.linkMatching=function(st,S){var ids=[];(S.tx||[]).forEach(function(t){if(t.kind!=="exp"||t.link||t.dupOf||C.isPers(t))return;
  var inP=st.p0&&st.p1?(t.d>=C.addDays(st.p0,-7)&&t.d<=C.addDays(st.p1,1)):Math.abs(C.days(t.d,C.stDay(st)))<=7;if(!inP)return;
  var hit=(st.ded||[]).some(function(x){return Math.abs(x.a-t.a)<=1&&(x.c===t.c||C.catGroup(x.c)===C.catGroup(t.c))})||(st.fuel||[]).some(function(f){return Math.abs((f.inv!=null?f.inv:f.a)-t.a)<=1&&C.catGroup(t.c)==="fuel"});
  if(hit){t.link=st.id;ids.push(t.id)}});return ids};
/* ---------- tax estimate 2026 (owner-operator, Schedule C + SE). Estimates only. ---------- */
C.TAX={BR:{single:[[1240000,1000],[5040000,1200],[10570000,2200],[20177500,2400],[25622500,3200],[64060000,3500],[1e15,3700]],
 mfj:[[2480000,1000],[10080000,1200],[21140000,2200],[40355000,2400],[51245000,3200],[76870000,3500],[1e15,3700]],
 hoh:[[1770000,1000],[6745000,1200],[10570000,2200],[20175000,2400],[25620000,3200],[64060000,3500],[1e15,3700]]},
 STD:{single:1610000,mfj:3220000,hoh:2415000},SSB:18450000,PD:8000,PDP:8000};
C.fedTax=function(ti,st){var b=C.TAX.BR[st]||C.TAX.BR.single,t=0,lo=0;for(var i=0;i<b.length&&ti>lo;i++){var hi=b[i][0];t+=C.pct(Math.min(ti,hi)-lo,b[i][1]);lo=hi}return t};
C.tax=function(S,y){var r=[y+"-01-01",y+"-12-31"],o=C.totals(S,r),days=o.days+C.tripDays(S,r);
 var pdd=C.pct(days*C.TAX.PD,C.TAX.PDP);var sc=o.profit-pdd;var base=C.pct(Math.max(0,sc),9235);
 var se=C.pct(Math.min(base,C.TAX.SSB),1240)+C.pct(base,290);if(S.role==="company")se=0;
 var half=Math.floor(se/2),agi=Math.max(0,sc-half),std=C.TAX.STD[S.status]||C.TAX.STD.single,pre=Math.max(0,agi-std);
 var qbi=Math.min(C.pct(Math.max(0,sc-half),2000),C.pct(pre,2000));var ti=Math.max(0,pre-qbi),fed=C.fedTax(ti,S.status),st=C.pct(agi,S.stBp||0);
 var tot=se+fed+st,paid=(S.paid&&S.paid[y])||0;return {t:o,days:days,pdd:pdd,sc:sc,se:se,agi:agi,qbi:qbi,ti:ti,fed:fed,st:st,tot:tot,paid:paid,left:Math.max(0,tot-paid)}};
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
function title(s){return s.toLowerCase().replace(/\b[a-z]/g,function(c){return c.toUpperCase()})}
function locs(U){var re=new RegExp("([A-Z][A-Z .'\\-]{1,24}?)[, ]+("+STS+")\\b","g"),out=[],m;while((m=re.exec(U))){var city=m[1].replace(/^(?:\d+|[A-Z]{1,2}\d+)\s+/,"").replace(/^(FROM|TO|ORIGIN|DEST(INATION)?|PICKUP|DELIVERY|SHIPPER|CONSIGNEE|PU|DEL)\s*:?\s*/,"").trim();
 var w=city.split(/\s+/);if(w.length>3)city=w.slice(-3).join(" ");if(city.length>=2&&!/^(TOTAL|FUEL|LOAD|PAY|RATE|MILES?|NET|GROSS)$/.test(city))out.push(title(city)+", "+m[2])}return out}
C.parseStatement=function(txt){
 var lines=String(txt||"").split(/\n/).map(function(l){return l.replace(/\s+/g," ").trim()}).filter(Boolean),U=lines.join("\n").toUpperCase();
 var R={company:null,driver:null,num:null,d:null,p0:null,p1:null,gross:null,rate:null,earn:null,fee:null,adv:null,reimb:null,other:null,net:null,dedTotal:null,loads:[],ded:[],fuel:[],fuelRetail:null,fuelInvoice:null,unknown:[]};
 for(var i=0;i<Math.min(4,lines.length);i++){var cl=lines[i].replace(/\s*(STATEMENT DATE|SETTLEMENT DATE|PERIOD|DATE|PAGE)\b.*$/i,"").trim();if(/[A-Za-z]{3}/.test(cl)&&!/^(STATEMENT|SETTLEMENT|PAGE|DRIVER|PERIOD)/i.test(cl)&&!moneys(cl).length){R.company=cl.slice(0,60);break}}
 lines.forEach(function(l){var u=l.toUpperCase(),mm;
  if(!R.num&&(mm=u.match(/(?:SETTLEMENT|STATEMENT|STMT)\s*(?:#|NO\.?|NUMBER|ID)?\s*[:#]\s*([A-Z]{0,4}-?\d[A-Z0-9\-]{2,})/)))R.num=mm[1];
  if(/PERIOD\s*START|START\s*DATE|PERIOD\s*FROM/.test(u)){var q1=dates(u);if(q1.length)R.p0=q1[0]}
  if(/PERIOD\s*END|END\s*DATE|PERIOD\s*TO|WEEK\s*ENDING/.test(u)){var q2=dates(u);if(q2.length)R.p1=q2[q2.length-1]}
  if(!R.driver&&(mm=l.match(/DRIVER(?: NAME)?\s*:\s*([A-Za-z][A-Za-z .'\-]{2,40})/i)))R.driver=mm[1].replace(/\s+(UNIT|TRUCK).*$/i,"").trim();
  if(/PERIOD|WEEK|FROM\b/.test(u)&&!R.p0){var ds=dates(u);if(ds.length>=2){R.p0=ds[0];R.p1=ds[1]}else if(ds.length===1&&/ENDING/.test(u)){R.p1=ds[0];R.p0=C.addDays(ds[0],-6)}}
  if(!R.d&&/(STATEMENT|SETTLEMENT|CHECK|PAY)\s*DATE/.test(u)){var d1=dates(u);if(d1.length)R.d=d1[0]}
 });
 if(!R.p0){var ds2=dates(U.split("\n").slice(0,8).join(" "));if(ds2.length>=2){R.p0=ds2[0];R.p1=ds2[1]}}
 var sec="";
 lines.forEach(function(l){var u=l.toUpperCase(),a=lastMoney(l),ls=locs(u),mm;
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
   var ln=(u.match(/^\s*#?([A-Z]{0,3}\d{4,})/)||[])[1]||null,dd=dates(u);
   R.loads.push({num:ln,f:ls[0],t:ls[ls.length-1],pd:dd[0]||null,g:Math.max.apply(null,moneys(l)),mi:mi,dh:null});return}
  if(a==null)return;
  if(/GALLONS?|\bGAL\b|\bGL\b/.test(u)&&/(DIESEL|ULSD|DEF|FUEL|PILOT|LOVE|PETRO|\bTA\b|FLYING)/.test(u)&&!/TOTAL/.test(u)){var g=(u.match(/(\d{1,4}(?:\.\d{1,3})?)\s*(?:GALLONS?|GAL|GL)\b/)||[])[1];var ds3=dates(u);
   R.fuel.push({d:ds3[0]||null,v:(l.match(/^[^\d$]{3,30}/)||[""])[0].trim(),gal:g!=null?Math.round(parseFloat(g)*100):null,c:/\bDEF\b/.test(u)?"def":"diesel",a:a,inv:a,ret:null});return}
  if(/RETAIL/.test(u)&&/FUEL|TOTAL/.test(u)){R.fuelRetail=a;return}
  if(/INVOICE|DISCOUNTED/.test(u)&&/FUEL|TOTAL/.test(u)){R.fuelInvoice=a;return}
  if(/TOTAL\s*DEDUCTION|DEDUCTIONS?\s*TOTAL/.test(u)){R.dedTotal=Math.abs(a);return}
  if(/NET\s*(PAY|AMOUNT|SETTLEMENT)|AMOUNT\s*PAID|CHECK\s*AMOUNT|SETTLEMENT\s*AMOUNT|TOTAL\s*PAY(?!MENT)/.test(u)&&!/YTD|YEAR/.test(u)){R.net=a;return}
  if(/YTD|YEAR TO DATE/.test(u))return;
  if(/(DRIVER|CONTRACTOR|YOUR|O\/O)\s*(EARNINGS|GROSS|PAY|SHARE|REVENUE)|EARNINGS\s*\(\s*\d/.test(u)&&R.earn==null){R.earn=a;return}
  if(/COMMISSION|COMPANY\s*(FEE|SHARE|PORTION)|CARRIER\s*(FEE|SHARE)/.test(u)&&R.fee==null){R.fee=Math.abs(a);return}
  if(/GROSS|TOTAL\s*REVENUE|LINE ?HAUL\s*TOTAL|TOTAL\s*LINE ?HAUL|TOTAL\s*LOAD|LOAD\s*TOTAL|TOTAL\s*FREIGHT/.test(u)&&!/NET/.test(u)&&R.gross==null){R.gross=a;return}
  if(/ADVANCE|CASH ADV|COMCHECK/.test(u)){R.adv=(R.adv||0)+Math.abs(a);return}
  if(/REIMB/.test(u)){R.reimb=(R.reimb||0)+Math.abs(a);return}
  if(/DETENTION|LAYOVER|BONUS|STOP PAY|EXTRA STOP|TARP|OTHER PAY|ACCESSORIAL/.test(u)&&!/DEDUCT/.test(u)){R.other=(R.other||0)+Math.abs(a);return}
  if(/ESCROW|SAVINGS|MAINT(ENANCE)? (FUND|RESERVE)/.test(u)){R.unknown.push({v:l,a:Math.abs(a),hint:"escrow"});return}
  var c=C.guessCat(u);var lab=l.replace(C.MONEY,"").replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g,"").replace(/\s+/g," ").trim().slice(0,48);
  if(c&&!/TOTAL|SUBTOTAL/.test(u)){R.ded.push({c:c,a:/REFUND|REBATE|CREDIT|RETURN/.test(u)?-Math.abs(a):Math.abs(a),v:lab,raw:(l.match(C.MONEY)||[]).pop()||""});return}
  if(!/TOTAL|SUBTOTAL|BALANCE|PAGE/.test(u))R.unknown.push({v:lab||l.slice(0,48),a:Math.abs(a)});
 });
 C.collapseFuel(R);C.fixOcrDollar(R);
 if(R.gross==null&&R.loads.length)R.gross=C.sum(R.loads,"g");
 if(R.fuelInvoice!=null){var fd=R.ded.filter(function(x){return x.c==="diesel"});if(!fd.length)R.ded.push({c:"diesel",a:R.fuelInvoice,v:"Fuel (invoice)"})}
 if(!R.d)R.d=R.p1||null;
 return R};

/* all fuel (diesel + DEF) → ONE "Fuel" deduction; details kept only as info (gallons) */
C.collapseFuel=function(R){var F=[],rest=[];R.ded.forEach(function(d){if(C.catGroup(d.c)==="fuel")F.push(d);else rest.push(d)});
 if(!F.length&&R.fuelInvoice==null)return R;var total=null,details=F;
 if(R.fuelInvoice!=null)total=R.fuelInvoice;
 else{var all=C.sum(F,"a");for(var i=0;i<F.length&&total==null;i++){if(F.length>1&&Math.abs(F[i].a*2-all)<=2||/TOTAL/i.test(F[i].v)){total=F[i].a;details=F.filter(function(x,j){return j!==i})}}
  if(total==null)total=all}
 var hadRows=R.fuel.length>0;if(!hadRows&&!(details.length===1&&details[0].a===total))details.forEach(function(d){R.fuel.push({d:null,v:d.v,gal:null,c:d.c,a:d.a,inv:d.a,ret:null})});
 rest.push({c:"diesel",a:total,v:"Fuel"+(details.length?" ("+details.length+")":""),fuelN:details.length,raw:F.length===1?F[0].raw:""});R.ded=rest;R.fuelFromDetails=R.fuelInvoice==null&&details.length===F.length;return R};
/* OCR often reads "$" as 5, 8 or S: "$25.65" → "825.65". Use the statement's own totals to pick the right reading. */
C.fixOcrDollar=function(R){var target=R.dedTotal;if(target==null||C.sum(R.ded,"a")===target)return R;
 var amb=[];R.ded.forEach(function(d,i){var raw=String(d.raw||"").replace(/[()\s-]/g,"");if(/^[58S]\d{1,3}(,\d{3})*\.\d{2}$/.test(raw)&&raw.indexOf("$")<0)amb.push({i:i,alt:C.cents(raw.slice(1))})});
 if(!amb.length||amb.length>12)return R;var base=C.sum(R.ded,"a");
 for(var mask=1;mask<(1<<amb.length);mask++){var sum=base;for(var k=0;k<amb.length;k++)if(mask&(1<<k))sum+=amb[k].alt-R.ded[amb[k].i].a;
  if(sum===target){for(var k2=0;k2<amb.length;k2++)if(mask&(1<<k2)){var d=R.ded[amb[k2].i];d.ocrFix=d.a;d.a=amb[k2].alt}R.ocrFixed=true;return R}}
 return R};
/* ---------- receipts ---------- */
C.parseReceipt=function(txt){var lines=String(txt||"").split(/\n/).map(function(l){return l.trim()}).filter(Boolean),U=lines.join("\n").toUpperCase(),a=null;
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

G.JE=C;if(typeof module!=="undefined")module.exports=C;
})(typeof window!=="undefined"?window:this);
