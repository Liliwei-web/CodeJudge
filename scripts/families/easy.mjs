/**
 * 简单难度题族。
 */
import { makeFamily } from "../lib/shapes.mjs";

const IF = {
  arr: "第一行一个整数 $n$（$1 \\le n \\le 10^5$）。第二行 $n$ 个整数 $a_i$，用空格隔开。",
  arrK: "第一行一个整数 $n$；第二行 $n$ 个整数 $a_i$；第三行一个整数 $k$。",
  num: "一行，一个整数 $n$（$1 \\le n \\le 10^6$）。",
  numK: "一行，两个整数 $n$ 和 $k$，用空格隔开。",
  str: "一行，一个仅由小写英文字母组成的字符串 $s$（$1 \\le |s| \\le 10^5$）。",
  two: "一行，两个整数 $a, b$。",
  matrix: "第一行两个整数 $n, m$（$1 \\le n, m \\le 200$）。接下来 $n$ 行，每行 $m$ 个整数。",
  pairsT: "第一行一个整数 $T$；接下来 $T$ 行，每行两个整数。",
};
const OF = "一行，输出答案。";

function expand({ shape, ops, difficulty, topic, tags, hint, variants, baseCfg = {} }) {
  return ops.flatMap((op) =>
    variants.map((v, i) =>
      makeFamily({
        shape, op, difficulty, topic, tags, hint,
        cfg: (() => {
          const base = Object.assign({}, op.cfg, baseCfg);
          let cfg2 = v.cfgFn ? v.cfgFn(base) : Object.assign({}, base, v.cfg);
          if (op.fixedCfg) cfg2 = Object.assign({}, base);
          if (op.noNegative) cfg2 = Object.assign({}, cfg2, { lo: Math.max(0, cfg2.lo ?? 0) });
          return cfg2;
        })(),
        variant: i + 1,
        title: v.suffix ? `${op.title}${v.suffix}` : op.title,
        statement: () => op.desc,
        inputFormat: op.inputFormat ?? IF[shape],
        outputFormat: op.outputFormat ?? OF,
        timeLimitMs: op.timeLimitMs ?? 1000,
      })
    )
  );
}

/** 变体：以题目自身的数据范围为基础做缩放，避免个别题型的规模失控 */
const scaleCfg = (base, k, dLo = 1, dHi = 100) => {
  const lo = base.lo ?? dLo;
  const hi = base.hi ?? dHi;
  const out = { ...base };
  out.lo = lo >= 0 ? Math.round(lo * k) : -Math.round(-lo * k);
  out.hi = Math.round(hi * k);
  if (base.nMax) out.nMax = Math.min(200, Math.round(base.nMax * k));
  if (base.nMin) out.nMin = Math.min(out.nMax ?? 200, Math.round(base.nMin * k));
  if (base.kMax) out.kMax = Math.max(1, Math.round(base.kMax * k));
  return out;
};
const V_ARR = [
  { suffix: "", cfgFn: (b) => ({ ...b }) },
  { suffix: " II", cfgFn: (b) => scaleCfg(b, 2) },
  { suffix: " III", cfgFn: (b) => scaleCfg(b, 3) },
  { suffix: " IV（更大范围）", cfgFn: (b) => scaleCfg(b, 5) },
  { suffix: " V", cfgFn: (b) => scaleCfg(b, 8) },
  { suffix: " VI（含负数）", cfgFn: (b) => ({ ...scaleCfg(b, 8), lo: -Math.abs(b.hi ?? 100), nMin: 2 }) },
  { suffix: " VII（大数据）", cfgFn: (b) => scaleCfg(b, 16) },
  { suffix: " VIII（极限数据）", cfgFn: (b) => scaleCfg(b, 20) },
];
const V_GEN = [
  { suffix: "", cfgFn: (b) => ({ ...b }) },
  { suffix: " II", cfgFn: (b) => scaleCfg(b, 2) },
  { suffix: " III", cfgFn: (b) => scaleCfg(b, 3) },
  { suffix: " IV", cfgFn: (b) => scaleCfg(b, 5) },
  { suffix: " V（更大范围）", cfgFn: (b) => scaleCfg(b, 8) },
  { suffix: " VI", cfgFn: (b) => scaleCfg(b, 12) },
  { suffix: " VII（大数据）", cfgFn: (b) => scaleCfg(b, 16) },
  { suffix: " VIII（极限数据）", cfgFn: (b) => scaleCfg(b, 20) },
];

