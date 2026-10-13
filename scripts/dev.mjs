#!/usr/bin/env node
/**
 * 开发模式：同时启动判题服务（8787）与 Vite 开发服务器（5173，代理 /api）。
 *   npm run dev
 */
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB = path.join(ROOT, "web");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const children = [];
function run(name, cmd, args, cwd, color) {
  const child = spawn(cmd, args, { cwd, shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] });
  const tag = `\u001b[${color}m[${name}]\u001b[0m `;
  const pipe = (stream) =>
    stream.on("data", (buf) => {
      String(buf)
        .split(/\r?\n/)
        .filter((l) => l.length)
        .forEach((l) => console.log(tag + l));
    });
  pipe(child.stdout);
  pipe(child.stderr);
  child.on("exit", (code) => console.log(`${tag}已退出（code=${code}）`));
  children.push(child);
  return child;
}

if (!fs.existsSync(path.join(WEB, "node_modules")) && !fs.existsSync(path.join(ROOT, "node_modules"))) {
  console.error("未找到 node_modules，请先运行 npm install");
  process.exit(1);
}

console.log("CodeJudge 开发模式：服务 http://localhost:8787 ，前端 http://localhost:5173\n");
run("server", process.execPath, [path.join(ROOT, "server", "src", "index.js")], ROOT, "36");
run("web", npx, ["--no-install", "vite", "--host"], WEB, "35");

const stop = () => {
  for (const c of children) c.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
