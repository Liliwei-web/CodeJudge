
/** 与其他题族重复的题型（保留更合适的那一档） */
const DUP_DROP = new Set(["hard-trailing-zeros","hard-topk-sum","hard-big-add"]);
/**
 * 困难难度题族：算法进阶（逆序对、区间 DP、位掩码 DP、图论、字符串、数论）。
 * 与 medium.mjs 共用 expand / V4 机制。
 */
import { SHAPES, nums } from "../lib/shapes.mjs";
const _ONE = [{ suffix: "", cfgFn: (b) => ({ ...b }) }];
// 每个题型只保留一档，避免同一道题按数据规模重复出现
const V8 = _ONE;
const V4S = _ONE;
import { expand } from "./medium.mjs";


/* ---------- 二分图输入形状 ---------- */
SHAPES.bipartite = {
  py: "nL = int(data[0])\nnR = int(data[1])\nm = int(data[2])\nedges = [(int(data[3 + i * 2]), int(data[4 + i * 2])) for i in range(m)]\n",
  cpp: "int nL,nR,m;cin>>nL>>nR>>m;vector<pair<int,int>>edges(m);for(auto&e:edges)cin>>e.first>>e.second;",
  c: "int nL,nR,m,i;static int bu[100005],bv[100005];if(scanf(\"%d %d %d\",&nL,&nR,&m)!=3)return 1;for(i=0;i<m;i++)scanf(\"%d %d\",&bu[i],&bv[i]);",
  parse: (t) => {
    const v = nums(t);
    const nL = v[0], nR = v[1], m = v[2];
    const edges = [];
    for (let i = 0; i < m; i++) edges.push([v[3 + i * 2], v[4 + i * 2]]);
    return { nL, nR, m, edges };
  },
  gen: (r, cfg) => {
    const nL = r.int(cfg.nMin ?? 2, cfg.nMax ?? 6);
    const nR = r.int(cfg.nMin ?? 2, cfg.nMax ?? 6);
    const cap = nL * nR;
    const target = r.int(Math.max(nL, nR), Math.max(nL, Math.min(cfg.mMax ?? 12, cap)));
    const set = new Set();
    const edges = [];
    while (edges.length < target) {
      const u = r.int(1, nL), v = r.int(1, nR);
      const key = `${u}-${v}`;
      if (set.has(key)) continue;
      set.add(key);
      edges.push([u, v]);
    }
    return `${nL} ${nR} ${edges.length}\n${edges.map((e) => e.join(" ")).join("\n")}\n`;
  },
};

const BIG = "4000000000000000000LL";
SHAPES.bignum = {
  py: "a = data[0]\nb = data[1]\n",
  cpp: "string a,b;cin>>a>>b;",
  c: "char a[5005],b[5005];if(scanf(\"%5000s %5000s\",a,b)!=2)return 1;int la=(int)strlen(a),lb=(int)strlen(b);(void)la;(void)lb;",
  parse: (t) => { const v = t.trim().split(/\s+/); return { a: v[0], b: v[1] }; },
  gen: (r, cfg) => {
    const make = () => {
      const len = r.int(cfg.nMin ?? 3, cfg.nMax ?? 8);
      let out = String(r.int(1, 9));
      for (let i = 1; i < len; i++) out += String(r.int(0, 9));
      return out;
    };
    return make() + " " + make() + "\n";
  },
};
const HARD_IF = {
  bipartite: "第一行三个整数 $n_L, n_R, m$（左部点数、右部点数、边数）；接下来 $m$ 行每行两个整数 $u, v$，表示左部点 $u$ 与右部点 $v$ 之间有一条边。",
};

/* =================================================================
 * 数组 / 序列类
 * ================================================================= */
