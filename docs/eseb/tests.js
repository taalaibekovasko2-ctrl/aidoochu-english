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

// ===== restore safety =====
var GOOD=JSON.stringify(C.exportData({v:2,stmts:[],tx:[{id:"n",kind:"exp",d:"2026-11-04",a:900,c:"toll",paidBy:"own"}],loads:[]},{id:"main"}));
eq("restore: broken JSON rejected",[C.readBackup('{"app":"jolesep","data":{"v":2,"stmts":['),C.readBackup(GOOD.slice(0,-5))],[null,null]);
eq("restore: wrong structure rejected",[C.readBackup(JSON.stringify({app:"jolesep",data:{v:2,stmts:{}}})),C.readBackup(JSON.stringify({app:"jolesep",data:{v:2,stmts:[],tx:[5,"x"]}})),C.readBackup(JSON.stringify({app:"jolesep",data:[]}))],[null,null,null]);
var S1=store();S1.setItem("jolesep_v1","CURRENT");eq("restore: bad file → profile unchanged",[C.restoreInto(S1,"jolesep_v1","{bad").ok,S1.m["jolesep_v1"],Object.keys(S1.m).length],[false,"CURRENT",1]);
var S2=store();S2.m["jolesep_v1"]="CURRENT";S2.setItem=function(){throw new Error("quota")};var R2=C.restoreInto(S2,"jolesep_v1",GOOD);
eq("restore: backup fails → stops, profile unchanged",[R2.ok,R2.why,S2.m["jolesep_v1"]],[false,"backup","CURRENT"]);
var S3=store();S3.setItem("jolesep_v1","CURRENT");var R3=C.restoreInto(S3,"jolesep_v1",GOOD);
eq("restore: success → old profile in backup, new data loaded",[R3.ok,S3.m[R3.backup],JSON.parse(S3.m["jolesep_v1"]).tx.length],[true,"CURRENT",1]);
var R4=C.restoreInto(S3,"jolesep_v1",GOOD);eq("restore twice: both backups kept",[R4.ok,R4.backup!==R3.backup,S3.m[R3.backup]],[true,true,"CURRENT"]);
var S5=store();S5.setItem("jolesep_v1@d2","DRIVER2");S5.setItem("jolesep_v1","DRIVER1");C.restoreInto(S5,"jolesep_v1@d2",GOOD);eq("restore: other driver's profile untouched",S5.m["jolesep_v1"],"DRIVER1");

// ===== reported broken files =====
var BAD1='{"app":"jolesep","data":{}}',BAD2='{"app":"jolesep","data":{"v":2,"stmts":[{"ded":{}}],"tx":[],"loads":[]}}';
[["empty data {}",BAD1],["v2 with ded:{}",BAD2]].forEach(function(b){var Sx=store();Sx.setItem("jolesep_v1","CURRENT");var Rx=C.restoreInto(Sx,"jolesep_v1",b[1]);
 eq("bad file ("+b[0]+") → 'Файл туура эмес', profile unchanged",[C.readBackup(b[1]),Rx.ok,Rx.why,Sx.m["jolesep_v1"],Object.keys(Sx.m).length],[null,false,"badFile","CURRENT",1])});
eq("v2 missing tx/loads rejected",C.readBackup('{"app":"jolesep","data":{"v":2,"stmts":[]}}'),null);
eq("stmt loads/fuel not arrays rejected",[C.readBackup('{"app":"jolesep","data":{"v":2,"stmts":[{"loads":"x"}],"tx":[],"loads":[]}}'),C.readBackup('{"app":"jolesep","data":{"v":2,"stmts":[{"fuel":{}}],"tx":[],"loads":[]}}'),C.readBackup('{"app":"jolesep","data":{"v":2,"stmts":[{"ded":[1]}],"tx":[],"loads":[]}}')],[null,null,null]);
eq("fake v1 rejected before migration",[C.readBackup('{"app":"jolesep","data":{"loads":{}}}'),C.readBackup('{"app":"jolesep","data":{"loads":[{"g":5}]}}'),C.readBackup('{"app":"jolesep","data":{"v":7,"loads":[]}}')],[null,null,null]);
var EMPTY2=C.readBackup('{"app":"jolesep","data":{"v":2,"stmts":[],"tx":[],"loads":[]}}');eq("empty but valid v2 profile opens",!!EMPTY2&&EMPTY2.data.stmts.length===0,true);
var V1=C.readBackup(JSON.stringify({app:"jolesep",data:{stmts:[{id:"s1",d:"2026-11-08"}],loads:[{id:"l",d:"2026-11-03",g:"1000.00",st:"s1"}],exp:[{id:"e",d:"2026-11-04",a:"50.00",c:"fuel"}]}}));
eq("valid v1 backup still opens and migrates",[!!V1,V1&&V1.data.v,V1&&V1.data.stmts.length,V1&&V1.data.tx.length],[true,2,1,1]);
var S6=store();S6.setItem("jolesep_v1","CURRENT");S6.setItem=function(){throw new Error("quota")};var R6=C.restoreInto(S6,"jolesep_v1",JSON.stringify(C.exportData({v:2,stmts:[],tx:[],loads:[]},{id:"main"})));
eq("backup fails → restore stops, profile unchanged (recheck)",[R6.ok,R6.why,S6.m["jolesep_v1"]],[false,"backup","CURRENT"]);

// ===== PDF ligature glyphs (tt/ff) lost by pdf.js =====
eq("ligature: Sea¤¤le → Seattle, Se¤¤lement → Settlement",C.fixLig("Oakland,CA Sea¤¤le,WA Se¤¤lement #"),"Oakland,CA Seattle,WA Settlement #");
eq("ligature: Bu¤¤alo → Buffalo, Je¤¤erson → Jefferson (known words)",C.fixLig("Bu¤¤alo,NY Je¤¤erson"),"Buffalo,NY Jefferson");
eq("ligature: upper case kept",C.fixLig("SEA¤¤LE,WA"),"SEATTLE,WA");eq("ligature: text without marker unchanged",C.fixLig("Laton,CA"),"Laton,CA");
if(typeof RT!=="undefined"){var LT=RT.split("Seattle").join("Sea¤¤le").split("Settlement").join("Se¤¤lement"),LR=C.parseStatement(LT);
 eq("real ARAVAN via pdf.js ligatures: cities, number and totals unchanged",[LR.loads[1].t,LR.loads[2].f,LR.num,C.stmtCalc(LR).net,C.stmtCalc(LR).rec.status],["Seattle, WA","Seattle, WA",RR.num,757552,"full"])}

