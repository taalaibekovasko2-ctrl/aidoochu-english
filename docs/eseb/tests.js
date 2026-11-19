var C=require("./core.js"),pass=0,fail=0;
function eq(name,got,exp){var ok=JSON.stringify(got)===JSON.stringify(exp);if(ok)pass++;else fail++;console.log((ok?"✅ ":"❌ ")+name+(ok?"":"  got="+JSON.stringify(got)+" exp="+JSON.stringify(exp)))}
// money
eq("cents 1,234.56",C.cents("$1,234.56"),123456);eq("cents (45.10)",C.cents("(45.10)"),-4510);eq("cents 0.1+0.2 safe",C.cents("0.10")+C.cents("0.20"),30);eq("cents 12,50 decimal comma",C.cents("12,50"),1250);eq("cents 1,250",C.cents("1,250"),125000);
eq("fmt",C.fmt(757552),"$7,575.52");eq("pct 12% of 13950",C.pct(1395000,1200),167400);eq("pct half-up",C.pct(5,5000),3);
// main sample
var S1="ROADSTAR LOGISTICS INC\nSETTLEMENT STATEMENT\nSettlement #: 104522\nDriver: Askat T. Unit 512\nPeriod: 11/02/2026 - 11/08/2026\nStatement Date: 11/10/2026\nLoad 778801 11/02/2026 CHICAGO, IL DALLAS, TX 925 mi $4,650.00\nLoad 778832 11/04/2026 DALLAS, TX ATLANTA, GA 781 mi $4,300.00\nLoad 778861 11/06/2026 ATLANTA, GA COLUMBUS, OH 560 mi $5,000.00\nTotal Gross $13,950.00\nDriver Rate: 88%\nDriver Earnings $12,276.00\nDEDUCTIONS\nParking $20.00\nPrePass $20.00\nTrailer Van $200.00\nBobtail Insurance $100.00\nInsurance $360.00\nIFTA & Logbook $135.00\nToll $25.65\nFuel $3,839.83\nTotal Deductions $4,700.48\nFuel Retail Total $4,316.45\nFuel Invoice Total $3,839.83\nNet Pay $7,575.52";
var R=C.parseStatement(S1);
eq("parse company",R.company,"ROADSTAR LOGISTICS INC");eq("parse num",R.num,"104522");eq("parse period",[R.p0,R.p1],["2026-11-02","2026-11-08"]);eq("parse date",R.d,"2026-11-10");
eq("parse gross",R.gross,1395000);eq("parse rate",R.rate,8800);eq("parse earn",R.earn,1227600);eq("parse loads",R.loads.length,3);eq("load miles",R.loads.map(function(l){return l.mi}),[925,781,560]);
eq("parse ded cats",R.ded.map(function(x){return x.c+":"+x.a}),["parking:2000","prepass:2000","trailer:20000","bobtail:10000","truck_ins:36000","ifta_eld:13500","toll:2565","diesel:383983"]);
eq("parse dedTotal",R.dedTotal,470048);eq("parse net",R.net,757552);eq("fuel retail/invoice",[R.fuelRetail,R.fuelInvoice],[431645,383983]);
var st=Object.assign({id:"s1"},R);var k=C.stmtCalc(st);
eq("fee 1674",k.fee,167400);eq("earn 12276",k.earn,1227600);eq("ded 4700.48",k.ded,470048);eq("net 7575.52",k.net,757552);eq("reconcile diff 0",k.rec.diff,0);eq("fuel savings",R.fuelRetail-R.fuelInvoice,47662);
// commission not twice: earnings given AND commission line present
var st2={gross:1395000,rate:8800,earn:1227600,fee:167400,ded:[{c:"diesel",a:383983}],adv:0,reimb:0,other:0,net:843617};eq("no double commission",C.stmtCalc(st2).net,843617);
// 0%, 12% (rate 88), 100%
eq("0% commission (rate 100%)",C.stmtCalc({gross:500000,rate:10000,ded:[]}).fee,0);eq("12% commission",C.stmtCalc({gross:500000,rate:8800,ded:[]}).fee,60000);eq("no rate → earn=gross, warn",C.stmtCalc({gross:500000,ded:[]}).warn[0].k,"noRate");
// advance & reimb
var k3=C.stmtCalc({gross:100000,rate:10000,ded:[{c:"toll",a:1000}],adv:20000,reimb:5000,other:3000,net:87000});eq("net with adv/reimb/other",k3.net,87000);eq("advance not expense",k3.ded,1000);
// mismatched totals
var k4=C.stmtCalc({gross:100000,rate:10000,ded:[{c:"toll",a:1000}],dedTotal:1500,net:98500});eq("ded total mismatch explained",[k4.rec.diff,k4.rec.why[0].k,k4.rec.why[0].diff],[-500,"dedTotal",500]);
// refund (negative)
eq("refund negative cents",C.cents("-25.00"),-2500);
// --- TRIPLE COUNTING: statement + fuel receipt + manual ---
var S={stmts:[Object.assign({},st,{fuel:[]})],tx:[],loads:[],trips:[]};
var r=["2026-11-01","2026-11-30"],base=C.totals(S,r);eq("base expenses = statement deductions",base.exp,470048);
// fuel receipt paid with company fuel card
S.tx.push({id:"t1",kind:"exp",d:"2026-11-05",a:120050,c:"diesel",v:"Pilot",gal:15000,paidBy:"card"});
// same fuel typed manually again (company card)
S.tx.push({id:"t2",kind:"exp",d:"2026-11-05",a:120050,c:"diesel",v:"Pilot",paidBy:"card"});
eq("card receipts never add to expenses",C.totals(S,r).exp,470048);
eq("duplicate flagged (receipt vs manual)",C.findDups(S.tx[1],S).filter(function(x){return x.type=="tx"}).length,1);
eq("receipt inside statement fuel period flagged",C.findDups(S.tx[0],S).some(function(x){return x.type=="stperiod"}),true);
// own-money receipt + same entered manually: second marked dupOf → counted once
S.tx.push({id:"t3",kind:"exp",d:"2026-11-07",a:45000,c:"truck_repair",v:"Rush Truck",paidBy:"own"});
S.tx.push({id:"t4",kind:"exp",d:"2026-11-07",a:45000,c:"truck_repair",v:"Rush Truck",paidBy:"own"});
eq("dup detected own-money",C.findDups(S.tx[3],S)[0].id,"t3");S.tx[3].dupOf="t3";
eq("own repair counted once",C.totals(S,r).exp,470048+45000);
// own-money expense that equals a statement line → flagged
S.tx.push({id:"t5",kind:"exp",d:"2026-11-08",a:2565,c:"toll",v:"E-ZPass",paidBy:"own"});eq("own toll equal to statement toll flagged",C.findDups(S.tx[4],S).some(function(x){return x.type=="stline"}),true);
S.tx[4].link="s1";eq("linked toll not counted",C.totals(S,r).exp,470048+45000);
// reimbursement later
S.tx.push({id:"t6",kind:"reimb",d:"2026-11-20",a:45000});var T=C.totals(S,r);eq("profit = earn - ded - oop + reimb",T.profit,1227600-470048-45000+45000);
// same statement twice
eq("same statement detected",!!C.stmtDup(Object.assign({},st,{id:"s2"}),S),true);
// miles missing
eq("no miles → per mile null",C.totals({stmts:[],loads:[{id:"l",d:"2026-11-02",g:100000}],tx:[]},r).perMile(100000),null);
// MPG same period only
var Sm={stmts:[Object.assign({},st,{fuel:[{d:"2026-11-03",c:"diesel",gal:30000,a:120000,inv:120000},{d:"2026-11-04",c:"def",gal:1000,a:4000,inv:4000}]})],tx:[],loads:[]};
var Tm=C.totals(Sm,["2026-11-02","2026-11-08"]);eq("diesel gal excludes DEF",[Tm.dieselGal,Tm.defGal],[30000,1000]);eq("MPG = 2266/300",Tm.mpg,7.55);
// different weeks don't mix
eq("other week empty",C.totals(Sm,["2026-11-09","2026-11-15"]).gross,0);
// toll on another day than statement date
var So={stmts:[],loads:[],tx:[{id:"x",kind:"exp",d:"2026-10-30",a:1200,c:"toll",paidBy:"own"}]};eq("toll counted on its own date",C.totals(So,["2026-10-26","2026-11-01"]).exp,1200);
// combined category kept combined
eq("combined IFTA&Logbook kept",C.guessCat("IFTA & LOGBOOK"),"ifta_eld");eq("prepass not phone",C.guessCat("PREPASS"),"prepass");eq("trailer not lease",C.guessCat("TRAILER VAN RENTAL"),"trailer");eq("toll≠scale",[C.guessCat("CAT SCALE"),C.guessCat("TOLL")],["scale","toll"]);
// migration keeps totals
var v1={lang:"kg",loads:[{id:"a",d:"2026-11-02",f:"A",t:"B",g:1000.1,mi:100,dh:0,st:"S"},{id:"b",d:"2026-11-03",g:200.2,mi:10}],exp:[{id:"e",d:"2026-11-02",a:10.05,c:"fuel",st:"S"},{id:"f",d:"2026-11-04",a:0.1,c:"tolls"},{id:"g",d:"2026-11-04",a:0.2,c:"pers"}],stmts:[{id:"S",d:"2026-11-08",days:6}],trips:[],paid:{"2026":"100.50"},st:4.95};
var m=C.migrate(v1),Tv=C.totals(m,["2026-11-01","2026-11-30"]);eq("migration gross",Tv.gross,120030);eq("migration expenses",Tv.exp,1015);eq("migration paid",m.paid["2026"],10050);eq("migration state %",m.stBp,495);
// tax smoke
var Tx=C.tax({stmts:[st],tx:[],loads:[],trips:[],status:"single",stBp:0},2026);eq("tax uses profit",Tx.t.profit,1227600-470048);

