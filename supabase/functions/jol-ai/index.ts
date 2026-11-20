// «Жол Эсеп» — AI statement reader (Supabase Edge Function, Deno).
// The browser sends ONE document; this function asks Claude to read it and returns structured JSON.
// Secrets live only here (Supabase → Edge Functions → Secrets): ANTHROPIC_API_KEY, optional JOL_AI_SALT.
// Nothing is stored except a per-IP daily counter (hashed IP). Plain JS syntax on purpose (testable in Node).

const MODEL = "claude-sonnet-5-5";
const MAX_B64 = 14_000_000;          // ≈10 MB file
const DAILY_LIMIT = 30;              // requests per IP per day
const ORIGINS = ["https://taalaibekovasko2-ctrl.github.io", "http://localhost", "http://127.0.0.1"];
const KINDS = ["expense", "debt", "advance", "deposit", "holdback", "adjust", "loan", "unclear"];

const env = (k) => (globalThis.Deno ? Deno.env.get(k) : globalThis.process?.env?.[k]) || "";

function cors(origin) {
  const ok = ORIGINS.some((o) => origin === o || origin.startsWith(o + ":"));
  return {
    "Access-Control-Allow-Origin": ok ? origin : ORIGINS[0],
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
const json = (o, status, h) => new Response(JSON.stringify(o), { status, headers: { ...h, "content-type": "application/json" } });

export const TOOL = (cats) => ({
  name: "record_statement",
  description: "Record everything printed on this truck-driver pay/settlement statement. Copy numbers exactly as printed. Use null for anything that is not printed. Never invent or adjust a number to make totals match.",
  input_schema: {
    type: "object",
    properties: {
      company: { type: ["string", "null"] }, driver: { type: ["string", "null"] }, unit: { type: ["string", "null"], description: "truck / unit number" },
      statement_number: { type: ["string", "null"] }, statement_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
      period_start: { type: ["string", "null"], description: "YYYY-MM-DD" }, period_end: { type: ["string", "null"], description: "YYYY-MM-DD" },
      gross_total: { type: ["number", "null"], description: "total freight / load revenue before the company's cut, USD" },
      driver_earnings: { type: ["number", "null"], description: "driver's share of gross (after commission), USD, as printed" },
      commission_amount: { type: ["number", "null"] }, driver_percent: { type: ["number", "null"], description: "driver's percentage, e.g. 88" },
      deductions_total: { type: ["number", "null"], description: "printed total of all deductions/expenses, positive" },
      net_pay: { type: ["number", "null"], description: "printed final amount paid to the driver (net / total payable / check amount)" },
      calculation_order: { type: ["string", "null"], description: "how this statement gets from gross to net, in one line" },
      loads: { type: "array", items: { type: "object", properties: {
        load_id: { type: ["string", "null"] }, pickup: { type: ["string", "null"], description: "City, ST" }, delivery: { type: ["string", "null"], description: "City, ST" },
        pickup_date: { type: ["string", "null"] }, gross: { type: ["number", "null"] }, driver_amount: { type: ["number", "null"] },
        loaded_miles: { type: ["number", "null"] }, empty_miles: { type: ["number", "null"] }, page: { type: ["integer", "null"] } } } },
      deductions: { type: "array", description: "every line that reduces pay, once. Not subtotals, not totals, not detail rows that only break down another listed line (e.g. individual fuel transactions when a Fuel total line exists).",
        items: { type: "object", required: ["label", "amount", "category", "kind"], properties: {
          label: { type: "string", description: "exact text from the document" },
          amount: { type: "number", description: "positive when it lowers pay; negative for credits/refunds/discounts" },
          category: { type: "string", enum: cats.map((c) => c[0]) },
          kind: { type: "string", enum: KINDS, description: "expense=business cost; debt=repaying company/shop debt or loan principal unknown; advance=repaying a cash/fuel advance; deposit=escrow; holdback=reserve kept by company; loan=truck loan payment; adjust=correction; unclear=meaning cannot be determined from the document" },
          evidence: { type: ["string", "null"], description: "short reason for kind, from the document" }, page: { type: ["integer", "null"] } } } },
      additions: { type: "array", items: { type: "object", required: ["label", "amount", "type"], properties: {
        label: { type: "string" }, amount: { type: "number" }, type: { type: "string", enum: ["reimbursement", "bonus_or_accessorial", "advance_paid_out", "other"] } } } },
      fuel_discount_included_in_fuel_line: { type: ["boolean", "null"], description: "true if a printed fuel discount is already reflected in the fuel deduction amount (then do NOT list it again)" },
      unreadable: { type: "array", items: { type: "string" }, description: "parts that could not be read reliably" },
    },
    required: ["loads", "deductions", "additions", "unreadable"],
  },
});

export function buildMessages(body) {
  const cats = Array.isArray(body.cats) ? body.cats.slice(0, 80).map((c) => [String(c[0]).slice(0, 30), String(c[1]).slice(0, 60)]) : [["other", "Other"]];
  const one = (p) => p.kind === "pdf"
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: p.data } }
    : p.kind === "image"
      ? { type: "image", source: { type: "base64", media_type: /^image\/(jpeg|png|webp|gif)$/.test(p.media_type) ? p.media_type : "image/jpeg", data: p.data } }
      : { type: "text", text: "DOCUMENT PART (converted from a spreadsheet/CSV):\n" + String(p.text || "").slice(0, 200000) };
  const docs = (Array.isArray(body.parts) && body.parts.length ? body.parts.slice(0, 10) : [body]).map(one);
  let ask = "This is a weekly pay statement (settlement) for a US truck driver. The layout is unknown to you in advance — understand its tables (which column is which, which rows are loads, which are deductions, which are totals). " +
    "Categories you may use: " + cats.map((c) => c[0] + " = " + c[1]).join("; ") + ". " +
    "Classify each deduction by its financial meaning using the document's own wording and context; if the meaning is not supported by the document, use kind \"unclear\". " +
    "Fuel discounts lower fuel cost once; never record them as income. Report each money movement once. Call record_statement.";
  if (body.feedback) ask += "\n\nA previous reading did not reconcile: " + String(body.feedback).slice(0, 2000) +
    "\nRe-read the document carefully (missed lines, totals taken as items, wrong column, sign errors). Do not change any printed number to force a match; if the document itself does not add up, say so in unreadable.";
  return { model: MODEL, max_tokens: 8000, tools: [TOOL(cats)], tool_choice: { type: "tool", name: "record_statement" },
    messages: [{ role: "user", content: [...docs, { type: "text", text: ask }] }] };
}