const ARR_OPS = [
  { id: "hard-inversions", title: "逆序对数量", desc: "统计数组中有多少对下标 $i < j$ 满足 $a_i > a_j$。", cfg: { lo: 0, hi: 100000, nMax: 30 },
    js: ({ a }) => { const buf = new Array(a.length); let cnt = 0; for (let w = 1; w < a.length; w *= 2) { for (let l = 0; l < a.length; l += 2 * w) { const m2 = Math.min(l + w, a.length); const r = Math.min(l + 2 * w, a.length); let i2 = l, j2 = m2, k2 = l; while (i2 < m2 && j2 < r) { if (a[i2] <= a[j2]) buf[k2++] = a[i2++]; else { cnt += m2 - i2; buf[k2++] = a[j2++]; } } while (i2 < m2) buf[k2++] = a[i2++]; while (j2 < r) buf[k2++] = a[j2++]; for (let q = l; q < r; q++) a[q] = buf[q]; } } return String(cnt); },
    py: "def ms(lo, hi):\n    if hi - lo <= 1:\n        return 0\n    mid = (lo + hi) // 2\n    c = ms(lo, mid) + ms(mid, hi)\n    i2, j2, t = lo, mid, []\n    while i2 < mid and j2 < hi:\n        if a[i2] <= a[j2]:\n            t.append(a[i2]); i2 += 1\n        else:\n            c += mid - i2; t.append(a[j2]); j2 += 1\n    t += a[i2:mid] + a[j2:hi]\n    a[lo:hi] = t\n    return c\nprint(ms(0, n))",
    cpp: 'vector<long long>buf(n);long long cnt=0;for(int w=1;w<n;w*=2){for(int l=0;l<n;l+=2*w){int m2=min(l+w,n),r=min(l+2*w,n),i2=l,j2=m2,k2=l;while(i2<m2&&j2<r){if(a[i2]<=a[j2])buf[k2++]=a[i2++];else{cnt+=m2-i2;buf[k2++]=a[j2++];}}while(i2<m2)buf[k2++]=a[i2++];while(j2<r)buf[k2++]=a[j2++];for(int q=l;q<r;q++)a[q]=buf[q];}}cout<<cnt<<"\\n";',
    c: `static long long buf[500005];long long cnt=0;for(int w=1;w<n;w*=2){for(int l=0;l<n;l+=2*w){int m2=l+w<n?l+w:n;int r=l+2*w<n?l+2*w:n;int i2=l,j2=m2,k2=l;while(i2<m2&&j2<r){if(a[i2]<=a[j2])buf[k2++]=a[i2++];else{cnt+=m2-i2;buf[k2++]=a[j2++];}}while(i2<m2)buf[k2++]=a[i2++];while(j2<r)buf[k2++]=a[j2++];for(int q=l;q<r;q++)a[q]=buf[q];}}printf("%lld\\n",cnt);` },

  { id: "hard-rainwater", title: "接雨水", desc: "数组表示一排宽度为 $1$ 的柱子高度，求这些柱子在下雨后能接住多少单位的雨水。", cfg: { lo: 0, hi: 1000, nMax: 12 },
    js: ({ a }) => { let lo2 = 0, hi2 = a.length - 1, lmax = 0, rmax = 0, water = 0; while (lo2 < hi2) { if (a[lo2] < a[hi2]) { if (a[lo2] >= lmax) lmax = a[lo2]; else water += lmax - a[lo2]; lo2++; } else { if (a[hi2] >= rmax) rmax = a[hi2]; else water += rmax - a[hi2]; hi2--; } } return String(water); },
    py: "lo2, hi2, lm, rm, w = 0, n - 1, 0, 0, 0\nwhile lo2 < hi2:\n    if a[lo2] < a[hi2]:\n        if a[lo2] >= lm: lm = a[lo2]\n        else: w += lm - a[lo2]\n        lo2 += 1\n    else:\n        if a[hi2] >= rm: rm = a[hi2]\n        else: w += rm - a[hi2]\n        hi2 -= 1\nprint(w)",
    cpp: 'long long lo2=0,hi2=n-1,lm=0,rm=0,w=0;while(lo2<hi2){if(a[lo2]<a[hi2]){if(a[lo2]>=lm)lm=a[lo2];else w+=lm-a[lo2];lo2++;}else{if(a[hi2]>=rm)rm=a[hi2];else w+=rm-a[hi2];hi2--;}}cout<<w<<"\\n";',
    c: `int lo2=0,hi2=n-1,lmax=0,rmax=0;long long water=0;while(lo2<hi2){if(a[lo2]<a[hi2]){if(a[lo2]>=lmax)lmax=(int)a[lo2];else water+=lmax-a[lo2];lo2++;}else{if(a[hi2]>=rmax)rmax=(int)a[hi2];else water+=rmax-a[hi2];hi2--;}}printf("%lld\\n",water);` },

  { id: "hard-merge-fruit", title: "合并果子", desc: "有 $n$ 堆果子，每次可以把两堆合并成一堆，代价为两堆重量之和。求把所有果子合并成一堆的**最小总代价**。", cfg: { lo: 1, hi: 100, nMax: 10 },
    js: ({ a }) => { const h = a.slice().sort((x, y) => x - y); let total = 0; while (h.length > 1) { const s2 = h.shift() + h.shift(); total += s2; let lo = 0, hi = h.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (h[mid] < s2) lo = mid + 1; else hi = mid; } h.splice(lo, 0, s2); } return String(total); },
    py: "import heapq\nh = list(a)\nheapq.heapify(h)\ntotal = 0\nwhile len(h) > 1:\n    s2 = heapq.heappop(h) + heapq.heappop(h)\n    total += s2\n    heapq.heappush(h, s2)\nprint(total)",
    cpp: 'priority_queue<long long,vector<long long>,greater<long long>>h(a.begin(),a.end());long long total=0;while(h.size()>1){long long s2=h.top();h.pop();s2+=h.top();h.pop();total+=s2;h.push(s2);}cout<<total<<"\\n";',
    c: `static long long cur[500005],nxt[500005];int m2=n;for(i=0;i<n;i++)cur[i]=a[i];long long total=0;while(m2>1){int p=-1,q=-1;for(int j=0;j<m2;j++){if(p<0||cur[j]<cur[p]){q=p;p=j;}else if(q<0||cur[j]<cur[q])q=j;}long long s2=cur[p]+cur[q];total+=s2;int nm=0;nxt[nm++]=s2;for(int j=0;j<m2;j++)if(j!=p&&j!=q)nxt[nm++]=cur[j];for(int j=0;j<nm;j++)cur[j]=nxt[j];m2=nm;}printf("%lld\\n",total);` },
  { id: "hard-matrix-chain", title: "矩阵链乘最少乘法次数", desc: "给定 $n$ 个数字 $p_0, p_1, \\dots, p_{n-1}$，代表一串矩阵 $M_1 \\times M_2 \\times \\dots \\times M_{n-1}$，其中 $M_i$ 的规模是 $p_{i-1} \\times p_i$。求把它们全部相乘所需的最少标量乘法次数。", cfg: { lo: 1, hi: 50, nMax: 6 },
    js: ({ a }) => { const p = a, N = p.length; if (N < 3) return "0"; const dp = Array.from({ length: N }, () => new Array(N).fill(0)); for (let len = 2; len < N; len++) for (let i2 = 0; i2 + len < N; i2++) { const j2 = i2 + len; dp[i2][j2] = Infinity; for (let k2 = i2 + 1; k2 < j2; k2++) { const v = dp[i2][k2] + dp[k2][j2] + p[i2] * p[k2] * p[j2]; if (v < dp[i2][j2]) dp[i2][j2] = v; } } return String(dp[0][N - 1]); },
    py: "N = len(a)\nif N < 3:\n    print(0)\nelse:\n    dp = [[0] * N for _ in range(N)]\n    for ln in range(2, N):\n        for i2 in range(0, N - ln):\n            j2 = i2 + ln\n            dp[i2][j2] = min(dp[i2][k2] + dp[k2][j2] + a[i2] * a[k2] * a[j2] for k2 in range(i2 + 1, j2))\n    print(dp[0][N - 1])",
    cpp: 'int N=n;if(N<3){cout<<0<<"\\n";}else{vector<vector<long long>>dp(N,vector<long long>(N,0));for(int len=2;len<N;len++)for(int i2=0;i2+len<N;i2++){int j2=i2+len;dp[i2][j2]=LLONG_MAX;for(int k2=i2+1;k2<j2;k2++){long long v=dp[i2][k2]+dp[k2][j2]+a[i2]*a[k2]*a[j2];if(v<dp[i2][j2])dp[i2][j2]=v;}}cout<<dp[0][N-1]<<"\\n";}',
    c: `static long long dp[505][505];int N=n;if(N<3){printf("0\\n");}else{for(int i2=0;i2<N;i2++)for(int z=0;z<N;z++)dp[i2][z]=0;for(int len=2;len<N;len++)for(int i2=0;i2+len<N;i2++){int j2=i2+len;dp[i2][j2]=${BIG};for(int k2=i2+1;k2<j2;k2++){long long v=dp[i2][k2]+dp[k2][j2]+a[i2]*a[k2]*a[j2];if(v<dp[i2][j2])dp[i2][j2]=v;}}printf("%lld\\n",dp[0][N-1]);}` },

  { id: "hard-topk-sum", title: "前 k 大元素之和", desc: "求数组中最大的 $k$ 个元素之和。", cfg: { lo: -100, hi: 100, nMax: 10, kMin: 1, kMax: 6 }, shape: "arrKIndex",
    js: ({ a, k }) => String(a.slice().sort((x, y) => y - x).slice(0, k).reduce((x, y) => x + y, 0)),
    py: "print(sum(sorted(a, reverse=True)[:k]))",
    cpp: 'sort(a.rbegin(),a.rend());long long s2=0;for(long long j=0;j<k;j++)s2+=a[j];cout<<s2<<"\\n";',
    c: `long long s2=0;for(long long j=0;j<k;j++){int bi=j;for(int z=j;z<n;z++)if(a[z]>a[bi])bi=z;long long t2=a[j];a[j]=a[bi];a[bi]=t2;s2+=a[j];}printf("%lld\\n",s2);` },
];

