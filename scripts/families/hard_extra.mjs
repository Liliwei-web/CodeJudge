/**
 * 困难难度扩展题库（第一批）：数论 / 位运算 / 贪心 / 模拟 / 区间。
 */
import "./intro.mjs";
import "./medium.mjs";
import "./medium_extra.mjs";
import { SHAPES } from "../lib/shapes.mjs";
import { tasks } from "../lib/tasks.mjs";

/** 偶数输入 */
SHAPES.numEven = {
  py: "n0 = int(data[0])\n",
  cpp: "long long n0;cin>>n0;",
  c: "long long n0;if(scanf(\"%lld\",&n0)!=1)return 1;",
  parse: SHAPES.num.parse,
  gen: (r, cfg) => {
    const lo = cfg.lo ?? 4, hi = cfg.hi ?? 1000;
    const half = r.int(Math.ceil(lo / 2), Math.floor(hi / 2));
    return `${half * 2}\n`;
  },
  bigIntParse: true,
};

/** 一个只出现一次、其余元素都恰好出现三次的数组 */
SHAPES.arrThree = {
  py: "n = int(data[0])\na = list(map(int, data[1:1 + n]))\n",
  cpp: "int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;",
  c: "int n,i;static long long a[500005];if(scanf(\"%d\",&n)!=1)return 1;for(i=0;i<n;i++)scanf(\"%lld\",&a[i]);",
  parse: SHAPES.arr.parse,
  gen: (r, cfg) => {
    const groups = r.int(2, 5);
    const single = r.int(1, 200);
    const arr = [single];
    for (let g = 0; g < groups; g++) {
      const v = r.int(1, 200);
      if (v === single) continue;
      for (let t = 0; t < 3; t++) arr.push(v);
    }
    for (let i = arr.length - 1; i > 0; i--) { const j = r.int(0, i); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return `${arr.length}\n${arr.join(" ")}\n`;
  },
};

const IAN = "一行，一个整数 $n$。";
const IANK = "一行，两个整数 $n$ 和 $m$，用空格隔开。";
const IFA = "第一行一个整数 $n$（$1 \\le n \\le 200$）；第二行 $n$ 个整数 $a_i$，用空格隔开。";
const IFS = "一行，一个只由英文字母组成的字符串 $s$（$1 \\le |s| \\le 200$）。";
const IF2 = "一行，两个整数 $a$ 和 $b$（$0 \\le a, b \\le 20000$），用空格隔开。";
const IFI = "第一行一个整数 $T$；接下来 $T$ 行，每行两个整数 $l, r$，表示一个区间 $[l, r]$。";
const OFL = "若干行，每行一个答案。";
const COPY = "static long long b2[500005];int i2,j2;for(i2=0;i2<n;i2++)b2[i2]=a[i2];";
const SORT_ASC = "for(i2=0;i2<n;i2++)for(j2=i2+1;j2<n;j2++)if(b2[j2]<b2[i2]){long long t2=b2[i2];b2[i2]=b2[j2];b2[j2]=t2;}";

const ROWS = [
  {
    id: "hx-nth-prime", title: "第 n 个质数", shape: "num", cfg: { lo: 1, hi: 150 }, inputFormat: IAN,
    topic: "数论", tags: ["质数", "枚举"], hint: "从 2 开始逐个判断是否为质数，数到第 $n$ 个就输出。",
    desc: "输出第 $n$ 个质数（第 1 个质数是 2，第 2 个质数是 3，以此类推）。",
    js: ({ n0 }) => { let c = 0; for (let v = 2; ; v++) { let p = true; for (let d = 2; d * d <= v; d++) if (v % d === 0) { p = false; break; } if (p) { c++; if (c === n0) return `${v}`; } } },
    py: "c = 0\nv = 2\nwhile True:\n    p = True\n    d = 2\n    while d * d <= v:\n        if v % d == 0:\n            p = False\n            break\n        d += 1\n    if p:\n        c += 1\n        if c == n0:\n            print(v)\n            break\n    v += 1",
    cpp: 'long long c=0;for(long long v=2;;v++){int p=1;for(long long d=2;d*d<=v;d++)if(v%d==0){p=0;break;}if(p){c++;if(c==n0){cout<<v<<"\\n";break;}}}',
    c: 'long long c=0,v,d;int p;for(v=2;;v++){p=1;for(d=2;d*d<=v;d++)if(v%d==0){p=0;break;}if(p){c++;if(c==n0){printf("%lld\\n",v);break;}}}',
  },
  {
    id: "hx-max-prime-factor", title: "最大质因子", shape: "num", cfg: { lo: 2, hi: 100000 }, inputFormat: IAN,
    topic: "数论", tags: ["质因数"], hint: "从小到大试除，不断更新最后一个能整除 $n$ 的质数。",
    desc: "输出 $n$ 的所有质因数中最大的那个（$n \\ge 2$）。",
    js: ({ n0 }) => { let n = n0, best = 1; for (let d = 2; d * d <= n; d++) while (n % d === 0) { best = d; n /= d; } if (n > 1) best = Math.max(best, n); return `${best}`; },
    py: "n = n0\nbest = 1\nd = 2\nwhile d * d <= n:\n    while n % d == 0:\n        best = d\n        n //= d\n    d += 1\nif n > 1:\n    best = n\nprint(best)",
    cpp: 'long long n=n0,best=1;for(long long d=2;d*d<=n;d++)while(n%d==0){best=d;n/=d;}if(n>1)best=max(best,n);cout<<best<<"\\n";',
    c: 'long long n=n0,best=1,d;for(d=2;d*d<=n;d++)while(n%d==0){best=d;n/=d;}if(n>1)best=n;printf("%lld\\n",best);',
  },
  {
    id: "hx-fib-mod", title: "斐波那契第 n 项取模", shape: "numK", cfg: { lo: 0, hi: 1000000000, kMin: 2, kMax: 1000000 }, inputFormat: IANK,
    topic: "矩阵快速幂", tags: ["快速幂", "递推"], hint: "用快速倍增法（或矩阵快速幂）把递推降到 $O(\\log n)$，注意中间结果要对 $m$ 取模。",
    desc: "输出斐波那契数列第 $n$ 项对 $m$ 取模的结果（$F_0=0$，$F_1=1$，$F_i=F_{i-1}+F_{i-2}$）。$n$ 最大可达 $10^9$，需要用 $O(\\log n)$ 的做法。",
    js: ({ n0, k }) => { const M = BigInt(k); const f = (n) => { if (n === 0n) return [0n, 1n]; const [a, b] = f(n / 2n); const c = (a * ((2n * b - a + M) % M)) % M; const d = (a * a + b * b) % M; return n % 2n === 0n ? [c, d] : [d, (c + d) % M]; }; return String(f(BigInt(n0))[0] % M); },
    py: "M = k\ndef f(n):\n    if n == 0:\n        return (0, 1)\n    a, b = f(n // 2)\n    c = a * ((2 * b - a) % M) % M\n    d = (a * a + b * b) % M\n    return (c, d) if n % 2 == 0 else (d, (c + d) % M)\nprint(f(n0)[0] % M)",
    cpp: 'long long a=0,b=1;for(long long bit=1LL<<62;bit;bit>>=1){long long c=a*((2*b-a+k)%k)%k;long long d=(a*a+b*b)%k;if(n0&bit){a=d;b=(c+d)%k;}else{a=c;b=d;}}cout<<a%k<<"\\n";',
    c: 'long long a2=0,b3=1,bit,c2,d2;for(bit=1LL<<62;bit;bit>>=1){c2=a2*((2*b3-a2+k)%k)%k;d2=(a2*a2+b3*b3)%k;if(n0&bit){a2=d2;b3=(c2+d2)%k;}else{a2=c2;b3=d2;}}printf("%lld\\n",a2%k);',
  },
  {
    id: "hx-catalan", title: "卡特兰数", shape: "num", cfg: { lo: 0, hi: 25 }, inputFormat: IAN,
    topic: "组合数学", tags: ["组合数学"], hint: "用公式 $C_n=\\frac{1}{n+1}\\binom{2n}{n}$，边乘边除避免溢出。",
    desc: "输出第 $n$ 个卡特兰数（$C_0=1$，$C_n=\\frac{1}{n+1}\\binom{2n}{n}$，$n \\le 25$，结果保证可以用 64 位整数精确表示）。",
    js: ({ n0 }) => { let r = 1n; for (let i = 1n; i <= BigInt(n0); i++) r = r * (BigInt(n0) + i) / i; return String(r / BigInt(n0 + 1)); },
    py: "from math import comb\nprint(comb(2 * n0, n0) // (n0 + 1))",
    cpp: 'long long r=1;for(long long i=1;i<=n0;i++)r=r*(n0+i)/i;cout<<r/(n0+1)<<"\\n";',
    c: 'long long r=1,i2;for(i2=1;i2<=n0;i2++)r=r*(n0+i2)/i2;printf("%lld\\n",r/(n0+1));',
  },
  {
    id: "hx-binomial-mod", title: "组合数取模", shape: "numKIndex", cfg: { lo: 2, hi: 60 }, inputFormat: "一行，两个整数 $n$ 和 $k$（$0 \\le k \\le n \\le 60$），用空格隔开。",
    topic: "组合数学", tags: ["组合数学"], hint: "连乘公式 $\\binom{n}{k}=\\frac{n(n-1)\\cdots(n-k+1)}{k!}$，每一步先乘后除即可保持整除。",
    desc: "输出 $\\binom{n}{k}$ 对 $10^9+7$ 取模的结果（$n \\le 60$）。",
    js: ({ n0, k }) => { let r = 1n; for (let i = 1n; i <= BigInt(k); i++) r = r * (BigInt(n0) - i + 1n) / i; return String(r % 1000000007n); },
    py: "from math import comb\nprint(comb(n0, k) % (10 ** 9 + 7))",
    cpp: 'long long r=1;for(long long i=1;i<=k;i++)r=r*(n0-i+1)/i;cout<<r%1000000007LL<<"\\n";',
    c: 'long long r=1,i2;for(i2=1;i2<=k;i2++)r=r*(n0-i2+1)/i2;printf("%lld\\n",r%1000000007LL);',
  },
  {
    id: "hx-egg-drop", title: "鸡蛋掉落", shape: "numK", cfg: { lo: 1, hi: 20, kMin: 1, kMax: 5 }, inputFormat: "一行，两个整数 $n$ 和 $k$（$1 \\le n \\le 20$，$1 \\le k \\le 5$）。",
    topic: "动态规划", tags: ["动态规划"], hint: "换个角度：$f(m,e)$ 表示用 $m$ 次尝试、$e$ 个鸡蛋最多能确定的楼层数，$f(m,e)=f(m-1,e-1)+f(m-1,e)+1$。",
    desc: "有 $k$ 个鸡蛋和 $n$ 层楼，需要确定最低的「鸡蛋会摔碎」的楼层。求最坏情况下最少需要多少次尝试。",
    js: ({ n0, k }) => { let m = 0; let prev = new Array(k + 1).fill(0); for (;;) { m++; const cur = new Array(k + 1).fill(0); for (let e = 1; e <= k; e++) cur[e] = prev[e - 1] + prev[e] + 1; if (cur[k] >= n0) return `${m}`; prev = cur; } },
    py: "m = 0\nprev = [0] * (k + 1)\nwhile True:\n    m += 1\n    cur = [0] * (k + 1)\n    for e in range(1, k + 1):\n        cur[e] = prev[e - 1] + prev[e] + 1\n    if cur[k] >= n0:\n        print(m)\n        break\n    prev = cur",
    cpp: 'long long m=0;vector<long long>prev(k+1,0);for(;;){m++;vector<long long>cur(k+1,0);for(long long e=1;e<=k;e++)cur[e]=prev[e-1]+prev[e]+1;if(cur[k]>=n0){cout<<m<<"\\n";break;}prev=cur;}',
    c: 'long long m=0,e;static long long pv[105],cu[105];for(e=0;e<=k;e++)pv[e]=0;for(;;){m++;for(e=0;e<=k;e++)cu[e]=0;for(e=1;e<=k;e++)cu[e]=pv[e-1]+pv[e]+1;if(cu[k]>=n0){printf("%lld\\n",m);break;}for(e=0;e<=k;e++)pv[e]=cu[e];}',
  },
  {
    id: "hx-goldbach", title: "哥德巴赫拆分的方案数", shape: "numEven", cfg: { lo: 4, hi: 10000 }, inputFormat: "一行，一个大于 2 的偶数 $n$（$4 \\le n \\le 10^4$）。",
    topic: "数论", tags: ["质数"], hint: "枚举较小的那个质数 $a$（$a \\le n/2$），判断 $a$ 与 $n-a$ 是否都是质数。",
    desc: "把一个大于 2 的偶数 $n$ 拆成两个质数之和，输出**不考虑顺序**的不同拆分方案数（例如 $10=3+7=5+5$，方案数为 2）。",
    js: ({ n0 }) => { const isp = (v) => { if (v < 2) return false; for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return true; }; let c = 0; for (let a = 2; a * 2 <= n0; a++) if (isp(a) && isp(n0 - a)) c++; return `${c}`; },
    py: "def isp(v):\n    if v < 2:\n        return False\n    d = 2\n    while d * d <= v:\n        if v % d == 0:\n            return False\n        d += 1\n    return True\nc = 0\na = 2\nwhile 2 * a <= n0:\n    if isp(a) and isp(n0 - a):\n        c += 1\n    a += 1\nprint(c)",
    cpp: 'int c=0;for(long long a=2;2*a<=n0;a++){long long x=a,y=n0-a;int p1=x>=2,p2=y>=2;for(long long d=2;d*d<=x;d++)if(x%d==0){p1=0;break;}for(long long d=2;d*d<=y;d++)if(y%d==0){p2=0;break;}if(p1&&p2)c++;}cout<<c<<"\\n";',
    c: 'int c=0,p1,p2;long long a,d,x,y;for(a=2;2*a<=n0;a++){x=a;y=n0-a;p1=x>=2;p2=y>=2;for(d=2;d*d<=x;d++)if(x%d==0){p1=0;break;}for(d=2;d*d<=y;d++)if(y%d==0){p2=0;break;}if(p1&&p2)c++;}printf("%d\\n",c);',
  },
  {
    id: "hx-prime-gap", title: "相邻质数之间的最大间隔", shape: "num", cfg: { lo: 10, hi: 100000 }, inputFormat: "一行，一个整数 $n$（$10 \\le n \\le 10^5$）。",
    topic: "数论", tags: ["筛法", "质数"], hint: "先用埃氏筛求出 $n$ 以内的所有质数，再扫描一遍求相邻差的最大值。",
    desc: "把不超过 $n$ 的质数从小到大排列，输出其中相邻两个质数的差的**最大值**。",
    js: ({ n0 }) => { const sv = new Array(n0 + 1).fill(true); sv[0] = false; if (n0 >= 1) sv[1] = false; for (let p = 2; p * p <= n0; p++) if (sv[p]) for (let q = p * p; q <= n0; q += p) sv[q] = false; let prev = -1, best = 0; for (let v = 2; v <= n0; v++) if (sv[v]) { if (prev >= 0) best = Math.max(best, v - prev); prev = v; } return `${best}`; },
    py: "n = n0\nsv = [True] * (n + 1)\nsv[0] = False\nif n >= 1:\n    sv[1] = False\np = 2\nwhile p * p <= n:\n    if sv[p]:\n        q = p * p\n        while q <= n:\n            sv[q] = False\n            q += p\n    p += 1\nprev = -1\nbest = 0\nv = 2\nwhile v <= n:\n    if sv[v]:\n        if prev >= 0 and v - prev > best:\n            best = v - prev\n        prev = v\n    v += 1\nprint(best)",
    cpp: 'vector<char>sv(n0+1,1);sv[0]=0;if(n0>=1)sv[1]=0;for(long long p=2;p*p<=n0;p++)if(sv[p])for(long long q=p*p;q<=n0;q+=p)sv[q]=0;long long prev=-1,best=0;for(long long v=2;v<=n0;v++)if(sv[v]){if(prev>=0)best=max(best,v-prev);prev=v;}cout<<best<<"\\n";',
    c: 'static char sv[100005];long long p,q,prev=-1,best=0,v;for(v=0;v<=n0;v++)sv[v]=1;sv[0]=0;if(n0>=1)sv[1]=0;for(p=2;p*p<=n0;p++)if(sv[p])for(q=p*p;q<=n0;q+=p)sv[q]=0;for(v=2;v<=n0;v++)if(sv[v]){if(prev>=0){long long g=v-prev;if(g>best)best=g;}prev=v;}printf("%lld\\n",best);',
  },
  {
    id: "hx-sum-two-squares", title: "表示为两个平方数之和的方案数", shape: "num", cfg: { lo: 0, hi: 5000 }, inputFormat: IAN,
    topic: "数论", tags: ["枚举"], hint: "枚举 $a$（$2a^2 \\le n$），判断 $n-a^2$ 是否为完全平方数，注意用整数开方避免浮点误差。",
    desc: "输出有多少种方案可以把 $n$ 写成 $a^2+b^2$，其中 $0 \\le a \\le b$。",
    js: ({ n0 }) => { let c = 0; for (let a = 0; 2 * a * a <= n0; a++) { const b = n0 - a * a; let r = 0; while (r * r < b) r++; if (r * r === b) c++; } return `${c}`; },
    py: "c = 0\na = 0\nwhile 2 * a * a <= n0:\n    b = n0 - a * a\n    r = 0\n    while r * r < b:\n        r += 1\n    if r * r == b:\n        c += 1\n    a += 1\nprint(c)",
    cpp: 'int c=0;for(long long a=0;2*a*a<=n0;a++){long long b=n0-a*a,r=0;while(r*r<b)r++;if(r*r==b)c++;}cout<<c<<"\\n";',
    c: 'int c=0;long long a,b,r;for(a=0;2*a*a<=n0;a++){b=n0-a*a;r=0;while(r*r<b)r++;if(r*r==b)c++;}printf("%d\\n",c);',
  },
  {
    id: "hx-consecutive-sum", title: "能否拆成连续正整数之和", shape: "num", cfg: { lo: 3, hi: 10000 }, inputFormat: "一行，一个整数 $n$（$3 \\le n \\le 10^4$）。",
    topic: "数学", tags: ["数学", "结论题"], hint: "结论：$n$ 能拆成两个或更多连续正整数之和，当且仅当 $n$ 不是 2 的幂。",
    desc: "判断 $n$ 能否表示成**两个或更多**连续正整数之和（例如 $9=4+5=2+3+4$）。能则输出 `YES`，否则输出 `NO`。",
    js: ({ n0 }) => { let v = n0; while (v % 2 === 0) v /= 2; return v > 1 ? "YES" : "NO"; },
    py: "v = n0\nwhile v % 2 == 0:\n    v //= 2\nprint(\"YES\" if v > 1 else \"NO\")",
    cpp: 'long long v=n0;while(v%2==0)v/=2;cout<<(v>1?"YES":"NO")<<"\\n";',
    c: 'long long v=n0;while(v%2==0)v/=2;printf("%s\\n",v>1?"YES":"NO");',
  },
  {
    id: "hx-factorial-mod", title: "阶乘取模", shape: "numK", cfg: { lo: 0, hi: 100000, kMin: 2, kMax: 1000000 }, inputFormat: IANK,
    topic: "数论", tags: ["循环", "取模"], hint: "从 2 乘到 $n$，每一步都对 $m$ 取模；注意 $0!=1$。",
    desc: "输出 $n!$ 对 $m$ 取模的结果（规定 $0!=1$）。",
    js: ({ n0, k }) => { let r = 1 % k; for (let i = 2n; i <= BigInt(n0); i++) r = (r * Number(i)) % k; return `${r}`; },
    py: "r = 1 % k\nfor i in range(2, n0 + 1):\n    r = r * i % k\nprint(r)",
    cpp: 'long long r=1%k;for(long long i=2;i<=n0;i++)r=r*i%k;cout<<r<<"\\n";',
    c: 'long long r=1%k,i2;for(i2=2;i2<=n0;i2++)r=r*i2%k;printf("%lld\\n",r);',
  },
  {
    id: "hx-popcount-range", title: "区间内二进制 1 的个数之和", shape: "two", cfg: { lo: 0, hi: 20000 }, inputFormat: IF2,
    topic: "位运算", tags: ["位运算"], hint: "逐个枚举区间内的整数，统计每个数的二进制表示里 1 的个数并累加。",
    desc: "设 $\\mathrm{popcount}(v)$ 表示 $v$ 的二进制表示中 1 的个数。输出 $\\sum_{v=a}^{b} \\mathrm{popcount}(v)$。",
    js: ({ a0, b0 }) => { const lo = Math.min(a0, b0), hi = Math.max(a0, b0); let s = 0; for (let v = lo; v <= hi; v++) { let x = v; while (x) { s += x & 1; x >>= 1; } } return `${s}`; },
    py: "lo = min(a0, b0)\nhi = max(a0, b0)\ns = 0\nfor v in range(lo, hi + 1):\n    s += bin(v).count(\"1\")\nprint(s)",
    cpp: 'long long lo=min(a0,b0),hi=max(a0,b0),s=0;for(long long v=lo;v<=hi;v++)s+=__builtin_popcountll(v);cout<<s<<"\\n";',
    c: 'long long lo=a0<b0?a0:b0,hi=a0<b0?b0:a0,s=0,v,x;int c2;for(v=lo;v<=hi;v++){x=v;c2=0;while(x){c2+=x&1;x>>=1;}s+=c2;}printf("%lld\\n",s);',
  },
  {
    id: "hx-bitwise-and-range", title: "区间内所有数的按位与", shape: "two", cfg: { lo: 0, hi: 20000 }, inputFormat: IF2,
    topic: "位运算", tags: ["位运算"], hint: "把所有数按位与，只要某一位上出现过 0，最终结果的这一位就是 0。",
    desc: "输出从 $\\min(a,b)$ 到 $\\max(a,b)$ 之间所有整数（含两端）的按位与结果。",
    js: ({ a0, b0 }) => { const lo = Math.min(a0, b0), hi = Math.max(a0, b0); let r = lo; for (let v = lo + 1; v <= hi; v++) r &= v; return `${r}`; },
    py: "lo = min(a0, b0)\nhi = max(a0, b0)\nr = lo\nfor v in range(lo + 1, hi + 1):\n    r &= v\nprint(r)",
    cpp: 'long long lo=min(a0,b0),hi=max(a0,b0),r=lo;for(long long v=lo+1;v<=hi;v++)r&=v;cout<<r<<"\\n";',
    c: 'long long lo=a0<b0?a0:b0,hi=a0<b0?b0:a0,r=lo,v;for(v=lo+1;v<=hi;v++)r&=v;printf("%lld\\n",r);',
  },
  {
    id: "hx-single-number-3", title: "唯一出现一次的数字（其余都出现三次）", shape: "arrThree", cfg: {}, inputFormat: "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$，其中恰好有一个数出现 1 次，其余每个数都出现 3 次。",
    topic: "位运算", tags: ["位运算"], hint: "统计每一位上 1 的个数，对 3 取模，余数就是答案在该位上的值。",
    desc: "数组中恰好有一个数只出现 1 次，其余每个数都恰好出现 3 次。输出那个只出现 1 次的数。",
    js: ({ a }) => { let r = 0; for (let bit = 0; bit < 20; bit++) { let c = 0; for (const x of a) if ((x >> bit) & 1) c++; if (c % 3) r |= 1 << bit; } return `${r}`; },
    py: "r = 0\nfor bit in range(20):\n    c = 0\n    for x in a:\n        if (x >> bit) & 1:\n            c += 1\n    if c % 3:\n        r |= 1 << bit\nprint(r)",
    cpp: 'long long r=0;for(int b=0;b<20;b++){int c=0;for(auto x:a)if((x>>b)&1)c++;if(c%3)r|=1LL<<b;}cout<<r<<"\\n";',
    c: 'long long r=0;int b,c2;for(b=0;b<20;b++){c2=0;for(i=0;i<n;i++)if((a[i]>>b)&1)c2++;if(c2%3)r|=1LL<<b;}printf("%lld\\n",r);',
  },
  {
    id: "hx-hamming-total", title: "所有数对的汉明距离之和", shape: "arr", cfg: { nMin: 4, nMax: 12, lo: 0, hi: 255 }, inputFormat: IFA,
    topic: "位运算", tags: ["位运算"], hint: "枚举所有下标对 $(i,j)$，把两个数的异或结果中 1 的个数累加起来。",
    desc: "输出数组中所有**下标对** $(i,j)$（$i<j$）的汉明距离之和，其中汉明距离是两个数二进制表示中不同位的个数。",
    js: ({ a }) => { let s = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) { let x = a[i] ^ a[j]; while (x) { s += x & 1; x >>= 1; } } return `${s}`; },
    py: "s = 0\nfor i in range(n):\n    for j in range(i + 1, n):\n        s += bin(a[i] ^ a[j]).count(\"1\")\nprint(s)",
    cpp: 'long long s=0;for(int z=0;z<n;z++)for(int w=z+1;w<n;w++)s+=__builtin_popcountll(a[z]^a[w]);cout<<s<<"\\n";',
    c: 'long long s=0,x;int z2,w2,c2;for(z2=0;z2<n;z2++)for(w2=z2+1;w2<n;w2++){x=a[z2]^a[w2];while(x){c2=x&1;s+=c2;x>>=1;}}printf("%lld\\n",s);',
  },
  {
    id: "hx-robot-cycle", title: "机器人能否回到原点", shape: "str", cfg: { nMin: 4, nMax: 16, alpha: "LRUD" }, inputFormat: "一行，一个只由 `L`/`R`/`U`/`D` 组成的字符串 $s$。",
    topic: "模拟", tags: ["模拟"], hint: "分别统计左右移动和上下移动的次数是否互相抵消。",
    desc: "机器人从原点 $(0,0)$ 出发，`L`/`R`/`U`/`D` 分别表示向左、向右、向上、向下移动一格。判断执行完整条指令后机器人是否回到原点：是则输出 `YES`，否则输出 `NO`。",
    js: ({ s }) => { let x = 0, y = 0; for (const ch of s) { if (ch === "L") x--; else if (ch === "R") x++; else if (ch === "U") y++; else y--; } return x === 0 && y === 0 ? "YES" : "NO"; },
    py: "x = 0\ny = 0\nfor ch in s:\n    if ch == 'L':\n        x -= 1\n    elif ch == 'R':\n        x += 1\n    elif ch == 'U':\n        y += 1\n    else:\n        y -= 1\nprint(\"YES\" if x == 0 and y == 0 else \"NO\")",
    cpp: 'long long x=0,y=0;for(char ch:s){if(ch==\'L\')x--;else if(ch==\'R\')x++;else if(ch==\'U\')y++;else y--;}cout<<((x==0&&y==0)?"YES":"NO")<<"\\n";',
    c: 'long long x=0,y=0;for(i=0;i<n;i++){char ch=s[i];if(ch==\'L\')x--;else if(ch==\'R\')x++;else if(ch==\'U\')y++;else y--;}printf("%s\\n",(x==0&&y==0)?"YES":"NO");',
  },
  {
    id: "hx-roman-to-int", title: "罗马数字转整数（简化规则）", shape: "str", cfg: { nMin: 3, nMax: 12, alpha: "IVXLCDM" }, inputFormat: "一行，一个只由 `I`/`V`/`X`/`L`/`C`/`D`/`M` 组成、长度不超过 12 的字符串 $s$。",
    topic: "模拟", tags: ["模拟", "字符串"], hint: "从左往右扫描，如果当前字符代表的值比下一个字符小，就减去当前值，否则加上当前值。",
    desc: "给定一个由 `I`(1)、`V`(5)、`X`(10)、`L`(50)、`C`(100)、`D`(500)、`M`(1000) 组成的字符串，按「当前字符的值小于后一个字符的值时相减，否则相加」的规则计算并输出它的数值。",
    js: ({ s }) => { const V = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let r = 0; for (let i = 0; i < s.length; i++) { const v = V[s[i]]; if (i + 1 < s.length && v < V[s[i + 1]]) r -= v; else r += v; } return `${r}`; },
    py: "V = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}\nr = 0\nfor i in range(len(s)):\n    if i + 1 < len(s) and V[s[i]] < V[s[i + 1]]:\n        r -= V[s[i]]\n    else:\n        r += V[s[i]]\nprint(r)",
    cpp: 'int T[256]={0};T[\'I\']=1;T[\'V\']=5;T[\'X\']=10;T[\'L\']=50;T[\'C\']=100;T[\'D\']=500;T[\'M\']=1000;long long r=0;for(size_t z=0;z<s.size();z++){long long v=T[(unsigned char)s[z]];if(z+1<s.size()&&v<T[(unsigned char)s[z+1]])r-=v;else r+=v;}cout<<r<<"\\n";',
    c: 'int T[256];int z2;for(z2=0;z2<256;z2++)T[z2]=0;T[\'I\']=1;T[\'V\']=5;T[\'X\']=10;T[\'L\']=50;T[\'C\']=100;T[\'D\']=500;T[\'M\']=1000;long long r=0,v,vn;for(z2=0;z2<n;z2++){v=T[(unsigned char)s[z2]];vn=(z2+1<n)?T[(unsigned char)s[z2+1]]:0;if(z2+1<n&&v<vn)r-=v;else r+=v;}printf("%lld\\n",r);',
  },
  {
    id: "hx-excel-title", title: "整数转 Excel 表列名称", shape: "num", cfg: { lo: 1, hi: 1000000, demoLo: 1, demoHi: 60 }, inputFormat: "一行，一个整数 $n$（$1 \\le n \\le 1000000$）。",
    topic: "模拟", tags: ["进制转换", "模拟"], hint: "这是「双射 26 进制」：每次先把 $n$ 减 1，再对 26 取余映射到 A~Z，最后整除 26，直到 $n$ 变成 0。",
    desc: "把整数 $n$ 转换成 Excel 的表列名称并输出（$1 \\to \\mathrm{A}$，$26 \\to \\mathrm{Z}$，$27 \\to \\mathrm{AA}$，$52 \\to \\mathrm{AZ}$，$703 \\to \\mathrm{AAA}$）。",
    js: ({ n0 }) => { let n = n0, o = ""; while (n > 0) { n -= 1; o = String.fromCharCode(65 + (n % 26)) + o; n = Math.floor(n / 26); } return o; },
    py: "n = n0\no = \"\"\nwhile n > 0:\n    n -= 1\n    o = chr(65 + n % 26) + o\n    n //= 26\nprint(o)",
    cpp: 'long long n=n0;string o;while(n>0){n--;o=char(65+n%26)+o;n/=26;}cout<<o<<"\\n";',
    c: 'long long n=n0;char o[64];int m=0,z;while(n>0){n--;o[m++]=(char)(65+n%26);n/=26;}for(z=m-1;z>=0;z--)putchar(o[z]);putchar(10);' },
  {
    id: "hx-gas-station", title: "加油站问题", shape: "arr", cfg: { nMin: 4, nMax: 12, lo: -5, hi: 8 }, inputFormat: IFA,
    topic: "贪心", tags: ["贪心"], hint: "一次遍历：如果油箱中途变负，说明前面这些位置都不能作为起点，把起点设为下一个位置。若总油量非负，这个起点就是答案。",
    desc: "环形路线上有 $n$ 个加油站，第 $i$ 个位置的净收益为 $a_i$（正数表示加油多于消耗，负数表示消耗多于加油）。油箱初始为空，问从哪个位置出发可以绕环一圈回到起点？输出可以出发的**最小编号**（从 0 开始）；若不存在输出 -1。",
    js: ({ a }) => { const n = a.length; let total = 0, start = 0, tank = 0; for (let i = 0; i < n; i++) { total += a[i]; tank += a[i]; if (tank < 0) { start = i + 1; tank = 0; } } return total >= 0 && start < n ? `${start}` : "-1"; },
    py: "total = 0\nstart = 0\ntank = 0\nfor i in range(n):\n    total += a[i]\n    tank += a[i]\n    if tank < 0:\n        start = i + 1\n        tank = 0\nprint(start if (total >= 0 and start < n) else -1)",
    cpp: 'long long total=0,tank=0;int start=0;for(int z=0;z<n;z++){total+=a[z];tank+=a[z];if(tank<0){start=z+1;tank=0;}}cout<<((total>=0&&start<n)?start:-1)<<"\\n";',
    c: 'long long total=0,tank=0;int start=0;for(i=0;i<n;i++){total+=a[i];tank+=a[i];if(tank<0){start=i+1;tank=0;}}printf("%d\\n",(total>=0&&start<n)?start:-1);',
  },
  {
    id: "hx-candy", title: "分发糖果最少数量", shape: "arr", cfg: { nMin: 4, nMax: 14, lo: 0, hi: 20 }, inputFormat: "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$，表示每个孩子的评分。",
    topic: "贪心", tags: ["贪心", "两次遍历"], hint: "从左往右满足「评分更高者糖更多」，再从右往左补一次，最后求和。",
    desc: "有 $n$ 个孩子排成一排，每个孩子有一个评分 $a_i$。每个孩子至少分到 1 颗糖，且相邻两个孩子中评分更高的那个必须分到更多的糖。求最少需要多少颗糖。",
    js: ({ a }) => { const n = a.length, c = new Array(n).fill(1); for (let i = 1; i < n; i++) if (a[i] > a[i - 1]) c[i] = c[i - 1] + 1; for (let i = n - 2; i >= 0; i--) if (a[i] > a[i + 1] && c[i] <= c[i + 1]) c[i] = c[i + 1] + 1; return `${c.reduce((s, x) => s + x, 0)}`; },
    py: "c = [1] * n\nfor i in range(1, n):\n    if a[i] > a[i - 1]:\n        c[i] = c[i - 1] + 1\nfor i in range(n - 2, -1, -1):\n    if a[i] > a[i + 1] and c[i] <= c[i + 1]:\n        c[i] = c[i + 1] + 1\nprint(sum(c))",
    cpp: 'vector<long long>c(n,1);for(int z=1;z<n;z++)if(a[z]>a[z-1])c[z]=c[z-1]+1;for(int z=n-2;z>=0;z--)if(a[z]>a[z+1]&&c[z]<=c[z+1])c[z]=c[z+1]+1;long long s=0;for(auto x:c)s+=x;cout<<s<<"\\n";',
    c: 'static long long c2[500005];long long s=0;for(i=0;i<n;i++)c2[i]=1;for(i=1;i<n;i++)if(a[i]>a[i-1])c2[i]=c2[i-1]+1;for(i=n-2;i>=0;i--)if(a[i]>a[i+1]&&c2[i]<=c2[i+1])c2[i]=c2[i+1]+1;for(i=0;i<n;i++)s+=c2[i];printf("%lld\\n",s);',
  },
  {
    id: "hx-merge-intervals", title: "合并区间后输出", shape: "intervals", cfg: { tMin: 3, tMax: 8, lo: 1, hi: 20 }, inputFormat: IFI, outputFormat: OFL,
    topic: "区间", tags: ["排序", "区间"], hint: "先按左端点排序，然后依次合并：新区间的左端点不大于当前区间右端点时就能合并。",
    desc: "给出 $T$ 个闭区间 $[l_i, r_i]$。把所有**有重叠或相接**的区间合并起来，把合并后的区间按左端点从小到大输出，每行一个区间（左右端点用空格隔开）。",
    js: ({ segs }) => { const s = [...segs].sort((x, y) => x[0] - y[0]); const o = []; for (const [l, r] of s) { if (o.length && l <= o[o.length - 1][1]) o[o.length - 1][1] = Math.max(o[o.length - 1][1], r); else o.push([l, r]); } return o.map(([l, r]) => `${l} ${r}`).join("\n"); },
    py: "s = sorted(segs)\no = []\nfor l, r in s:\n    if o and l <= o[-1][1]:\n        if r > o[-1][1]:\n            o[-1][1] = r\n    else:\n        o.append([l, r])\nfor l, r in o:\n    print(l, r)",
    cpp: 'sort(segs.begin(),segs.end());vector<pair<int,int>>o;for(auto&sg:segs){if(!o.empty()&&sg.first<=o.back().second)o.back().second=max(o.back().second,sg.second);else o.push_back(sg);}for(auto&sg:o)cout<<sg.first<<" "<<sg.second<<"\\n";',
    c: 'int a2,b2,cl,cr;long long tl,tr;for(a2=0;a2<T;a2++)for(b2=a2+1;b2<T;b2++)if(sl[b2]<sl[a2]){tl=sl[a2];sl[a2]=sl[b2];sl[b2]=(int)tl;tr=sr[a2];sr[a2]=sr[b2];sr[b2]=(int)tr;}cl=sl[0];cr=sr[0];for(a2=0;a2<T;a2++){if(sl[a2]<=cr){if(sr[a2]>cr)cr=sr[a2];}else{printf("%d %d\\n",cl,cr);cl=sl[a2];cr=sr[a2];}}printf("%d %d\\n",cl,cr);',
  },
  {
    id: "hx-meeting-rooms", title: "会议室最少数量", shape: "intervals", cfg: { tMin: 3, tMax: 8, lo: 1, hi: 20 }, inputFormat: IFI,
    topic: "区间", tags: ["区间", "扫描线"], hint: "把所有左端点看成 +1、右端点看成 -1，排序后做一次扫描，扫描过程中同时进行会议数的最大值就是答案。",
    desc: "有 $T$ 个会议，第 $i$ 个会议占用时间区间 $[l_i, r_i)$（一个会议结束的时刻可以立刻开始下一个会议）。至少需要多少间会议室？输出这个最小数量。",
    js: ({ segs }) => { const ev = []; for (const [l, r] of segs) { ev.push([l, 1]); ev.push([r, -1]); } ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]); let cur = 0, best = 0; for (const [, d] of ev) { cur += d; best = Math.max(best, cur); } return `${best}`; },
    py: "ev = []\nfor l, r in segs:\n    ev.append((l, 1))\n    ev.append((r, -1))\nev.sort()\ncur = 0\nbest = 0\nfor _, d in ev:\n    cur += d\n    if cur > best:\n        best = cur\nprint(best)",
    cpp: 'vector<pair<int,int>>ev;for(auto&sg:segs){ev.push_back({sg.first,1});ev.push_back({sg.second,-1});}sort(ev.begin(),ev.end());int cur=0,best=0;for(auto&e:ev){cur+=e.second;best=max(best,cur);}cout<<best<<"\\n";',
    c: 'int a2,b2,c2,best=0,maxr=0;for(b2=0;b2<T;b2++)if(sr[b2]>maxr)maxr=sr[b2];for(a2=0;a2<maxr;a2++){c2=0;for(b2=0;b2<T;b2++)if(sl[b2]<=a2&&a2<sr[b2])c2++;if(c2>best)best=c2;}printf("%d\\n",best);',
  },
  {
    id: "hx-boat-rescue", title: "救生艇最少数量", shape: "arrK", cfg: { nMin: 3, nMax: 12, lo: 1, hi: 30, kMin: 20, kMax: 60 }, inputFormat: "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$，表示每个人的体重；第三行一个整数 $k$，表示每艘救生艇的载重上限。",
    topic: "贪心", tags: ["贪心", "双指针"], hint: "先排序，然后让最重的人和最轻的人尝试同船，不行就让最重的人单独一船。",
    desc: "每艘救生艇最多载 2 个人，且船上所有人的体重之和不能超过 $k$（保证每个人的体重都不超过 $k$）。求最少需要多少艘救生艇。",
    js: ({ a, k }) => { const b = [...a].sort((x, y) => x - y); let i = 0, j = b.length - 1, c = 0; while (i <= j) { if (b[i] + b[j] <= k) i++; j--; c++; } return `${c}`; },
    py: "b = sorted(a)\ni = 0\nj = n - 1\nc = 0\nwhile i <= j:\n    if b[i] + b[j] <= k:\n        i += 1\n    j -= 1\n    c += 1\nprint(c)",
    cpp: 'vector<long long>b=a;sort(b.begin(),b.end());int z=0,w=n-1;long long c=0;while(z<=w){if(b[z]+b[w]<=k)z++;w--;c++;}cout<<c<<"\\n";',
    c: COPY + SORT_ASC + 'int z2=0,w2=n-1;long long c=0;while(z2<=w2){if(b2[z2]+b2[w2]<=k)z2++;w2--;c++;}printf("%lld\\n",c);',
  },
  {
    id: "hx-partition-labels", title: "划分字母区间", shape: "str", cfg: { nMin: 4, nMax: 16, alpha: "abcd" }, inputFormat: IFS,
    topic: "贪心", tags: ["贪心", "字符串"], hint: "先记录每个字母最后出现的位置；扫描时不断把当前区间的右边界扩展到已出现字母的最远位置，当走到右边界时就得到一段。",
    desc: "把字符串 $s$ 划分成尽量少的若干段，要求**同一个字母最多只出现在一段里**。依次输出各段的长度，用空格隔开。",
    js: ({ s }) => { const last = {}; for (let i = 0; i < s.length; i++) last[s[i]] = i; const o = []; let st = 0, end = 0; for (let i = 0; i < s.length; i++) { end = Math.max(end, last[s[i]]); if (i === end) { o.push(end - st + 1); st = i + 1; } } return o.join(" "); },
    py: "last = {}\nfor i in range(len(s)):\n    last[s[i]] = i\no = []\nst = 0\nend = 0\nfor i in range(len(s)):\n    if last[s[i]] > end:\n        end = last[s[i]]\n    if i == end:\n        o.append(end - st + 1)\n        st = i + 1\nprint(*o)",
    cpp: 'map<char,int>last;for(int z=0;z<(int)s.size();z++)last[s[z]]=z;vector<int>o;int st=0,end=0;for(int z=0;z<(int)s.size();z++){end=max(end,last[s[z]]);if(z==end){o.push_back(end-st+1);st=z+1;}}for(size_t q=0;q<o.size();q++)cout<<o[q]<<(q+1<o.size()?" ":"\\n");',
    c: 'static int last2[256];static int o2[100005];int z2,cnt2=0,st2=0,end2=0;for(z2=0;z2<256;z2++)last2[z2]=-1;for(z2=0;z2<n;z2++)last2[(unsigned char)s[z2]]=z2;for(z2=0;z2<n;z2++){int lz=last2[(unsigned char)s[z2]];if(lz>end2)end2=lz;if(z2==end2){o2[cnt2++]=end2-st2+1;st2=z2+1;}}for(z2=0;z2<cnt2;z2++)printf("%d%c",o2[z2],z2+1<cnt2?32:10);',
  },
];

export const hard_extraFamilies = tasks("困难", ROWS);
