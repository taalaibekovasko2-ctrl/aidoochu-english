/* Жол Эсеп — UI. ES5. Uses window.JE (core.js). */
(function(){
"use strict";
var C=window.JE,LS="jolesep_v1";
var T={
kg:{app:"Жол Эсеп",tag:"Тракисттин эсеби",free:"100% бекер",today:"Бүгүн",week:"Апта",month:"Ай",year:"Жыл",all:"Баары",custom:"Тандоо",
home:"Башкы",stmts:"Стейтмент",exps:"Чыгашалар",tax:"Салык",more:"Дагы",
gross:"Gross (жүктүн баасы)",fee:"Компаниянын комиссиясы",earn:"Айдоочунун кирешеси",exp:"Жалпы чыгашалар",net:"Стейтмент боюнча Net Pay",profit:"Чыныгы бизнес пайда",loaded:"Жүктүү миль",empty:"Бош миль (deadhead)",gpm:"Gross / миль",npm:"Пайда / миль",fpm:"Май / миль",mpg:"MPG",noData:"Маалымат жок",
upSt:"Стейтмент жүктөө",upStSub:"скриншот же PDF",receipt:"Чек тартуу",manual:"Кол менен кошуу",
stmt:"Стейтмент",stRead:"Окулуп жатат…",stWait:"Бир нече скриншот болсо, баарын бирден тандаңыз. PDF да болот. 10–40 секунд.",stNone:"Эч нерсе табылган жок. Скриншот даана болушу керек.",
review:"Текшерип, «Сактоо» басыңыз. Табылбаган сумма бош калат — өзүңүз толтуруңуз. Мен эч нерсени ойлоп таппайм.",
company:"Компания",num:"Settlement №",stDate:"Стейтмент датасы",p0:"Мезгил: башы",p1:"Мезгил: аягы",rate:"Айдоочунун пайызы, %",earnL:"Driver Earnings (бар болсо)",adv:"Аванс (Advance)",reimb:"Кайтарылган акча (Reimbursement)",other:"Кошумча төлөм (detention, bonus)",netSt:"Net Pay (стейтментте)",dedTot:"Total Deductions (стейтментте)",fuelRet:"Fuel Retail",fuelInv:"Fuel Invoice (төлөнгөнү)",days:"Бул мезгилде жолдо болгон күн",
loads:"Рейстер",ded:"Кармоолор",unk:"Текшерүү керек",ignore:"Эсепке кошпоо",addRow:"+ сап",
rec:"Салыштыруу (Reconciliation)",recSt:"Компаниянын Net Pay",recCalc:"Платформа эсептеген",recDiff:"Айырма",recOk:"Дал келет ✓",recWhy:"Айырманын себеби",whyDed:"Кармоолордун суммасы стейтменттеги Total'дон айырмаланат",whyEarn:"Driver Earnings пайызга туура келбейт",whyUnk:"Себеби белгисиз — саптарды текшериңиз",noRate:"Пайыз же Driver Earnings жок — комиссия 0 деп алынды",
save:"Сактоо",del:"Өчүрүү",cancel:"Жокко чыгаруу",edit:"Өзгөртүү",close:"Жабуу",
dupSt:"Бул аптанын стейтменти мурда жүктөлгөн. Эки жолу эсептелбеши үчүн тандаңыз:",dupReplace:"Жаңысы менен алмаштыруу",dupKeep:"Баары бир кошуу",
amt:"Сумма, $",date:"Дата",cat:"Категория",vendor:"Дүкөн / компания",note:"Эскертүү",gal:"Галлон",ret:"Retail баасы, $",inv:"Invoice (төлөнгөн), $",state:"Штат",ref:"Транзакция №",
paidBy:"Ким төлөдү?",card:"💳 Компаниянын fuel картасы / компания төлөдү (стейтментте кармалат)",own:"💵 Өз акчам / өз картам",
cardNote:"Бул чек чыгашага кошулбайт — ал стейтменттен кармалат. Галлон, баа жана MPG үчүн гана сакталат.",
photo:"📷 Чекти тартуу",reading:"Чек окулуп жатат…",ocrOk:"Чек окулду — текшериңиз",ocrFail:"Окуй алган жокмун — колго жазыңыз",ocrOff:"Окуу үчүн интернет керек",
dupT:"⚠️ Кайталанышы мүмкүн",dupQ:"Ушундай чыгым мурун эле бар:",dupSame:"Бул ошол эле — бир жолу эсепте",dupDiff:"Жок, бул башка чыгым",dupPer:"Бул мезгилдин стейтментинде күйүүчү май кармалган. Бул чек ошонун ичинде болушу мүмкүн.",
kExp:"Чыгаша",kLoad:"Рейс (стейтментсиз)",kReimb:"Кайтарылган акча",kInc:"Кошумча киреше",from:"Каяктан",to:"Каякка",gAmt:"Gross, $",mi:"Жүктүү миль",dh:"Бош миль",earnAmt:"Айдоочуга тийген, $",
groups:"Чыгашалар топтор боюнча",sources:"Бул сумма эмнеден түзүлдү",empty0:"Бул мезгилде маалымат жок",
fuelT:"Күйүүчү май",dGal:"Дизель галлон",defGal:"DEF галлон",avgP:"Орточо баа / галлон",saved:"Арзандатуудан үнөм",
role:"Иштөө түрү",oo:"Owner-operator (компанияга lease)",own_:"Өз авторитети / трак ээси",company_:"Компания айдоочусу (W-2)",
payType:"Төлөм түрү (кол менен кошулган рейстер үчүн)",pPct:"Пайыз %",pMile:"Миль үчүн $",pLoad:"Рейс үчүн $",pDay:"Күн үчүн $",pFlat:"Туруктуу сумма",payRate:"Чен",
status:"Үй-бүлө абалы",single:"Бойдок (Single)",mfj:"Үй-бүлөлүү, бирге (MFJ)",hoh:"Үй-бүлө башчысы (HoH)",stRate:"Штаттын салыгы, %",paidAmt:"Быйыл төлөнгөн estimated tax, $",
taxT:"Болжолдуу салык",disc:"⚠️ Болжолдуу эсеп, салык кеңеши эмес. Колдонмо салык тапшырбайт — бухгалтер (CPA) менен текшериңиз. 2026-жылдын эрежелери.",sc:"Бизнес пайда − per diem",se:"Self-employment (15.3%)",fed:"Федералдык салык",st:"Штаттын салыгы",total:"Жалпы салык (болжол)",paid:"Төлөнгөн",left:"Дагы төлөш керек",pd:"Per diem чегерими",w2:"W-2 айдоочунун салыгын компания өзү кармайт. Бул жерде эсеп көрсөтүлбөйт.",
tripDays:"Кошумча рейс күндөрү",addDays:"+ Күндөр",dfrom:"Чыккан күн",dto:"Келген күн",
report:"📄 Бухгалтерге отчет",csv:"📊 Excel (CSV)",backup:"💾 Резерв көчүрмө",restore:"♻️ Резервден калыбына келтирүү",wipe:"Баарын өчүрүү",wipeQ:"Бардык маалымат өчөт. Макулсузбу?",
hist:"Өзгөртүүлөрдүн тарыхы",privacy:"🔒 Маалымат ушул телефондо гана сакталат, эч жакка жөнөтүлбөйт. Телефон алмаштырсаңыз — «Резерв көчүрмө» жасаңыз.",settings:"Жөндөөлөр",
saved_:"Сакталды ✓",deleted:"Өчүрүлдү",restored:"Калыбына келди ✓",badFile:"Файл туура эмес",need:"Сумманы жазыңыз",linked:"Бир жолу эсептелет ✓",
noSt:"Стейтмент жок. Башкы беттен «Стейтмент жүктөө» басыңыз.",stmtsN:"стейтмент",loadsN:"рейс",perDays:"күн",custFrom:"Башы",custTo:"Аягы",apply:"Көрсөтүү",
t_home:"Башкы",t_loads:"Рейстер",t_exps:"Чыгашалар",t_prof:"Профиль",t_net:"Таза киреше",t_biz:"Бизнес киреше",t_exp:"Чыгашалар",t_miles:"Миль",t_addLoad:"Рейс кошуу",t_upSt:"Стейтмент",t_addExp:"Чыгаша кошуу",t_scan:"Чек тартуу",all2:"Баары",biz:"Бизнес",pers:"Жеке",taxSum:"Салык",estBiz:"Бизнес кирешенин баасы",afterDed:"чегерүүлөрдөн кийин",daysTrip:"Рейстеги күндөр",dupBan:"Бир стейтмент эки жолу кошулган",fix:"Оңдоо",dupBanQ:"Бул экөө бир эле стейтмент окшойт. Эмне кылалы?",mergeOne:"Бирөө кылуу (бириктирүү)",keepNew:"Жаңысын калтырып, эскисин өчүрүү",notSame:"Бул эки башка стейтмент",dataT:"Маалымат",more2:"Дагы маалымат",netChk:"Net Pay текшерүү",page2:"Бул ошол стейтменттин 2-бети — кошуу",moreCats:"Башка категориялар",t_cash:"Колго тийген акча / Net Pay",ownExp:"Өз чыгашалар (стейтменттен тышкары)",srcDoc:"Документтен алынды",srcMan:"Кол менен",noRpm:"Миль жок — RPM эсептелбейт",miSource:"Булагы",optional:"милдеттүү эмес",pgS:"б.",lnS:"сап ",trOwner:"Трак ээси",trOrig:"Баштапкы карыз, $",leasePay:"Ижара/лизинг төлөмү",whoPaid:"Ким төлөдү",sp_driver:"Айдоочу",sp_owner:"Трак ээси",sp_company:"Компания",sp_credit:"Шоп кредити",sp_install:"Бөлүп төлөө",shopTransfer:"Компания төлөп, карызды мага жазды → «Компанияга карыз»",m_escrow:"Escrow / Reserve",escrowNote:"Сиздин акчаңыз, компанияда сакталууда — чыгаша эмес",chkT:"Текшерүү",whyGross:"Gross рейстердин суммасына дал келбейт",dt_prev:"Previous Balance",autoAdded:"Стейтмент автоматтык кошулду",linkedS:"кол менен жазылган чыгаша бир жолу эсептелди",setType:"түрүн тандаңыз",balUnk:"Калдык белгисиз",m_mi:"Миль жана RPM",m_truck:"Трак жана лизинг",m_debt:"Компанияга карыз",m_shop:"Truck Shop",notSet:"Тандала элек",none:"Жок",debtsN:"карыз",repairsN:"ремонт",balance:"Калдык",paidY:"Төлөндү",estS:"Болжолдуу",estNote:"≈ Миль стейтментте жок — рейстердин шаарлары боюнча картадан болжолдуу эсептелди. Баштапкы жана акыркы бош жол кошулган жок. Так санды өзүңүз оңдой аласыз.",editMi:"Милди оңдоо",t_more2:"Дагы",trType:"Иштөө / трак түрү",tt_company:"Company Truck",tt_oo:"Owner Operator",tt_rental:"Truck Rental",tt_lease:"Weekly Lease",tt_lto:"Lease-to-Own",tt_financed:"Financed Truck",tt_owned:"Fully Owned Truck",trNum:"Трак №",trPay:"Төлөм, $",trPer:"Мезгил",trBal:"Карыздын калдыгы, $",trApr:"Пайыз (APR), %",trDue:"Төлөө күнү",interest:"Пайызы (чыгаша)",principal:"Негизги карыз (чыгаша эмес)",trNote:"Стейтменттеги «Truck Payment» кармоосу калдыкты өзү азайтат. Кредитте пайызы чыгаша, негизги сумма — карыз төлөмү.",dType:"Карыздын түрү",dt_advance:"Cash Advance",dt_loan:"Company Loan",dt_neg:"Терс баланс",dt_fuel_adv:"Fuel Advance",dt_repair_adv:"Repair Advance",dt_ins:"Insurance Debt",dt_damage:"Damage Chargeback",dt_other:"Башка карыз",opening:"Баштапкы калдык",newDebt:"Жаңы карыз",payments:"Төлөм",remaining:"Калды",addDebt:"Карыз кошуу",debtNote:"Стейтменттеги карыз кармоолору калдыкты өзү азайтат жана чыгаша катары эки жолу эсептелбейт.",addRepair:"Ремонт кошуу",shopName:"Шоп",shopAddr:"Дареги",invNum:"Инвойс №",repDesc:"Эмне жасалды",parts:"Тетиктер, $",labor:"Иш акы, $",totalRep:"Жалпы ремонт, $",coPaid:"Компания төлөдү, $",drvPaid:"Өзүм төлөдүм, $",paidS:"Төлөндү",shopNote:"Ремонт карызы стейтменттен кармалса, калдык өзү азаят.",shopNote2:"Чыгашага өзүңүз төлөгөн жана стейтменттен кармалган сумма гана кошулат — инвойстун өзү эки жолу эсептелбейт.",negCarried:"Net Pay терс — сумма «Компанияга карыз» бөлүмүнө кийинки жумага өттү",totMi:"Миль",autoMi:"Милди картадан автоматтык эсептөө",autoMiWait:"Шаарлардын ортосундагы жол эсептелип жатат…",autoMiOk:"Эсептелди — текшерип, «Сактоо» басыңыз",autoMiFail:"Эсептей албадым — колго жазыңыз",autoMiN:"картадан эсептелди",afterFee:"Комиссиядан кийин",feeS:"Комиссия",autoMiWait2:"эсептелүүдө…",afterDed2:"Бардык кармоолордон кийин Net Pay",recGood:"Стейтмент менен дал келет",recBad:"Компаниянын стейтментинен айырма бар",enterMi:"Милди жазуу",linkedN:"Сакталды ✓ Кол менен жазылган N чыгаша стейтментте бар экен — бир жолу эсептелди",ocrFix:"Скриншотто $ белгиси 8 же 5 болуп окулуп калган сумма Total Deductions боюнча оңдолду",
counted:"эсепке кирет",notCounted:"эсепке кирбейт",fromSt:"стейтменттен",dupMark:"кайталанма",linkMark:"стейтментке тиркелген",cardMark:"компания картасы"},
ru:{}};
/* Russian strings */
(function(){var r={app:"Жол Эсеп",tag:"Учёт тракиста",free:"100% бесплатно",today:"Сегодня",week:"Неделя",month:"Месяц",year:"Год",all:"Всё время",custom:"Даты",
home:"Главная",stmts:"Стейтменты",exps:"Расходы",tax:"Налог",more:"Ещё",
gross:"Gross (стоимость грузов)",fee:"Комиссия компании",earn:"Доход водителя",exp:"Все расходы",net:"Net Pay по стейтменту",profit:"Реальная прибыль бизнеса",loaded:"Мили с грузом",empty:"Пустые мили (deadhead)",gpm:"Gross / миля",npm:"Прибыль / миля",fpm:"Топливо / миля",mpg:"MPG",noData:"Нет данных",
upSt:"Загрузить стейтмент",upStSub:"скриншот или PDF",receipt:"Сфотографировать чек",manual:"Добавить вручную",
stmt:"Стейтмент",stRead:"Читаю…",stWait:"Если скриншотов несколько — выберите все сразу. PDF тоже можно. 10–40 секунд.",stNone:"Ничего не найдено. Скриншот должен быть чётким.",
review:"Проверьте и нажмите «Сохранить». Не найденная сумма остаётся пустой — заполните сами. Я ничего не выдумываю.",
company:"Компания",num:"Settlement №",stDate:"Дата стейтмента",p0:"Период: начало",p1:"Период: конец",rate:"Процент водителя, %",earnL:"Driver Earnings (если есть)",adv:"Аванс (Advance)",reimb:"Возмещение (Reimbursement)",other:"Доп. оплата (detention, bonus)",netSt:"Net Pay (в стейтменте)",dedTot:"Total Deductions (в стейтменте)",fuelRet:"Fuel Retail",fuelInv:"Fuel Invoice (оплачено)",days:"Дней в дороге за период",
loads:"Рейсы",ded:"Удержания",unk:"Нужна проверка",ignore:"Не учитывать",addRow:"+ строка",
rec:"Сверка (Reconciliation)",recSt:"Net Pay компании",recCalc:"Расчёт платформы",recDiff:"Разница",recOk:"Совпадает ✓",recWhy:"Причина разницы",whyDed:"Сумма удержаний отличается от Total в стейтменте",whyEarn:"Driver Earnings не совпадает с процентом",whyUnk:"Причина неизвестна — проверьте строки",noRate:"Нет процента или Driver Earnings — комиссия принята 0",
save:"Сохранить",del:"Удалить",cancel:"Отмена",edit:"Изменить",close:"Закрыть",
dupSt:"Стейтмент за эту неделю уже загружен. Чтобы не посчитать дважды, выберите:",dupReplace:"Заменить новым",dupKeep:"Всё равно добавить",
amt:"Сумма, $",date:"Дата",cat:"Категория",vendor:"Магазин / компания",note:"Заметка",gal:"Галлоны",ret:"Retail цена, $",inv:"Invoice (оплачено), $",state:"Штат",ref:"№ транзакции",
paidBy:"Кто оплатил?",card:"💳 Топливная карта компании / оплатила компания (удержат в стейтменте)",own:"💵 Мои деньги / моя карта",
cardNote:"Этот чек не добавляется в расходы — его удержат в стейтменте. Хранится для галлонов, цены и MPG.",
photo:"📷 Сфотографировать чек",reading:"Читаю чек…",ocrOk:"Чек прочитан — проверьте",ocrFail:"Не удалось прочитать — введите вручную",ocrOff:"Для чтения нужен интернет",
dupT:"⚠️ Возможный дубликат",dupQ:"Похожий расход уже есть:",dupSame:"Это тот же — считать один раз",dupDiff:"Нет, это другой расход",dupPer:"В стейтменте за этот период удержано топливо. Этот чек может входить в него.",
kExp:"Расход",kLoad:"Рейс (без стейтмента)",kReimb:"Возмещение",kInc:"Доп. доход",from:"Откуда",to:"Куда",gAmt:"Gross, $",mi:"Мили с грузом",dh:"Пустые мили",earnAmt:"Водителю, $",
groups:"Расходы по группам",sources:"Из чего состоит сумма",empty0:"За этот период нет данных",
fuelT:"Топливо",dGal:"Дизель, галлоны",defGal:"DEF, галлоны",avgP:"Средняя цена / галлон",saved:"Экономия на скидке",
role:"Тип работы",oo:"Owner-operator (lease к компании)",own_:"Своя авторити / владелец трака",company_:"Водитель компании (W-2)",
payType:"Тип оплаты (для рейсов вручную)",pPct:"Процент %",pMile:"$ за милю",pLoad:"$ за рейс",pDay:"$ за день",pFlat:"Фикс. сумма",payRate:"Ставка",
status:"Семейное положение",single:"Холост (Single)",mfj:"В браке, совместно (MFJ)",hoh:"Глава семьи (HoH)",stRate:"Налог штата, %",paidAmt:"Уплачено estimated tax в этом году, $",
taxT:"Примерный налог",disc:"⚠️ Примерный расчёт, не налоговая консультация. Приложение не подаёт налоги — проверьте у бухгалтера (CPA). Правила 2026 года.",sc:"Прибыль бизнеса − per diem",se:"Self-employment (15.3%)",fed:"Федеральный налог",st:"Налог штата",total:"Всего налогов (примерно)",paid:"Уплачено",left:"Осталось заплатить",pd:"Вычет per diem",w2:"Налог W-2 водителя удерживает компания. Расчёт не показывается.",
tripDays:"Доп. дни в рейсе",addDays:"+ Дни",dfrom:"Дата выезда",dto:"Дата возвращения",
report:"📄 Отчёт для бухгалтера",csv:"📊 Excel (CSV)",backup:"💾 Резервная копия",restore:"♻️ Восстановить из копии",wipe:"Удалить всё",wipeQ:"Все данные будут удалены. Уверены?",
hist:"История изменений",privacy:"🔒 Данные хранятся только на этом телефоне и никуда не отправляются. При смене телефона сделайте «Резервную копию».",settings:"Настройки",
saved_:"Сохранено ✓",deleted:"Удалено",restored:"Восстановлено ✓",badFile:"Неверный файл",need:"Введите сумму",linked:"Будет учтено один раз ✓",
noSt:"Стейтментов нет. На главной нажмите «Загрузить стейтмент».",stmtsN:"стейтм.",loadsN:"рейс.",perDays:"дн.",custFrom:"С",custTo:"По",apply:"Показать",
t_home:"Главная",t_loads:"Рейсы",t_exps:"Расходы",t_prof:"Профиль",t_net:"Чистый доход",t_biz:"Бизнес-доход",t_exp:"Расходы",t_miles:"Мили",t_addLoad:"Добавить рейс",t_upSt:"Стейтмент",t_addExp:"Добавить расход",t_scan:"Снять чек",all2:"Все",biz:"Рабочее",pers:"Личное",taxSum:"Налоговая сводка",estBiz:"Оценка Business Income",afterDed:"после учтённых вычетов",daysTrip:"Дни в рейсе",dupBan:"Один стейтмент добавлен дважды",fix:"Исправить",dupBanQ:"Похоже, это один и тот же стейтмент. Что сделать?",mergeOne:"Сделать одним (объединить)",keepNew:"Оставить новый, удалить старый",notSame:"Это разные стейтменты",dataT:"Данные",more2:"Ещё данные",netChk:"Проверка Net Pay",page2:"Это 2-я страница того же стейтмента — добавить",moreCats:"Другие категории",t_cash:"На руки / Net Pay",ownExp:"Свои расходы (вне стейтмента)",srcDoc:"Из документа",srcMan:"Вручную",noRpm:"Нет миль — RPM не считается",miSource:"Источник",optional:"необязательно",pgS:"с.",lnS:"стр. ",trOwner:"Владелец трака",trOrig:"Начальный долг, $",leasePay:"Платёж аренды/лизинга",whoPaid:"Кто оплатил",sp_driver:"Водитель",sp_owner:"Владелец трака",sp_company:"Компания",sp_credit:"Кредит шопа",sp_install:"Рассрочка",shopTransfer:"Компания оплатила и записала долг на меня → «Долг компании»",m_escrow:"Escrow / Reserve",escrowNote:"Ваши деньги, хранятся у компании — не расход",chkT:"Проверка",whyGross:"Gross не совпадает с суммой рейсов",dt_prev:"Previous Balance",autoAdded:"Стейтмент добавлен автоматически",linkedS:"ручных расхода учтены один раз",setType:"выберите тип",balUnk:"Остаток неизвестен",m_mi:"Мили и RPM",m_truck:"Трак и лизинг",m_debt:"Долг компании",m_shop:"Truck Shop",notSet:"Не выбрано",none:"Нет",debtsN:"долг(а)",repairsN:"ремонт(а)",balance:"Остаток",paidY:"Оплачено",estS:"Примерно",estNote:"≈ Миль нет в стейтменте — посчитано примерно по карте по городам рейсов. Начальный и конечный порожний путь не добавлен. Точное число можно исправить.",editMi:"Исправить мили",t_more2:"Ещё",trType:"Тип работы / трака",tt_company:"Company Truck",tt_oo:"Owner Operator",tt_rental:"Truck Rental",tt_lease:"Weekly Lease",tt_lto:"Lease-to-Own",tt_financed:"Financed Truck",tt_owned:"Fully Owned Truck",trNum:"Трак №",trPay:"Платёж, $",trPer:"Период",trBal:"Остаток долга, $",trApr:"Процент (APR), %",trDue:"День платежа",interest:"Проценты (расход)",principal:"Тело кредита (не расход)",trNote:"Удержание «Truck Payment» в стейтменте само уменьшает остаток. В кредите проценты — расход, тело — погашение долга.",dType:"Тип долга",dt_advance:"Cash Advance",dt_loan:"Company Loan",dt_neg:"Отрицательный баланс",dt_fuel_adv:"Fuel Advance",dt_repair_adv:"Repair Advance",dt_ins:"Insurance Debt",dt_damage:"Damage Chargeback",dt_other:"Другой долг",opening:"Начальный остаток",newDebt:"Новый долг",payments:"Оплата",remaining:"Осталось",addDebt:"Добавить долг",debtNote:"Удержания долга в стейтменте сами уменьшают остаток и не считаются расходом дважды.",addRepair:"Добавить ремонт",shopName:"Шоп",shopAddr:"Адрес",invNum:"Инвойс №",repDesc:"Что сделано",parts:"Запчасти, $",labor:"Работа, $",totalRep:"Всего ремонт, $",coPaid:"Оплатила компания, $",drvPaid:"Оплатил сам, $",paidS:"Оплачено",shopNote:"Если долг за ремонт удерживают в стейтменте, остаток уменьшается сам.",shopNote2:"В расходы идёт только то, что вы заплатили сами и что удержано в стейтменте — сам инвойс не считается дважды.",negCarried:"Net Pay отрицательный — сумма перенесена в «Долг компании» на следующую неделю",totMi:"Мили",autoMi:"Посчитать мили по карте",autoMiWait:"Считаю маршрут между городами…",autoMiOk:"Готово — проверьте и нажмите «Сохранить»",autoMiFail:"Не удалось — введите вручную",autoMiN:"по карте",afterFee:"После комиссии",feeS:"Комиссия",autoMiWait2:"считаю…",afterDed2:"Net Pay после всех удержаний",recGood:"Совпадает со стейтментом",recBad:"Есть разница со стейтментом компании",enterMi:"Ввести мили",linkedN:"Сохранено ✓ N расход(а), введённых вручную, есть в стейтменте — учтены один раз",ocrFix:"Сумма, где $ прочитался как 8 или 5, исправлена по Total Deductions",counted:"учитывается",notCounted:"не учитывается",fromSt:"из стейтмента",dupMark:"дубликат",linkMark:"привязан к стейтменту",cardMark:"карта компании"};T.ru=r})();

T.kz={app:"Жол Есеп",free:"100% тегін",tag:"Тракисттің есебі",today:"Бүгін",week:"Апта",month:"Ай",year:"Жыл",all:"Барлығы",
t_home:"Басты",t_loads:"Рейстер",t_exps:"Шығындар",t_more2:"Тағы",t_prof:"Профиль",t_cash:"Қолға тиген ақша / Net Pay",t_miles:"Миль",t_addLoad:"Рейс қосу",t_upSt:"Стейтмент",t_addExp:"Шығын қосу",t_scan:"Чек түсіру",t_exp:"Шығындар",t_biz:"Бизнес табыс",t_loads2:"Рейстер",
feeS:"Комиссия",ded:"Ұсталымдар",ownExp:"Өз шығындарыңыз (стейтменттен тыс)",recGood:"Стейтментпен сәйкес келеді",recBad:"Стейтменттен айырма бар",noData:"Дерек жоқ",noRpm:"Миль жоқ — RPM есептелмейді",enterMi:"Мильді жазу",autoMiWait2:"есептелуде…",
srcDoc:"Құжаттан алынды",srcMan:"Қолмен",estS:"Шамамен",miSource:"Көзі",editMi:"Мильді түзету",autoMi:"Мильді картадан автоматты есептеу",autoMiWait:"Қалалар арасындағы жол есептелуде…",autoMiOk:"Есептелді — тексеріп, «Сақтау» басыңыз",autoMiFail:"Есептей алмадым — қолмен жазыңыз",
estNote:"≈ Миль стейтментте жоқ — рейстердің қалалары бойынша картадан шамамен есептелді. Бастапқы және соңғы бос жол қосылмады. Нақты санды өзіңіз түзете аласыз.",
mi:"Жүкті миль",dh:"Бос миль",totMi:"Миль",m_mi:"Миль және RPM",m_truck:"Трак және лизинг",m_debt:"Компанияға қарыз",m_shop:"Truck Shop",m_escrow:"Escrow / Reserve",escrowNote:"Сіздің ақшаңыз, компанияда сақталуда — шығын емес",
notSet:"Таңдалмаған",none:"Жоқ",balance:"Қалдық",paidY:"Төленді",balUnk:"Қалдық белгісіз",setType:"түрін таңдаңыз",debtsN:"қарыз",repairsN:"жөндеу",
stmt:"Стейтмент",stRead:"Оқылуда…",stWait:"Бірнеше скриншот болса, бәрін бірден таңдаңыз. PDF те болады. 10–40 секунд.",stNone:"Ештеңе табылмады. Скриншот анық болуы керек.",review:"Тексеріп, «Сақтау» басыңыз. Табылмаған сома бос қалады — өзіңіз толтырыңыз. Мен ештеңені ойдан шығармаймын.",
p0:"Кезең: басы",p1:"Кезең: соңы",rate:"Жүргізуші пайызы, %",loads:"Рейстер",unk:"Тексеру керек",ignore:"Есепке қоспау",addRow:"+ жол",more2:"Қосымша мәлімет",
save:"Сақтау",del:"Өшіру",cancel:"Болдырмау",edit:"Өзгерту",autoAdded:"Стейтмент автоматты қосылды",dupSt:"Бұл аптаның стейтменті бұрын жүктелген. Екі рет есептелмеуі үшін таңдаңыз:",dupReplace:"Жаңасымен ауыстыру",page2:"Бұл сол стейтменттің 2-беті — қосу",
saved_:"Сақталды ✓",deleted:"Өшірілді",need:"Соманы жазыңыз",amt:"Сома, $",date:"Күні",cat:"Санат",vendor:"Дүкен / компания",note:"Ескерту",paidBy:"Кім төледі?",card:"💳 Компанияның fuel картасы / компания төледі (стейтментте ұсталады)",own:"💵 Өз ақшам / өз картам",
photo:"📷 Чекті түсіру",empty0:"Бұл кезеңде дерек жоқ",loadsN:"рейс",perDays:"күн",chkT:"Тексеру",
taxSum:"Салық",estBiz:"Бизнес табыстың бағасы",afterDed:"шегерімдерден кейін",daysTrip:"Рейстегі күндер",disc:"⚠️ Шамамен есеп, салық кеңесі емес. Қосымша салық тапсырмайды — бухгалтермен (CPA) тексеріңіз.",
report:"📄 Бухгалтерге есеп",csv:"📊 Excel (CSV)",addDays:"+ Күндер",settings:"Баптаулар",dataT:"Деректер",backup:"💾 Резервтік көшірме",restore:"♻️ Көшірмеден қалпына келтіру",hist:"Өзгерістер тарихы",wipe:"Бәрін өшіру",
trType:"Жұмыс / трак түрі",trNum:"Трак №",trOwner:"Трак иесі",trOrig:"Бастапқы қарыз, $",trPay:"Төлем, $",trPer:"Кезең",trBal:"Қарыз қалдығы, $",trApr:"Пайыз (APR), %",trDue:"Төлем күні",interest:"Пайызы (шығын)",principal:"Негізгі қарыз (шығын емес)",leasePay:"Жалға алу/лизинг төлемі",
company:"Компания",dType:"Қарыз түрі",opening:"Бастапқы қалдық",newDebt:"Жаңа қарыз",payments:"Төлем",remaining:"Қалды",addDebt:"Қарыз қосу",addRepair:"Жөндеу қосу",shopName:"Шоп",shopAddr:"Мекенжайы",invNum:"Инвойс №",repDesc:"Не істелді",parts:"Бөлшектер, $",labor:"Жұмыс ақысы, $",totalRep:"Барлық жөндеу, $",paidS:"Төленді",whoPaid:"Кім төледі",
sp_driver:"Жүргізуші",sp_owner:"Трак иесі",sp_company:"Компания",sp_credit:"Шоп несиесі",sp_install:"Бөліп төлеу",shopTransfer:"Компания төлеп, қарызды маған жазды → «Компанияға қарыз»",negCarried:"Net Pay теріс — сома «Компанияға қарыз» бөліміне келесі аптаға өтті",linkedS:"қолмен жазылған шығын бір рет есептелді",dupBan:"Бір стейтмент екі рет қосылған",fix:"Түзету",ocrFail:"Оқи алмадым — қолмен жазыңыз",ocrOff:"Оқу үшін интернет керек"};
/* ---------- state ---------- */
var S=loadS();
function loadS(){var raw=null,d;try{raw=localStorage.getItem(LS);d=JSON.parse(raw)}catch(e){}
 if(d&&d.v!==2){try{localStorage.setItem(LS+"_backup_v1_"+new Date().toISOString().slice(0,10),raw)}catch(e){}d=C.migrate(d);try{localStorage.setItem(LS,JSON.stringify(d))}catch(e){}}
 d=d||{v:2,lang:"kg",role:"oo",status:"single",stBp:0,paid:{},wd:6,stmts:[],loads:[],tx:[],trips:[],log:[],pay:{type:"pct",rate:8800}};
 d.pay=d.pay||{type:"pct",rate:8800};d.stmts=d.stmts||[];d.loads=d.loads||[];d.tx=d.tx||[];d.trips=d.trips||[];d.log=d.log||[];d.paid=d.paid||{};return d}
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){toast("Storage error")}}
function log(a,s){S.log.push({t:new Date().toISOString(),a:a,s:String(s||"").slice(0,120)});if(S.log.length>500)S.log=S.log.slice(-500)}
function L(k){var d=T[S.lang]||T.kg;return d[k]||(S.lang=="kz"&&T.ru[k])||T.kg[k]||k}
function cn(c){var x=C.CAT[c]||C.CAT.other;return S.lang=="kg"?x.kg:x.ru}
function gn(g){for(var i=0;i<C.GROUPS.length;i++)if(C.GROUPS[i][0]==g)return C.GROUPS[i][1]+" "+(S.lang=="ru"?C.GROUPS[i][3]:C.GROUPS[i][2]);return g}
function gi(g){for(var i=0;i<C.GROUPS.length;i++)if(C.GROUPS[i][0]==g)return C.GROUPS[i][1];return "🧾"}
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
var M=C.fmt;function M0(c){return C.fmt(c,true)}
function today(){var d=new Date();return d.getFullYear()+"-"+C.p2(d.getMonth()+1)+"-"+C.p2(d.getDate())}
var MON={kz:["қаң","ақп","нау","сәу","мам","мау","шіл","там","қыр","қаз","қар","жел"],kg:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],ru:["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"]};
function fd(s){if(!s)return "—";var p=s.split("-");return (+p[2])+" "+MON[S.lang][+p[1]-1]+" "+p[0]}
function toast(m){var t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t)},2400)}
function cv(id){var e=$(id);return e?C.cents(e.value):null}
function cin(c){return c==null?"":(c/100).toFixed(2)}