async function hashIp(ip) {
  const d = new TextEncoder().encode((env("JOL_AI_SALT") || "jol") + ip);
  const h = await crypto.subtle.digest("SHA-256", d);
  return Array.from(new Uint8Array(h)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function underLimit(ip) {
  const url = env("SUPABASE_URL"), key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return true;
  const r = await fetch(url + "/rest/v1/rpc/ai_hit", { method: "POST", headers: { apikey: key, Authorization: "Bearer " + key, "content-type": "application/json" },
    body: JSON.stringify({ p_ip: await hashIp(ip), p_limit: DAILY_LIMIT }) });
  if (!r.ok) return true; // counter table missing → do not block
  return (await r.json()) === true;
}

export async function handle(req, fetchImpl = fetch) {
  const h = cors(req.headers.get("origin") || "");
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405, h);
  const key = env("ANTHROPIC_API_KEY");
  if (!key) return json({ ok: false, error: "not_configured" }, 503, h);
  let body; try { body = await req.json(); } catch { return json({ ok: false, error: "bad_request" }, 400, h); }
  if (body.ping) return json({ ok: true, ready: true }, 200, h);
  const parts = Array.isArray(body.parts) && body.parts.length ? body.parts : [body];
  if (parts.length > 10 || parts.some((p) => !p || !["pdf", "image", "text"].includes(p.kind))) return json({ ok: false, error: "bad_kind" }, 400, h);
  const size = parts.reduce((n, p) => n + String(p.data || "").length + String(p.text || "").length, 0);
  if (size > MAX_B64) return json({ ok: false, error: "too_large" }, 413, h);
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "0";
  if (!(await underLimit(ip))) return json({ ok: false, error: "limit" }, 429, h);
  const r = await fetchImpl("https://api.anthropic.com/v1/messages", { method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify(buildMessages(body)) });
  if (!r.ok) return json({ ok: false, error: "ai_error", status: r.status }, 502, h);
  const out = await r.json();
  const tu = (out.content || []).find((c) => c.type === "tool_use" && c.name === "record_statement");
  if (!tu) return json({ ok: false, error: "no_result" }, 502, h);
  return json({ ok: true, model: out.model || MODEL, usage: out.usage || null, data: tu.input }, 200, h);
}

if (globalThis.Deno) Deno.serve((req) => handle(req));
