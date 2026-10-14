/**
 * 中等难度扩展题库（第一批：双指针 / 滑动窗口 / 前缀和 / 二分 / 排序）。
 * 每个题型只出现一次，题面与算法互不相同。
 */
import { SHAPES } from "../lib/shapes.mjs";
import { numsOf, tasks } from "../lib/tasks.mjs";

/* ---------- 新增输入形状 ---------- */
SHAPES.arrQ = {
  py: "n = int(data[0])\na = list(map(int, data[1:1 + n]))\nT = int(data[1 + n])\nqs = [(int(data[2 + n + i * 2]), int(data[3 + n + i * 2])) for i in range(T)]\n",
  cpp: "int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;int T;cin>>T;vector<pair<int,int>>qs(T);for(auto&q:qs)cin>>q.first>>q.second;",
  c: "int n,i;static long long a[500005];if(scanf(\"%d\",&n)!=1)return 1;for(i=0;i<n;i++)scanf(\"%lld\",&a[i]);int T,j2;static int ql[20005],qr[20005];if(scanf(\"%d\",&T)!=1)return 1;for(j2=0;j2<T;j2++)scanf(\"%d %d\",&ql[j2],&qr[j2]);",
  parse: (t) => {
    const v = numsOf(t);
    const n = v[0];
    const a = v.slice(1, 1 + n);
    const T = v[1 + n];
    const qs = [];
    for (let i = 0; i < T; i++) qs.push([v[2 + n + i * 2], v[3 + n + i * 2]]);
    return { n, a, T, qs };
  },
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 5, cfg.nMax ?? 10);
    const a = r.intArray(n, cfg.lo ?? 1, cfg.hi ?? 30);
    const T = r.int(cfg.tMin ?? 2, cfg.tMax ?? 4);
    const lines = [];
    for (let i = 0; i < T; i++) {
      let l = r.int(1, n), rr = r.int(1, n);
      if (l > rr) { const t = l; l = rr; rr = t; }
      lines.push(`${l} ${rr}`);
    }
    return `${n}\n${a.join(" ")}\n${T}\n${lines.join("\n")}\n`;
  },
};

SHAPES.arrSorted = {
  py: "n = int(data[0])\na = list(map(int, data[1:1 + n]))\n",
  cpp: "int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;",
  c: "int n,i;static long long a[500005];if(scanf(\"%d\",&n)!=1)return 1;for(i=0;i<n;i++)scanf(\"%lld\",&a[i]);",
  parse: SHAPES.arr.parse,
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 5, cfg.nMax ?? 12);
    const a = r.intArray(n, cfg.lo ?? 0, cfg.hi ?? 60).sort((x, y) => x - y);
    return `${n}\n${a.join(" ")}\n`;
  },
};

SHAPES.arrSortedK = {
  py: "n = int(data[0])\na = list(map(int, data[1:1 + n]))\nk = int(data[1 + n])\n",
  cpp: "int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;long long k;cin>>k;",
  c: "int n,i;static long long a[500005];if(scanf(\"%d\",&n)!=1)return 1;for(i=0;i<n;i++)scanf(\"%lld\",&a[i]);long long k;if(scanf(\"%lld\",&k)!=1)return 1;",
  parse: SHAPES.arrK.parse,
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 5, cfg.nMax ?? 12);
    const a = r.intArray(n, cfg.lo ?? 0, cfg.hi ?? 30).sort((x, y) => x - y);
    return `${n}\n${a.join(" ")}\n${r.int(cfg.lo ?? 0, cfg.hi ?? 30)}\n`;
  },
};

const IA = "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$，用空格隔开。";
const IAK = "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$；第三行一个整数 $k$。";
const IAKI = "第一行一个整数 $n$（$2 \\le n \\le 20$）；第二行 $n$ 个整数 $a_i$；第三行一个整数 $k$（$1 \\le k \\le n$）。";
const IAQ = "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$；第三行一个整数 $T$；接下来 $T$ 行每行两个整数 $l, r$（$1 \\le l \\le r \\le n$）。";
const IASK = "第一行一个整数 $n$；第二行 $n$ 个**升序排列**的整数 $a_i$；第三行一个整数 $k$。";
const IAS = "第一行一个整数 $n$；第二行 $n$ 个**升序排列**的整数 $a_i$。";
const SORT_DESC = "for(i2=0;i2<n;i2++)for(j2=i2+1;j2<n;j2++)if(b2[j2]>b2[i2]){long long t2=b2[i2];b2[i2]=b2[j2];b2[j2]=t2;}";
const SORT_ASC = "for(i2=0;i2<n;i2++)for(j2=i2+1;j2<n;j2++)if(b2[j2]<b2[i2]){long long t2=b2[i2];b2[i2]=b2[j2];b2[j2]=t2;}";
const COPY = "static long long b2[500005];int i2,j2;for(i2=0;i2<n;i2++)b2[i2]=a[i2];";

