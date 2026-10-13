/**
 * 入门题目族。
 * 每个原型 = 输入形状 + 操作表(ops)，操作表复用三种语言的参考解。
 * op.js 为 JS 参考模型（生成答案并作为校验基准）。
 */

export const j = (a) => a.join(" ");
export const nums = (t) => t.trim().split(/\s+/).filter(Boolean).map(Number);

export const PY = (body) => `import sys\n\ndata = sys.stdin.read().split()\n${body}`;
export const CPP = (body) => `#include <bits/stdc++.h>\nusing namespace std;\nint main(){${body}return 0;}\n`;
export const C = (body) => `#include <stdio.h>\n#include <stdlib.h>\nint main(void){${body}return 0;}\n`;

/** 构造 family 对象 */
export function family(o) {
  return o;
}

export function makeSamples(tests, n = 2) {
  return tests.slice(0, n).map((t) => ({ input: t.input, output: t.output, explanation: t.explanation ?? "" }));
}

/* ================================================================
 * 原型 A：一行 n 个整数
 * ================================================================ */
const A_READ = {
  py: (k) => `n = int(data[0])\na = list(map(int, data[1:1 + n]))\n` + (k ? "k = int(data[1 + n])\n" : ""),
  cpp: (k) => `int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;` + (k ? "long long k;cin>>k;" : ""),
  c: (k) => `int n,i;static long long a[200005];if(scanf("%d",&n)!=1)return 1;for(i=0;i<n;i++)scanf("%lld",&a[i]);` + (k ? "long long k;if(scanf(\"%lld\",&k)!=1)return 1;" : ""),
};

