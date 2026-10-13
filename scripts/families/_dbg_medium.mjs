/**
 * 中等难度题族（第一部分：新增形状 + 动态规划 + 贪心/窗口）。
 */
import { SHAPES, makeFamily } from "../lib/shapes.mjs";

/* ---------- 新增输入形状 ---------- */
SHAPES.str2 = {
  py: "a = data[0]\nb = data[1]\n",
  cpp: "string a,b;cin>>a>>b;",
  c: "char a[5005],b[5005];if(scanf(\"%5000s %5000s\",a,b)!=2)return 1;int la=(int)strlen(a),lb=(int)strlen(b);(void)la;(void)lb;",
  parse: (t) => { const v = t.trim().split(/\s+/); return { a: v[0], b: v[1] }; },
  gen: (r, cfg) => {
    const alpha = cfg.alpha ?? "abc";
    const la = r.int(cfg.nMin ?? 2, cfg.nMax ?? 8);
    const lb = r.int(cfg.nMin ?? 2, cfg.nMax ?? 8);
    let a = "", b = "";
    for (let i = 0; i < la; i++) a += alpha[r.int(0, alpha.length - 1)];
    for (let i = 0; i < lb; i++) b += alpha[r.int(0, alpha.length - 1)];
    return `${a} ${b}\n`;
  },
};

SHAPES.edgesU = {
  py: "n = int(data[0])\nm = int(data[1])\nedges = [tuple(map(int, data[2 + i * 2:4 + i * 2])) for i in range(m)]\n",
  cpp: "int n,m;cin>>n>>m;vector<pair<int,int>>edges(m);for(auto&e:edges)cin>>e.first>>e.second;",
  c: "int n,m,i;static int eu[100005],ev[100005];if(scanf(\"%d %d\",&n,&m)!=2)return 1;for(i=0;i<m;i++)scanf(\"%d %d\",&eu[i],&ev[i]);",
  parse: (t) => { const v = t.trim().split(/\s+/).map(Number); const n = v[0], m = v[1]; const edges = []; for (let i = 0; i < m; i++) edges.push([v[2 + i * 2], v[3 + i * 2]]); return { n, m, edges }; },
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 3, cfg.nMax ?? 8);
    const m = r.int(n - 1, Math.min(cfg.mMax ?? 12, (n * (n - 1)) / 2));
    const set = new Set();
    const edges = [];
    for (let v = 2; v <= n; v++) { const u = r.int(1, v - 1); set.add(`${u}-${v}`); edges.push([u, v]); }
    while (edges.length < m) {
      const u = r.int(1, n), v = r.int(1, n);
      if (u === v) continue;
      const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (set.has(key)) continue;
      set.add(key); edges.push([u, v]);
    }
    return `${n} ${edges.length}\n${edges.map((e) => e.join(" ")).join("\n")}\n`;
  },
};

SHAPES.edgesW = {
  py: "n = int(data[0])\nm = int(data[1])\nedges = [tuple(map(int, data[2 + i * 3:5 + i * 3])) for i in range(m)]\n",
  cpp: "int n,m;cin>>n>>m;vector<array<int,3>>edges(m);for(auto&e:edges)cin>>e[0]>>e[1]>>e[2];",
  c: "int n,m,i;static int eu[100005],ev[100005],ew[100005];if(scanf(\"%d %d\",&n,&m)!=2)return 1;for(i=0;i<m;i++)scanf(\"%d %d %d\",&eu[i],&ev[i],&ew[i]);",
  parse: (t) => { const v = t.trim().split(/\s+/).map(Number); const n = v[0], m = v[1]; const edges = []; for (let i = 0; i < m; i++) edges.push([v[2 + i * 3], v[3 + i * 3], v[4 + i * 3]]); return { n, m, edges }; },
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 3, cfg.nMax ?? 8);
    const set = new Set();
    const edges = [];
    for (let v = 2; v <= n; v++) { const u = r.int(1, v - 1); set.add(`${u}-${v}`); edges.push([u, v, r.int(1, cfg.wMax ?? 20)]); }
    const extra = r.int(0, 3);
    for (let k = 0; k < extra; k++) {
      const u = r.int(1, n), v = r.int(1, n);
      if (u === v) continue;
      const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (set.has(key)) continue;
      set.add(key); edges.push([u, v, r.int(1, cfg.wMax ?? 20)]);
    }
    return `${n} ${edges.length}\n${edges.map((e) => e.join(" ")).join("\n")}\n`;
  },
};

SHAPES.treeFather = {
  py: "n = int(data[0])\nf = [int(x) for x in data[1:1 + n]]\n",
  cpp: "int n;cin>>n;vector<int>f(n);for(auto&x:f)cin>>x;",
  c: "int n,i;static int f[200005];if(scanf(\"%d\",&n)!=1)return 1;for(i=0;i<n;i++)scanf(\"%d\",&f[i]);",
  parse: (t) => { const v = t.trim().split(/\s+/).map(Number); const n = v[0]; return { n, f: v.slice(1, 1 + n) }; },
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 3, cfg.nMax ?? 10);
    const f = [0];
    for (let i = 1; i < n; i++) f.push(r.int(1, i));
    return `${n}\n${f.join(" ")}\n`;
  },
};

const IF = {
  arr: "第一行一个整数 $n$（$1 \\le n \\le 10^5$）。第二行 $n$ 个整数 $a_i$。",
  arrK: "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$；第三行一个整数 $k$。",
  num: "一行，一个整数 $n$。",
  numK: "一行，两个整数 $n$ 和 $k$，用空格隔开。",
  str: "一行，一个字符串 $s$。",
  str2: "一行，两个字符串 $a$ 和 $b$，用空格隔开。",
  matrix: "第一行两个整数 $n, m$，接下来 $n$ 行每行 $m$ 个整数。",
  pairsT: "第一行一个整数 $T$；接下来 $T$ 行，每行两个整数。",
  edgesU: "第一行两个整数 $n, m$（点数与边数，节点编号 $1 \\sim n$）；接下来 $m$ 行每行两个整数 $u, v$，表示一条无向边。",
  edgesW: "第一行两个整数 $n, m$；接下来 $m$ 行每行三个整数 $u, v, w$，表示一条权值为 $w$ 的无向边。",
  treeFather: "第一行一个整数 $n$；第二行 $n$ 个整数表示每个节点的父节点（节点 $1$ 的父节点为 $0$，其余满足父节点编号小于自身）。",
};
const OF = "一行，输出答案。";

export function expand({ shape, ops, difficulty, topic, tags, hint, variants, baseCfg = {} }) {
  return ops.flatMap((op) =>
    variants.map((v, i) =>
      makeFamily({
        shape, op, difficulty, topic, tags, hint,
        cfg: (() => {
          const base = Object.assign({}, op.cfg, baseCfg);
          let cfg = v.cfgFn ? v.cfgFn(base) : Object.assign({}, base, v.cfg);
          if (op.fixedCfg) cfg = Object.assign({}, base);
          if (op.noNegative) cfg = Object.assign({}, cfg, { lo: Math.max(0, cfg.lo ?? 0) });
          return cfg;
        })(),
        variant: i + 1,
        title: v.suffix ? `${op.title}${v.suffix}` : op.title,
        statement: () => op.desc,
        inputFormat: op.inputFormat ?? IF[shape] ?? "见题目描述。",
        outputFormat: op.outputFormat ?? OF,
        timeLimitMs: op.timeLimitMs ?? 1500,
      })
    )
  );
}

/** 规模分层变体（同一题型的四种数据规模） */
export const V4 = [
  { suffix: "", cfgFn: (b) => ({ ...b }) },
  { suffix: " II", cfgFn: (b) => ({ ...b, nMax: Math.min(60, Math.round((b.nMax ?? 8) * 3)), hi: Math.round((b.hi ?? 100) * 5) }) },
  { suffix: " III（大数据）", cfgFn: (b) => ({ ...b, nMax: Math.min(400, Math.round((b.nMax ?? 8) * 10)), hi: Math.round((b.hi ?? 100) * 50) }) },
  { suffix: "（极限数据）", cfgFn: (b) => ({ ...b, nMax: Math.min(1000, Math.round((b.nMax ?? 8) * 25)), hi: Math.round((b.hi ?? 100) * 200) }) },
];

