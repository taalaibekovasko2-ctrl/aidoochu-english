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
var a1={id:"a",d:"2026-11-08",p0:"2026-11-02",p1:"2026-11-08",gross:1395000,ded:[{c:"toll",a:2565,v:"Toll"}],loads:[]},b1={id:"b",company:"X",num:"1",d:"2026-11-10",p0:"2026-11-02",p1:"2026-11-08",gross:1395000,ded:[{c:"toll",a:2565,v:"Toll"},{c:"parking",a:2000,v:"Parking"}],loads:[]};
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
var FIX=require("path").join(__dirname,"fixtures","aravan_2026-11-02_text.txt"),SKIP=0;if(!require("fs").existsSync(FIX)){SKIP++;console.log("⚠️ NOT RUN: real ARAVAN fixture missing ("+FIX+")")}else try{var RT=require("fs").readFileSync(FIX,"utf8");var RR=C.parseStatement(RT),KR=C.stmtCalc(RR);
 eq("real: period",[RR.p0,RR.p1],["2026-11-02","2026-11-08"]);eq("real: gross",RR.gross,1395000);eq("real: earn",RR.earn,1227600);eq("real: loads",RR.loads.length,4);
 eq("real: deductions",C.sum(RR.ded,"a"),470048);eq("real: one fuel line",RR.ded.filter(function(d){return d.c=="diesel"}).length,1);eq("real: tolls not added twice",RR.ded.filter(function(d){return d.c=="toll"}).length,1);
 eq("real: fuel retail/invoice",[RR.fuelRetail,RR.fuelInvoice],[431645,383983]);eq("real: fuel rows",RR.fuel.length,8);eq("real: net diff 0",[KR.net,KR.rec.diff],[757552,0]);
 var TT=C.totals({stmts:[Object.assign({id:"r",miles:2900},RR)],tx:[],loads:[]},["2026-11-02","2026-11-08"]);eq("real: diesel gal / def gal",[TT.dieselGal,TT.defGal],[64728,2504]);eq("real: savings",TT.fuelSaved,47662);eq("real: fuel cost",TT.fuelCost,383983);
eq("real: page/line of Fuel deduction kept",[RR.ded.filter(function(d){return C.catGroup(d.c)=="fuel"})[0].pg>=1,!!RR.loads[0].ln],[true,true]);eq("real: no driver name leaks into categories",RR.unknown.length,0);
}catch(e){fail++;console.log("❌ real fixture crashed",e.message)}

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
eq("manual toll proposed (not auto-linked)",[C.linkCandidates(SP,SM).map(function(c){return c.t.id}),C.linkMatching(SP,SM)],[["m1"],[]]);var lk=C.linkMatching(SP,SM,["m1"]);SM.stmts.push(SP);eq("manual toll linked after user confirms",lk,["m1"]);eq("expenses = statement + unrelated repair",C.totals(SM,W).exp,470048+9999);
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

