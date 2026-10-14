/**
 * 困难难度扩展题库（第二批）：区间内数位/数论性质的统计。
 * 用「区间 × 性质 × 统计方式」的组合产生大量互不相同的题目。
 */
import { SHAPES } from "../lib/shapes.mjs";
import { tasks } from "../lib/tasks.mjs";

SHAPES.rangeAB = {
  py: "a0 = int(data[0])\nb0 = int(data[1])\n",
  cpp: "long long a0,b0;cin>>a0>>b0;",
  c: "long long a0,b0;if(scanf(\"%lld %lld\",&a0,&b0)!=2)return 1;",
  parse: (t) => { const v = t.trim().split(/\s+/).map(Number); return { a0: v[0], b0: v[1] }; },
  gen: (r, cfg) => { const lo = cfg.lo ?? 1, hi = cfg.hi ?? 50000; let a = r.int(lo, hi); let b = r.int(lo, hi); if (a > b) { const t = a; a = b; b = t; } return `${a} ${b}\n`; },
};

/* 三语言 + JS 的辅助函数（所有题都带上，方便统一） */
const HELP = {
  py: [
    "from math import isqrt",
    "def dsum(v):",
    "    s = 0",
    "    while v:",
    "        s += v % 10",
    "        v //= 10",
    "    return s",
    "def dmax(v):",
    "    m = 0",
    "    while v:",
    "        if v % 10 > m:",
    "            m = v % 10",
    "        v //= 10",
    "    return m",
    "def hasdig(v, d):",
    "    while v:",
    "        if v % 10 == d:",
    "            return True",
    "        v //= 10",
    "    return False",
    "def nothas(v, d):",
    "    return not hasdig(v, d)",
    "def uniqdig(v):",
    "    seen = set()",
    "    while v:",
    "        d = v % 10",
    "        if d in seen:",
    "            return False",
    "        seen.add(d)",
    "        v //= 10",
    "    return True",
    "def ispal(v):",
    "    t = v",
    "    r = 0",
    "    while t:",
    "        r = r * 10 + t % 10",
    "        t //= 10",
    "    return r == v",
    "def issq(v):",
    "    r = isqrt(v)",
    "    return r * r == v",
    "def isp(v):",
    "    if v < 2:",
    "        return False",
    "    d = 2",
    "    while d * d <= v:",
    "        if v % d == 0:",
    "            return False",
    "        d += 1",
    "    return True",
    "def deven(v):",
    "    while v:",
    "        if v % 2 == 0:",
    "            return True",
    "        v //= 10",
    "    return False",
    "def popodd(v):",
    "    return bin(v).count(\"1\") % 2 == 1",
    "def cntdig(v, d):",
    "    c = 0",
    "    while v:",
    "        if v % 10 == d:",
    "            c += 1",
    "        v //= 10",
    "    return c",
    "",
  ].join("\n"),
  cpp: "long long dsum(long long v){long long s=0;while(v){s+=v%10;v/=10;}return s;}"
    + "long long dmax(long long v){long long m=0;while(v){if(v%10>m)m=v%10;v/=10;}return m;}"
    + "int hasdig(long long v,long long d){while(v){if(v%10==d)return 1;v/=10;}return 0;}"
    + "int nothas(long long v,long long d){return !hasdig(v,d);}"
    + "int uniqdig(long long v){int seen[10]={0};while(v){int d=(int)(v%10);if(seen[d])return 0;seen[d]=1;v/=10;}return 1;}"
    + "int ispal(long long v){long long t=v,r=0;while(t){r=r*10+t%10;t/=10;}return r==v;}"
    + "int issq(long long v){long long r=(long long)sqrt((double)v);while(r*r>v)r--;while((r+1)*(r+1)<=v)r++;return r*r==v;}"
    + "int isp(long long v){if(v<2)return 0;for(long long d=2;d*d<=v;d++)if(v%d==0)return 0;return 1;}"
    + "int deven(long long v){while(v){if(v%2==0)return 1;v/=10;}return 0;}"
    + "int popodd(long long v){return __builtin_popcountll(v)%2;}"
    + "int cntdig(long long v,long long d){int c=0;while(v){if(v%10==d)c++;v/=10;}return c;}",
  c: "long long dsum(long long v){long long s=0;while(v){s+=v%10;v/=10;}return s;}"
    + "long long dmax(long long v){long long m=0;while(v){if(v%10>m)m=v%10;v/=10;}return m;}"
    + "int hasdig(long long v,long long d){while(v){if(v%10==d)return 1;v/=10;}return 0;}"
    + "int nothas(long long v,long long d){return !hasdig(v,d);}"
    + "int uniqdig(long long v){int seen[10]={0};while(v){int d=(int)(v%10);if(seen[d])return 0;seen[d]=1;v/=10;}return 1;}"
    + "int ispal(long long v){long long t=v,r=0;while(t){r=r*10+t%10;t/=10;}return r==v;}"
    + "int issq(long long v){long long r=0;while(r*r<v)r++;return r*r==v;}"
    + "int isp(long long v){if(v<2)return 0;long long d;for(d=2;d*d<=v;d++)if(v%d==0)return 0;return 1;}"
    + "int deven(long long v){while(v){if(v%2==0)return 1;v/=10;}return 0;}"
    + "int popodd(long long v){int c=0;while(v){c+=v&1;v>>=1;}return c%2;}"
    + "int cntdig(long long v,long long d){int c=0;while(v){if(v%10==d)c++;v/=10;}return c;}",
  js: "function dsum(v){var s=0;while(v){s+=v%10;v=Math.floor(v/10);}return s;}"
    + "function dmax(v){var m=0;while(v){if(v%10>m)m=v%10;v=Math.floor(v/10);}return m;}"
    + "function hasdig(v,d){while(v){if(v%10===d)return true;v=Math.floor(v/10);}return false;}"
    + "function nothas(v,d){return !hasdig(v,d);}"
    + "function uniqdig(v){var seen={};while(v){var d=v%10;if(seen[d])return false;seen[d]=true;v=Math.floor(v/10);}return true;}"
    + "function ispal(v){var t=v,r=0;while(t){r=r*10+t%10;t=Math.floor(t/10);}return r===v;}"
    + "function issq(v){var r=Math.floor(Math.sqrt(v));while(r*r>v)r--;while((r+1)*(r+1)<=v)r++;return r*r===v;}"
    + "function isp(v){if(v<2)return false;for(var d=2;d*d<=v;d++)if(v%d===0)return false;return true;}"
    + "function deven(v){while(v){if(v%2===0)return true;v=Math.floor(v/10);}return false;}"
    + "function popodd(v){var c=0;while(v){c+=v&1;v>>=1;}return c%2===1;}"
    + "function cntdig(v,d){var c=0;while(v){if(v%10===d)c++;v=Math.floor(v/10);}return c;}",
};

