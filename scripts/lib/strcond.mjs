/** 字符串「谓词 × 归约」交叉题库工厂（shape = str） */
import { SHAPES } from "./shapes.mjs";

const SH = {
  hasc: {
    py: "def hasc(ch, t):\n    return ch in t\n",
    cpp: "int hasc(char ch,string t){return t.find(ch)!=string::npos;}",
    c: "int hasc(char ch,const char*t){return strchr(t,ch)!=NULL;}",
    js: "function hasc(ch,t){return t.indexOf(ch)>=0;}",
  },
  notin: {
    py: "def notin(ch, t):\n    return ch not in t\n",
    cpp: "int notin(char ch,string t){return t.find(ch)==string::npos;}",
    c: "int notin(char ch,const char*t){return strchr(t,ch)==NULL;}",
    js: "function notin(ch,t){return t.indexOf(ch)<0;}",
  },
};

/** 用字符串辅助函数编译 JS 谓词 */
function compileJsPred(pred) {
  const h = HELP2(pred.help).js;
  return new Function(h + "return function(ch){ return (" + pred.p + "); };")();
}

const HELP2 = (names) => ({
  py: (names || []).map((k) => SH[k].py).join(""),
  cpp: (names || []).map((k) => SH[k].cpp).join(""),
  c: (names || []).map((k) => SH[k].c).join(""),
  js: (names || []).map((k) => SH[k].js).join(""),
});

/** 字符串归约 */
export const SREDS = [
  {
    id: "count", title: (t) => `字符串中${t}字符的个数`,
    desc: (t) => `统计并输出字符串 $s$ 中${t}字符的个数。`,
    hint: "遍历字符串的每个字符，用条件判断计数。",
    py: (P) => `n = len(s)\nc = 0\nfor ch in s:\n    if ${P}:\n        c += 1\nprint(c)`,
    cpp: (P) => `int c=0;for(char ch:s)if(${P})c++;cout<<c<<"\\n";`,
    c: (P) => `int c=0;for(i=0;i<n;i++){char ch=s[i];if(${P})c++;}printf("%d\\n",c);`,
    js: (f) => (o) => `${[...o.s].filter(f).length}`,
  },
  {
    id: "first", title: (t) => `第一个${t}字符的位置`,
    desc: (t) => `输出字符串 $s$ 中第一个${t}字符的下标（从 $0$ 开始计数）；若不存在输出 -1。`,
    hint: "从左往右扫描，找到第一个满足条件的字符就记下位置并结束循环。",
    py: (P) => `n = len(s)\nans = -1\nfor i in range(n):\n    ch = s[i]\n    if ${P}:\n        ans = i\n        break\nprint(ans)`,
    cpp: (P) => `int ans=-1;for(int z=0;z<(int)s.size();z++){char ch=s[z];if(${P}){ans=z;break;}}cout<<ans<<"\\n";`,
    c: (P) => `int ans=-1;for(i=0;i<n;i++){char ch=s[i];if(${P}){ans=i;break;}}printf("%d\\n",ans);`,
    js: (f) => (o) => `${[...o.s].findIndex(f)}`,
  },
  {
    id: "last", title: (t) => `最后一个${t}字符的位置`,
    desc: (t) => `输出字符串 $s$ 中最后一个${t}字符的下标（从 $0$ 开始计数）；若不存在输出 -1。`,
    hint: "从左往右扫描，每次遇到满足条件的字符就更新答案，循环结束后输出最后记录的位置。",
    py: (P) => `n = len(s)\nans = -1\nfor i in range(n):\n    ch = s[i]\n    if ${P}:\n        ans = i\nprint(ans)`,
    cpp: (P) => `int ans=-1;for(int z=0;z<(int)s.size();z++){char ch=s[z];if(${P})ans=z;}cout<<ans<<"\\n";`,
    c: (P) => `int ans=-1;for(i=0;i<n;i++){char ch=s[i];if(${P})ans=i;}printf("%d\\n",ans);`,
    js: (f) => (o) => `${[...o.s].reduce((acc, ch, i) => (f(ch) ? i : acc), -1)}`,
  },
  {
    id: "keep", title: (t) => `只保留${t}字符的结果字符串`,
    desc: (t) => `删除字符串 $s$ 中**所有不满足**「${t}字符」的字符，把保留的字符按原顺序拼接后输出；若一个字符都不保留则输出一个空行。`,
    hint: "顺序遍历字符串，只输出满足条件的字符。",
    py: (P) => `n = len(s)\nprint("".join(ch for ch in s if ${P}))`,
    cpp: (P) => `for(char ch:s)if(${P})cout<<ch;cout<<"\\n";`,
    c: (P) => `for(i=0;i<n;i++){char ch=s[i];if(${P})putchar(ch);}putchar(10);`,
    js: (f) => (o) => [...o.s].filter(f).join(""),
  },
  {
    id: "consec", title: (t) => `最长的一段连续${t}字符`,
    desc: (t) => `求字符串 $s$ 中连续出现的${t}字符最多能有多少个。`,
    hint: "维护当前连续长度与历史最优长度，遇到不满足条件的字符就把当前长度清零。",
    py: (P) => `n = len(s)\nbest = 0\ncur = 0\nfor ch in s:\n    if ${P}:\n        cur += 1\n        if cur > best:\n            best = cur\n    else:\n        cur = 0\nprint(best)`,
    cpp: (P) => `long long best=0,cur=0;for(char ch:s){if(${P}){cur++;best=max(best,cur);}else cur=0;}cout<<best<<"\\n";`,
    c: (P) => `long long best=0,cur=0;for(i=0;i<n;i++){char ch=s[i];if(${P}){cur++;if(cur>best)best=cur;}else cur=0;}printf("%lld\\n",best);`,
    js: (f) => (o) => { let best = 0, cur = 0; for (const ch of o.s) { if (f(ch)) { cur++; best = Math.max(best, cur); } else cur = 0; } return `${best}`; },
  },
  {
    id: "alle", title: (t) => `字符串是否全部是${t}字符`,
    desc: (t) => `若字符串 $s$ 的每一个字符都是${t}字符则输出 YES，否则输出 NO。`,
    hint: "发现任意一个不满足条件的字符就可以直接判定为 NO。",
    py: (P) => `n = len(s)\nprint("YES" if all(${P} for ch in s) else "NO")`,
    cpp: (P) => `int ok=1;for(char ch:s)if(!(${P}))ok=0;cout<<(ok?"YES":"NO")<<"\\n";`,
    c: (P) => `int ok=1;for(i=0;i<n;i++){char ch=s[i];if(!(${P})){ok=0;break;}}printf("%s\\n",ok?"YES":"NO");`,
    js: (f) => (o) => ([...o.s].every(f) ? "YES" : "NO"),
  },
  {
    id: "exists", title: (t) => `字符串中是否存在${t}字符`,
    desc: (t) => `若字符串 $s$ 中至少有一个${t}字符则输出 YES，否则输出 NO。`,
    hint: "找到一个满足条件的字符就可以直接判定为 YES。",
    py: (P) => `n = len(s)\nprint("YES" if any(${P} for ch in s) else "NO")`,
    cpp: (P) => `int ok=0;for(char ch:s)if(${P})ok=1;cout<<(ok?"YES":"NO")<<"\\n";`,
    c: (P) => `int ok=0;for(i=0;i<n;i++){char ch=s[i];if(${P}){ok=1;break;}}printf("%s\\n",ok?"YES":"NO");`,
    js: (f) => (o) => ([...o.s].some(f) ? "YES" : "NO"),
  },
];

