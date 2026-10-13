/**
 * 端到端冒烟测试：直接调用 REST API 验证判题流程。
 * 使用：先启动服务，再运行 node scripts/smoke-test.mjs
 */
const BASE = process.env.BASE || "http://localhost:8787";

async function get(path) {
  const r = await fetch(BASE + path);
  return { status: r.status, body: await r.json() };
}
async function post(path, body) {
  const r = await fetch(BASE + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
}

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${extra}`); }
}

const ok = await get("/api/health");
console.log("健康检查:", ok.status, "题目数:", ok.body.dataset?.total);
check("三种语言可用", ["python", "cpp", "c"].every((id) => ok.body.languages.find((l) => l.id === id)?.available));

const list = await get("/api/problems");
check("题目列表非空", list.body.problems.length > 0, `(${list.body.problems.length})`);

const detail = await get("/api/problems/p0001");
check("题目详情不泄漏隐藏测试点", detail.body.problem.tests === undefined && detail.body.problem.solutions === undefined);
check("题目详情带样例", (detail.body.problem.samples || []).length > 0);

const correctPy = "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\nprint(sum(int(x) for x in d[1:1+n]))\n";
const r1 = await post("/api/submit", { problemId: "p0001", language: "python", source: correctPy });
check("python 正确解 -> AC", r1.body.result?.verdict === "AC", JSON.stringify(r1.body.result?.verdict) + " " + r1.body.result?.passed + "/" + r1.body.result?.total);

const wrongPy = "print(0)\n";
const r2 = await post("/api/submit", { problemId: "p0001", language: "python", source: wrongPy });
check("python 错误解 -> WA", r2.body.result?.verdict === "WA", r2.body.result?.verdict);
check("错误解 score < 100", r2.body.result?.score < 100, String(r2.body.result?.score));

const cpp = '#include <bits/stdc++.h>\nusing namespace std;\nint main(){ int n; cin>>n; long long s=0,x; for(int i=0;i<n;i++){cin>>x;s+=x;} cout<<s<<"\\n"; }\n';
const r3 = await post("/api/submit", { problemId: "p0001", language: "cpp", source: cpp });
check("C++ 正确解 -> AC", r3.body.result?.verdict === "AC", r3.body.result?.verdict);

const c = '#include <stdio.h>\nint main(void){ int n; long long s=0,x; scanf("%d",&n); for(int i=0;i<n;i++){scanf("%lld",&x);s+=x;} printf("%lld\\n",s); return 0; }\n';
const r4 = await post("/api/submit", { problemId: "p0001", language: "c", source: c });
check("C 正确解 -> AC", r4.body.result?.verdict === "AC", r4.body.result?.verdict);

const r5 = await post("/api/submit", { problemId: "p0001", language: "cpp", source: "#include <bits/stdc++.h>\nint main(){ this is not c++ }\n" });
check("编译错误 -> CE", r5.body.result?.verdict === "CE", r5.body.result?.verdict);

const r6 = await post("/api/submit", { problemId: "p0001", language: "python", source: "while True:\n    pass\n" });
check("死循环 -> TLE", r6.body.result?.verdict === "TLE", r6.body.result?.verdict);

const r7 = await post("/api/run", { problemId: "p0001", language: "python", source: correctPy, input: "3\n100 200 300\n" });
check("自定义输入自测", r7.body.result?.cases?.[0]?.actual?.trim() === "600", JSON.stringify(r7.body.result?.cases?.[0]?.actual));

const r8 = await post("/api/submit", { problemId: "p0001", language: "python", source: "import sys;print(int(sys.stdin.read().split()[0]))\n" });
check("部分通过有得分", r8.body.result.score >= 0 && r8.body.result.score <= 100);

// 自定义输入命中样例时应该照常比对，而不是一律判过
const hitInput = detail.body.problem.samples[0].input;
const hitExpected = detail.body.problem.samples[0].output;
const r9 = await post("/api/run", { problemId: "p0001", language: "python", source: wrongPy, input: hitInput });
check("自定义输入命中样例 -> 判出 WA", r9.body.result?.verdict === "WA", r9.body.result?.verdict);
check("命中样例 -> 回传期望输出", r9.body.result?.cases?.[0]?.expected === hitExpected && r9.body.result?.cases?.[0]?.compared === true, JSON.stringify(r9.body.result?.cases?.[0]?.expected));

const r10 = await post("/api/run", { problemId: "p0001", language: "python", source: wrongPy, input: "1\n42\n" });
check("自定义输入未命中样例 -> 不比对", r10.body.result?.cases?.[0]?.compared === false && r10.body.result?.cases?.[0]?.expected === null);

const subCases = r2.body.result.cases;
check("提交：样例测试点回传输入/期望输出", subCases[0].input !== null && subCases[0].expected !== null && subCases[1].input !== null);
check("提交：隐藏测试点不外泄数据", subCases[2].input === null && subCases[2].expected === null && subCases[2].compared === true);

console.log(`\n结果: ${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);

