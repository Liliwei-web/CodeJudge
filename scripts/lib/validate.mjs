/**
 * 校验器：
 *  1) 每道题的 Python 参考解必须在所有测试点上与生成时的答案一致；
 *  2) 抽样用真实评测流程（judge）验证 C++ / C 参考解。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { runProcess } from "../../server/src/judge/runner.js";
import { judge } from "../../server/src/judge/index.js";
import { getLanguage } from "../../server/src/judge/languages.js";
import { childEnv, detectToolchain, TMP_ROOT } from "../../server/src/config.js";

const HARNESS = `import io, json, runpy, sys, traceback

def norm(s):
    s = s.replace("\\r\\n", "\\n")
    out = [l.rstrip() for l in s.split("\\n")]
    return "\\n".join(out).rstrip("\\n")

with open(sys.argv[1], encoding="utf-8") as f:
    tests = json.load(f)

fails = []
for i, t in enumerate(tests):
    old_in, old_out, old_err = sys.stdin, sys.stdout, sys.stderr
    sys.stdin = io.StringIO(t["input"])
    out = io.StringIO()
    err = io.StringIO()
    sys.stdout, sys.stderr = out, err
    crashed = ""
    try:
        runpy.run_path("main.py", run_name="__main__")
    except SystemExit:
        pass
    except BaseException:
        crashed = traceback.format_exc(limit=1).strip().split("\\n")[-1]
    finally:
        sys.stdin, sys.stdout, sys.stderr = old_in, old_out, old_err
    got = out.getvalue()
    if norm(got) != norm(t["output"]):
        fails.append({"i": i, "got": got[:160], "want": t["output"][:160], "err": crashed})

print(json.dumps({"total": len(tests), "bad": len(fails), "fails": fails[:2]}, ensure_ascii=False))
`;

export async function validatePython(problems, { concurrency = 8 } = {}) {
  const tools = detectToolchain();
  if (!tools.python.path) throw new Error("未找到 python，无法校验");
  const root = path.join(TMP_ROOT, "validate");
  fs.mkdirSync(root, { recursive: true });
  const env = childEnv();

  const failures = [];
  let idx = 0;
  let done = 0;

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (idx < problems.length) {
        const problem = problems[idx++];
        const dir = path.join(root, crypto.randomUUID());
        fs.mkdirSync(dir, { recursive: true });
        try {
          fs.writeFileSync(path.join(dir, "main.py"), problem.solutions.python, "utf8");
          fs.writeFileSync(path.join(dir, "harness.py"), HARNESS, "utf8");
          fs.writeFileSync(path.join(dir, "tests.json"), JSON.stringify(problem.tests), "utf8");
          const r = await runProcess({
            cmd: tools.python.path,
            args: ["harness.py", "tests.json"],
            cwd: dir,
            env,
            timeoutMs: 120000,
          });
          let parsed = null;
          try {
            parsed = JSON.parse(r.stdout.trim().split("\n").pop());
          } catch {
            failures.push({ id: problem.id, title: problem.title, reason: "harness 输出异常", detail: (r.stderr || r.stdout).slice(0, 300) });
          }
          if (parsed && parsed.bad > 0) {
            failures.push({
              id: problem.id,
              title: problem.title,
              reason: `${parsed.bad}/${parsed.total} 个测试点与生成答案不一致`,
              detail: JSON.stringify(parsed.fails, null, 1).slice(0, 400),
            });
          }
        } finally {
          fs.rmSync(dir, { recursive: true, force: true });
        }
        done++;
        if (done % 50 === 0) process.stdout.write(`\r  校验 Python 参考解 ${done}/${problems.length}   `);
      }
    })
  );
  process.stdout.write(`\r  校验 Python 参考解 ${done}/${problems.length} 完成\n`);
  return failures;
}

export async function validateCompiled(problems, { step = 1, concurrency = 3, progress } = {}) {
  const tools = detectToolchain();
  const langs = ["cpp", "c"].map(getLanguage).filter((l) => l && l.available());
  const failures = [];
  const targets = problems.filter((_, i) => i % step === 0);
  for (const lang of langs) {
    let done = 0;
    const runOne = async (problem) => {
      const result = await judge({ problem, lang, tools, source: problem.solutions[lang.id], mode: "submit" });
      if (result.verdict !== "AC") {
        failures.push({
          id: problem.id,
          title: problem.title,
          lang: lang.id,
          reason: result.verdict === "CE" ? "编译错误" : `${result.passed}/${result.total} 测试点通过`,
          detail: (result.compile.output || JSON.stringify(result.cases.find((c) => c.verdict !== "AC")) || "").slice(0, 300),
        });
      }
      done++;
      if (progress) progress(lang.id, done, targets.length);
    };
    let idx = 0;
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        while (idx < targets.length) await runOne(targets[idx++]);
      })
    );
  }
  return failures;
}

