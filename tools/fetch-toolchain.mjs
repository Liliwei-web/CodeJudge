#!/usr/bin/env node
/**
 * fetch-toolchain.mjs
 * 按依赖闭包从镜像站下载并安装便携版 MinGW-w64（免安装、不改系统环境变量）。
 * 产物目录由 toolchain-path.mjs 决定（纯 ASCII 路径，避免 ld 无法处理中文路径）。
 *
 *   node tools/fetch-toolchain.mjs
 *   node tools/fetch-toolchain.mjs --force
 * 环境变量：
 *   MSYS2_MIRROR        自定义镜像（默认清华 TUNA）
 *   CODEJUDGE_TOOLCHAIN 自定义安装目录
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { TOOLS_DIR, installDir } from "./toolchain-path.mjs";

const MINGW_DIR = installDir();
const EXTRACT_DIR = path.dirname(MINGW_DIR);
const PKG_DIR = path.join(TOOLS_DIR, ".pkgs");
const DB_DIR = path.join(TOOLS_DIR, ".db");
const MIRROR = process.env.MSYS2_MIRROR || "https://mirrors.tuna.tsinghua.edu.cn/msys2/mingw/mingw64";

const ROOTS = ["mingw-w64-x86_64-gcc", "mingw-w64-x86_64-binutils"];
const FORCE = process.argv.includes("--force");
const GPP = path.join(MINGW_DIR, "bin", process.platform === "win32" ? "g++.exe" : "g++");

const log = (...a) => console.log("[toolchain]", ...a);

function parseDesc(text) {
  const out = {};
  let key = null;
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^%(.+)%$/);
    if (m) { key = m[1]; out[key] = []; continue; }
    if (key && line.trim() !== "") out[key].push(line.trim());
  }
  return out;
}

const stripVer = (s) => s.split("=")[0].split(">")[0].split("<")[0].trim();

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载失败 ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function buildDatabase() {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const dbFile = path.join(DB_DIR, "mingw64.db");
  if (!fs.existsSync(dbFile)) {
    log("下载包数据库 mingw64.db ...");
    await download(`${MIRROR}/mingw64.db`, dbFile);
  }
  const extractDir = path.join(DB_DIR, "extracted");
  if (!fs.existsSync(extractDir) || fs.readdirSync(extractDir).length === 0) {
    fs.mkdirSync(extractDir, { recursive: true });
    execFileSync("tar", ["-xzf", dbFile, "-C", extractDir], { stdio: "inherit" });
  }
  const byName = new Map();
  const byProvides = new Map();
  for (const entry of fs.readdirSync(extractDir)) {
    const descPath = path.join(extractDir, entry, "desc");
    if (!fs.existsSync(descPath)) continue;
    const d = parseDesc(fs.readFileSync(descPath, "utf8"));
    const pkg = {
      name: d.NAME?.[0] ?? entry,
      filename: d.FILENAME?.[0] ?? "",
      csize: Number(d.CSIZE?.[0] ?? 0),
      depends: (d.DEPENDS ?? []).map(stripVer),
      provides: (d.PROVIDES ?? []).map(stripVer),
    };
    byName.set(pkg.name, pkg);
    for (const p of pkg.provides) byProvides.set(p, pkg);
  }
  return { byName, byProvides };
}

function resolveClosure(byName, byProvides) {
  const chosen = new Map();
  const missing = new Set();
  const queue = [...ROOTS];
  while (queue.length) {
    const name = queue.shift();
    const pkg = byName.get(name) ?? byProvides.get(name);
    if (!pkg) { missing.add(name); continue; }
    if (chosen.has(pkg.name)) continue;
    chosen.set(pkg.name, pkg);
    for (const dep of pkg.depends) queue.push(dep);
  }
  return { chosen, missing };
}

async function main() {
  log("安装目录：" + MINGW_DIR);
  if (fs.existsSync(GPP) && !FORCE) {
    log("已安装，跳过。重装请加 --force");
    return;
  }

  const { byName, byProvides } = await buildDatabase();
  const { chosen, missing } = resolveClosure(byName, byProvides);
  if (missing.size) log("警告：未解析到依赖 " + [...missing].join(", "));

  const pkgs = [...chosen.values()].filter((p) => p.filename);
  const total = pkgs.reduce((s, p) => s + p.csize, 0);
  log(`需要 ${pkgs.length} 个包，共 ${(total / 1048576).toFixed(1)} MB`);

  fs.mkdirSync(PKG_DIR, { recursive: true });
  fs.mkdirSync(MINGW_DIR, { recursive: true });

  let idx = 0, done = 0, bytes = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (idx < pkgs.length) {
        const p = pkgs[idx++];
        const dest = path.join(PKG_DIR, p.filename);
        if (!fs.existsSync(dest) || fs.statSync(dest).size !== p.csize) {
          for (let attempt = 1; attempt <= 3; attempt++) {
            try { await download(`${MIRROR}/${p.filename}`, dest); break; }
            catch (e) { if (attempt === 3) throw e; await new Promise((r) => setTimeout(r, 800 * attempt)); }
          }
        }
        bytes += fs.statSync(dest).size;
        done++;
        process.stdout.write(`\r[toolchain] ${done}/${pkgs.length}  ${(bytes / 1048576).toFixed(1)} MB   ${p.name.padEnd(42)}`);
      }
    })
  );
  process.stdout.write("\n");

  log("解压 ...");
  for (const p of pkgs) {
    execFileSync(
      "tar",
      ["-xf", path.join(PKG_DIR, p.filename), "-C", EXTRACT_DIR,
       "--exclude", ".PKGINFO", "--exclude", ".MTREE",
       "--exclude", ".BUILDINFO", "--exclude", ".INSTALL"],
      { stdio: "inherit" }
    );
  }

  if (!fs.existsSync(GPP)) throw new Error("安装失败：未找到 g++.exe");
  log("完成：" + execFileSync(GPP, ["--version"], { encoding: "utf8" }).split("\n")[0]);
}

main().catch((e) => { console.error("[toolchain] 失败：", e.message); process.exit(1); });