// fuel cost not doubled by card receipts; savings from statement retail/invoice
var Sf={stmts:[Object.assign({},st,{fuel:[]})],tx:[{id:"f1",kind:"exp",d:"2026-11-05",a:120050,c:"diesel",v:"Pilot",gal:30000,paidBy:"card"}],loads:[]};
var Tf=C.totals(Sf,["2026-11-02","2026-11-08"]);eq("fuel cost = statement fuel only",Tf.fuelCost,383983);eq("gallons from card receipt kept",Tf.dieselGal,30000);eq("fuel savings 476.62",Tf.fuelSaved,47662);
eq("fuel cost per mile",Tf.perMile(Tf.fuelCost),Math.round(383983/2266));

// same statement uploaded twice without number (old version) → detected by week/money
var a1={id:"a",d:"2026-11-08",p0:"2026-11-02",p1:"2026-11-08",gross:1395000,ded:[{c:"toll",a:2565}],loads:[]},b1={id:"b",company:"X",num:"1",d:"2026-11-10",p0:"2026-11-02",p1:"2026-11-08",gross:1395000,ded:[{c:"toll",a:2565},{c:"parking",a:2000}],loads:[]};
eq("dup by same week",!!C.stmtDup(b1,{stmts:[a1]}),true);eq("dupPairs finds",C.dupPairs({stmts:[a1,b1]}).length,1);
var mg=C.mergeStmt(a1,b1);eq("merge no double deductions",C.sum(mg.ded,"a"),4565);eq("merge keeps gross",mg.gross,1395000);
eq("different weeks not dup",!!C.stmtDup({id:"c",p0:"2026-11-09",p1:"2026-11-15",gross:900000,d:"2026-11-15"},{stmts:[a1]}),false);

