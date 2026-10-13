#!/usr/bin/env node
/**
 * 构建前端到 web/dist（构建后可直接用 npm start 由服务端托管）。
 *   npm run build
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB = path.join(ROOT, "web");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(npx, ["--no-install", "vite", "build"], {
  cwd: WEB,
  shell: process.platform === "win32",
  stdio: "inherit",
});
child.on("exit", (code) => {
  if (code === 0) console.log("\n构建完成：web/dist（运行 npm start 后访问 http://localhost:8787）");
  process.exit(code ?? 1);
});