/* =================================================================
 * 字符串类
 * ================================================================= */
const STR_OPS = [
  { id: "hard-longest-palindrome", title: "最长回文子串长度", desc: "求字符串 $s$ 中最长的**回文子串**长度（子串必须连续）。", cfg: { nMin: 3, nMax: 12, alpha: "abc" }, shape: "str",
    js: ({ s }) => { let best = 0; for (let i = 0; i < s.length; i++) { let l2 = i, r2 = i; while (l2 >= 0 && r2 < s.length && s[l2] === s[r2]) { if (r2 - l2 + 1 > best) best = r2 - l2 + 1; l2--; r2++; } l2 = i; r2 = i + 1; while (l2 >= 0 && r2 < s.length && s[l2] === s[r2]) { if (r2 - l2 + 1 > best) best = r2 - l2 + 1; l2--; r2++; } } return String(best); },
    py: "nn = len(s)\nbest = 0\nfor i2 in range(nn):\n    l2 = r2 = i2\n    while l2 >= 0 and r2 < nn and s[l2] == s[r2]:\n        best = max(best, r2 - l2 + 1); l2 -= 1; r2 += 1\n    l2, r2 = i2, i2 + 1\n    while l2 >= 0 and r2 < nn and s[l2] == s[r2]:\n        best = max(best, r2 - l2 + 1); l2 -= 1; r2 += 1\nprint(best)",
    cpp: 'int nn=s.size();int best=0;for(int i2=0;i2<nn;i2++){int l2=i2,r2=i2;while(l2>=0&&r2<nn&&s[l2]==s[r2]){best=max(best,r2-l2+1);l2--;r2++;}l2=i2;r2=i2+1;while(l2>=0&&r2<nn&&s[l2]==s[r2]){best=max(best,r2-l2+1);l2--;r2++;}}cout<<best<<"\\n";',
    c: `int best=0,l2,r2;for(i=0;i<n;i++){l2=i;r2=i;while(l2>=0&&r2<n&&s[l2]==s[r2]){if(r2-l2+1>best)best=r2-l2+1;l2--;r2++;}l2=i;r2=i+1;while(l2>=0&&r2<n&&s[l2]==s[r2]){if(r2-l2+1>best)best=r2-l2+1;l2--;r2++;}}printf("%d\\n",best);` },
];

/* =================================================================
 * 数论 / 计数类
 * ================================================================= */