const DP_OPS = [
  { id: "dp-stairs", title: "爬楼梯", desc: "一次可以走 $1$ 级或 $2$ 级台阶，问走到第 $n$ 级共有多少种不同的走法。", cfg: { lo: 1, hi: 40 },
    js: ({ n0 }) => { let x = 1, y = 1; for (let i = 0; i < n0; i++) [x, y] = [y, x + y]; return String(x); },
    py: "x = y = 1\nfor _ in range(n0):\n    x, y = y, x + y\nprint(x)", cpp: 'long long x=1,y=1;for(int i=0;i<n0;i++){long long t=x+y;x=y;y=t;}cout<<x<<"\\n";',
    c: 'long long x=1,y=1,t;for(long long i=0;i<n0;i++){t=x+y;x=y;y=t;}printf("%lld\\n",x);' },
  { id: "dp-rob", title: "打家劫舍", desc: "一排房屋中每间有若干现金 $a_i$，不能同时取相邻两间，问最多能取到多少钱。", cfg: { lo: 0, hi: 100 },
    js: ({ a }) => { let p = 0, q = 0; for (const x of a) { const t = Math.max(q, p + x); p = q; q = t; } return String(q); },
    py: "p = q = 0\nfor x in a:\n    p, q = q, max(q, p + x)\nprint(q)", cpp: 'long long p=0,q=0;for(auto x:a){long long t=max(q,p+x);p=q;q=t;}cout<<q<<"\\n";',
    c: 'long long p=0,q=0,t;for(i=0;i<n;i++){t=q>p+a[i]?q:p+a[i];p=q;q=t;}printf("%lld\\n",q);' },
  { id: "dp-max-subarray", title: "最大子数组和", desc: "在数组中找出一段**连续**子数组，使其元素之和最大，输出这个最大值（子数组非空）。", cfg: { lo: -50, hi: 50 },
    js: ({ a }) => { let best = -Infinity, cur = 0; for (const x of a) { cur = Math.max(x, cur + x); best = Math.max(best, cur); } return String(best); },
    py: "best = cur = a[0]\nfor x in a[1:]:\n    cur = max(x, cur + x)\n    best = max(best, cur)\nprint(best)", cpp: 'long long best=a[0],cur=a[0];for(size_t i=1;i<a.size();i++){cur=max(a[i],cur+a[i]);best=max(best,cur);}cout<<best<<"\\n";',
    c: 'long long best=a[0],cur=a[0];for(i=1;i<n;i++){cur=a[i]>cur+a[i]?a[i]:cur+a[i];if(cur>best)best=cur;}printf("%lld\\n",best);' },
  { id: "dp-max-product", fixedCfg: true, title: "最大乘积子数组", desc: "找出一段连续子数组，使其元素乘积最大，输出这个最大值（子数组非空，元素可能为负）。", cfg: { lo: -3, hi: 3, nMax: 10 },
    js: ({ a }) => { let mx = a[0], mn = a[0], best = a[0]; for (let i = 1; i < a.length; i++) { const c = [a[i], mx * a[i], mn * a[i]]; mx = Math.max(...c); mn = Math.min(...c); best = Math.max(best, mx); } return String(best); },
    py: "mx = mn = best = a[0]\nfor x in a[1:]:\n    mx, mn, best = max(x, mx * x, mn * x), min(x, mx * x, mn * x), max(best, max(x, mx * x, mn * x))\nprint(best)",
    cpp: 'long long mx=a[0],mn=a[0],best=a[0];for(size_t i=1;i<a.size();i++){long long p1=mx*a[i],p2=mn*a[i];mx=max(a[i],max(p1,p2));mn=min(a[i],min(p1,p2));best=max(best,mx);}cout<<best<<"\\n";',
    c: 'long long mx=a[0],mn=a[0],best=a[0];for(i=1;i<n;i++){long long p1=mx*a[i],p2=mn*a[i];long long t1=a[i]>p1?a[i]:p1;t1=t1>p2?t1:p2;long long t2=a[i]<p1?a[i]:p1;t2=t2<p2?t2:p2;mx=t1;mn=t2;if(mx>best)best=mx;}printf("%lld\\n",best);' },
  { id: "dp-coin", title: "零钱兑换", desc: "给定若干种硬币面值和目标金额 $k$，每种硬币可以使用任意多次，求凑出该金额所需的**最少硬币数**；若无法凑出则输出 `-1`。", cfg: { lo: 1, hi: 9, nMax: 4, kMin: 1, kMax: 40 },
    js: ({ a, k }) => { const dp = new Array(k + 1).fill(Infinity); dp[0] = 0; for (let v = 1; v <= k; v++) for (const c of a) if (c <= v && dp[v - c] + 1 < dp[v]) dp[v] = dp[v - c] + 1; return dp[k] === Infinity ? "-1" : String(dp[k]); },
    py: "INF = float(\"inf\")\ndp = [0] + [INF] * k\nfor v in range(1, k + 1):\n    for c in a:\n        if c <= v and dp[v - c] + 1 < dp[v]:\n            dp[v] = dp[v - c] + 1\nprint(-1 if dp[k] == INF else int(dp[k]))",
    cpp: 'vector<long long>dp(k+1,LLONG_MAX);dp[0]=0;for(long long v=1;v<=k;v++)for(auto c:a)if(c<=v&&dp[v-c]!=LLONG_MAX&&dp[v-c]+1<dp[v])dp[v]=dp[v-c]+1;cout<<(dp[k]==LLONG_MAX?-1:dp[k])<<"\\n";',
    c: 'static long long dp[100005];long long v;int z;for(v=0;v<=k;v++)dp[v]=1000000000;dp[0]=0;for(v=1;v<=k;v++)for(z=0;z<n;z++)if(a[z]<=v&&dp[v-a[z]]+1<dp[v])dp[v]=dp[v-a[z]]+1;printf("%lld\\n",dp[k]>=1000000000?-1:dp[k]);', shape: "arrK" },
  { id: "dp-knapsack", title: "0/1 背包（最大装载重量）", desc: "有 $n$ 件物品，第 $i$ 件重量为 $a_i$，背包容量为 $k$，每件物品最多选一次，求能装下的最大总重量。", cfg: { lo: 1, hi: 30, nMax: 6, kMin: 5, kMax: 60 },
    js: ({ a, k }) => { const dp = new Array(k + 1).fill(0); for (const w of a) for (let j = k; j >= w; j--) dp[j] = Math.max(dp[j], dp[j - w] + w); return String(dp[k]); },
    py: "dp = [0] * (k + 1)\nfor w in a:\n    for j in range(k, w - 1, -1):\n        dp[j] = max(dp[j], dp[j - w] + w)\nprint(dp[k])",
    cpp: 'vector<long long>dp(k+1,0);for(auto w:a)for(long long j=k;j>=w;j--)dp[j]=max(dp[j],dp[j-w]+w);cout<<dp[k]<<"\\n";',
    c: 'static long long dp[100005];long long j;int z;for(j=0;j<=k;j++)dp[j]=0;for(z=0;z<n;z++)for(j=k;j>=a[z];j--){long long t=dp[j-a[z]]+a[z];if(t>dp[j])dp[j]=t;}printf("%lld\\n",dp[k]);', shape: "arrK" },
  { id: "dp-lis", title: "最长上升子序列", desc: "求数组中最长的**严格上升**子序列的长度（子序列可以不连续）。", cfg: { nMax: 10, lo: 1, hi: 20 },
    js: ({ a }) => { const d = []; for (const x of a) { let lo = 0, hi = d.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (d[mid] < x) lo = mid + 1; else hi = mid; } d[lo] = x; } return String(d.length); },
    py: "import bisect\nd = []\nfor x in a:\n    i = bisect.bisect_left(d, x)\n    if i == len(d):\n        d.append(x)\n    else:\n        d[i] = x\nprint(len(d))", cpp: 'vector<long long>d;for(auto x:a){auto it=lower_bound(d.begin(),d.end(),x);if(it==d.end())d.push_back(x);else *it=x;}cout<<d.size()<<"\\n";',
    c: 'static long long d[200005];int len2=0;for(i=0;i<n;i++){int lo2=0,hi2=len2;while(lo2<hi2){int mid=(lo2+hi2)/2;if(d[mid]<a[i])lo2=mid+1;else hi2=mid;}d[lo2]=a[i];if(lo2==len2)len2++;}printf("%d\\n",len2);' },
  { id: "dp-lcs", title: "最长公共子序列", desc: "求两个字符串 $a$ 与 $b$ 的最长公共子序列的长度。", cfg: { nMin: 2, nMax: 8, alpha: "abc" },
    js: ({ a, b }) => { const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0)); for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]); return String(dp[n][m]); },
    py: "n, m = len(a), len(b)\ndp = [[0] * (m + 1) for _ in range(n + 1)]\nfor i in range(1, n + 1):\n    for j in range(1, m + 1):\n        dp[i][j] = dp[i-1][j-1] + 1 if a[i-1] == b[j-1] else max(dp[i-1][j], dp[i][j-1])\nprint(dp[n][m])",
    cpp: 'int n2=a.size(),m2=b.size();vector<vector<int>>dp(n2+1,vector<int>(m2+1,0));for(int i=1;i<=n2;i++)for(int j=1;j<=m2;j++)dp[i][j]=a[i-1]==b[j-1]?dp[i-1][j-1]+1:max(dp[i-1][j],dp[i][j-1]);cout<<dp[n2][m2]<<"\\n";',
    c: 'static int dp[1005][1005];int i2,j2;for(i2=1;i2<=la;i2++)for(j2=1;j2<=lb;j2++)dp[i2][j2]=a[i2-1]==b[j2-1]?dp[i2-1][j2-1]+1:(dp[i2-1][j2]>dp[i2][j2-1]?dp[i2-1][j2]:dp[i2][j2-1]);printf("%d\\n",dp[la][lb]);', shape: "str2" },
  { id: "dp-edit", title: "编辑距离", desc: "每次可以插入、删除或替换一个字符，求把 $a$ 变成 $b$ 的最少操作次数。", cfg: { nMin: 2, nMax: 7, alpha: "abc" },
    js: ({ a, b }) => { const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))); for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]); return String(dp[n][m]); },
    py: "n, m = len(a), len(b)\ndp = [[i if j == 0 else (j if i == 0 else 0) for j in range(m + 1)] for i in range(n + 1)]\nfor i in range(1, n + 1):\n    for j in range(1, m + 1):\n        dp[i][j] = dp[i-1][j-1] if a[i-1] == b[j-1] else 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])\nprint(dp[n][m])",
    cpp: 'int n2=a.size(),m2=b.size();vector<vector<int>>dp(n2+1,vector<int>(m2+1,0));for(int i=0;i<=n2;i++)dp[i][0]=i;for(int j=0;j<=m2;j++)dp[0][j]=j;for(int i=1;i<=n2;i++)for(int j=1;j<=m2;j++)dp[i][j]=a[i-1]==b[j-1]?dp[i-1][j-1]:1+min(dp[i-1][j-1],min(dp[i-1][j],dp[i][j-1]));cout<<dp[n2][m2]<<"\\n";',
    c: 'static int dp[1005][1005];int i2,j2;for(i2=0;i2<=la;i2++)dp[i2][0]=i2;for(j2=0;j2<=lb;j2++)dp[0][j2]=j2;for(i2=1;i2<=la;i2++)for(j2=1;j2<=lb;j2++){if(a[i2-1]==b[j2-1])dp[i2][j2]=dp[i2-1][j2-1];else{int m1=dp[i2-1][j2-1];if(dp[i2-1][j2]<m1)m1=dp[i2-1][j2];if(dp[i2][j2-1]<m1)m1=dp[i2][j2-1];dp[i2][j2]=m1+1;}}printf("%d\\n",dp[la][lb]);', shape: "str2" },
  { id: "dp-grid", title: "最小路径和", desc: "从矩阵左上角走到右下角，每次只能向右或向下移动，求经过的数字之和的最小值。", cfg: { nMin: 2, nMax: 4, lo: 0, hi: 9 },
    js: ({ n, m, g }) => { const dp = g.map((r) => r.slice()); for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { if (i === 0 && j === 0) continue; const up = i > 0 ? dp[i - 1][j] : Infinity; const left = j > 0 ? dp[i][j - 1] : Infinity; dp[i][j] += Math.min(up, left); } return String(dp[n - 1][m - 1]); },
    py: "dp = [row[:] for row in g]\nfor i in range(n):\n    for j in range(m):\n        if i == 0 and j == 0:\n            continue\n        up = dp[i-1][j] if i > 0 else float(\"inf\")\n        left = dp[i][j-1] if j > 0 else float(\"inf\")\n        dp[i][j] += min(up, left)\nprint(dp[n-1][m-1])",
    cpp: 'vector<vector<long long>>dp=g;for(int i=0;i<n;i++)for(int j=0;j<m;j++){if(!i&&!j)continue;long long up=i?dp[i-1][j]:LLONG_MAX,lf=j?dp[i][j-1]:LLONG_MAX;dp[i][j]+=min(up,lf);}cout<<dp[n-1][m-1]<<"\\n";',
    c: 'static long long dp[505][505];int i2,j2;for(i2=0;i2<n;i2++)for(j2=0;j2<m;j2++)dp[i2][j2]=g[i2][j2];for(i2=0;i2<n;i2++)for(j2=0;j2<m;j2++){if(!i2&&!j2)continue;long long up=i2?dp[i2-1][j2]:1000000000000LL,lf=j2?dp[i2][j2-1]:1000000000000LL;dp[i2][j2]+=up<lf?up:lf;}printf("%lld\\n",dp[n-1][m-1]);', shape: "matrix" },
  { id: "dp-paths", fixedCfg: true, title: "不同路径", desc: "在 $n \\times m$ 的网格中从左上角走到右下角，每次只能向右或向下走一步，求不同的路径条数。", cfg: { lo: 1, hi: 30, kMin: 1, kMax: 20 },
    js: ({ n0, k }) => { const n = n0, m = k; const dp = Array.from({ length: n }, () => new Array(m).fill(1)); for (let i = 1; i < n; i++) for (let j = 1; j < m; j++) dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; return String(dp[n - 1][m - 1]); },
    py: "dp = [[1] * k for _ in range(n0)]\nfor i in range(1, n0):\n    for j in range(1, k):\n        dp[i][j] = dp[i-1][j] + dp[i][j-1]\nprint(dp[n0-1][k-1])",
    cpp: 'long long n2=n0,m2=k;vector<vector<long long>>dp(n2,vector<long long>(m2,1));for(long long i=1;i<n2;i++)for(long long j=1;j<m2;j++)dp[i][j]=dp[i-1][j]+dp[i][j-1];cout<<dp[n2-1][m2-1]<<"\\n";',
    c: 'static long long dp[105][105];long long i2,j2;for(i2=0;i2<n0;i2++)for(j2=0;j2<k;j2++)dp[i2][j2]=1;for(i2=1;i2<n0;i2++)for(j2=1;j2<k;j2++)dp[i2][j2]=dp[i2-1][j2]+dp[i2][j2-1];printf("%lld\\n",dp[n0-1][k-1]);', shape: "numK" },
  { id: "dp-subset", fixedCfg: true, title: "分割等和子集", desc: "判断能否把数组分成两个子集，使两部分元素之和相等。可以则输出 `YES`，否则输出 `NO`。", cfg: { lo: 1, hi: 20, nMax: 8 },
    js: ({ a }) => { const s = a.reduce((x, y) => x + y, 0); if (s % 2) return "NO"; const t = s / 2; const dp = new Array(t + 1).fill(false); dp[0] = true; for (const x of a) for (let j = t; j >= x; j--) if (dp[j - x]) dp[j] = true; return dp[t] ? "YES" : "NO"; },
    py: "s = sum(a)\nif s % 2:\n    print(\"NO\")\nelse:\n    t = s // 2\n    dp = [False] * (t + 1)\n    dp[0] = True\n    for x in a:\n        for j in range(t, x - 1, -1):\n            if dp[j - x]:\n                dp[j] = True\n    print(\"YES\" if dp[t] else \"NO\")",
    cpp: 'long long s=accumulate(a.begin(),a.end(),0LL);if(s%2){cout<<"NO\\n";}else{long long t=s/2;vector<char>dp(t+1,0);dp[0]=1;for(auto x:a)for(long long j=t;j>=x;j--)if(dp[j-x])dp[j]=1;cout<<(dp[t]?"YES":"NO")<<"\\n";}',
    c: 'long long s=0;int z;for(i=0;i<n;i++)s+=a[i];if(s%2){printf("NO\\n");}else{long long t=s/2,j;static char dp[200005];for(j=0;j<=t;j++)dp[j]=0;dp[0]=1;for(z=0;z<n;z++)for(j=t;j>=a[z];j--)if(dp[j-a[z]])dp[j]=1;printf("%s\\n",dp[t]?"YES":"NO");}' },
];

