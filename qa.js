/* QA — bundles every non-browser check the work machine ran.
   Usage:  node qa.js
   Exit 0 = all pass, 1 = a failure. Browser UI checks are in BROWSER-TEST.md.
   No dependencies. Run from the app folder.                                  */
"use strict";
const fs = require("fs");
const { execFileSync, spawnSync } = require("child_process");
const os = require("os");
const path = require("path");

let fails = 0;
const ok = (n) => console.log("  PASS  " + n);
const bad = (n, d) => { fails++; console.log("  FAIL  " + n + (d ? "  — " + d : "")); };

const html = fs.readFileSync("index.html", "utf8");

/* 1. syntax: curriculum.js, sw.js, both inline <script> blocks */
console.log("[1] syntax");
for (const f of ["curriculum.js", "sw.js", "sims.js"]) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); ok("node --check " + f); }
  catch (e) { bad("node --check " + f, String(e.stderr || e.message).split("\n")[0]); }
}
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => {
  const tmp = path.join(os.tmpdir(), "ctrl_qa_" + i + ".js");
  fs.writeFileSync(tmp, s);
  try { execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" }); ok("inline script #" + i); }
  catch (e) { bad("inline script #" + i, String(e.stderr || e.message).split("\n")[0]); }
  fs.unlinkSync(tmp);
});

/* 2. curriculum vs registries integrity */
console.log("[2] curriculum integrity");
const CURRICULUM = (new Function(fs.readFileSync("curriculum.js", "utf8") + "; return CURRICULUM;"))();
const G = {}; new Function("window", "globalThis", "getComputedStyle", "document", fs.readFileSync("sims.js", "utf8"))(G, G, () => ({ getPropertyValue: () => "" }), { documentElement: {} });
const simIds = new Set(Object.keys(G.CTRL_SIMS));
const dgKeys = new Set(Object.keys(G.CTRL_DIAGRAMS));
const counts = {};
let intErrs = 0;
CURRICULUM.modules.forEach(mod => (mod.stages || []).forEach(st => (st.blocks || []).forEach((b, i) => {
  counts[b.type] = (counts[b.type] || 0) + 1;
  const loc = mod.id + " L" + st.stage + " #" + i;
  if (b.type === "diagram" && !dgKeys.has(b.id)) { intErrs++; bad("diagram ref", b.id + " @ " + loc); }
  if (b.type === "sim" && !simIds.has(b.sim)) { intErrs++; bad("sim ref", b.sim + " @ " + loc); }
  if (b.type === "quickcheck" && (!Array.isArray(b.options) || typeof b.answer !== "number" || b.answer < 0 || b.answer >= b.options.length)) { intErrs++; bad("quickcheck", loc); }
  if (b.type === "match" && (!Array.isArray(b.pairs) || b.pairs.some(p => !Array.isArray(p) || p.length !== 2))) { intErrs++; bad("match", loc); }
  if (b.type === "predict" && (!b.q || !b.a)) { intErrs++; bad("predict", loc); }
  if (b.type === "video" && !/^https:\/\/(www\.)?youtu/.test(b.url || "")) { intErrs++; bad("video url", loc); }
  if (/—/.test(JSON.stringify(b))) { intErrs++; bad("em dash in content", loc); }
})));
CURRICULUM.modules.forEach(mod => (mod.stages || []).forEach(st => { const seen = new Set();
  ((st.test || {}).pool || []).forEach(x => { if (seen.has(x.q)) { intErrs++; bad("duplicate question text", mod.id + " L" + st.stage + ": " + x.q); } seen.add(x.q);
    if (x.type === "mcq" && (x.answer < 0 || x.answer >= x.options.length)) { intErrs++; bad("mcq answer index", x.q); } });
  if (!mod.free && !st.test) { intErrs++; bad("stage has no test", mod.id + " L" + st.stage); } }));
if (!intErrs) ok("all diagram/sim refs resolve; quickcheck/match/predict well-formed");
console.log("        block counts: " + JSON.stringify(counts));

/* 3. SVG well-formedness */
console.log("[3] diagram SVG");
try {
  const DIAGRAMS = G.CTRL_DIAGRAMS;
  let svgBad = 0;
  for (const [id, svg] of Object.entries(DIAGRAMS)) {
    const opens = (svg.match(/<[a-zA-Z]/g) || []).length;
    const closes = (svg.match(/<\//g) || []).length;
    const selfc = (svg.match(/\/>/g) || []).length;
    if (!/^<svg /.test(svg) || !/<\/svg>$/.test(svg) || opens !== closes + selfc) { svgBad++; bad("SVG", id); }
  }
  if (!svgBad) ok(Object.keys(DIAGRAMS).length + " SVG diagrams well-formed");
} catch (e) { bad("SVG parse", e.message); }

/* 3b. numerical core unit tests */
console.log("[3b] maths (test-math.js)");
{ const r = spawnSync(process.execPath, ["test-math.js"], { encoding: "utf8" });
  if ((r.stdout || "").includes("RESULT: PASS")) ok("control maths matches textbook values"); else bad("test-math.js", (r.stdout || r.stderr || "").trim().split(/\r?\n/).pop()); }

/* 4. offline asset resolution (delegates to verify.js) */
console.log("[4] offline assets (verify.js)");
if (fs.existsSync("verify.js")) {
  const r = spawnSync(process.execPath, ["verify.js", "."], { encoding: "utf8" });
  if ((r.stdout || "").includes("RESULT: PASS")) ok("all app assets resolve offline");
  else bad("verify.js", (r.stdout || r.stderr || "").trim().split("\n").pop());
} else bad("verify.js", "missing");

console.log("\n" + (fails === 0 ? "RESULT: PASS — non-browser QA clean. Now run BROWSER-TEST.md." : "RESULT: FAIL — " + fails + " issue(s)."));
process.exit(fails === 0 ? 0 : 1);