const A_OPS = [
  { id: "sum", title: "数组求和", desc: "输出所有元素之和。", js: (a) => `${a.reduce((s, x) => s + x, 0)}`,
    py: "print(sum(a))", cpp: 'long long s=0;for(auto x:a)s+=x;cout<<s<<"\\n";', c: 'long long s=0;for(i=0;i<n;i++)s+=a[i];printf("%lld\\n",s);' },
  { id: "max", title: "数组最大值", desc: "输出最大的元素。", js: (a) => `${Math.max(...a)}`,
    py: "print(max(a))", cpp: 'cout<<*max_element(a.begin(),a.end())<<"\\n";', c: 'long long m=a[0];for(i=1;i<n;i++)if(a[i]>m)m=a[i];printf("%lld\\n",m);' },
  { id: "min", title: "数组最小值", desc: "输出最小的元素。", js: (a) => `${Math.min(...a)}`,
    py: "print(min(a))", cpp: 'cout<<*min_element(a.begin(),a.end())<<"\\n";', c: 'long long m=a[0];for(i=1;i<n;i++)if(a[i]<m)m=a[i];printf("%lld\\n",m);' },
  { id: "maxmin", title: "最大值与最小值", desc: "依次输出最大值和最小值，用一个空格隔开。", js: (a) => `${Math.max(...a)} ${Math.min(...a)}`,
    py: "print(max(a), min(a))", cpp: 'cout<<*max_element(a.begin(),a.end())<<" "<<*min_element(a.begin(),a.end())<<"\\n";',
    c: 'long long mx=a[0],mn=a[0];for(i=1;i<n;i++){if(a[i]>mx)mx=a[i];if(a[i]<mn)mn=a[i];}printf("%lld %lld\\n",mx,mn);' },
  { id: "range", title: "极差", desc: "输出最大值与最小值之差。", js: (a) => `${Math.max(...a) - Math.min(...a)}`,
    py: "print(max(a) - min(a))", cpp: 'cout<<*max_element(a.begin(),a.end())-*min_element(a.begin(),a.end())<<"\\n";',
    c: 'long long mx=a[0],mn=a[0];for(i=1;i<n;i++){if(a[i]>mx)mx=a[i];if(a[i]<mn)mn=a[i];}printf("%lld\\n",mx-mn);' },
  { id: "avg2", title: "平均值", desc: "输出平均值，四舍五入保留两位小数。", noNegative: true, js: (a) => { const n = a.length, s = a.reduce((x, y) => x + y, 0); const q = Math.floor((s * 200 + n) / (2 * n)); return `${Math.floor(q / 100)}.${String(q % 100).padStart(2, "0")}`; },
    py: "s = sum(a)\nq = (s * 200 + n) // (2 * n)\nprint(f\"{q // 100}.{q % 100:02d}\")", cpp: 'long long s=accumulate(a.begin(),a.end(),0LL);long long q=(s*200+n)/(2*n);cout<<q/100<<"."<<setfill(char(48))<<setw(2)<<q%100<<"\\n";',
    c: 'long long s=0;for(i=0;i<n;i++)s+=a[i];long long q=(s*200+n)/(2*n);printf("%lld.%02lld\\n",q/100,q%100);' },
  { id: "above-avg", title: "大于平均值的个数", desc: "输出严格大于平均值的元素个数。", js: (a) => { const m = a.reduce((s, x) => s + x, 0) / a.length; return `${a.filter((x) => x > m).length}`; },
    py: "m = sum(a)/n\nprint(sum(1 for x in a if x > m))", cpp: 'double m=(double)accumulate(a.begin(),a.end(),0LL)/n;int c=0;for(auto x:a)if(x>m)c++;cout<<c<<"\\n";',
    c: 'long long s=0;int c=0;for(i=0;i<n;i++)s+=a[i];double m=(double)s/n;for(i=0;i<n;i++)if((double)a[i]>m)c++;printf("%d\\n",c);' },
  { id: "even-count", title: "偶数个数", desc: "输出其中偶数的个数。", js: (a) => `${a.filter((x) => x % 2 === 0).length}`,
    py: "print(sum(1 for x in a if x % 2 == 0))", cpp: 'int c=0;for(auto x:a)if(x%2==0)c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=0;i<n;i++)if(a[i]%2==0)c++;printf("%d\\n",c);' },
  { id: "odd-sum", title: "奇数之和", desc: "输出其中所有奇数之和。", js: (a) => `${a.filter((x) => x % 2 !== 0).reduce((s, x) => s + x, 0)}`,
    py: "print(sum(x for x in a if x % 2 != 0))", cpp: 'long long s=0;for(auto x:a)if(x%2!=0)s+=x;cout<<s<<"\\n";',
    c: 'long long s=0;for(i=0;i<n;i++)if(a[i]%2!=0)s+=a[i];printf("%lld\\n",s);' },
  { id: "positive-sum", title: "正数之和", desc: "输出所有正数之和，若没有正数则输出 0。", js: (a) => `${a.filter((x) => x > 0).reduce((s, x) => s + x, 0)}`,
    py: "print(sum(x for x in a if x > 0))", cpp: 'long long s=0;for(auto x:a)if(x>0)s+=x;cout<<s<<"\\n";',
    c: 'long long s=0;for(i=0;i<n;i++)if(a[i]>0)s+=a[i];printf("%lld\\n",s);' },
  { id: "negative-count", title: "负数个数", desc: "输出其中负数的个数。", js: (a) => `${a.filter((x) => x < 0).length}`,
    py: "print(sum(1 for x in a if x < 0))", cpp: 'int c=0;for(auto x:a)if(x<0)c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=0;i<n;i++)if(a[i]<0)c++;printf("%d\\n",c);' },
  { id: "max-abs", title: "绝对值最大", desc: "输出绝对值最大的元素，若有两个则输出先出现的那个。", js: (a) => `${a.reduce((b, x) => (Math.abs(x) > Math.abs(b) ? x : b), a[0])}`,
    py: "b = a[0]\nfor x in a:\n    if abs(x) > abs(b):\n        b = x\nprint(b)", cpp: 'long long b=a[0];for(auto x:a)if(llabs(x)>llabs(b))b=x;cout<<b<<"\\n";',
    c: 'long long b=a[0];for(i=0;i<n;i++)if(llabs(a[i])>llabs(b))b=a[i];printf("%lld\\n",b);' },
  { id: "second-max", title: "次大值", desc: "输出第二大的数（$n \\ge 2$；若最大值重复出现，次大值等于最大值）。", js: (a) => `${a.slice().sort((x, y) => y - x)[1]}`,
    py: "b = sorted(a, reverse=True)\nprint(b[1])", cpp: 'sort(a.rbegin(),a.rend());cout<<a[1]<<"\\n";',
    c: 'for(i=0;i<n;i++)for(int z=i+1;z<n;z++)if(a[z]>a[i]){long long t=a[i];a[i]=a[z];a[z]=t;}printf("%lld\\n",a[1]);' },
  { id: "distinct", title: "不同元素个数", desc: "输出其中不同数值的个数。", js: (a) => `${new Set(a).size}`,
    py: "print(len(set(a)))", cpp: 'cout<<set<long long>(a.begin(),a.end()).size()<<"\\n";',
    c: 'int c=0;for(i=0;i<n;i++){int ok=1;for(int z=0;z<i;z++)if(a[z]==a[i]){ok=0;break;}if(ok)c++;}printf("%d\\n",c);' },
  { id: "square-sum", title: "平方和", desc: "输出每个元素平方后的总和。", js: (a) => `${a.reduce((s, x) => s + x * x, 0)}`,
    py: "print(sum(x * x for x in a))", cpp: 'long long s=0;for(auto x:a)s+=x*x;cout<<s<<"\\n";',
    c: 'long long s=0;for(i=0;i<n;i++)s+=a[i]*a[i];printf("%lld\\n",s);' },
  { id: "max-index", title: "最大值下标", desc: "输出最大值的下标（从 0 开始，若有多个输出最小的下标）。", js: (a) => `${a.indexOf(Math.max(...a))}`,
    py: "print(a.index(max(a)))", cpp: 'cout<<max_element(a.begin(),a.end())-a.begin()<<"\\n";',
    c: 'int p=0;for(i=1;i<n;i++)if(a[i]>a[p])p=i;printf("%d\\n",p);' },
  { id: "reverse", title: "逆序输出", desc: "把数组逆序输出，元素之间用一个空格隔开。", js: (a) => a.slice().reverse().join(" "),
    py: "print(*a[::-1])", cpp: 'reverse(a.begin(),a.end());for(int z=0;z<n;z++)cout<<a[z]<<(z+1<n?" ":"\\n");',
    c: 'for(i=n-1;i>=0;i--)printf("%lld%c",a[i],i?32:10);' },
  { id: "nondecreasing", title: "是否非降序", desc: "若数组从左到右非严格递增则输出 YES，否则输出 NO。", js: (a) => (a.every((x, i) => i === 0 || a[i - 1] <= x) ? "YES" : "NO"),
    py: 'print("YES" if all(a[i] <= a[i+1] for i in range(n-1)) else "NO")', cpp: 'bool ok=true;for(int z=1;z<n;z++)if(a[z-1]>a[z])ok=false;cout<<(ok?"YES":"NO")<<"\\n";',
    c: 'int ok=1;for(i=1;i<n;i++)if(a[i-1]>a[i])ok=0;printf("%s\\n",ok?"YES":"NO");' },
  { id: "even-sum", title: "偶数之和", desc: "输出其中所有偶数之和。", js: (a) => `${a.filter((x) => x % 2 === 0).reduce((s, x) => s + x, 0)}`,
    py: "print(sum(x for x in a if x % 2 == 0))", cpp: 'long long s=0;for(auto x:a)if(x%2==0)s+=x;cout<<s<<"\\n";',
    c: 'long long s=0;for(i=0;i<n;i++)if(a[i]%2==0)s+=a[i];printf("%lld\\n",s);' },
  { id: "div-count", title: "统计整除个数", needsK: true, desc: "给定整数 $k$，输出数组中能被 $k$ 整除的元素个数。", js: (a, k) => `${a.filter((x) => x % k === 0).length}`,
    py: "print(sum(1 for x in a if x % k == 0))", cpp: 'int c=0;for(auto x:a)if(x%k==0)c++;cout<<c<<"\\n";',
    c: 'int c=0;for(i=0;i<n;i++)if(a[i]%k==0)c++;printf("%d\\n",c);' },
  { id: "product", title: "数组乘积", desc: "输出所有元素之积（元素均为 1~3 的小整数，保证结果在 64 位整数范围内）。", noNegative: true, fixedCfg: true, js: (a) => `${a.reduce((s, x) => s * x, 1)}`,
    py: "p = 1\nfor x in a:\n    p *= x\nprint(p)", cpp: 'long long p=1;for(auto x:a)p*=x;cout<<p<<"\\n";',
    c: 'long long p=1;for(i=0;i<n;i++)p*=a[i];printf("%lld\\n",p);' },
  { id: "min-positive", title: "最小正数", desc: "输出最小的正数；若不存在正数则输出 -1。", js: (a) => { const p = a.filter((x) => x > 0); return p.length ? `${Math.min(...p)}` : "-1"; },
    py: "p = [x for x in a if x > 0]\nprint(min(p) if p else -1)", cpp: 'long long m=LLONG_MAX;for(auto x:a)if(x>0)m=min(m,x);cout<<(m==LLONG_MAX?-1:m)<<"\\n";',
    c: 'long long m=-1;for(i=0;i<n;i++)if(a[i]>0&&(m<0||a[i]<m))m=a[i];printf("%lld\\n",m);' },
];