export const mediumFamilies1 = expand({
  shape: "arr", ops: DP_OPS.filter((o) => !o.shape), difficulty: "中等",
  topic: "动态规划", tags: ["动态规划", "递推"],
  hint: "先想清楚状态和转移方程，再考虑空间优化。", variants: V4,
}).concat(
  DP_OPS.filter((o) => o.shape).flatMap((op) =>
    V4.map((v, i) => makeFamily({
      shape: op.shape, op, difficulty: "中等", topic: "动态规划", tags: ["动态规划"],
      hint: "先想清楚状态和转移方程，再考虑空间优化。",
      cfg: v.cfgFn(Object.assign({}, op.cfg)),
      variant: i + 1,
      title: v.suffix ? `${op.title}${v.suffix}` : op.title,
      statement: () => op.desc,
      inputFormat: (op.shape === "str2" ? IF.str2 : op.shape === "arrK" ? IF.arrK : IF.numK),
      outputFormat: OF,
      timeLimitMs: 1500,
    }))
  )
);

/* ---------- 新增形状（有向边 / 区间） ---------- */
SHAPES.edgesD = {
  py: "n = int(data[0])\nm = int(data[1])\nedges = [tuple(map(int, data[2 + i * 2:4 + i * 2])) for i in range(m)]\n",
  cpp: "int n,m;cin>>n>>m;vector<pair<int,int>>edges(m);for(auto&e:edges)cin>>e.first>>e.second;",
  c: "int n,m,i;static int eu[100005],ev[100005];if(scanf(\"%d %d\",&n,&m)!=2)return 1;for(i=0;i<m;i++)scanf(\"%d %d\",&eu[i],&ev[i]);",
  parse: (t) => { const v = t.trim().split(/\s+/).map(Number); const n = v[0], m = v[1]; const edges = []; for (let i = 0; i < m; i++) edges.push([v[2 + i * 2], v[3 + i * 2]]); return { n, m, edges }; },
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 3, cfg.nMax ?? 8);
    const m = r.int(cfg.mMin ?? 2, cfg.mMax ?? 10);
    const edges = [];
    for (let i = 0; i < m; i++) {
      const u = r.int(1, n);
      let v = r.int(1, n);
      if (v === u) v = (u % n) + 1;
      edges.push([u, v]);
    }
    return `${n} ${m}\n${edges.map((e) => e.join(" ")).join("\n")}\n`;
  },
};