/* ---------- period ---------- */
var V={tab:"home",per:"week",ref:today(),c0:null,c1:null};
function R(){return C.range(V.per,V.ref,V.c0,V.c1)}
function rLabel(){if(V.per=="week"){var w=R(),a=w[0].split("-"),b=w[1].split("-"),MF=S.lang=="kz"?["қаңтар","ақпан","наурыз","сәуір","мамыр","маусым","шілде","тамыз","қыркүйек","қазан","қараша","желтоқсан"]:S.lang=="ru"?["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"]:["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];return a[1]==b[1]?(+a[2])+"–"+(+b[2])+" "+MF[+b[1]-1]+" "+b[0]:(+a[2])+" "+MF[+a[1]-1].slice(0,3)+" – "+(+b[2])+" "+MF[+b[1]-1].slice(0,3)+" "+b[0]}var r=R();if(V.per=="all")return L("all");if(V.per=="year")return r[0].slice(0,4);if(V.per=="today")return fd(r[0]);return fd(r[0])+" – "+fd(r[1])}
function shift(k){if(V.per=="today")V.ref=C.addDays(V.ref,k);else if(V.per=="week")V.ref=C.addDays(V.ref,7*k);else if(V.per=="month"){var p=V.ref.split("-"),m=+p[1]-1+k,y=+p[0]+Math.floor(m/12);m=((m%12)+12)%12;V.ref=y+"-"+C.p2(m+1)+"-01"}else if(V.per=="year")V.ref=(+V.ref.slice(0,4)+k)+"-01-01";render()}

/* ---------- render ---------- */
function nav(){var t=[["home","🏠"],["loads","🚚"],["exps","🧾"],["more2","⋯"],["prof","👤"]];$("nav").innerHTML=t.map(function(x){return '<div data-tab="'+x[0]+'" class="'+(V.tab==x[0]?"on":"")+'"><i>'+x[1]+'</i>'+L("t_"+x[0])+'</div>'}).join("")}
function head(){return '<div class="top"><div class="logo">🚛</div><h1>'+L("app")+'<small>'+L("free")+'</small></h1><div class="lng"><b data-lang="kg" class="'+(S.lang=="kg"?"on":"")+'">KG</b><b data-lang="kz" class="'+(S.lang=="kz"?"on":"")+'">KZ</b><b data-lang="ru" class="'+(S.lang=="ru"?"on":"")+'">RU</b></div></div>'}
function perBar(){if(["week","month","year"].indexOf(V.per)<0)V.per="week";return '<div class="seg">'+["week","month","year"].map(function(p){return '<b data-per="'+p+'" class="'+(V.per==p?"on":"")+'">'+L(p)+'</b>'}).join("")+'</div><div class="per"><b data-sh="-1">‹</b><span>'+rLabel()+'</span><b data-sh="1">›</b></div>'}
function render(){nav();var h=head();if(V.tab=="home")h+=homeV();else if(V.tab=="loads")h+=loadsV();else if(V.tab=="exps")h+=expsV();else if(V.tab=="more2")h+=more2V();else h+=profV();
 $("app").innerHTML=h;var s=$("stS");if(s)s.value=S.status;var ro=$("roS");if(ro)ro.value=S.role;var pt=$("ptS");if(pt)pt.value=S.pay.type}
function kpi(lbl,val,cls,key,sub){var tap=key&&key.indexOf("tap:")===0;return '<div class="card'+(tap?" tap":"")+'"'+(tap?' data-src="'+key.slice(4)+'"':'')+'><div class="lbl">'+lbl+'</div><div class="v '+(cls||"")+'">'+val+'</div>'+(sub?'<div class="note">'+sub+'</div>':'')+'</div>'}
function pm(t,c){var v=t.perMile(c);return v==null?'<span class="nd">'+L("noData")+'</span>':M(v)}
function mi(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",")+" mi"}
function dupBanner(){var d=C.dupPairs(S);if(!d.length)return "";return '<div class="warn tap" data-act="fixdup">⚠️ '+L("dupBan")+' ('+d.length+') — <b>'+L("fix")+'</b></div>'}
function miSrcTag(t){return t.docMi?'<span class="bd ok">'+L("srcDoc")+'</span>':t.autoMi?'<span class="bd est">≈ '+L("estS")+'</span>':t.miles?'<span class="bd man">'+L("srcMan")+'</span>':''}
function homeV(){var t=C.totals(S,R()),busy=autoMilesKick(R()),hero=t.stCount?t.net:t.profit;
 var nd='<span class="nd">'+L("noData")+'</span>';
 return perBar()+dupBanner()+
 '<div class="card hero"><div class="lbl">💵 '+L("t_cash")+'</div><div class="big">'+M(hero)+'</div></div>'+
 '<div class="card">'+tl("Gross",M(t.gross))+tl("− "+L("feeS"),M(t.fee))+tl("= Driver Earnings",M(t.earn))+tl("− "+L("ded"),M(t.stDedAll))+tl("<b>Net Pay</b>","<b>"+M(t.net)+"</b>")+(t.oop?tl(L("ownExp"),M(t.oop)):"")+recLine(R())+'</div>'+
 '<div class="card tap" data-src="miles"><div class="row2"><div class="lbl" style="margin:0">🛣 '+L("t_miles")+' '+miSrcTag(t)+'</div><b style="color:var(--mu);font-size:20px">›</b></div>'+
 (t.miles?tl("Loaded",mi(t.loaded))+tl("Empty",mi(t.empty))+tl("<b>Total</b>","<b>"+mi(t.miles)+"</b>")+tl("Gross RPM",pm(t,t.gross))+tl("Net Cash RPM",'<span class="'+(t.net>=0?"pos":"neg")+'">'+(t.rpm.net==null?nd:M(t.rpm.net))+'</span>'):
  '<div class="note" style="margin-top:6px">'+(busy?"🗺 "+L("autoMiWait2"):L("noData")+" — ✏️ "+L("enterMi"))+'</div>')+'</div>'+
 '<div class="btns"><button class="btn" data-act="addLoad">＋ '+L("t_addLoad")+'</button><button class="btn o" data-act="stmt">📄 '+L("t_upSt")+'</button></div>'}
function tl(a,b){return '<div class="tl"><span>'+a+'</span><b>'+b+'</b></div>'}
function allLoads(r){var out=[];S.stmts.forEach(function(s){if(!C.inR(C.stDay(s),r))return;(s.loads||[]).forEach(function(l){out.push({d:l.pd||C.stDay(s),f:l.f,t:l.t,g:l.g,mi:l.mi||0,dh:l.dh||0,st:s.id})})});
 S.loads.forEach(function(l){if(C.inR(l.d,r))out.push({d:l.d,f:l.f,t:l.t,g:l.g,mi:l.mi||0,dh:l.dh||0,id:l.id})});return out.sort(function(a,b){return a.d<b.d?1:-1})}
function loadsV(){var r=R(),t=C.totals(S,r),xs=allLoads(r),sts=S.stmts.filter(function(s){return C.inR(C.stDay(s),r)});
 var h=perBar()+'<div class="card">'+tl("Gross",M(t.gross))+tl("Total Miles",t.miles?mi(t.miles):L("noData"))+tl(L("t_loads"),t.loadCount)+'</div>'+
 '<div class="btns"><button class="btn" data-act="addLoad">＋ '+L("t_addLoad")+'</button><button class="btn o" data-act="stmt">📄 '+L("t_upSt")+'</button></div>';
 if(sts.length)h+='<div class="chips" style="margin-bottom:10px">'+sts.map(function(s){var k=C.stmtCalc(s);return '<b data-st="'+s.id+'">📄 '+fd(s.p0||C.stDay(s)).replace(/ \d{4}$/,"")+'–'+fd(s.p1||s.d)+' · '+M0(k.gross)+'</b>'}).join("")+'</div>';
 if(!xs.length)return h+'<div class="empty">'+L("empty0")+'</div>';
 return h+xs.map(function(l){var m=l.mi+l.dh;return '<div class="card tap" '+(l.st?'data-st="'+l.st+'"':'data-load="'+l.id+'"')+'><div class="lbl">📅 '+fd(l.d)+(l.f||l.t?' · '+esc(l.f||"?")+' → '+esc(l.t||"?"):'')+'</div><div class="row"><div><div class="note">Gross</div><b class="v">'+M(l.g)+'</b></div><div><div class="note">Miles</div><b class="v">'+(l.mi?mi(l.mi):"—")+'</b></div></div><div class="row" style="margin-top:6px"><div><div class="note">Gross/Mile</div><b>'+(m?M(Math.round(l.g/m)):"—")+'</b></div><div><div class="note">Deadhead</div><b>'+(l.dh?mi(l.dh):"—")+'</b></div></div></div>'}).join("")}
function expsV(){var r=R(),X=C.expRows(S,r),rows=X.rows;
 var h=perBar()+'<div class="card"><div class="lbl">'+L("t_exp")+'</div><div class="big">'+M(X.biz+X.pers)+'</div></div>'+
 '<div class="btns"><button class="btn" data-act="addExp">＋ '+L("t_addExp")+'</button><button class="btn o" data-act="scan">📷 '+L("t_scan")+'</button></div>';
 if(!rows.length)return h+'<div class="empty">'+L("empty0")+'</div>';
 return h+rows.map(function(x){var t=x.t||{};return '<div class="it'+(x.cnt?"":" dim")+'" '+(x.src=="st"?'data-st="'+x.id+'"':'data-tx="'+x.id+'"')+'><div class="ic"'+(t.ph?' data-th="'+t.ph+'"':'')+'>'+gi(C.catGroup(x.c))+'</div><div class="m"><b>'+cn(x.c)+'</b><small>'+fd(x.d)+'</small></div><div class="r">'+M(x.a)+'</div></div>'}).join("")}
function profV(){var y=+R()[1].slice(0,4),c=C.tax(S,y),t=c.t;
 var h='<div class="per"><b data-ys="-1">‹</b><span>'+L("taxSum")+' '+y+'</span><b data-ys="1">›</b></div>';
 if(S.role!="company")h+='<div class="card hero"><div class="lbl">📊 '+L("estBiz")+'</div><div class="note" style="color:#dbe7ff">'+L("afterDed")+'</div><div class="big">'+M(c.sc)+'</div></div>'+
  '<div class="grid">'+kpi("💼 "+L("t_biz"),M(t.earn+t.other),"","earn")+kpi("🧾 "+L("t_exp"),M(t.exp),"neg","exp")+kpi("📅 "+L("daysTrip"),c.days,"","profit")+kpi("🍽 Per diem",M(c.pdd),"","profit","$80 × "+c.days+" × 80%")+'</div>'+
  '<div class="card">'+tl(L("se"),M(c.se))+tl(L("fed"),M(c.fed))+tl(L("st"),M(c.st))+tl("<b>"+L("total")+"</b>","<b>"+M(c.tot)+"</b>")+'</div><div class="note" style="margin:0 2px 12px">'+L("disc")+'</div>';
 else h+='<div class="warn">'+L("w2")+'</div>';
 h+='<div class="btns"><button class="btn ac" data-act="report">'+L("report")+'</button></div><div class="btns"><button class="btn gh" data-act="csv">'+L("csv")+'</button><button class="btn gh" data-act="addTrip">📅 '+L("addDays")+'</button></div>'+
 '<details class="card"><summary>⚙️ '+L("settings")+'</summary>'+
 '<label>'+L("role")+'</label><select id="roS"><option value="oo">'+L("oo")+'</option><option value="own">'+L("own_")+'</option><option value="company">'+L("company_")+'</option></select>'+
 '<div class="row"><div><label>'+L("payType")+'</label><select id="ptS"><option value="pct">'+L("pPct")+'</option><option value="mile">'+L("pMile")+'</option><option value="load">'+L("pLoad")+'</option><option value="day">'+L("pDay")+'</option><option value="flat">'+L("pFlat")+'</option></select></div><div style="flex:.6"><label>'+L("payRate")+'</label><input id="prI" inputmode="decimal" value="'+(S.pay.type=="pct"?S.pay.rate/100:cin(S.pay.rate))+'"></div></div>'+
 '<label>'+L("status")+'</label><select id="stS"><option value="single">'+L("single")+'</option><option value="mfj">'+L("mfj")+'</option><option value="hoh">'+L("hoh")+'</option></select>'+
 '<div class="row"><div><label>'+L("stRate")+'</label><input id="stR" inputmode="decimal" value="'+S.stBp/100+'"></div><div><label>'+L("paidAmt")+'</label><input id="stP" inputmode="decimal" value="'+cin(S.paid[y]||0)+'"></div></div>'+
 '<div class="btns" style="margin-top:12px"><button class="btn" data-act="saveSet">'+L("save")+'</button></div></details>'+
 '<details class="card"><summary>💾 '+L("dataT")+'</summary><div class="note" style="margin:8px 0">'+L("privacy")+'</div><div class="btns"><button class="btn gh" data-act="backup">'+L("backup")+'</button></div><div class="btns"><button class="btn gh" data-act="restore">'+L("restore")+'</button></div><div class="btns"><button class="btn gh" data-act="hist">🕘 '+L("hist")+'</button></div><div class="btns"><button class="btn rd" data-act="wipe">'+L("wipe")+'</button></div></details>'+
 '<div class="foot">'+L("app")+' · '+L("free")+' · <a href="https://instagram.com/sayt_usta" target="_blank" rel="noopener">@sayt_usta</a></div>';return h}
function fixDup(){var d=C.dupPairs(S);if(!d.length)return;var p=d[0],a=p[0],b=p[1],ka=C.stmtCalc(a),kb=C.stmtCalc(b);
 sheet("⚠️ "+L("dupBan"),'<div class="note" style="margin-bottom:10px">'+L("dupBanQ")+'</div>'+[a,b].map(function(s,i){var k=i?kb:ka;return '<div class="card">'+tl("<b>"+(i+1)+". "+esc(s.company||L("stmt"))+(s.num?" #"+esc(s.num):"")+"</b>",fd(s.p0)+" – "+fd(s.p1||s.d))+tl("Gross",M(k.gross))+tl(L("t_exp"),M(k.ded))+tl(L("loads"),(s.loads||[]).length)+'</div>'}).join("")+
  '<div class="btns"><button class="btn" id="k1">✅ '+L("keepNew")+'</button></div><div class="btns"><button class="btn gh" id="mG">📄+📄 '+L("page2")+'</button></div><div class="btns"><button class="btn gh" data-x="1">'+L("notSame")+'</button></div>');
 $("mG").onclick=function(){var m=C.mergeStmt(b,a);m.id=b.id;S.stmts=S.stmts.filter(function(x){return x.id!=a.id}).map(function(x){return x.id==b.id?m:x});log("stmt.merge",a.id+"+"+b.id);save();close();toast(L("saved_"));render()};
 $("k1").onclick=function(){S.stmts=S.stmts.filter(function(x){return x.id!=a.id});log("stmt.delete.dup",a.id);save();close();toast(L("deleted"));render()}}


/* ---------- "Дагы": miles & RPM, truck, company debt, truck shop ---------- */
var SPAY_=0;var TRK=["company","oo","rental","lease","lto","financed","owned"],DBT=["advance","fuel_adv","loan","prev","neg","ins","repair_adv","damage","other"],SPAY=["driver","owner","company","credit","install"];
function sec(icon,title,val,sub,act,warn){return '<div class="card tap" data-act="'+act+'"><div class="row2"><div style="min-width:0"><div class="lbl">'+icon+' '+title+'</div><div class="v '+(warn?"neg":"")+'">'+val+'</div>'+(sub?'<div class="note">'+sub+'</div>':'')+'</div><b style="color:var(--mu);font-size:22px">›</b></div></div>'}
function more2V(){var t=C.totals(S,R()),tk=C.truckCalc(S),db=C.debtCalc(S),sh=C.shopCalc(S),dSum=C.sum(db,"remaining"),sSum=C.sum(sh,"remaining"),dUnk=db.some(function(d){return d.remaining==null}),sUnk=sh.some(function(x){return x.remaining==null});
 return perBar()+
 sec("🛣",L("m_mi"),t.miles?(t.autoMi?"≈ ":"")+mi(t.miles):'<span class="nd">'+L("noData")+'</span>',t.miles?"Gross RPM "+M(t.rpm.gross)+" · Net RPM "+M(t.rpm.net):"","s_mi")+
 sec("🚛",L("m_truck"),S.truck&&S.truck.type?L("tt_"+S.truck.type):tk.paid?M(tk.paid):'<span class="nd">'+L("notSet")+'</span>',S.truck&&S.truck.type?(tk.balance!=null?L("balance")+" "+M0(tk.balance):L("paidY")+" "+M0(tk.paid)):tk.paid?L("paidY")+" · "+L("setType"):"","s_truck")+
 sec("🏢",L("m_debt"),db.length?(dUnk&&!dSum?'<span class="nd">'+L("balUnk")+'</span>':M(dSum)):'<span class="nd">'+L("none")+'</span>',db.length?db.length+" "+L("debtsN"):"","s_debt",dSum>0)+
 (function(){var all=C.totals(S,["0000-01-01","9999-12-31"]);return all.escrow?sec("🏦",L("m_escrow"),M(all.escrow),L("escrowNote"),"s_noop"):""})()+sec("🔧",L("m_shop"),sh.length?(sUnk&&!sSum?'<span class="nd">'+L("balUnk")+'</span>':M(sSum)):'<span class="nd">'+L("none")+'</span>',sh.length?sh.length+" "+L("repairsN"):"","s_shop",sSum>0)}
function rpmSheet(){var r=R(),t=C.totals(S,r),sts=S.stmts.filter(function(x){return C.inR(C.stDay(x),r)});
 function f(n,v,fx){return '<div class="tl"><span>'+n+'<br><small class="note">'+fx+'</small></span><b>'+(v==null?'<span class="nd">'+L("noRpm")+'</span>':M(v))+'</b></div>'}
 var h='<div class="card">'+tl("Loaded Miles",t.miles?mi(t.loaded):L("noData"))+tl("Empty / Deadhead",t.miles?mi(t.empty):L("noData"))+tl("<b>Total Miles</b> "+miSrcTag(t),"<b>"+(t.miles?mi(t.miles):L("noData"))+"</b>")+'</div>'+
 '<div class="card">'+f("Gross RPM",t.rpm.gross,"Total Gross ÷ Total Miles")+f("Driver RPM",t.rpm.driver,"Driver Earnings ÷ Total Miles")+f("Net Cash RPM",t.rpm.net,"Net Pay ÷ Total Miles")+f("Loaded RPM",t.rpm.loaded,"Total Gross ÷ Loaded Miles")+'</div>';
 sts.forEach(function(st){var legs=st.legs||[],src=st.miSrc=="doc"?L("srcDoc"):st.milesAuto?"≈ "+L("estS"):st.miles?L("srcMan"):L("noData");
  h+='<h2>📄 '+esc(st.company||L("stmt"))+' · '+fd(st.p0).replace(/ \d{4}$/,"")+'–'+fd(st.p1||st.d)+'</h2><div class="card"><div class="note" style="margin-bottom:6px">'+L("miSource")+': <b>'+src+'</b>'+(st.miOdo?' · Odometer: <b>'+mi(st.miOdo)+'</b>':'')+'</div>'+
  (legs.length?legs.map(function(l){return '<div class="tl"><span>'+(l.type=="empty"?"↩️ ":"🚚 ")+esc(l.f)+' → '+esc(l.t)+'<br><small class="note">'+(l.type=="empty"?"Empty":"Loaded")+'</small></span><b>'+mi(l.mi)+'</b></div>'}).join(""):(st.loads||[]).map(function(l){return tl("🚚 "+esc(l.f)+" → "+esc(l.t),l.mi?mi(l.mi):"—")}).join(""))+
  '<div class="btns" style="margin-top:8px"><button class="btn gh sm" data-act="mied:'+st.id+'">✏️ '+L("editMi")+'</button></div></div>'});
 if(t.autoMi)h+='<div class="note" style="margin:0 2px 10px">'+L("estNote")+'</div>';
 sheet("🛣 "+L("m_mi"),h)}
function truckSheet(){var T=S.truck||{},k=C.truckCalc(S);
 function inp(id,l,v,dec){return '<div><label>'+l+'</label><input id="'+id+'" '+(dec?'inputmode="decimal"':'')+' value="'+esc(v==null?"":v)+'"></div>'}
 sheet("🚛 "+L("m_truck"),'<label>'+L("trType")+'</label><select id="kT">'+TRK.map(function(x){return '<option value="'+x+'"'+(T.type==x?" selected":"")+'>'+L("tt_"+x)+'</option>'}).join("")+'</select>'+
 '<div class="row">'+inp("kN",L("trNum"),T.num)+inp("kC",L("company"),T.company)+'</div><div class="row">'+inp("kW",L("trOwner"),T.owner)+inp("kG",L("trOrig"),cin(T.orig),1)+'</div>'+
 '<div class="row">'+inp("kP",L("trPay"),cin(T.pay),1)+'<div><label>'+L("trPer")+'</label><select id="kR"><option value="week">'+L("week")+'</option><option value="month"'+(T.period=="month"?" selected":"")+'>'+L("month")+'</option></select></div></div>'+
 '<div class="row">'+inp("kB",L("trBal"),cin(T.balance),1)+inp("kA",L("trApr"),T.aprBp!=null?T.aprBp/100:"",1)+'</div>'+inp("kD",L("trDue"),T.due)+
 '<div class="card" style="margin-top:12px">'+tl(k.isLoan?L("paidY"):L("leasePay"),M(k.paid))+(k.isLoan?tl(L("interest"),M(k.interest))+tl(L("principal"),M(k.principal))+tl("<b>"+L("balance")+"</b>","<b>"+M(k.balance)+"</b>"):"")+'</div>'+
 (k.pays.length?'<div class="note" style="margin:4px 2px">'+L("hist")+'</div>'+k.pays.slice().reverse().map(function(p){return tl(fd(p.d)+(p.src=="st"?" · 📄":""),M(p.a)+(p.bal!=null?'<br><small class="note">'+L("balance")+' '+M0(p.bal)+'</small>':''))}).join(""):'')+
 '<div class="note" style="margin:8px 2px">'+L("trNote")+'</div><div class="btns"><button class="btn" id="kS">'+L("save")+'</button></div>');
 $("kS").onclick=function(){S.truck={type:$("kT").value,num:$("kN").value.trim(),company:$("kC").value.trim(),owner:$("kW").value.trim(),orig:cv("kG"),pay:cv("kP")||0,period:$("kR").value,balance:cv("kB")||0,aprBp:$("kA").value?C.bp($("kA").value):0,due:$("kD").value.trim(),manual:(S.truck&&S.truck.manual)||[]};log("truck",S.truck.type);save();close();toast(L("saved_"));render()}}
function debtSheet(){var db=C.debtCalc(S);
 sheet("🏢 "+L("m_debt"),(db.length?db.map(function(d){return '<div class="card tap" data-act="debt:'+d.id+'"><div class="row2"><div style="min-width:0"><div class="lbl">'+esc(d.company||"—")+' · '+L("dt_"+d.type)+'</div><div class="v '+(d.remaining>0?"neg":"pos")+'">'+(d.remaining==null?'<span class="nd">'+L("balUnk")+'</span>':M(d.remaining))+'</div><div class="note">'+M0(d.opening)+' + '+M0(d.newDebt)+' − '+M0(d.payments)+'</div></div><b style="color:var(--mu);font-size:22px">›</b></div></div>'}).join(""):'<div class="empty">'+L("none")+'</div>')+
 '<div class="note" style="margin:4px 2px 10px">'+L("debtNote")+'</div><div class="btns"><button class="btn" data-act="debt:new">＋ '+L("addDebt")+'</button></div>')}
function debtForm(id){var d=id&&id!="new"?find(S.debts||[],id):null,c=d?C.debtCalc(S).filter(function(x){return x.id==d.id})[0]:null;d=d||{type:"advance",opening:0,items:[]};
 sheet("🏢 "+L("m_debt"),'<div class="row"><div><label>'+L("company")+'</label><input id="dC" value="'+esc(d.company||"")+'"></div><div><label>'+L("dType")+'</label><select id="dT">'+DBT.map(function(x){return '<option value="'+x+'"'+(d.type==x?" selected":"")+'>'+L("dt_"+x)+'</option>'}).join("")+'</select></div></div>'+
 '<label>'+L("opening")+'</label><input id="dO" inputmode="decimal" placeholder="?" value="'+cin(d.opening)+'">'+
 (c?'<div class="card" style="margin-top:12px">'+tl(L("opening"),M(c.opening))+tl("+ "+L("newDebt"),M(c.newDebt))+tl("− "+L("payments"),M(c.payments))+tl("<b>"+L("remaining")+"</b>","<b>"+(c.remaining==null?L("balUnk"):M(c.remaining))+"</b>")+'</div>'+c.items.slice().reverse().map(function(i){return tl(fd(i.d)+(i.src=="st"?" · 📄":i.src=="neg"?" · ⚠️":""),(i.a>0?"+":"−")+M(Math.abs(i.a)))}).join(""):'')+
 '<div class="row" style="margin-top:10px"><div><label>'+L("amt")+'</label><input id="dA" inputmode="decimal"></div><div><label>'+L("date")+'</label><input id="dD" type="date" value="'+today()+'"></div></div>'+
 '<div class="btns"><button class="btn gh" id="dP">− '+L("payments")+'</button><button class="btn gh" id="dN">+ '+L("newDebt")+'</button></div>'+
 '<div class="btns"><button class="btn" id="dS">'+L("save")+'</button>'+(c?'<button class="btn rd" id="dX">'+L("del")+'</button>':'')+'</div>');
 function base(){var o=d.id?d:{id:"d"+uid(),items:[]};o.company=$("dC").value.trim();o.type=$("dT").value;o.opening=cv("dO");if(!d.id){S.debts=S.debts||[];S.debts.push(o);d=o}return o}
 function add(sign){var a=cv("dA");if(!a){toast(L("need"));return}var o=base();o.items.push({d:$("dD").value||today(),a:sign*Math.abs(a),src:"man"});log("debt",o.id+" "+sign*a);save();debtForm(o.id)}
 $("dP").onclick=function(){add(-1)};$("dN").onclick=function(){add(1)};$("dS").onclick=function(){base();save();close();toast(L("saved_"));render()};
 if(c)$("dX").onclick=function(){if(!confirm(L("del")+"?"))return;S.debts=S.debts.filter(function(x){return x.id!=d.id});save();close();render()}}
function shopSheet(){var sh=C.shopCalc(S);
 sheet("🔧 "+L("m_shop"),(sh.length?sh.map(function(x){return '<div class="card tap" data-act="shop:'+x.id+'"><div class="row2"><div style="min-width:0"><div class="lbl">'+esc(x.r.name||"Shop")+' · '+fd(x.r.d)+'</div><div class="v '+(x.remaining>0?"neg":"pos")+'">'+(x.remaining==null?'<span class="nd">'+L("balUnk")+'</span>':M(x.remaining))+'</div><div class="note">'+L("total")+" "+(x.total==null?"?":M0(x.total))+" · "+L("paidS")+" "+M0(x.paid)+'</div></div><b style="color:var(--mu);font-size:22px">›</b></div></div>'}).join(""):'<div class="empty">'+L("none")+'</div>')+
 '<div class="note" style="margin:4px 2px 10px">'+L("shopNote")+'</div><div class="btns"><button class="btn" data-act="shop:new">＋ '+L("addRepair")+'</button></div>')}
function shopForm(id){var r=id&&id!="new"?find(S.shop||[],id):null,c=r?C.shopCalc(S).filter(function(x){return x.id==r.id})[0]:null;r=r||{d:today(),pays:[]};
 function inp(i,l,v,t){return '<div><label>'+l+'</label><input id="'+i+'" '+(t=="d"?'type="date"':t=="n"?'inputmode="decimal"':'')+' value="'+esc(v==null?"":v)+'"></div>'}
 sheet("🔧 "+L("m_shop"),'<div class="row">'+inp("hN",L("shopName"),r.name)+inp("hD",L("date"),r.d,"d")+'</div>'+inp("hA",L("shopAddr"),r.addr)+
 '<div class="row">'+inp("hT",L("trNum"),r.truck)+inp("hI",L("invNum"),r.inv)+'</div>'+inp("hS",L("repDesc"),r.desc)+
 '<div class="row">'+inp("hP",L("parts"),cin(r.parts),"n")+inp("hL",L("labor"),cin(r.labor),"n")+'</div>'+inp("hX",L("totalRep"),cin(r.total),"n")+
 '<div class="row">'+inp("hC",L("paidS")+", $",cin(r.paidAmt!=null?r.paidAmt:(r.co||0)+(r.drv||0)),"n")+'<div><label>'+L("whoPaid")+'</label><select id="hW">'+SPAY.map(function(x){return '<option value="'+x+'"'+((r.payer||(r.drv?"driver":r.co?"company":"driver"))==x?" selected":"")+'>'+L("sp_"+x)+'</option>'}).join("")+'</select></div></div>'+
 '<label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="hTr" style="width:20px;height:20px"'+(r.transfer?" checked":"")+'>'+L("shopTransfer")+'</label>'+
 (c?'<div class="card" style="margin-top:12px">'+tl(L("total"),c.total==null?"?":M(c.total))+tl(L("paidS"),M(c.paid))+tl("<b>"+L("remaining")+"</b>","<b>"+(c.remaining==null?L("balUnk"):M(c.remaining))+"</b>")+'</div>'+c.pays.slice().reverse().map(function(p){return tl(fd(p.d)+(p.src=="st"?" · 📄":""),M(p.a))}).join("")+
  '<div class="row" style="margin-top:8px"><div><label>'+L("amt")+'</label><input id="hY" inputmode="decimal"></div><div style="align-self:flex-end"><button class="btn gh" id="hYb">+ '+L("payments")+'</button></div></div>':'')+
 '<div class="note" style="margin:8px 2px">'+L("shopNote2")+'</div><div class="btns"><button class="btn" id="hSv">'+L("save")+'</button>'+(c?'<button class="btn rd" id="hDl">'+L("del")+'</button>':'')+'</div>');
 function save1(){var o=r.id?r:{id:"h"+uid(),pays:[]};o.name=$("hN").value.trim();o.d=$("hD").value||today();o.addr=$("hA").value.trim();o.truck=$("hT").value.trim();o.inv=$("hI").value.trim();o.desc=$("hS").value.trim();
  o.parts=cv("hP");o.labor=cv("hL");o.total=cv("hX");if(o.total==null)o.total=(o.parts||0)+(o.labor||0);o.paidAmt=cv("hC")||0;o.payer=$("hW").value;o.transfer=$("hTr").checked;o.drv=o.payer=="driver"?o.paidAmt:0;o.co=o.payer=="company"?o.paidAmt:0;
  if(!r.id){S.shop=S.shop||[];S.shop.push(o);r=o}
  /* driver-paid part is a real repair expense — kept as ONE linked expense so it is counted once */
  var tx=find(S.tx,"shp"+o.id);if(o.drv){if(!tx){tx={id:"shp"+o.id,kind:"exp",paidBy:"own"};S.tx.push(tx)}tx.d=o.d;tx.a=o.drv;tx.c="truck_repair";tx.v=o.name||"Shop";tx.ref=o.inv||null}else if(tx)S.tx=S.tx.filter(function(x){return x!==tx});
  /* company paid the shop and moved the debt to the driver: the debt now lives under "Company debt" (one place only) */
  S.debts=S.debts||[];var dd=find(S.debts,"dsh"+o.id);if(o.transfer&&o.payer=="company"&&o.paidAmt){if(!dd){dd={id:"dsh"+o.id,company:"",type:"repair_adv",opening:0,items:[]};S.debts.push(dd)}dd.items=[{d:o.d,a:o.paidAmt,src:"shop",note:o.name}]}else if(dd)S.debts=S.debts.filter(function(x){return x!==dd});
  log("shop",o.id+" "+C.fmt(o.total));save();return o}
 $("hSv").onclick=function(){save1();close();toast(L("saved_"));render()};
 if(c){$("hYb").onclick=function(){var a=cv("hY");if(!a)return;var o=save1();o.pays=o.pays||[];o.pays.push({d:today(),a:a,src:"man"});
   var tx={id:"t"+uid(),kind:"exp",paidBy:"own",d:today(),a:a,c:"shop_debt",v:o.name||"Shop",ref:o.inv||null};S.tx.push(tx);save();shopForm(o.id)};
  $("hDl").onclick=function(){if(!confirm(L("del")+"?"))return;S.shop=S.shop.filter(function(x){return x.id!=r.id});S.tx=S.tx.filter(function(x){return x.id!="shp"+r.id});save();close();render()}}}

/* ---------- sheets ---------- */
function sheet(title,body){close();var o=document.createElement("div");o.className="ov";o.id="ov";o.innerHTML='<div class="sh"><h3>'+title+'<b data-x="1">×</b></h3>'+body+'</div>';document.body.appendChild(o);o.addEventListener("click",function(e){if(e.target===o||(e.target.getAttribute&&e.target.getAttribute("data-x")))close()})}
function close(){var o=$("ov");if(o)o.parentNode.removeChild(o)}
function catOpts(v){var main=C.MAIN.map(function(c){return '<option value="'+c+'"'+(c==v?" selected":"")+'>'+cn(c)+'</option>'}).join("");
 var rest=C.CATS.filter(function(c){return C.MAIN.indexOf(c[0])<0}).map(function(c){return '<option value="'+c[0]+'"'+(c[0]==v?" selected":"")+'>'+cn(c[0])+'</option>'}).join("");return main+'<optgroup label="'+L("moreCats")+'">'+rest+'</optgroup>'}
function catSel(id,v){return '<select id="'+id+'">'+catOpts(v)+'</select>'}
function catSelX(attr,v){return '<select '+attr+' style="padding:9px">'+catOpts(v)+'</select>'}

/* drill-down */
function recLine(r){var sts=S.stmts.filter(function(s){return C.inR(C.stDay(s),r)});if(!sts.length)return "";var bad=0,unk=0,diff=0;sts.forEach(function(s){var k=C.stmtCalc(s);if(k.rec.diff==null)unk++;else if(k.rec.diff){bad++;diff+=k.rec.diff}});
 return unk==sts.length?"":bad?'<div class="warn" style="margin:8px 0 0">⚠️ '+L("recBad")+': '+M(diff)+'</div>':'<div class="ok2">✅ '+L("recGood")+'</div>'}
function milesSheet(id){var r=R(),sts=S.stmts.filter(function(s){return C.inR(C.stDay(s),r)});if(!sts.length){loadForm();return}var s=id?find(S.stmts,id):sts[sts.length-1];
 sheet("🛣 "+L("totMi"),'<div class="note">'+esc(s.company||L("stmt"))+' · '+fd(s.p0)+' – '+fd(s.p1||s.d)+'</div><div class="btns" style="margin-top:12px"><button class="btn ac" id="mA">🗺 '+L("autoMi")+'</button></div><div id="mSt" class="ocr"></div>'+
 '<div class="row"><div><label>'+L("mi")+'</label><input id="mL" inputmode="numeric" value="'+(s.miLoaded!=null?s.miLoaded:(s.miles||""))+'"></div><div><label>'+L("dh")+'</label><input id="mE" inputmode="numeric" value="'+(s.miEmpty!=null?s.miEmpty:(s.dh||""))+'"></div></div><label>Odometer ('+L("optional")+')</label><input id="mO" inputmode="numeric" value="'+(s.miOdo||"")+'"><div class="btns" style="margin-top:14px"><button class="btn" id="mS">'+L("save")+'</button></div>');
 $("mA").onclick=function(){$("mSt").textContent="⏳ "+L("autoMiWait");autoMiles(s).then(function(m){$("mL").value=m.loaded;$("mE").value=m.empty;$("mSt").textContent="✅ "+L("autoMiOk")}).catch(function(e){$("mSt").textContent="⚠️ "+L("autoMiFail")+(e&&e.city?" ("+e.city+")":"")})};
 $("mS").onclick=function(){var a=parseInt($("mL").value,10)||0,b=parseInt($("mE").value,10)||0;s.miLoaded=a;s.miEmpty=b;s.miles=a+b;s.dh=0;s.milesAuto=false;s.miSrc="manual";s.miOdo=parseInt($("mO").value,10)||null;log("miles",s.id+" "+a+"/"+b);save();close();toast(L("saved_"));render()}}
/* free driving distance: OpenStreetMap geocoding (Nominatim) + OSRM route through PU→DEL→PU→DEL… = total miles (loaded + empty between loads) */
function geo(city){var key="jolesep_geo",cache={};try{cache=JSON.parse(localStorage.getItem(key)||"{}")}catch(e){}if(cache[city])return Promise.resolve(cache[city]);
 var m=String(city).match(/^(.*?)[,\s]+([A-Za-z]{2})\s*$/),name=(m?m[1]:city).trim(),st=m?m[2].toUpperCase():"",cands=[name];
 var joined=name.replace(/\s+/g,"");if(joined!==name)cands.push(joined);var tk=name.split(/\s+/);if(tk.length>2)cands.push(tk[0]+tk.slice(1).join("").toLowerCase());
 var tries=[];cands.forEach(function(n){
  tries.push(function(){return fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us,ca&city="+encodeURIComponent(n)+(st?"&state="+encodeURIComponent(st):"")).then(function(r){return r.json()}).then(function(j){if(!j||!j[0])throw 0;return [+(+j[0].lon).toFixed(5),+(+j[0].lat).toFixed(5)]})});
  tries.push(function(){return fetch("https://photon.komoot.io/api/?limit=1&layer=city&q="+encodeURIComponent(n+(st?" "+st:"")+" USA")).then(function(r){return r.json()}).then(function(j){var f=j&&j.features&&j.features[0];if(!f)throw 0;var c=f.geometry.coordinates;return [+c[0].toFixed(5),+c[1].toFixed(5)]})})});
 var i=0;function next(){if(i>=tries.length)return Promise.reject({city:city});var t=tries[i++];return new Promise(function(ok){setTimeout(ok,i===1?0:700)}).then(t).catch(next)}
 return next().then(function(c){cache[city]=c;try{localStorage.setItem(key,JSON.stringify(cache))}catch(e){}return c})}
function autoMiles(st){var lg=C.legs(st.loads),pts=lg.pts;if(pts.length<2)return Promise.reject({});var coords=[],chain=Promise.resolve();
 pts.forEach(function(c){chain=chain.then(function(){return geo(c)}).then(function(x){coords.push(x)})});
 return chain.then(function(){return fetch("https://router.project-osrm.org/route/v1/driving/"+coords.map(function(c){return c.join(",")}).join(";")+"?overview=false")}).then(function(r){return r.json()})
  .then(function(j){if(!j.routes||!j.routes[0]||!j.routes[0].legs)throw {};return C.sumLegs(lg.types,j.routes[0].legs.map(function(l){return l.distance}),pts)})
  .catch(function(e){if(coords.length<pts.length)throw e;var m=[];for(var i=1;i<coords.length;i++)m.push(hav(coords[i-1],coords[i])*1.2*1609.344);return C.sumLegs(lg.types,m,pts)})
  .then(function(o){o.total=o.loaded+o.empty;return o})}
function hav(a,b){var R=3958.8,r=Math.PI/180,dl=(b[1]-a[1])*r,dn=(b[0]-a[0])*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x))}
function setMi(st,o){st.miLoaded=o.loaded;st.miEmpty=o.empty;st.miles=o.total;st.dh=0;st.milesAuto=true;st.miSrc="est";st.legs=o.legs}
var miBusy={};
function autoMilesKick(r){var any=false;S.stmts.forEach(function(st){if(!C.inR(C.stDay(st),r)||st.miles||st.miSrc=="doc"||!(st.loads||[]).length)return;if(st.miTry&&Date.now()-st.miTry<6e5&&!miBusy[st.id])return;any=true;if(miBusy[st.id])return;miBusy[st.id]=1;st.miTry=Date.now();
  autoMiles(st).then(function(m){setMi(st,m);log("miles.auto",st.id+" "+m.total);save()}).catch(function(){}).then(function(){delete miBusy[st.id];if(V.tab=="home")render()})});return any}
function autoMilesSave(st){if(st.miles||!(st.loads||[]).length||!window.fetch||miBusy[st.id])return;miBusy[st.id]=1;st.miTry=Date.now();autoMiles(st).then(function(m){var s=find(S.stmts,st.id);if(!s||s.miles)return;setMi(s,m);log("miles.auto",s.id+" "+m.total);save();render();toast("🗺 "+L("totMi")+": ≈"+m.total+" mi")}).catch(function(){}).then(function(){delete miBusy[st.id];if(V.tab=="home")render()})}
function srcSheet(key){if(key=="miles")return rpmSheet();var t=C.totals(S,R()),list=[];
 if(key=="exp")list=t.src.exp;else if(key=="profit"||key=="net"){list=t.src.net.concat(t.src.exp.filter(function(x){return x.t=="tx"}))}else list=t.src[key]||[];
 sheet("🔎 "+L("sources"),'<div class="card">'+tl(L(key=="exp"?"exp":key),M(t[key]))+'</div>'+(list.length?list.map(rowOf).join(""):'<div class="empty">'+L("empty0")+'</div>'))}
function rowOf(x){if(x.t=="st"||x.t=="stded"){var s=find(S.stmts,x.id);if(!s)return "";return '<div class="it" data-st="'+s.id+'"><div class="ic">📄</div><div class="m"><b>'+(x.t=="stded"?esc(s.ded[x.i].v||cn(x.c)):esc(s.company||L("stmt")))+'</b><small>'+fd(C.stDay(s))+(x.c?' · '+cn(x.c):'')+'</small></div><div class="r">'+M(x.a)+'</div></div>'}
 if(x.t=="load"){var l=find(S.loads,x.id);return l?'<div class="it" data-load="'+l.id+'"><div class="ic">🚚</div><div class="m"><b>'+esc(l.f)+' → '+esc(l.t)+'</b><small>'+fd(l.d)+'</small></div><div class="r">'+M(x.a)+'</div></div>':""}
 var tx=find(S.tx,x.id);return tx?'<div class="it" data-tx="'+tx.id+'"><div class="ic">'+gi(C.catGroup(tx.c))+'</div><div class="m"><b>'+esc(tx.v||cn(tx.c))+'</b><small>'+fd(tx.d)+' · '+cn(tx.c)+'</small></div><div class="r">'+M(x.a)+'</div></div>':""}
function find(a,id){for(var i=0;i<a.length;i++)if(a[i].id==id)return a[i];return null}
function grpSheet(g){var t=C.totals(S,R()),cats=C.CATS.filter(function(c){return c[1]==g&&t.byCat[c[0]]});
 sheet(gn(g),cats.map(function(c){return '<h2>'+cn(c[0])+' — '+M(t.byCat[c[0]])+'</h2>'+t.src.exp.filter(function(x){return x.c==c[0]}).map(rowOf).join("")}).join(""))}

/* ---------- statement upload / review ---------- */
var XLSXU="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
function readText(f){return new Promise(function(ok){var r=new FileReader();r.onload=function(){ok(r.result)};r.readAsText(f)})}
function readBuf(f){return new Promise(function(ok){var r=new FileReader();r.onload=function(){ok(new Uint8Array(r.result))};r.readAsArrayBuffer(f)})}
function csvToText(t){return t.split(/\r?\n/).map(function(l){var out=[],cur="",q=false;for(var i=0;i<l.length;i++){var ch=l.charAt(i);if(ch=='"'){q=!q}else if(ch==","&&!q){out.push(cur);cur=""}else cur+=ch}out.push(cur);return out.map(function(x){return x.trim()}).filter(Boolean).join("   ")}).join("\n")}
var PDFJS="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",TESS="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",libs={};
function lib(u){if(libs[u])return libs[u];libs[u]=new Promise(function(ok,no){var s=document.createElement("script");s.src=u;s.onload=ok;s.onerror=function(){libs[u]=null;no()};document.head.appendChild(s)});return libs[u]}
function shrink(file,cb,mx){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var m=mx||1600,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",.72),c)};im.onerror=function(){cb(null)};im.src=fr.result};fr.readAsDataURL(file)}
function ocr(canvas){return (window.Tesseract?Promise.resolve():lib(TESS)).then(function(){return window.Tesseract.recognize(canvas,"eng")}).then(function(r){return String(r.data.text||"").replace(/\uFB01/g,"fi").replace(/\uFB02/g,"fl")})}
function joinRow(items){items=items.slice().sort(function(a,b){return a.transform[4]-b.transform[4]});var out="",end=null;
 items.forEach(function(it){var x=it.transform[4],fs=Math.abs(it.transform[0])||8,str=it.str;if(!str)return;
  if(end!=null){var gap=x-end;out+=gap>fs*0.25?" ":""}out+=str;end=x+(it.width||0)});return out.replace(/\uFB01/g,"fi").replace(/\uFB02/g,"fl")}
function pdfText(file){return lib(PDFJS).then(function(){var P=window.pdfjsLib;P.GlobalWorkerOptions.workerSrc=PDFJS.replace("pdf.min.js","pdf.worker.min.js");
 return new Promise(function(ok){var fr=new FileReader();fr.onload=function(){ok(new Uint8Array(fr.result))};fr.readAsArrayBuffer(file)}).then(function(buf){return P.getDocument({data:buf}).promise}).then(function(doc){var out=[],chain=Promise.resolve();
  for(var p=1;p<=doc.numPages;p++)(function(p){chain=chain.then(function(){out.push("[[PAGE "+p+"]]");return doc.getPage(p)}).then(function(pg){return pg.getTextContent().then(function(tc){var rows={};tc.items.forEach(function(it){var y=Math.round(it.transform[5]/3);(rows[y]=rows[y]||[]).push(it)});
   Object.keys(rows).map(Number).sort(function(a,b){return b-a}).forEach(function(y){out.push(joinRow(rows[y]))});
   if(tc.items.length<5){var vp=pg.getViewport({scale:2}),c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;return pg.render({canvasContext:c.getContext("2d"),viewport:vp}).promise.then(function(){return ocr(c)}).then(function(t){out.push(t)})}})})})(p);
  return chain.then(function(){return out.join("\n")})})})}
function onStatements(files){sheet("📄 "+L("stmt"),'<div id="stP" class="ocr" style="font-size:15px">⏳ '+L("stRead")+'</div><div class="note" style="margin-top:8px">'+L("stWait")+'</div>');
 var txt="",shot=null,i=0;function next(){if(i>=files.length)return Promise.resolve();var f=files[i++],p=$("stP");if(p)p.textContent="⏳ "+L("stRead")+" "+i+"/"+files.length;
  if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name))return pdfText(f).then(function(t){txt+="\n"+t}).then(next);
  if(/\.(csv|txt)$/i.test(f.name)||/text\/csv/.test(f.type))return readText(f).then(function(t){txt+="\n"+csvToText(t)}).then(next);
  if(/\.xlsx?$/i.test(f.name))return lib(XLSXU).then(function(){return readBuf(f)}).then(function(b){var wb=window.XLSX.read(b,{type:"array"});wb.SheetNames.forEach(function(n){txt+="\n"+csvToText(window.XLSX.utils.sheet_to_csv(wb.Sheets[n]))})}).then(next);
  return new Promise(function(ok){shrink(f,function(d,c){if(!shot)shot=d;ok(c)},2200)}).then(ocr).then(function(t){txt+="\n"+t}).then(next)}
 next().then(function(){var r=C.parseStatement(txt);applyRules(r);r.unkInc=r.dedTotal!=null&&C.sum(r.ded,"a")!==r.dedTotal;if(!r.loads.length&&!r.ded.length&&r.gross==null&&r.net==null){close();toast(L("stNone"));return}r.shot=shot;r.days=S.wd;autoOrReview(r)}).catch(function(){close();toast(navigator.onLine===false?L("ocrOff"):L("ocrFail"))})}
function review(r,editId){var R0=r;
 function inp(id,lbl,v,type){return '<div><label>'+lbl+'</label><input id="'+id+'" '+(type=="d"?'type="date"':'inputmode="decimal"')+' value="'+(type=="d"?(v||""):type=="t"?esc(v||""):cin(v))+'"'+(type=="t"?'':'')+(v==null&&type!="t"&&type!="d"?' class="miss"':'')+'></div>'}
 var h='<div class="ocr">'+L("review")+'</div>'+
 '<div class="row">'+inp("rP0",L("p0"),r.p0,"d")+inp("rP1",L("p1"),r.p1,"d")+'</div>'+
 '<div class="row">'+inp("rG","Gross, $",r.gross)+'<div><label>'+L("rate")+'</label><input id="rRate" inputmode="decimal" value="'+(r.rate==null?"":r.rate/100)+'"'+(r.rate==null&&r.earn==null?' class="miss"':'')+'></div></div>'+
 '<div class="row"><div><label>'+L("mi")+'</label><input id="rMi" inputmode="numeric" value="'+(r.miles||C.sum(r.loads,"mi")||"")+'"></div><div><label>'+L("dh")+'</label><input id="rDh" inputmode="numeric" value="'+(r.dh||"")+'"></div></div>'+
 '<h2>🧾 '+L("ded")+'</h2><div id="rDd">'+r.ded.map(dedRow).join("")+'</div><button class="btn gh sm" data-add="D">'+L("addRow")+'</button>'+
 (r.ocrFixed?'<div class="ok2">✅ '+L("ocrFix")+'</div>':'')+
 '<details class="card"><summary>🚚 '+L("loads")+' ('+r.loads.length+') · '+M(C.sum(r.loads,"g"))+'</summary><div id="rL">'+r.loads.map(loadRow).join("")+'</div><button class="btn gh sm" data-add="L">'+L("addRow")+'</button></details>'+
 (r.unknown&&r.unknown.length?'<h2>❓ '+L("unk")+'</h2><div id="rU">'+r.unknown.map(function(u,i){return '<div class="row ur"><div style="flex:2"><div class="note">'+esc(u.v)+'</div>'+catSelX('data-uc="'+i+'"',"other")+'</div><div><input data-ua="'+i+'" inputmode="decimal" value="'+cin(u.a)+'" style="padding:9px"><label style="margin:4px 0;display:flex;gap:6px;align-items:center"><input type="checkbox" data-ui="'+i+'" '+(r.unkInc?"":"checked")+' style="width:18px;height:18px">'+L("ignore")+'</label></div></div>'}).join("")+'</div>':'')+
 '<div class="card" id="rRec" style="margin-top:12px"></div>'+
 '<details class="card"><summary>'+L("more2")+'</summary>'+
 '<div class="row">'+inp("rCo",L("company"),r.company,"t")+inp("rNum",L("num"),r.num,"t")+'</div><div class="row">'+inp("rD",L("stDate"),r.d,"d")+'<div><label>'+L("days")+'</label><input id="rDays" inputmode="numeric" value="'+(r.days==null?6:r.days)+'"></div></div>'+
 '<div class="row">'+inp("rE",L("earnL"),r.earn)+inp("rNet",L("netSt"),r.net)+'</div><div class="row">'+inp("rAdv",L("adv"),r.adv||0)+inp("rRe",L("reimb"),r.reimb||0)+'</div><div class="row">'+inp("rOt",L("other"),r.other||0)+inp("rDT",L("dedTot"),r.dedTotal)+'</div><div class="row">'+inp("rFR",L("fuelRet"),r.fuelRetail)+inp("rFI",L("fuelInv"),r.fuelInvoice)+'</div></details>'+
 '<div class="btns" style="margin-top:14px"><button class="btn" id="rSave">'+L("save")+'</button>'+(editId?'<button class="btn rd" id="rDel">'+L("del")+'</button>':'')+'</div>';
 sheet("📄 "+L("stmt"),h);
 function collect(){var st={id:editId||("s"+uid()),company:$("rCo").value.trim()||null,num:$("rNum").value.trim()||null,p0:$("rP0").value||null,p1:$("rP1").value||null,d:$("rD").value||$("rP1").value||today(),
  gross:cv("rG")||0,rate:$("rRate").value.trim()?C.bp($("rRate").value):null,earn:cv("rE"),fee:null,adv:cv("rAdv")||0,reimb:cv("rRe")||0,other:cv("rOt")||0,net:cv("rNet"),dedTotal:cv("rDT"),
  fuelRetail:cv("rFR"),fuelInvoice:cv("rFI"),advInDed:!!R0.advInDed,driver:R0.driver||null,legs:R0.legs||null,miSrc:R0.milesAuto?"est":(C.sum(R0.loads||[],"mi")?"doc":($("rMi").value?"manual":null)),miles:(parseInt($("rMi").value,10)||0)+(parseInt($("rDh").value,10)||0),miLoaded:$("rMi").value?parseInt($("rMi").value,10)||0:null,miEmpty:$("rDh").value?parseInt($("rDh").value,10)||0:null,milesAuto:!!R0.milesAuto,dh:0,bal:R0.bal||[],tolls:R0.tolls||[],days:Math.max(0,Math.min(31,parseInt($("rDays").value,10)||0)),loads:[],ded:[],fuel:R0.fuel||[],src:"upload"};
  var q=function(s){return document.querySelectorAll(s)};
  Array.prototype.forEach.call(q("[data-lr]"),function(e){var g=C.cents(e.querySelector(".lg").value);if(g==null)return;st.loads.push({num:e.getAttribute("data-num")||null,f:e.querySelector(".lf").value.trim(),t:e.querySelector(".lt").value.trim(),pd:e.getAttribute("data-pd")||null,g:g,mi:parseInt(e.querySelector(".lm").value,10)||0,dh:parseInt(e.querySelector(".ld").value,10)||0})});
  Array.prototype.forEach.call(q("[data-dr]"),function(e){var a=C.cents(e.querySelector(".da").value);if(!a)return;st.ded.push({c:e.querySelector(".dc").value,a:a,v:e.getAttribute("data-v")||"",c0:e.getAttribute("data-c0")||null})});
  Array.prototype.forEach.call(q("[data-ua]"),function(e){var i=e.getAttribute("data-ua");if(document.querySelector('[data-ui="'+i+'"]').checked)return;var a=C.cents(e.value);if(a)st.ded.push({c:document.querySelector('[data-uc="'+i+'"]').value,a:a,v:R0.unknown[i].v})});
  if(!st.gross&&st.loads.length)st.gross=C.sum(st.loads,"g");return st}
 function recalc(){var st=collect(),k=C.stmtCalc(st),h=tl("Gross",M(k.gross))+(k.fee?tl("− "+L("fee"),M(k.fee)):"")+tl("− "+L("ded"),M(k.ded))+tl("<b>Net Pay</b>","<b>"+M(k.net)+"</b>");
  h+='<div class="note" style="margin:6px 0 2px">'+L("chkT")+'</div>'+tl("Original Gross",st.gross?M(st.gross):L("noData"))+tl("Calculated Gross (loads)",k.grossLoads?M(k.grossLoads):L("noData"))+tl("Original Net Pay",k.rec.stated!=null?M(k.rec.stated):L("noData"))+tl("Calculated Net Pay",M(k.net))+tl("Difference",k.rec.stated!=null?M(k.rec.stated-k.net):"—");
  if(k.rec.stated!=null){h+=k.rec.diff===0?'<div class="ok2">✅ '+L("recSt")+' '+M(k.rec.stated)+' — '+L("recOk")+'</div>':'<div class="warn" style="margin:8px 0 0">⚠️ '+L("recSt")+': '+M(k.rec.stated)+' · '+L("recDiff")+': '+M(k.rec.diff)+'<br>'+k.rec.why.map(function(w){return w.k=="dedTotal"?L("whyDed")+": "+M(w.stated)+" ≠ "+M(w.calc):w.k=="earnMismatch"?L("whyEarn"):w.k=="grossLoads"?L("whyGross")+": "+M(w.stated)+" ≠ "+M(w.calc):L("whyUnk")}).join("<br>")+'</div>'}
  if(k.warn.some(function(w){return w.k=="noRate"}))h+='<div class="note" style="margin-top:6px">⚠️ '+L("noRate")+'</div>';$("rRec").innerHTML=h}
 if(!$("rMi").value&&!C.sum(r.loads||[],"mi")&&(r.loads||[]).length&&window.fetch){$("rMi").placeholder="🗺 …";autoMiles({loads:r.loads}).then(function(m){if($("rMi")&&!$("rMi").value){$("rMi").value=m.loaded;$("rDh").value=m.empty;R0.milesAuto=true;R0.legs=m.legs;var n=$("rMi").parentNode.querySelector("label");if(n)n.innerHTML=L("mi")+' <span class="nd">≈ '+L("estS")+'</span>'}}).catch(function(){if($("rMi"))$("rMi").placeholder=""})}
 recalc();$("ov").addEventListener("input",recalc);$("ov").addEventListener("change",recalc);
 $("ov").addEventListener("click",function(e){var a=e.target.getAttribute&&e.target.getAttribute("data-add");if(a=="L"){$("rL").insertAdjacentHTML("beforeend",loadRow({}))}else if(a=="D"){$("rDd").insertAdjacentHTML("beforeend",dedRow({c:"other"}))}else if(e.target.getAttribute&&e.target.getAttribute("data-rm")){var p=e.target.parentNode;while(p&&!p.getAttribute("data-dr")&&!p.getAttribute("data-lr"))p=p.parentNode;if(p)p.parentNode.removeChild(p);recalc()}});
 $("rSave").onclick=function(){var st=collect(),d=C.stmtDup(st,S);
  function put(replaceId){if(replaceId){S.stmts=S.stmts.map(function(x){return x.id==replaceId?(st.id=replaceId,st):x})}else S.stmts.push(st);
   setTimeout(function(){autoMilesSave(st)},300);var lk=C.linkMatching(st,S);afterSave(st);if(lk.length)log("tx.link",lk.join(","));
   if(R0.shot)phPut(st.id,R0.shot);if(st.days)S.wd=st.days;log(editId||replaceId?"stmt.update":"stmt.add",(st.company||"")+" #"+(st.num||"")+" "+C.fmt(C.stmtCalc(st).net));save();close();toast(lk.length?L("linkedN").replace("N",lk.length):L("saved_"));V.per="week";V.ref=C.stDay(st);V.tab="home";render()}
  if(editId)return put(editId);
  if(d){sheet("⚠️ "+L("stmt"),'<div class="warn">'+L("dupSt")+'<br><b>'+esc(d.company||"")+' #'+esc(d.num||"")+'</b> · '+fd(C.stDay(d))+'</div><div class="btns"><button class="btn" id="dR">✅ '+L("dupReplace")+'</button></div><div class="btns"><button class="btn gh" id="dM">📄+📄 '+L("page2")+'</button></div><div class="btns"><button class="btn gh" id="dK">'+L("dupKeep")+'</button></div><div class="btns"><button class="btn rd" data-x="1">'+L("cancel")+'</button></div>');
   $("dR").onclick=function(){put(d.id)};$("dK").onclick=function(){put(null)};$("dM").onclick=function(){var m=C.mergeStmt(d,st);m.id=d.id;st=m;put(d.id)};return}
  put(null)};
 if(editId)$("rDel").onclick=function(){if(!confirm(L("del")+"?"))return;S.stmts=S.stmts.filter(function(x){return x.id!=editId});log("stmt.delete",editId);save();close();toast(L("deleted"));render()}}
function loadRow(l){return '<div class="card lrow" data-lr="1" data-num="'+esc(l.num||"")+'" data-pd="'+esc(l.pd||"")+'"><div class="row"><div><input class="lf" placeholder="'+L("from")+'" value="'+esc(l.f||"")+'"></div><div><input class="lt" placeholder="'+L("to")+'" value="'+esc(l.t||"")+'"></div><b class="rm" data-rm="1">×</b></div><div class="row" style="margin-top:6px"><div><input class="lg" inputmode="decimal" placeholder="$" value="'+cin(l.g)+'"></div><div><input class="lm" inputmode="numeric" placeholder="mi" value="'+(l.mi||"")+'"></div><div><input class="ld" inputmode="numeric" placeholder="DH" value="'+(l.dh||"")+'"></div></div></div>'}
function dedRow(x){return '<div class="row drow" data-dr="1" data-v="'+esc(x.v||"")+'" data-c0="'+esc(x.c0||x.c||"")+'"><div style="flex:2">'+catSelX('class="dc"',x.c)+(x.v?'<div class="note">'+esc(x.v)+(x.ln?' <span style="opacity:.7">· '+L("pgS")+(x.pg||1)+" "+L("lnS")+x.ln+'</span>':'')+'</div>':'')+'</div><div><input class="da" inputmode="decimal" value="'+cin(x.a)+'" style="padding:9px"></div><b class="rm" data-rm="1">×</b></div>'}
function ruleKey(st){return String(st.company||"*").toUpperCase().replace(/[^A-Z0-9]/g,"")||"*"}
function lblKey(v){return String(v||"").toUpperCase().replace(/[^A-Z ]/g," ").replace(/\s+/g," ").trim().slice(0,30)}
function applyRules(r){var R1=(S.rules||{})[ruleKey(r)]||{};(r.ded||[]).forEach(function(d){var k=lblKey(d.v);if(k&&R1[k])d.c=R1[k];d.c0=d.c})}
function afterSave(st){var bal=function(k){var b=(st.bal||[]).filter(function(x){return x.k==k})[0];return b?b.a:null};
 var sdl=(st.ded||[]).filter(function(x){return x.c=="shop_debt"});
 if(sdl.length){var sh=C.shopCalc(S).filter(function(x){return x.remaining==null||x.remaining>0}),rec=sh.length?find(S.shop,sh[0].id):null,paidNow=C.sum(sdl,"a");
  if(!rec){rec={id:"h"+uid(),name:"Shop ("+(st.company||L("stmt"))+")",d:C.stDay(st),total:bal("shop")!=null?bal("shop")+paidNow:null,co:0,drv:0,pays:[],auto:true};S.shop=S.shop||[];S.shop.push(rec)}
  else if(rec.total==null&&bal("shop")!=null){var before=C.shopCalc(S).filter(function(x){return x.id==rec.id})[0];rec.total=bal("shop")+paidNow+(before?before.paid:0)}
  sdl.forEach(function(x){if(!x.shop)x.shop=rec.id})}
 var cdl=(st.ded||[]).filter(function(x){return x.c=="co_debt"});
 if(cdl.length){S.debts=S.debts||[];var dd=S.debts.filter(function(x){return x.type!="neg"&&ruleKey(x)==ruleKey(st)})[0];
  if(!dd){var lb=String(cdl[0].v||"").toUpperCase(),ty=/ADVANCE/.test(lb)?"advance":/CHARGE|DAMAGE/.test(lb)?"damage":/FUEL/.test(lb)?"fuel_adv":/REPAIR/.test(lb)?"repair_adv":"loan";
   dd={id:"d"+uid(),company:st.company||"",type:ty,opening:bal("co")!=null?bal("co")+C.sum(cdl,"a"):null,items:[],auto:true};S.debts.push(dd)}
  else if(dd.opening==null&&bal("co")!=null){var cur=C.debtCalc(S).filter(function(x){return x.id==dd.id})[0];dd.opening=bal("co")+C.sum(cdl,"a")+(cur?cur.payments:0)}
  cdl.forEach(function(x){x.debt=dd.id})}
 if((st.ded||[]).some(function(x){return x.c=="truck_pay"})&&!(S.truck&&S.truck.type)){S.truck=S.truck||{};S.truck.company=S.truck.company||st.company||"";if(bal("truck")!=null&&S.truck.balance==null)S.truck.balance=bal("truck")}
 if(C.stmtCalc(st).net<0){S.debts=S.debts||[];var d=(S.debts||[]).filter(function(x){return x.type=="neg"&&ruleKey(x)==ruleKey(st)})[0];if(!d){d={id:"d"+uid(),company:st.company||"",type:"neg",opening:0,items:[]};S.debts.push(d)}st.negCarry=d.id;toast(L("negCarried"))}
 /* remember category corrections for this company */
 var k=ruleKey(st);S.rules=S.rules||{};S.rules[k]=S.rules[k]||{};(st.ded||[]).forEach(function(d){if(d.v&&d.c0&&d.c!==d.c0)S.rules[k][lblKey(d.v)]=d.c;delete d.c0})}
function fromParsed(r){var st={id:"s"+uid(),company:r.company||null,num:r.num||null,p0:r.p0||null,p1:r.p1||null,d:r.d||r.p1||today(),gross:r.gross!=null?r.gross:C.sum(r.loads,"g"),rate:r.rate,earn:r.earn,fee:null,adv:r.adv||0,reimb:r.reimb||0,other:r.other||0,net:r.net,dedTotal:r.dedTotal,
  fuelRetail:r.fuelRetail,fuelInvoice:r.fuelInvoice,days:r.days==null?6:r.days,loads:r.loads||[],ded:(r.ded||[]).map(function(d){return {c:d.c,a:d.a,v:d.v}}),fuel:r.fuel||[],tolls:r.tolls||[],bal:r.bal||[],advInDed:!!r.advInDed,driver:r.driver||null,src:"auto"};var dm=C.sum(st.loads,"mi");if(dm){st.miLoaded=dm;st.miEmpty=C.sum(st.loads,"dh");st.miles=dm+st.miEmpty;st.miSrc="doc"}
 if(r.unkInc)(r.unknown||[]).forEach(function(u){st.ded.push({c:"other",a:u.a,v:u.v,check:true})});return st}
function autoOrReview(r){var st=fromParsed(r),k=C.stmtCalc(st);
 if(!(st.gross>0&&k.rec.stated!=null&&k.rec.diff===0)){review(r);return}   /* only fully-matching statements are saved without review */
 var d=C.stmtDup(st,S);
 function go(repl){if(repl){st.id=repl;S.stmts=S.stmts.map(function(x){return x.id==repl?st:x})}else S.stmts.push(st);
  var lk=C.linkMatching(st,S);afterSave(st);if(r.shot)phPut(st.id,r.shot);log(repl?"stmt.update.auto":"stmt.add.auto",(st.company||"")+" #"+(st.num||"")+" "+C.fmt(k.net));save();V.per="week";V.ref=C.stDay(st);V.tab="home";render();
  setTimeout(function(){autoMilesSave(st)},300);doneSheet(st,lk.length)}
 if(d){sheet("⚠️ "+L("stmt"),'<div class="warn">'+L("dupSt")+'<br><b>'+esc(d.company||"")+' #'+esc(d.num||"")+'</b> · '+fd(C.stDay(d))+'</div><div class="btns"><button class="btn" id="dR">✅ '+L("dupReplace")+'</button></div><div class="btns"><button class="btn gh" id="dM">📄+📄 '+L("page2")+'</button></div><div class="btns"><button class="btn rd" data-x="1">'+L("cancel")+'</button></div>');
  $("dR").onclick=function(){go(d.id)};$("dM").onclick=function(){var m=C.mergeStmt(d,st);m.id=d.id;st=m;k=C.stmtCalc(st);go(d.id)};return}
 go(null)}
function doneSheet(st,linked){var k=C.stmtCalc(st),db=(st.ded||[]).filter(function(x){return x.c=="co_debt"}),sd=(st.ded||[]).filter(function(x){return x.c=="shop_debt"}),tp=(st.ded||[]).filter(function(x){return x.c=="truck_pay"});
 sheet("✅ "+L("autoAdded"),'<div class="note" style="margin-bottom:8px">'+esc(st.company||"")+(st.num?" #"+esc(st.num):"")+' · '+fd(st.p0)+' – '+fd(st.p1||st.d)+'</div><div class="card">'+tl("Gross ("+(st.loads||[]).length+" "+L("loadsN")+")",M(k.gross))+tl(L("feeS"),M(k.fee))+tl(L("ded"),M(k.ded))+tl("<b>Net Pay</b>","<b>"+M(k.net)+"</b>")+'<div class="ok2">✅ '+L("recGood")+'</div></div>'+
 '<div class="card">'+tl("🛣 "+L("totMi"),'<span class="nd">🗺 '+L("autoMiWait2")+'</span>')+(db.length?tl("🏢 "+L("m_debt"),"−"+M(C.sum(db,"a"))):"")+(sd.length?tl("🔧 Truck Shop","−"+M(C.sum(sd,"a"))):"")+(tp.length?tl("🚛 "+L("m_truck"),M(C.sum(tp,"a"))):"")+(linked?tl("🔗",linked+" "+L("linkedS")):"")+'</div>'+
 '<div class="btns"><button class="btn" data-x="1">OK</button><button class="btn gh" id="dEd">✏️ '+L("edit")+'</button></div>');$("dEd").onclick=function(){stDetail(st.id)}}
function stDetail(id){var s=find(S.stmts,id);if(!s)return;var r=JSON.parse(JSON.stringify(s));r.unknown=[];review(r,id)}

/* ---------- receipts & manual ---------- */
var DB=null;function db(cb){if(DB)return cb(DB);if(!window.indexedDB)return cb(null);try{var q=indexedDB.open("jolesep_ph",1);q.onupgradeneeded=function(){q.result.createObjectStore("p")};q.onsuccess=function(){DB=q.result;cb(DB)};q.onerror=function(){cb(null)}}catch(e){cb(null)}}
function phPut(id,data,cb){db(function(d){if(!d)return cb&&cb();var tx=d.transaction("p","readwrite");tx.objectStore("p").put(data,id);tx.oncomplete=function(){cb&&cb()};tx.onerror=function(){cb&&cb()}})}
function phGet(id,cb){db(function(d){if(!d)return cb(null);var q=d.transaction("p").objectStore("p").get(id);q.onsuccess=function(){cb(q.result||null)};q.onerror=function(){cb(null)}})}
var pend=null;
function manualMenu(){sheet("＋ "+L("manual"),[["exp","🧾",L("kExp")],["load","🚚",L("kLoad")],["reimb","↩️",L("kReimb")],["income","➕",L("kInc")]].map(function(k){return '<div class="it" data-mk="'+k[0]+'"><div class="ic">'+k[1]+'</div><div class="m"><b>'+k[2]+'</b></div></div>'}).join(""))}
function txForm(id,pre,kind){var t=id?JSON.parse(JSON.stringify(find(S.tx,id)||{})):{kind:kind||"exp",d:today(),c:"diesel",paidBy:null};if(pre)for(var k in pre)if(pre[k]!=null&&pre[k]!=="")t[k]=pre[k];
 var isExp=t.kind=="exp",h=(isExp?'<button class="btn ac" id="phB" style="width:100%">'+L("photo")+'</button><img id="phI" class="prev" style="display:none" alt=""><div id="ocrS" class="ocr"></div>':'')+
 '<div class="row"><div><label>'+L("amt")+'</label><input id="tA" inputmode="decimal" value="'+cin(t.a)+'"></div><div><label>'+L("date")+'</label><input id="tD" type="date" value="'+(t.d||today())+'"></div></div>'+
 (isExp?'<label>'+L("cat")+'</label>'+catSel("tC",t.c=="pers"?"other":t.c)+'<label>'+L("paidBy")+'</label><div class="chips col" id="tP"><b data-p="card" class="'+(t.paidBy=="card"?"on":"")+'">'+L("card")+'</b><b data-p="own" class="'+(t.paidBy=="own"?"on":"")+'">'+L("own")+'</b></div><div id="cardN" class="note" style="margin-top:6px;'+(t.paidBy=="card"?"":"display:none")+'">'+L("cardNote")+'</div>'+
 '<div id="fuelF" style="'+(C.catGroup(t.c)=="fuel"?"":"display:none")+'"><div class="row"><div><label>'+L("gal")+'</label><input id="tG" inputmode="decimal" value="'+(t.gal?(t.gal/100).toFixed(2):"")+'"></div><div><label>'+L("state")+'</label><input id="tS" maxlength="2" value="'+esc(t.state||"")+'" style="text-transform:uppercase"></div></div><div class="row"><div><label>'+L("ret")+'</label><input id="tR" inputmode="decimal" value="'+cin(t.ret)+'"></div><div><label>'+L("inv")+'</label><input id="tI" inputmode="decimal" value="'+cin(t.inv)+'"></div></div></div>':'')+
 '<label>'+L("vendor")+'</label><input id="tV" value="'+esc(t.v||"")+'"><div class="row"><div><label>'+L("ref")+'</label><input id="tF" value="'+esc(t.ref||"")+'"></div><div><label>'+L("note")+'</label><input id="tN" value="'+esc(t.n||"")+'"></div></div>'+
 '<div class="btns" style="margin-top:14px"><button class="btn" id="tSv">'+L("save")+'</button>'+(id?'<button class="btn rd" id="tDl">'+L("del")+'</button>':'')+'</div>';
 sheet((isExp?"🧾 "+L("kExp"):t.kind=="reimb"?"↩️ "+L("kReimb"):"➕ "+L("kInc")),h);
 if(isExp){var img=$("phI");if(pend){img.src=pend;img.style.display="block"}else if(t.ph)phGet(t.ph,function(d){if(d){img.src=d;img.style.display="block"}});
  $("phB").onclick=function(){V.ed={id:id,kind:"exp"};$("fileIn").click()};
  $("tC").onchange=function(){$("fuelF").style.display=C.catGroup(this.value)=="fuel"?"":"none"};
  $("tP").onclick=function(e){var b=e.target.closest?e.target.closest("[data-p]"):null;if(!b)return;t.paidBy=b.getAttribute("data-p");var bs=this.querySelectorAll("b");for(var i=0;i<bs.length;i++)bs[i].className=bs[i].getAttribute("data-p")==t.paidBy?"on":"";$("cardN").style.display=t.paidBy=="card"?"":"none"}}
 $("tSv").onclick=function(){var a=cv("tA");if(!a){toast(L("need"));return}if(isExp&&!t.paidBy){toast(L("paidBy"));$("tP").className+=" shake";return}
  var o={id:t.id||("t"+uid()),kind:t.kind,d:$("tD").value||today(),a:a,c:isExp?$("tC").value:null,v:$("tV").value.trim(),ref:$("tF").value.trim()||null,n:$("tN").value.trim(),paidBy:isExp?t.paidBy:null,pers:isExp?($("tC").value=="pers"):false,link:t.link||null,dupOf:t.dupOf||null,ph:t.ph||""};
  if(isExp&&C.catGroup(o.c)=="fuel"){var g=$("tG").value;o.gal=g?Math.round(parseFloat(g)*100):null;o.state=$("tS").value.toUpperCase()||null;o.ret=cv("tR");o.inv=cv("tI");if(o.inv==null)o.inv=null}
  function fin(){if(id)S.tx=S.tx.map(function(x){return x.id==id?o:x});else S.tx.push(o);log(id?"tx.update":"tx.add",(o.v||cn(o.c))+" "+C.fmt(o.a)+(o.dupOf?" dup":"")+(o.link?" link":""));pend=null;save();close();toast(o.dupOf||o.link?L("linked"):L("saved_"));render()}
  function store(){if(pend){o.ph=o.ph||("p"+o.id);phPut(o.ph,pend,fin)}else fin()}
  if(isExp&&!id&&!o.dupOf&&!o.link){var ds=C.findDups(o,S);if(ds.length){var top=ds[0];
   sheet(L("dupT"),'<div class="warn">'+(top.type=="stperiod"?L("dupPer"):L("dupQ"))+'</div>'+ds.slice(0,3).map(function(x){var w=x.type=="tx"?(x.o.v||cn(x.o.c))+" · "+fd(x.o.d):(x.st.company||L("stmt"))+" · "+fd(C.stDay(x.st))+(x.o?" · "+(x.o.v||cn(x.o.c)):"");return '<div class="card">'+tl(w,x.o?M(x.o.a):"")+'</div>'}).join("")+
    '<div class="btns"><button class="btn" id="dS">'+L("dupSame")+'</button></div><div class="btns"><button class="btn gh" id="dD">'+L("dupDiff")+'</button></div>');
   $("dS").onclick=function(){if(top.type=="tx")o.dupOf=top.id;else o.link=top.id;store()};$("dD").onclick=store;return}}
  store()};
 if(id)$("tDl").onclick=function(){S.tx=S.tx.filter(function(x){return x.id!=id});S.tx.forEach(function(x){if(x.dupOf==id)x.dupOf=null});log("tx.delete",(t.v||"")+" "+C.fmt(t.a));save();close();toast(L("deleted"));render()}}
function onPhoto(file){var ed=V.ed||{};shrink(file,function(data,canvas){if(!data)return;pend=data;var keep={};["tA","tD","tV"].forEach(function(k){var e=$(k);if(e)keep[k]=e.value});
 txForm(ed.id,{a:keep.tA?C.cents(keep.tA):null,d:keep.tD||null,v:keep.tV||null},"exp");var s=$("ocrS");s.textContent="⏳ "+L("reading");
 ocr(canvas).then(function(txt){var p=C.parseReceipt(txt),st=$("ocrS");if(!st)return;if(p.a!=null&&!$("tA").value)$("tA").value=cin(p.a);if(p.d)$("tD").value=p.d;if(p.v&&!$("tV").value)$("tV").value=p.v;if(p.ref&&!$("tF").value)$("tF").value=p.ref;
  if(p.c&&p.c!="other"){$("tC").value=p.c;$("tC").onchange()}if(p.gal&&$("tG"))$("tG").value=(p.gal/100).toFixed(2);if(p.state&&$("tS"))$("tS").value=p.state;if(p.ret!=null&&$("tR"))$("tR").value=cin(p.ret);if(p.inv!=null&&$("tI"))$("tI").value=cin(p.inv);
  st.textContent=p.a!=null?"✅ "+L("ocrOk"):"⚠️ "+L("ocrFail")}).catch(function(){var st=$("ocrS");if(st)st.textContent="⚠️ "+(navigator.onLine===false?L("ocrOff"):L("ocrFail"))})},1600)}
function loadForm(id){var l=id?find(S.loads,id):{d:today()};l=l||{d:today()};
 sheet("🚚 "+L("kLoad"),'<div class="row"><div><label>'+L("date")+'</label><input id="lD" type="date" value="'+l.d+'"></div><div><label>'+L("gAmt")+'</label><input id="lG" inputmode="decimal" value="'+cin(l.g)+'"></div></div><div class="row"><div><label>'+L("from")+'</label><input id="lF" value="'+esc(l.f||"")+'"></div><div><label>'+L("to")+'</label><input id="lT" value="'+esc(l.t||"")+'"></div></div><div class="row"><div><label>'+L("mi")+'</label><input id="lM" inputmode="numeric" value="'+(l.mi||"")+'"></div><div><label>'+L("dh")+'</label><input id="lH" inputmode="numeric" value="'+(l.dh||"")+'"></div></div><label>'+L("earnAmt")+'</label><input id="lE" inputmode="decimal" value="'+cin(l.earn)+'"><div class="btns" style="margin-top:14px"><button class="btn" id="lSv">'+L("save")+'</button>'+(id?'<button class="btn rd" id="lDl">'+L("del")+'</button>':'')+'</div>');
 function auto(){var g=cv("lG"),mi=parseInt($("lM").value,10)||0,p=S.pay,e=null;if(g==null)return;if(p.type=="pct")e=C.pct(g,p.rate);else if(p.type=="mile")e=mi*p.rate;else if(p.type=="load")e=p.rate;if(e!=null&&!$("lE").getAttribute("data-man"))$("lE").value=cin(e)}
 $("lG").oninput=auto;$("lM").oninput=auto;$("lE").oninput=function(){this.setAttribute("data-man","1")};if(!id)auto();
 $("lSv").onclick=function(){var g=cv("lG");if(g==null){toast(L("need"));return}var o={id:l.id||("l"+uid()),d:$("lD").value||today(),f:$("lF").value.trim(),t:$("lT").value.trim(),g:g,earn:cv("lE"),mi:parseInt($("lM").value,10)||0,dh:parseInt($("lH").value,10)||0};
  if(id)S.loads=S.loads.map(function(x){return x.id==id?o:x});else S.loads.push(o);log(id?"load.update":"load.add",o.f+"→"+o.t+" "+C.fmt(o.g));save();close();toast(L("saved_"));render()};
 if(id)$("lDl").onclick=function(){S.loads=S.loads.filter(function(x){return x.id!=id});log("load.delete",id);save();close();render()}}
function tripForm(id){var x=id?find(S.trips,id):{a:today(),b:today()};x=x||{a:today(),b:today()};
 sheet("📅 "+L("tripDays"),'<div class="row"><div><label>'+L("dfrom")+'</label><input id="yA" type="date" value="'+x.a+'"></div><div><label>'+L("dto")+'</label><input id="yB" type="date" value="'+x.b+'"></div></div><div class="btns" style="margin-top:14px"><button class="btn" id="ySv">'+L("save")+'</button>'+(id?'<button class="btn rd" id="yDl">'+L("del")+'</button>':'')+'</div>');
 $("ySv").onclick=function(){var a=$("yA").value,b=$("yB").value;if(!a||!b)return;if(b<a){var q=a;a=b;b=q}var o={id:x.id||uid(),a:a,b:b};if(id)S.trips=S.trips.map(function(t){return t.id==id?o:t});else S.trips.push(o);log("days",a+".."+b);save();close();render()};
 if(id)$("yDl").onclick=function(){S.trips=S.trips.filter(function(t){return t.id!=id});save();close();render()}}

/* ---------- export ---------- */
function dl(name,data,type){var b=new Blob([data],{type:type});try{var f=new File([b],name,{type:type});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).catch(function(){});return}}catch(e){}
 var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.parentNode.removeChild(a)},1500)}
