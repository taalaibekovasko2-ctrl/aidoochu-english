# Apple Developer аккаунтун ачуудан TestFlight'ка чейин: кадам сайын

> Бул нускамадагы төлөмдөрдү **сиз өзүңүз** жасайсыз. Claude эч кандай төлөм жасабайт жана эч нерсени жарыялабайт.
> Жалгыз милдеттүү чыгым: **Apple Developer Program, $99/жыл**.

## 0. Даярдык (бекер)
- iPhone (iOS 17 же андан жаңы).
- **Apple ID**, эки кадамдуу текшерүү (two-factor authentication) күйгүзүлгөн: iPhone → Settings → [атыңыз] → Sign-In & Security.
- Паспорттогудай **аты-жөнүңүз** латын тамгасы менен, дарегиңиз, телефонуңуз.
- Чет өлкөдө иштеген банк картасы (Visa / Mastercard).
- Жеке адам (Individual) катары катталасыз: D-U-N-S номери керек эмес. App Store'до сатуучу катары **аты-жөнүңүз** көрүнөт.

## 1. Apple Developer Program'га катталуу ($99)
1. iPhone'го App Store'дон **Apple Developer** колдонмосун орнотуңуз. Бул эң тез жол.
2. Колдонмону ачып, Apple ID менен кириңиз → **Account** → **Enroll Now**.
3. **Individual / Sole Proprietor** тандаңыз. Аты-жөнүңүздү паспорттогудай жазыңыз.
4. Апплдын келишимин окуп, макул болуңуз. **$99** төлөңүз (жылына бир жолу, автоматтык түрдө узартылат).
5. Тастыктоону күтүңүз. Адатта бир нече саат, кээде 48 саатка чейин созулат. «Welcome to the Apple Developer Program» деген кат келет.
6. Эскертүү: Apple сизден паспорттун сүрөтүн суроосу мүмкүн. Бул кадимки текшерүү.

## 2. Колдонмонун ID'син жана App Store Connect'теги жазуусун түзүү (бекер)
1. https://developer.apple.com/account → **Certificates, Identifiers & Profiles** → **Identifiers** → **＋** →
   **App IDs** → **App**. Bundle ID: **Explicit** → `com.aidoochu.english`. Capabilities бөлүмүндө **In-App Purchase** белгиленген
   болушу керек (демейки боюнча белгиленген). **Register**.
2. https://appstoreconnect.apple.com → **Apps** → **＋ → New App**:
   Platform **iOS**, Name **Aidoochu English**, Primary language **English (U.S.)**, Bundle ID `com.aidoochu.english`,
   SKU `aidoochu-english-ios`, User Access **Full Access**.
3. Жогору жактагы **Team ID**'ни жазып алыңыз: developer.apple.com/account → Membership details (10 белги, мисалы `AB12CD34EF`).

## 3. Төлөм алуу үчүн келишим (IAP'ка керек, бекер)
App Store Connect → **Business** (же Agreements, Tax, and Banking) → **Paid Apps** →
1. Келишимди кабыл алыңыз.
2. **Bank account:** акча түшө турган эсеп.
3. **Tax forms:** АКШда жашасаңыз **W-9**, жашабасаңыз **W-8BEN**.
4. Статус **Active** болгондо сатып алуулар иштейт. Бир нече күн алышы мүмкүн.
5. Ушул жерде **App Store Small Business Program**'го арыз бериңиз. Ошондо Apple'дын үлүшү 30% эмес, **15%** болот.

## 4. GitHub үчүн API ачкычы (бекер)
1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API** → **Team Keys** → **＋**.
   Аты: `GitHub TestFlight`, Access: **App Manager** → **Generate**.
2. **Download API Key**: `AuthKey_XXXXXXXXXX.p8` файлы **бир гана жолу** жүктөлөт, аны жоготпоңуз жана эч кимге бербеңиз.
   **Key ID** жана жогорудагы **Issuer ID**'ни жазып алыңыз.