SHAPES.intervals = {
  py: "T = int(data[0])\nsegs = [(int(data[1 + i * 2]), int(data[2 + i * 2])) for i in range(T)]\n",
  cpp: "int T;cin>>T;vector<pair<int,int>>segs(T);for(auto&s:segs)cin>>s.first>>s.second;",
  c: "int T,i2;static int sl[100005],sr[100005];if(scanf(\"%d\",&T)!=1)return 1;for(i2=0;i2<T;i2++)scanf(\"%d %d\",&sl[i2],&sr[i2]);",
  parse: (t) => { const v = t.trim().split(/\s+/).map(Number); const T = v[0]; const segs = []; for (let i = 0; i < T; i++) segs.push([v[1 + i * 2], v[2 + i * 2]]); return { T, segs }; },
  gen: (r, cfg) => {
    const T = r.int(cfg.tMin ?? 2, cfg.tMax ?? 6);
    const rows = [];
    for (let i = 0; i < T; i++) {
      const l = r.int(cfg.lo ?? 1, cfg.hi ?? 20);
      const len = r.int(1, 6);
      rows.push([l, l + len]);
    }
    return `${T}\n${rows.map((x) => x.join(" ")).join("\n")}\n`;
  },
};

/* ---------- 贪心 / 双指针 / 滑动窗口 ---------- */
const GREEDY_OPS = [
  { id: "greedy-jump", title: "跳跃游戏最少步数", desc: "数组第 $i$ 个元素表示从该位置最多可以向前跳的步数，求从起点跳到最后一个位置所需的**最少跳跃次数**（保证可以到达）。", cfg: { lo: 1, hi: 4, nMax: 8 },
    js: ({ a }) => { let jumps = 0, curEnd = 0, farthest = 0; for (let i = 0; i < a.length - 1; i++) { farthest = Math.max(farthest, i + a[i]); if (i === curEnd) { jumps++; curEnd = farthest; } } return String(jumps); },
    py: "jumps = cur = far = 0\nfor i in range(len(a) - 1):\n    far = max(far, i + a[i])\n    if i == cur:\n        jumps += 1\n        cur = far\nprint(jumps)",
    cpp: 'int jumps=0,cur=0,far=0;for(int i=0;i+1<n;i++){far=max(far,i+(int)a[i]);if(i==cur){jumps++;cur=far;}}cout<<jumps<<"\\n";',
    c: 'int jumps=0,cur=0,far=0;for(i=0;i+1<n;i++){int t=i+(int)a[i];if(t>far)far=t;if(i==cur){jumps++;cur=far;}}printf("%d\\n",jumps);' },
  { id: "greedy-stock", title: "买卖股票的最佳时机", desc: "数组第 $i$ 个数表示第 $i$ 天的股票价格，只能先买入一次再卖出一次，求能获得的最大利润（不能获得正利润时输出 0）。", cfg: { lo: 1, hi: 50, nMax: 10 },
    js: ({ a }) => { let best = 0, mn = a[0]; for (const x of a) { best = Math.max(best, x - mn); mn = Math.min(mn, x); } return String(best); },
    py: "best = 0\nmn = a[0]\nfor x in a:\n    best = max(best, x - mn)\n    mn = min(mn, x)\nprint(best)",
    cpp: 'long long best=0,mn=a[0];for(auto x:a){best=max(best,x-mn);mn=min(mn,x);}cout<<best<<"\\n";',
    c: 'long long best=0,mn=a[0];for(i=0;i<n;i++){if(a[i]-mn>best)best=a[i]-mn;if(a[i]<mn)mn=a[i];}printf("%lld\\n",best);' },
  { id: "window-max-sum", title: "长度为 k 的连续子数组最大和", desc: "给定数组和整数 $k$，求长度为 $k$ 的**连续**子数组元素之和的最大值。", cfg: { lo: -20, hi: 20, nMax: 10, kMin: 2, kMax: 5 },
    js: ({ a, k }) => { let s = 0; for (let i = 0; i < k; i++) s += a[i]; let best = s; for (let i = k; i < a.length; i++) { s += a[i] - a[i - k]; best = Math.max(best, s); } return String(best); },
    py: "s = sum(a[:k])\nbest = s\nfor i in range(k, n):\n    s += a[i] - a[i - k]\n    best = max(best, s)\nprint(best)",
    cpp: 'long long s=0;for(int i=0;i<k;i++)s+=a[i];long long best=s;for(int i=k;i<n;i++){s+=a[i]-a[i-k];best=max(best,s);}cout<<best<<"\\n";',
    c: 'long long s=0,best;for(i=0;i<k;i++)s+=a[i];best=s;for(i=k;i<n;i++){s+=a[i]-a[i-k];if(s>best)best=s;}printf("%lld\\n",best);', shape: "arrK" },
  { id: "window-longest-unique", title: "无重复字符的最长子串", desc: "求字符串 $s$ 中不含重复字符的**最长连续子串**的长度。", cfg: { nMin: 3, nMax: 10, alpha: "abc" },
    js: ({ s }) => { const last = new Map(); let best = 0, start = 0; for (let i = 0; i < s.length; i++) { if (last.has(s[i]) && last.get(s[i]) >= start) start = last.get(s[i]) + 1; last.set(s[i], i); best = Math.max(best, i - start + 1); } return String(best); },
    py: "last = {}\nbest = start = 0\nfor i, ch in enumerate(s):\n    if ch in last and last[ch] >= start:\n        start = last[ch] + 1\n    last[ch] = i\n    best = max(best, i - start + 1)\nprint(best)",
    cpp: 'unordered_map<char,int>last;int best=0,start=0;for(int i=0;i<(int)s.size();i++){auto it=last.find(s[i]);if(it!=last.end()&&it->second>=start)start=it->second+1;last[s[i]]=i;best=max(best,i-start+1);}cout<<best<<"\\n";',
    c: 'int last[256];int best=0,start=0;for(i=0;i<256;i++)last[i]=-1;for(i=0;i<n;i++){int c=(unsigned char)s[i];if(last[c]>=start)start=last[c]+1;last[c]=i;if(i-start+1>best)best=i-start+1;}printf("%d\\n",best);' , shape: "str" },
  { id: "two-sum-index", title: "两数之和（返回下标）", desc: "给定数组和目标值 $k$，找出两个下标 $i < j$（从 0 开始）使得 $a_i + a_j = k$，输出这对下标；若不存在输出 `-1 -1`。若有多组解，输出 $i$ 最小的一组。", cfg: { lo: 1, hi: 20, nMax: 8, kMin: 2, kMax: 30 },
    js: ({ a, k }) => { for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === k) return `${i} ${j}`; return "-1 -1"; },
    py: "for i in range(n):\n    for j in range(i + 1, n):\n        if a[i] + a[j] == k:\n            print(i, j)\n            raise SystemExit\nprint(-1, -1)",
    cpp: 'for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)if(a[i]+a[j]==k){cout<<i<<" "<<j<<"\\n";return 0;}cout<<"-1 -1\\n";',
    c: 'for(i=0;i<n;i++)for(int j=i+1;j<n;j++)if(a[i]+a[j]==k){printf("%d %d\\n",i,j);return 0;}printf("-1 -1\\n");', shape: "arrK", outputFormat: "一行，两个整数表示下标；若不存在则输出 `-1 -1`。" },
  { id: "three-sum-count", title: "三数之和为零的组数", desc: "统计有多少个下标三元组 $(i, j, l)$ 满足 $i < j < l$ 且 $a_i + a_j + a_l = 0$。", cfg: { lo: -10, hi: 10, nMax: 8 },
    js: ({ a }) => { let c = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) for (let l = j + 1; l < a.length; l++) if (a[i] + a[j] + a[l] === 0) c++; return String(c); },
    py: "c = 0\nfor i in range(n):\n    for j in range(i + 1, n):\n        for l in range(j + 1, n):\n            if a[i] + a[j] + a[l] == 0:\n                c += 1\nprint(c)",
    cpp: 'int c=0;for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)for(int l=j+1;l<n;l++)if(a[i]+a[j]+a[l]==0)c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=0;i<n;i++)for(int j=i+1;j<n;j++)for(int l=j+1;l<n;l++)if(a[i]+a[j]+a[l]==0)c++;printf("%d\\n",c);' },
  { id: "greedy-intervals", title: "最多不重叠区间", desc: "给定 $T$ 个闭区间 $[l, r]$，从中选出尽可能多的区间，使它们两两不重叠（前一个区间的右端点必须严格小于后一个区间的左端点），输出最多能选出的区间数。", cfg: { lo: 1, hi: 20, tMin: 2, tMax: 6 },
    js: ({ segs }) => { const s = segs.slice().sort((x, y) => x[1] - y[1]); let c = 0, last = -Infinity; for (const [l, r] of s) if (l > last) { c++; last = r; } return String(c); },
    py: "segs.sort(key=lambda x: x[1])\nc = 0\nlast = -10**18\nfor l, r in segs:\n    if l > last:\n        c += 1\n        last = r\nprint(c)",
    cpp: 'sort(segs.begin(),segs.end(),[](auto&x,auto&y){return x.second<y.second;});int c=0;long long last=LLONG_MIN;for(auto&s:segs)if(s.first>last){c++;last=s.second;}cout<<c<<"\\n";',
    c: 'for(i2=0;i2<T;i2++)for(int j2=i2+1;j2<T;j2++)if(sr[j2]<sr[i2]){int t=sr[i2];sr[i2]=sr[j2];sr[j2]=t;t=sl[i2];sl[i2]=sl[j2];sl[j2]=t;}int c=0;long long last=-1000000000000LL;for(i2=0;i2<T;i2++)if(sl[i2]>last){c++;last=sr[i2];}printf("%d\\n",c);', shape: "intervals" },
];

