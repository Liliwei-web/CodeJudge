/**
 * 题库扩展引擎：用紧凑的表格描述批量生成「互不相同」的题目。
 * 每道题只需要四段实现：js（生成答案）、py、cpp、c。
 */
import { SHAPES, makeFamily } from "./shapes.mjs";

export const numsOf = (t) => t.trim().split(/\s+/).filter(Boolean).map(Number);
export const jn = (a) => a.join(" ");

/** 三语言 + JS 的通用辅助函数库，按需注入 */
export const H = {
  prime: {
    py: "def isp(v):\n    if v < 2:\n        return False\n    d = 2\n    while d * d <= v:\n        if v % d == 0:\n            return False\n        d += 1\n    return True\n",
    cpp: "int isp(long long v){if(v<2)return 0;for(long long d=2;d*d<=v;d++)if(v%d==0)return 0;return 1;}",
    c: "int isp(long long v){if(v<2)return 0;long long d;for(d=2;d*d<=v;d++)if(v%d==0)return 0;return 1;}",
    js: "function isp(v){if(v<2)return false;for(var d=2;d*d<=v;d++)if(v%d==0)return false;return true;}",
  },
  palin: {
    py: "def ispal(v):\n    t = v\n    r = 0\n    while t:\n        r = r * 10 + t % 10\n        t //= 10\n    return r == v\n",
    cpp: "int ispal(long long v){long long t=v,r=0;while(t){r=r*10+t%10;t/=10;}return r==v;}",
    c: "int ispal(long long v){long long t=v,r=0;while(t){r=r*10+t%10;t/=10;}return r==v;}",
    js: "function ispal(v){var t=v,r=0;while(t){r=r*10+t%10;t=Math.floor(t/10);}return r===v;}",
  },
  sq: {
    py: "def issq(v):\n    r = 0\n    while r * r < v:\n        r += 1\n    return r * r == v\n",
    cpp: "int issq(long long v){long long r=0;while(r*r<v)r++;return r*r==v;}",
    c: "int issq(long long v){long long r=0;while(r*r<v)r++;return r*r==v;}",
    js: "function issq(v){var r=0;while(r*r<v)r++;return r*r===v;}",
  },
  cube: {
    py: "def iscube(v):\n    r = 0\n    while r * r * r < v:\n        r += 1\n    return r * r * r == v\n",
    cpp: "int iscube(long long v){long long r=0;while(r*r*r<v)r++;return r*r*r==v;}",
    c: "int iscube(long long v){long long r=0;while(r*r*r<v)r++;return r*r*r==v;}",
    js: "function iscube(v){var r=0;while(r*r*r<v)r++;return r*r*r===v;}",
  },
  dsum: {
    py: "def dsum(v):\n    s = 0\n    while v:\n        s += v % 10\n        v //= 10\n    return s\n",
    cpp: "long long dsum(long long v){long long s=0;while(v){s+=v%10;v/=10;}return s;}",
    c: "long long dsum(long long v){long long s=0;while(v){s+=v%10;v/=10;}return s;}",
    js: "function dsum(v){var s=0;while(v){s+=v%10;v=Math.floor(v/10);}return s;}",
  },
  dmax: {
    py: "def dmax(v):\n    m = 0\n    while v:\n        if v % 10 > m:\n            m = v % 10\n        v //= 10\n    return m\n",
    cpp: "long long dmax(long long v){long long m=0;while(v){if(v%10>m)m=v%10;v/=10;}return m;}",
    c: "long long dmax(long long v){long long m=0;while(v){if(v%10>m)m=v%10;v/=10;}return m;}",
    js: "function dmax(v){var m=0;while(v){if(v%10>m)m=v%10;v=Math.floor(v/10);}return m;}",
  },
  dmin: {
    py: "def dmin(v):\n    m = 9\n    while v:\n        if v % 10 < m:\n            m = v % 10\n        v //= 10\n    return m\n",
    cpp: "long long dmin(long long v){long long m=9;while(v){if(v%10<m)m=v%10;v/=10;}return m;}",
    c: "long long dmin(long long v){long long m=9;while(v){if(v%10<m)m=v%10;v/=10;}return m;}",
    js: "function dmin(v){var m=9;while(v){if(v%10<m)m=v%10;v=Math.floor(v/10);}return m;}",
  },
  hasdig: {
    py: "def hasdig(v, d):\n    while v:\n        if v % 10 == d:\n            return True\n        v //= 10\n    return False\n",
    cpp: "int hasdig(long long v,long long d){while(v){if(v%10==d)return 1;v/=10;}return 0;}",
    c: "int hasdig(long long v,long long d){while(v){if(v%10==d)return 1;v/=10;}return 0;}",
    js: "function hasdig(v,d){while(v){if(v%10===d)return true;v=Math.floor(v/10);}return false;}",
  },
  fib: {
    py: "def isfib(v):\n    a = 1\n    b = 1\n    while b < v:\n        a, b = b, a + b\n    return b == v\n",
    cpp: "int isfib(long long v){long long a=1,b=1;while(b<v){long long t=a+b;a=b;b=t;}return b==v;}",
    c: "int isfib(long long v){long long a=1,b=1,t;while(b<v){t=a+b;a=b;b=t;}return b==v;}",
    js: "function isfib(v){var a=1,b=1;while(b<v){var t=a+b;a=b;b=t;}return b===v;}",
  },
  gcd: {
    py: "def g2(a, b):\n    while b:\n        a, b = b, a % b\n    return a\n",
    cpp: "long long g2(long long a,long long b){while(b){long long t=a%b;a=b;b=t;}return a;}",
    c: "long long g2(long long a,long long b){while(b){long long t=a%b;a=b;b=t;}return a;}",
    js: "function g2(a,b){while(b){var t=a%b;a=b;b=t;}return a;}",
  },
  lcm: {
    py: "def l2(a, b):\n    return a // g2(a, b) * b\n",
    cpp: "long long l2(long long a,long long b){return a/g2(a,b)*b;}",
    c: "long long l2(long long a,long long b){return a/g2(a,b)*b;}",
    js: "function l2(a,b){return a/g2(a,b)*b;}",
  },
  phi: {
    py: "def ph(v):\n    r = v\n    p = 2\n    while p * p <= v:\n        if v % p == 0:\n            while v % p == 0:\n                v //= p\n            r -= r // p\n        p += 1\n    if v > 1:\n        r -= r // v\n    return r\n",
    cpp: "long long ph(long long v){long long r=v;for(long long p=2;p*p<=v;p++)if(v%p==0){while(v%p==0)v/=p;r-=r/p;}if(v>1)r-=r/v;return r;}",
    c: "long long ph(long long v){long long r=v,p;for(p=2;p*p<=v;p++)if(v%p==0){while(v%p==0)v/=p;r-=r/p;}if(v>1)r-=r/v;return r;}",
    js: "function ph(v){var r=v;for(var p=2;p*p<=v;p++)if(v%p===0){while(v%p===0)v/=p;r-=Math.floor(r/p);}if(v>1)r-=Math.floor(r/v);return r;}",
  },
};