/* ---------- 数组类 ---------- */
const arrOps = [
  { id: "easy-sort-asc", title: "数组升序排序", desc: "给定 $n$ 个整数，把它们按**从小到大**排序后输出，元素之间用一个空格隔开。",
    js: ({ a }) => a.slice().sort((x, y) => x - y).join(" "), py: "print(*sorted(a))", cpp: 'sort(a.begin(),a.end());for(int z=0;z<n;z++)cout<<a[z]<<(z+1<n?" ":"\\n");', c: 'for(i=0;i<n;i++)for(int z=i+1;z<n;z++)if(a[z]<a[i]){long long t=a[i];a[i]=a[z];a[z]=t;}for(i=0;i<n;i++)printf("%lld%c",a[i],i+1<n?32:10);' },
  { id: "easy-sort-desc", title: "数组降序排序", desc: "给定 $n$ 个整数，把它们按**从大到小**排序后输出。",
    js: ({ a }) => a.slice().sort((x, y) => y - x).join(" "), py: "print(*sorted(a, reverse=True))", cpp: 'sort(a.rbegin(),a.rend());for(int z=0;z<n;z++)cout<<a[z]<<(z+1<n?" ":"\\n");', c: 'for(i=0;i<n;i++)for(int z=i+1;z<n;z++)if(a[z]>a[i]){long long t=a[i];a[i]=a[z];a[z]=t;}for(i=0;i<n;i++)printf("%lld%c",a[i],i+1<n?32:10);' },
  { id: "easy-dedupe", title: "去重后输出", desc: "给定 $n$ 个整数，删掉重复出现的数，把剩下的数按从小到大输出。",
    js: ({ a }) => [...new Set(a)].sort((x, y) => x - y).join(" "), py: "print(*sorted(set(a)))", cpp: 'sort(a.begin(),a.end());a.erase(unique(a.begin(),a.end()),a.end());for(size_t z=0;z<a.size();z++)cout<<a[z]<<(z+1<a.size()?" ":"\\n");', c: 'for(i=0;i<n;i++)for(int z=i+1;z<n;z++)if(a[z]<a[i]){long long t=a[i];a[i]=a[z];a[z]=t;}int last=-1;int first2=1;for(i=0;i<n;i++){if(a[i]==last)continue;last=a[i];if(!first2)putchar(32);first2=0;printf("%lld",a[i]);}putchar(10);' },
  { id: "easy-abs-sum", title: "绝对值之和", desc: "给定 $n$ 个整数，输出它们绝对值之和。",
    js: ({ a }) => `${a.reduce((s, x) => s + Math.abs(x), 0)}`, py: "print(sum(abs(x) for x in a))", cpp: 'long long s=0;for(auto x:a)s+=llabs(x);cout<<s<<"\\n";', c: 'long long s=0;for(i=0;i<n;i++)s+=a[i]<0?-a[i]:a[i];printf("%lld\\n",s);' },
  { id: "easy-longest-run", title: "最长连续上升段", desc: "求数组中最长的连续上升段（严格递增）的长度。",
    js: ({ n, a }) => { let best = 1, cur = 1; for (let i = 1; i < n; i++) { cur = a[i] > a[i - 1] ? cur + 1 : 1; best = Math.max(best, cur); } return `${best}`; },
    py: "best = cur = 1\nfor x, y in zip(a, a[1:]):\n    cur = cur + 1 if y > x else 1\n    best = max(best, cur)\nprint(best)",
    cpp: 'int best=1,cur=1;for(int z=1;z<n;z++){cur=a[z]>a[z-1]?cur+1:1;best=max(best,cur);}cout<<best<<"\\n";',
    c: 'int best=1,cur=1;for(i=1;i<n;i++){cur=a[i]>a[i-1]?cur+1:1;if(cur>best)best=cur;}printf("%d\\n",best);' },
  { id: "easy-mode", title: "出现次数最多的数", desc: "给定 $n$ 个整数，输出出现次数最多的数；若并列，输出**数值最小**的那个。",
    js: ({ a }) => { const m = new Map(); for (const x of a) m.set(x, (m.get(x) || 0) + 1); let best = a[0]; for (const [v, c] of m) { if (c > m.get(best) || (c === m.get(best) && v < best)) best = v; } return `${best}`; },
    py: "from collections import Counter\nc = Counter(a)\nprint(min(v for v in c if c[v] == max(c.values())))",
    cpp: 'map<long long,int>c;for(auto x:a)c[x]++;long long b=a[0];for(auto&p:c)if(p.second>c[b]||(p.second==c[b]&&p.first<b))b=p.first;cout<<b<<"\\n";',
    c: 'long long b=a[0];for(i=0;i<n;i++){int ci=0,cb=0;for(int z=0;z<n;z++){if(a[z]==a[i])ci++;if(a[z]==b)cb++;}if(ci>cb||(ci==cb&&a[i]<b))b=a[i];}printf("%lld\\n",b);', cfg: { hi: 10, nMax: 15 } },
  { id: "easy-gcd-array", title: "数组的最大公约数", desc: "给定 $n$ 个正整数，输出它们的最大公约数。",
    js: ({ a }) => `${a.reduce((g, x) => { let p = g, q = x; while (q) { [p, q] = [q, p % q]; } return p; })}`,
    py: "from math import gcd\nfrom functools import reduce\nprint(reduce(gcd, a))", cpp: 'long long g=0;for(auto x:a)g=__gcd(g,x);cout<<g<<"\\n";',
    c: 'long long g=a[0];for(i=1;i<n;i++){long long p=g,q=a[i];while(q){long long t=p%q;p=q;q=t;}g=p;}printf("%lld\\n",g);', cfg: { lo: 1, hi: 100 }, noNegative: true },
  { id: "easy-sum-prefix-max", title: "前缀和的最大值", desc: "对数组求前缀和，输出其中最大值（前缀和包括前 0 项，即 0）。",
    js: ({ a }) => { let s = 0, best = 0; for (const x of a) { s += x; best = Math.max(best, s); } return `${best}`; },
    py: "s = 0\nbest = 0\nfor x in a:\n    s += x\n    best = max(best, s)\nprint(best)", cpp: 'long long s=0,best=0;for(auto x:a){s+=x;best=max(best,s);}cout<<best<<"\\n";',
    c: 'long long s=0,best=0;for(i=0;i<n;i++){s+=a[i];if(s>best)best=s;}printf("%lld\\n",best);' },
  { id: "easy-kth-smallest", title: "第 k 小的数", desc: "给定 $n$ 个整数和整数 $k$（$1 \\le k \\le n$），输出第 $k$ 小的数（重复元素按出现次数计算）。",
    js: ({ a, k }) => `${a.slice().sort((x, y) => x - y)[k - 1]}`, py: "print(sorted(a)[k - 1])", cpp: 'sort(a.begin(),a.end());cout<<a[k-1]<<"\\n";',
    c: 'for(i=0;i<n;i++)for(int z=i+1;z<n;z++)if(a[z]<a[i]){long long t=a[i];a[i]=a[z];a[z]=t;}printf("%lld\\n",a[k-1]);', shape: "arrKIndex", cfg: { nMax: 12 } },
  { id: "easy-count-greater-k", title: "大于 k 的个数", desc: "给定数组和整数 $k$，输出数组中**严格大于** $k$ 的元素个数。",
    js: ({ a, k }) => `${a.filter((x) => x > k).length}`, py: "print(sum(1 for x in a if x > k))", cpp: 'int c=0;for(auto x:a)if(x>k)c++;cout<<c<<"\\n";', c: 'int c=0;for(i=0;i<n;i++)if(a[i]>k)c++;printf("%d\\n",c);', shape: "arrK", cfg: { kMax: 20 } },
];

