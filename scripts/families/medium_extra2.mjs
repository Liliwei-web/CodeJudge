/**
 * 中等难度扩展题库（第二批）：下标统计 / 异或 / 乘积 / 平均 + 手工题型。
 */
import "./intro.mjs";
import "./medium.mjs";
import "./medium_extra.mjs";
import { SHAPES } from "../lib/shapes.mjs";
import { arrCondRows } from "../lib/arrcond.mjs";
import { strCondRows, SPREDS } from "../lib/strcond.mjs";
import { ARR_PREDS } from "../lib/preds.mjs";
import { numsOf, tasks } from "../lib/tasks.mjs";

SHAPES.strK = {
  py: "s = data[0]\nk = int(data[1])\n",
  cpp: "string s;long long k;cin>>s>>k;",
  c: "char s[100005];if(scanf(\"%100004s\",s)!=1)return 1;int n=(int)strlen(s),i;(void)n;long long k;if(scanf(\"%lld\",&k)!=1)return 1;",
  parse: (t) => { const v = t.trim().split(/\s+/); return { s: v[0], k: Number(v[1]) }; },
  gen: (r, cfg) => {
    const n = r.int(cfg.nMin ?? 5, cfg.nMax ?? 14);
    const alpha = cfg.alpha ?? "abcdefghijklmnopqrstuvwxyz";
    let s = "";
    for (let i = 0; i < n; i++) s += alpha[r.int(0, alpha.length - 1)];
    return `${s} ${r.int(cfg.kMin ?? 1, cfg.kMax ?? 25)}\n`;
  },
};

const IFA = "第一行一个整数 $n$（$1 \\le n \\le 200$）；第二行 $n$ 个整数 $a_i$，用空格隔开。";
const IFS = "一行，一个长度为 $n$ 的字符串 $s$（$1 \\le |s| \\le 200$），只由英文字母组成。";
const IFSK = "第一行一个字符串 $s$（只由小写字母组成）；第二行一个整数 $k$。";
const IA2 = "第一行一个整数 $n$；接下来两行，每行 $n$ 个整数，表示数组 $a$ 和数组 $b$。";
const IAK = "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$；第三行一个整数 $k$。";
const IAKI = "第一行一个整数 $n$（$2 \\le n \\le 20$）；第二行 $n$ 个整数 $a_i$；第三行一个整数 $k$（$1 \\le k \\le n$）。";
const IASK = "第一行一个整数 $n$；第二行 $n$ 个**升序排列**的整数 $a_i$；第三行一个整数 $k$。";

const A = arrCondRows({
  prefix: "mxb",
  preds: ARR_PREDS,
  reds: ["idxsum", "xor", "prod", "avg"],
  cfgBase: { nMin: 6, nMax: 20 },
  topic: "数组与统计",
  tags: ["数组", "统计"],
  inputFormat: IFA,
});

const B = arrCondRows({
  prefix: "mxc",
  preds: ARR_PREDS,
  reds: ["both"],
  cfgBase: { nMin: 6, nMax: 20 },
  topic: "数组与统计",
  tags: ["数组", "条件判断"],
  inputFormat: IFA,
});

const S = strCondRows({
  prefix: "mxs",
  preds: SPREDS,
  reds: ["consec"],
  topic: "字符串处理",
  tags: ["字符串"],
  inputFormat: IFS,
});