/** 取若干辅助函数的三语言源码 + JS 源码 */
export function helpers(names) {
  const pick = (k) => (names || []).map((n) => H[n][k]).join("");
  return { py: pick("py"), cpp: pick("cpp"), c: pick("c"), js: pick("js") };
}

/** 把共享表达式编译成 JS 谓词函数 */
export function compileJsPred(pred) {
  const h = helpers(pred.help).js;
  return new Function(`${h}return function(x){ return (${pred.p}); };`)();
}

/** 由一行表格构造一道题族 */
export function task(difficulty, row) {
  const h = helpers(row.help);
  return makeFamily({
    shape: row.shape ?? "arr",
    op: {
      id: row.id,
      js: row.js,
      py: h.py + (row.py ?? ""),
      cpp: row.cpp ?? "",
      c: row.c ?? "",
      cppExtra: h.cpp + (row.cppExtra ?? ""),
      cExtra: h.c + (row.cExtra ?? ""),
    },
    difficulty,
    topic: row.topic ?? "综合",
    tags: row.tags ?? [],
    hint: row.hint ?? "",
    cfg: row.cfg ?? {},
    variant: 1,
    title: row.title,
    statement: row.desc,
    inputFormat: row.inputFormat ?? "第一行一个整数 $n$（$1 \\le n \\le 1000$）；第二行 $n$ 个整数 $a_i$，用空格隔开。",
    outputFormat: row.outputFormat ?? "一行，输出答案。",
    timeLimitMs: row.timeLimitMs ?? 1500,
  });
}

export function tasks(difficulty, rows) {
  return rows.map((r) => task(difficulty, r));
}
