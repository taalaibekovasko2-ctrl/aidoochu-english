// Builds ios-app/www from the website in ../docs WITHOUT changing the website.
// The site files are copied; only the COPY gets iPhone-app adjustments:
//   - no web analytics script, no install-to-home-screen hints, no web manifest
//   - ios-shim.js loaded first (native voice, iPhone-only hiding, moving a code from the site)
// Everything the lessons need (cards, dialogs, situations, game, images) is inside the app → works offline.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const site = join(root, "..", "docs");
const www = join(root, "www");

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });

// the app = the site's main page + its images and icons (other pages of docs/ are separate sites and are not copied)
cpSync(join(site, "img"), join(www, "img"), { recursive: true });
for (const f of ["icon-192.png", "icon-512.png"]) copyFileSync(join(site, f), join(www, f));
copyFileSync(join(here, "..", "src", "ios-shim.js"), join(www, "ios-shim.js"));

let html = readFileSync(join(site, "index.html"), "utf8");
const n0 = html.length;
const must = (re, what) => { if (!re.test(html)) throw new Error("build-www: not found in docs/index.html: " + what); html = html.replace(re, ""); };

must(/<script[^>]*goatcounter[^>]*><\/script>\s*/i, "GoatCounter script");          // no web analytics inside the app
must(/<link rel="manifest"[^>]*>\s*/i, "web manifest link");                          // a home-screen web app manifest is not used by the app
html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/i, "")
           .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/i, "");      // font falls back to the iPhone system font (offline)
html = html.replace(/<head>/i, '<head>\n<script src="ios-shim.js"></script>');        // shim before the app code
if (!html.includes('src="ios-shim.js"')) throw new Error("build-www: shim not injected");

writeFileSync(join(www, "index.html"), html);
console.log(`www built: index.html ${n0} → ${html.length} bytes, img/ + icons copied`);
if (!existsSync(join(www, "img", "inspector.jpg"))) throw new Error("build-www: images missing");