// ===== other company layouts (synthetic, no real data) =====
var SYN=require("fs").readFileSync(require("path").join(__dirname,"fixtures","synthetic_other_layout.txt"),"utf8"),SR=C.parseStatement(SYN),SK=C.stmtCalc(SR);
eq("layout B: header (company, driver, truck #, week 45 → period)",[SR.company,SR.driver,SR.unit,SR.week,SR.p0,SR.p1],["TESTCO LOGISTICS LLC","TEST DRIVER","1207",45,"2026-11-02","2026-11-08"]);
eq("layout B: loads with pickup/delivery/miles/freight",SR.loads.map(function(l){return [l.num,l.f,l.t,l.mi,l.g]}),[["L55102","Dallas, TX","Memphis, TN",452,200000],["L55117","Memphis, TN","Atlanta, GA",391,150000]]);
eq("layout B: 'Total Gross $3,500 … $1,050' → gross vs driver share",[SR.gross,SR.earn,SR.rate],[350000,105000,3000]);
eq("layout B: Total Expenses / Total Payable",[SR.dedTotal,SR.net],[61000,44000]);
eq("layout B: Driver Debt & Advances = debt, not expense",SR.ded.filter(function(d){return C.kindOf(d.c,{},d)==="debt"}).map(function(d){return d.a}),[10000,5000]);
eq("layout B: fuel discount lowers fuel once (not income)",[C.sum(SR.ded.filter(function(d){return C.catGroup(d.c)==="fuel"}),"a"),SR.other],[36000,null]);
eq("layout B: full reconciliation",[SK.net,SK.rec.status],[44000,"full"]);
var SB2=C.totals({stmts:[Object.assign({id:"b"},SR)],tx:[],loads:[]},["2026-11-02","2026-11-08"]);eq("layout B: business profit = 1,050 − (360+25+75)",[SB2.net,SB2.profit,SB2.debtPaid],[44000,59000,15000]);
var SYN2=SYN.replace("Total Expenses                                                               $610.00","Total Expenses                                                               $650.00").replace("$440.00","$400.00");
var SR2=C.parseStatement(SYN2);eq("discount already in fuel price → info only, not subtracted again",[SR2.fuelDiscInfo,SR2.ded.some(function(d){return d.disc}),C.stmtCalc(SR2).rec.status],[4000,false,"full"]);
var EMPTY=C.parseStatement("some unknown document\nno amounts here");eq("unknown document → empty result (nothing invented), never auto-saved",[EMPTY.loads.length,EMPTY.ded.length,EMPTY.gross,EMPTY.net,C.autoSaveOk(EMPTY)],[0,0,null,null,false]);
if(typeof RR!=="undefined")eq("ARAVAN unchanged after layout changes",[RR.gross,RR.earn,C.sum(RR.ded,"a"),KR.net,RR.num],[1395000,1227600,470048,757552,RR.num]);

// ===== AI reader: what the AI found vs our arithmetic vs the document totals (AI answers mocked — no network) =====
var AJ={company:"ARAVAN CARGO INC",driver:"DRIVER NAME",unit:"2002N",statement_number:"ST-038914",statement_date:"2026-11-10",period_start:"2026-11-02",period_end:"2026-11-08",
 gross_total:13950,driver_earnings:12276,commission_amount:1674,driver_percent:88,deductions_total:4700.48,net_pay:7575.52,
 loads:[{load_id:"39040005",pickup:"Clearfield, UT",delivery:"San Jose, CA",gross:1600},{load_id:"7278314579",pickup:"Oakland, CA",delivery:"Seattle, WA",gross:3600},{load_id:"39073298",pickup:"Seattle, WA",delivery:"Laton, CA",gross:2250},{load_id:"69839362",pickup:"Fresno, CA",delivery:"Lockport, IL",gross:6500}],
 deductions:[{label:"Fuel",amount:3839.83,category:"diesel",kind:"expense"},{label:"Toll",amount:25.65,category:"toll",kind:"expense"},{label:"IFTA & Logbook",amount:135,category:"ifta_eld",kind:"expense"},{label:"Insurance",amount:360,category:"truck_ins",kind:"expense"},{label:"Bobtail",amount:100,category:"bobtail",kind:"expense"},{label:"Trailer",amount:200,category:"trailer",kind:"expense"},{label:"PrePass",amount:20,category:"prepass",kind:"expense"},{label:"Parking",amount:20,category:"parking",kind:"expense"}],
 additions:[],unreadable:[]};
var AR=C.fromAI(AJ),AV=C.aiVerdict(AR);eq("AI ARAVAN: values → statement, verified",[AR.gross,AR.earn,C.sum(AR.ded,"a"),C.stmtCalc(AR).net,AV.ok,AV.status],[1395000,1227600,470048,757552,true,"full"]);
eq("AI ARAVAN = rule reader (same totals)",[C.stmtCalc(AR).net,C.sum(AR.ded,"a"),AR.loads.length],[KR.net,C.sum(RR.ded,"a"),RR.loads.length]);
var BJ={company:"NEW CARRIER LLC",gross_total:3500,driver_earnings:1050,driver_percent:30,deductions_total:610,net_pay:440,period_start:"2026-11-02",period_end:"2026-11-08",
 loads:[{load_id:"L1",pickup:"Dallas, TX",delivery:"Memphis, TN",gross:2000,loaded_miles:452},{load_id:"L2",pickup:"Memphis, TN",delivery:"Atlanta, GA",gross:1500,loaded_miles:391}],
 deductions:[{label:"Fuel",amount:400,category:"diesel",kind:"expense"},{label:"Fuel Discounts",amount:-40,category:"diesel",kind:"expense"},{label:"IFTA",amount:25,category:"ifta",kind:"expense"},{label:"Insurance",amount:75,category:"truck_ins",kind:"expense"},
  {label:"DRIVER DEBT",amount:100,category:"co_debt",kind:"debt",evidence:"weekly repayment of driver debt"},{label:"DK DEBT",amount:50,category:"other",kind:"unclear"}],additions:[],unreadable:[]};
