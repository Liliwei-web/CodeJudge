/**
 * 输入形状（shape）：统一三种语言的读取前缀 + 测试数据生成器。
 * 每个 op 只需提供 js（生成答案的参考模型）与 py/cpp/c 三段主体代码。
 */

export const PY = (body) => `import sys\n\ndata = sys.stdin.read().split()\n${body}`;
export const CPP = (body, extra = "") => `#include <bits/stdc++.h>\nusing namespace std;\n${extra}int main(){${body}return 0;}\n`;
export const C = (body, extra = "") => `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n${extra}int main(void){${body}return 0;}\n`;

const j = (a) => a.join(" ");
export const nums = (t) => t.trim().split(/\s+/).filter(Boolean).map(Number);

/** 形状定义 */
export const SHAPES = {
  arr: {
    py: "n = int(data[0])\na = list(map(int, data[1:1 + n]))\n",
    cpp: "int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;",
    c: "int n,i;static long long a[500005];if(scanf(\"%d\",&n)!=1)return 1;for(i=0;i<n;i++)scanf(\"%lld\",&a[i]);",
    parse: (t) => { const v = nums(t); return { n: v[0], a: v.slice(1, 1 + v[0]) }; },
    gen: (r, cfg) => { const n = r.int(cfg.nMin ?? 1, cfg.nMax ?? 20); const a = r.intArray(n, cfg.lo ?? 0, cfg.hi ?? 100); return `${n}\n${j(a)}\n`; },
  },
  arrK: {
    py: "n = int(data[0])\na = list(map(int, data[1:1 + n]))\nk = int(data[1 + n])\n",
    cpp: "int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;long long k;cin>>k;",
    c: "int n,i;static long long a[500005];if(scanf(\"%d\",&n)!=1)return 1;for(i=0;i<n;i++)scanf(\"%lld\",&a[i]);long long k;if(scanf(\"%lld\",&k)!=1)return 1;",
    parse: (t) => { const v = nums(t); return { n: v[0], a: v.slice(1, 1 + v[0]), k: v[1 + v[0]] }; },
    gen: (r, cfg) => { const n = r.int(cfg.nMin ?? 1, cfg.nMax ?? 20); const a = r.intArray(n, cfg.lo ?? 0, cfg.hi ?? 100); const k = r.int(cfg.kMin ?? 1, cfg.kMax ?? 10); return `${n}\n${j(a)}\n${k}\n`; },
  },
  arrKIndex: {
    py: "n = int(data[0])\na = list(map(int, data[1:1 + n]))\nk = int(data[1 + n])\n",
    cpp: "int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;long long k;cin>>k;",
    c: "int n,i;static long long a[500005];if(scanf(\"%d\",&n)!=1)return 1;for(i=0;i<n;i++)scanf(\"%lld\",&a[i]);long long k;if(scanf(\"%lld\",&k)!=1)return 1;",
    parse: (t) => { const v = nums(t); return { n: v[0], a: v.slice(1, 1 + v[0]), k: v[1 + v[0]] }; },
    gen: (r, cfg) => { const n = r.int(cfg.nMin ?? 2, cfg.nMax ?? 12); const a = r.intArray(n, cfg.lo ?? 0, cfg.hi ?? 100); const k = r.int(1, n); return `${n}\n${j(a)}\n${k}\n`; },
  },
  num: {
    py: "n0 = int(data[0])\n",
    cpp: "long long n0;cin>>n0;",
    c: "long long n0;if(scanf(\"%lld\",&n0)!=1)return 1;",
    parse: (t) => ({ n0: Number(t.trim().split(/\s+/)[0]) }),
    gen: (r, cfg) => `${r.int(cfg.lo ?? 1, cfg.hi ?? 100)}\n`,
    bigIntParse: true,
  },
  numK: {
    py: "n0 = int(data[0])\nk = int(data[1])\n",
    cpp: "long long n0,k;cin>>n0>>k;",
    c: "long long n0,k;if(scanf(\"%lld %lld\",&n0,&k)!=2)return 1;",
    parse: (t) => { const v = nums(t); return { n0: v[0], k: v[1] }; },
    gen: (r, cfg) => `${r.int(cfg.lo ?? 1, cfg.hi ?? 100)} ${r.int(cfg.kMin ?? 1, cfg.kMax ?? 10)}\n`,
  },
  numKIndex: {
    py: "n0 = int(data[0])\nk = int(data[1])\n",
    cpp: "long long n0,k;cin>>n0>>k;",
    c: "long long n0,k;if(scanf(\"%lld %lld\",&n0,&k)!=2)return 1;",
    parse: (t) => { const v = nums(t); return { n0: v[0], k: v[1] }; },
    gen: (r, cfg) => { const n0 = r.int(cfg.lo ?? 2, cfg.hi ?? 20); return `${n0} ${r.int(0, n0)}\n`; },
  },
  two: {
    py: "a0 = int(data[0])\nb0 = int(data[1])\n",
    cpp: "long long a0,b0;cin>>a0>>b0;",
    c: "long long a0,b0;if(scanf(\"%lld %lld\",&a0,&b0)!=2)return 1;",
    parse: (t) => { const v = nums(t); return { a0: v[0], b0: v[1] }; },
    gen: (r, cfg) => `${r.int(cfg.lo ?? 1, cfg.hi ?? 100)} ${r.int(cfg.lo ?? 1, cfg.hi ?? 100)}\n`,
  },
  str: {
    py: "s = data[0]\n",
    cpp: "string s;cin>>s;",
    c: "char s[100005];if(scanf(\"%100004s\",s)!=1)return 1;int n=(int)strlen(s),i;(void)n;",
    parse: (t) => ({ s: t.trim().split(/\s+/)[0] }),
    gen: (r, cfg) => { const n = r.int(cfg.nMin ?? 3, cfg.nMax ?? 12); const alpha = cfg.alpha ?? "abcdefghijklmnopqrstuvwxyz"; let s = ""; for (let i = 0; i < n; i++) s += alpha[r.int(0, alpha.length - 1)]; return `${s}\n`; },
  },
  matrix: {
    py: "n = int(data[0])\nm = int(data[1])\ng = [list(map(int, data[2 + i * m:2 + (i + 1) * m])) for i in range(n)]\n",
    cpp: "int n,m;cin>>n>>m;vector<vector<long long>>g(n,vector<long long>(m));for(auto&r:g)for(auto&x:r)cin>>x;",
    c: "int n,m,i,z;static long long g[505][505];if(scanf(\"%d %d\",&n,&m)!=2)return 1;for(i=0;i<n;i++)for(z=0;z<m;z++)scanf(\"%lld\",&g[i][z]);",
    parse: (t) => { const v = nums(t); const n = v[0], m = v[1]; const flat = v.slice(2, 2 + n * m); const g = []; for (let i = 0; i < n; i++) g.push(flat.slice(i * m, (i + 1) * m)); return { n, m, g }; },
    gen: (r, cfg) => { const n = r.int(cfg.nMin ?? 2, cfg.nMax ?? 4); const m = r.int(cfg.mMin ?? n, cfg.mMax ?? n); const rows = Array.from({ length: n }, () => r.intArray(m, cfg.lo ?? 0, cfg.hi ?? 20)); return `${n} ${m}\n${rows.map(j).join("\n")}\n`; },
  },
  pairsT: {
    py: "T = int(data[0])\nqs = [(int(data[1 + i * 2]), int(data[2 + i * 2])) for i in range(T)]\n",
    cpp: "int T;cin>>T;vector<pair<long long,long long>>qs(T);for(auto&q:qs)cin>>q.first>>q.second;",
    c: "int T,i;long long qa[10005],qb[10005];if(scanf(\"%d\",&T)!=1)return 1;for(i=0;i<T;i++)scanf(\"%lld %lld\",&qa[i],&qb[i]);",
    parse: (t) => { const v = nums(t); const T = v[0]; const qs = []; for (let i = 0; i < T; i++) qs.push([v[1 + i * 2], v[2 + i * 2]]); return { T, qs }; },
    gen: (r, cfg) => { const T = r.int(cfg.tMin ?? 1, cfg.tMax ?? 4); const rows = Array.from({ length: T }, () => `${r.int(cfg.lo ?? 1, cfg.hi ?? 100)} ${r.int(cfg.lo ?? 1, cfg.hi ?? 100)}`); return `${T}\n${rows.join("\n")}\n`; },
  },
};