const NUM_OPS = [
  { id: "hard-nqueens", title: "N 皇后方案数", desc: "$n$ 皇后问题：在 $n \\times n$ 的棋盘上放置 $n$ 个皇后，使任意两个皇后都不在同一行、同一列或同一斜线上，求方案数。", cfg: { lo: 4, hi: 10 }, shape: "num",
    js: ({ n0 }) => { const full = (1 << n0) - 1; let cnt = 0; const rec = (cols, d1, d2) => { if (cols === full) { cnt++; return; } let avail = full & ~(cols | d1 | d2); while (avail) { const p = avail & -avail; avail -= p; rec(cols | p, ((d1 | p) << 1) & full, (d2 | p) >> 1); } }; rec(0, 0, 0); return String(cnt); },
    py: "full = (1 << n0) - 1\ncnt = 0\ndef rec(cols, d1, d2):\n    global cnt\n    if cols == full:\n        cnt += 1\n        return\n    avail = full & ~(cols | d1 | d2)\n    while avail:\n        p = avail & -avail\n        avail -= p\n        rec(cols | p, ((d1 | p) << 1) & full, (d2 | p) >> 1)\nrec(0, 0, 0)\nprint(cnt)",
    cpp: 'int full=(1<<n0)-1;long long cnt=0;function<void(int,int,int)>rec=[&](int cols,int d1,int d2){if(cols==full){cnt++;return;}int avail=full&~(cols|d1|d2);while(avail){int p=avail&-avail;avail-=p;rec(cols|p,((d1|p)<<1)&full,(d2|p)>>1);}};rec(0,0,0);cout<<cnt<<"\\n";',
    c: `printf("%lld\\n", NQ((1<<n0)-1));`, cExtra: `static long long NQcnt;\nstatic void NQrec(int cols,int d1,int d2,int full){if(cols==full){NQcnt++;return;}int avail=full&~(cols|d1|d2);while(avail){int p=avail&-avail;avail-=p;NQrec(cols|p,((d1|p)<<1)&full,(d2|p)>>1,full);}}\nstatic long long NQ(int full){NQcnt=0;NQrec(0,0,0,full);return NQcnt;}\n` },

  { id: "hard-kth-perm", title: "第 k 个排列", desc: "求 $1 \\sim n$ 的所有排列按字典序排序后的第 $k$ 个排列（$k$ 从 $1$ 开始；若 $k$ 超过 $n!$ 则按 $k \\bmod n!$ 处理）。把排列用空格隔开输出。", cfg: { lo: 3, hi: 8, kMin: 1, kMax: 5000 }, shape: "numK",
    js: ({ n0, k }) => { const n = n0; const f = [1]; for (let i = 1; i <= n; i++) f[i] = f[i - 1] * i; let kk = ((k - 1) % f[n] + f[n]) % f[n]; const pool = Array.from({ length: n }, (_, i) => i + 1); const out = []; for (let i = n; i >= 1; i--) { const idx = Math.floor(kk / f[i - 1]); kk %= f[i - 1]; out.push(pool.splice(idx, 1)[0]); } return out.join(" "); },
    py: "from math import factorial as F\nn = n0\nkk = (k - 1) % F(n)\npool = list(range(1, n + 1))\nout = []\nfor i2 in range(n, 0, -1):\n    f = F(i2 - 1)\n    idx = kk // f\n    kk %= f\n    out.append(pool.pop(idx))\nprint(*out)",
    cpp: 'long long f[25];f[0]=1;for(long long i2=1;i2<=n0;i2++)f[i2]=f[i2-1]*i2;long long kk=(k-1)%f[n0];int used[25]={0};for(long long i2=n0;i2>=1;i2--){long long idx=kk/f[i2-1];kk%=f[i2-1];long long c2=0;for(long long v=1;v<=n0;v++){if(used[v])continue;if(c2==idx){used[v]=1;cout<<v<<(i2>1?" ":"\\n");break;}c2++;}}',
    c: `static long long ff[25];ff[0]=1;for(long long q=1;q<=n0;q++)ff[q]=ff[q-1]*q;long long kk=(k-1)%ff[n0];static int used[25];for(int q=0;q<25;q++)used[q]=0;for(long long q=n0;q>=1;q--){long long idx=kk/ff[q-1];kk%=ff[q-1];long long c2=0;for(long long v=1;v<=n0;v++){if(used[v])continue;if(c2==idx){used[v]=1;printf("%lld%c",v,q>1?32:10);break;}c2++;}}` },

  { id: "hard-josephus", title: "约瑟夫环", desc: "$n$ 个人围成一圈编号 $1 \\sim n$，从 $1$ 号开始报数，每报到第 $k$ 个人就让他出圈，然后下一个人重新从 $1$ 开始报数。求最后留下的人的编号。", cfg: { lo: 2, hi: 30, kMin: 1, kMax: 30 }, shape: "numK",
    js: ({ n0, k }) => { let r = 0; for (let i = 2; i <= n0; i++) r = (r + k) % i; return String(r + 1); },
    py: "r = 0\nfor i2 in range(2, n0 + 1):\n    r = (r + k) % i2\nprint(r + 1)",
    cpp: 'long long r=0;for(long long i2=2;i2<=n0;i2++)r=(r+k)%i2;cout<<r+1<<"\\n";',
    c: `long long r=0;for(long long q=2;q<=n0;q++)r=(r+k)%q;printf("%lld\\n",r+1);` },

  { id: "hard-trailing-zeros", title: "阶乘末尾零的个数", desc: "求 $n!$ 的十进制表示末尾有多少个连续的 $0$。", cfg: { lo: 1, hi: 100 }, shape: "num",
    js: ({ n0 }) => { let c = 0; for (let p = 5; p <= n0; p *= 5) c += Math.floor(n0 / p); return String(c); },
    py: "c = 0\np = 5\nwhile p <= n0:\n    c += n0 // p\n    p *= 5\nprint(c)",
    cpp: 'long long c=0;for(long long p=5;p<=n0;p*=5)c+=n0/p;cout<<c<<"\\n";',
    c: `long long c=0,p;for(p=5;p<=n0;p*=5)c+=n0/p;printf("%lld\\n",c);` },

  { id: "hard-phi-sum", title: "欧拉函数之和", desc: "求 $\\sum_{i=1}^{n} \\varphi(i)$，其中 $\\varphi(i)$ 表示 $1 \\sim i$ 中与 $i$ 互质的整数个数（$\\varphi(1)=1$）。$n$ 最大可达 $2 \\times 10^4$，需要用筛法在 $O(n \\log \\log n)$ 内完成。", cfg: { lo: 2, hi: 20000 }, shape: "num",
    js: ({ n0 }) => { const m = n0; const ph = new Array(m + 1); for (let i = 0; i <= m; i++) ph[i] = i; for (let p = 2; p <= m; p++) if (ph[p] === p) for (let j = p; j <= m; j += p) ph[j] -= Math.floor(ph[j] / p); let s = 0; for (let i = 1; i <= m; i++) s += ph[i]; return String(s); },
    py: "m = n0\nph = list(range(m + 1))\nfor p in range(2, m + 1):\n    if ph[p] == p:\n        for j in range(p, m + 1, p):\n            ph[j] -= ph[j] // p\nprint(sum(ph[1:]))",
    cpp: 'vector<long long>ph(n0+1);for(long long x=0;x<=n0;x++)ph[x]=x;for(long long p=2;p<=n0;p++)if(ph[p]==p)for(long long j=p;j<=n0;j+=p)ph[j]-=ph[j]/p;long long s=0;for(long long x=1;x<=n0;x++)s+=ph[x];cout<<s<<"\\n";',
    c: `static long long ph[100005];long long x,p,j,s=0;for(x=0;x<=n0;x++)ph[x]=x;for(p=2;p<=n0;p++)if(ph[p]==p)for(j=p;j<=n0;j+=p)ph[j]-=ph[j]/p;for(x=1;x<=n0;x++)s+=ph[x];printf("%lld\\n",s);` },

  { id: "hard-prime-factor", title: "质因数分解", desc: "把 $n$ 分解为质因数的乘积，按从小到大输出所有质因数（重复的质因数要重复输出），用空格隔开。", cfg: { lo: 2, hi: 100000 }, shape: "num",
    js: ({ n0 }) => { const out = []; let n = n0; for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; } if (n > 1) out.push(n); return out.join(" "); },
    py: "n2 = n0\nout = []\np = 2\nwhile p * p <= n2:\n    while n2 % p == 0:\n        out.append(p)\n        n2 //= p\n    p += 1\nif n2 > 1:\n    out.append(n2)\nprint(*out)",
    cpp: 'long long n2=n0;vector<long long>out;for(long long p=2;p*p<=n2;p++)while(n2%p==0){out.push_back(p);n2/=p;}if(n2>1)out.push_back(n2);for(size_t q=0;q<out.size();q++)cout<<out[q]<<(q+1<out.size()?" ":"\\n");',
    c: `long long n2=n0,p;int first=1;for(p=2;p*p<=n2;p++)while(n2%p==0){printf("%s%lld",first?"":" ",p);first=0;n2/=p;}if(n2>1)printf("%s%lld",first?"":" ",n2);printf("\\n");` },

  { id: "hard-coin-order-ways", title: "有序硬币组合方案数", desc: "给定 $n$ 种硬币的面额和金额 $k$，每种硬币可以使用任意多枚，求凑出金额 $k$ 且**顺序不同算不同方案**的排列数（对 $10^9+7$ 取模）。例如面额 $\\{1,2\\}$ 凑出 $3$ 有 $3$ 种方案：$1+1+1$、$1+2$、$2+1$。", cfg: { lo: 1, hi: 50, nMax: 6, kMin: 1, kMax: 60 }, shape: "arrK",
    js: ({ a, k }) => { const M = 1000000007; const dp = new Array(k + 1).fill(0); dp[0] = 1; for (let j = 1; j <= k; j++) for (const c of a) if (c <= j) dp[j] = (dp[j] + dp[j - c]) % M; return String(dp[k]); },
    py: "M = 10 ** 9 + 7\ndp = [0] * (k + 1)\ndp[0] = 1\nfor j in range(1, k + 1):\n    for c in a:\n        if c <= j:\n            dp[j] = (dp[j] + dp[j - c]) % M\nprint(dp[k])",
    cpp: 'const long long M=1000000007LL;vector<long long>dp(k+1,0);dp[0]=1;for(long long j=1;j<=k;j++)for(auto c:a)if(c<=j)dp[j]=(dp[j]+dp[j-c])%M;cout<<dp[k]<<"\\n";',
    c: `static long long dp[100005];long long j;for(j=0;j<=k;j++)dp[j]=0;dp[0]=1;for(j=1;j<=k;j++)for(i=0;i<n;i++)if(a[i]<=j)dp[j]=(dp[j]+dp[j-a[i]])%1000000007LL;printf("%lld\\n",dp[k]);` },
];
/* =================================================================
 * 大数 / 字符串匹配
 * ================================================================= */