var BR=C.fromAI(BJ),BV=C.aiVerdict(BR),BT=C.totals({stmts:[Object.assign({id:"ai"},BR)],tx:[],loads:[]},["2026-11-02","2026-11-08"]);
eq("AI unknown company: verified without a template",[BV.ok,C.stmtCalc(BR).net,BR.loads[0].mi],[true,44000,452]);
eq("AI: fuel discount lowers fuel once, driver debt = debt, unclear = not expense",[BT.byCat.diesel,BT.debtPaid,BT.adjust,BT.profit],[36000,10000,5000,105000-36000-2500-7500]);
eq("AI: unclear item flagged for the driver",[BV.unclear,BR.ded.filter(function(d){return d.unclear})[0].check],[1,true]);
var WJ=JSON.parse(JSON.stringify(BJ));WJ.deductions.pop();var WR=C.fromAI(WJ),WV=C.aiVerdict(WR);eq("AI missed a line → net & deductions disagree → NOT saved",[WV.ok,WV.why.length>=2],[false,true]);
eq("feedback for the 2nd pass names the difference",/net:\$440\.00≠\$490\.00/.test(C.aiFeedback(WR,WV)),true);
var NJ=JSON.parse(JSON.stringify(BJ));NJ.net_pay=null;eq("AI without printed Net Pay → not saved (cannot verify)",C.aiVerdict(C.fromAI(NJ)).why,["noNet"]);
eq("AI malformed answer rejected",[C.fromAI(null),C.fromAI({loads:"x"}),C.fromAI({deductions:[]})],[null,null,null]);
var XJ=JSON.parse(JSON.stringify(BJ));XJ.deductions[2].category="hacker";XJ.period_start="next week";var XR=C.fromAI(XJ);eq("AI unknown category → other; bad date → empty (nothing invented)",[XR.ded[2].c,XR.p0],["other",null]);

// ===== free table reader (word positions → rows & columns) + several methods + automatic decision =====
function fx(n){return JSON.parse(require("fs").readFileSync(require("path").join(__dirname,"fixtures",n),"utf8"))}
function rowsText(rows){return rows.map(function(r){return r.cells.map(function(c){return c.s}).join("   ")}).join("\n")}
var PA=C.cellRows(fx("aravan_pdf_items.json")),PB=C.cellRows(fx("layoutB_pdf_items.json")),PC=C.cellRows(fx("layoutC_pdf_items.json"));
var TA=C.parseTables(PA);eq("table: ARAVAN loads by column (id, PU, DEL, gross, driver amount)",TA.loads.map(function(l){return [l.num,l.f,l.t,l.g,l.earn]}),[["39040005","Clearfield, UT","San Jose, CA",160000,140800],["7278314579","Oakland, CA","Seattle, WA",360000,316800],["39073298","Seattle, WA","Laton, CA",225000,198000],["69839362","Fresno, CA","Lockport, IL",650000,572000]]);
eq("table: ARAVAN deductions = 8 lines, total 4,700.48; fuel transactions = detail only",[TA.ded.length,C.sum(TA.ded,"a"),TA.detail>=1],[8,470048,true]);
var TC=C.parseTables(PC);eq("table: unknown layout C — City + separate ST column, loaded & empty miles",TC.loads.map(function(l){return [l.f,l.t,l.mi,l.dh]}),[["Reno, NV","Boise, ID",430,25],["Boise, ID","Salt Lake City, UT",340,0],["Ogden, UT","Las Vegas, NV",420,38]]);
eq("table: layout C linehaul vs your share (no $ signs)",[C.sum(TC.loads,"g"),C.sum(TC.loads,"earn")],[505000,404000]);
var BA=C.readAll({texts:[{name:"pdf",text:rowsText(PA),rows:PA}]}),BB=C.readAll({texts:[{name:"pdf",text:rowsText(PB),rows:PB}]}),BC=C.readAll({texts:[{name:"pdf",text:rowsText(PC),rows:PC}]});
eq("auto: ARAVAN → save",[C.decide(BA).act,C.stmtCalc(BA).net],["save",757552]);
eq("auto: layout B → save",[C.decide(BB).act,C.stmtCalc(BB).net],["save",44000]);
eq("auto: layout C — text reader fails, table reader wins → save",[BC.method,C.decide(BC).act,C.stmtCalc(BC).net,BC.net],["pdf+table","save",269955,269955]);
eq("auto: layout C miles from table",[C.sum(BC.loads,"mi"),C.sum(BC.loads,"dh")],[1190,63]);
eq("auto: layout C 'Misc 2' explained by the printed total only → not an expense, flagged",BC.ded.filter(function(d){return d.solved}).map(function(d){return [d.v,d.a,d.dk,d.check]}),[["Misc 2 ref 77",1500,"adjust",true]]);
eq("subset: unique combination only",[C.subsetExplain([500,300,200],500),C.subsetExplain([300,200,500,700],500)],[null,null]);
eq("subset: one exact match",C.subsetExplain([1500,999,250],1750),[0,2]);
var bad=C.readAll({texts:[{name:"pdf",text:rowsText(PC).replace("2,699.55","2,600.00"),rows:PC}]});eq("auto: printed Net disagrees with every reading → warn, nothing saved",C.decide(bad).act,"warn");
var noNet=C.readAll({texts:[{name:"pdf",text:rowsText(PC).replace(/Net Check Amount.*$/m,""),rows:PC}]});eq("auto: no Net Pay printed → cannot verify → warn",[C.decide(noNet).act,C.decide(noNet).v.why[0]],["warn","noNet"]);
var CSVR=[["Trip","Origin","Destination","Miles","Linehaul","Driver Pay"],["A1","Austin TX","Tulsa OK","460","2,100.00","1,680.00"],["A2","Tulsa OK","Denver CO","690","2,400.00","1,920.00"],["Total","","","1150","4,500.00","3,600.00"],["Description","Amount"],["Fuel","900.00"],["Insurance","150.00"],["Total Deductions","1,050.00"],["Net Pay","2,550.00"]].map(function(r){return {cells:r.map(function(x,i){return {x0:i*100,x1:i*100+90,s:x}}).filter(function(c){return c.s})}});
var BX=C.readAll({texts:[{name:"excel",text:rowsText(CSVR),rows:CSVR}]});eq("Excel/CSV columns → save",[C.decide(BX).act,BX.gross,C.stmtCalc(BX).earn,C.stmtCalc(BX).net,C.sum(BX.loads,"mi")],["save",450000,360000,255000,1150]);
var OC=fx("layoutC_pdf_items.json").map(function(i){return {x0:i.x0*3,x1:i.x1*3,y:-i.y*3,h:i.h*3,s:i.s}});var BO=C.readAll({texts:[{name:"ocr",text:"",rows:C.cellRows(OC,true)}].map(function(t){t.text=rowsText(t.rows);return t})});
eq("OCR-style word boxes (y down, other scale) → same result",[C.decide(BO).act,C.stmtCalc(BO).net],["save",269955]);
eq("company name never taken from a table header line",C.parseStatement("Load ID   Pickup   Delivery   Miles   Freight Amount\nL1   Dallas, TX   Memphis, TN   452   $2,000.00\nTotal Payable $600.00").company,null);

