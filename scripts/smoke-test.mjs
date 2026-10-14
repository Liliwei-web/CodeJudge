/**
 * 端到端冒烟测试：直接调用 REST API 验证判题流程。
 * 用法：先启动服务，再运行 node scripts/smoke-test.mjs
 *
 * 为避免题库重排导致题目编号变化，这里从 data/problems/index.json 里按标题挑题，
 * 并用该题自己的三语言参考解作为「正确解」，因此题库更新后无需改动本脚本。
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE || "http://localhost:8787";
const DIR = path.resolve("data", "problems");

async function get(p) {
  const r = await fetch(BASE + p);
  return { status: r.status, body: await r.json() };
}
async function post(p, body) {
  const r = await fetch(BASE + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
}

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${extra}`); }
}

/* 选一道入门题（优先「数组中偶数的个数」），用它的参考解做端到端判题 */
const index = JSON.parse(fs.readFileSync(path.join(DIR, "index.json"), "utf8"));
const picked = index.find((p) => p.title === "数组中偶数的个数") || index[0];
const PID = picked.id;
const problem = JSON.parse(fs.readFileSync(path.join(DIR, `${PID}.json`), "utf8"));
console.log(`冒烟目标：${PID} ${picked.title}（${picked.difficulty}）`);

const okHealth = await get("/api/health");
console.log("健康检查:", okHealth.status, "题目数:", okHealth.body.dataset?.total);
check("三种语言可用", ["python", "cpp", "c"].every((id) => okHealth.body.languages.find((l) => l.id === id)?.available));

const list = await get("/api/problems");
check("题目列表非空", list.body.problems.length > 0, `(${list.body.problems.length})`);

const detail = await get(`/api/problems/${PID}`);
check("题目详情不泄漏隐藏测试点", detail.body.problem.tests === undefined && detail.body.problem.solutions === undefined);
check("题目详情带样例", (detail.body.problem.samples || []).length >= 2);

const correctPy = problem.solutions.python;
const correctCpp = problem.solutions.cpp;
const correctC = problem.solutions.c;
const sampleInput = problem.samples[0].input;
const sampleExpected = problem.samples[0].output.trim();
const wrongPy = "print(-1234567)\n";

const r1 = await post("/api/submit", { problemId: PID, language: "python", source: correctPy });
check("python 正确解 -> AC", r1.body.result?.verdict === "AC", `${r1.body.result?.verdict} ${r1.body.result?.passed}/${r1.body.result?.total}`);

const r2 = await post("/api/submit", { problemId: PID, language: "python", source: wrongPy });
check("python 错误解 -> WA", r2.body.result?.verdict === "WA", r2.body.result?.verdict);
check("错误解 score < 100", r2.body.result?.score < 100, String(r2.body.result?.score));

const r3 = await post("/api/submit", { problemId: PID, language: "cpp", source: correctCpp });
check("C++ 正确解 -> AC", r3.body.result?.verdict === "AC", r3.body.result?.verdict);

const r4 = await post("/api/submit", { problemId: PID, language: "c", source: correctC });
check("C 正确解 -> AC", r4.body.result?.verdict === "AC", r4.body.result?.verdict);

const r5 = await post("/api/submit", { problemId: PID, language: "cpp", source: "#include <bits/stdc++.h>\nint main(){ this is not c++ }\n" });
check("编译错误 -> CE", r5.body.result?.verdict === "CE", r5.body.result?.verdict);

const r6 = await post("/api/submit", { problemId: PID, language: "python", source: "while True:\n    pass\n" });
check("死循环 -> TLE", r6.body.result?.verdict === "TLE", r6.body.result?.verdict);

const r7 = await post("/api/run", { problemId: PID, language: "python", source: correctPy, input: sampleInput });
check("自定义输入自测（命中样例）", r7.body.result?.cases?.[0]?.actual?.trim() === sampleExpected, JSON.stringify(r7.body.result?.cases?.[0]?.actual));

const r8 = await post("/api/submit", { problemId: PID, language: "python", source: "import sys;print(int(sys.stdin.read().split()[0]))\n" });
check("部分通过有得分", r8.body.result.score >= 0 && r8.body.result.score <= 100);

const r9 = await post("/api/run", { problemId: PID, language: "python", source: wrongPy, input: sampleInput });
check("自定义输入命中样例 -> 判出 WA", r9.body.result?.verdict === "WA", r9.body.result?.verdict);
check("命中样例 -> 回传期望输出", r9.body.result?.cases?.[0]?.expected === problem.samples[0].output && r9.body.result?.cases?.[0]?.compared === true, JSON.stringify(r9.body.result?.cases?.[0]?.expected));

const r10 = await post("/api/run", { problemId: PID, language: "python", source: wrongPy, input: "1\n42\n" });
check("自定义输入未命中样例 -> 不比对", r10.body.result?.cases?.[0]?.compared === false && r10.body.result?.cases?.[0]?.expected === null);

const subCases = r2.body.result.cases;
check("提交：样例测试点回传输入/期望输出", subCases[0].input !== null && subCases[0].expected !== null && subCases[1].input !== null);
check("提交：隐藏测试点不外泄数据", subCases[2].input === null && subCases[2].expected === null && subCases[2].compared === true);

console.log(`\n结果: ${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