/* ---------- 栈与队列 ---------- */
const STACK_OPS = [
  { id: "stack-brackets", title: "括号匹配", desc: "给定只包含 `(` `)` `[` `]` 的字符串 $s$，判断括号是否合法匹配，合法输出 `YES`，否则输出 `NO`。", cfg: { nMin: 2, nMax: 8, alpha: "()[]" },
    js: ({ s }) => { const st = []; const pair = { ")": "(", "]": "[" }; for (const c of s) { if (c === "(" || c === "[") st.push(c); else if (!st.length || st.pop() !== pair[c]) return "NO"; } return st.length ? "NO" : "YES"; },
    py: "st = []\nok = True\nfor c in s:\n    if c in \"([\":\n        st.append(c)\n    else:\n        if not st or st.pop() != (\"(\" if c == \")\" else \"[\"):\n            ok = False\n            break\nprint(\"YES\" if ok and not st else \"NO\")",
    cpp: 'vector<char>st;bool ok=true;for(char c:s){if(c==40||c==91)st.push_back(c);else{if(st.empty()){ok=false;break;}char t=st.back();st.pop_back();if((c==41&&t!=40)||(c==93&&t!=91)){ok=false;break;}}}cout<<((ok&&st.empty())?"YES":"NO")<<"\\n";',
    c: 'char st[100005];int top=0,ok=1;for(i=0;i<n;i++){char c=s[i];if(c==40||c==91)st[top++]=c;else{if(!top){ok=0;break;}char t=st[--top];if((c==41&&t!=40)||(c==93&&t!=91)){ok=0;break;}}}printf("%s\\n",(ok&&!top)?"YES":"NO");' },
  { id: "stack-next-greater", title: "下一个更大元素", desc: "对每个元素，求它右侧第一个比它大的数；若不存在则输出 `-1`。把每个位置的答案用空格隔开输出。", cfg: { lo: 1, hi: 20, nMax: 10 },
    js: ({ a }) => { const res = new Array(a.length).fill(-1); const st = []; for (let i = 0; i < a.length; i++) { while (st.length && a[st[st.length - 1]] < a[i]) res[st.pop()] = a[i]; st.push(i); } return res.join(" "); },
    py: "res = [-1] * n\nst = []\nfor i in range(n):\n    while st and a[st[-1]] < a[i]:\n        res[st.pop()] = a[i]\n    st.append(i)\nprint(*res)",
    cpp: 'vector<long long>res(n,-1);vector<int>st;for(int i=0;i<n;i++){while(!st.empty()&&a[st.back()]<a[i]){res[st.back()]=a[i];st.pop_back();}st.push_back(i);}for(int i=0;i<n;i++)cout<<res[i]<<(i+1<n?" ":"\\n");',
    c: 'static long long res[500005];int st[500005],top=0;for(i=0;i<n;i++){res[i]=-1;while(top&&a[st[top-1]]<a[i]){res[st[--top]]=a[i];}st[top++]=i;}for(i=0;i<n;i++)printf("%lld%c",res[i],i+1<n?32:10);' },
  { id: "stack-daily-temp", title: "每日温度", desc: "给定每天的温度，对每一天求出至少要等多少天才会出现更高的温度；若之后都不会更高则输出 `0`。把每天的答案用空格隔开输出。", cfg: { lo: 1, hi: 30, nMax: 12 },
    js: ({ a }) => { const res = new Array(a.length).fill(0); const st = []; for (let i = 0; i < a.length; i++) { while (st.length && a[st[st.length - 1]] < a[i]) { const j = st.pop(); res[j] = i - j; } st.push(i); } return res.join(" "); },
    py: "res = [0] * n\nst = []\nfor i in range(n):\n    while st and a[st[-1]] < a[i]:\n        j = st.pop()\n        res[j] = i - j\n    st.append(i)\nprint(*res)",
    cpp: 'vector<int>res(n,0),st;for(int i=0;i<n;i++){while(!st.empty()&&a[st.back()]<a[i]){int j=st.back();st.pop_back();res[j]=i-j;}st.push_back(i);}for(int i=0;i<n;i++)cout<<res[i]<<(i+1<n?" ":"\\n");',
    c: 'static int res[500005];int st[500005],top=0;for(i=0;i<n;i++){res[i]=0;while(top&&a[st[top-1]]<a[i]){int j=st[--top];res[j]=i-j;}st[top++]=i;}for(i=0;i<n;i++)printf("%d%c",res[i],i+1<n?32:10);' },
  { id: "stack-histogram", title: "柱状图中最大的矩形", desc: "给定柱状图每根柱子的高度，求其中能够勾勒出的最大矩形面积。", cfg: { lo: 1, hi: 20, nMax: 10 },
    js: ({ a }) => { const st = []; let best = 0; const h = [...a, 0]; for (let i = 0; i < h.length; i++) { while (st.length && h[st[st.length - 1]] >= h[i]) { const height = h[st.pop()]; const left = st.length ? st[st.length - 1] : -1; best = Math.max(best, height * (i - left - 1)); } st.push(i); } return String(best); },
    py: "st = []\nbest = 0\nh = a + [0]\nfor i, x in enumerate(h):\n    while st and h[st[-1]] >= x:\n        height = h[st.pop()]\n        left = st[-1] if st else -1\n        best = max(best, height * (i - left - 1))\n    st.append(i)\nprint(best)",
    cpp: 'vector<long long>h=a;h.push_back(0);vector<int>st;long long best=0;for(int i=0;i<(int)h.size();i++){while(!st.empty()&&h[st.back()]>=h[i]){long long ht=h[st.back()];st.pop_back();int left=st.empty()?-1:st.back();best=max(best,ht*(i-left-1));}st.push_back(i);}cout<<best<<"\\n";',
    c: 'static long long h[500005];int st[500005],top=0;long long best=0;for(i=0;i<n;i++)h[i]=a[i];h[n]=0;for(i=0;i<=n;i++){while(top&&h[st[top-1]]>=h[i]){long long ht=h[st[--top]];int left=top?st[top-1]:-1;long long area=ht*(i-left-1);if(area>best)best=area;}st[top++]=i;}printf("%lld\\n",best);' },
];

export const mediumFamilies2 = [
  ...expand({ shape: "arr", ops: GREEDY_OPS.filter((o) => !o.shape), difficulty: "中等", topic: "贪心与双指针", tags: ["贪心", "双指针"], hint: "想想能不能只扫描一遍就得到答案。", variants: V4 }),
  ...expand({ shape: "arrK", ops: GREEDY_OPS.filter((o) => o.shape === "arrK"), difficulty: "中等", topic: "贪心与双指针", tags: ["滑动窗口", "哈希表"], hint: "滑动窗口 / 哈希表可以把复杂度降到线性。", variants: V4 }),
  ...expand({ shape: "str", ops: GREEDY_OPS.filter((o) => o.shape === "str"), difficulty: "中等", topic: "贪心与双指针", tags: ["滑动窗口", "字符串"], hint: "维护一个不含重复字符的窗口。", variants: V4 }),
  ...expand({ shape: "intervals", ops: GREEDY_OPS.filter((o) => o.shape === "intervals"), difficulty: "中等", topic: "贪心与双指针", tags: ["贪心", "区间"], hint: "按右端点排序后再贪心选择。", variants: V4 }),
  ...expand({ shape: "arr", ops: STACK_OPS, difficulty: "中等", topic: "栈与队列", tags: ["栈", "单调栈"], hint: "单调栈可以在 O(n) 内求出每个元素的答案。", variants: V4 }),
];



/* ---------- 图 / 树 / 位运算 / 数论 / 字符串 / 模拟 ---------- */
SHAPES.maze01 = {
  py: "n = int(data[0])\nm = int(data[1])\ng = [list(map(int, data[2 + i * m:2 + (i + 1) * m])) for i in range(n)]\n",
  cpp: "int n,m;cin>>n>>m;vector<vector<int>>g(n,vector<int>(m));for(auto&r:g)for(auto&x:r)cin>>x;",
  c: "int n,m,i,z;static int g[305][305];if(scanf(\"%d %d\",&n,&m)!=2)return 1;for(i=0;i<n;i++)for(z=0;z<m;z++)scanf(\"%d\",&g[i][z]);",
  parse: SHAPES.matrix.parse,
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 3, cfg.nMax ?? 6);
    const m = r.int(cfg.mMin ?? n, cfg.mMax ?? n);
    const g = Array.from({ length: n }, () => Array.from({ length: m }, () => (r.next() < 0.3 ? 1 : 0)));
    let x = 0, y = 0;
    g[0][0] = 0;
    while (x !== n - 1 || y !== m - 1) {
      if (x === n - 1) y++;
      else if (y === m - 1) x++;
      else if (r.next() < 0.5) x++;
      else y++;
      g[x][y] = 0;
    }
    return `${n} ${m}\n${g.map((row) => row.join(" ")).join("\n")}\n`;
  },
};