// ===== money in every section agrees (regression) =====
var WK=["2026-11-02","2026-11-08"],YR=["2026-01-01","2026-12-31"];
function agree(name,S){[WK,YR].forEach(function(r){var t=C.totals(S,r),x=C.expRows(S,r),cats=0;for(var c in t.byCat)cats+=t.byCat[c];
 eq(name+" ["+r[0].slice(5)+"]: Expenses tab = business expenses = sum of categories = earn−profit",[x.biz,cats,t.earn+t.other+t.reimb-t.profit],[t.exp,t.exp,t.exp])})}
// the example from the task: Gross 1,000, Fuel 200, debt payment 300
var EX={stmts:[st0({gross:100000,rate:10000,loads:[{g:100000}],ded:[{c:"diesel",a:20000,v:"Fuel"},{c:"co_debt",a:30000,v:"Driver debt"}]})],tx:[],loads:[]};var EXT=C.totals(EX,WK);
eq("example: Net 500, business expense 200, profit 800, cash 500, debt paid 300",[EXT.net,EXT.exp,EXT.profit,EXT.cashFlow,EXT.debtPaid],[50000,20000,80000,50000,30000]);agree("example",EX);
// company debt: balance goes down automatically
var DB={stmts:[st0({id:"a1",ded:[{c:"co_debt",a:30000,debt:"d1"}]}),st0({id:"a2",p0:"2026-11-09",p1:"2026-11-15",d:"2026-11-15",ded:[{c:"other",a:20000,v:"DK repayment",dk:"debt",debt:"d1"}]})],tx:[],loads:[],debts:[{id:"d1",company:"CO",opening:100000,items:[{d:"2026-11-16",a:-10000,src:"man"}]}]};
var DC=C.debtCalc(DB)[0];eq("debts: 1,000 − 300 − 200 (any debt-kind line) − 100 paid by hand = 400",[DC.payments,DC.remaining],[60000,40000]);
eq("debts: hand payment lowers cash flow that week, not profit",[C.totals(DB,["2026-11-16","2026-11-22"]).cashFlow,C.totals(DB,["2026-11-16","2026-11-22"]).profit],[-10000,0]);
eq("debts: debt-kind line with no debt chosen is listed for assignment",C.unassignedDebt({stmts:[st0({ded:[{c:"other",a:500,dk:"advance"},{c:"escrow",a:700}]})]}).length,1);agree("debts",DB);
// escrow & reserve are never expenses
var ES={stmts:[st0({ded:[{c:"escrow",a:5000},{c:"reserve",a:2500},{c:"toll",a:1000}]})],tx:[],loads:[]},EST=C.totals(ES,WK);eq("escrow/reserve kept by company: not expense",[EST.exp,EST.escrow],[1000,7500]);agree("escrow",ES);
// truck loan: interest only, from any source
var TK={type:"financed",company:"CO",balance:5000000,aprBp:1200,period:"week"},INT=Math.round(5000000*1200/10000/52);
var LS1={stmts:[st0({ded:[{c:"truck_pay",a:100000}]})],tx:[],loads:[],truck:TK},L1=C.totals(LS1,WK);eq("loan from statement: only interest is expense",[L1.exp,L1.interest,L1.principal],[INT,INT,100000-INT]);agree("loan st",LS1);
var LS2={stmts:[st0({})],tx:[{id:"lt",kind:"exp",paidBy:"own",d:"2026-11-05",a:100000,c:"truck_pay"}],loads:[],truck:TK},L2=C.totals(LS2,WK);
eq("loan paid from own money: interest is expense (was missing), full amount leaves cash",[L2.exp,L2.cashFlow,L2.principal],[INT,C.stmtCalc(LS2.stmts[0]).net-100000,100000-INT]);agree("loan tx",LS2);
var LS3={stmts:[st0({company:"OTHER CO",ded:[{c:"truck_pay",a:100000}]})],tx:[],loads:[],truck:TK},L3=C.totals(LS3,WK);eq("loan line from another company: principal never counted, flagged",[L3.exp,L3.loanUnsplit],[0,100000]);agree("loan other",LS3);
var LS4={stmts:[st0({ded:[{c:"other",a:80000,dk:"loan"}]})],tx:[],loads:[]};eq("loan marked by kind without truck setup: not expense, flagged",[C.totals(LS4,WK).exp,C.totals(LS4,WK).loanUnsplit],[0,80000]);
var LS5={stmts:[st0({ded:[{c:"truck_pay",a:100000}]})],tx:[],loads:[],truck:{type:"lease",company:"CO"}};eq("lease / rent payment: full expense",C.totals(LS5,WK).exp,100000);agree("lease",LS5);
// shop debt: repair once, repayments never again
var SH={stmts:[st0({id:"h1",ded:[{c:"shop_debt",a:50000,shop:"r1"}]}),st0({id:"h2",p0:"2026-11-09",p1:"2026-11-15",d:"2026-11-15",ded:[{c:"shop_debt",a:50000,shop:"r1"}]})],tx:[],loads:[],shop:[{id:"r1",d:"2026-11-04",total:300000,payer:"credit",paidAmt:0}]};
eq("shop: repair 3,000 counted in the repair week only",[C.totals(SH,WK).exp,C.totals(SH,["2026-11-09","2026-11-15"]).exp],[300000,0]);
eq("shop: balance 3,000 − 500 − 500 = 2,000",C.shopCalc(SH)[0].remaining,200000);eq("shop: over the year expense = 3,000 once",C.totals(SH,YR).exp,300000);agree("shop",SH);
// categories from statement wording
eq("categories: fuel / repair / insurance / toll / IFTA / ELD / parking",["FUEL","TRUCK REPAIR","INSURANCE","TOLL","IFTA","ELD","PARKING"].map(function(w){return C.guessCat(w)}),["diesel","truck_repair","truck_ins","toll","ifta","eld","parking"]);
// everything at once, several weeks
var ALL={stmts:[st0({id:"z1",ded:[{c:"diesel",a:150000},{c:"co_debt",a:30000,debt:"d1"},{c:"escrow",a:5000},{c:"truck_pay",a:100000},{c:"shop_debt",a:20000,shop:"r1"},{c:"toll",a:2500}]}),st0({id:"z2",p0:"2026-11-09",p1:"2026-11-15",d:"2026-11-15",ded:[{c:"diesel",a:120000},{c:"truck_pay",a:100000}]})],
 tx:[{id:"q1",kind:"exp",paidBy:"own",d:"2026-11-03",a:4000,c:"parking"},{id:"q2",kind:"exp",paidBy:"company",d:"2026-11-03",a:9000,c:"diesel"},{id:"q3",kind:"exp",paidBy:"own",d:"2026-11-04",a:150000,c:"diesel",link:"z1"}],loads:[],truck:TK,
 debts:[{id:"d1",opening:200000,items:[]}],shop:[{id:"r1",d:"2026-11-05",total:80000,payer:"credit",paidAmt:0}]};
