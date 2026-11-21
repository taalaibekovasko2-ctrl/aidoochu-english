/* Aidoochu English — iPhone app adjustments. Loaded BEFORE the app code, only inside the iPhone app (never on the website).
   1) iPhone-only look: no "install from Safari" hint, no admin button, no GoFundMe frame (fundraising is not allowed inside iOS apps).
   2) Voice: English is spoken by the iPhone's own voice engine (native plugin) when it is present, otherwise by the web voice.
   3) Moving from the website: a "transfer code" made on the website (phase 2) brings the device ID, the activation code,
      game progress and language into the app, so a code bought earlier keeps working and progress is not lost. */
(function () {
  "use strict";
  window.AIDOOCHU_IOS = true;

  // ---------- 1) iPhone-only look ----------
  var css = ".inst{display:none!important}.fadm{display:none!important}iframe.gfm{display:none!important}" +
    /* in the app the full version is bought through Apple; buying a code from a seller (WhatsApp / phone / "send ID to seller") is website-only */
    ".lock>p:not(.ae-keep),.lock>.did,.lock>.lrow,.lock>#acode,.lock>[data-lk=ok],.lock>a.wa{display:none!important}" +
    "#ae-iap{margin:12px 0;padding:14px;border-radius:14px;background:#fff1dc;text-align:left}#ae-iap b{font-size:16px}" +
    "#ae-iap button{display:block;width:100%;margin-top:8px;padding:12px;border-radius:12px;border:0;font-weight:800;font-size:15px}" +
    "#ae-buy{background:#111;color:#fff}#ae-buy:disabled{background:#999}#ae-restore{background:transparent;color:#111;border:1.5px solid #111!important}#ae-iap-msg{font-size:13px;margin-top:6px}";
  function addCss() { var s = document.createElement("style"); s.id = "ios-shim-css"; s.textContent = css; (document.head || document.documentElement).appendChild(s); }
  if (document.head) addCss(); else document.addEventListener("DOMContentLoaded", addCss);

  // ---------- 2) native voice ----------
  function tts() { var C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.TextToSpeech || null; }
  var syn = window.speechSynthesis;
  if (syn) {
    var webSpeak = syn.speak.bind(syn), webCancel = syn.cancel.bind(syn), busy = 0;
    syn.speak = function (u) {
      var T = tts();
      if (!T) return webSpeak(u);
      busy++;
      try { if (u.onstart) u.onstart({ utterance: u }); } catch (e) {}
      T.speak({ text: String(u.text || ""), lang: u.lang || "en-US", rate: u.rate || 1, pitch: u.pitch || 1, volume: u.volume == null ? 1 : u.volume, category: "playback" })
        .then(function () { busy = Math.max(0, busy - 1); try { if (u.onend) u.onend({ utterance: u }); } catch (e) {} },
              function (err) { busy = Math.max(0, busy - 1); try { if (u.onerror) u.onerror({ utterance: u, error: String(err) }); } catch (e) {} });
    };
    syn.cancel = function () { var T = tts(); busy = 0; if (T) { try { T.stop(); } catch (e) {} } try { webCancel(); } catch (e) {} };
    try { Object.defineProperty(syn, "speaking", { configurable: true, get: function () { return busy > 0; } }); } catch (e) {}
  }


  // ---------- 4) Apple In-App Purchase (test mode until the product exists in App Store Connect; no price is set in code) ----------
  var PRODUCT = "com.aidoochu.english.full";
  var IAP = {
    t: ["🍎 Толук версияны Apple аркылуу ачуу", "🍎 Толық нұсқаны Apple арқылы ашу", "🍎 Открыть полную версию через Apple", "🍎 Unlock the full version with Apple"],
    s: ["Бир жолу төлөйсүз, түбөлүк ачык. Төлөм Apple аркылуу өтөт.", "Бір рет төлейсіз, мәңгі ашық. Төлем Apple арқылы өтеді.", "Платите один раз, открыто навсегда. Оплата через Apple.", "Pay once, unlocked forever. Payment goes through Apple."],
    buy: ["Сатып алуу", "Сатып алу", "Купить", "Buy"],
    restore: ["Сатып алууларды калыбына келтирүү", "Сатып алуларды қалпына келтіру", "Восстановить покупки", "Restore Purchases"],
    na: ["Apple'да азырынча даяр эмес (сыноо версиясы).", "Apple-да әзірге дайын емес (сынақ нұсқасы).", "Пока не доступно в Apple (тестовая версия).", "Not available from Apple yet (test version)."],
    wait: ["⏳ Apple менен байланышууда…", "⏳ Apple-мен байланыс…", "⏳ Связь с Apple…", "⏳ Contacting Apple…"],
    none: ["Бул Apple ID менен сатып алуу табылган жок.", "Бұл Apple ID-мен сатып алу табылмады.", "Покупка для этого Apple ID не найдена.", "No purchase found for this Apple ID."],
    fail: ["Сатып алуу аяктаган жок. Кайра аракет кылыңыз.", "Сатып алу аяқталмады. Қайталап көріңіз.", "Покупка не завершена. Попробуйте ещё раз.", "Purchase not completed. Please try again."]
  };
  function iapP() { var C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.NativePurchases || null; }
  function unlockFull() {
    try { localStorage.setItem("iapOk", "1"); } catch (e) {}
    try { if (typeof __ok !== "undefined") { __ok = true; __lockOpen = false; var nav = document.getElementById("nav"); if (nav) nav.style.display = ""; render(); window.scrollTo(0, 0); } } catch (e) {}
  }
  function owned(list) { return (list || []).some(function (t) { return t && t.productIdentifier === PRODUCT && (t.isActive !== false) && !/refund|revok/i.test(String(t.purchaseState || "")); }); }
  function checkOwned(silent) {
    var P = iapP(); if (!P) return Promise.resolve(null);
    return P.getPurchases({ productType: "inapp", onlyCurrentEntitlements: true }).then(function (r) { var o = owned(r && r.purchases); if (o) unlockFull(); else if (!silent) {} return o; }, function () { return null; });
  }
  window.aidoochuIAP = { product: PRODUCT, checkOwned: checkOwned };
  function addIapBox() {
    var lock = document.querySelector(".lock"); if (!lock || document.getElementById("ae-iap")) return;
    var i = li(), box = document.createElement("div"); box.id = "ae-iap";
    box.innerHTML = '<b>' + IAP.t[i] + '</b><div style="font-size:13px;margin-top:4px">' + IAP.s[i] + '</div>' +
      '<button id="ae-buy" disabled>' + IAP.buy[i] + '</button><button id="ae-restore">' + IAP.restore[i] + '</button><div id="ae-iap-msg"></div>';
    var h = lock.querySelector("h3"); lock.insertBefore(box, h ? h.nextSibling : lock.firstChild);
    var msg = function (t) { var m = document.getElementById("ae-iap-msg"); if (m) m.textContent = t; }, P = iapP(), buy = document.getElementById("ae-buy");
    if (!P) { msg(IAP.na[i]); } else {
      P.getProducts({ productIdentifiers: [PRODUCT], productType: "inapp" }).then(function (r) {
        var pr = r && r.products && r.products[0];
        if (pr) { buy.disabled = false; buy.textContent = IAP.buy[i] + (pr.priceString ? " · " + pr.priceString : ""); } else msg(IAP.na[i]);
      }, function () { msg(IAP.na[i]); });
    }
    buy.onclick = function () { var P2 = iapP(); if (!P2) return; buy.disabled = true; msg(IAP.wait[i]);
      P2.purchaseProduct({ productIdentifier: PRODUCT, productType: "inapp", quantity: 1 }).then(function () { msg(""); unlockFull(); }, function () { buy.disabled = false; msg(IAP.fail[i]); }); };
    document.getElementById("ae-restore").onclick = function () { var P3 = iapP(); if (!P3) { msg(IAP.na[i]); return; } msg(IAP.wait[i]);
      P3.restorePurchases().then(function () { return checkOwned(false); }, function () { return checkOwned(false); }).then(function (o) { if (!o) msg(IAP.none[i]); }); };
  }
  // at start: a purchase made earlier opens the app offline at once, then Apple confirms it in the background
  window.addEventListener("load", function () {
    var had = false; try { had = localStorage.getItem("iapOk") === "1"; } catch (e) {}
    if (had) setTimeout(unlockFull, 0);
    setTimeout(function () { checkOwned(true).then(function (o) { if (o === false && had) { try { localStorage.removeItem("iapOk"); } catch (e) {} } }); }, 1500);
  });

  // ---------- 3) moving from the website (code + progress) ----------
  var TX = {
    t: ["Сайтта сатып алгансызбы?", "Сайтта сатып алдыңыз ба?", "Покупали на сайте?", "Bought on the website?"],
    s: ["Сайттан алган көчүрүү кодун ушул жерге коюңуз. Кодуңуз жана прогрессиңиз ушул колдонмого өтөт.",
        "Сайттан алған көшіру кодын осында қойыңыз. Кодыңыз бен прогресіңіз осы қосымшаға өтеді.",
        "Вставьте код переноса с сайта. Ваш код и прогресс перейдут в это приложение.",
        "Paste the transfer code from the website. Your code and progress move into this app."],
    b: ["Көчүрүү", "Көшіру", "Перенести", "Transfer"],
    bad: ["Көчүрүү коду туура эмес.", "Көшіру коды қате.", "Неверный код переноса.", "Wrong transfer code."]
  };
  function li() { var v = null; try { v = localStorage.getItem("lang"); } catch (e) {} var n = ["KG", "KZ", "RU", "US"].indexOf(v); return n < 0 ? 0 : n; }
  function b64uDec(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }
  // format: "AEX1." + base64url(JSON {did, act, game?, lang?, promoOk?})  — made by the website in phase 2
  window.aidoochuImport = function (raw) {
    var s = String(raw || "").trim().replace(/\s+/g, ""), m = s.match(/^AEX1\.([A-Za-z0-9_-]+)$/);
    if (!m) return false;
    var o; try { o = JSON.parse(b64uDec(m[1])); } catch (e) { return false; }
    if (!o || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(o.did || "") || (o.act && !/^[A-Za-z0-9_-]{20,200}$/.test(o.act))) return false;
    try {
      localStorage.setItem("did", o.did);
      if (o.act) localStorage.setItem("act", o.act);
      if (o.game && typeof o.game === "object") localStorage.setItem("game", JSON.stringify(o.game));
      if (/^(KG|KZ|RU|US)$/.test(o.lang || "")) localStorage.setItem("lang", o.lang);
      if (o.promoOk && /^[A-Z]{2,20}$/.test(o.promoOk)) { localStorage.setItem("promo", o.promoOk); localStorage.setItem("promoOk", o.promoOk); }
    } catch (e) { return false; }
    return true;
  };
  function addTransferBox() {
    var pc = document.getElementById("pcode");
    if (!pc || document.getElementById("ae-xfer")) return;
    var i = li(), box = document.createElement("div");
    box.id = "ae-xfer";
    box.style.cssText = "margin:14px 0;padding:12px;border:1px dashed #bbb;border-radius:12px;text-align:left";
    box.innerHTML = '<b>🔁 ' + TX.t[i] + '</b><div style="font-size:13px;margin:6px 0">' + TX.s[i] + '</div>' +
      '<textarea id="ae-xfer-in" rows="3" style="width:100%;box-sizing:border-box;font:13px monospace" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>' +
      '<button id="ae-xfer-go" style="margin-top:6px;padding:10px 16px;border-radius:10px;border:0;background:#ff9000;color:#fff;font-weight:700">' + TX.b[i] + '</button>' +
      '<div id="ae-xfer-err" style="color:#d63a2b;font-size:13px;margin-top:4px"></div>';
    var host = pc.closest("div") || pc.parentNode;
    host.parentNode.insertBefore(box, host.nextSibling);
    document.getElementById("ae-xfer-go").onclick = function () {
      if (window.aidoochuImport(document.getElementById("ae-xfer-in").value)) location.reload();
      else document.getElementById("ae-xfer-err").textContent = TX.bad[li()];
    };
  }
  function onDom() { addIapBox(); addTransferBox(); }
  function watch() { new MutationObserver(onDom).observe(document.body, { childList: true, subtree: true }); onDom(); }
  if (document.body) watch(); else document.addEventListener("DOMContentLoaded", watch);
})();