const A_LEVELS = [
  { n: 10, v: 20, suf: "" },
  { n: 20, v: 100, suf: " II" },
  { n: 30, v: 1000, suf: " III" },
  { n: 40, v: 10000, suf: " IV" },
  { n: 50, v: 100000, suf: " V" },
  { n: 60, v: 1000000, suf: " VI" },
  { n: 80, v: 1000, suf: " VII" },
  { n: 100, v: 100000, suf: " VIII" },
];

function arrFamily(op, variant) {
  const lv = A_LEVELS[variant];
  let maxN = lv.n;
  let maxV = lv.v;
  if (op.fixedCfg) { maxN = 4 + variant; maxV = 1 + variant * 2; }
  const negative = !op.noNegative && ["max-abs", "positive-sum", "negative-count", "min-positive"].includes(op.id);
  const lo = negative ? -maxV : 0;
  return family({
    key: `array-${op.id}`,
    variant: variant + 1,
    topic: "循环与数组",
    difficulty: "入门",
    tags: ["数组", "循环", "统计"],
    hint: "遍历一遍数组即可，注意结果可能是大整数，C/C++ 请使用 long long。",
    title: op.title + lv.suf,
    statement: () => `给定 $n$ 个整数 $a_1, a_2, \\dots, a_n$，${op.desc}`,
    inputFormat: () =>
      op.needsK
        ? "第一行一个整数 $n$（$1 \\le n \\le 1000$）；第二行 $n$ 个整数 $a_i$；第三行一个整数 $k$（$1 \\le k \\le 10^4$）。"
        : `第一行一个整数 $n$（$1 \\le n \\le 1000$）；第二行 $n$ 个整数 $a_i$（$${lo} \\le a_i \\le ${maxV}$），用空格隔开。`,
    outputFormat: () => "一行，输出结果。",
    timeLimitMs: 1000,
    solve: (rng) => {
      const compute = (text) => {
        const v = nums(text);
        const a = v.slice(1, 1 + v[0]);
        const k = v[1 + v[0]];
        return op.js(a, k);
      };
      const all = [];
      for (let i = 0; i < 10; i++) {
        const n = rng.int(2, maxN);
        const a = rng.intArray(n, lo, maxV + 1);
        const k = op.needsK ? rng.int(1, 9) : -1;
        const input = op.needsK ? `${n}\n${j(a)}\n${k}\n` : `${n}\n${j(a)}\n`;
        all.push({ input, output: compute(input) + "\n" });
      }
      const demo = op.id === "reverse" || op.needsK ? [3, 7, 11, 4, 9] : [3, 7, 11, 4, 9];
      const demoK = 2;
      const demoInput = op.needsK ? `5\n${j(demo)}\n${demoK}\n` : `5\n${j(demo)}\n`;
      all[0] = { input: demoInput, output: compute(demoInput) + "\n" };
      all[1] = { input: all[1].input, output: all[1].output };
      return { samples: makeSamples(all, 2), tests: all };
    },
    solutions: () => ({
      python: PY(A_READ.py(op.needsK) + op.py + "\n"),
      cpp: CPP(A_READ.cpp(op.needsK) + op.cpp),
      c: C(A_READ.c(op.needsK) + op.c),
    }),
  });
}