const H = [
  {
    id: "mxb-peak-count", title: "数组中峰值的个数", shape: "arr", cfg: { nMin: 5, nMax: 14, lo: 0, hi: 20 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "遍历"], hint: "对每个内部元素判断它是否同时大于左右两个相邻元素。",
    desc: "若 $a_i$ 同时大于它左边和右边的相邻元素（$1 \\le i \\le n-2$），就称它是一个峰值。输出数组中峰值的个数。",
    js: ({ a }) => { let c = 0; for (let i = 1; i + 1 < a.length; i++) if (a[i] > a[i - 1] && a[i] > a[i + 1]) c++; return `${c}`; },
    py: "c = 0\nfor i in range(1, n - 1):\n    if a[i] > a[i - 1] and a[i] > a[i + 1]:\n        c += 1\nprint(c)",
    cpp: 'int c=0;for(int z=1;z+1<n;z++)if(a[z]>a[z-1]&&a[z]>a[z+1])c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=1;i+1<n;i++)if(a[i]>a[i-1]&&a[i]>a[i+1])c++;printf("%d\\n",c);',
  },
  {
    id: "mxb-dedupe-keep-order", title: "数组中按首次出现顺序去重", shape: "arr", cfg: { nMin: 5, nMax: 14, lo: 0, hi: 8 }, inputFormat: IFA,
    topic: "数组与集合", tags: ["数组", "集合"], hint: "从左往右扫描，只输出第一次出现的数值。",
    desc: "删除数组中重复出现的元素，只保留每个数值**第一次**出现的那一次，输出剩下的元素，保持原来的先后顺序，用空格隔开。",
    js: ({ a }) => [...new Set(a)].join(" "),
    py: "seen = set()\no = []\nfor x in a:\n    if x not in seen:\n        seen.add(x)\n        o.append(x)\nprint(*o)",
    cpp: 'vector<long long>o;set<long long>st;for(auto x:a)if(!st.count(x)){st.insert(x);o.push_back(x);}for(size_t q=0;q<o.size();q++)cout<<o[q]<<(q+1<o.size()?" ":"\\n");',
    c: 'static long long o2[500005];int m2=0,i2,j2;for(i2=0;i2<n;i2++){int f=0;for(j2=0;j2<m2;j2++)if(o2[j2]==a[i2])f=1;if(!f)o2[m2++]=a[i2];}for(i2=0;i2<m2;i2++)printf("%lld%c",o2[i2],i2+1<m2?32:10);',
  },
  {
    id: "mxb-union-size", title: "两个数组的并集大小", shape: "arr2", cfg: { nMin: 4, nMax: 10, lo: 0, hi: 20 }, inputFormat: IA2,
    topic: "数组与集合", tags: ["集合"], hint: "把两个数组的元素都放进同一个集合，输出集合的大小。",
    desc: "输出在数组 $a$ 或数组 $b$ 中出现过的**不同数值**的个数（即两个数组并集的大小）。",
    js: ({ a, b }) => `${new Set([...a, ...b]).size}`,
    py: "print(len(set(a) | set(b)))",
    cpp: 'set<long long>st;for(auto x:a)st.insert(x);for(auto x:b)st.insert(x);cout<<st.size()<<"\\n";',
    c: 'static long long u2[500005];int m2=0,i2,j2;for(i2=0;i2<n;i2++){int f=0;for(j2=0;j2<m2;j2++)if(u2[j2]==a[i2])f=1;if(!f)u2[m2++]=a[i2];}for(i2=0;i2<n;i2++){int f=0;for(j2=0;j2<m2;j2++)if(u2[j2]==b[i2])f=1;if(!f)u2[m2++]=b[i2];}printf("%d\\n",m2);',
  },
  {
    id: "mxb-difference", title: "两个数组的差集", shape: "arr2", cfg: { nMin: 4, nMax: 10, lo: 0, hi: 20 }, inputFormat: IA2,
    topic: "数组与集合", tags: ["集合"], hint: "找出只在 $a$ 中出现、没有在 $b$ 中出现过的不同数值。",
    desc: "输出在数组 $a$ 中出现、但**没有**在数组 $b$ 中出现过的不同数值，按从小到大的顺序输出，用空格隔开；若不存在这样的数值则输出一个空行。",
    js: ({ a, b }) => [...new Set(a.filter((x) => !b.includes(x)))].sort((x, y) => x - y).join(" "),
    py: "cs = sorted(set(x for x in a if x not in b))\nprint(*cs)",
    cpp: 'set<long long>st;for(auto x:a)if(find(b.begin(),b.end(),x)==b.end())st.insert(x);for(auto x:st)cout<<x<<" ";cout<<"\\n";',
    c: 'static long long cs[500005];int m2=0,i2,j2,k2;long long t2;for(i2=0;i2<n;i2++){int inb=0,inm=0;for(j2=0;j2<n;j2++)if(b[j2]==a[i2])inb=1;for(k2=0;k2<m2;k2++)if(cs[k2]==a[i2])inm=1;if(!inb&&!inm)cs[m2++]=a[i2];}for(i2=0;i2<m2;i2++)for(j2=i2+1;j2<m2;j2++)if(cs[j2]<cs[i2]){t2=cs[i2];cs[i2]=cs[j2];cs[j2]=t2;}for(i2=0;i2<m2;i2++)printf("%lld%c",cs[i2],i2+1<m2?32:10);putchar(10);',
  },
  {
    id: "mxb-group-sum", title: "每 k 个元素一组求和", shape: "arrK", cfg: { nMin: 5, nMax: 15, lo: 0, hi: 20, kMin: 2, kMax: 4 }, inputFormat: IAK,
    topic: "数组", tags: ["数组", "分组"], hint: "按下标每 $k$ 个元素切成一组，最后一组可能不足 $k$ 个，也要输出它的和。",
    desc: "把数组从前往后每 $k$ 个元素分成一组（最后一组不足 $k$ 个也算一组），依次输出每一组元素之和，用空格隔开。",
    js: ({ a, k }) => { const o = []; for (let i = 0; i < a.length; i += k) o.push(a.slice(i, i + k).reduce((s, x) => s + x, 0)); return o.join(" "); },
    py: "o = []\nfor i in range(0, n, k):\n    o.append(sum(a[i:i + k]))\nprint(*o)",
    cpp: 'vector<long long>o;for(int z=0;z<n;z+=k){long long s=0;for(int w=z;w<n&&w<z+k;w++)s+=a[w];o.push_back(s);}for(size_t q=0;q<o.size();q++)cout<<o[q]<<(q+1<o.size()?" ":"\\n");',
    c: 'static long long o2[500005];int m2=0;long long z2,w2,s;for(z2=0;z2<n;z2+=k){s=0;for(w2=z2;w2<n&&w2<z2+k;w2++)s+=a[w2];o2[m2++]=s;}for(z2=0;z2<m2;z2++)printf("%lld%c",o2[z2],z2+1<m2?32:10);',
  },
  {
    id: "mxb-rotate-right", title: "循环右移 k 位后的数组", shape: "arrKIndex", cfg: { nMin: 5, nMax: 12, lo: 0, hi: 50 }, inputFormat: IAKI,
    topic: "数组", tags: ["数组"], hint: "右移 $k$ 位等价于把后 $k$ 个元素整体搬到数组最前面。",
    desc: "把数组循环右移 $k$ 位（越界的元素从最前面接回来），输出移动后的数组，用空格隔开。",
    js: ({ a, k }) => { const n = a.length, r = k % n; return [...a.slice(n - r), ...a.slice(0, n - r)].join(" "); },
    py: "r = k % n\nprint(*(a[n - r:] + a[:n - r]))",
    cpp: 'int r=k%n;for(int z=n-r;z<n;z++)cout<<a[z]<<" ";for(int z=0;z<n-r;z++)cout<<a[z]<<(z+1<n-r?" ":"\\n");',
    c: 'int r2=k%n;for(i=n-r2;i<n;i++)printf("%lld ",a[i]);for(i=0;i<n-r2;i++)printf("%lld%c",a[i],i+1<n-r2?32:10);putchar(10);',
  },
  {
    id: "mxb-count-greater-than-prev", title: "比前一个元素大的位置个数", shape: "arr", cfg: { nMin: 4, nMax: 14, lo: 0, hi: 50 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "遍历"], hint: "从第二个元素开始，逐个与它的前一个元素比较。",
    desc: "输出有多少个下标 $i$（$2 \\le i \\le n$，从 $1$ 开始计数）满足 $a_i > a_{i-1}$。",
    js: ({ a }) => { let c = 0; for (let i = 1; i < a.length; i++) if (a[i] > a[i - 1]) c++; return `${c}`; },
    py: "c = 0\nfor i in range(1, n):\n    if a[i] > a[i - 1]:\n        c += 1\nprint(c)",
    cpp: 'int c=0;for(int z=1;z<n;z++)if(a[z]>a[z-1])c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=1;i<n;i++)if(a[i]>a[i-1])c++;printf("%d\\n",c);',
  },
  {
    id: "mxb-max-pair-product", title: "任意两个元素乘积的最大值", shape: "arr", cfg: { nMin: 3, nMax: 12, lo: -20, hi: 30 }, inputFormat: IFA,
    topic: "数组与贪心", tags: ["排序", "贪心"], hint: "最大乘积只可能来自「最大的两个数」或者「最小的两个数」（两个负数相乘）。",
    desc: "输出数组中**任意两个不同下标**的元素之积的最大值（数组里可能有负数）。",
    js: ({ a }) => { const b = [...a].sort((x, y) => x - y); return `${Math.max(b[0] * b[1], b[b.length - 1] * b[b.length - 2])}`; },
    py: "b = sorted(a)\nprint(max(b[0] * b[1], b[-1] * b[-2]))",
    cpp: 'vector<long long>b=a;sort(b.begin(),b.end());cout<<max(b[0]*b[1],b[n-1]*b[n-2])<<"\\n";',
    c: 'static long long b2[500005];int i2,j2;long long t2;for(i2=0;i2<n;i2++)b2[i2]=a[i2];for(i2=0;i2<n;i2++)for(j2=i2+1;j2<n;j2++)if(b2[j2]<b2[i2]){t2=b2[i2];b2[i2]=b2[j2];b2[j2]=t2;}{long long p1=b2[0]*b2[1],p2=b2[n-1]*b2[n-2];printf("%lld\\n",p1>p2?p1:p2);}',
  },
  {
    id: "mxb-triple-exists", title: "是否存在三个数之和为 k", shape: "arrK", cfg: { nMin: 5, nMax: 14, lo: 1, hi: 20, kMin: 6, kMax: 45 }, inputFormat: IAK,
    topic: "数组与双指针", tags: ["双指针", "枚举"], hint: "可以先排序，再枚举前两个数、用双指针确定第三个数。",
    desc: "判断数组中是否存在**三个下标互不相同**的元素，它们的和恰好等于 $k$。若存在输出 `YES`，否则输出 `NO`。",
    js: ({ a, k }) => { const n = a.length; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let l = j + 1; l < n; l++) if (a[i] + a[j] + a[l] === k) return "YES"; return "NO"; },
    py: "ans = \"NO\"\nfor i in range(n):\n    for j in range(i + 1, n):\n        for l in range(j + 1, n):\n            if a[i] + a[j] + a[l] == k:\n                ans = \"YES\"\nprint(ans)",
    cpp: 'string ans="NO";for(int x=0;x<n;x++)for(int y=x+1;y<n;y++)for(int w=y+1;w<n;w++)if(a[x]+a[y]+a[w]==k)ans="YES";cout<<ans<<"\\n";',
    c: 'int ok=0,i2,j2,l2;for(i2=0;i2<n&&!ok;i2++)for(j2=i2+1;j2<n&&!ok;j2++)for(l2=j2+1;l2<n;l2++)if(a[i2]+a[j2]+a[l2]==k){ok=1;break;}printf("%s\\n",ok?"YES":"NO");',
  },
  {
    id: "mxb-smallest-duplicate", title: "数组中最小的重复元素", shape: "arr", cfg: { nMin: 5, nMax: 14, lo: 0, hi: 10 }, inputFormat: IFA,
    topic: "数组与集合", tags: ["集合", "计数"], hint: "用一个集合记录已经出现过的数值，遇到第二次出现的数值就更新答案的最小值。",
    desc: "输出数组中**重复出现过**的数值中的最小值；若没有任何数值重复出现，输出 -1。",
    js: ({ a }) => { const seen = new Set(), dup = new Set(); for (const x of a) { if (seen.has(x)) dup.add(x); seen.add(x); } return dup.size ? `${Math.min(...dup)}` : "-1"; },
    py: "seen = set()\ndup = set()\nfor x in a:\n    if x in seen:\n        dup.add(x)\n    seen.add(x)\nprint(min(dup) if dup else -1)",
    cpp: 'set<long long>seen,dup;for(auto x:a){if(seen.count(x))dup.insert(x);seen.insert(x);}cout<<(dup.empty()?-1:*dup.begin())<<"\\n";',
    c: 'static long long seen[500005];int sm=0,i2,j2;long long best=-1;for(i2=0;i2<n;i2++){int f=0;for(j2=0;j2<sm;j2++)if(seen[j2]==a[i2])f=1;if(f){if(best<0||a[i2]<best)best=a[i2];}else seen[sm++]=a[i2];}printf("%lld\\n",best);',
  },
  {
    id: "mxb-adjacent-inversions", title: "相邻逆序对的个数", shape: "arr", cfg: { nMin: 4, nMax: 14, lo: 0, hi: 30 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "遍历"], hint: "统计有多少对相邻元素满足前一个大于后一个。",
    desc: "输出满足 $a_i > a_{i+1}$ 的相邻下标对的个数（$1 \\le i \\le n-1$）。",
    js: ({ a }) => { let c = 0; for (let i = 0; i + 1 < a.length; i++) if (a[i] > a[i + 1]) c++; return `${c}`; },
    py: "c = 0\nfor i in range(n - 1):\n    if a[i] > a[i + 1]:\n        c += 1\nprint(c)",
    cpp: 'int c=0;for(int z=0;z+1<n;z++)if(a[z]>a[z+1])c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=0;i+1<n;i++)if(a[i]>a[i+1])c++;printf("%d\\n",c);',
  },
  {
    id: "mxb-pos-neg-sums", title: "正数之和与负数之和", shape: "arr", cfg: { nMin: 5, nMax: 14, lo: -30, hi: 30 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "条件判断"], hint: "分别累加正数和负数（$0$ 既不算正数也不算负数），输出时用空格隔开。",
    desc: "输出两个整数：数组中所有**正数**之和、所有**负数**之和，中间用一个空格隔开。",
    js: ({ a }) => `${a.filter((x) => x > 0).reduce((s, x) => s + x, 0)} ${a.filter((x) => x < 0).reduce((s, x) => s + x, 0)}`,
    py: "print(sum(x for x in a if x > 0), sum(x for x in a if x < 0))",
    cpp: 'long long sp=0,sn=0;for(auto x:a){if(x>0)sp+=x;else if(x<0)sn+=x;}cout<<sp<<" "<<sn<<"\\n";',
    c: 'long long sp=0,sn=0;for(i=0;i<n;i++){if(a[i]>0)sp+=a[i];else if(a[i]<0)sn+=a[i];}printf("%lld %lld\\n",sp,sn);',
  },
  {
    id: "mxb-count-equal-adjacent", title: "相邻相等元素对的个数", shape: "arr", cfg: { nMin: 4, nMax: 16, lo: 0, hi: 4 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "遍历"], hint: "逐个比较相邻的两个元素是否相等。",
    desc: "输出满足 $a_i = a_{i+1}$ 的相邻下标对的个数（$1 \\le i \\le n-1$）。",
    js: ({ a }) => { let c = 0; for (let i = 0; i + 1 < a.length; i++) if (a[i] === a[i + 1]) c++; return `${c}`; },
    py: "c = 0\nfor i in range(n - 1):\n    if a[i] == a[i + 1]:\n        c += 1\nprint(c)",
    cpp: 'int c=0;for(int z=0;z+1<n;z++)if(a[z]==a[z+1])c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=0;i+1<n;i++)if(a[i]==a[i+1])c++;printf("%d\\n",c);',
  },
  {
    id: "mxb-prefix-max-output", title: "每个位置的前缀最大值", shape: "arr", cfg: { nMin: 4, nMax: 14, lo: 0, hi: 60 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "前缀"], hint: "从左往右扫描，维护目前为止看到的最大值并依次输出。",
    desc: "输出数组的**前缀最大值**：第 $i$ 个数是 $a_1 \\sim a_i$ 中的最大值。共 $n$ 个数，用空格隔开。",
    js: ({ a }) => { let m = -Infinity; return a.map((x) => { m = Math.max(m, x); return m; }).join(" "); },
    py: "o = []\nm = -10 ** 18\nfor x in a:\n    if x > m:\n        m = x\n    o.append(m)\nprint(*o)",
    cpp: 'long long m=-1000000000000000000LL;for(auto x:a){m=max(m,x);cout<<m<<" ";}cout<<"\\n";',
    c: 'long long m=-1000000000000000000LL;for(i=0;i<n;i++){if(a[i]>m)m=a[i];printf("%lld%c",m,i+1<n?32:10);}',
  },
  {
    id: "mxb-suffix-min-output", title: "每个位置的后缀最小值", shape: "arr", cfg: { nMin: 4, nMax: 14, lo: 0, hi: 60 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "后缀"], hint: "从右往左扫描，维护目前为止看到的最小值，再把结果倒过来输出。",
    desc: "输出数组的**后缀最小值**：第 $i$ 个数是 $a_i \\sim a_n$ 中的最小值。共 $n$ 个数，用空格隔开。",
    js: ({ a }) => { const o = new Array(a.length); let m = Infinity; for (let i = a.length - 1; i >= 0; i--) { m = Math.min(m, a[i]); o[i] = m; } return o.join(" "); },
    py: "o = [0] * n\nm = 10 ** 18\nfor i in range(n - 1, -1, -1):\n    if a[i] < m:\n        m = a[i]\n    o[i] = m\nprint(*o)",
    cpp: 'vector<long long>o(n);long long m=1000000000000000000LL;for(int z=n-1;z>=0;z--){m=min(m,a[z]);o[z]=m;}for(int z=0;z<n;z++)cout<<o[z]<<(z+1<n?" ":"\\n");',
    c: 'static long long o2[500005];long long m=1000000000000000000LL;for(i=n-1;i>=0;i--){if(a[i]<m)m=a[i];o2[i]=m;}for(i=0;i<n;i++)printf("%lld%c",o2[i],i+1<n?32:10);',
  },
  {
    id: "mxb-between-min-max-count", title: "值严格介于最小值和最大值之间的元素个数", shape: "arr", cfg: { nMin: 4, nMax: 14, lo: 0, hi: 30 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "统计"], hint: "先求出最小值和最大值，再统计严格介于两者之间的元素个数。",
    desc: "设数组最小值为 $mn$、最大值为 $mx$。输出满足 $mn < a_i < mx$ 的元素个数。",
    js: ({ a }) => { const mn = Math.min(...a), mx = Math.max(...a); return `${a.filter((x) => x > mn && x < mx).length}`; },
    py: "mn = min(a)\nmx = max(a)\nprint(sum(1 for x in a if mn < x < mx))",
    cpp: 'long long mn=a[0],mx=a[0];for(auto x:a){mn=min(mn,x);mx=max(mx,x);}int c=0;for(auto x:a)if(x>mn&&x<mx)c++;cout<<c<<"\\n";',
    c: 'long long mn=a[0],mx=a[0];int c=0;for(i=0;i<n;i++){if(a[i]<mn)mn=a[i];if(a[i]>mx)mx=a[i];}for(i=0;i<n;i++)if(a[i]>mn&&a[i]<mx)c++;printf("%d\\n",c);',
  },
  {
    id: "mxb-max-freq-count", title: "出现次数最多的元素的出现次数", shape: "arr", cfg: { nMin: 5, nMax: 16, lo: 0, hi: 6 }, inputFormat: IFA,
    topic: "数组与统计", tags: ["计数"], hint: "统计每个数值出现的次数，取其中的最大值。",
    desc: "输出数组中出现次数最多的元素一共出现了多少次。",
    js: ({ a }) => { const m = new Map(); let best = 0; for (const x of a) { const c = (m.get(x) || 0) + 1; m.set(x, c); best = Math.max(best, c); } return `${best}`; },
    py: "cnt = {}\nbest = 0\nfor x in a:\n    cnt[x] = cnt.get(x, 0) + 1\n    if cnt[x] > best:\n        best = cnt[x]\nprint(best)",
    cpp: 'map<long long,long long>cnt;long long best=0;for(auto x:a){cnt[x]++;best=max(best,cnt[x]);}cout<<best<<"\\n";',
    c: 'long long best=0,c;int i2,j2;for(i2=0;i2<n;i2++){c=0;for(j2=0;j2<n;j2++)if(a[j2]==a[i2])c++;if(c>best)best=c;}printf("%lld\\n",best);',
  },
  {
    id: "mxb-sum-before-negative", title: "遇到第一个负数之前的元素之和", shape: "arr", cfg: { nMin: 5, nMax: 14, lo: -20, hi: 30 }, inputFormat: IFA,
    topic: "数组", tags: ["数组", "遍历"], hint: "从头开始累加，遇到第一个负数就立刻停止（这个负数本身不计入）。",
    desc: "从数组开头开始累加元素，遇到**第一个负数**时停止（该负数不计入总和）。输出此时的总和。",
    js: ({ a }) => { let s = 0; for (const x of a) { if (x < 0) break; s += x; } return `${s}`; },
    py: "s = 0\nfor x in a:\n    if x < 0:\n        break\n    s += x\nprint(s)",
    cpp: 'long long s=0;for(auto x:a){if(x<0)break;s+=x;}cout<<s<<"\\n";',
    c: 'long long s=0;for(i=0;i<n;i++){if(a[i]<0)break;s+=a[i];}printf("%lld\\n",s);',
  },
  {
    id: "mxb-adjacent-prime-pairs", title: "相邻两数之和为质数的对数", shape: "arr", cfg: { nMin: 5, nMax: 14, lo: 1, hi: 30 }, inputFormat: IFA,
    topic: "数组与数论", tags: ["质数", "遍历"], hint: "枚举每一对相邻元素，判断它们的和是否为质数。",
    desc: "输出有多少对相邻元素（$a_i$ 与 $a_{i+1}$）的和是**质数**。",
    js: ({ a }) => { const isp = (v) => { if (v < 2) return false; for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return true; }; let c = 0; for (let i = 0; i + 1 < a.length; i++) if (isp(a[i] + a[i + 1])) c++; return `${c}`; },
    py: "def isp(v):\n    if v < 2:\n        return False\n    d = 2\n    while d * d <= v:\n        if v % d == 0:\n            return False\n        d += 1\n    return True\nc = 0\nfor i in range(n - 1):\n    if isp(a[i] + a[i + 1]):\n        c += 1\nprint(c)",
    cpp: 'int c=0;for(int z=0;z+1<n;z++){long long v=a[z]+a[z+1];int p=v>=2;for(long long d=2;d*d<=v;d++)if(v%d==0){p=0;break;}if(p)c++;}cout<<c<<"\\n";',
    c: 'int c=0;long long v,d;int p;for(i=0;i+1<n;i++){v=a[i]+a[i+1];p=v>=2;for(d=2;d*d<=v;d++)if(v%d==0){p=0;break;}if(p)c++;}printf("%d\\n",c);',
  },
  {
    id: "mxb-atbash", title: "阿特巴什密码", shape: "str", cfg: { nMin: 4, nMax: 14, alpha: "abcdefghijklmnopqrstuvwxyz" }, inputFormat: IFS,
    topic: "字符串处理", tags: ["字符串", "模拟"], hint: "字母表中对称的两个字母满足 `新字母 = 'a' + 'z' - 原字母`。",
    desc: "把字符串 $s$ 中的每个小写字母替换成字母表中与它**对称**的字母（`a`↔`z`、`b`↔`y`、`c`↔`x`，以此类推），输出替换后的字符串。",
    js: ({ s }) => [...s].map((ch) => String.fromCharCode(219 - ch.charCodeAt(0))).join(""),
    py: "print(\"\".join(chr(ord('a') + ord('z') - ord(ch)) for ch in s))",
    cpp: 'for(char ch:s)cout<<char(\'a\'+\'z\'-ch);cout<<"\\n";',
    c: 'for(i=0;i<n;i++)putchar((char)(\'a\'+\'z\'-s[i]));putchar(10);',
  },
  {
    id: "mxb-string-rotate-left", title: "字符串循环左移 k 位", shape: "strK", cfg: { nMin: 5, nMax: 14, alpha: "abcdefghijklmnopqrstuvwxyz", kMin: 1, kMax: 30 }, inputFormat: IFSK,
    topic: "字符串处理", tags: ["字符串"], hint: "左移 $k$ 位就是把前 $k$ 个字符搬到字符串末尾。",
    desc: "把字符串 $s$ 循环左移 $k$ 位后输出（$k$ 可能超过字符串长度，需要先对长度取模）。",
    js: ({ s, k }) => { const n = s.length, r = k % n; return s.slice(r) + s.slice(0, r); },
    py: "n = len(s)\nr = k % n\nprint(s[r:] + s[:r])",
    cpp: 'int r=(int)(k%(long long)s.size());cout<<s.substr(r)+s.substr(0,r)<<"\\n";',
    c: 'int r2=(int)(k%(long long)n);for(i=r2;i<n;i++)putchar(s[i]);for(i=0;i<r2;i++)putchar(s[i]);putchar(10);',
  },
  {
    id: "mxb-palindrome-ignore-case", title: "忽略大小写的回文判断", shape: "str", cfg: { nMin: 3, nMax: 12, alpha: "aAbBcCdD" }, inputFormat: IFS, cExtra: "#include <ctype.h>\n",
    topic: "字符串处理", tags: ["字符串", "双指针"], hint: "先把所有字母统一成小写，再判断是否回文。",
    desc: "忽略大小写（把大写字母看成小写字母）判断字符串 $s$ 是否为回文串。是则输出 `YES`，否则输出 `NO`。",
    js: ({ s }) => { const t = s.toLowerCase(); return t === [...t].reverse().join("") ? "YES" : "NO"; },
    py: "t = s.lower()\nprint(\"YES\" if t == t[::-1] else \"NO\")",
    cpp: 'string t=s;for(char&c:t)c=(char)tolower((unsigned char)c);string r=t;reverse(r.begin(),r.end());cout<<(t==r?"YES":"NO")<<"\\n";',
    c: 'static char t2[100005];int j2,ok=1;for(i=0;i<n;i++)t2[i]=(char)tolower((unsigned char)s[i]);for(j2=0;j2<n/2;j2++)if(t2[j2]!=t2[n-1-j2])ok=0;printf("%s\\n",ok?"YES":"NO");',
  },
  {
    id: "mxb-case-change-count", title: "相邻字符大小写归属变化的次数", shape: "str", cfg: { nMin: 4, nMax: 16, alpha: "aAbBcC" }, inputFormat: IFS,
    topic: "字符串处理", tags: ["字符串"], hint: "依次比较相邻两个字符的大小写归属是否相同。",
    desc: "输出相邻两个字符的大小写归属发生变化的次数（例如 `aB` 发生变化，`ab`、`AB` 没有变化）。",
    js: ({ s }) => { const up = (ch) => ch >= "A" && ch <= "Z"; let c = 0; for (let i = 1; i < s.length; i++) if (up(s[i]) !== up(s[i - 1])) c++; return `${c}`; },
    py: "n = len(s)\nc = 0\nfor i in range(1, n):\n    if s[i].isupper() != s[i - 1].isupper():\n        c += 1\nprint(c)",
    cpp: 'int c=0;for(int z=1;z<(int)s.size();z++){int u1=(s[z]>=\'A\'&&s[z]<=\'Z\'),u2=(s[z-1]>=\'A\'&&s[z-1]<=\'Z\');if(u1!=u2)c++;}cout<<c<<"\\n";',
    c: 'int c=0;for(i=1;i<n;i++){int u1=(s[i]>=\'A\'&&s[i]<=\'Z\'),u2=(s[i-1]>=\'A\'&&s[i-1]<=\'Z\');if(u1!=u2)c++;}printf("%d\\n",c);',
  },
  {
    id: "mxb-same-case-run", title: "最长的连续同大小写段落", shape: "str", cfg: { nMin: 4, nMax: 16, alpha: "aAbBcCdD" }, inputFormat: IFS,
    topic: "字符串处理", tags: ["字符串"], hint: "把「同为大写或同为小写」看成一种状态，求这种状态连续保持的最长长度。",
    desc: "求字符串 $s$ 中最长的连续片段，使得片段里所有字符的大小写归属都相同（全是大写或全是小写）。",
    js: ({ s }) => { const up = (ch) => ch >= "A" && ch <= "Z"; let best = 0, cur = 0; for (let i = 0; i < s.length; i++) { cur = i > 0 && up(s[i]) === up(s[i - 1]) ? cur + 1 : 1; best = Math.max(best, cur); } return `${best}`; },
    py: "n = len(s)\nbest = 0\ncur = 0\nfor i in range(n):\n    cur = cur + 1 if i > 0 and s[i].isupper() == s[i - 1].isupper() else 1\n    if cur > best:\n        best = cur\nprint(best)",
    cpp: 'long long best=0,cur=0;for(int z=0;z<(int)s.size();z++){int u1=(s[z]>=\'A\'&&s[z]<=\'Z\'),u2=z>0&&(s[z-1]>=\'A\'&&s[z-1]<=\'Z\');cur=(z>0&&u1==u2)?cur+1:1;best=max(best,cur);}cout<<best<<"\\n";',
    c: 'long long best=0,cur=0;for(i=0;i<n;i++){int u1=(s[i]>=\'A\'&&s[i]<=\'Z\'),u2=i>0&&(s[i-1]>=\'A\'&&s[i-1]<=\'Z\');cur=(i>0&&u1==u2)?cur+1:1;if(cur>best)best=cur;}printf("%lld\\n",best);',
  },
  {
    id: "mxb-alternate-case", title: "按下标奇偶转换大小写", shape: "str", cfg: { nMin: 4, nMax: 16, alpha: "abcdefghijklmnopqrstuvwxyz" }, inputFormat: IFS, cExtra: "#include <ctype.h>\n",
    topic: "字符串处理", tags: ["字符串"], hint: "下标为 $0, 2, 4, \\dots$ 的字母转成大写，其余转成小写。",
    desc: "把字符串 $s$ 中下标为偶数（$0, 2, 4, \\dots$）的字母改成大写，下标为奇数的字母改成小写，输出处理后的字符串。",
    js: ({ s }) => [...s].map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join(""),
    py: "print(\"\".join(ch.upper() if i % 2 == 0 else ch.lower() for i, ch in enumerate(s)))",
    cpp: 'for(int z=0;z<(int)s.size();z++)cout<<char(z%2==0?toupper((unsigned char)s[z]):tolower((unsigned char)s[z]));cout<<"\\n";',
    c: 'for(i=0;i<n;i++)putchar(i%2==0?toupper((unsigned char)s[i]):tolower((unsigned char)s[i]));putchar(10);',
  },
];

export const medium_extra2Families = tasks("中等", [...A, ...B, ...S, ...H]);