/** 字符串谓词 */
export const SPREDS = [
  { id: "a-e", t: "属于 a~e 的", p: "hasc(ch, \"abcde\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "abcdef" } },
  { id: "f-j", t: "属于 f~j 的", p: "hasc(ch, \"fghij\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "fghijk" } },
  { id: "k-o", t: "属于 k~o 的", p: "hasc(ch, \"klmno\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "klmnop" } },
  { id: "p-t", t: "属于 p~t 的", p: "hasc(ch, \"pqrst\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "pqrstu" } },
  { id: "u-z", t: "属于 u~z 的", p: "hasc(ch, \"uvwxyz\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "uvwxyz" } },
  { id: "vowel", t: "元音", p: "hasc(ch, \"aeiou\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "aeioubcd" } },
  { id: "cons", t: "辅音", p: "notin(ch, \"aeiou\")", help: ["notin"], cfg: { nMin: 6, nMax: 16, alpha: "bcdfgae" } },
  { id: "lower", t: "小写字母", p: "(ch >= 'a') & (ch <= 'z')", cfg: { nMin: 6, nMax: 16, alpha: "abcdefgh" } },
  { id: "upper", t: "大写字母", p: "(ch >= 'A') & (ch <= 'Z')", cfg: { nMin: 6, nMax: 16, alpha: "ABCdEfG" } },
  { id: "digit", t: "数字", p: "(ch >= '0') & (ch <= '9')", cfg: { nMin: 6, nMax: 16, alpha: "012345a" } },
  { id: "ge-n", t: "不小于 n 的字母", p: "ch >= 'n'", cfg: { nMin: 6, nMax: 16, alpha: "mnopqr" } },
  { id: "le-g", t: "不大于 g 的字母", p: "ch <= 'g'", cfg: { nMin: 6, nMax: 16, alpha: "abcdefgh" } },
  { id: "even-digit", t: "偶数字符", p: "hasc(ch, \"02468\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "0123456789a" } },
  { id: "odd-digit", t: "奇数字符", p: "hasc(ch, \"13579\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "0123456789a" } },
  { id: "aeiou-upper", t: "大写元音", p: "hasc(ch, \"AEIOU\")", help: ["hasc"], cfg: { nMin: 6, nMax: 16, alpha: "AEIOUBCD" } },
];

/** 生成字符串条件题目的表格行 */
export function strCondRows({ prefix, preds, reds, topic, tags, inputFormat, cfgBase }) {
  const out = [];
  const redList = reds.map((id) => SREDS.find((r) => r.id === id));
  for (const pred of preds) {
    for (const red of redList) {
      const P = pred.p;
      const h = HELP2(pred.help);
      const cfg = Object.assign({ nMin: 6, nMax: 16 }, cfgBase, pred.cfg);
      out.push({
        id: `${prefix}-${pred.id}-${red.id}`,
        title: red.title(pred.t),
        desc: red.desc(pred.t),
        shape: "str",
        help: [],
        js: red.js(compileJsPred(pred)),
        py: h.py + red.py(P) + "\n",
        cpp: red.cpp(P),
        c: red.c(P),
        cppExtra: h.cpp,
        cExtra: h.c,
        cfg,
        topic,
        tags,
        hint: red.hint,
        inputFormat,
      });
    }
  }
  return out;
}
