#!/usr/bin/env node
/** 题库审计：统计题目数量、难度分布、标题/题面/参考解重复情况。 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "problems");
const files = fs.readdirSync(DIR).filter((f) => /^p\d+\.json$/.test(f)).sort();
const rows = files.map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));

const group = (key) => {
  const m = new Map();
  for (const r of rows) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r.id); }
  return [...m.entries()].filter(([, v]) => v.length > 1);
};

const byDiff = {};
for (const r of rows) byDiff[r.difficulty] = (byDiff[r.difficulty] || 0) + 1;

console.log(`题目总数：${rows.length}`);
console.log("难度分布：" + Object.entries(byDiff).map(([k, v]) => `${k} ${v}`).join(" · "));
const topicN = new Map();
for (const r of rows) { if (!topicN.has(r.topic)) topicN.set(r.topic, new Set()); topicN.get(r.topic).add(r.title.replace(/\s*(II|III|IV|V|VI|VII|VIII|IX|X)$/, "")); }
console.log(`主题数：${topicN.size} —— ` + [...topicN.entries()].map(([t, s]) => `${t}(${s.size} 题型)`).join(" · "));

const strip = (t) => t.replace(/\s*(II|III|IV|V|VI|VII|VIII|IX|X)$/, "").replace(/（[^）]*）$/, "");
const titleDup = group((r) => r.title);
const baseDup = group((r) => strip(r.title));
const stmtDup = group((r) => r.description);
const solDup = group((r) => r.solutions.python);
console.log(`重复标题：${titleDup.length} 组 -> ${titleDup.slice(0, 8).map(([t, v]) => `${t}×${v.length}`).join(", ")}`);
console.log(`去后缀后重复标题：${baseDup.length} 组 -> ${baseDup.slice(0, 8).map(([t, v]) => `${t}×${v.length}`).join(", ")}`);
console.log(`完全相同题面：${stmtDup.length} 组`);
console.log(`完全相同 Python 参考解：${solDup.length} 组 -> ${solDup.slice(0, 5).map(([, v]) => v.join("/")).join(" | ")}`);
