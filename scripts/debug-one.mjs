import fs from "node:fs";
import { detectToolchain } from "../server/src/config.js";
import { getLanguage } from "../server/src/judge/languages.js";
import { judge } from "../server/src/judge/index.js";

const id = process.argv[2];
const langId = process.argv[3] ?? "cpp";
const problem = JSON.parse(fs.readFileSync(`data/problems/${id}.json`, "utf8"));
const lang = getLanguage(langId);
const tools = detectToolchain();
const r = await judge({ problem: { ...problem, samples: problem.tests }, lang, tools, source: problem.solutions[langId], mode: "run" });
console.log(`${id} ${langId}: ${r.verdict} ${r.passed}/${r.total}`);
if (!r.compile.ok) console.log("编译错误:\n" + r.compile.output);
for (const c of r.cases.filter((x) => x.verdict !== "AC").slice(0, 2)) {
  console.log("--- 失败用例", c.index, c.verdict, "---");
  console.log("输入:\n" + c.input);
  console.log("期望:\n" + c.expected);
  console.log("实际:\n" + c.actual);
  if (c.stderr) console.log("stderr:\n" + c.stderr);
}