const STR2_OPS = [
  { id: "hard-big-add", title: "大整数加法", desc: "给定两个非负大整数（位数可能很多，不含前导零），输出它们的和。", cfg: { nMin: 3, nMax: 20 }, shape: "bignum",
    js: ({ a, b }) => String(BigInt(a) + BigInt(b)),
    py: "print(int(a) + int(b))",
    cpp: 'while(a.size()>1&&a[0]==48)a.erase(a.begin());while(b.size()>1&&b[0]==48)b.erase(b.begin());string r;int carry=0;int la2=a.size(),lb2=b.size();for(int q=0;q<max(la2,lb2)||carry;q++){int x=q<la2?a[la2-1-q]-48:0;int y=q<lb2?b[lb2-1-q]-48:0;int s2=x+y+carry;r+=char(48+s2%10);carry=s2/10;}reverse(r.begin(),r.end());cout<<r<<"\\n";',
    c: `static int res[100005];char*pa=a;char*pb=b;int la2=la,lb2=lb;while(la2>1&&*pa==48){pa++;la2--;}while(lb2>1&&*pb==48){pb++;lb2--;}int carry=0,len=la2>lb2?la2:lb2;for(int q=0;q<len;q++){int x=q<la2?pa[la2-1-q]-48:0;int y=q<lb2?pb[lb2-1-q]-48:0;int s2=x+y+carry;res[q]=s2%10;carry=s2/10;}if(carry)res[len++]=carry;for(int q=len-1;q>=0;q--)putchar(48+res[q]);putchar(10);` },

  { id: "hard-big-mul", title: "大整数乘法", desc: "给定两个非负大整数（位数可能很多，不含前导零），输出它们的乘积。", cfg: { nMin: 3, nMax: 12 }, shape: "bignum",
    js: ({ a, b }) => String(BigInt(a) * BigInt(b)),
    py: "print(int(a) * int(b))",
    cpp: 'while(a.size()>1&&a[0]==48)a.erase(a.begin());while(b.size()>1&&b[0]==48)b.erase(b.begin());if(a=="0"||b=="0"){cout<<0<<"\\n";}else{int la2=a.size(),lb2=b.size();vector<int>res(la2+lb2,0);for(int q=la2-1;q>=0;q--)for(int r2=lb2-1;r2>=0;r2--){int t2=(a[q]-48)*(b[r2]-48)+res[q+r2+1];res[q+r2+1]=t2%10;res[q+r2]+=t2/10;}int st2=0;while(st2<la2+lb2-1&&res[st2]==0)st2++;for(int q=st2;q<la2+lb2;q++)cout<<res[q];cout<<"\\n";}',
    c: `char*pa=a;char*pb=b;int la2=la,lb2=lb;while(la2>1&&*pa==48){pa++;la2--;}while(lb2>1&&*pb==48){pb++;lb2--;}if((la2==1&&pa[0]==48)||(lb2==1&&pb[0]==48)){printf("0\\n");}else{static int res[100005];int tot=la2+lb2;for(int q=0;q<tot;q++)res[q]=0;for(int q=la2-1;q>=0;q--)for(int r2=lb2-1;r2>=0;r2--){int t2=(pa[q]-48)*(pb[r2]-48)+res[q+r2+1];res[q+r2+1]=t2%10;res[q+r2]+=t2/10;}int st2=0;while(st2<tot-1&&res[st2]==0)st2++;for(int q=st2;q<tot;q++)putchar(48+res[q]);putchar(10);}` },

  { id: "hard-kmp", title: "子串出现次数", desc: "统计字符串 $b$ 在字符串 $a$ 中作为**连续子串**出现的次数（允许重叠）。", cfg: { nMin: 4, nMax: 16, alpha: "ab" }, shape: "str2",
    js: ({ a, b }) => { let c = 0; for (let q = 0; q + b.length <= a.length; q++) if (a.startsWith(b, q)) c++; return String(c); },
    py: "c = 0\nlb2 = len(b)\nfor q in range(0, len(a) - lb2 + 1):\n    if a[q:q + lb2] == b:\n        c += 1\nprint(c)",
    cpp: 'int c=0;for(int q=0;q+(int)b.size()<=(int)a.size();q++)if(a.compare(q,b.size(),b)==0)c++;cout<<c<<"\\n";',
    c: `int cnt=0;for(int q=0;q+lb<=la;q++){int ok=1;for(int r2=0;r2<lb;r2++)if(a[q+r2]!=b[r2]){ok=0;break;}if(ok)cnt++;}printf("%d\\n",cnt);` },
];

/* =================================================================
 * 图论 / 树
 * ================================================================= */