// === smart system ===
var LG=C.legs([{f:"Clearfield,UT",t:"San Jose,CA",pd:"2026-11-02"},{f:"Oakland,CA",t:"Seattle,WA",pd:"2026-11-03"},{f:"Seattle,WA",t:"Laton,CA",pd:"2026-11-05"},{f:"Fresno,CA",t:"Lockport,IL",pd:"2026-11-06"}]);
eq("legs: points",LG.pts.length,7);eq("legs: types (no guessed start/end)",LG.types,["loaded","empty","loaded","loaded","empty","loaded"]);
var SL=C.sumLegs(LG.types,[1609344,160934.4,1609344,1609344,160934.4,1609344],LG.pts);eq("legs sum",[SL.loaded,SL.empty],[4000,200]);eq("empty legs are San Jose→Oakland and Laton→Fresno",SL.legs.filter(function(l){return l.type=="empty"}).map(function(l){return l.f+">"+l.t}),["San Jose,CA>Oakland,CA","Laton,CA>Fresno,CA"]);
var SMi={stmts:[Object.assign({},SP,{miLoaded:4330,miEmpty:400,milesAuto:true})],tx:[],loads:[]},TM=C.totals(SMi,W);
eq("miles total = loaded+empty",TM.miles,4730);eq("gross RPM ≈ 2.95",TM.rpm.gross,295);eq("net cash RPM ≈ 1.60",TM.rpm.net,160);eq("driver RPM",TM.rpm.driver,260);eq("loaded RPM",TM.rpm.loaded,322);eq("estimated flag",TM.autoMi,true);
// escrow & company debt repayment are not expenses, but reduce net pay
var SE={stmts:[{id:"e",d:"2026-11-08",p1:"2026-11-08",gross:500000,rate:10000,ded:[{c:"diesel",a:100000},{c:"escrow",a:5000},{c:"co_debt",a:20000,debt:"d1"}],net:375000}],tx:[],loads:[]};var TE=C.totals(SE,W),KE=C.stmtCalc(SE.stmts[0]);
eq("net pay includes all deductions",[KE.net,KE.rec.diff],[375000,0]);eq("expenses exclude escrow/debt",TE.exp,100000);eq("profit ≠ net",[TE.profit,TE.net],[400000,375000]);eq("debt paid / escrow deposit tracked separately",[TE.debtPaid,TE.escrow],[20000,5000]);
eq("escrow keyword",C.guessCat("ESCROW"),"escrow");eq("chargeback keyword",C.guessCat("DAMAGE CHARGEBACK"),"co_debt");
// company debt balance: opening + new - payments; payment not an expense
SE.debts=[{id:"d1",company:"",type:"advance",opening:100000,items:[{d:"2026-11-01",a:30000}]}];var DB=C.debtCalc(SE)[0];
eq("debt remaining",[DB.opening,DB.newDebt,DB.payments,DB.remaining],[100000,30000,20000,110000]);
// negative settlement carried as debt
var SN={stmts:[{id:"n",d:"2026-11-08",p1:"2026-11-08",gross:100000,rate:10000,ded:[{c:"diesel",a:150000}],negCarry:"d2"}],debts:[{id:"d2",company:"",type:"neg",opening:0,items:[]}],tx:[],loads:[]};
eq("negative net",C.stmtCalc(SN.stmts[0]).net,-50000);eq("negative balance → debt",C.debtCalc(SN)[0].remaining,50000);
// truck loan: interest vs principal, balance from statement deductions
var STK={stmts:[{id:"t1",d:"2026-11-08",p1:"2026-11-08",gross:0,ded:[{c:"truck_pay",a:100000}]}],truck:{type:"financed",balance:5200000,aprBp:1000,period:"week"},tx:[],loads:[]};var TK=C.truckCalc(STK);
eq("loan interest weekly",TK.interest,10000);eq("loan principal",TK.principal,90000);eq("loan balance",TK.balance,5110000);
eq("weekly lease has no balance split",C.truckCalc({stmts:STK.stmts,truck:{type:"lease"}}).balance,null);
// shop: $3000 repair, company paid $1000, then statement deductions reduce debt; expense counted once (only deductions)
var SH={stmts:[{id:"w1",d:"2026-11-08",p1:"2026-11-08",gross:0,ded:[{c:"shop_debt",a:50000,shop:"r1"}]}],shop:[{id:"r1",d:"2026-11-03",total:300000,co:100000,drv:0}],tx:[],loads:[]};var SC=C.shopCalc(SH)[0];
eq("shop remaining",[SC.total,SC.paid,SC.remaining],[300000,150000,150000]);eq("repair counted once (driver share, on repair date); weekly shop deduction is a debt payment",[C.totals(SH,W).exp,C.totals(SH,W).debtPaid],[200000,50000]);