// REAL-LIKE OCR: fuel total + fuel details listed, "$" misread as 8/5
var S2="SETTLEMENT\nPeriod Nov 2 - Nov 8, 2026\nTotal Gross $13,950.00\nDriver Rate 88%\nParking Booking #XRWP60UJ 520.00\nPrepass NOVEMBER 20.00\nTrailer Van #207 200.00\nBobtail Insurance 100.00\nInsurance 360.00\nIfta Logbook 135.00\nToll Au 825.65\nFuel Au total 3,839.83\nFuel AMATZHANOV | Def Fernley NV 16.09\nFuel AMATZHANOV | Diesel Fernley NV 579.36\nFuel 512026 AMATZHANOV | Diesel Tacoma WA 337.70\nFuel 612026 AMATZHANOV | Diesel Roseburg OR 896.50\nFuel 812026 AMATZHANOV | Diesel Clive 1,033.46\nFuel 912026 AMATZHANOV | Diesel Ontario 976.72\nTotal Deductions 4,700.48\nNet Pay 7,575.52";
var R2=C.parseStatement(S2);
eq("period Nov 2 - Nov 8",[R2.p0,R2.p1],["2026-11-02","2026-11-08"]);
eq("fuel collapsed to one line",R2.ded.filter(function(d){return C.catGroup(d.c)=="fuel"}).map(function(d){return d.a}),[383983]);
eq("$ misread fixed (toll 25.65, parking 20.00)",R2.ded.filter(function(d){return d.c=="toll"||d.c=="parking"}).map(function(d){return d.a}),[2000,2565]);
eq("deductions = 4700.48",C.sum(R2.ded,"a"),470048);
var k5=C.stmtCalc(Object.assign({},R2));eq("net reconciles 7575.52",[k5.net,k5.rec.diff],[757552,0]);
// details only, no total line → summed once
var R3=C.parseStatement("Fuel Diesel A 100.00\nFuel Diesel B 50.00\nFuel DEF C 10.00\nToll 5.00");eq("fuel details summed once",R3.ded.filter(function(d){return d.c=="diesel"})[0].a,16000);

