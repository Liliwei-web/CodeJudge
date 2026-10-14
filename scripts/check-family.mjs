#!/usr/bin/env node
/**
 * 单题族快速校验：只构建某个题族文件里的题目并校验（不写入 data/problems）。
 *   node scripts/check-family.mjs intro
 *   node scripts/check-family.mjs medium --compiled-step=10
 *   node scripts/check-family.mjs easy --from=100 --to=140
 */
import { Rng, resetSeq } from "./lib/core.mjs";
import { validatePython, validateCompiled } from "./lib/validate.mjs";

const name = process.argv[2];
const args = process.argv.slice(3);
const val = (k, d) => { const h = args.find((a) => a.startsWith(`--${k}=`)); return h ? h.split("=")[1] : d; };
const step = Number(val("compiled-step", "0"));
const from = Number(val("from", "0"));
const to = Number(val("to", "100000"));

const mod = await import(`./families/${name}.mjs`);
const families = mod[`${name}Families`];
if (!families) { console.error(`families/${name}.mjs 未导出 ${name}Families`); process.exit(1); }

function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

resetSeq();
const problems = [];
for (const family of families) {
  const seedKey = `${family.key}#${family.variant}`;
  const rng = new Rng(hash(seedKey));
  let solved;
  try { solved = family.solve(rng); } catch (err) { throw new Error(`题目族 ${seedKey} 生成失败：${err.message}`); }
  problems.push({
    id: `${family.key}-${family.variant}`,
    title: family.title,
    difficulty: family.difficulty,
    inputFormat: family.inputFormat({}),
    outputFormat: family.outputFormat({}),
    description: family.statement({}),
    samples: solved.samples,
    tests: solved.tests.map((t, i) => ({ input: t.input, output: t.output, name: `测试点 ${i + 1}` })),
    solutions: family.solutions({}),
  });
}
console.log(`族 ${name}：共 ${problems.length} 题`);
const dup = new Map();
for (const p of problems) dup.set(p.title, (dup.get(p.title) || 0) + 1);
const rep = [...dup.entries()].filter(([, c]) => c > 1);
console.log(`不同标题 ${dup.size} 个；重复标题：${rep.length ? rep.map(([t, c]) => `${t}x${c}`).join(", ") : "无"}`);

const picked = problems.filter((p, i) => i >= from && i < to);
const fails = await validatePython(picked);
if (fails.length) {
  console.error(`Python 失败 ${fails.length} 道：`);
  for (const f of fails.slice(0, 20)) console.error(`  ${f.id} ${f.title} — ${f.reason}\n    ${f.detail}`);
  process.exit(1);
}
console.log(`Python 参考解通过（${picked.length} 题）。`);
if (step > 0) {
  const cf = await validateCompiled(picked, { step, concurrency: 4, progress: (l, d, t) => process.stdout.write(`\r  ${l} ${d}/${t}   `) });
  console.log("");
  if (cf.length) { console.error(`C/C++ 失败 ${cf.length} 项：`); for (const f of cf.slice(0, 20)) console.error(`  ${f.id} ${f.title} [${f.lang}] — ${f.reason}\n    ${f.detail.replace(/\n/g, " ")}`); process.exit(1); }
  console.log("C/C++ 抽样通过。");
}