// balances read from statement lines; unknown balances stay unknown
var RB=C.parseStatement("Shop Repair Loan payment $250.00\nShop loan balance $1,750.00\nCompany Loan Repay $100.00\nLoan balance remaining $900.00");
eq("balances parsed",RB.bal.map(function(b){return b.k+":"+b.a}),["shop:175000","co:90000"]);eq("debt lines categorized",RB.ded.map(function(d){return d.c}),["shop_debt","co_debt"]);
eq("unknown debt balance stays null",C.debtCalc({stmts:[],debts:[{id:"u",opening:null,items:[]}]})[0].remaining,null);
eq("unknown shop total stays null",C.shopCalc({stmts:[],shop:[{id:"s"}]})[0].remaining,null);
eq("different settlement numbers are not duplicates",!!C.stmtDup({id:"x",company:"A",num:"2",p1:"2026-11-15",gross:1395000,d:"2026-11-15"},{stmts:[{id:"y",company:"A",num:"1",p1:"2026-11-08",gross:1395000,d:"2026-11-08"}]}),false);

// advance shown in summary AND inside deductions table → subtracted once
var RA=C.parseStatement("SETTLEMENT\nEarnings: $5,000.00\nAdvances: $300.00\nDeductions: ($1,300.00)\nNet Pay: $3,700.00\nDeduction type Description Quantity Rate Total amount\nCash Advance COMCHECK 1 $300.00 ($300.00)\nFuel Auto calculated 1 $1,000.00 ($1,000.00)\nTotal: ($1,300.00)");
var KA=C.stmtCalc(Object.assign({gross:500000},RA));eq("advance inside deductions not double",[RA.advInDed,KA.net,KA.rec.diff],[true,370000,0]);eq("advance repayment not an expense",C.totals({stmts:[Object.assign({},RA,{id:"a",gross:500000,d:"2026-11-08",p1:"2026-11-08"})],tx:[],loads:[]},W).exp,100000);
// gross from document vs sum of loads
eq("gross doc vs loads mismatch reported",C.stmtCalc({gross:1000000,loads:[{g:900000}],ded:[],net:1000000,rate:10000}).rec.why[0].k,"grossLoads");
// several weekly statements of one driver → month totals add up, weeks stay separate
var W1=Object.assign({},SP,{id:"w1"}),W2=Object.assign({},SP,{id:"w2",num:"X2",p0:"2026-11-09",p1:"2026-11-15",d:"2026-11-17"});var SW={stmts:[W1,W2],tx:[],loads:[]};
eq("two weeks in month",C.totals(SW,["2026-11-01","2026-11-30"]).net,757552*2);eq("week 1 only",C.totals(SW,W).net,757552);eq("week 2 only",C.totals(SW,["2026-11-09","2026-11-15"]).net,757552);
// lease-to-own behaves like a loan (interest + principal), rental does not
var LT=C.truckCalc({stmts:STK.stmts,truck:{type:"lto",balance:2600000,aprBp:2000,period:"week"}});eq("lease-to-own interest/principal",[LT.interest,LT.principal,LT.balance],[10000,90000,2510000]);
eq("truck rental: no balance",C.truckCalc({stmts:STK.stmts,truck:{type:"rental"}}).isLoan,false);
// new categories
eq("tires/wash/reserve/company fee",[C.guessCat("TIRE SERVICE"),C.guessCat("BLUE BEACON TRUCK WASH"),C.guessCat("MAINTENANCE RESERVE"),C.guessCat("ADMIN FEE")],["tires","wash","reserve","co_fee"]);
// source page/line kept
var RP=C.parseStatement("[[PAGE 2]]\nToll Auto calculated $25.65");eq("source page/line",[RP.ded[0].pg,RP.ded[0].ln],[2,1]);

