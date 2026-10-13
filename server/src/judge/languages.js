/**
 * 语言注册表：编译/运行命令、Monaco 高亮语言、默认代码模板。
 */
import { detectToolchain } from "../config.js";

export const STARTERS = {
  python: `import sys

def main():
    data = sys.stdin.read().split()
    # TODO: 在此编写你的代码

if __name__ == "__main__":
    main()
`,
  cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
    
    return 0;
}
`,
  c: `#include <stdio.h>

int main(void) {
    // TODO: 在此编写你的代码

    return 0;
}
`,
};

export const LANGUAGES = [
  {
    id: "python",
    name: "Python 3",
    monaco: "python",
    extension: ".py",
    multiplier: 3,
    available: () => !!detectToolchain().python.path,
    compile: null,
    run: (ctx) => ({ cmd: ctx.tools.python.path, args: [ctx.srcPath] }),
  },
  {
    id: "cpp",
    name: "C++17 (GCC)",
    monaco: "cpp",
    extension: ".cpp",
    multiplier: 1,
    available: () => !!detectToolchain().gpp.path,
    compile: (ctx) => ({
      cmd: ctx.tools.gpp.path,
      args: ["-std=gnu++17", "-O2", "-static", "-pipe", "-o", ctx.exePath, ctx.srcPath],
    }),
    run: (ctx) => ({ cmd: ctx.exePath, args: [] }),
  },
  {
    id: "c",
    name: "C17 (GCC)",
    monaco: "c",
    extension: ".c",
    multiplier: 1,
    available: () => !!detectToolchain().gcc.path,
    compile: (ctx) => ({
      cmd: ctx.tools.gcc.path,
      args: ["-std=gnu17", "-O2", "-static", "-pipe", "-o", ctx.exePath, ctx.srcPath],
    }),
    run: (ctx) => ({ cmd: ctx.exePath, args: [] }),
  },
];

export function getLanguage(id) {
  return LANGUAGES.find((l) => l.id === id) || null;
}

export function languageStatus() {
  return LANGUAGES.map((l) => ({
    id: l.id,
    name: l.name,
    monaco: l.monaco,
    available: l.available(),
    starter: STARTERS[l.id] || "",
  }));
}

export function exeName() {
  return process.platform === "win32" ? "program.exe" : "program";
}

export function srcName(lang) {
  return "main" + lang.extension;
}
