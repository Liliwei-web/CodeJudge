#!/usr/bin/env node
/**
 * 生成题库：把题族展开为具体题目，写入 data/problems/。
 *   node scripts/generate-problems.mjs              # 生成
 *   node scripts/generate-problems.mjs --no-validate
 *   node scripts/generate-problems.mjs --compiled-step=8   # 抽样校验 C/C++
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Rng, resetSeq, DIFFICULTIES } from "./lib/core.mjs";
import { introFamilies } from "./families/intro.mjs";
import { easyFamilies } from "./families/easy.mjs";
import { mediumFamilies } from "./families/medium.mjs";
import { hardFamilies } from "./families/hard.mjs";
import { validatePython, validateCompiled } from "./lib/validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "data", "problems");

const args = process.argv.slice(2);
const hasFlag = (name) => args.some((a) => a === `--${name}` || a.startsWith(`--${name}=`));
const flagValue = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : dflt;
};

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const GROUPS = [
  { difficulty: "入门", families: introFamilies },
  { difficulty: "简单", families: easyFamilies },
  { difficulty: "中等", families: mediumFamilies },
  { difficulty: "困难", families: hardFamilies },
];

function main() {
  resetSeq();
  const problems = [];

  for (const group of GROUPS) {
    for (const family of group.families) {
      const seedKey = `${family.key}#${family.variant}`;
      const rng = new Rng(hash(seedKey));
      let solved;
      try {
        solved = family.solve(rng);
      } catch (err) {
        throw new Error(`题目族 ${seedKey} 生成失败：${err.message}`);
      }
      const problem = {
        key: family.key,
        variant: family.variant,
        title: family.title,
        difficulty: group.difficulty,
        topic: family.topic,
        tags: family.tags,
        source: "template",
        timeLimitMs: family.timeLimitMs ?? 2000,
        checker: family.checker ?? "exact",
        description: family.statement({}),
        inputFormat: family.inputFormat({}),
        outputFormat: family.outputFormat({}),
        hint: family.hint ?? "",
        samples: solved.samples,
        tests: solved.tests.map((t, i) => ({ input: t.input, output: t.output, name: `测试点 ${i + 1}` })),
        solutions: family.solutions({}),
      };
      problems.push(problem);
    }
  }

  // 按难度分档；同一难度内按「变体档位」交错，避免同一题型的多个变体挤在一起
  const ordered = [];
  for (const d of DIFFICULTIES) {
    const list = problems.filter((p) => p.difficulty === d);
    list.sort((a, b) => (a.variant ?? 1) - (b.variant ?? 1));
    ordered.push(...list);
  }
  const POINTS = { 入门: 10, 简单: 20, 中等: 40, 困难: 80 };

  const slugs = new Set();
  const index = [];
  for (let i = 0; i < ordered.length; i++) {
    const p = ordered[i];
    const id = `p${String(i + 1).padStart(4, "0")}`;
    let slug = `${p.key}-${p.variant}`;
    if (slugs.has(slug)) slug = `${slug}-${i}`;
    slugs.add(slug);
    const record = {
      id,
      slug,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topic,
      tags: p.tags,
      source: p.source,
      points: POINTS[p.difficulty] ?? 10,
      timeLimitMs: p.timeLimitMs,
      hiddenTestCount: p.tests.length,
      sampleCount: p.samples.length,
    };
    index.push(record);
    fs.writeFileSync(
      path.join(OUT_DIR, `${id}.json`),
      JSON.stringify({ ...record, description: p.description, inputFormat: p.inputFormat, outputFormat: p.outputFormat, hint: p.hint, samples: p.samples, tests: p.tests, solutions: p.solutions }, null, 1),
      "utf8"
    );
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(index), "utf8");

  const byDiff = {};
  for (const r of index) byDiff[r.difficulty] = (byDiff[r.difficulty] || 0) + 1;
  console.log(`已生成 ${index.length} 道题 -> data/problems/`);
  console.log("  难度分布：" + Object.entries(byDiff).map(([k, v]) => `${k} ${v}`).join(" · "));
  return ordered.map((p, i) => ({ ...p, id: `p${String(i + 1).padStart(4, "0")}` }));
}

const generated = main();

if (!hasFlag("no-validate")) {
  console.log("开始校验（Python 参考解 × 全部测试点）...");
  const failures = await validatePython(generated);
  if (failures.length) {
    console.error(`\n校验失败 ${failures.length} 道：`);
    for (const f of failures.slice(0, 15)) console.error(`  ${f.id} ${f.title} — ${f.reason}\n    ${f.detail}`);
    process.exit(1);
  }
  console.log("Python 参考解校验通过。");
}

const step = Number(flagValue("compiled-step", "0"));
if (step > 0) {
  console.log(`抽样校验 C/C++ 参考解（每 ${step} 道取 1 道）...`);
  const failures = await validateCompiled(generated, {
    step,
    progress: (lang, done, total) => process.stdout.write(`\r  ${lang} ${done}/${total}   `),
  });
  console.log("");
  if (failures.length) {
    console.error(`C/C++ 校验失败 ${failures.length} 道：`);
    for (const f of failures.slice(0, 15)) console.error(`  ${f.id} ${f.title} [${f.lang}] — ${f.reason}\n    ${f.detail}`);
    process.exit(1);
  }
  console.log("C/C++ 参考解抽样校验通过。");
}
