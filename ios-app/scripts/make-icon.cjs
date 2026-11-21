// Renders assets/icon.svg → the 1024×1024 App Store icon (RGB, no transparency) with the preinstalled Chromium.
const { chromium } = require("playwright"), fs = require("fs"), path = require("path");
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, "..", "assets", "icon.svg"), "utf8");
  const out = path.join(__dirname, "..", "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset", "AppIcon-512@2x.png");
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  await p.setContent(`<html><body style="margin:0;background:#000">${svg}</body></html>`);
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 1024, height: 1024 }, omitBackground: false });
  await b.close(); console.log("icon →", out);
})();
