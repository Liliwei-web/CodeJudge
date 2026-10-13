#!/usr/bin/env node
/**
 * 校验已生成的题库（data/problems/）。
 *   node scripts/validate-dataset.mjs --compiled-step=3
 *   node scripts/validate-dataset.mjs --python
 *   node scripts/validate-dataset.mjs --ids=p0001,p0085 --langs=c
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePython, validateCompiled } from "./lib/validate.mjs";
import { judge } from "../server/src/judge/index.js";
import { getLanguage } from "../server/src/judge/languages.js";
import { detectToolchain } from "../server/src/config.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "problems");

const args = process.argv.slice(2);
const val = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : dflt;
};
const has = (name) => args.includes(`--${name}`);

const ids = val("ids", "").split(",").map((s) => s.trim()).filter(Boolean);
let problems = fs
  .readdirSync(DIR)
  .filter((f) => /^p\d+\.json$/.test(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")))
  .sort((a, b) => a.id.localeCompare(b.id));
if (ids.length) problems = problems.filter((p) => ids.includes(p.id));
console.log(`载入 ${problems.length} 道题`);

const langs = val("langs", "").split(",").filter(Boolean);
let failed = 0;

if (has("python") || (!has("compiled") && !langs.length && !ids.length)) {
  const f = await validatePython(problems);
  if (f.length) {
    failed += f.length;
    console.error(`Python 校验失败 ${f.length} 道：`);
    for (const x of f) console.error(`  ${x.id} ${x.title} — ${x.reason}\n    ${x.detail}`);
  } else console.log("Python 参考解全部通过。");
}

if (has("compiled") || ids.length || langs.length) {
  const step = Number(val("compiled-step", "1"));
  const tools = detectToolchain();
  const targets = problems.filter((_, i) => i % step === 0);
  const langIds = langs.length ? langs : ["cpp", "c"];
  const all = [];
  for (const id of langIds) {
    const lang = getLanguage(id);
    if (!lang || !lang.available()) { console.log(`跳过 ${id}（不可用）`); continue; }
    let done = 0;
    const runOne = async (problem) => {
      const r = await judge({ problem, lang, tools, source: problem.solutions[id], mode: "submit" });
      if (r.verdict !== "AC") {
        all.push({ id: problem.id, title: problem.title, lang: id, reason: r.verdict === "CE" ? "编译错误" : `${r.passed}/${r.total} 通过`, detail: (r.compile.output || JSON.stringify(r.cases.find((c) => c.verdict !== "AC")) || "").slice(0, 220) });
      }
      done++;
      if (done % 25 === 0) process.stdout.write(`\r  ${id} ${done}/${targets.length}   `);
    };
    let idx = 0;
    const conc = Number(val("concurrency", "4"));
    await Promise.all(Array.from({ length: conc }, async () => { while (idx < targets.length) await runOne(targets[idx++]); }));
    process.stdout.write(`\r  ${id} ${done}/${targets.length} 完成\n`);
  }
  if (all.length) {
    failed += all.length;
    console.error(`\nC/C++ 校验失败 ${all.length} 项：`);
    for (const x of all) console.error(`  ${x.id} ${x.title} [${x.lang}] — ${x.reason}\n    ${x.detail.replace(/\n/g, " ")}`);
  } else console.log("C/C++ 参考解全部通过。");
}

process.exit(failed ? 1 : 0);