var AT=C.totals(ALL,WK);eq("all-in week: exp = fuel+toll+parking+repair+interest (no debt, escrow, principal, company-card, linked receipt)",AT.exp,150000+2500+4000+80000+INT);
agree("all-in",ALL);eq("all-in: net = sum of statements",C.totals(ALL,YR).net,C.stmtCalc(ALL.stmts[0]).net+C.stmtCalc(ALL.stmts[1]).net);

// ===== ROYCE-like statement: European numbers (18 294,61 / -780,45), dates 01.11.2026, "Driver 88%", DR DEBT (synthetic copy of the values; not the original PDF) =====
var RYr=C.cellRows(fx("royce_like_pdf_items.json")),RY=C.readAll({texts:[{name:"pdf",text:C.rowsText(RYr),rows:RYr}]}),RK=C.stmtCalc(RY);
eq("EU: header — company, driver, truck, period 1–7 Nov (not Jan/Jul)",[RY.company,RY.driver,RY.unit,RY.p0,RY.p1,RY.numFmt],["ROYCE LLC","TEST DRIVER","6771","2026-11-01","2026-11-07","eu"]);
eq("EU: gross 18,294.61 · 88% · commission 2,195.35 · earnings 16,099.26",[RK.gross,RY.rate,RK.fee,RK.earn],[1829461,8800,219535,1609926]);
eq("EU: deductions 8,816.08 · Net Pay 7,283.18 · full match → saved automatically",[RK.ded,RK.net,RY.net,RK.rec.status,C.decide(RY).act],[881608,728318,728318,"full","save"]);
eq("EU: 4 loads with ID, date, miles '1 012', pay",RY.loads.map(function(l){return [l.num,l.pd,l.mi,l.g]}),[["RY-30117","2026-11-01",1012,495000],["RY-30142","2026-11-03",1019,534461],["RY-30155","2026-11-04",2182,360000],["RY-30190","2026-11-06",1790,440000]]);
eq("EU: total miles 6,003",C.sum(RY.loads,"mi"),6003);
var cat={};RY.ded.forEach(function(d){cat[d.c]=(cat[d.c]||0)+d.a});eq("EU: categories — fuel 5,171.53 − 780.45, log book, IFTA, cargo ins, DR DEBT ×2",[cat.diesel,cat.eld,cat.ifta,cat.cargo_ins,cat.co_debt],[517153-78045,4000,3500,35000,400000]);
var RT2=C.totals({stmts:[Object.assign({id:"ry"},RY)],tx:[],loads:[]},["2026-11-01","2026-11-07"]);
eq("EU: DR DEBT is a debt payment, not a business expense",[RT2.debtPaid,RT2.exp,RT2.profit,RT2.cashFlow],[400000,881608-400000,1609926-481608,728318]);
eq("EU: '$8,000' after the total is kept as information only — not a deduction, not a debt balance",[RY.info&&RY.info.map(function(x){return x.a}),RY.bal||null],[[800000],null]);
eq("EU numbers: cents parser",[C.cents("18 294,61"),C.cents("18.294,61"),C.cents("-780,45"),C.cents("8 000,00"),C.cents("1,234.56")],[1829461,1829461,-78045,800000,123456]);
eq("format detection: US documents stay US",[C.numFormat(rowsText(PA)),C.numFormat(rowsText(PB)),C.numFormat("Fuel 5 171,53\nIFTA 35,00")],["us","us","eu"]);
eq("dates: 07.11.2026 in EU = 7 Nov; 13.11.2026 always DMY; 11/07/2026 US unchanged",[C.normNumbers("a 5,00 b 7,00 07.11.2026").text.slice(-10),C.normNumbers("13.11.2026").text,C.normNumbers("11/07/2026").text],["11/07/2026","11/13/2026","11/07/2026"]);
var RYdot=C.parseStatement(C.rowsText(RYr).replace(/(\d) (\d{3},\d{2})/g,"$1.$2"));eq("EU with dot thousands (18.294,61) → same result",[RYdot.gross,C.stmtCalc(RYdot).net],[1829461,728318]);
eq("unreadable PDF never becomes $0 statement",[C.decide(C.readAll({texts:[{name:"pdf",text:""}]})).act,C.decide(C.readAll({texts:[{name:"pdf",text:"[[PAGE 1]]\nROYCE LLC\nWEEK 45\n01.11.2026 - 07.11.2026"}]})).v.why[0]],["warn","noGross"]);
eq("source line kept for every key value (page, line, text)",[RY.from.net.ln,/Net Pay/.test(RY.from.net.t),/Total deductions/.test(RY.from.dedTotal.t),/Driver 88%/.test(RY.from.rate.t),RY.ded.every(function(d){return d.pg&&d.ln||d.v==="Fuel discount"||/Fuel/.test(d.v)})],[RYr.findIndex(function(r){return /Net Pay/.test(r.cells[0].s)})+1,true,true,true,true]);