// === audit regressions ===
// two debts at one company: one statement payment reduces exactly one debt
var S2D={stmts:[{id:"q",company:"ACME",d:"2026-11-08",p1:"2026-11-08",gross:0,ded:[{c:"co_debt",a:10000,debt:"A"}]}],debts:[{id:"A",company:"ACME",type:"advance",opening:50000,items:[]},{id:"B",company:"ACME",type:"loan",opening:80000,items:[]}]};
eq("payment hits one debt only",C.debtCalc(S2D).map(function(d){return d.remaining}),[40000,80000]);
S2D.stmts[0].ded[0].debt=null;eq("unassigned payment reduces nothing and is reported",[C.debtCalc(S2D).map(function(d){return d.remaining}),C.unassignedDebt(S2D).length],[[50000,80000],1]);
eq("two candidate debts → user must choose",C.debtCandidates(S2D,S2D.stmts[0]).length,2);
// two companies, same week, same money → not duplicates
eq("other company same week not dup",!!C.stmtDup({id:"x",company:"BETA LLC",p0:"2026-11-02",p1:"2026-11-08",gross:1395000,d:"2026-11-08"},{stmts:[{id:"y",company:"ARAVAN CARGO INC",p0:"2026-11-02",p1:"2026-11-08",gross:1395000,d:"2026-11-08"}]}),false);
eq("other driver same company not dup",!!C.stmtDup({id:"x",company:"A",driver:"JOHN",p1:"2026-11-08",gross:1,d:"2026-11-08"},{stmts:[{id:"y",company:"A",driver:"MIKE",p1:"2026-11-08",gross:1,d:"2026-11-08"}]}),false);
eq("same company same week same money is dup",!!C.stmtDup({id:"x",company:"A",p1:"2026-11-08",gross:1,d:"2026-11-08"},{stmts:[{id:"y",company:"A",p1:"2026-11-08",gross:1,d:"2026-11-08"}]}),true);
// two different expenses with the same amount & category are both kept
var SA={stmts:[],loads:[],tx:[{id:"a1",kind:"exp",d:"2026-11-03",a:5000,c:"parking",paidBy:"own",v:"Lot A"},{id:"a2",kind:"exp",d:"2026-11-05",a:5000,c:"parking",paidBy:"own",v:"Lot B"}]};eq("same amount, different expenses both counted",C.totals(SA,W).exp,10000);
eq("page-2 merge keeps a different line with same amount",C.mergeStmt({loads:[],ded:[{c:"parking",a:2000,v:"Parking A",pg:1,ln:5}]},{loads:[],ded:[{c:"parking",a:2000,v:"Parking B",pg:2,ln:3}]}).ded.length,2);
eq("strong match by invoice # auto-links",C.linkMatching({id:"s",p0:"2026-11-02",p1:"2026-11-08",ded:[{c:"truck_repair",a:45000,v:"Repair INV 7781"}]},{tx:[{id:"r",kind:"exp",d:"2026-11-04",a:45000,c:"truck_repair",paidBy:"own",ref:"7781"}]}),["r"]);
// loan principal is not an operating expense; interest is
var SLn={stmts:[{id:"t1",d:"2026-11-08",p1:"2026-11-08",gross:500000,rate:10000,ded:[{c:"truck_pay",a:100000}]}],truck:{type:"financed",balance:5200000,aprBp:1000,period:"week"},tx:[],loads:[]};var TLn=C.totals(SLn,W);
eq("loan: expenses include interest only",[TLn.exp,TLn.interest,TLn.principal],[10000,10000,90000]);eq("loan: net pay vs profit vs cash flow",[TLn.net,TLn.profit,TLn.cashFlow],[400000,490000,400000]);
eq("weekly lease: full payment is an expense",C.totals({stmts:SLn.stmts,truck:{type:"lease"},tx:[],loads:[]},W).exp,100000);
eq("truck payments of another company are not mixed in",C.truckCalc({stmts:[{id:"o",company:"OTHER",d:"2026-11-08",p1:"2026-11-08",ded:[{c:"truck_pay",a:5}]}],truck:{type:"lease",company:"ARAVAN"}}).paid,0);
// shop credit is not a payment; company payment moved to driver is not owed to the shop twice
eq("shop credit: still owed",C.shopCalc({stmts:[],shop:[{id:"c",total:300000,paidAmt:300000,payer:"credit"}]})[0].remaining,300000);
var SHT=C.shopCalc({stmts:[],shop:[{id:"t",total:300000,paidAmt:100000,payer:"company",transfer:true}]})[0];eq("company paid & moved to driver: shop owed 2000, company 1000",[SHT.remaining,SHT.owedTo,SHT.movedToCompany],[200000,"company",100000]);