const GRAPH_HARD_OPS = [
  { id: "hard-dijkstra", title: "单源最短路", desc: "给定一张 $n$ 个点、$m$ 条边的**无向**带权图（边权为正），求从 $1$ 号点到 $n$ 号点的最短距离；若不可达输出 `-1`。", cfg: { nMin: 4, nMax: 20, wMax: 50 }, shape: "edgesW",
    js: ({ n, edges }) => { const LIM = Number.MAX_SAFE_INTEGER; const d = new Array(n + 1).fill(LIM); d[1] = 0; for (let it = 0; it < n; it++) { let changed = false; for (const [u, v, w] of edges) { if (d[u] < LIM && d[u] + w < d[v]) { d[v] = d[u] + w; changed = true; } if (d[v] < LIM && d[v] + w < d[u]) { d[u] = d[v] + w; changed = true; } } if (!changed) break; } return d[n] >= LIM ? "-1" : String(d[n]); },
    py: "INF = float(\"inf\")\nd = [INF] * (n + 1)\nd[1] = 0\nfor _ in range(n):\n    changed = False\n    for u, v, w in edges:\n        if d[u] + w < d[v]:\n            d[v] = d[u] + w; changed = True\n        if d[v] + w < d[u]:\n            d[u] = d[v] + w; changed = True\n    if not changed:\n        break\nprint(-1 if d[n] == INF else d[n])",
    cpp: 'vector<long long>d(n+1,LLONG_MAX);d[1]=0;for(int it=0;it<n;it++){bool ch=false;for(auto&e:edges){int u=e[0],v=e[1],w=e[2];if(d[u]<LLONG_MAX&&d[u]+w<d[v]){d[v]=d[u]+w;ch=true;}if(d[v]<LLONG_MAX&&d[v]+w<d[u]){d[u]=d[v]+w;ch=true;}}if(!ch)break;}if(d[n]>=LLONG_MAX)cout<<-1<<"\\n";else cout<<d[n]<<"\\n";',
    c: `static long long d[100005];for(i=1;i<=n;i++)d[i]=${BIG};d[1]=0;for(int it=0;it<n;it++){int ch=0;for(int e=0;e<m;e++){if(d[eu[e]]<${BIG}&&d[eu[e]]+ew[e]<d[ev[e]]){d[ev[e]]=d[eu[e]]+ew[e];ch=1;}if(d[ev[e]]<${BIG}&&d[ev[e]]+ew[e]<d[eu[e]]){d[eu[e]]=d[ev[e]]+ew[e];ch=1;}}if(!ch)break;}if(d[n]>=${BIG})printf("-1\\n");else printf("%lld\\n",d[n]);` },

  { id: "hard-mst", title: "最小生成树", desc: "给定一张 $n$ 个点、$m$ 条边的无向带权图，求最小生成树的边权之和；若图不连通输出 `-1`。", cfg: { nMin: 4, nMax: 20, wMax: 50 }, shape: "edgesW",
    js: ({ n, edges }) => { const ord = edges.map((e, i2) => i2).sort((x, y) => edges[x][2] - edges[y][2]); const par = Array.from({ length: n + 1 }, (_, i2) => i2); const find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }; let total = 0, used = 0; for (const e of ord) { const x = find(edges[e][0]), y = find(edges[e][1]); if (x !== y) { par[x] = y; total += edges[e][2]; used++; } } return used === n - 1 ? String(total) : "-1"; },
    py: "par = list(range(n + 1))\ndef find(x):\n    while par[x] != x:\n        par[x] = par[par[x]]\n        x = par[x]\n    return x\ntotal = 0\nused = 0\nfor u, v, w in sorted(edges, key=lambda e: e[2]):\n    a2, b2 = find(u), find(v)\n    if a2 != b2:\n        par[a2] = b2\n        total += w\n        used += 1\nprint(total if used == n - 1 else -1)",
    cpp: 'vector<int>ord(m);for(int i2=0;i2<m;i2++)ord[i2]=i2;sort(ord.begin(),ord.end(),[&](int x,int y){return edges[x][2]<edges[y][2];});vector<int>par(n+1);for(int i2=0;i2<=n;i2++)par[i2]=i2;function<int(int)>find=[&](int x){while(par[x]!=x){par[x]=par[par[x]];x=par[x];}return x;};long long total=0;int used=0;for(int e2:ord){int x=find(edges[e2][0]),y=find(edges[e2][1]);if(x!=y){par[x]=y;total+=edges[e2][2];used++;}}if(used==n-1)cout<<total<<"\\n";else cout<<-1<<"\\n";',
    c: `static int ord[100005],par[100005];for(i=0;i<m;i++)ord[i]=i;for(int e=1;e<m;e++){int cur2=ord[e];int w2=ew[cur2];int j2=e-1;while(j2>=0&&ew[ord[j2]]>w2){ord[j2+1]=ord[j2];j2--;}ord[j2+1]=cur2;}for(i=1;i<=n;i++)par[i]=i;long long total=0;int used=0;for(int e=0;e<m;e++){int x=eu[ord[e]],y=ev[ord[e]];while(par[x]!=x){par[x]=par[par[x]];x=par[x];}while(par[y]!=y){par[y]=par[par[y]];y=par[y];}if(x!=y){par[x]=y;total+=ew[ord[e]];used++;}}if(used==n-1)printf("%lld\\n",total);else printf("-1\\n");` },

  { id: "hard-floyd", title: "所有点对最短路之和", desc: "给定一张 $n$ 个点、$m$ 条边的连通无向带权图，求所有点对 $i < j$ 之间最短距离之和。", cfg: { nMin: 4, nMax: 24, wMax: 20 }, shape: "edgesW",
    js: ({ n, edges }) => { const LIM = Number.MAX_SAFE_INTEGER; const d = Array.from({ length: n + 1 }, (_, i2) => Array.from({ length: n + 1 }, (_, j2) => (i2 === j2 ? 0 : LIM))); for (const [u, v, w] of edges) if (w < d[u][v]) { d[u][v] = w; d[v][u] = w; } for (let k = 1; k <= n; k++) for (let q = 1; q <= n; q++) for (let r2 = 1; r2 <= n; r2++) if (d[q][k] < LIM && d[k][r2] < LIM && d[q][k] + d[k][r2] < d[q][r2]) d[q][r2] = d[q][k] + d[k][r2]; let s2 = 0; for (let q = 1; q <= n; q++) for (let r2 = q + 1; r2 <= n; r2++) s2 += d[q][r2]; return String(s2); },
    py: "INF = float(\"inf\")\nd = [[0 if i2 == j2 else INF for j2 in range(n + 1)] for i2 in range(n + 1)]\nfor u, v, w in edges:\n    if w < d[u][v]:\n        d[u][v] = w\n        d[v][u] = w\nfor k in range(1, n + 1):\n    for q in range(1, n + 1):\n        for r2 in range(1, n + 1):\n            if d[q][k] + d[k][r2] < d[q][r2]:\n                d[q][r2] = d[q][k] + d[k][r2]\nprint(sum(d[q][r2] for q in range(1, n + 1) for r2 in range(q + 1, n + 1)))",
    cpp: 'const long long INF=LLONG_MAX/4;vector<vector<long long>>d(n+1,vector<long long>(n+1,INF));for(int i2=1;i2<=n;i2++)d[i2][i2]=0;for(auto&e:edges){int u=e[0],v=e[1],w=e[2];if(w<d[u][v]){d[u][v]=w;d[v][u]=w;}}for(int k=1;k<=n;k++)for(int q=1;q<=n;q++)for(int r2=1;r2<=n;r2++)if(d[q][k]<INF&&d[k][r2]<INF&&d[q][k]+d[k][r2]<d[q][r2])d[q][r2]=d[q][k]+d[k][r2];long long s2=0;for(int q=1;q<=n;q++)for(int r2=q+1;r2<=n;r2++)s2+=d[q][r2];cout<<s2<<"\\n";',
    c: `static long long dm[105][105];for(int q=1;q<=n;q++)for(int r2=1;r2<=n;r2++)dm[q][r2]=(q==r2?0:${BIG});for(int e=0;e<m;e++){int u=eu[e],v=ev[e],w=ew[e];if(w<dm[u][v]){dm[u][v]=w;dm[v][u]=w;}}for(int k2=1;k2<=n;k2++)for(int q=1;q<=n;q++)for(int r2=1;r2<=n;r2++)if(dm[q][k2]<${BIG}&&dm[k2][r2]<${BIG}&&dm[q][k2]+dm[k2][r2]<dm[q][r2])dm[q][r2]=dm[q][k2]+dm[k2][r2];long long s2=0;for(int q=1;q<=n;q++)for(int r2=q+1;r2<=n;r2++)s2+=dm[q][r2];printf("%lld\\n",s2);` },

  { id: "hard-tree-diameter", title: "树的直径", desc: "给定一棵以 $1$ 为根的树（用每个节点的父节点表示），求树的直径，即任意两点间距离的最大值（以边数计）。", cfg: { nMin: 4, nMax: 10 }, shape: "treeFather",
    js: ({ n, f }) => { const h = new Array(n + 1).fill(0), t1 = new Array(n + 1).fill(0), t2 = new Array(n + 1).fill(0); for (let u = n; u >= 2; u--) { const p = f[u - 1]; const v = h[u] + 1; if (v > t1[p]) { t2[p] = t1[p]; t1[p] = v; } else if (v > t2[p]) t2[p] = v; if (v > h[p]) h[p] = v; } let best = 0; for (let u = 1; u <= n; u++) best = Math.max(best, t1[u] + t2[u]); return String(best); },
    py: "h = [0] * (n + 1)\nt1 = [0] * (n + 1)\nt2 = [0] * (n + 1)\nfor u in range(n, 1, -1):\n    p = f[u - 1]\n    v = h[u] + 1\n    if v > t1[p]:\n        t2[p] = t1[p]; t1[p] = v\n    elif v > t2[p]:\n        t2[p] = v\n    if v > h[p]:\n        h[p] = v\nprint(max(t1[u] + t2[u] for u in range(1, n + 1)))",
    cpp: 'vector<int>h(n+1,0),t1(n+1,0),t2(n+1,0);for(int u=n;u>=2;u--){int p=f[u-1];int v=h[u]+1;if(v>t1[p]){t2[p]=t1[p];t1[p]=v;}else if(v>t2[p])t2[p]=v;if(v>h[p])h[p]=v;}int best=0;for(int u=1;u<=n;u++)best=max(best,t1[u]+t2[u]);cout<<best<<"\\n";',
    c: `static int h[100005],tt1[100005],tt2[100005];for(i=0;i<=n;i++){h[i]=0;tt1[i]=0;tt2[i]=0;}for(int u=n;u>=2;u--){int p=f[u-1];int v=h[u]+1;if(v>tt1[p]){tt2[p]=tt1[p];tt1[p]=v;}else if(v>tt2[p])tt2[p]=v;if(v>h[p])h[p]=v;}int best=0;for(i=1;i<=n;i++){int s2=tt1[i]+tt2[i];if(s2>best)best=s2;}printf("%d\\n",best);` },
];

