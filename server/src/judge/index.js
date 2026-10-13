/**
 * 评测核心：编译 -> 逐用例运行 -> 输出比对 -> 评分。
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { runProcess } from "./runner.js";
import { exeName, srcName } from "./languages.js";
import { childEnv, TMP_ROOT } from "../config.js";

const COMPILE_TIMEOUT_MS = 30000;

function normalize(text) {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

export function compareOutput(actual, expected, checker = "exact") {
  const a = normalize(actual);
  const e = normalize(expected);
  if (checker === "float") {
    const ta = a.split(/\s+/).filter(Boolean);
    const te = e.split(/\s+/).filter(Boolean);
    if (ta.length !== te.length) return false;
    return ta.every((v, i) => {
      const x = Number(v), y = Number(te[i]);
      if (Number.isNaN(x) || Number.isNaN(y)) return v === te[i];
      return Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y));
    });
  }
  if (checker === "token") {
    return a.split(/\s+/).filter(Boolean).join(" ") === e.split(/\s+/).filter(Boolean).join(" ");
  }
  return a === e;
}

function workDir() {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
  const dir = path.join(TMP_ROOT, crypto.randomUUID());
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
}

/**
 * @param {object} opts
 * @param {object} opts.problem 完整题目（含 tests）
 * @param {object} opts.lang    语言定义
 * @param {object} opts.tools   工具链路径
 * @param {string} opts.source  用户代码
 * @param {'run'|'submit'} opts.mode
 */
export async function judge({ problem, lang, tools, source, mode = "submit", customInput = null }) {
  const dir = workDir();
  const srcPath = path.join(dir, srcName(lang));
  const exePath = path.join(dir, exeName());
  const env = childEnv();
  const timeLimit = Math.round((problem.timeLimitMs || 2000) * (lang.multiplier || 1)) + 2500; // Windows 上进程启动开销大，额外留出余量
  const checker = problem.checker || "exact";

  const result = {
    mode,
    language: lang.id,
    verdict: "AC",
    score: 0,
    passed: 0,
    total: 0,
    maxTimeMs: 0,
    compile: { ok: true, output: "" },
    cases: [],
  };

  try {
    fs.writeFileSync(srcPath, source ?? "", "utf8");

    if (lang.compile) {
      const { cmd, args } = lang.compile({ srcPath, exePath, cwd: dir, tools });
      const cr = await runProcess({ cmd, args, cwd: dir, env, timeoutMs: COMPILE_TIMEOUT_MS });
      if (cr.timedOut || cr.code !== 0) {
        result.verdict = "CE";
        result.compile = {
          ok: false,
          output: (cr.stderr + cr.stdout).trim() || (cr.timedOut ? "编译超时" : `编译器返回 ${cr.code}`),
        };
        return result;
      }
    }

    // 样例是公开数据（题面里就有），以输入为键索引，让「自定义输入」命中样例时也能比对
    const sampleList = problem.samples || [];
    const samplesByInput = new Map(sampleList.map((s) => [normalize(s.input), s]));

    let tests;
    if (customInput !== undefined && customInput !== null) {
      const hit = samplesByInput.get(normalize(customInput));
      tests = [{ input: customInput, output: hit ? hit.output : null, name: hit ? "自定义输入（命中样例）" : "自定义输入" }];
    } else if (mode === "run") {
      tests = sampleList.map((s, i) => ({ input: s.input, output: s.output, name: `样例 ${i + 1}` }));
    } else {
      tests = problem.tests || [];
    }
    result.total = tests.length;

    const { cmd, args } = lang.run({ srcPath, exePath, cwd: dir, tools });
    let firstFailure = null;

    // 预热：刚编译出的程序首次执行在 Windows 上会有额外开销（文件缓存 / 安全软件扫描），
    // 先不计时地跑一次，避免把冷启动耗时算进第一个测试点而造成误判 TLE。
    if (tests.length) {
      const w = tests[0];
      const winput = (w.input ?? "") + (String(w.input ?? "").endsWith("\n") || !w.input ? "" : "\n");
      await runProcess({ cmd, args, cwd: dir, env, input: winput, timeoutMs: timeLimit });
    }

    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      const rr = await runProcess({ cmd, args, cwd: dir, env, input: (t.input ?? "") + (String(t.input ?? "").endsWith("\n") || !t.input ? "" : "\n"), timeoutMs: timeLimit });
      result.maxTimeMs = Math.max(result.maxTimeMs, rr.timeMs);

      const comparable = t.output !== null && t.output !== undefined;
      // 只有「确实比对过、且数据可公开」的用例才回传输入/期望输出（样例本来就印在题面里）
      const reveal = mode === "run" || samplesByInput.has(normalize(t.input ?? ""));

      let verdict = "AC";
      if (rr.timedOut) verdict = "TLE";
      else if (rr.code !== 0 || rr.signal) verdict = "RE";
      else if (rr.truncated) verdict = "OLE";
      else if (!comparable) verdict = "AC";
      else if (!compareOutput(rr.stdout, t.output ?? "", checker)) verdict = "WA";

      if (verdict === "AC") result.passed++;
      else if (!firstFailure) firstFailure = verdict;

      result.cases.push({
        index: i + 1,
        name: t.name || `测试点 ${i + 1}`,
        verdict,
        timeMs: rr.timeMs,
        compared: comparable,
        input: reveal ? t.input ?? "" : null,
        expected: reveal && comparable ? t.output : null,
        actual: rr.stdout,
        stderr: rr.stderr,
      });
    }

    result.score = result.total ? Math.round((result.passed / result.total) * 100) : 100;
    result.verdict = firstFailure || "AC";
    return result;
  } finally {
    cleanup(dir);
  }
}

export { normalize };


