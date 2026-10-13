/**
 * 工具链路径解析。
 *
 * 重要：MinGW 的 ld/binutils 无法处理包含非 ASCII 字符（如中文）的安装路径，
 * 因此当项目目录不是纯 ASCII 时，工具链会自动改安装到用户目录下的 .codejudge。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(TOOLS_DIR, "..");

export const isAscii = (s) => /^[\x20-\x7e]*$/.test(s);

function exeName() {
  return process.platform === "win32" ? "g++.exe" : "g++";
}

export function candidateDirs() {
  const list = [];
  if (process.env.CODEJUDGE_TOOLCHAIN) list.push(path.resolve(process.env.CODEJUDGE_TOOLCHAIN));
  if (isAscii(ROOT_DIR)) list.push(path.join(ROOT_DIR, "tools", "mingw64"));
  if (process.env.USERPROFILE && isAscii(process.env.USERPROFILE)) list.push(path.join(process.env.USERPROFILE, ".codejudge", "mingw64"));
  if (process.env.LOCALAPPDATA && isAscii(process.env.LOCALAPPDATA)) list.push(path.join(process.env.LOCALAPPDATA, "codejudge", "mingw64"));
  list.push(path.join(os.homedir(), ".codejudge", "mingw64"));
  return [...new Set(list)];
}

export function installedDir() {
  return candidateDirs().find((d) => fs.existsSync(path.join(d, "bin", exeName()))) || null;
}

export function installDir() {
  return installedDir() || candidateDirs().find(isAscii) || candidateDirs()[0];
}