const GRAPH_OPS = [
  { id: "graph-maze", title: "迷宫最短路", desc: "在 $n \\times m$ 的网格中，`0` 表示可以通行，`1` 表示障碍。从左上角出发，每次可以上下左右移动一步，求到达右下角需要的最少步数；若无法到达输出 `-1`。", fixedCfg: true, cfg: { nMin: 3, nMax: 6 },
    js: ({ n, m, g }) => { const dist = Array.from({ length: n }, () => new Array(m).fill(-1)); const q = [[0, 0]]; dist[0][0] = 0; const dx = [1, -1, 0, 0], dy = [0, 0, 1, -1]; for (let h = 0; h < q.length; h++) { const [x, y] = q[h]; if (x === n - 1 && y === m - 1) break; for (let d = 0; d < 4; d++) { const nx = x + dx[d], ny = y + dy[d]; if (nx < 0 || ny < 0 || nx >= n || ny >= m) continue; if (g[nx][ny] === 1 || dist[nx][ny] !== -1) continue; dist[nx][ny] = dist[x][y] + 1; q.push([nx, ny]); } } return String(dist[n - 1][m - 1]); },
    py: "from collections import deque\ndist = [[-1] * m for _ in range(n)]\ndist[0][0] = 0\ndq = deque([(0, 0)])\nwhile dq:\n    x, y = dq.popleft()\n    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n        nx, ny = x + dx, y + dy\n        if 0 <= nx < n and 0 <= ny < m and g[nx][ny] == 0 and dist[nx][ny] == -1:\n            dist[nx][ny] = dist[x][y] + 1\n            dq.append((nx, ny))\nprint(dist[n-1][m-1])",
    cpp: 'vector<vector<int>>dist(n,vector<int>(m,-1));queue<pair<int,int>>q;dist[0][0]=0;q.push({0,0});int dx[4]={1,-1,0,0},dy[4]={0,0,1,-1};while(!q.empty()){auto[x,y]=q.front();q.pop();for(int d=0;d<4;d++){int nx=x+dx[d],ny=y+dy[d];if(nx<0||ny<0||nx>=n||ny>=m)continue;if(g[nx][ny]||dist[nx][ny]!=-1)continue;dist[nx][ny]=dist[x][y]+1;q.push({nx,ny});}}cout<<dist[n-1][m-1]<<"\\n";',
    c: 'static int dist[305][305];static int qx[100005],qy[100005];int head=0,tail=0,i2,j2;int dx[4]={1,-1,0,0},dy[4]={0,0,1,-1};for(i2=0;i2<n;i2++)for(j2=0;j2<m;j2++)dist[i2][j2]=-1;dist[0][0]=0;qx[tail]=0;qy[tail]=0;tail++;while(head<tail){int x=qx[head],y=qy[head];head++;for(int d=0;d<4;d++){int nx=x+dx[d],ny=y+dy[d];if(nx<0||ny<0||nx>=n||ny>=m)continue;if(g[nx][ny]||dist[nx][ny]!=-1)continue;dist[nx][ny]=dist[x][y]+1;qx[tail]=nx;qy[tail]=ny;tail++;}}printf("%d\\n",dist[n-1][m-1]);', shape: "maze01" },
  { id: "graph-components", title: "连通块个数", desc: "在 $n \\times m$ 的 `0/1` 网格中，`1` 表示陆地。上下左右相邻的陆地属于同一个连通块，求连通块的个数。", fixedCfg: true, cfg: { nMin: 3, nMax: 6 },
    js: ({ n, m, g }) => { const seen = Array.from({ length: n }, () => new Array(m).fill(false)); let c = 0; const dx = [1, -1, 0, 0], dy = [0, 0, 1, -1]; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { if (g[i][j] !== 1 || seen[i][j]) continue; c++; const st = [[i, j]]; seen[i][j] = true; while (st.length) { const [x, y] = st.pop(); for (let d = 0; d < 4; d++) { const nx = x + dx[d], ny = y + dy[d]; if (nx < 0 || ny < 0 || nx >= n || ny >= m || seen[nx][ny] || g[nx][ny] !== 1) continue; seen[nx][ny] = true; st.push([nx, ny]); } } } return String(c); },
    py: "seen = [[False] * m for _ in range(n)]\nc = 0\nfor i in range(n):\n    for j in range(m):\n        if g[i][j] == 1 and not seen[i][j]:\n            c += 1\n            st = [(i, j)]\n            seen[i][j] = True\n            while st:\n                x, y = st.pop()\n                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                    nx, ny = x + dx, y + dy\n                    if 0 <= nx < n and 0 <= ny < m and not seen[nx][ny] and g[nx][ny] == 1:\n                        seen[nx][ny] = True\n                        st.append((nx, ny))\nprint(c)",
    cpp: 'vector<vector<char>>seen(n,vector<char>(m,0));int c=0;int dx[4]={1,-1,0,0},dy[4]={0,0,1,-1};for(int i=0;i<n;i++)for(int j=0;j<m;j++){if(g[i][j]!=1||seen[i][j])continue;c++;vector<pair<int,int>>st{{i,j}};seen[i][j]=1;while(!st.empty()){auto[x,y]=st.back();st.pop_back();for(int d=0;d<4;d++){int nx=x+dx[d],ny=y+dy[d];if(nx<0||ny<0||nx>=n||ny>=m||seen[nx][ny]||g[nx][ny]!=1)continue;seen[nx][ny]=1;st.push_back({nx,ny});}}}cout<<c<<"\\n";',
    c: 'static int seen[305][305];static int sx[100005],sy[100005];int c=0,i2,j2;int dx[4]={1,-1,0,0},dy[4]={0,0,1,-1};for(i2=0;i2<n;i2++)for(j2=0;j2<m;j2++)seen[i2][j2]=0;for(i2=0;i2<n;i2++)for(j2=0;j2<m;j2++){if(g[i2][j2]!=1||seen[i2][j2])continue;c++;int top=0;sx[top]=i2;sy[top]=j2;top++;seen[i2][j2]=1;while(top){int x=sx[--top],y=sy[top];for(int d=0;d<4;d++){int nx=x+dx[d],ny=y+dy[d];if(nx<0||ny<0||nx>=n||ny>=m||seen[nx][ny]||g[nx][ny]!=1)continue;seen[nx][ny]=1;sx[top]=nx;sy[top]=ny;top++;}}}printf("%d\\n",c);', shape: "matrix" },
  { id: "graph-cycle", title: "有向图判环", desc: "给定一张有向图，判断图中是否存在环。存在环输出 `YES`，否则输出 `NO`。", cfg: { nMin: 3, nMax: 7, mMin: 2, mMax: 9 },
    js: ({ n, edges }) => { const adj = Array.from({ length: n + 1 }, () => []); const indeg = new Array(n + 1).fill(0); for (const [u, v] of edges) { adj[u].push(v); indeg[v]++; } const q = []; for (let i = 1; i <= n; i++) if (indeg[i] === 0) q.push(i); let seen = 0; for (let h = 0; h < q.length; h++) { seen++; for (const v of adj[q[h]]) if (--indeg[v] === 0) q.push(v); } return seen < n ? "YES" : "NO"; },
    py: "from collections import deque\nadj = [[] for _ in range(n + 1)]\nindeg = [0] * (n + 1)\nfor u, v in edges:\n    adj[u].append(v)\n    indeg[v] += 1\ndq = deque([i for i in range(1, n + 1) if indeg[i] == 0])\nseen = 0\nwhile dq:\n    u = dq.popleft()\n    seen += 1\n    for v in adj[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0:\n            dq.append(v)\nprint(\"YES\" if seen < n else \"NO\")",
    cpp: 'vector<vector<int>>adj(n+1);vector<int>indeg(n+1,0);for(auto&e:edges){adj[e.first].push_back(e.second);indeg[e.second]++;}queue<int>q;for(int i=1;i<=n;i++)if(!indeg[i])q.push(i);int seen=0;while(!q.empty()){int u=q.front();q.pop();seen++;for(int v:adj[u])if(--indeg[v]==0)q.push(v);}cout<<(seen<n?"YES":"NO")<<"\\n";',
    c: 'static int head[100005],nxt[200005],to[200005],cnt=0;static int indeg[100005];static int qq[100005];int head2=0,tail=0,i2;for(i2=1;i2<=n;i2++){head[i2]=-1;indeg[i2]=0;}for(i2=0;i2<m;i2++){int u=eu[i2],v=ev[i2];to[cnt]=v;nxt[cnt]=head[u];head[u]=cnt++;indeg[v]++;}for(i2=1;i2<=n;i2++)if(!indeg[i2])qq[tail++]=i2;int seen=0;while(head2<tail){int u=qq[head2++];seen++;for(int e2=head[u];e2!=-1;e2=nxt[e2]){int v=to[e2];if(--indeg[v]==0)qq[tail++]=v;}}printf("%s\\n",seen<n?"YES":"NO");', shape: "edgesD" },
  { id: "graph-bipartite", title: "二分图判定", desc: "判断给定的无向图是否为二分图：可以把所有点分成两个集合，使每条边的两个端点都属于不同集合。可以则输出 `YES`，否则输出 `NO`。", cfg: { nMin: 3, nMax: 7, mMax: 10 },
    js: ({ n, edges }) => { const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); } const color = new Array(n + 1).fill(-1); for (let s = 1; s <= n; s++) { if (color[s] !== -1) continue; color[s] = 0; const q = [s]; for (let h = 0; h < q.length; h++) { for (const v of adj[q[h]]) { if (color[v] === -1) { color[v] = color[q[h]] ^ 1; q.push(v); } else if (color[v] === color[q[h]]) return "NO"; } } } return "YES"; },
    py: "adj = [[] for _ in range(n + 1)]\nfor u, v in edges:\n    adj[u].append(v)\n    adj[v].append(u)\ncolor = [-1] * (n + 1)\nok = True\nfor s in range(1, n + 1):\n    if color[s] != -1:\n        continue\n    color[s] = 0\n    q = [s]\n    i = 0\n    while i < len(q):\n        u = q[i]\n        i += 1\n        for v in adj[u]:\n            if color[v] == -1:\n                color[v] = color[u] ^ 1\n                q.append(v)\n            elif color[v] == color[u]:\n                ok = False\nprint(\"YES\" if ok else \"NO\")",
    cpp: 'vector<vector<int>>adj(n+1);for(auto&e:edges){adj[e.first].push_back(e.second);adj[e.second].push_back(e.first);}vector<int>color(n+1,-1);bool ok=true;for(int s=1;s<=n&&ok;s++){if(color[s]!=-1)continue;color[s]=0;queue<int>q;q.push(s);while(!q.empty()&&ok){int u=q.front();q.pop();for(int v:adj[u]){if(color[v]==-1){color[v]=color[u]^1;q.push(v);}else if(color[v]==color[u]){ok=false;break;}}}}cout<<(ok?"YES":"NO")<<"\\n";',
    c: 'static int head[100005],nxt[200005],to[200005],cnt=0;static int color[100005],qq[100005];int i2;for(i2=1;i2<=n;i2++){head[i2]=-1;color[i2]=-1;}for(i2=0;i2<m;i2++){int u=eu[i2],v=ev[i2];to[cnt]=v;nxt[cnt]=head[u];head[u]=cnt++;to[cnt]=u;nxt[cnt]=head[v];head[v]=cnt++;}int ok=1;for(i2=1;i2<=n;i2++){if(color[i2]!=-1)continue;color[i2]=0;int hh=0,tt=1;qq[0]=i2;while(hh<tt){int u=qq[hh++];for(int e2=head[u];e2!=-1;e2=nxt[e2]){int v=to[e2];if(color[v]==-1){color[v]=color[u]^1;qq[tt++]=v;}else if(color[v]==color[u]){ok=0;break;}}if(!ok)break;}if(!ok)break;}printf("%s\\n",ok?"YES":"NO");', shape: "edgesU" },
  { id: "tree-height", title: "树的高度", desc: "给定一棵以节点 $1$ 为根的树（第 $i$ 个数的父节点，节点 1 的父节点为 0，其余节点的父节点编号小于自身），求这棵树的高度（根到最远叶子的边数）。", cfg: { nMin: 3, nMax: 10 },
    js: ({ n, f }) => { const dep = new Array(n + 1).fill(0); let best = 0; for (let i = 1; i <= n; i++) { if (f[i - 1] === 0) { dep[i] = 0; } else { dep[i] = dep[f[i - 1]] + 1; } best = Math.max(best, dep[i]); } return String(best); },
    py: "dep = [0] * (n + 1)\nbest = 0\nfor i in range(1, n + 1):\n    p = f[i - 1]\n    dep[i] = 0 if p == 0 else dep[p] + 1\n    best = max(best, dep[i])\nprint(best)",
    cpp: 'vector<int>dep(n+1,0);int best=0;for(int i=1;i<=n;i++){dep[i]=f[i-1]?dep[f[i-1]]+1:0;best=max(best,dep[i]);}cout<<best<<"\\n";',
    c: 'static int dep[200005];int best=0;for(i=1;i<=n;i++){dep[i]=f[i-1]?dep[f[i-1]]+1:0;if(dep[i]>best)best=dep[i];}printf("%d\\n",best);', shape: "treeFather" },
  { id: "tree-leaves", title: "叶子节点数", desc: "给定一棵以节点 $1$ 为根的树（用父节点数组给出），求叶子节点（没有孩子的节点）的数量。", cfg: { nMin: 3, nMax: 10 },
    js: ({ n, f }) => { const has = new Array(n + 1).fill(false); for (let i = 1; i <= n; i++) if (f[i - 1]) has[f[i - 1]] = true; return String(f.filter((p) => p !== 0).length === 0 ? n : n - 1 - has.filter(Boolean).length + 1 - 1 === -1 ? n : Array.from({ length: n }, (_, i) => i + 1).filter((v) => !has[v]).length); },
    py: "has = [False] * (n + 1)\nfor i in range(1, n + 1):\n    if f[i - 1]:\n        has[f[i - 1]] = True\nprint(sum(1 for v in range(1, n + 1) if not has[v]))",
    cpp: 'vector<char>has(n+1,0);for(int i=1;i<=n;i++)if(f[i-1])has[f[i-1]]=1;int c=0;for(int v=1;v<=n;v++)if(!has[v])c++;cout<<c<<"\\n";',
    c: 'static char has[200005];int c=0;for(i=1;i<=n;i++)has[i]=0;for(i=1;i<=n;i++)if(f[i-1])has[f[i-1]]=1;for(i=1;i<=n;i++)if(!has[i])c++;printf("%d\\n",c);', shape: "treeFather" },
  { id: "bit-single", title: "只出现一次的数字", desc: "数组中除了某个数字只出现一次外，其余数字都恰好出现两次。找出这个只出现一次的数字。", fixedCfg: true, cfg: { lo: 1, hi: 100, nMax: 5 },
    js: ({ a }) => String(a.reduce((x, y) => x ^ y, 0)), py: "r = 0\nfor x in a:\n    r ^= x\nprint(r)", cpp: 'long long r=0;for(auto x:a)r^=x;cout<<r<<"\\n";', c: 'long long r=0;for(i=0;i<n;i++)r^=a[i];printf("%lld\\n",r);' },
  { id: "bit-hamming", title: "二进制中 1 的个数之和", desc: "输出数组中所有元素的二进制表示中 1 的个数之和。", cfg: { lo: 1, hi: 1000, nMax: 10 },
    js: ({ a }) => String(a.reduce((s, x) => { let c = 0, v = x; while (v) { c += v & 1; v >>>= 1; } return s + c; }, 0)),
    py: "c = 0\nfor x in a:\n    c += bin(x).count(\"1\")\nprint(c)", cpp: 'long long c=0;for(auto x:a)c+=__builtin_popcountll(x);cout<<c<<"\\n";',
    c: 'long long c=0;for(i=0;i<n;i++){unsigned long long v=a[i];while(v){c+=v&1;v>>=1;}}printf("%lld\\n",c);' },
  { id: "num-fastpow", title: "快速幂取模", desc: "计算 $a^b \\bmod (10^9+7)$。", cfg: { lo: 1, hi: 1000, kMin: 1, kMax: 1000000 },
    js: ({ n0, k }) => { const MOD = 1000000007n; let r = 1n, x = BigInt(n0) % MOD, e = BigInt(k); while (e > 0n) { if (e & 1n) r = (r * x) % MOD; x = (x * x) % MOD; e >>= 1n; } return String(r); },
    py: "print(pow(n0, k, 10**9 + 7))", cpp: 'long long MOD=1000000007LL,r=1,x=n0%MOD,e=k;while(e>0){if(e&1)r=r*x%MOD;x=x*x%MOD;e>>=1;}cout<<r<<"\\n";',
    c: 'long long MOD=1000000007LL,r=1,x=n0%MOD,e=k;while(e>0){if(e&1)r=r*x%MOD;x=x*x%MOD;e>>=1;}printf("%lld\\n",r);', shape: "numK" },
  { id: "num-sieve", title: "质数计数", desc: "统计 $1$ 到 $n$ 之间质数的个数。", cfg: { lo: 2, hi: 1000 },
    js: ({ n0 }) => { const c = new Uint8Array(n0 + 1); let cnt = 0; for (let i = 2; i <= n0; i++) { if (!c[i]) { cnt++; for (let j = i * i; j <= n0; j += i) c[j] = 1; } } return String(cnt); },
    py: "if n0 < 2:\n    print(0)\nelse:\n    s = bytearray(n0 + 1)\n    cnt = 0\n    for i in range(2, n0 + 1):\n        if not s[i]:\n            cnt += 1\n            for j in range(i * i, n0 + 1, i):\n                s[j] = 1\n    print(cnt)",
    cpp: 'vector<char>s(n0+1,0);int cnt=0;for(long long i=2;i<=n0;i++)if(!s[i]){cnt++;for(long long j=i*i;j<=n0;j+=i)s[j]=1;}cout<<cnt<<"\\n";',
    c: 'static char s[1000005];long long i2,j2;int cnt=0;for(i2=0;i2<=n0;i2++)s[i2]=0;for(i2=2;i2<=n0;i2++)if(!s[i2]){cnt++;for(j2=i2*i2;j2<=n0;j2+=i2)s[j2]=1;}printf("%d\\n",cnt);', shape: "num" },
  { id: "num-ncr", title: "组合数", desc: "计算组合数 $\\binom{n}{k}$（$0 \\le k \\le n \\le 30$，结果保证在 64 位整数范围内）。", fixedCfg: true, cfg: { lo: 1, hi: 30, kMin: 0, kMax: 15 },
    js: ({ n0, k }) => { let r = 1n; for (let i = 1n; i <= BigInt(k); i++) r = r * (BigInt(n0) - i + 1n) / i; return String(r); },
    py: "from math import comb\nprint(comb(n0, k))", cpp: 'long long r=1;if(k>n0-k)k=n0-k;for(long long i=1;i<=k;i++)r=r*(n0-i+1)/i;cout<<r<<"\\n";',
    c: 'long long r=1,i2;long long kk=k;if(kk>n0-kk)kk=n0-kk;for(i2=1;i2<=kk;i2++)r=r*(n0-i2+1)/i2;printf("%lld\\n",r);', shape: "numK" },
  { id: "str-lcp", title: "最长公共前缀长度", desc: "求两个字符串 $a$ 与 $b$ 的最长公共前缀的长度。", cfg: { nMin: 2, nMax: 8, alpha: "ab" },
    js: ({ a, b }) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return String(i); },
    py: "i = 0\nwhile i < len(a) and i < len(b) and a[i] == b[i]:\n    i += 1\nprint(i)", cpp: 'int i=0;while(i<(int)a.size()&&i<(int)b.size()&&a[i]==b[i])i++;cout<<i<<"\\n";',
    c: 'int i2=0;while(i2<la&&i2<lb&&a[i2]==b[i2])i2++;printf("%d\\n",i2);', shape: "str2" },
  { id: "str-anagram", title: "变位词判断", desc: "判断字符串 $b$ 是否由 $a$ 中的字符重新排列而成（即两个字符串互为变位词，长度相同且每种字符出现次数相同）。是则输出 `YES`，否则输出 `NO`。", cfg: { nMin: 2, nMax: 8, alpha: "abc" },
    js: ({ a, b }) => (a.length === b.length && [...a].sort().join("") === [...b].sort().join("") ? "YES" : "NO"),
    py: "print(\"YES\" if sorted(a) == sorted(b) else \"NO\")", cpp: 'string x=a,y=b;sort(x.begin(),x.end());sort(y.begin(),y.end());cout<<(x==y?"YES":"NO")<<"\\n";',
    c: 'static int ca[256],cb[256];int i2,ok=1;for(i2=0;i2<256;i2++){ca[i2]=0;cb[i2]=0;}if(la!=lb)ok=0;for(i2=0;i2<la;i2++)ca[(unsigned char)a[i2]]++;for(i2=0;i2<lb;i2++)cb[(unsigned char)b[i2]]++;for(i2=0;i2<256;i2++)if(ca[i2]!=cb[i2])ok=0;printf("%s\\n",ok?"YES":"NO");', shape: "str2" },
  { id: "sim-spiral", title: "螺旋矩阵", desc: "按顺时针螺旋顺序从外到内遍历矩阵，把访问到的元素依次输出，用空格隔开。", fixedCfg: true, cfg: { nMin: 2, nMax: 5, lo: 1, hi: 50 },
    js: ({ n, m, g }) => { const out = []; let top = 0, bottom = n - 1, left = 0, right = m - 1; while (top <= bottom && left <= right) { for (let j = left; j <= right; j++) out.push(g[top][j]); top++; for (let i = top; i <= bottom; i++) out.push(g[i][right]); right--; if (top <= bottom) { for (let j = right; j >= left; j--) out.push(g[bottom][j]); bottom--; } if (left <= right) { for (let i = bottom; i >= top; i--) out.push(g[i][left]); left++; } } return out.join(" "); },
    py: "out = []\ntop, bottom, left, right = 0, n - 1, 0, m - 1\nwhile top <= bottom and left <= right:\n    for j in range(left, right + 1):\n        out.append(g[top][j])\n    top += 1\n    for i in range(top, bottom + 1):\n        out.append(g[i][right])\n    right -= 1\n    if top <= bottom:\n        for j in range(right, left - 1, -1):\n            out.append(g[bottom][j])\n        bottom -= 1\n    if left <= right:\n        for i in range(bottom, top - 1, -1):\n            out.append(g[i][left])\n        left += 1\nprint(*out)",
    cpp: 'vector<long long>out;int top=0,bottom=n-1,left=0,right=m-1;while(top<=bottom&&left<=right){for(int j=left;j<=right;j++)out.push_back(g[top][j]);top++;for(int i=top;i<=bottom;i++)out.push_back(g[i][right]);right--;if(top<=bottom){for(int j=right;j>=left;j--)out.push_back(g[bottom][j]);bottom--;}if(left<=right){for(int i=bottom;i>=top;i--)out.push_back(g[i][left]);left++;}}for(size_t i=0;i<out.size();i++)cout<<out[i]<<(i+1<out.size()?" ":"\\n");',
    c: 'static long long out[100005];int cnt=0,top=0,bottom=n-1,left=0,right=m-1,i2,j2;while(top<=bottom&&left<=right){for(j2=left;j2<=right;j2++)out[cnt++]=g[top][j2];top++;for(i2=top;i2<=bottom;i2++)out[cnt++]=g[i2][right];right--;if(top<=bottom){for(j2=right;j2>=left;j2--)out[cnt++]=g[bottom][j2];bottom--;}if(left<=right){for(i2=bottom;i2>=top;i2--)out[cnt++]=g[i2][left];left++;}}for(i2=0;i2<cnt;i2++)printf("%lld%c",out[i2],i2+1<cnt?32:10);', shape: "matrix" },
  { id: "sim-rotate", title: "旋转矩阵 90°", desc: "把 $n \\times m$ 的矩阵顺时针旋转 $90^\\circ$ 后输出（旋转后为 $m$ 行 $n$ 列）。", fixedCfg: true, cfg: { nMin: 2, nMax: 5, lo: 1, hi: 50 },
    js: ({ n, m, g }) => { const rows = []; for (let i = 0; i < m; i++) { const row = []; for (let j = 0; j < n; j++) row.push(g[n - 1 - j][i]); rows.push(row.join(" ")); } return rows.join("\n"); },
    py: "for i in range(m):\n    print(*[g[n - 1 - j][i] for j in range(n)])",
    cpp: 'for(int i=0;i<m;i++){for(int j=0;j<n;j++)cout<<g[n-1-j][i]<<(j+1<n?" ":"\\n");}',
    c: 'for(i2=0;i2<m;i2++)for(j2=0;j2<n;j2++)printf("%lld%c",g[n-1-j2][i2],j2+1<n?32:10);', shape: "matrix" },
];

