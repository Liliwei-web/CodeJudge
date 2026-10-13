import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { installedDir, isAscii, ROOT_DIR as PROJECT_ROOT } from "../../tools/toolchain-path.mjs";

const SRC_DIR = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.resolve(SRC_DIR, "..", "..");
export const DATA_DIR = path.join(ROOT_DIR, "data");
export const PROBLEM_DIR = path.join(DATA_DIR, "problems");
export const INDEX_FILE = path.join(PROBLEM_DIR, "index.json");
export const WEB_DIST = path.join(ROOT_DIR, "web", "dist");
export const PORT = Number(process.env.PORT || 8787);

/** 工具链 bin 目录（放在 ASCII 路径下，否则 ld 无法工作） */
export const TOOLCHAIN = installedDir();
export const MINGW_BIN = TOOLCHAIN ? path.join(TOOLCHAIN, "bin") : null;

/** 判题临时目录必须是纯 ASCII 路径 */
function pickTempRoot() {
  const candidates = [
    process.env.CODEJUDGE_TMP,
    path.join(os.tmpdir(), "codejudge-work"),
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "codejudge", "work") : null,
    "C:\\Windows\\Temp\\codejudge-work",
  ].filter(Boolean);
  return candidates.find(isAscii) || candidates[0];
}
export const TMP_ROOT = pickTempRoot();

function findOnPath(name) {
  try {
    const cmd = process.platform === "win32" ? "where" : "which";
    const out = execFileSync(cmd, [name], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const first = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
    return first && fs.existsSync(first) ? first : null;
  } catch {
    return null;
  }
}

function version(cmd, args) {
  try {
    const out = execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10000 });
    return out.split(/\r?\n/)[0].trim();
  } catch {
    return null;
  }
}

function pick(candidates, name) {
  for (const c of candidates) if (c && fs.existsSync(c)) return c;
  return findOnPath(name);
}

let cached = null;

/** 探测本机可用工具链 */
export function detectToolchain(force = false) {
  if (cached && !force) return cached;
  const exe = (n) => (process.platform === "win32" ? `${n}.exe` : n);
  const fromToolchain = (n) => (MINGW_BIN ? path.join(MINGW_BIN, exe(n)) : null);

  const gcc = pick([fromToolchain("gcc")], "gcc");
  const gpp = pick([fromToolchain("g++")], "g++");
  const python = pick([], "python") || pick([], "python3");

  cached = {
    toolchainDir: TOOLCHAIN,
    gcc: { path: gcc, version: gcc ? version(gcc, ["--version"]) : null },
    gpp: { path: gpp, version: gpp ? version(gpp, ["--version"]) : null },
    python: { path: python, version: python ? version(python, ["--version"]) : null },
  };
  return cached;
}

/** 编译/运行时把工具链 bin 加入 PATH，否则 cc1/cc1plus 找不到依赖 DLL */
export function childEnv() {
  const env = { ...process.env };
  const sep = process.platform === "win32" ? ";" : ":";
  if (MINGW_BIN && fs.existsSync(MINGW_BIN)) {
    env.PATH = MINGW_BIN + sep + (env.PATH || "");
  }
  env.TZ = "Asia/Shanghai";
  return env;
}

export { isAscii, PROJECT_ROOT };
