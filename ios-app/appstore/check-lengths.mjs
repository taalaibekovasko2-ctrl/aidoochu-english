// Checks App Store text limits in LISTING.md (Name/Subtitle 30, Keywords 100, Promotional 170, Description 4000)
import { readFileSync } from "node:fs";
const md = readFileSync(new URL("./LISTING.md", import.meta.url), "utf8");
const row = k => md.split("\n").find(l => l.startsWith("| " + k + " |")).split("|").map(s => s.trim());
const kw = [...md.matchAll(/^- (EN|RU): `([^`]+)`/gm)].map(m => [m[1], m[2]]);
const promo = [...md.matchAll(/^- (EN|RU): (.+)$/gm)].filter(m => !m[2].startsWith("`")).map(m => [m[1], m[2]]);
const desc = [...md.matchAll(/## Description — ([^\n]+)\n\n```\n([\s\S]*?)```/g)].map(m => [m[1], m[2].trim()]);
const out = []; const chk = (n, s, max) => out.push(`${s.length <= max ? "OK  " : "LONG"} ${n}: ${s.length}/${max}`);
for (const k of ["Name", "Subtitle"]) { const r = row(k); chk(k + " EN", r[3], 30); chk(k + " RU", r[4], 30); }
kw.forEach(([l, s]) => chk("Keywords " + l, s, 100)); promo.forEach(([l, s]) => chk("Promo " + l, s, 170)); desc.forEach(([l, s]) => chk("Description " + l, s, 4000));
console.log(out.join("\n")); if (out.some(x => x.startsWith("LONG"))) process.exit(1);