/* ---------- 整数类 ---------- */
const numOps = [
  { id: "easy-is-prime", title: "质数判断", desc: "给定正整数 $n$，若 $n$ 是质数输出 `YES`，否则输出 `NO`。",
    js: ({ n0 }) => { if (n0 < 2) return "NO"; for (let i = 2; i * i <= n0; i++) if (n0 % i === 0) return "NO"; return "YES"; },
    py: "print(\"YES\" if n0 > 1 and all(n0 % i for i in range(2, int(n0 ** 0.5) + 1)) else \"NO\")",
    cpp: 'bool ok=n0>1;for(long long z=2;z*z<=n0;z++)if(n0%z==0){ok=false;break;}cout<<(ok?"YES":"NO")<<"\\n";',
    c: 'int ok=n0>1;for(long long z=2;z*z<=n0;z++)if(n0%z==0){ok=0;break;}printf("%s\\n",ok?"YES":"NO");', cfg: { lo: 1, hi: 200 } },
  { id: "easy-prime-count", title: "区间内质数个数", desc: "统计 $1$ 到 $n$ 之间质数的个数。",
    js: ({ n0 }) => { let c = 0; for (let i = 2; i <= n0; i++) { let ok = true; for (let d = 2; d * d <= i; d++) if (i % d === 0) { ok = false; break; } if (ok) c++; } return `${c}`; },
    py: "print(sum(1 for x in range(2, n0 + 1) if all(x % d for d in range(2, int(x ** 0.5) + 1))))",
    cpp: 'int c=0;for(long long v=2;v<=n0;v++){bool ok=true;for(long long z=2;z*z<=v;z++)if(v%z==0){ok=false;break;}if(ok)c++;}cout<<c<<"\\n";',
    c: 'int c=0;long long v;for(v=2;v<=n0;v++){int ok=1;for(long long z=2;z*z<=v;z++)if(v%z==0){ok=0;break;}if(ok)c++;}printf("%d\\n",c);', cfg: { lo: 2, hi: 500 } },
  { id: "easy-divisor-count", title: "约数个数", desc: "输出正整数 $n$ 的约数个数。",
    js: ({ n0 }) => { let c = 0; for (let i = 1; i * i <= n0; i++) if (n0 % i === 0) c += i * i === n0 ? 1 : 2; return `${c}`; },
    py: "print(sum(1 for i in range(1, n0 + 1) if n0 % i == 0))", cpp: 'long long c=0;for(long long z=1;z*z<=n0;z++)if(n0%z==0)c+=(z*z==n0?1:2);cout<<c<<"\\n";',
    c: 'long long c=0;for(long long z=1;z*z<=n0;z++)if(n0%z==0)c+=(z*z==n0?1:2);printf("%lld\\n",c);', cfg: { lo: 1, hi: 1000 } },
  { id: "easy-divisor-sum", title: "约数之和", desc: "输出正整数 $n$ 所有约数之和。",
    js: ({ n0 }) => `${Array.from({ length: n0 }, (_, i) => i + 1).filter((d) => n0 % d === 0).reduce((s, x) => s + x, 0)}`,
    py: "print(sum(i for i in range(1, n0 + 1) if n0 % i == 0))", cpp: 'long long s=0;for(long long z=1;z<=n0;z++)if(n0%z==0)s+=z;cout<<s<<"\\n";',
    c: 'long long s=0;for(long long z=1;z<=n0;z++)if(n0%z==0)s+=z;printf("%lld\\n",s);', cfg: { lo: 1, hi: 500 } },
  { id: "easy-digit-root", title: "数根", desc: "把一个数的各位数字反复相加，直到只剩一位。输出这个数（数根）。",
    js: ({ n0 }) => `${n0 % 9 === 0 && n0 !== 0 ? 9 : n0 % 9}`, py: "print(9 if n0 % 9 == 0 and n0 else n0 % 9)", cpp: 'cout<<(n0%9==0&&n0?9:n0%9)<<"\\n";', c: 'printf("%lld\\n",n0%9==0&&n0?9:n0%9);', cfg: { lo: 1, hi: 100000 } },
  { id: "easy-collatz", title: "角谷猜想步数", desc: "对正整数 $n$ 反复执行：若为偶数则除以 2，否则乘 3 加 1，统计变为 1 所需步数。",
    js: ({ n0 }) => { let c = 0, v = Math.abs(n0) || 1; while (v !== 1) { v = v % 2 === 0 ? v / 2 : v * 3 + 1; c++; } return `${c}`; },
    py: "c = 0\nv = n0\nwhile v != 1:\n    v = v // 2 if v % 2 == 0 else v * 3 + 1\n    c += 1\nprint(c)",
    cpp: 'long long c=0,v=n0;while(v!=1){v=v%2==0?v/2:v*3+1;c++;}cout<<c<<"\\n";',
    c: 'long long c=0;unsigned long long v=n0;while(v!=1){v=v%2==0?v/2:v*3+1;c++;}printf("%lld\\n",c);', cfg: { lo: 1, hi: 2000 } },
  { id: "easy-leap-year", title: "闰年判断", desc: "判断年份 $n$ 是否为闰年：能被 4 整除且不能被 100 整除，或者能被 400 整除。是则输出 `YES`，否则 `NO`。",
    js: ({ n0 }) => ((n0 % 4 === 0 && n0 % 100 !== 0) || n0 % 400 === 0 ? "YES" : "NO"),
    py: "print(\"YES\" if (n0 % 4 == 0 and n0 % 100 != 0) or n0 % 400 == 0 else \"NO\")", cpp: 'bool ok=(n0%4==0&&n0%100!=0)||n0%400==0;cout<<(ok?"YES":"NO")<<"\\n";',
    c: 'int ok=(n0%4==0&&n0%100!=0)||n0%400==0;printf("%s\\n",ok?"YES":"NO");', cfg: { lo: 1000, hi: 3000 } },
];