const PREDS = [
  { id: "dsumodd", t: "数位和为奇数的数", p: "dsum(x) % 2 != 0" },
  { id: "dsumeven", t: "数位和为偶数的数", p: "dsum(x) % 2 == 0" },
  { id: "dsum3", t: "数位和是 3 的倍数的数", p: "dsum(x) % 3 == 0" },
  { id: "dsum9", t: "数位和恰好为 9 的数", p: "dsum(x) == 9" },
  { id: "has7", t: "含数字 7 的数", p: "hasdig(x, 7)" },
  { id: "has3", t: "含数字 3 的数", p: "hasdig(x, 3)" },
  { id: "no0", t: "不含数字 0 的数", p: "nothas(x, 0)" },
  { id: "no4", t: "不含数字 4 的数", p: "nothas(x, 4)" },
  { id: "uniq", t: "各位数字互不相同的数", p: "uniqdig(x)" },
  { id: "palin", t: "回文数", p: "ispal(x)" },
  { id: "sq", t: "完全平方数", p: "issq(x)" },
  { id: "pow2", t: "2 的幂", p: "(x > 0) & ((x & (x - 1)) == 0)" },
  { id: "dmaxeven", t: "最大数位为偶数的数", p: "dmax(x) % 2 == 0" },
  { id: "dmax9", t: "最大数位是 9 的数", p: "dmax(x) == 9" },
  { id: "deven", t: "数位乘积为偶数的数", p: "deven(x)" },
  { id: "popodd", t: "二进制中 1 的个数为奇数的数", p: "popodd(x)" },
  { id: "div7even", t: "能被 7 整除且数位和为偶数的数", p: "(x % 7 == 0) & (dsum(x) % 2 == 0)" },
  { id: "mult3has3", t: "是 3 的倍数且含数字 3 的数", p: "(x % 3 == 0) & hasdig(x, 3)" },
  { id: "spf3", t: "最小质因数为 3 的数", p: "(x % 3 == 0) & (x % 2 != 0)" },
  { id: "sqplus1", t: "加 1 后是完全平方数的数", p: "issq(x + 1)" },
  { id: "has37", t: "同时含数字 3 和 7 的数", p: "hasdig(x, 3) & hasdig(x, 7)" },
  { id: "two4", t: "恰好含两个数字 4 的数", p: "cntdig(x, 4) == 2" },
  { id: "no05", t: "既不含数字 0 也不含数字 5 的数", p: "nothas(x, 0) & nothas(x, 5)" },
  { id: "dsum7", t: "数位和为 7 的倍数的数", p: "dsum(x) % 7 == 0", cfg: { lo: 1, hi: 50000 } },
];

