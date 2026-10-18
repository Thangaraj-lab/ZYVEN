// Builds messages/ta.json from messages/en.json + scripts/ta-values.txt (key|translation lines).
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const en = JSON.parse(fs.readFileSync(path.join(root, "messages/en.json"), "utf8"));
const lines = fs.readFileSync(path.join(root, "scripts/ta-values.txt"), "utf8").split("\n").filter((l) => l.trim());
const map = {};
for (const l of lines) { const i = l.indexOf("|"); map[l.slice(0, i)] = l.slice(i + 1); }
const ta = JSON.parse(JSON.stringify(en));
const missing = [];
(function walk(o, p) {
  for (const k of Object.keys(o)) {
    const v = o[k];
    const key = p ? p + "." + k : k;
    if (typeof v === "object" && v !== null) { walk(v, key); continue; }
    if (key === "common.appName" || key === "common.tagline") continue; // brand stays English
    if (map[key] === undefined) { missing.push(key); o[k] = null; } else o[k] = map[key];
  }
})(ta, "");
if (missing.length) { console.error("MISSING:", missing.join(",")); process.exit(1); }
fs.writeFileSync(path.join(root, "messages/ta.json"), JSON.stringify(ta, null, 2) + "\n");
console.log("ta.json written");