// ===== REAL statement: ROYCE LLC WEEK 45 (Google Sheets PDF, European numbers, Comments column) — anonymized word positions =====
var RWi=fx("royce_week45_pdf_items.json"),RWr=C.cellRows(RWi),RW=C.readAll({texts:[{name:"pdf",text:C.rowsText(RWr),rows:RWr}]}),RWk=C.stmtCalc(RW);
eq("REAL ROYCE: company / truck (VIN skipped) / period 1–7 Nov / week 45",[RW.company,RW.unit,RW.p0,RW.p1,RW.week],["ROYCE LLC","6771","2026-11-01","2026-11-07",45]);
eq("REAL ROYCE: Gross 18,294.61 · 88% (header 'Amount 88%') · commission 2,195.35 · earnings 16,099.26",[RWk.gross,RW.rate,RWk.fee,RWk.earn],[1829461,8800,219535,1609926]);
eq("REAL ROYCE: commission derived and checked against 88%",/2,195\.35 · 88% × Gross = \$16,099\.26 ✓/.test(RW.from.fee.t),true);
eq("REAL ROYCE: Total Expenses 8,816.08 · Net 7,283.18 (not the $8,000 in Comments) · full → auto-save",[RWk.ded,RW.net,RWk.net,RWk.rec.status,C.decide(RW).act],[881608,728318,728318,"full","save"]);
eq("REAL ROYCE: 4 loads — ID, date, route, miles, freight",RW.loads.map(function(l){return [l.num,l.pd,l.f,l.t,l.mi,l.g]}),[["112PXYCGK","2026-11-02","HENDERSON, NV","Sioux Falls, SD",1424,650865],["112S8MCJ7","2026-11-04","Sioux Falls, SD","Kansas City, KS",363,89522],["1144MLX7L","2026-11-04","LENEXA, KS","Spanaway, WA",1927,399074],["1153HRVRR","2026-11-06","Kent, WA","Franklin, IN",2289,690000]]);
eq("REAL ROYCE: miles 6,003 = printed total row",[C.sum(RW.loads,"mi"),!!RW.from.miles],[6003,true]);
var RWc={};RW.ded.forEach(function(d){RWc[d.c]=(RWc[d.c]||0)+d.a});eq("REAL ROYCE: categories — Log Book, IFTA, Cargo, Fuel 5,171.53 − 780.45 once, DR DEBT 2×2,000",[RWc.eld,RWc.ifta,RWc.cargo_ins,RWc.diesel,RW.ded.filter(function(d){return d.a<0}).length,RWc.co_debt],[4000,3500,35000,517153-78045,1,400000]);
var RWt=C.totals({stmts:[Object.assign({id:"rw"},RW)],tx:[],loads:[]},["2026-11-01","2026-11-07"]);
eq("REAL ROYCE: DR DEBT → debts, business expense 4,816.08, profit 11,283.18, cash 7,283.18",[RWt.debtPaid,RWt.exp,RWt.profit,RWt.cashFlow],[400000,481608,1128318,728318]);
eq("REAL ROYCE: $8,000 (Comments column) only as information — no balance, no Net, no deduction",[RW.info.map(function(x){return x.a}),RW.bal||null,RW.ded.some(function(d){return d.a===800000})],[[800000,800000],null,false]);
eq("REAL ROYCE: source lines — Net from TOTAL PAYABLE, deductions total from Total Expenses",[/^TOTAL PAYABLE \$7,283\.18$/.test(RW.from.net.t),/Total Expenses/.test(RW.from.dedTotal.t),/Amount 88%/.test(RW.from.rate.t)],[true,true,true]);
var RWbad=C.readAll({texts:[{name:"pdf",text:C.rowsText(RWr)}]});eq("REAL ROYCE: without column positions the $8,000 trap is NOT saved (warn)",[C.decide(RWbad).act],["warn"]);
eq("fixture is anonymized (no name, phone, email, address, VIN)",/NURDOOLOT|URMAT|gmail|LINDEN|DAYTON|274 1161|4V4NC9/i.test(JSON.stringify(RWi)),false);

// ===== 🔴 Debts screen =====
var RD=Object.assign({id:"rw"},JSON.parse(JSON.stringify(RW)));RD.ded.forEach(function(d){if(d.c==="co_debt")d.debt="dR"});
var SD={stmts:[RD],tx:[],loads:[],debts:[{id:"dR",company:"ROYCE LLC",type:"loan",opening:null,items:[]}]};
var AD=C.allDebts(SD).filter(function(x){return x.id==="dR"})[0];
eq("ROYCE: $2,000 + $2,000 = $4,000 paid; start unknown → remaining 'unknown' (not −$4,000), yellow",[AD.paid,AD.remaining,AD.status,AD.grp,AD.unit],[400000,null,"unknown","co","6771"]);
eq("ROYCE: debt payments still lower Net Pay but not business expense (unchanged)",[C.stmtCalc(RD).net,C.totals(SD,["2026-11-01","2026-11-07"]).exp],[728318,481608]);
SD.debts[0].opening=1000000;var AD2=C.allDebts(SD)[0];eq("start 10,000 typed → active red, 6,000 left",[AD2.status,AD2.remaining],["active",600000]);
SD.debts[0].opening=0;eq("opening 0 left by default is not a known balance",C.allDebts(SD)[0].status,"unknown");
SD.debts[0].opening=400000;eq("fully repaid → green 'paid'",[C.allDebts(SD)[0].status,C.allDebts(SD)[0].remaining],["paid",0]);
SD.debts[0].opening=null;SD.debts[0].closed="2026-11-20";eq("marked paid with unknown balance → green, no amount invented",[C.allDebts(SD)[0].status,C.debtCalc(SD)[0].payments],["paid",400000]);
var SP2={stmts:[RD],debts:[{id:"dR",opening:1000000,items:[{d:"2026-11-12",a:-50000,src:"man"}]}]};
eq("duplicate hand payment (same day, same amount) is blocked",C.debtPayDup(SP2,"dR","2026-11-12",50000),"same");
eq("same amount as a statement payment within 7 days → asked first",C.debtPayDup(SP2,"dR","2026-11-09",200000),"statement");
eq("different payment is fine",C.debtPayDup(SP2,"dR","2026-11-12",30000),null);
var GD={stmts:[],tx:[],loads:[],debts:[{id:"o1",company:"Friend",type:"other",opening:50000,items:[]}],truck:{type:"financed",owner:"Bank",num:"6771",balance:5000000,aprBp:1200,period:"week"},shop:[{id:"h1",name:"Joe Truck Shop",d:"2026-11-04",total:300000,payer:"credit",paidAmt:0},{id:"h2",name:"Paid shop",d:"2026-11-04",total:10000,payer:"driver",paidAmt:10000}]};
var GA=C.allDebts(GD);eq("groups: other · truck loan · shop on credit (paid-in-full shop not a debt)",GA.map(function(x){return [x.grp,x.name,x.status,x.remaining]}),[["other","Friend","active",50000],["truck","Bank","active",5000000],["shop","Joe Truck Shop","active",300000]]);