export const mediumFamilies3 = [
  ...expand({ shape: "maze01", ops: GRAPH_OPS.filter((o) => o.shape === "maze01"), difficulty: "中等", topic: "图论", tags: ["BFS", "搜索"], hint: "广度优先搜索第一次到达终点时的步数就是最短步数。", variants: V4 }),
  ...expand({ shape: "matrix", ops: GRAPH_OPS.filter((o) => o.shape === "matrix"), difficulty: "图论", topic: "图论", tags: ["BFS", "矩阵"], hint: "把网格看成图，相邻格子之间连边。", variants: V4 }),
  ...expand({ shape: "edgesD", ops: GRAPH_OPS.filter((o) => o.shape === "edgesD"), difficulty: "中等", topic: "图论", tags: ["拓扑排序", "有向图"], hint: "拓扑排序能访问到的节点数少于 $n$ 就说明有环。", variants: V4 }),
  ...expand({ shape: "edgesU", ops: GRAPH_OPS.filter((o) => o.shape === "edgesU"), difficulty: "中等", topic: "图论", tags: ["二分图", "BFS"], hint: "用 BFS 给每个点染色，相邻点颜色必须不同。", variants: V4 }),
  ...expand({ shape: "treeFather", ops: GRAPH_OPS.filter((o) => o.shape === "treeFather"), difficulty: "中等", topic: "树", tags: ["树", "遍历"], hint: "父节点编号小于子节点，按编号从小到大递推即可。", variants: V4 }),
  ...expand({ shape: "arr", ops: GRAPH_OPS.filter((o) => !o.shape), difficulty: "中等", topic: "位运算", tags: ["位运算"], hint: "想想异或运算的性质，以及按位统计的套路。", variants: V4 }),
  ...expand({ shape: "numK", ops: GRAPH_OPS.filter((o) => o.shape === "numK"), difficulty: "中等", topic: "数论进阶", tags: ["数学", "快速幂"], hint: "快速幂把指数按二进制拆开，复杂度为 $O(\\log b)$。", variants: V4 }),
  ...expand({ shape: "num", ops: GRAPH_OPS.filter((o) => o.shape === "num"), difficulty: "中等", topic: "数论进阶", tags: ["质数", "筛法"], hint: "埃氏筛的复杂度是 $O(n \\log \\log n)$。", variants: V4 }),
  ...expand({ shape: "str2", ops: GRAPH_OPS.filter((o) => o.shape === "str2"), difficulty: "中等", topic: "字符串算法", tags: ["字符串"], hint: "逐位比较或用计数数组统计字符。", variants: V4 }),
];

export const mediumFamilies = [...mediumFamilies1, ...mediumFamilies2, ...mediumFamilies3];

export { DP_OPS, GREEDY_OPS, STACK_OPS, GRAPH_OPS };