/* =================================================================
 * 矩阵类
 * ================================================================= */
const MATRIX_HARD_OPS = [
  { id: "hard-max-submatrix", title: "最大子矩阵和", desc: "求矩阵中一个（非空的）子矩阵，使其元素之和最大，输出这个最大值。", cfg: { nMin: 2, nMax: 6, lo: -10, hi: 10 }, shape: "matrix",
    js: ({ n, m, g }) => { let best = -Infinity; for (let top = 0; top < n; top++) { const cs = new Array(m).fill(0); for (let bot = top; bot < n; bot++) { for (let z = 0; z < m; z++) cs[z] += g[bot][z]; let cur = 0; for (let z = 0; z < m; z++) { cur = Math.max(cs[z], cur + cs[z]); best = Math.max(best, cur); } } } return String(best); },
    py: "best = None\nfor top in range(n):\n    cs = [0] * m\n    for bot in range(top, n):\n        for z in range(m):\n            cs[z] += g[bot][z]\n        cur = 0\n        for z in range(m):\n            cur = max(cs[z], cur + cs[z])\n            if best is None or cur > best:\n                best = cur\nprint(best)",
    cpp: 'long long best=LLONG_MIN;for(int top=0;top<n;top++){vector<long long>cs(m,0);for(int bot=top;bot<n;bot++){for(int z=0;z<m;z++)cs[z]+=g[bot][z];long long cur=0;for(int z=0;z<m;z++){cur=max(cs[z],cur+cs[z]);best=max(best,cur);}}}cout<<best<<"\\n";',
    c: `static long long cs[1005];long long best=-(${BIG});for(int top=0;top<n;top++){for(z=0;z<m;z++)cs[z]=0;for(int bot=top;bot<n;bot++){for(z=0;z<m;z++)cs[z]+=g[bot][z];long long cur=0;for(z=0;z<m;z++){cur=cs[z]>cur+cs[z]?cs[z]:cur+cs[z];if(cur>best)best=cur;}}}printf("%lld\\n",best);` },

  { id: "hard-tsp", title: "旅行商问题", desc: "给定 $n$ 个城市两两之间的距离矩阵，从 $0$ 号城市出发，访问每个城市恰好一次并回到 $0$ 号城市，求总路程的最小值。", cfg: { nMin: 3, nMax: 6, lo: 1, hi: 20 }, shape: "matrix",
    js: ({ n, g }) => { const FULL = (1 << n) - 1; const LIM = Infinity; const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(LIM)); dp[1][0] = 0; for (let mask = 1; mask <= FULL; mask++) for (let u = 0; u < n; u++) { if (dp[mask][u] === LIM) continue; for (let v = 0; v < n; v++) { if (mask & (1 << v)) continue; const nm = mask | (1 << v); const nv = dp[mask][u] + g[u][v]; if (nv < dp[nm][v]) dp[nm][v] = nv; } } let best = LIM; for (let u = 1; u < n; u++) best = Math.min(best, dp[FULL][u] + g[u][0]); return String(best); },
    py: "INF = float(\"inf\")\nFULL = (1 << n) - 1\ndp = [[INF] * n for _ in range(1 << n)]\ndp[1][0] = 0\nfor mask in range(1, FULL + 1):\n    for u in range(n):\n        if dp[mask][u] == INF:\n            continue\n        for v in range(n):\n            if mask & (1 << v):\n                continue\n            nm = mask | (1 << v)\n            nv = dp[mask][u] + g[u][v]\n            if nv < dp[nm][v]:\n                dp[nm][v] = nv\nprint(min(dp[FULL][u] + g[u][0] for u in range(1, n)))",
    cpp: 'int FULL=(1<<n)-1;const long long INF=LLONG_MAX/4;vector<vector<long long>>dpm(1<<n,vector<long long>(n,INF));dpm[1][0]=0;for(int mask=1;mask<=FULL;mask++)for(int u=0;u<n;u++){if(dpm[mask][u]>=INF)continue;for(int v=0;v<n;v++){if(mask&(1<<v))continue;int nm=mask|(1<<v);long long nv=dpm[mask][u]+g[u][v];if(nv<dpm[nm][v])dpm[nm][v]=nv;}}long long best=INF;for(int u=1;u<n;u++)best=min(best,dpm[FULL][u]+g[u][0]);cout<<best<<"\\n";',
    c: `static long long dpm[70][10];int FULL=(1<<n)-1;for(int a2=0;a2<=FULL;a2++)for(int b2=0;b2<n;b2++)dpm[a2][b2]=${BIG};dpm[1][0]=0;for(int mask=1;mask<=FULL;mask++)for(int u2=0;u2<n;u2++){if(dpm[mask][u2]>=${BIG})continue;for(int v2=0;v2<n;v2++){if(mask&(1<<v2))continue;int nm=mask|(1<<v2);long long nv=dpm[mask][u2]+g[u2][v2];if(nv<dpm[nm][v2])dpm[nm][v2]=nv;}}long long best=${BIG};for(int u2=1;u2<n;u2++){long long t2=dpm[FULL][u2]+g[u2][0];if(t2<best)best=t2;}printf("%lld\\n",best);` },
];

/* =================================================================
 * 二分图匹配
 * ================================================================= */