export const A_FAMILIES = A_OPS.flatMap((op) => A_LEVELS.map((_, i) => arrFamily(op, i)));
/* ================================================================
 * 原型 B：单个整数（按字符串处理，n <= 10^18）
 * ================================================================ */
const B_READ = {
  py: (k) => `s = data[0]\n` + (k ? "k = data[1]\n" : ""),
  cpp: (k) => `string s;cin>>s;` + (k ? "char kc;cin>>kc;" : ""),
  c: (k) => `char s[64];if(scanf("%63s",s)!=1)return 1;int len=(int)strlen(s);(void)len;` + (k ? "char kc;scanf(\" %c\",&kc);" : ""),
};

const B_OPS = [
  { id: "digit-sum", title: "数位之和", desc: "输出它每一位数字之和。", js: (s) => `${[...s].reduce((a, c) => a + Number(c), 0)}`,
    py: "print(sum(int(c) for c in s))", cpp: 'long long t=0;for(char ch:s)t+=ch-48;cout<<t<<"\\n";', c: 'long long t=0;int q;for(q=0;q<len;q++)t+=s[q]-48;printf("%lld\\n",t);' },
  { id: "digit-count", title: "位数", desc: "输出它一共有多少位数字。", js: (s) => `${s.length}`,
    py: "print(len(s))", cpp: 'cout<<s.size()<<"\\n";', c: 'printf("%d\\n",len);' },
  { id: "reverse-number", title: "反转数字", desc: "把它倒过来输出（去掉前导零）。", js: (s) => String(BigInt([...s].reverse().join(""))),
    py: 'print(int(s[::-1]))', cpp: 'string r(s.rbegin(),s.rend());size_t p=r.find_first_not_of(\'0\');cout<<(p==string::npos?string("0"):r.substr(p))<<"\\n";',
    c: 'char r[64];int q;for(q=0;q<len;q++)r[q]=s[len-1-q];r[len]=0;char*p=r;while(*p==48&&*(p+1))p++;printf("%s\\n",p);' },
  { id: "palindrome-number", title: "回文数判断", desc: "若它是回文数输出 YES，否则输出 NO。", js: (s) => (s === [...s].reverse().join("") ? "YES" : "NO"),
    py: 'print("YES" if s == s[::-1] else "NO")', cpp: 'string r(s.rbegin(),s.rend());cout<<(r==s?"YES":"NO")<<"\\n";',
    c: 'int q,ok=1;for(q=0;q<len/2;q++)if(s[q]!=s[len-1-q])ok=0;printf("%s\\n",ok?"YES":"NO");' },
  { id: "max-digit", title: "最大数位", desc: "输出各位数字中最大的那一个。", js: (s) => `${Math.max(...[...s].map(Number))}`,
    py: "print(max(s))", cpp: 'cout<<*max_element(s.begin(),s.end())<<"\\n";',
    c: 'char m=48;int q;for(q=0;q<len;q++)if(s[q]>m)m=s[q];printf("%c\\n",m);' },
  { id: "min-digit", title: "最小数位", desc: "输出各位数字中最小的那一个。", js: (s) => `${Math.min(...[...s].map(Number))}`,
    py: "print(min(s))", cpp: 'cout<<*min_element(s.begin(),s.end())<<"\\n";',
    c: 'char m=57;int q;for(q=0;q<len;q++)if(s[q]<m)m=s[q];printf("%c\\n",m);' },
  { id: "even-digit-count", title: "偶数数位个数", desc: "输出其中偶数数字的个数。", js: (s) => `${[...s].filter((c) => Number(c) % 2 === 0).length}`,
    py: "print(sum(1 for c in s if int(c) % 2 == 0))", cpp: 'int c=0;for(char ch:s)if((ch-48)%2==0)c++;cout<<c<<"\\n";',
    c: 'int c=0,q;for(q=0;q<len;q++)if((s[q]-48)%2==0)c++;printf("%d\\n",c);' },
  { id: "digit-cube-sum", title: "数位立方和", desc: "输出每一位数字的立方之和。", js: (s) => `${[...s].reduce((a, c) => a + Number(c) ** 3, 0)}`,
    py: "print(sum(int(c) ** 3 for c in s))", cpp: 'long long t=0;for(char ch:s){long long d=ch-48;t+=d*d*d;}cout<<t<<"\\n";',
    c: 'long long t=0,q;for(q=0;q<len;q++){long long d=s[q]-48;t+=d*d*d;}printf("%lld\\n",t);' },
  { id: "digit-product", title: "数位之积", desc: "输出每一位数字的乘积。", js: (s) => String([...s].reduce((a, c) => a * BigInt(c), 1n)),
    py: "p = 1\nfor c in s:\n    p *= int(c)\nprint(p)", cpp: 'long long p=1;for(char ch:s)p*=ch-48;cout<<p<<"\\n";',
    c: 'long long p=1,q;for(q=0;q<len;q++)p*=s[q]-48;printf("%lld\\n",p);' },
  { id: "prime-digit-count", title: "质数数位个数", desc: "输出值为质数（2、3、5、7）的数字个数。", js: (s) => `${[...s].filter((c) => "2357".includes(c)).length}`,
    py: 'print(sum(1 for c in s if c in "2357"))', cpp: 'int c=0;for(char ch:s)if(ch==50||ch==51||ch==53||ch==55)c++;cout<<c<<"\\n";',
    c: 'int c=0,q;for(q=0;q<len;q++){char ch=s[q];if(ch==50||ch==51||ch==53||ch==55)c++;}printf("%d\\n",c);' },
  { id: "remove-zero", title: "删除数字 0", desc: "删除所有数字 0 后输出剩下的数字（保证至少有一位非 0）。", js: (s) => s.replace(/0/g, ""),
    py: 'print(s.replace("0", ""))', cpp: 'string r;for(char ch:s)if(ch!=48)r+=ch;cout<<r<<"\\n";',
    c: 'char r[64];int q,n2=0;for(q=0;q<len;q++)if(s[q]!=48)r[n2++]=s[q];r[n2]=0;printf("%s\\n",r);' },
  { id: "sort-digits", title: "数位升序排列", desc: "把各位数字从小到大排序后输出。", js: (s) => [...s].sort().join(""),
    py: 'print("".join(sorted(s)))', cpp: 'sort(s.begin(),s.end());cout<<s<<"\\n";',
    c: 'int q,r2;for(q=0;q<len;q++)for(r2=q+1;r2<len;r2++)if(s[r2]<s[q]){char t=s[q];s[q]=s[r2];s[r2]=t;}printf("%s\\n",s);' },
  { id: "leading-digit", title: "最高位数字", desc: "输出它的最高位数字。", js: (s) => s[0],
    py: "print(s[0])", cpp: 'cout<<s[0]<<"\\n";', c: 'printf("%c\\n",s[0]);' },
  { id: "to-binary", cExtra: "#include <stdlib.h>\n", title: "转二进制", desc: "输出它对应的二进制表示（不含前导零）。", js: (s) => BigInt(s).toString(2),
    py: "print(bin(int(s))[2:])", cpp: 'unsigned long long v=stoull(s);string b;if(v==0)b="0";while(v){b+=char(48+(v&1));v>>=1;}reverse(b.begin(),b.end());cout<<b<<"\\n";',
    c: 'unsigned long long v=strtoull(s,0,10);char b[80];int m=0;if(v==0)b[m++]=48;while(v){b[m++]=(char)(48+(v&1));v>>=1;}int q;for(q=m-1;q>=0;q--)putchar(b[q]);putchar(10);' },
  { id: "divisible-by-3", title: "是否为 3 的倍数", desc: "由数位和判断它是否为 3 的倍数，是则输出 YES，否则输出 NO。", js: (s) => ([...s].reduce((a, c) => a + Number(c), 0) % 3 === 0 ? "YES" : "NO"),
    py: 'print("YES" if sum(int(c) for c in s) % 3 == 0 else "NO")', cpp: 'long long t=0;for(char ch:s)t+=ch-48;cout<<(t%3==0?"YES":"NO")<<"\\n";',
    c: 'long long t=0;int q;for(q=0;q<len;q++)t+=s[q]-48;printf("%s\\n",t%3==0?"YES":"NO");' },
  { id: "count-digit-k", title: "统计指定数位", needsK: true, desc: "给定数字 $k$（$0 \\le k \\le 9$），输出它出现了多少次。", js: (s, k) => `${[...s].filter((c) => c === k).length}`,
    py: "print(s.count(k))", cpp: 'int c=0;for(char ch:s)if(ch==kc)c++;cout<<c<<"\\n";',
    c: 'int c=0,q;for(q=0;q<len;q++)if(s[q]==kc)c++;printf("%d\\n",c);' },
  { id: "odd-even-diff", title: "奇数位与偶数位之差", desc: "从最高位开始，把第 1、3、5… 位数字之和减去第 2、4、6… 位数字之和，输出这个差的绝对值。", js: (s) => { let a = 0, b = 0; [...s].forEach((c, i) => (i % 2 === 0 ? (a += Number(c)) : (b += Number(c)))); return `${Math.abs(a - b)}`; },
    py: "a = sum(int(c) for i, c in enumerate(s) if i % 2 == 0)\nb = sum(int(c) for i, c in enumerate(s) if i % 2 == 1)\nprint(abs(a - b))",
    cpp: 'long long a=0,b=0;for(size_t q=0;q<s.size();q++)(q%2?a:b)+=s[q]-48;cout<<llabs(a-b)<<"\\n";',
    c: 'long long a=0,b=0;int q;for(q=0;q<len;q++){if(q%2)b+=s[q]-48;else a+=s[q]-48;}long long d=a-b;if(d<0)d=-d;printf("%lld\\n",d);' },
];