// REAL statement layout (ARAVAN-style "Driver Pay Settlement"), text from PDF
try{var RT=require("fs").readFileSync("/tmp/stp/s.txt","utf8");var RR=C.parseStatement(RT),KR=C.stmtCalc(RR);
 eq("real: period",[RR.p0,RR.p1],["2026-11-02","2026-11-08"]);eq("real: gross",RR.gross,1395000);eq("real: earn",RR.earn,1227600);eq("real: loads",RR.loads.length,4);
 eq("real: deductions",C.sum(RR.ded,"a"),470048);eq("real: one fuel line",RR.ded.filter(function(d){return d.c=="diesel"}).length,1);eq("real: tolls not added twice",RR.ded.filter(function(d){return d.c=="toll"}).length,1);
 eq("real: fuel retail/invoice",[RR.fuelRetail,RR.fuelInvoice],[431645,383983]);eq("real: fuel rows",RR.fuel.length,8);eq("real: net diff 0",[KR.net,KR.rec.diff],[757552,0]);
 var TT=C.totals({stmts:[Object.assign({id:"r",miles:2900},RR)],tx:[],loads:[]},["2026-11-02","2026-11-08"]);eq("real: diesel gal / def gal",[TT.dieselGal,TT.defGal],[64728,2504]);eq("real: savings",TT.fuelSaved,47662);eq("real: fuel cost",TT.fuelCost,383983);
}catch(e){console.log("(real statement fixture not present)",e.message)}

// === spec #2 test ===
var SP={id:"sp",d:"2026-11-10",p0:"2026-11-02",p1:"2026-11-08",gross:1395000,rate:8800,ded:[{c:"diesel",a:383983},{c:"toll",a:2565},{c:"ifta_eld",a:13500},{c:"truck_ins",a:36000},{c:"bobtail",a:10000},{c:"trailer",a:20000},{c:"prepass",a:2000},{c:"parking",a:2000}],loads:[{g:160000},{g:360000},{g:225000},{g:650000}]};
var SS={stmts:[SP],tx:[],loads:[]},W=["2026-11-02","2026-11-08"],TS=C.totals(SS,W);
eq("spec: gross/fee/biz/exp/net",[TS.gross,TS.fee,TS.earn,TS.exp,TS.profit],[1395000,167400,1227600,470048,757552]);
eq("spec: loads count 4",TS.loadCount,4);
eq("spec: no miles → null per-mile (no divide by zero)",[TS.perMile(TS.gross),TS.perMile(TS.profit)],[null,null]);
// same numbers on every screen (single source)
eq("home expenses == expenses screen",C.expRows(SS,W).biz,TS.exp);
// manual entry BEFORE statement → linked, counted once
var SM={stmts:[],loads:[],tx:[{id:"m1",kind:"exp",d:"2026-11-05",a:2565,c:"toll",paidBy:"own"},{id:"m2",kind:"exp",d:"2026-11-06",a:9999,c:"truck_repair",paidBy:"own"}]};
var lk=C.linkMatching(SP,SM);SM.stmts.push(SP);eq("manual toll linked to statement",lk,["m1"]);eq("expenses = statement + unrelated repair",C.totals(SM,W).exp,470048+9999);
// personal does not reduce profit, shown separately
var SPp={stmts:[SP],loads:[],tx:[{id:"p1",kind:"exp",d:"2026-11-04",a:5000,c:"other",pers:true,paidBy:"own"}]};var TP=C.totals(SPp,W);
eq("personal not in profit",[TP.profit,TP.pers],[757552,5000]);eq("expenses screen split",[C.expRows(SPp,W).biz,C.expRows(SPp,W).pers],[470048,5000]);
// refund (negative) reduces expenses
var SR={stmts:[SP],loads:[],tx:[{id:"r1",kind:"exp",d:"2026-11-04",a:-1500,c:"truck_repair",paidBy:"own"}]};eq("refund reduces expenses",C.totals(SR,W).exp,470048-1500);
eq("statement refund line negative",C.parseStatement("Fuel rebate credit $15.00").ded[0].a,-1500);
// week boundaries: Monday–Sunday, Nov 2–8
eq("week of Nov 5 is Nov 2–8",C.range("week","2026-11-05"),["2026-11-02","2026-11-08"]);eq("week of Nov 8 (Sun)",C.range("week","2026-11-08"),["2026-11-02","2026-11-08"]);
// statement stays in its week even if paid next week
eq("statement counted in its period week, not pay date",C.totals(SS,["2026-11-09","2026-11-15"]).gross,0);
// float trap
eq("0.1+0.2 style sums exact",C.sum([{a:C.cents("0.10")},{a:C.cents("0.20")}],"a"),30);
console.log("\nPASS "+pass+"  FAIL "+fail);process.exit(fail?1:0);