const BIPARTITE_OPS = [
  { id: "hard-hungarian", title: "二分图最大匹配", desc: "给定一个二分图（左部 $n_L$ 个点、右部 $n_R$ 个点，以及若干条边），求最大匹配的边数。", cfg: { nMin: 2, nMax: 6, mMax: 12 }, shape: "bipartite",
    js: ({ nL, nR, edges }) => { const adj = Array.from({ length: nL + 1 }, () => []); for (const [u, v] of edges) adj[u].push(v); const matchR = new Array(nR + 1).fill(0); const tryK = (u, seen) => { for (const v of adj[u]) { if (seen[v]) continue; seen[v] = true; if (matchR[v] === 0 || tryK(matchR[v], seen)) { matchR[v] = u; return true; } } return false; }; let res = 0; for (let u = 1; u <= nL; u++) if (tryK(u, new Array(nR + 1).fill(false))) res++; return String(res); },
    py: "adj = [[] for _ in range(nL + 1)]\nfor u, v in edges:\n    adj[u].append(v)\nmatchR = [0] * (nR + 1)\ndef tryk(u, seen):\n    for v in adj[u]:\n        if seen[v]:\n            continue\n        seen[v] = True\n        if matchR[v] == 0 or tryk(matchR[v], seen):\n            matchR[v] = u\n            return True\n    return False\nres = 0\nfor u in range(1, nL + 1):\n    if tryk(u, [False] * (nR + 1)):\n        res += 1\nprint(res)",
    cpp: 'vector<vector<int>>adj(nL+1);for(auto&e:edges)adj[e.first].push_back(e.second);vector<int>matchR(nR+1,0);function<bool(int,vector<int>&)>tryk=[&](int u,vector<int>&seen){for(int v:adj[u]){if(seen[v])continue;seen[v]=1;if(matchR[v]==0||tryk(matchR[v],seen)){matchR[v]=u;return true;}}return false;};int res=0;for(int u=1;u<=nL;u++){vector<int>seen(nR+1,0);if(tryk(u,seen))res++;}cout<<res<<"\\n";',
    c: `for(i=0;i<=nL;i++)deg[i]=0;for(i=0;i<m;i++){int u=bu[i],v=bv[i];int dup=0;for(int q=0;q<deg[u];q++)if(adj[u][q]==v){dup=1;break;}if(!dup)adj[u][deg[u]++]=v;}for(i=0;i<=nR;i++)matchR[i]=0;int res=0;for(int u=1;u<=nL;u++){for(int q=0;q<=nR;q++)seen[q]=0;if(tryk(u))res++;}printf("%d\\n",res);`,
    cExtra: `static int adj[105][105],deg[105],matchR[105],seen[105];\nstatic int tryk(int u){for(int q=0;q<deg[u];q++){int v=adj[u][q];if(seen[v])continue;seen[v]=1;if(matchR[v]==0||tryk(matchR[v])){matchR[v]=u;return 1;}}return 0;}\n` },
];

/* ---------- 组装 ---------- */
const META = (topic, tags, hint) => ({ difficulty: "困难", topic, tags, hint });

export const hardFamilies = [
  ...expand({ ...META("分治与双指针", ["分治", "归并排序"], "归并排序的过程中，右半部分元素被取出时就能顺带统计逆序对。"), shape: "arr", ops: ARR_OPS.filter((o) => !o.shape), variants: V8 }),
  ...expand({ ...META("分治与双指针", ["滑动窗口", "堆"], "维护候选集合的最小值/最大值，可以边扫描边更新答案。"), shape: "arrKIndex", ops: ARR_OPS.filter((o) => o.shape === "arrKIndex"), variants: V8 }),
  ...expand({ ...META("字符串算法", ["字符串", "中心扩展"], "枚举每个中心向两边扩展，注意奇偶两种长度的回文。"), shape: "str", ops: STR_OPS, variants: V8 }),
  ...expand({ ...META("数论与计数", ["数论", "递推"], "注意数据范围与边界情况，按定义逐步计算即可。"), shape: "num", ops: NUM_OPS.filter((o) => o.shape === "num" && o.id !== "hard-nqueens"), variants: V8 }),
  ...expand({ ...META("回溯算法", ["回溯", "位运算"], "用位掩码记录已被占用的列与两条对角线。"), shape: "num", ops: NUM_OPS.filter((o) => o.id === "hard-nqueens"), variants: V4S }),
  ...expand({ ...META("数据结构与模拟", ["模拟", "递推"], "把圈上的人映射成一条不断缩短的队列，递推求解。"), shape: "numK", ops: NUM_OPS.filter((o) => o.id === "hard-josephus"), variants: V8 }),
  ...expand({ ...META("排列组合", ["排列组合", "数学"], "第 $i$ 位由剩余数字中的第 $\\lfloor k / (n-1)! \\rfloor$ 个决定。"), shape: "numK", ops: NUM_OPS.filter((o) => o.id === "hard-kth-perm"), variants: V4S }),
  ...expand({ ...META("动态规划", ["动态规划", "完全背包"], "完全背包：外层枚举硬币，内层从小到大枚举金额。"), shape: "arrK", ops: NUM_OPS.filter((o) => o.shape === "arrK"), variants: V8 }),
  ...expand({ ...META("大数运算", ["大数运算", "高精度"], "用字符串模拟竖式运算，注意进位与结果的前导零。"), shape: "bignum", ops: STR2_OPS.filter((o) => o.shape === "bignum"), variants: V8 }),
  ...expand({ ...META("字符串算法", ["字符串匹配"], "逐位比较即可；数据规模较大时可以用 KMP 优化到线性。"), shape: "str2", ops: STR2_OPS.filter((o) => o.shape === "str2"), variants: V8 }),
  ...expand({ ...META("图论", ["最短路", "最小生成树"], "带权无向图上的经典问题，注意不可达与不连通的情况。"), shape: "edgesW", ops: GRAPH_HARD_OPS.filter((o) => o.shape === "edgesW" && o.id !== "hard-floyd"), variants: V8 }),
  ...expand({ ...META("图论", ["Floyd", "全源最短路"], "三重循环枚举中转点，注意先初始化邻接矩阵。"), shape: "edgesW", ops: GRAPH_HARD_OPS.filter((o) => o.id === "hard-floyd"), variants: V4S }),
  ...expand({ ...META("树", ["树形 DP"], "父节点编号一定小于子节点，倒序递推即可统计每棵子树的高度。"), shape: "treeFather", ops: GRAPH_HARD_OPS.filter((o) => o.shape === "treeFather"), variants: V8 }),
  ...expand({ ...META("动态规划", ["区间 DP", "状态压缩"], "先枚举行区间，再把二维问题压成一维的最大子段和。"), shape: "matrix", ops: MATRIX_HARD_OPS, variants: V4S }),
  ...expand({ ...META("图论", ["二分图", "匈牙利算法"], "枚举左部每个点，用 DFS 寻找增广路。"), shape: "bipartite", ops: BIPARTITE_OPS, variants: V4S }),
].filter((f) => !DUP_DROP.has(f.key));
