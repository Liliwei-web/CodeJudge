/**
 * 生成器核心：可复现随机数、题目构造、难度分级。
 */

export class Rng {
  constructor(seed) {
    this.state = (seed >>> 0) || 1;
  }
  next() {
    // mulberry32
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(min, max) {
    if (max < min) [min, max] = [max, min];
    return min + Math.floor(this.next() * (max - min + 1));
  }
  bool(p = 0.5) {
    return this.next() < p;
  }
  pick(arr) {
    return arr[this.int(0, arr.length - 1)];
  }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  sample(arr, k) {
    return this.shuffle(arr).slice(0, k);
  }
  intArray(n, min, max) {
    return Array.from({ length: n }, () => this.int(min, max));
  }
  distinctArray(n, min, max) {
    const set = new Set();
    const span = max - min + 1;
    if (n > span) throw new Error("distinctArray: 无法生成足够的互异元素");
    while (set.size < n) set.add(this.int(min, max));
    return [...set];
  }
}

export const DIFFICULTIES = ["入门", "简单", "中等", "困难"];
export const POINTS = { 入门: 10, 简单: 20, 中等: 40, 困难: 80 };

let seq = 0;

export function resetSeq() {
  seq = 0;
}

/**
 * 构造一道题（并分配全局序号 id）。
 */
export function buildProblem({
  key,
  variant,
  title,
  difficulty,
  topic,
  tags,
  description,
  inputFormat,
  outputFormat,
  samples,
  tests,
  checker = "exact",
  solutions,
  source = "template",
  timeLimitMs = 2000,
  hint = "",
}) {
  const id = `p${String(++seq).padStart(4, "0")}`;
  return {
    id,
    slug: variant ? `${key}-${variant}` : key,
    title,
    difficulty,
    topic,
    tags,
    source,
    points: POINTS[difficulty] ?? 10,
    timeLimitMs,
    checker,
    description,
    inputFormat,
    outputFormat,
    samples: samples.map((s) => ({ input: s.input, output: s.output, explanation: s.explanation ?? "" })),
    hint,
    tests,
    solutions,
  };
}

/** 数组 -> 空格分隔的一行 */
export const line = (arr) => arr.join(" ");
/** 数组 -> 每行一个 */
export const lines = (arr) => arr.join("\n");

export function grid(rows) {
  return rows.map((r) => r.join(" ")).join("\n");
}

/** 让样例更可读：截断过长的输入展示 */
export function sampleOf(input, output, explanation = "") {
  return { input, output, explanation };
}