// ===== TZ scenarios A–H (payout, debt, expenses, taxable profit checked separately) =====
function st0(o){return Object.assign({id:"s"+Math.random(),company:"CO",d:"2026-11-08",p0:"2026-11-02",p1:"2026-11-08",gross:500000,rate:8800,ded:[],loads:[{g:500000}]},o)}
function run(S){S.tx=S.tx||[];S.loads=S.loads||[];S.status="single";S.stBp=0;var t=C.totals(S,W),x=C.tax(S,2026);return {net:t.net,exp:t.exp,profit:t.profit,debts:C.debtCalc(S).map(function(d){return d.remaining}),taxable:x.ok?x.sc:null}}
// A: 12% commission only
var A=run({stmts:[st0({})]});eq("A payout/expenses/profit",[A.net,A.exp,A.profit],[440000,0,440000]);eq("A Schedule C profit (no per diem days)",A.taxable,440000-0);
// B: 12% + $1,000 truck rental
var B=run({stmts:[st0({ded:[{c:"truck_pay",a:100000}]})],truck:{type:"rental"}});eq("B rental is an expense",[B.net,B.exp,B.profit],[340000,100000,340000]);
// C: owes company $2,000, $500 weekly
var Cc=run({stmts:[st0({ded:[{c:"co_debt",a:50000,debt:"cd"}]})],debts:[{id:"cd",company:"CO",type:"loan",opening:200000,items:[]}]});
eq("C payout −500, debt 1,500, NOT an expense",[Cc.net,Cc.debts[0],Cc.exp,Cc.profit],[390000,150000,0,440000]);
// D: owes truck shop $3,000 (on credit), $300 weekly
var D=run({stmts:[st0({ded:[{c:"shop_debt",a:30000,shop:"sh"}]})],shop:[{id:"sh",d:"2026-11-03",total:300000,paidAmt:0,payer:"credit"}]});var Dsh=C.shopCalc({stmts:[st0({ded:[{c:"shop_debt",a:30000,shop:"sh"}]})],shop:[{id:"sh",d:"2026-11-03",total:300000,paidAmt:0,payer:"credit"}]})[0];
eq("D payout −300, shop debt 2,700",[D.net,Dsh.remaining],[410000,270000]);eq("D repair counted once (3,000 on repair date), payment not again",D.exp,300000);
// E: diesel on personal card
var E1=run({stmts:[st0({})],tx:[{id:"e",kind:"exp",d:"2026-11-04",a:60000,c:"diesel",paidBy:"own"}]});eq("E personal-card diesel: payout unchanged, expense counted",[E1.net,E1.exp,E1.profit],[440000,60000,380000]);
// F: fuel advance given, then deducted
var F={stmts:[st0({ded:[{c:"co_debt",a:40000,debt:"fa"}]})],debts:[{id:"fa",company:"CO",type:"fuel_adv",opening:0,items:[{d:"2026-11-03",a:40000,src:"man"}]}],tx:[{id:"f",kind:"exp",d:"2026-11-03",a:40000,c:"diesel",paidBy:"own"}]};var FR=run(F);
eq("F advance repaid: debt 0, fuel counted once (when bought), repayment not expense",[FR.net,FR.debts[0],FR.exp],[400000,0,40000]);
// G: truck loan principal + interest
var G=run({stmts:[st0({ded:[{c:"truck_pay",a:100000}]})],truck:{type:"financed",balance:5200000,aprBp:1000,period:"week"}});eq("G loan: payout −1,000, expense = interest only",[G.net,G.exp,G.profit],[340000,10000,430000]);
// H: everything at once
var H={stmts:[st0({other:15000,ded:[{c:"truck_pay",a:100000},{c:"truck_ins",a:36000},{c:"co_debt",a:50000,debt:"hd"},{c:"shop_debt",a:30000,shop:"hs"},{c:"escrow",a:10000}]})],truck:{type:"rental"},debts:[{id:"hd",company:"CO",type:"loan",opening:200000,items:[]}],shop:[{id:"hs",d:"2026-10-01",total:300000,paidAmt:0,payer:"credit"}]};var HR=run(H);
eq("H payout",HR.net,440000+15000-226000);eq("H expenses (rent+insurance only)",HR.exp,136000);eq("H profit",HR.profit,440000+15000-136000);eq("H company debt",HR.debts[0],150000);eq("H shop debt",C.shopCalc(H)[0].remaining,270000);
// tax statuses
var TX={stmts:[st0({})],tx:[],loads:[],status:"single",stBp:0};
TX.taxSt="w2";var Tw=C.tax(TX,2026);eq("W-2: no self-employment tax",Tw.se,0);
TX.taxSt="scorp";eq("S-Corp: not enough data, not $0",[C.tax(TX,2026).ok,C.tax(TX,2026).why],[false,"entity"]);
eq("no data → not $0 but 'insufficient'",C.tax({stmts:[],tx:[],loads:[]},2025).why,"noData");
TX.taxSt="smllc";var Ts=C.tax(TX,2026);eq("SMLLC: SE tax applies",Ts.se>0,true);
// depreciation: 3-year MACRS for over-the-road tractor
var DP={truck:{type:"owned",price:9000000,inService:"2026-03-01",dep:"macrs3"}};eq("MACRS 3y year1/year2",[C.depr(DP,2026),C.depr(DP,2027)],[2999700,4000500]);DP.truck.dep="bonus";eq("bonus 100% first year",C.depr(DP,2026),9000000);
TX.taxSt="1099";TX.truck={type:"owned",price:9000000,inService:"2026-01-10",dep:"macrs3"};eq("depreciation lowers taxable profit",C.tax(TX,2026).sc,440000-2999700);
// custom category with its own kind / tax flag
var CU={stmts:[st0({ded:[{c:"u_club",a:5000},{c:"u_dep",a:7000}]})],cats:[{id:"u_club",name:"Club",kind:"expense",tax:false},{id:"u_dep",name:"Deposit",kind:"deposit"}],tx:[],loads:[]};var TC=C.totals(CU,W);
eq("custom: expense not taxable, deposit not expense",[TC.exp,TC.nonTax,TC.escrow],[5000,5000,7000]);
// reconciliation: 'full' only with all checks
eq("rec full (net+deductions+gross)",C.stmtCalc(Object.assign({},SP,{net:757552,dedTotal:470048})).rec.status,"full");
eq("rec partial (only net known)",C.stmtCalc(Object.assign({},SP,{net:757552,dedTotal:null,loads:[]})).rec.status,"partial");
eq("rec mismatch",C.stmtCalc(Object.assign({},SP,{net:757500})).rec.status,"mismatch");
// per-deduction kind override (e.g. 'Repair advance' marked as debt)
eq("deduction kind override",C.totals({stmts:[st0({ded:[{c:"truck_repair",a:20000,dk:"debt"}]})],tx:[],loads:[]},W).exp,0);

