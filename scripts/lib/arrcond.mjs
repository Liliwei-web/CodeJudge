/** 数组「谓词 × 归约」交叉题库工厂 */
import { compileJsPred } from "./tasks.mjs";

const sub = (expr, name) => expr.replace(/\bx\b/g, name);

/** 归约方式：给定谓词表达式，产出四语言实现 + 标题/题面 */
export const AREDS = [
  {
    id: "first",
    title: (t) => `第一个${t}的下标`,
    desc: (t) => `输出数组中第一个${t}的元素的下标（下标从 $0$ 开始计数）；若不存在这样的元素则输出 -1。`,
    hint: "从左往右扫描，遇到第一个满足条件的元素就记下它的下标并结束循环。",
    make: (P, Pc) => ({
      js: (o, f) => `${o.a.findIndex(f)}`,
      py: `ans = -1\nfor idx in range(n):\n    x = a[idx]\n    if ${P}:\n        ans = idx\n        break\nprint(ans)`,
      cpp: `int ans=-1;for(int z=0;z<n;z++){long long x=a[z];if(${Pc}){ans=z;break;}}cout<<ans<<"\\n";`,
      c: `int ans=-1;for(i=0;i<n;i++){long long x=a[i];if(${Pc}){ans=i;break;}}printf("%d\\n",ans);`,
    }),
  },
  {
    id: "last",
    title: (t) => `最后一个${t}的下标`,
    desc: (t) => `输出数组中最后一个${t}的元素的下标（下标从 $0$ 开始计数）；若不存在这样的元素则输出 -1。`,
    hint: "从左往右扫描，每次遇到满足条件的元素就更新答案，循环结束后输出最后一次记录的下标。",
    make: (P, Pc) => ({
      js: (o, f) => `${o.a.map((v, i) => (f(v) ? i : -1)).reduce((a, b) => Math.max(a, b), -1)}`,
      py: `ans = -1\nfor idx in range(n):\n    x = a[idx]\n    if ${P}:\n        ans = idx\nprint(ans)`,
      cpp: `int ans=-1;for(int z=0;z<n;z++){long long x=a[z];if(${Pc})ans=z;}cout<<ans<<"\\n";`,
      c: `int ans=-1;for(i=0;i<n;i++){long long x=a[i];if(${Pc})ans=i;}printf("%d\\n",ans);`,
    }),
  },
  {
    id: "idxsum",
    title: (t) => `所有${t}的下标之和`,
    desc: (t) => `把数组中所有${t}的元素的下标（从 $0$ 开始计数）加起来输出。`,
    hint: "遍历数组，把满足条件元素的下标累加到总和里。",
    make: (P, Pc) => ({
      js: (o, f) => `${o.a.reduce((s, v, i) => s + (f(v) ? i : 0), 0)}`,
      py: `s = 0\nfor idx in range(n):\n    x = a[idx]\n    if ${P}:\n        s += idx\nprint(s)`,
      cpp: `long long s=0;for(int z=0;z<n;z++){long long x=a[z];if(${Pc})s+=z;}cout<<s<<"\\n";`,
      c: `long long s=0;for(i=0;i<n;i++){long long x=a[i];if(${Pc})s+=i;}printf("%lld\\n",s);`,
    }),
  },
  {
    id: "xor",
    title: (t) => `所有${t}的异或和`,
    desc: (t) => `把所有${t}的元素做按位异或，输出结果（一个满足条件的元素都没有时输出 0）。`,
    hint: "初始答案为 0，每遇到一个满足条件的元素就与答案做异或。",
    make: (P, Pc) => ({
      js: (o, f) => `${o.a.filter(f).reduce((s, v) => s ^ v, 0)}`,
      py: `r = 0\nfor x in a:\n    if ${P}:\n        r ^= x\nprint(r)`,
      cpp: `long long r=0;for(auto x:a)if(${Pc})r^=x;cout<<r<<"\\n";`,
      c: `long long r=0;for(i=0;i<n;i++){long long x=a[i];if(${Pc})r^=x;}printf("%lld\\n",r);`,
    }),
  },
  {
    id: "prod",
    title: (t) => `所有${t}的乘积（取模）`,
    desc: (t) => `把所有${t}的元素相乘，输出乘积对 $10^9+7$ 取模的结果（没有满足条件的元素时输出 1）。`,
    hint: "边遍历边累乘，每一步都对 $10^9+7$ 取模，防止溢出。",
    make: (P, Pc) => ({
      js: (o, f) => `${o.a.filter(f).reduce((s, v) => (s * v) % 1000000007, 1)}`,
      py: `M = 10 ** 9 + 7\nr = 1\nfor x in a:\n    if ${P}:\n        r = r * x % M\nprint(r)`,
      cpp: `const long long M=1000000007LL;long long r=1;for(auto x:a)if(${Pc})r=r*x%M;cout<<r<<"\\n";`,
      c: `long long r=1;for(i=0;i<n;i++){long long x=a[i];if(${Pc})r=r*x%1000000007LL;}printf("%lld\\n",r);`,
    }),
  },
  {
    id: "kinds",
    title: (t) => `共有多少种不同的${t}`,
    desc: (t) => `输出数组中${t}的元素一共出现了多少种不同的数值。`,
    hint: "把所有满足条件的元素放进集合（去重）后，输出集合的大小。",
    make: (P, Pc) => ({
      js: (o, f) => `${new Set(o.a.filter(f)).size}`,
      py: `print(len(set(x for x in a if ${P})))`,
      cpp: `set<long long>st;for(auto x:a)if(${Pc})st.insert(x);cout<<st.size()<<"\\n";`,
      c: `static long long t2[500005];int m2=0,i2,j2,d2=0;for(i2=0;i2<n;i2++){long long x=a[i2];if(${Pc})t2[m2++]=x;}for(i2=0;i2<m2;i2++){int dup=0;for(j2=0;j2<i2;j2++)if(t2[j2]==t2[i2]){dup=1;break;}if(!dup)d2++;}printf("%d\\n",d2);`,
    }),
  },
  {
    id: "consec",
    title: (t) => `最长的一段连续${t}`,
    desc: (t) => `求数组中「连续的若干个${t}」最多能有多少个（即最长的连续满足条件的片段长度）。`,
    hint: "维护当前连续长度与历史最优长度，遇到不满足条件的元素就把当前长度清零。",
    make: (P, Pc) => ({
      js: (o, f) => { let best = 0, cur = 0; for (const v of o.a) { if (f(v)) { cur++; best = Math.max(best, cur); } else cur = 0; } return `${best}`; },
      py: `best = 0\ncur = 0\nfor x in a:\n    if ${P}:\n        cur += 1\n        if cur > best:\n            best = cur\n    else:\n        cur = 0\nprint(best)`,
      cpp: `long long best=0,cur=0;for(auto x:a){if(${Pc}){cur++;best=max(best,cur);}else cur=0;}cout<<best<<"\\n";`,
      c: `long long best=0,cur=0;for(i=0;i<n;i++){long long x=a[i];if(${Pc}){cur++;if(cur>best)best=cur;}else cur=0;}printf("%lld\\n",best);`,
    }),
  },
  {
    id: "both",
    title: (t) => `相邻两个都是${t}的对数`,
    desc: (t) => `数一数有多少对相邻元素（$a_i$ 与 $a_{i+1}$）是**同时**满足「${t}」的。`,
    hint: "枚举每一对相邻元素，两个元素都满足条件时答案加一。",
    make: (P, Pc) => ({
      js: (o, f) => `${o.a.reduce((s, v, i) => s + (i + 1 < o.a.length && f(v) && f(o.a[i + 1]) ? 1 : 0), 0)}`,
      py: `c = 0\nfor idx in range(n - 1):\n    if (${sub(P, "a[idx]")}) and (${sub(P, "a[idx + 1]")}):\n        c += 1\nprint(c)`,
      cpp: `int c=0;for(int z=0;z+1<n;z++)if((${sub(Pc, "a[z]")})&&(${sub(Pc, "a[z+1]")}))c++;cout<<c<<"\\n";`,
      c: `int c=0;for(i=0;i+1<n;i++)if((${sub(Pc, "a[i]")})&&(${sub(Pc, "a[i+1]")}))c++;printf("%d\\n",c);`,
    }),
  },
  {
    id: "alle",
    title: (t) => `是否所有元素都是${t}`,
    desc: (t) => `若数组中**每一个**元素都是${t}，输出 YES，否则输出 NO。`,
    hint: "只要发现一个不满足条件的元素就可以直接判定为 NO。",
    make: (P, Pc) => ({
      js: (o, f) => (o.a.every(f) ? "YES" : "NO"),
      py: `print("YES" if all(${P} for x in a) else "NO")`,
      cpp: `int ok=1;for(auto x:a)if(!(${Pc}))ok=0;cout<<(ok?"YES":"NO")<<"\\n";`,
      c: `int ok=1;for(i=0;i<n;i++){long long x=a[i];if(!(${Pc})){ok=0;break;}}printf("%s\\n",ok?"YES":"NO");`,
    }),
  },
  {
    id: "exists",
    title: (t) => `是否存在${t}`,
    desc: (t) => `若数组中至少存在一个${t}的元素输出 YES，否则输出 NO。`,
    hint: "找到一个满足条件的元素就可以直接判定为 YES。",
    make: (P, Pc) => ({
      js: (o, f) => (o.a.some(f) ? "YES" : "NO"),
      py: `print("YES" if any(${P} for x in a) else "NO")`,
      cpp: `int ok=0;for(auto x:a)if(${Pc})ok=1;cout<<(ok?"YES":"NO")<<"\\n";`,
      c: `int ok=0;for(i=0;i<n;i++){long long x=a[i];if(${Pc}){ok=1;break;}}printf("%s\\n",ok?"YES":"NO");`,
    }),
  },
  {
    id: "avg",
    title: (t) => `${t}的平均值（向下取整）`,
    desc: (t) => `求出所有${t}的元素之和，除以它们的个数后向下取整输出；若不存在这样的元素输出 -1。`,
    hint: "先累加求和并统计个数，最后用整除得到向下取整的结果。",
    make: (P, Pc) => ({
      js: (o, f) => { const b = o.a.filter(f); return b.length ? `${Math.floor(b.reduce((s, v) => s + v, 0) / b.length)}` : "-1"; },
      py: `b = [x for x in a if ${P}]\nprint(sum(b) // len(b) if b else -1)`,
      cpp: `long long s=0;int c=0;for(auto x:a)if(${Pc}){s+=x;c++;}cout<<(c?s/c:-1)<<"\\n";`,
      c: `long long s=0;int c=0;for(i=0;i<n;i++){long long x=a[i];if(${Pc}){s+=x;c++;}}printf("%lld\\n",c?s/c:-1);`,
    }),
  },
];

/** 由谓词表与归约表生成题目行 */
export function arrCondRows({ prefix, preds, reds, cfgBase, topic, tags, hint, inputFormat, descFmt, titleFmt }) {
  const out = [];
  const redList = reds.map((id) => AREDS.find((r) => r.id === id));
  for (const pred of preds) {
    for (const red of redList) {
      const P = pred.p;
      const Pc = pred.pc ?? pred.p;
      const code = red.make(P, Pc);
      const cfg = Object.assign({ nMin: 6, nMax: 14, lo: 0, hi: 200 }, cfgBase, pred.cfg);
      out.push({
        id: `${prefix}-${pred.id}-${red.id}`,
        title: titleFmt ? titleFmt(pred, red) : red.title(pred.t),
        desc: descFmt ? descFmt(pred, red) : red.desc(pred.t),
        help: pred.help ?? [],
        js: (o) => code.js(o, compileJsPred(pred)),
        py: code.py + "\n",
        cpp: code.cpp,
        c: code.c,
        cfg,
        topic,
        tags,
        hint: hint ?? red.hint,
        inputFormat,
      });
    }
  }
  return out;
}