function q(s){s=String(s==null?"":s);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
function d2(c){return c==null?"":(c<0?"-":"")+(Math.abs(c)/100).toFixed(2)}
function csv(){var r=R(),rows=[["Type","Date","Statement","Category","Description","Amount","Counted","Paid by","Loaded mi","Empty mi","Gallons"]];
 S.stmts.forEach(function(s){if(!C.inR(C.stDay(s),r))return;var k=C.stmtCalc(s),nm=(s.company||"")+" #"+(s.num||"");
  rows.push(["Statement gross",C.stDay(s),nm,"","",d2(k.gross),"","","","",""]);rows.push(["Company fee",C.stDay(s),nm,"","",d2(k.fee),"","","","",""]);rows.push(["Driver earnings",C.stDay(s),nm,"","",d2(k.earn),"","","","",""]);
  (s.loads||[]).forEach(function(l){rows.push(["Load",l.pd||C.stDay(s),nm,"",(l.f||"")+" - "+(l.t||""),d2(l.g),"","",l.mi||0,l.dh||0,""])});
  (s.ded||[]).forEach(function(x){rows.push(["Deduction",C.stDay(s),nm,C.CAT[x.c].en,x.v||"",d2(x.a),"yes","statement","","",""])});
  if(k.adv)rows.push(["Advance (not expense)",C.stDay(s),nm,"","",d2(k.adv),"no","","","",""]);if(k.reimb)rows.push(["Reimbursement",C.stDay(s),nm,"","",d2(k.reimb),"","","","",""]);
  rows.push(["Net pay (calculated)",C.stDay(s),nm,"","",d2(k.net),"","","","",""]);if(k.rec.stated!=null)rows.push(["Net pay (statement)",C.stDay(s),nm,"","diff "+d2(k.rec.diff),d2(k.rec.stated),"","","","",""])});
 S.loads.forEach(function(l){if(C.inR(l.d,r))rows.push(["Load (manual)",l.d,"","",(l.f||"")+" - "+(l.t||""),d2(l.g),"","",l.mi||0,l.dh||0,""])});
 S.tx.forEach(function(t){if(!C.inR(t.d,r))return;rows.push([t.kind,t.d,t.link||"",t.c?C.CAT[t.c].en:"",t.v||"",d2(t.a),t.kind=="exp"?(C.counts(t)?"yes":"no"+(t.dupOf?" (duplicate)":t.link?" (in statement)":t.paidBy=="card"?" (company card)":"")):"",t.paidBy||"","","",t.gal?(t.gal/100).toFixed(2):""])});
 dl("jol-esep-"+r[0]+"_"+r[1]+".csv","﻿"+rows.map(function(x){return x.map(q).join(",")}).join("\n"),"text/csv")}
function report(){var y=+(V.per=="all"?today():R()[1]).slice(0,4),c=C.tax(S,y),t=c.t,g={};Object.keys(t.byCat).forEach(function(k){if(k!="pers")g[k]=t.byCat[k]});
 var h='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report '+y+'</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:30px auto;padding:0 16px;color:#111}table{width:100%;border-collapse:collapse;margin:8px 0 20px}td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left;font-size:13.5px}.r{text-align:right}.n{font-size:12px;color:#666}</style></head><body>'+
 '<h2>Trucking income &amp; expense summary — '+y+'</h2><p class="n">Self-reported data prepared with Jol Esep. Estimate only — for review by a tax professional.</p>'+
 '<table><tr><td>Gross revenue (loads)</td><td class="r">'+M(t.gross)+'</td></tr><tr><td>Company fee / commission</td><td class="r">'+M(t.fee)+'</td></tr><tr><td>Driver gross earnings</td><td class="r">'+M(t.earn)+'</td></tr><tr><td>Other pay</td><td class="r">'+M(t.other)+'</td></tr><tr><td>Reimbursements</td><td class="r">'+M(t.reimb)+'</td></tr><tr><td>Advances (not expense)</td><td class="r">'+M(t.adv)+'</td></tr><tr><td>Settlement net pay</td><td class="r">'+M(t.net)+'</td></tr></table>'+
 '<h3>Business expenses</h3><table>'+Object.keys(g).sort(function(a,b){return g[b]-g[a]}).map(function(k){return '<tr><td>'+C.CAT[k].en+'</td><td class="r">'+M(g[k])+'</td></tr>'}).join("")+'<tr><th>Total</th><th class="r">'+M(t.exp)+'</th></tr></table>'+
 '<table><tr><td>Actual business profit</td><td class="r">'+M(t.profit)+'</td></tr><tr><td>Loaded / empty miles</td><td class="r">'+t.loaded+' / '+t.empty+'</td></tr><tr><td>Diesel gallons / DEF gallons</td><td class="r">'+(t.dieselGal/100).toFixed(1)+' / '+(t.defGal/100).toFixed(1)+'</td></tr><tr><td>Days away (per diem $80 × 80%)</td><td class="r">'+c.days+' → '+M(c.pdd)+'</td></tr>'+
 '<tr><td>Self-employment tax (est.)</td><td class="r">'+M(c.se)+'</td></tr><tr><td>Federal income tax (est., '+S.status.toUpperCase()+')</td><td class="r">'+M(c.fed)+'</td></tr><tr><td>State tax (est.)</td><td class="r">'+M(c.st)+'</td></tr><tr><th>Total estimated tax</th><th class="r">'+M(c.tot)+'</th></tr></table>'+
 '<p class="n">Fuel paid with company fuel cards is counted once, as a statement deduction. Detail: CSV export.</p><script>setTimeout(function(){window.print()},400)<\/script></body></html>';
 var w=window.open("","_blank");if(w){w.document.write(h);w.document.close()}else dl("jol-esep-report-"+y+".html",h,"text/html")}
function backup(){var out={app:"jolesep",v:2,date:new Date().toISOString(),data:S,photos:{}},ids=[];S.tx.forEach(function(t){if(t.ph)ids.push(t.ph)});S.stmts.forEach(function(s){ids.push(s.id)});var n=ids.length;
 function go(){dl("jol-esep-backup-"+today()+".json",JSON.stringify(out),"application/json")}if(!n)return go();ids.forEach(function(id){phGet(id,function(d){if(d)out.photos[id]=d;if(--n===0)go()})})}
function restore(f){var fr=new FileReader();fr.onload=function(){try{var o=JSON.parse(fr.result);if(o.app!="jolesep"||!o.data)throw 0;try{localStorage.setItem(LS+"_backup_before_restore",JSON.stringify(S))}catch(e){}
 localStorage.setItem(LS,JSON.stringify(o.data));S=loadS();Object.keys(o.photos||{}).forEach(function(k){phPut(k,o.photos[k])});log("restore",o.date);save();toast(L("restored"));render()}catch(e){toast(L("badFile"))}};fr.readAsText(f)}
function histSheet(){sheet("🕘 "+L("hist"),S.log.slice().reverse().slice(0,200).map(function(x){return '<div class="tl"><span>'+x.t.slice(0,16).replace("T"," ")+' · '+esc(x.a)+'</span><b style="font-weight:600;font-size:13px">'+esc(x.s)+'</b></div>'}).join("")||'<div class="empty">—</div>')}
function thumbs(){var els=document.querySelectorAll("[data-th]");for(var i=0;i<els.length;i++)(function(e){phGet(e.getAttribute("data-th"),function(d){if(d)e.innerHTML='<img src="'+d+'" alt="">'})})(els[i])}

/* ---------- events ---------- */
var ATTR=["data-ef","data-tab","data-act","data-per","data-sh","data-ys","data-lang","data-src","data-grp","data-st","data-tx","data-load","data-trip","data-mk"];
document.addEventListener("click",function(e){if($("ov")&&$("ov").contains(e.target)&&!e.target.closest(".sh [data-st],.sh [data-tx],.sh [data-load],.sh [data-mk],.sh [data-act]"))return;
 var t=e.target,k=null;while(t&&t!==document){for(var i=0;i<ATTR.length;i++)if(t.getAttribute&&t.getAttribute(ATTR[i])!=null){k=ATTR[i];break}if(k)break;t=t.parentNode}if(!k)return;var v=t.getAttribute(k);
 if(k=="data-ef"){V.ef=v;render()}else if(k=="data-tab"){V.tab=v;render();window.scrollTo(0,0)}else if(k=="data-lang"){S.lang=v;save();document.documentElement.lang=v=="ru"?"ru":v=="kz"?"kk":"ky";render()}
 else if(k=="data-per"){V.per=v;if(v=="custom"&&!V.c0){var r=C.range("month",V.ref);V.c0=r[0];V.c1=r[1]}render()}else if(k=="data-sh")shift(+v);else if(k=="data-ys"){V.per="year";V.ref=(+R()[0].slice(0,4)+(+v))+"-01-01";render()}
 else if(k=="data-src")srcSheet(v);else if(k=="data-grp")grpSheet(v);else if(k=="data-st")stDetail(v);else if(k=="data-tx"){pend=null;var tx=find(S.tx,v);txForm(v,null,tx&&tx.kind)}else if(k=="data-load")loadForm(v);else if(k=="data-trip")tripForm(v);
 else if(k=="data-mk"){if(v=="load")loadForm();else{pend=null;txForm(null,null,v)}}
 else if(k=="data-act"){if(v=="s_mi")rpmSheet();else if(v=="editMi")milesSheet();else if(v.indexOf("mied:")===0)milesSheet(v.slice(5));else if(v=="s_truck")truckSheet();else if(v=="s_debt")debtSheet();else if(v=="s_shop")shopSheet();else if(v.indexOf("debt:")===0)debtForm(v.slice(5));else if(v.indexOf("shop:")===0)shopForm(v.slice(5));else if(v=="addLoad")loadForm();else if(v=="addExp"){pend=null;txForm(null,null,"exp")}else if(v=="fixdup")fixDup();else if(v=="stmt")$("stIn").click();else if(v=="scan"){pend=null;V.ed={};$("fileIn").click()}else if(v=="manual")manualMenu();else if(v=="addTrip")tripForm();else if(v=="csv")csv();else if(v=="report")report();else if(v=="backup")backup();else if(v=="restore")$("bkIn").click();else if(v=="hist")histSheet();
  else if(v=="cust"){V.c0=$("c0").value;V.c1=$("c1").value;if(V.c1<V.c0){var z=V.c0;V.c0=V.c1;V.c1=z}render()}
  else if(v=="saveSet"){S.role=$("roS").value;S.pay.type=$("ptS").value;var pr=$("prI").value;S.pay.rate=S.pay.type=="pct"?(C.bp(pr)||0):(C.cents(pr)||0);S.status=$("stS").value;S.stBp=Math.max(0,Math.min(2000,C.bp($("stR").value)||0));S.paid[today().slice(0,4)]=Math.max(0,C.cents($("stP").value)||0);log("settings","");save();toast(L("saved_"));render()}
  else if(v=="wipe"){if(confirm(L("wipeQ"))){try{localStorage.setItem(LS+"_backup_before_wipe",JSON.stringify(S))}catch(e){}var lg=S.lang;localStorage.removeItem(LS);S=loadS();S.lang=lg;log("wipe","");save();render()}}}
});
$("fileIn").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(f)onPhoto(f)});
$("stIn").addEventListener("change",function(){var a=[],f=this.files;for(var i=0;i<(f?f.length:0);i++)a.push(f[i]);this.value="";if(a.length)onStatements(a)});
$("bkIn").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(f)restore(f)});
var _r=render;render=function(){_r();if(V.tab=="exps")thumbs()};
(function(){var r=C.range("week",V.ref),has=S.stmts.some(function(x){return C.inR(C.stDay(x),r)})||S.loads.some(function(x){return C.inR(x.d,r)})||S.tx.some(function(x){return C.inR(x.d,r)});
 if(!has&&S.stmts.length){var last=S.stmts.map(C.stDay).sort().pop();if(last)V.ref=last}})();
document.documentElement.lang=S.lang=="ru"?"ru":"ky";render();
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
window.JEAPP={S:function(){return S},render:function(){S=loadS();render()}};
})();