// ===== same PDF uploaded twice → counted once =====
var RW2=JSON.parse(JSON.stringify(RD));RW2.id="again";eq("same statement again is recognized (number, week, totals)",[C.stmtSame(RW2,RD),!!C.stmtDup(RW2,{stmts:[RD]})],[true,true]);
var RW3=JSON.parse(JSON.stringify(RD));RW3.ded[0].a+=100;eq("different totals → not 'the same' (user decides)",C.stmtSame(RW3,RD),false);
var RW4=JSON.parse(JSON.stringify(RD)),RW5=JSON.parse(JSON.stringify(RD));RW4.num="ST-1";RW5.num="ST-2";eq("different settlement number → not the same",C.stmtSame(RW4,RW5),false);

// ===== automatic debts (only what statements show) =====
var uidN=0;function U(){return "u"+(++uidN)}
function stW(id,p0,p1,ded,extra){return Object.assign({id:id,company:"ACME",d:p1,p0:p0,p1:p1,gross:300000,rate:10000,loads:[{g:300000}],ded:ded||[]},extra||{})}
var A1={stmts:[stW("a1","2026-11-02","2026-11-08",[],{adv:50000})],debts:[]};A1.stmts.forEach(function(st){C.autoDebts(A1,st,U)});
eq("advance on a statement → new debt, recorded automatically",[A1.debts.length,C.debtCalc(A1)[0].newDebt,C.debtCalc(A1)[0].total,C.debtCalc(A1)[0].remaining],[1,50000,50000,50000]);
A1.stmts.push(stW("a2","2026-11-09","2026-11-15",[{c:"co_debt",a:20000,v:"Advance repayment"}]));C.autoDebts(A1,A1.stmts[1],U);var A1c=C.debtCalc(A1)[0];
eq("next statement repays 200 → total 500 · paid 200 · left 300 (same debt, not a new one)",[A1.debts.length,A1c.total,A1c.payments,A1c.remaining,A1c.status],[1,50000,20000,30000,"active"]);
C.autoDebts(A1,A1.stmts[1],U);eq("running again does not add anything twice",[A1.debts.length,C.debtCalc(A1)[0].payments],[1,20000]);
eq("history: date, amount, which statement",C.debtCalc(A1)[0].items.map(function(i){return [i.d,i.a,i.st.id]}),[["2026-11-08",50000,"a1"],["2026-11-15",-20000,"a2"]]);
var B1={stmts:[stW("b1","2026-11-02","2026-11-08",[{c:"co_debt",a:200000,v:"DR DEBT"}],{bal:[{k:"co",a:800000}]})],debts:[]};C.autoDebts(B1,B1.stmts[0],U);
eq("balance printed on the statement → left 8,000, total = paid + left",[C.debtCalc(B1)[0].remaining,C.debtCalc(B1)[0].total,C.debtCalc(B1)[0].how],[800000,1000000,"statement"]);
B1.stmts.push(stW("b2","2026-11-09","2026-11-15",[{c:"co_debt",a:200000,v:"DR DEBT"}]));C.autoDebts(B1,B1.stmts[1],U);
eq("later payment without a printed balance → 8,000 − 2,000 = 6,000",[C.debtCalc(B1)[0].remaining,C.debtCalc(B1)[0].total,C.debtCalc(B1)[0].payments],[600000,1000000,400000]);
var P1={stmts:[stW("p1","2026-11-02","2026-11-08",[{c:"co_debt",a:200000,v:"DR DEBT"},{c:"co_debt",a:200000,v:"DR DEBT"}])],debts:[]};C.autoDebts(P1,P1.stmts[0],U);var P1c=C.debtCalc(P1)[0];
eq("payments only (ROYCE case) → paid 4,000, total & left 'needs checking', no made-up start",[P1c.payments,P1c.newDebt,P1c.total,P1c.remaining,P1c.status],[400000,0,null,null,"unknown"]);
var R1={stmts:[Object.assign({id:"rr"},RD)],debts:[]};R1.stmts[0].ded.forEach(function(x){delete x.debt});C.autoDebts(R1,R1.stmts[0],U);var R1c=C.debtCalc(R1)[0];
eq("real ROYCE PDF: one ROYCE LLC debt, paid 4,000, $8,000 from Comments not used",[R1.debts.length,R1.debts[0].company,R1c.payments,R1c.total,R1c.remaining],[1,"ROYCE LLC",400000,null,null]);
eq("debts never change Net Pay / business expenses",[C.stmtCalc(R1.stmts[0]).net,C.totals(R1,["2026-11-01","2026-11-07"]).exp],[728318,481608]);

// ===== duplicate company debts (old 'paid' copy + new empty one) are joined =====
var MD={stmts:[Object.assign({id:"m1"},JSON.parse(JSON.stringify(RD)))],debts:[{id:"old",company:"ROYCE LLC",type:"loan",opening:null,items:[],closed:"2026-11-20",auto:true},{id:"new",company:"ROYCE LLC",type:"advance",opening:null,items:[],auto:true}]};
MD.stmts[0].ded.forEach(function(x){if(x.c==="co_debt")x.debt="old"});C.mergeDebts(MD);MD.stmts.forEach(function(st){C.autoDebts(MD,st,U)});C.mergeDebts(MD);
var MDc=C.debtCalc(MD);eq("one ROYCE debt left, 'closed' from the old version cleared, paid 4,000, rest needs checking",[MD.debts.length,MDc[0].payments,MDc[0].status],[1,400000,"unknown"]);
var MD2={stmts:[stW("x1","2026-11-02","2026-11-08",[{c:"co_debt",a:1000,debt:"a"}]),stW("x2","2026-11-09","2026-11-15",[{c:"co_debt",a:500,debt:"b"}])],debts:[{id:"a",company:"ACME",opening:null,items:[]},{id:"b",company:"acme",opening:null,items:[]}]};
C.mergeDebts(MD2);eq("two records of the same company joined, both payments kept",[MD2.debts.length,C.debtCalc(MD2)[0].payments],[1,1500]);
C.autoDebts(MD2,MD2.stmts[0],U);eq("already linked statement creates no new empty debt",MD2.debts.length,1);

