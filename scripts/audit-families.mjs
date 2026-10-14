#!/usr/bin/env node
/** 跨题族重复审计（不写盘）：报告重复标题与完全相同的参考解。 */
import fs from "node:fs";
import { Rng, resetSeq } from "./lib/core.mjs";

const names = fs.readdirSync(new URL("./families/", import.meta.url)).filter((f) => f.endsWith(".mjs") && !f.startsWith("_")).map((f) => f.slice(0, -4)).sort();
const all = [];
for (const name of names) {
  let mod;
  try { mod = await import(`./families/${name}.mjs`); } catch { continue; }
  const families = mod[`${name}Families`];
  if (!families) continue;
  for (const f of families) {
    const rng = new Rng(12345);
    let solved;
    try { solved = f.solve(rng); } catch (e) { solved = null; }
    all.push({ file: name, key: f.key, variant: f.variant, title: f.title, diff: f.difficulty, py: solved ? f.solutions({}).python : "" });
  }
}
console.log("总题数:", all.length);
const byTitle = new Map();
for (const p of all) { const k = p.title; if (!byTitle.has(k)) byTitle.set(k, []); byTitle.get(k).push(p); }
const dupT = [...byTitle.entries()].filter(([, v]) => v.length > 1);
console.log(`\n重复标题 ${dupT.length} 组:`);
for (const [t, v] of dupT) console.log(`  ${t} -> ${v.map((x) => `${x.file}:${x.key}`).join(" , ")}`);
const byPy = new Map();
for (const p of all) { if (!p.py) continue; if (!byPy.has(p.py)) byPy.set(p.py, []); byPy.get(p.py).push(p); }
const dupP = [...byPy.entries()].filter(([, v]) => v.length > 1);
console.log(`\n完全相同 Python 参考解 ${dupP.length} 组:`);
for (const [, v] of dupP.slice(0, 40)) console.log(`  ${v.map((x) => `${x.file}:${x.key}(${x.title})`).join(" , ")}`);