// ===== Audit 2 regressions =====
// 1) taxable profit: non-deductible expense lowers Business Profit but is ADDED BACK for tax
var NT={stmts:[st0({gross:100000,rate:10000,loads:[{g:100000}],ded:[{c:"u_nd",a:10000}]})],cats:[{id:"u_nd",name:"Fine",kind:"expense",tax:false}],tx:[],loads:[],taxSt:"1099",status:"single",stBp:0};
var NTt=C.totals(NT,W),NTx=C.tax(NT,2026);eq("tax: income 1,000 − non-deductible 100 → profit 900",NTt.profit,90000);eq("tax: taxable profit 1,000 (non-deductible added back)",NTx.sc,100000);
var NT2={stmts:[st0({gross:100000,rate:10000,loads:[{g:100000}],ded:[{c:"truck_ins",a:10000}]})],tx:[],loads:[],taxSt:"1099",status:"single",stBp:0};eq("tax: deductible 100 → taxable 900",C.tax(NT2,2026).sc,90000);
var NT3={stmts:[st0({gross:100000,rate:10000,loads:[{g:100000}]})],cats:[{id:"u_nd",name:"Fine",kind:"expense",tax:false}],tx:[{id:"n1",kind:"exp",d:"2026-11-04",a:10000,c:"u_nd",paidBy:"own"}],loads:[],taxSt:"sole",status:"single",stBp:0};
eq("tax: own-paid non-deductible → profit 900, taxable 1,000",[C.totals(NT3,W).profit,C.tax(NT3,2026).sc],[90000,100000]);
NT3.trips=[{a:"2026-11-02",b:"2026-11-03"}];eq("tax: per diem still subtracted after add-back",C.tax(NT3,2026).sc,100000-C.pct(2*8000,8000));
NT2.truck={type:"owned",price:9000000,inService:"2026-01-10",dep:"macrs3"};eq("tax: depreciation still subtracted",C.tax(NT2,2026).sc,90000-2999700);
// 2) Truck Shop & cash flow
function shopS(rec,tx){var S={stmts:[st0({gross:500000,rate:10000,loads:[{g:500000}]})],shop:[rec],tx:tx||[],loads:[]};return C.totals(S,W)}
var SH1=shopS({id:"r1",d:"2026-11-04",total:100000,paidAmt:100000,payer:"driver",drv:100000},[{id:"shpr1",kind:"exp",paidBy:"own",d:"2026-11-04",a:100000,c:"truck_repair"}]);
eq("shop: driver paid 1,000 now → Net 5,000, Cash Flow 4,000",[SH1.net,SH1.cashFlow],[500000,400000]);eq("shop: repair expense counted once",[SH1.exp,SH1.byCat.truck_repair,SH1.profit],[100000,100000,400000]);
var SH2=shopS({id:"r2",d:"2026-11-04",total:100000,paidAmt:0,payer:"credit"});eq("shop on credit: cash flow unchanged, expense once",[SH2.cashFlow,SH2.exp],[500000,100000]);
var SH3=shopS({id:"r3",d:"2026-11-04",total:100000,paidAmt:0,payer:"credit",pays:[{d:"2026-11-06",a:30000,src:"man"}]},[{id:"tp",kind:"exp",paidBy:"own",d:"2026-11-06",a:30000,c:"shop_debt"}]);
eq("shop credit, 300 paid later from own money: cash −300, expense still 1,000",[SH3.cashFlow,SH3.exp],[470000,100000]);
var SH4=shopS({id:"r4",d:"2026-11-04",total:100000,paidAmt:100000,payer:"company",co:100000});eq("shop paid by company (no transfer): no cash, no expense",[SH4.cashFlow,SH4.exp],[500000,0]);
var SH5=shopS({id:"r5",d:"2026-11-04",total:100000,paidAmt:40000,payer:"driver",drv:40000},[{id:"shpr5",kind:"exp",paidBy:"own",d:"2026-11-04",a:40000,c:"truck_repair"}]);
eq("shop partly paid now (400 of 1,000): cash −400, expense 1,000, owed 600",[SH5.cashFlow,SH5.exp,C.shopCalc({shop:[{id:"r5",total:100000,paidAmt:40000,payer:"driver"}],stmts:[]})[0].remaining],[460000,100000,60000]);
// 3) reconciliation gate for automatic save
var FULL=Object.assign({},SP,{net:757552,dedTotal:470048});eq("auto-save allowed only on full reconciliation",C.autoSaveOk(FULL),true);
eq("Net Pay only → partial → user must confirm",C.autoSaveOk(Object.assign({},SP,{net:757552,dedTotal:null,loads:[]})),false);
eq("Net Pay matches but no deductions total → not full",C.stmtCalc(Object.assign({},SP,{net:757552,dedTotal:null})).rec.status,"partial");
eq("deductions total wrong → mismatch, no auto-save",[C.stmtCalc(Object.assign({},FULL,{dedTotal:470000})).rec.status,C.autoSaveOk(Object.assign({},FULL,{dedTotal:470000}))],["mismatch",false]);
eq("gross ≠ loads → mismatch",C.stmtCalc(Object.assign({},FULL,{gross:1395100,earn:null,rate:8800})).rec.status,"mismatch");
eq("no Net Pay at all → not auto",C.autoSaveOk(Object.assign({},FULL,{net:null})),false);
if(typeof RR!=="undefined")eq("real ARAVAN: full reconciliation → auto-save",[C.stmtCalc(RR).rec.status,C.autoSaveOk(RR)],["full",true]);
// 4) data safety
function store(fail){var m={};return {m:m,getItem:function(k){return m.hasOwnProperty(k)?m[k]:null},setItem:function(k,v){if(fail)throw new Error("quota");m[k]=String(v)}}}
var ST=store();var k1=C.safeBackup(ST,"jolesep_v1_backup_before_v16","OLD-1"),k2=C.safeBackup(ST,"jolesep_v1_backup_before_v16","NEW-2");
eq("backup: first copy written",[k1,ST.m[k1]],["jolesep_v1_backup_before_v16","OLD-1"]);eq("backup: existing copy NOT overwritten",ST.m["jolesep_v1_backup_before_v16"],"OLD-1");
eq("backup: second copy kept under a new name",[k2!==k1,ST.m[k2]],[true,"NEW-2"]);var k3=C.safeBackup(ST,"jolesep_v1_backup_before_v16","N3");eq("backup: third copy also kept",[Object.keys(ST.m).length,ST.m[k3]],[3,"N3"]);
eq("backup: failed write reported (null), not marked done",C.safeBackup(store(true),"x","y"),null);
var SA={v:2,stmts:[SP],tx:[],loads:[],debts:[],shop:[]},SB={v:2,stmts:[],tx:[{id:"b",kind:"exp",d:"2026-11-04",a:500,c:"toll",paidBy:"own"}],loads:[]};
var EA=JSON.stringify(C.exportData(SA,{id:"main",name:"A"})),EB=JSON.stringify(C.exportData(SB,{id:"d2",name:"B"}));var RA=C.readBackup(EA),RB=C.readBackup(EB);
eq("export/import: driver A round-trip keeps totals",C.totals(RA.data,W).net,C.totals(SA,W).net);eq("export/import: driver id kept",[RA.driver.id,RB.driver.id],["main","d2"]);
eq("export/import: drivers stay separate",[RA.data.stmts.length,RA.data.tx.length,RB.data.stmts.length,RB.data.tx.length],[1,0,0,1]);
eq("import: bad file rejected",[C.readBackup("{}"),C.readBackup("not json"),C.readBackup(JSON.stringify({app:"other",data:{}}))],[null,null,null]);
eq("import: old (v1) backup migrated, not lost",C.readBackup(JSON.stringify({app:"jolesep",data:{loads:[{id:"l",d:"2026-11-03",g:100000}],exp:[]}})).data.v,2);
console.log("\nPASS "+pass+"  FAIL "+fail+"  NOT RUN "+SKIP);process.exit(fail||SKIP?1:0);