// ===== field names: Total Trip Gross / Net Amount (Earning) / Other + Recurring Deductions / Payout — SYNTHETIC text with the user's totals, not the original PDF =====
var PO=C.parseStatement(["CARRIER X LLC","Trip 1001  Gross $6,000.00  Net Amount $5,280.00","Trip 1002  Gross $5,082.02  Net Amount $4,472.17","Total Trip Gross  $11,082.02","Net Amount  $9,752.17",
 "Other Deductions","Fuel  $3,602.02","Cash Advance  $500.00","Toll  $315.00","Oregon miles  $100.00","Total Other Deductions  $4,517.02",
 "Recurring Deductions","Insurance  $450.00","ELD  $40.00","Trailer  $175.00","Total Recurring Deductions  $665.00","Payout  $4,570.15"].join("\n")),POk=C.stmtCalc(PO);
eq("labels: Gross from Total Trip Gross (not a trip line), Earning from Net Amount, Payout = original Net Pay",[PO.gross,PO.earn,PO.net,/Payout/.test(PO.from.net.t)],[1108202,975217,457015,true]);
eq("labels: Other 4,517.02 + Recurring 665.00 = 5,182.02; 9,752.17 − 5,182.02 = 4,570.15 ✓ (no load list in this text → one-tap confirm)",[PO.dedTotal,POk.ded,POk.net,POk.rec.status,C.decide(PO).act],[518202,518202,457015,"partial","confirm"]);
eq("labels: Cash Advance → debt/advance, Toll & Oregon miles → expenses",PO.ded.filter(function(d){return /Cash|Toll|Oregon/.test(d.v)}).map(function(d){return [d.v,C.kindOf(d.c,{},d)]}),[["Cash Advance","debt"],["Toll","expense"],["Oregon miles","expense"]]);
var POt=C.totals({stmts:[Object.assign({},PO,{id:"po",d:"2026-11-08",p1:"2026-11-08"})],tx:[],loads:[]},["2026-11-02","2026-11-08"]);
eq("labels: cash advance not a business expense, each deduction once",[POt.debtPaid,POt.exp],[50000,518202-50000]);
var PO2=C.parseStatement("Gross  $5,000.00\nNet Amount  $4,400.00\nFuel  $400.00\nTotal Deductions  $400.00");eq("no Payout printed → 'Net Amount' is the net",[PO2.net,PO2.earn],[440000,null]);

// ===== REAL statement: Pro Truck Inc "Driver Payroll" (anonymized word positions) =====
var PTi=fx("protruck_2026_46_pdf_items.json"),PTr=C.cellRows(PTi),PT=C.readAll({texts:[{name:"pdf",text:C.rowsText(PTr),rows:PTr}]}),PTk=C.stmtCalc(PT);
eq("REAL Pro Truck: company (not the driver's name on line 1), driver, truck, period Nov 10–16",[PT.company,PT.driver,PT.unit,PT.p0,PT.p1],["Pro Truck Inc","TEST DRIVER","2001","2026-11-10","2026-11-16"]);
eq("REAL Pro Truck: Gross = Total Trip Gross 11,082.02 · Earning 9,752.17 (not the YTD numbers on the same line)",[PTk.gross,PT.earn,/^Total Trip Gross/.test(PT.from.gross.t),/^Earning/.test(PT.from.earn.t)],[1108202,975217,true,true]);
eq("REAL Pro Truck: Other 4,517.02 + Recurring 665.00 = 5,182.02 · Payout 4,570.15 · full → auto-save",[PTk.ded,PT.net,PTk.net,PTk.rec.status,C.decide(PT).act,/Payout/.test(PT.from.net.t)],[518202,457015,457015,"full","save",true]);
eq("REAL Pro Truck: 3 trips with origin/destination and gross",PT.loads.map(function(l){return [l.num,l.f,l.t,l.g]}),[["15395","Kent, WA","Shafter, CA",183898],["15366","Shafter, CA","Vacaville, CA",229534],["15428","Stockton, CA","Kenosha, WI",694770]]);
eq("REAL Pro Truck: miles from the summary (loaded 3,769 · deadhead 1,081 · total 4,850), 'Total Loaded' never used as Gross",[PT.docLoaded,PT.docEmpty,PT.docMiles],[3769,1081,4850]);
var PTc={};PT.ded.forEach(function(d){PTc[d.v.split(" ")[0]]=[d.c,d.a,C.kindOf(d.c,{},d)]});
eq("REAL Pro Truck: each deduction once, right meaning",[PT.ded.length,PTc.Tolls,PTc.Oregon,PTc.Cash,PTc.Administration,PTc.Cargo,PTc.OCCAC,PTc.Physical],[7,["toll",6630,"expense"],["ifta",95072,"expense"],["co_debt",350000,"debt"],["co_fee",11500,"expense"],["cargo_ins",45000,"expense"],["truck_ins",3500,"expense"],["truck_ins",6500,"expense"]]);
var PTt=C.totals({stmts:[Object.assign({},PT,{id:"pt"})],tx:[],loads:[]},["2026-11-10","2026-11-16"]);
eq("REAL Pro Truck: Cash Advance $3,500 → debts, expenses 1,682.02, profit 8,070.15, take-home 4,570.15",[PTt.debtPaid,PTt.exp,PTt.profit,PTt.net],[350000,168202,975217-168202,457015]);
eq("fixture anonymized",/ANVAR|ALAPAEV|WARING|PHILADELPHIA|8008442080/i.test(JSON.stringify(PTi)),false);
console.log("\nPASS "+pass+"  FAIL "+fail+"  NOT RUN "+SKIP);process.exit(fail||SKIP?1:0);