const B_LEVELS = [4, 6, 8, 10, 12, 14, 16, 18];
const B_SUFFIX = ["", " II", " III", " IV", " V", " VI", " VII", " VIII"];

function digitFamily(op, variant) {
  const digits = B_LEVELS[variant];
  return family({
    key: `digit-${op.id}`,
    variant: variant + 1,
    topic: "数位处理",
    difficulty: "入门",
    tags: ["整数", "数位", "字符串"],
    hint: "把整数当成字符串逐位处理，可以避免大数溢出。",
    title: op.title + B_SUFFIX[variant],
    statement: () => `给定一个正整数 $n$，${op.desc}`,
    inputFormat: () => (op.needsK ? `一行，一个正整数 $n$ 和一个数字 $k$，中间用空格隔开（$1 \\le n \\le 10^{18}$）。` : `一行，一个正整数 $n$（$1 \\le n \\le 10^{18}$）。`),
    outputFormat: () => "一行，输出结果。",
    timeLimitMs: 1000,
    solve: (rng) => {
      const compute = (text) => {
        const parts = text.trim().split(/\s+/);
        const s = parts[0];
        const k = parts[1] ?? "0";
        return op.js(s, k);
      };
      const all = [];
      for (let i = 0; i < 10; i++) {
        let s = String(rng.int(1, 9));
        for (let d = 1; d < digits; d++) s += String(rng.int(0, 9));
        if (op.id === "remove-zero" && !/[1-9]/.test(s)) s = "1" + s;
        const k = op.needsK ? String(rng.int(0, 9)) : null;
        const input = op.needsK ? `${s} ${k}\n` : `${s}\n`;
        all.push({ input, output: compute(input) + "\n" });
      }
      all[0] = { input: op.needsK ? "1024 2\n" : "1024\n", output: compute(op.needsK ? "1024 2\n" : "1024\n") + "\n" };
      return { samples: makeSamples(all, 2), tests: all };
    },
    solutions: () => ({
      python: PY(B_READ.py(op.needsK) + op.py + "\n"),
      cpp: CPP(B_READ.cpp(op.needsK) + op.cpp, '#include <string>\n'),
      c: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n${op.cExtra ?? ""}int main(void){${B_READ.c(op.needsK)}${op.c}return 0;}\n`,
    }),
  });
}

export const B_FAMILIES = B_OPS.flatMap((op) => B_LEVELS.map((_, i) => digitFamily(op, i)));

export const introFamilies = [...A_FAMILIES, ...B_FAMILIES];