const REDS = {
  count: {
    title: (t) => `区间内${t}的个数`,
    desc: (t) => `输出闭区间 $[a, b]$ 内${t}的个数。`,
    hint: "把区间里的整数逐个检查一遍并计数，注意区间端点也要算进去。",
    js: (f) => (o) => { let c = 0; for (let x = o.a0; x <= o.b0; x++) if (f(x)) c++; return `${c}`; },
    py: (P) => `c = 0\nfor x in range(a0, b0 + 1):\n    if ${P}:\n        c += 1\nprint(c)`,
    cpp: (P) => `long long c=0;for(long long x=a0;x<=b0;x++)if(${P})c++;cout<<c<<"\\n";`,
    c: (P) => `long long c=0,x;for(x=a0;x<=b0;x++)if(${P})c++;printf("%lld\\n",c);`,
  },
  sum: {
    title: (t) => `区间内${t}之和`,
    desc: (t) => `输出闭区间 $[a, b]$ 内所有${t}之和（若一个都没有则输出 0）。`,
    hint: "逐个检查区间内的整数，满足条件就累加到总和里；注意总和可能超过 32 位整数范围。",
    js: (f) => (o) => { let s = 0; for (let x = o.a0; x <= o.b0; x++) if (f(x)) s += x; return `${s}`; },
    py: (P) => `s = 0\nfor x in range(a0, b0 + 1):\n    if ${P}:\n        s += x\nprint(s)`,
    cpp: (P) => `long long s=0;for(long long x=a0;x<=b0;x++)if(${P})s+=x;cout<<s<<"\\n";`,
    c: (P) => `long long s=0,x;for(x=a0;x<=b0;x++)if(${P})s+=x;printf("%lld\\n",s);`,
  },
  max: {
    title: (t) => `区间内最大的${t}`,
    desc: (t) => `输出闭区间 $[a, b]$ 内最大的${t}；若区间内不存在这样的数，输出 -1。`,
    hint: "从小到大枚举区间内的整数，不断更新答案即可（最后一个满足条件的数就是最大的）。",
    js: (f) => (o) => { let m = -1; for (let x = o.a0; x <= o.b0; x++) if (f(x)) m = x; return `${m}`; },
    py: (P) => `m = -1\nfor x in range(a0, b0 + 1):\n    if ${P}:\n        m = x\nprint(m)`,
    cpp: (P) => `long long m=-1;for(long long x=a0;x<=b0;x++)if(${P})m=x;cout<<m<<"\\n";`,
    c: (P) => `long long m=-1,x;for(x=a0;x<=b0;x++)if(${P})m=x;printf("%lld\\n",m);`,
  },
  min: {
    title: (t) => `区间内最小的${t}`,
    desc: (t) => `输出闭区间 $[a, b]$ 内最小的${t}；若区间内不存在这样的数，输出 -1。`,
    hint: "从小到大枚举区间内的整数，遇到的第一个满足条件的数就是答案，可以直接结束循环。",
    js: (f) => (o) => { for (let x = o.a0; x <= o.b0; x++) if (f(x)) return `${x}`; return "-1"; },
    py: (P) => `ans = -1\nfor x in range(a0, b0 + 1):\n    if ${P}:\n        ans = x\n        break\nprint(ans)`,
    cpp: (P) => `long long ans=-1;for(long long x=a0;x<=b0;x++)if(${P}){ans=x;break;}cout<<ans<<"\\n";`,
    c: (P) => `long long ans=-1,x;for(x=a0;x<=b0;x++)if(${P}){ans=x;break;}printf("%lld\\n",ans);`,
  },
};

const IFAB = "一行，两个整数 $a$ 和 $b$（$1 \\le a, b \\le 50000$，区间为 $[\\min(a,b), \\max(a,b)]$），用空格隔开。";

function compileJs(pred) {
  return new Function(HELP.js + "return function(x){ return (" + pred.p + "); };")();
}

function rows() {
  const out = [];
  for (const pred of PREDS) {
    for (const rid of Object.keys(REDS)) {
      const R = REDS[rid];
      out.push({
        id: `hxr-${pred.id}-${rid}`,
        title: R.title(pred.t),
        desc: R.desc(pred.t),
        shape: "rangeAB",
        js: R.js(compileJs(pred)),
        py: HELP.py + R.py(pred.p) + "\n",
        cpp: R.cpp(pred.p),
        c: R.c(pred.p),
        cppExtra: HELP.cpp,
        cExtra: HELP.c,
        cfg: { lo: 1, hi: 50000 },
        topic: "区间与数位",
        tags: ["数位", "枚举"],
        hint: R.hint,
        inputFormat: IFAB,
        timeLimitMs: 3000,
      });
    }
  }
  return out;
}

export const hard_extra2Families = tasks("困难", rows());