const ROWS = [
  {
    id: "mx-two-sum-exists", title: "是否存在两数之和为 k", shape: "arrK", cfg: { nMin: 4, nMax: 12, lo: 1, hi: 20, kMin: 3, kMax: 40 }, inputFormat: IAK,
    topic: "数组与双指针", tags: ["双指针", "哈希"], hint: "边扫描边用一个集合记录已经出现过的数，检查 $k-x$ 是否出现过。",
    desc: "判断数组中是否存在两个**下标不同**的元素，它们的和恰好等于 $k$。若存在输出 `YES`，否则输出 `NO`。",
    js: ({ a, k }) => { const s = new Set(); for (const x of a) { if (s.has(k - x)) return "YES"; s.add(x); } return "NO"; },
    py: "s = set()\nans = \"NO\"\nfor x in a:\n    if k - x in s:\n        ans = \"YES\"\n        break\n    s.add(x)\nprint(ans)",
    cpp: 'set<long long>st;string ans="NO";for(auto x:a){if(st.count(k-x)){ans="YES";break;}st.insert(x);}cout<<ans<<"\\n";',
    c: 'int ok=0,i2,j2;for(i2=0;i2<n&&!ok;i2++)for(j2=i2+1;j2<n;j2++)if(a[i2]+a[j2]==k){ok=1;break;}printf("%s\\n",ok?"YES":"NO");',
  },
  {
    id: "mx-min-subarray-len-ge-k", title: "和至少为 k 的最短子数组长度", shape: "arrK", cfg: { nMin: 5, nMax: 14, lo: 1, hi: 10, kMin: 8, kMax: 40 }, inputFormat: IAK,
    topic: "滑动窗口", tags: ["滑动窗口", "双指针"], hint: "右端点一直往右扩，当窗口和已经不小于 $k$ 时就不断收缩左端点并更新答案。",
    desc: "数组元素均为正整数，求**元素之和至少为 $k$** 的连续子数组中最短的一个的长度；若不存在输出 -1。",
    js: ({ a, k }) => { let best = Infinity, s = 0, l = 0; for (let r = 0; r < a.length; r++) { s += a[r]; while (s >= k) { best = Math.min(best, r - l + 1); s -= a[l++]; } } return best === Infinity ? "-1" : `${best}`; },
    py: "INF = 10 ** 9\nbest = INF\ns = 0\nl = 0\nfor r in range(n):\n    s += a[r]\n    while s >= k:\n        if r - l + 1 < best:\n            best = r - l + 1\n        s -= a[l]\n        l += 1\nprint(-1 if best == INF else best)",
    cpp: 'long long best=1000000000LL,s=0;int l=0;for(int r=0;r<n;r++){s+=a[r];while(s>=k){best=min(best,(long long)(r-l+1));s-=a[l];l++;}}cout<<(best==1000000000LL?-1:best)<<"\\n";',
    c: 'long long best=1000000000LL,s=0;int l=0,r2;for(r2=0;r2<n;r2++){s+=a[r2];while(s>=k){long long len=r2-l+1;if(len<best)best=len;s-=a[l];l++;}}printf("%lld\\n",best==1000000000LL?-1:best);',
  },
  {
    id: "mx-longest-subarray-sum-le-k", title: "和不超过 k 的最长子数组长度", shape: "arrK", cfg: { nMin: 5, nMax: 14, lo: 1, hi: 10, kMin: 10, kMax: 40 }, inputFormat: IAK,
    topic: "滑动窗口", tags: ["滑动窗口"], hint: "窗口和超过 $k$ 时收缩左端点，否则更新最长长度。",
    desc: "数组元素均为正整数，求元素之和**不超过 $k$** 的连续子数组的最大长度。",
    js: ({ a, k }) => { let best = 0, s = 0, l = 0; for (let r = 0; r < a.length; r++) { s += a[r]; while (s > k) s -= a[l++]; best = Math.max(best, r - l + 1); } return `${best}`; },
    py: "best = 0\ns = 0\nl = 0\nfor r in range(n):\n    s += a[r]\n    while s > k:\n        s -= a[l]\n        l += 1\n    if r - l + 1 > best:\n        best = r - l + 1\nprint(best)",
    cpp: 'long long best=0,s=0;int l=0;for(int r=0;r<n;r++){s+=a[r];while(s>k){s-=a[l];l++;}best=max(best,(long long)(r-l+1));}cout<<best<<"\\n";',
    c: 'long long best=0,s=0;int l=0,r2;for(r2=0;r2<n;r2++){s+=a[r2];while(s>k){s-=a[l];l++;}if(r2-l+1>best)best=r2-l+1;}printf("%lld\\n",best);',
  },

  {
    id: "mx-range-sum-queries", title: "区间和查询", shape: "arrQ", cfg: { nMin: 5, nMax: 10, lo: 1, hi: 30, tMin: 2, tMax: 4 }, inputFormat: IAQ,
    topic: "前缀和", tags: ["前缀和"], hint: "先预处理前缀和数组，之后每次询问都能在 $O(1)$ 时间内回答。", outputFormat: "共 $T$ 行，每行一个整数，表示对应询问的区间和。",
    desc: "给定一个数组和 $T$ 次询问，每次询问给出一段区间 $[l, r]$，请输出该区间内所有元素之和。",
    js: ({ a, qs }) => qs.map(([l, r]) => a.slice(l - 1, r).reduce((s, x) => s + x, 0)).join("\n"),
    py: "p = [0] * (n + 1)\nfor i in range(n):\n    p[i + 1] = p[i] + a[i]\nfor l, r in qs:\n    print(p[r] - p[l - 1])",
    cpp: 'vector<long long>p(n+1,0);for(int z=0;z<n;z++)p[z+1]=p[z]+a[z];for(auto&q:qs)cout<<p[q.second]-p[q.first-1]<<"\\n";',
    c: 'static long long p2[500005];int t2;for(t2=0;t2<n;t2++)p2[t2+1]=p2[t2]+a[t2];for(t2=0;t2<T;t2++)printf("%lld\\n",p2[qr[t2]]-p2[ql[t2]-1]);',
  },
  {
    id: "mx-range-add-one-final", title: "多次区间加一后的数组", shape: "arrQ", cfg: { nMin: 5, nMax: 10, lo: 0, hi: 30, tMin: 2, tMax: 4 }, inputFormat: IAQ,
    topic: "差分数组", tags: ["差分"], hint: "把「区间加一」转化成差分数组上的两次单点修改，最后做一遍前缀和。",
    desc: "有 $T$ 次操作，每次操作把下标从 $l$ 到 $r$（含端点）的所有元素都加 $1$。请输出全部操作执行完毕后的数组，用空格隔开。",
    js: ({ a, qs }) => { const d = new Array(a.length + 1).fill(0); for (const [l, r] of qs) { d[l - 1]++; d[r]--; } let cur = 0; return a.map((v, i) => { cur += d[i]; return v + cur; }).join(" "); },
    py: "d = [0] * (n + 1)\nfor l, r in qs:\n    d[l - 1] += 1\n    d[r] -= 1\ncur = 0\nout = []\nfor i in range(n):\n    cur += d[i]\n    out.append(a[i] + cur)\nprint(*out)",
    cpp: 'vector<long long>d(n+1,0);for(auto&q:qs){d[q.first-1]++;d[q.second]--;}long long cur=0;for(int z=0;z<n;z++){cur+=d[z];cout<<a[z]+cur<<(z+1<n?" ":"\\n");}',
    c: 'static long long d2[500005];int t2;for(t2=0;t2<=n;t2++)d2[t2]=0;for(t2=0;t2<T;t2++){d2[ql[t2]-1]++;d2[qr[t2]]--;}long long cur=0;for(t2=0;t2<n;t2++){cur+=d2[t2];printf("%lld%c",a[t2]+cur,t2+1<n?32:10);}',
  },
  {
    id: "mx-lower-bound-index", title: "第一个不小于 k 的元素位置", shape: "arrSortedK", cfg: { nMin: 5, nMax: 12, lo: 0, hi: 30 }, inputFormat: IASK,
    topic: "二分查找", tags: ["二分查找"], hint: "手写二分：循环时不断缩小左右边界，最终左边界就是第一个不小于 $k$ 的位置。",
    desc: "数组已按升序排列。请找出**第一个大于等于 $k$** 的元素的下标（下标从 $0$ 开始计数）；若不存在这样的元素输出 -1。",
    js: ({ a, k }) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] >= k) hi = mid; else lo = mid + 1; } return lo < a.length ? `${lo}` : "-1"; },
    py: "lo = 0\nhi = n\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if a[mid] >= k:\n        hi = mid\n    else:\n        lo = mid + 1\nprint(lo if lo < n else -1)",
    cpp: 'int lo=0,hi=n;while(lo<hi){int mid=(lo+hi)/2;if(a[mid]>=k)hi=mid;else lo=mid+1;}cout<<(lo<n?lo:-1)<<"\\n";',
    c: 'int lo=0,hi=n,mid;while(lo<hi){mid=(lo+hi)/2;if(a[mid]>=k)hi=mid;else lo=mid+1;}printf("%d\\n",lo<n?lo:-1);',
  },

  {
    id: "mx-count-equal-k-in-sorted", title: "有序数组中 k 的出现次数", shape: "arrSortedK", cfg: { nMin: 5, nMax: 12, lo: 0, hi: 12 }, inputFormat: IASK,
    topic: "二分查找", tags: ["二分查找"], hint: "分别二分找「第一个等于 $k$ 的下标」与「第一个大于 $k$ 的下标」，两者之差就是出现次数。",
    desc: "数组已按升序排列。输出数值 $k$ 在数组中出现的次数（$k$ 可能不存在）。",
    js: ({ a, k }) => { const lb = (t) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] < t) lo = mid + 1; else hi = mid; } return lo; }; return `${lb(k + 1) - lb(k)}`; },
    py: "def lb(t):\n    lo = 0\n    hi = n\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] < t:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\nprint(lb(k + 1) - lb(k))",
    cpp: 'int c=0;for(auto x:a)if(x==k)c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=0;i<n;i++)if(a[i]==k)c++;printf("%d\\n",c);',
  },
  {
    id: "mx-nearest-to-k", title: "有序数组中距离 k 最近的元素", shape: "arrSortedK", cfg: { nMin: 5, nMax: 12, lo: 0, hi: 30 }, inputFormat: IASK,
    topic: "二分查找", tags: ["二分查找"], hint: "先二分找到插入位置，再比较相邻两个候选元素与 $k$ 的距离；距离相同时取较小的那个。",
    desc: "数组已按升序排列。输出数组中与 $k$ 的差的绝对值最小的那个元素；若有两个元素距离相同，输出**较小**的那个。",
    js: ({ a, k }) => { let best = a[0]; for (const x of a) if (Math.abs(x - k) < Math.abs(best - k) || (Math.abs(x - k) === Math.abs(best - k) && x < best)) best = x; return `${best}`; },
    py: "best = a[0]\nfor x in a:\n    if abs(x - k) < abs(best - k) or (abs(x - k) == abs(best - k) and x < best):\n        best = x\nprint(best)",
    cpp: 'long long best=a[0];for(auto x:a){long long d1=llabs(x-k),d2=llabs(best-k);if(d1<d2||(d1==d2&&x<best))best=x;}cout<<best<<"\\n";',
    c: 'long long best=a[0],d1,d2;for(i=0;i<n;i++){d1=a[i]-k;if(d1<0)d1=-d1;d2=best-k;if(d2<0)d2=-d2;if(d1<d2||(d1==d2&&a[i]<best))best=a[i];}printf("%lld\\n",best);',
  },
  {
    id: "mx-kth-largest", title: "第 k 大的元素", shape: "arrKIndex", cfg: { nMin: 4, nMax: 12, lo: 0, hi: 50 }, inputFormat: IAKI,
    topic: "排序", tags: ["排序"], hint: "把数组从大到小排序后，第 $k$ 个元素就是答案（下标 $k-1$）。",
    desc: "输出数组中**第 $k$ 大**的元素（$k$ 从 $1$ 开始计数，相等的元素分别计数）。",
    js: ({ a, k }) => `${[...a].sort((x, y) => y - x)[k - 1]}`,
    py: "b = sorted(a, reverse=True)\nprint(b[k - 1])",
    cpp: 'vector<long long>b=a;sort(b.begin(),b.end(),greater<long long>());cout<<b[k-1]<<"\\n";',
    c: COPY + SORT_DESC + 'printf("%lld\\n",b2[k-1]);',
  },


  {
    id: "mx-remove-all-k", title: "移除所有等于 k 的元素", shape: "arrK", cfg: { nMin: 4, nMax: 12, lo: 0, hi: 10, kMin: 0, kMax: 10 }, inputFormat: IAK,
    topic: "数组", tags: ["数组", "双指针"], hint: "直接把不等于 $k$ 的元素依次输出即可。",
    desc: "删除数组中所有等于 $k$ 的元素，把剩下的元素**按原来的顺序**输出，用空格隔开；若所有元素都被删除，则输出一个空行。",
    js: ({ a, k }) => a.filter((x) => x !== k).join(" "),
    py: "print(*[x for x in a if x != k])",
    cpp: 'int f=1;for(auto x:a)if(x!=k){if(!f)cout<<" ";cout<<x;f=0;}cout<<"\\n";',
    c: 'int f=1;for(i=0;i<n;i++)if(a[i]!=k){if(!f)putchar(32);printf("%lld",a[i]);f=0;}putchar(10);',
  },
  {
    id: "mx-sort-by-abs-desc", title: "按绝对值从大到小排序", shape: "arr", cfg: { nMin: 5, nMax: 12, lo: -40, hi: 40 }, inputFormat: IA,
    topic: "排序", tags: ["排序", "自定义比较"], hint: "自定义比较函数：先比较绝对值（大的排前面），绝对值相同时再比较数值本身（小的排前面）。",
    desc: "把数组按**绝对值从大到小**排序后输出，用空格隔开；若两个元素的绝对值相同，则数值较小的排在前面。",
    js: ({ a }) => [...a].sort((x, y) => { const ax = Math.abs(x), ay = Math.abs(y); if (ax !== ay) return ay - ax; return x - y; }).join(" "),
    py: "print(*sorted(a, key=lambda v: (-abs(v), v)))",
    cpp: 'sort(a.begin(),a.end(),[](long long x,long long y){long long ax=llabs(x),ay=llabs(y);if(ax!=ay)return ax>ay;return x<y;});for(int z=0;z<n;z++)cout<<a[z]<<(z+1<n?" ":"\\n");',
    c: 'static long long b2[500005];int i2,j2;for(i2=0;i2<n;i2++)b2[i2]=a[i2];for(i2=0;i2<n;i2++)for(j2=i2+1;j2<n;j2++){long long ax=b2[j2]<0?-b2[j2]:b2[j2],ay=b2[i2]<0?-b2[i2]:b2[i2];int sw=0;if(ax>ay)sw=1;else if(ax==ay&&b2[j2]<b2[i2])sw=1;if(sw){long long t2=b2[i2];b2[i2]=b2[j2];b2[j2]=t2;}}for(i2=0;i2<n;i2++)printf("%lld%c",b2[i2],i2+1<n?32:10);',
  },
  {
    id: "mx-mode-smallest-value", title: "出现次数最多的元素", shape: "arr", cfg: { nMin: 5, nMax: 14, lo: 0, hi: 8 }, inputFormat: IA,
    topic: "数组与统计", tags: ["计数"], hint: "先统计每个数值出现的次数，再在所有数值中挑选出现次数最多、数值最小的那个。",
    desc: "输出数组中出现次数最多的元素；若有多个元素的出现次数并列最多，输出其中**数值最小**的那个。",
    js: ({ a }) => { const m = new Map(); for (const x of a) m.set(x, (m.get(x) || 0) + 1); let bv = 0, bc = -1; for (const [v, c] of m) if (bc < 0 || c > bc || (c === bc && v < bv)) { bv = v; bc = c; } return `${bv}`; },
    py: "cnt = {}\nfor x in a:\n    cnt[x] = cnt.get(x, 0) + 1\nbest = None\nfor v, c in cnt.items():\n    if best is None or c > best[1] or (c == best[1] and v < best[0]):\n        best = (v, c)\nprint(best[0])",
    cpp: 'map<long long,long long>cnt;for(auto x:a)cnt[x]++;long long bv=0,bc=-1;for(auto&pr:cnt){if(bc<0||pr.second>bc||(pr.second==bc&&pr.first<bv)){bv=pr.first;bc=pr.second;}}cout<<bv<<"\\n";',
    c: 'long long bv=0,bc=-1;int i2,j2;for(i2=0;i2<n;i2++){long long c=0;for(j2=0;j2<n;j2++)if(a[j2]==a[i2])c++;if(bc<0||c>bc||(c==bc&&a[i2]<bv)){bv=a[i2];bc=c;}}printf("%lld\\n",bv);',
  },

  {
    id: "mx-sorted-longest-equal-run", title: "有序数组中最长的相等元素段", shape: "arrSorted", cfg: { nMin: 4, nMax: 14, lo: 0, hi: 4 }, inputFormat: IAS,
    topic: "数组与双指针", tags: ["双指针"], hint: "有序数组中相等的元素连在一起，统计每一段的长度并取最大值。",
    desc: "数组已按升序排列。输出同一个数值连续重复出现的最长长度。",
    js: ({ a }) => { let best = 0, cur = 0; for (let i = 0; i < a.length; i++) { cur = i > 0 && a[i] === a[i - 1] ? cur + 1 : 1; best = Math.max(best, cur); } return `${best}`; },
    py: "best = 0\ncur = 0\nfor i in range(n):\n    cur = cur + 1 if i > 0 and a[i] == a[i - 1] else 1\n    if cur > best:\n        best = cur\nprint(best)",
    cpp: 'long long best=0,cur=0;for(int z=0;z<n;z++){cur=(z>0&&a[z]==a[z-1])?cur+1:1;best=max(best,cur);}cout<<best<<"\\n";',
    c: 'long long best=0,cur=0;for(i=0;i<n;i++){cur=(i>0&&a[i]==a[i-1])?cur+1:1;if(cur>best)best=cur;}printf("%lld\\n",best);',
  },
  {
    id: "mx-min-adjacent-abs-diff", title: "相邻元素之差的最小绝对值", shape: "arr", cfg: { nMin: 3, nMax: 12, lo: 0, hi: 100 }, inputFormat: IA,
    topic: "数组", tags: ["数组", "遍历"], hint: "枚举每一对相邻元素，不断更新差值绝对值的最小值。",
    desc: "输出数组中所有相邻元素（$a_i$ 与 $a_{i+1}$）之差的绝对值的最小值（$n \\ge 2$）。",
    js: ({ a }) => { let m = Infinity; for (let i = 0; i + 1 < a.length; i++) m = Math.min(m, Math.abs(a[i + 1] - a[i])); return `${m}`; },
    py: "print(min(abs(a[i + 1] - a[i]) for i in range(n - 1)))",
    cpp: 'long long m=1000000000000000000LL;for(int z=0;z+1<n;z++)m=min(m,llabs(a[z+1]-a[z]));cout<<m<<"\\n";',
    c: 'long long m=1000000000000000000LL,d;for(i=0;i+1<n;i++){d=a[i+1]-a[i];if(d<0)d=-d;if(d<m)m=d;}printf("%lld\\n",m);',
  },
  {
    id: "mx-sum-after-remove-top-k", title: "去掉最大的 k 个元素后剩余元素之和", shape: "arrKIndex", cfg: { nMin: 4, nMax: 12, lo: 0, hi: 50 }, inputFormat: IAKI,
    topic: "排序", tags: ["排序"], hint: "从大到小排序后，把第 $k$ 个元素之后的元素全部累加。",
    desc: "请先删掉数组中**最大的 $k$ 个元素**，然后输出剩余所有元素之和。",
    js: ({ a, k }) => { const b = [...a].sort((x, y) => y - x).slice(k); return `${b.reduce((s, x) => s + x, 0)}`; },
    py: "b = sorted(a, reverse=True)\nprint(sum(b[k:]))",
    cpp: 'vector<long long>b=a;sort(b.begin(),b.end(),greater<long long>());long long s=0;for(int z=k;z<n;z++)s+=b[z];cout<<s<<"\\n";',
    c: COPY + SORT_DESC + 'long long s=0;for(i2=k;i2<n;i2++)s+=b2[i2];printf("%lld\\n",s);',
  },
  {
    id: "mx-subarray-sum-k-exists", title: "是否存在和为 k 的连续子数组", shape: "arrK", cfg: { nMin: 5, nMax: 14, lo: -5, hi: 10, kMin: -5, kMax: 20 }, inputFormat: IAK,
    topic: "前缀和", tags: ["前缀和", "哈希"], hint: "记录所有出现过的前缀和，若当前前缀和减去 $k$ 曾经出现过，就说明存在这样的区间。",
    desc: "判断数组中是否存在一段连续的子数组，其元素之和恰好等于 $k$（元素可以是负数）。若存在输出 `YES`，否则输出 `NO`。",
    js: ({ a, k }) => { const seen = new Set([0]); let s = 0; for (const x of a) { s += x; if (seen.has(s - k)) return "YES"; seen.add(s); } return "NO"; },
    py: "seen = {0}\ns = 0\nans = \"NO\"\nfor x in a:\n    s += x\n    if s - k in seen:\n        ans = \"YES\"\n        break\n    seen.add(s)\nprint(ans)",
    cpp: 'set<long long>seen;seen.insert(0);long long s=0;string ans="NO";for(auto x:a){s+=x;if(seen.count(s-k)){ans="YES";break;}seen.insert(s);}cout<<ans<<"\\n";',
    c: 'static long long p2[500005];int i2,j2,ok=0;p2[0]=0;for(i2=0;i2<n;i2++)p2[i2+1]=p2[i2]+a[i2];for(i2=0;i2<n&&!ok;i2++)for(j2=i2+1;j2<=n;j2++)if(p2[j2]-p2[i2]==k){ok=1;break;}printf("%s\\n",ok?"YES":"NO");',
  },
  {
    id: "mx-successor-in-sorted", title: "有序数组中比 k 大的最小元素", shape: "arrSortedK", cfg: { nMin: 5, nMax: 12, lo: 0, hi: 30 }, inputFormat: IASK,
    topic: "二分查找", tags: ["二分查找"], hint: "数组有序，从左往右找到第一个大于 $k$ 的元素就是答案（也可以用二分查找加速）。",
    desc: "数组已按升序排列。输出数组中**严格大于 $k$** 的最小元素；若不存在这样的元素输出 -1。",
    js: ({ a, k }) => { const b = a.filter((x) => x > k); return b.length ? `${b[0]}` : "-1"; },
    py: "b = [x for x in a if x > k]\nprint(min(b) if b else -1)",
    cpp: 'long long ans=-1;for(auto x:a)if(x>k){ans=x;break;}cout<<ans<<"\\n";',
    c: 'long long ans=-1;for(i=0;i<n;i++)if(a[i]>k){ans=a[i];break;}printf("%lld\\n",ans);',
  },
  {
    id: "mx-exactly-twice-count", title: "有序数组中恰好出现两次的元素个数", shape: "arrSorted", cfg: { nMin: 4, nMax: 14, lo: 0, hi: 6 }, inputFormat: IAS,
    topic: "数组与统计", tags: ["数组", "计数"], hint: "有序数组中相同的元素连在一起，统计每一段的长度，数出长度恰好为 $2$ 的段数。",
    desc: "数组已按升序排列。输出其中**恰好出现两次**的不同数值的个数。",
    js: ({ a }) => { let c = 0, run = 1; for (let i = 1; i <= a.length; i++) { if (i < a.length && a[i] === a[i - 1]) run++; else { if (run === 2) c++; run = 1; } } return `${c}`; },
    py: "c = 0\nrun = 1\nfor i in range(1, n + 1):\n    if i < n and a[i] == a[i - 1]:\n        run += 1\n    else:\n        if run == 2:\n            c += 1\n        run = 1\nprint(c)",
    cpp: 'int c=0,run=1;for(int z=1;z<=n;z++){if(z<n&&a[z]==a[z-1])run++;else{if(run==2)c++;run=1;}}cout<<c<<"\\n";',
    c: 'int c=0,run=1;for(i=1;i<=n;i++){if(i<n&&a[i]==a[i-1])run++;else{if(run==2)c++;run=1;}}printf("%d\\n",c);',
  },
];

export const medium_extraFamilies = tasks("中等", ROWS);