3. GitHub → репозиторий `aidoochu-english` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
   Төртөөнү кошуңуз:
   | Аты | Мааниси |
   |---|---|
   | `ASC_KEY_ID` | Key ID |
   | `ASC_ISSUER_ID` | Issuer ID |
   | `ASC_KEY_P8` | .p8 файлдын бүт тексти (`-----BEGIN PRIVATE KEY-----` деп башталат), ошол бойдон коюлат |
   | `APPLE_TEAM_ID` | Team ID |
   Secrets'ти эч ким, анын ичинде Claude да окуй албайт. Аларды курагыч гана колдонот.

## 5. Толук версияны сатып алуу продукту (бекер, баасын сиз коёсуз)
App Store Connect → колдонмо → **Monetization → In-App Purchases** → **＋**:
Type **Non-Consumable**, Reference Name `Full version`, Product ID **`com.aidoochu.english.full`** (так ушундай болсун, колдонмо ушул ID'ни издейт).
**Price** сиз тандайсыз. **Localization** (EN/RU): аты «Full version / Полная версия», кыскача сүрөттөмө.
Review үчүн скриншот: кулпу терезесинин сүрөтү (`appstore/screenshots` ичинен же TestFlight'тан).

## 6. TestFlight'ка жүктөө
1. **Бир жолу:** `.github/workflows/testflight.yml` файлы `main` бутагына кошулушу керек, анткени GitHub кол менен иштетилүүчү
   workflow'ду негизги бутактан гана көрсөтөт. Бул файл сайттын баракчаларын өзгөртпөйт. Claude сиздин уруксатыңыз менен кошот.
2. GitHub → **Actions** → **iOS TestFlight** → **Run workflow** → mode **upload** → Run. Курулуш ≈10–20 мүнөт алат.
3. App Store Connect → колдонмо → **TestFlight**: build 5–30 мүнөттөн кийин чыгат. Биринчи жолу «Export Compliance» суралса,
   **None of the algorithms** тандалат (`ITSAppUsesNonExemptEncryption = NO` коюлган, адатта суралбайт).
4. **Internal Testing** → **＋** → тестерлер тобу → өзүңүздүн Apple ID'иңизди кошуңуз (100 адамга чейин, Apple текшербейт).
5. iPhone'го App Store'дон **TestFlight** колдонмосун орнотуңуз → чакыруу каты/шилтеме → **Install**.
6. Сатып алууну акчасыз текшерүү: App Store Connect → Users and Access → **Sandbox** → Test Accounts → ＋
   (жаңы, колдонулбаган email). TestFlight'та сатып алуу акчасыз болот, Sandbox тестер автоматтык түрдө колдонулат.

## 7. Supabase (бекер, бир жолу)
https://supabase.com/dashboard → долбоор → **SQL Editor** → **New query**:
1. `supabase/league-report.sql` файлынын ичин коюп, **Run**: лигадагы даттануулар.
2. `supabase/transfer-claim.sql` файлынын ичин коюп, **Run**: бир сатып алуу 3 iPhone'дон ашпайт.
Экөө тең мурунку маалыматка тийбейт. Кайра иштетсе да зыяны жок (PostgreSQL 16'да текшерилди).
Даттанууларды карап чыгуу: `select * from league_reported_names;`

## 8. Apple'дын текшерүүчүсү үчүн көчүрүү коду (милдеттүү эмес)
Текшерүүчү толук версияны Sandbox сатып алуусу менен ача алат. Көчүрүү функциясын да текшерсин десеңиз:
кодду түзгөн программаңыз менен **REVW-0001** ID'си үчүн код түзүп, Claude'го жибериңиз.
Claude андан `AEX1.` көчүрүү кодун жасап, `appstore/LISTING.md` → Review Notes'ко коёт.

## 9. App Store'го жарыялоо: сиздин уруксатыңыз менен гана
App Store Connect → колдонмо → версия **1.0**: тексттер `appstore/LISTING.md`, скриншоттор `appstore/screenshots/`,
App Privacy `APP-STORE-PRIVACY.md`, build TestFlight'тан тандалат, IAP продукт кошулат → **Add for Review** → **Submit**.
Текшерүү адатта 1–3 күн. Release тандоосу: «Manually release». Ошондо колдонмо сиз баскычты басмайынча чыкпайт.
