/**
 * 进程执行器：带超时、输出上限、进程树清理。
 */
import { spawn } from "node:child_process";

const MAX_OUTPUT = 256 * 1024;

function killTree(child) {
  if (!child || child.killed) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
    } else {
      try { process.kill(-child.pid, "SIGKILL"); } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  try { child.kill("SIGKILL"); } catch { /* ignore */ }
}

/**
 * @returns {Promise<{stdout:string,stderr:string,code:number|null,timedOut:boolean,signal:string|null,timeMs:number,truncated:boolean}>}
 */
export function runProcess({ cmd, args = [], cwd, env, input = "", timeoutMs = 5000 }) {
  return new Promise((resolve) => {
    const started = Date.now();
    let child;
    try {
      child = spawn(cmd, args, {
        cwd,
        env,
        windowsHide: true,
        detached: process.platform !== "win32",
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (err) {
      resolve({ stdout: "", stderr: String(err.message || err), code: -1, timedOut: false, signal: null, timeMs: 0, truncated: false });
      return;
    }

    let stdout = "";
    let stderr = "";
    let truncated = false;
    let timedOut = false;
    let settled = false;

    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, timeoutMs);

    const append = (buf, kind) => {
      const text = buf.toString("utf8");
      if (kind === "out") {
        if (stdout.length < MAX_OUTPUT) stdout += text.slice(0, MAX_OUTPUT - stdout.length);
        else truncated = true;
      } else {
        if (stderr.length < MAX_OUTPUT) stderr += text.slice(0, MAX_OUTPUT - stderr.length);
      }
    };

    child.stdout.on("data", (b) => append(b, "out"));
    child.stderr.on("data", (b) => append(b, "err"));
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr: stderr + String(err.message || err), code: -1, timedOut, signal: null, timeMs: Date.now() - started, truncated });
    });
    child.on("close", (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, code, timedOut, signal, timeMs: Date.now() - started, truncated });
    });

    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}