/** 由 shape + op 构造一个具体题目族 */
export function makeFamily({ shape, op, difficulty, topic, tags, hint = "", timeLimitMs = 1000, cfg, variant, statement, inputFormat, outputFormat, title }) {
  const S = SHAPES[shape];
  return {
    key: op.id,
    variant,
    topic,
    difficulty,
    tags,
    hint,
    title: title ?? op.title,
    statement: typeof statement === "function" ? statement : () => statement,
    inputFormat: typeof inputFormat === "function" ? inputFormat : () => inputFormat,
    outputFormat: typeof outputFormat === "function" ? outputFormat : () => outputFormat,
    timeLimitMs,
    solve: (rng) => {
      const compute = (text) => op.js(S.parse(text), nums(text));
      const all = [];
      for (let i = 0; i < 10; i++) {
        const input = S.gen(rng, cfg);
        all.push({ input, output: compute(input) + "\n" });
      }
      // 前两个样例固定为可读的小数据
      const demoCfg = { ...cfg, nMin: cfg?.demoN ?? cfg?.nMin, nMax: cfg?.demoNMax ?? Math.min(cfg?.nMax ?? 6, 6), lo: cfg?.demoLo ?? cfg?.lo, hi: cfg?.demoHi ?? Math.min(cfg?.hi ?? 30, 30) };
      for (let i = 0; i < 2; i++) {
        const input = S.gen(new (rng.constructor)(1234 + i * 77), demoCfg);
        all[i] = { input, output: compute(input) + "\n" };
      }
      return { samples: all.slice(0, 2).map((t) => ({ input: t.input, output: t.output, explanation: "" })), tests: all };
    },
    solutions: () => ({
      python: PY(S.py + op.py + "\n"),
      cpp: CPP(S.cpp + op.cpp, op.cppExtra ?? ""),
      c: C(S.c + op.c, op.cExtra ?? ""),
    }),
  };
}