/* ---------- 字符串类 ---------- */
const strOps = [
  { id: "easy-reverse-string", title: "字符串反转", desc: "给定字符串 $s$，把它反转后输出。",
    js: ({ s }) => [...s].reverse().join(""), py: "print(s[::-1])", cpp: 'reverse(s.begin(),s.end());cout<<s<<"\\n";', c: 'int q;for(q=n-1;q>=0;q--)putchar(s[q]);putchar(10);' },
  { id: "easy-palindrome-string", title: "回文字符串判断", desc: "判断 $s$ 是否为回文串，是则输出 `YES`，否则输出 `NO`。",
    js: ({ s }) => (s === [...s].reverse().join("") ? "YES" : "NO"), py: 'print("YES" if s == s[::-1] else "NO")', cpp: 'string r(s.rbegin(),s.rend());cout<<(r==s?"YES":"NO")<<"\\n";', c: 'int q,ok=1;for(q=0;q<n/2;q++)if(s[q]!=s[n-1-q])ok=0;printf("%s\\n",ok?"YES":"NO");' },
  { id: "easy-vowel-count", title: "元音字母个数", desc: "统计 $s$ 中元音字母 a、e、i、o、u 的个数。",
    js: ({ s }) => `${[...s].filter((c) => "aeiou".includes(c)).length}`, py: 'print(sum(1 for c in s if c in "aeiou"))', cpp: 'int c=0;for(char ch:s)if(string("aeiou").find(ch)!=string::npos)c++;cout<<c<<"\\n";', c: 'int c=0,q;for(q=0;q<n;q++)if(strchr("aeiou",s[q]))c++;printf("%d\\n",c);' },
  { id: "easy-upper-case", title: "转大写", desc: "把 $s$ 中的所有字母转换为大写后输出。",
    js: ({ s }) => s.toUpperCase(), py: "print(s.upper())", cpp: 'for(char&ch:s)ch=toupper(ch);cout<<s<<"\\n";', c: 'int q;for(q=0;q<n;q++)putchar(toupper(s[q]));putchar(10);', cExtra: "#include <ctype.h>\n" },
  { id: "easy-distinct-chars", title: "不同字符个数", desc: "输出 $s$ 中不同字符的个数。",
    js: ({ s }) => `${new Set(s).size}`, py: "print(len(set(s)))", cpp: 'cout<<set<char>(s.begin(),s.end()).size()<<"\\n";', c: 'int c=0,q,z;for(q=0;q<n;q++){int ok=1;for(z=0;z<q;z++)if(s[z]==s[q])ok=0;if(ok)c++;}printf("%d\\n",c);' },
  { id: "easy-most-frequent-char", title: "出现最多的字符", desc: "输出 $s$ 中出现次数最多的字符；若并列，输出**字典序最小**的。",
    js: ({ s }) => { const m = new Map(); for (const c of s) m.set(c, (m.get(c) || 0) + 1); let best = s[0]; for (const [c, n] of m) if (n > m.get(best) || (n === m.get(best) && c < best)) best = c; return best; },
    py: "from collections import Counter\nc = Counter(s)\nprint(min(ch for ch in c if c[ch] == max(c.values())))",
    cpp: 'map<char,int>c;for(char ch:s)c[ch]++;char b=s[0];for(auto&p:c)if(p.second>c[b]||(p.second==c[b]&&p.first<b))b=p.first;cout<<b<<"\\n";',
    c: 'char b=s[0];int q,z;for(q=0;q<n;q++){int ci=0,cb=0;for(z=0;z<n;z++){if(s[z]==s[q])ci++;if(s[z]==b)cb++;}if(ci>cb||(ci==cb&&s[q]<b))b=s[q];}printf("%c\\n",b);' },
  { id: "easy-compress", title: "字符串压缩", desc: "把连续相同的字符压缩为「字符+出现次数」的形式输出，例如 `aaabbc` 压缩为 `a3b2c1`。",
    js: ({ s }) => { let out = "", i = 0; while (i < s.length) { let k = 0; while (i + k < s.length && s[i + k] === s[i]) k++; out += s[i] + k; i += k; } return out; },
    py: "out = []\ni = 0\nwhile i < len(s):\n    k = 1\n    while i + k < len(s) and s[i + k] == s[i]:\n        k += 1\n    out.append(s[i] + str(k))\n    i += k\nprint(\"\".join(out))",
    cpp: 'string o;for(size_t q=0;q<s.size();){size_t k=0;while(q+k<s.size()&&s[q+k]==s[q])k++;o+=s[q];o+=to_string(k);q+=k;}cout<<o<<"\\n";',
    c: 'char o[200005];int len2=0,q;for(q=0;q<n;){int k=0;while(q+k<n&&s[q+k]==s[q])k++;o[len2++]=s[q];len2+=sprintf(o+len2,"%d",k);q+=k;}o[len2]=0;printf("%s\\n",o);' },
  { id: "easy-last-char-index", title: "字符首次与末次位置", desc: "给定字符串 $s$ 和字符 $k$（$k$ 保证出现在 $s$ 中），输出 $k$ 第一次和最后一次出现的下标（从 0 开始），用一个空格隔开。",
    js: ({ s }, all) => { const k = all[1]; return `${s.indexOf(k)} ${s.lastIndexOf(k)}`; },
    py: "k = data[1]\nprint(s.index(k), s.rindex(k))", cpp: 'char kc;cin>>kc;cout<<s.find(kc)<<" "<<s.rfind(kc)<<"\\n";', c: 'char kc;if(scanf(" %c",&kc)!=1)return 1;int f=-1,l=-1,q;for(q=0;q<n;q++)if(s[q]==kc){if(f<0)f=q;l=q;}printf("%d %d\\n",f,l);', cExtra: "", shape: "str", needsK: true },
];

export const easyFamilies = [
  ...expand({ shape: "arr", ops: arrOps.filter((o) => !["arrK", "arrKIndex"].includes(o.shape)), difficulty: "简单", topic: "数组与排序", tags: ["数组", "排序"], hint: "排序后很多问题会变得简单。", variants: V_ARR }),
  ...expand({ shape: "arrK", ops: arrOps.filter((o) => o.shape === "arrK"), difficulty: "简单", topic: "数组与排序", tags: ["数组", "查找"], hint: "注意 $k$ 是元素值，不是下标。", variants: V_ARR }),
  ...expand({ shape: "arrKIndex", ops: arrOps.filter((o) => o.shape === "arrKIndex"), difficulty: "简单", topic: "数组与排序", tags: ["数组", "排序"], hint: "排序后直接取第 $k$ 个元素（下标从 0 开始）。", variants: V_ARR }),
  ...expand({ shape: "num", ops: numOps, difficulty: "简单", topic: "整数与数论", tags: ["数论", "循环"], hint: "枚举到 $\\sqrt{n}$ 即可，不需要枚举到 $n$。", variants: V_GEN }),
  ...expand({ shape: "str", ops: strOps.filter((o) => !o.needsK), difficulty: "简单", topic: "字符串", tags: ["字符串"], hint: "可以用哈希表统计字符出现次数。", variants: V_GEN }),
];






