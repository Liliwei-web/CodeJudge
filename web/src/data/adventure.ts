import type { Difficulty, ProblemMeta } from "../api";

export interface NodeSpec {
  id: string;
  name: string;
  icon: string;
  topic?: string;
  tags?: string[];
  difficulties?: Difficulty[];
  size: number;
  chest?: boolean;
  unknown?: boolean;
}

export interface ChapterSpec {
  id: string;
  name: string;
  desc: string;
  art: string;
  stage: string;
  nodes: NodeSpec[];
}

/** 章节与关卡：关卡通过 topic/tags/difficulty 从题库中动态取题，题库扩充后自动生效 */
export const CHAPTERS: ChapterSpec[] = [
  {
    id: "linear",
    name: "线性浅滩",
    desc: "数组与循环",
    art: "🔷",
    stage: "第一章 · 线性浅滩",
    nodes: [
      { id: "lin-1", name: "数组 I", icon: "🏠", topic: "循环与数组", size: 4 },
      { id: "lin-2", name: "数组 II", icon: "🏠", topic: "循环与数组", difficulties: ["简单"], size: 4 },
      { id: "lin-3", name: "排序", icon: "🏠", topic: "数组与排序", size: 4 },
      { id: "lin-4", name: "查找", icon: "🏠", topic: "数组与排序", tags: ["查找"], size: 2, chest: true },
      { id: "lin-5", name: "前缀和", icon: "🏠", topic: "循环与数组", tags: ["统计"], size: 3 },
      { id: "lin-6", name: "综合练", icon: "🔒", topic: "循环与数组", size: 4 },
    ],
  },
  {
    id: "digit",
    name: "数位丛林",
    desc: "整数与数位处理",
    art: "🌲",
    stage: "第二章 · 数位丛林",
    nodes: [
      { id: "dig-1", name: "整数基础", icon: "🏠", topic: "整数与数论", size: 4 },
      { id: "dig-2", name: "数位 I", icon: "🏠", topic: "数位处理", size: 5 },
      { id: "dig-3", name: "数位 II", icon: "🏠", topic: "数位处理", size: 5, chest: true },
      { id: "dig-4", name: "质数与约数", icon: "🏠", topic: "整数与数论", size: 4 },
      { id: "dig-5", name: "挑战", icon: "🔒", topic: "数位处理", size: 4 },
    ],
  },
  {
    id: "string",
    name: "字符溪谷",
    desc: "字符串处理",
    art: "🌊",
    stage: "第三章 · 字符溪谷",
    nodes: [
      { id: "str-1", name: "字符串 I", icon: "🏠", topic: "字符串", size: 5 },
      { id: "str-2", name: "字符串 II", icon: "🏠", topic: "字符串", size: 5, chest: true },
      { id: "str-3", name: "统计", icon: "🏠", topic: "字符串", tags: ["字符串"], size: 4 },
      { id: "str-4", name: "隐藏关", icon: "❓", topic: "字符串算法", size: 4, unknown: true },
    ],
  },
  {
    id: "dp",
    name: "动态规划高原",
    desc: "递推、DP、背包",
    art: "🏔️",
    stage: "第四章 · 动态规划高原",
    nodes: [
      { id: "dp-1", name: "递推入门", icon: "🏠", topic: "动态规划", size: 4 },
      { id: "dp-2", name: "线性 DP", icon: "🏠", topic: "动态规划", size: 4 },
      { id: "dp-3", name: "背包问题", icon: "🏠", topic: "动态规划", size: 4, chest: true },
      { id: "dp-4", name: "子序列", icon: "🏠", topic: "动态规划", size: 4 },
      { id: "dp-5", name: "高阶 DP", icon: "🔒", topic: "动态规划", difficulties: ["困难"], size: 4 },
    ],
  },
  {
    id: "greedy",
    name: "贪心峡谷",
    desc: "贪心、双指针、滑动窗口",
    art: "⚔️",
    stage: "第五章 · 贪心峡谷",
    nodes: [
      { id: "gr-1", name: "双指针", icon: "🏠", topic: "贪心与双指针", size: 4 },
      { id: "gr-2", name: "滑动窗口", icon: "🏠", topic: "贪心与双指针", size: 4 },
      { id: "gr-3", name: "区间调度", icon: "🏠", topic: "贪心与双指针", size: 4, chest: true },
      { id: "gr-4", name: "贪心挑战", icon: "🔒", topic: "贪心与双指针", difficulties: ["中等", "困难"], size: 4 },
    ],
  },
  {
    id: "stack",
    name: "栈与队列回廊",
    desc: "栈、队列、单调栈",
    art: "🧱",
    stage: "第六章 · 栈与队列回廊",
    nodes: [
      { id: "st-1", name: "括号匹配", icon: "🏠", topic: "栈与队列", size: 3 },
      { id: "st-2", name: "单调栈", icon: "🏠", topic: "栈与队列", size: 4, chest: true },
      { id: "st-3", name: "栈的应用", icon: "🔒", topic: "栈与队列", size: 4 },
    ],
  },
  {
    id: "graph",
    name: "图论雪原",
    desc: "搜索、最短路、并查集",
    art: "❄️",
    stage: "第七章 · 图论雪原",
    nodes: [
      { id: "gf-1", name: "搜索基础", icon: "🏠", topic: "图论", size: 4 },
      { id: "gf-2", name: "最短路", icon: "🏠", topic: "图论", size: 4 },
      { id: "gf-3", name: "并查集", icon: "🏠", topic: "图论", size: 3, chest: true },
      { id: "gf-4", name: "图论挑战", icon: "🔒", topic: "图论", difficulties: ["困难"], size: 4 },
    ],
  },
  {
    id: "tree",
    name: "树形森林",
    desc: "树的遍历与性质",
    art: "🌳",
    stage: "第八章 · 树形森林",
    nodes: [
      { id: "tr-1", name: "树的遍历", icon: "🏠", topic: "树", size: 4 },
      { id: "tr-2", name: "树的性质", icon: "🏠", topic: "树", size: 4, chest: true },
      { id: "tr-3", name: "树形 DP", icon: "🔒", topic: "树", difficulties: ["中等", "困难"], size: 4 },
    ],
  },
  {
    id: "number",
    name: "数论神殿",
    desc: "快速幂、组合数学、位运算",
    art: "🔮",
    stage: "第九章 · 数论神殿",
    nodes: [
      { id: "nm-1", name: "位运算", icon: "🏠", topic: "位运算", size: 4 },
      { id: "nm-2", name: "快速幂", icon: "🏠", topic: "数论进阶", size: 4 },
      { id: "nm-3", name: "组合数学", icon: "🏠", topic: "数论进阶", size: 4, chest: true },
      { id: "nm-4", name: "终极挑战", icon: "🔒", topic: "数论进阶", difficulties: ["困难"], size: 4 },
    ],
  },
  {
    id: "final",
    name: "2026 Offer 探险行动",
    desc: "综合模拟与真题实战",
    art: "💎",
    stage: "终章 · Offer 探险行动",
    nodes: [
      { id: "fn-1", name: "综合模拟", icon: "🏠", topic: "数据结构与模拟", size: 4 },
      { id: "fn-2", name: "大数运算", icon: "🏠", topic: "大数运算", size: 4, chest: true },
      { id: "fn-3", name: "字符串算法", icon: "🏠", topic: "字符串算法", size: 4 },
      { id: "fn-4", name: "BOSS 关", icon: "🔒", difficulties: ["困难"], size: 5 },
    ],
  },
];

export function resolveNode(node: NodeSpec, problems: ProblemMeta[]): ProblemMeta[] {
  const pool = problems.filter((p) => {
    if (node.topic && p.topic !== node.topic && !p.tags.includes(node.topic)) return false;
    if (node.difficulties && !node.difficulties.includes(p.difficulty)) return false;
    if (node.tags && !node.tags.some((t) => p.tags.includes(t))) return false;
    return true;
  });
  return pool.slice(0, node.size);
}

export function chapterProgress(chapter: ChapterSpec, problems: ProblemMeta[], solved: Record<string, { verdict: string }>) {
  const nodes = chapter.nodes.map((n) => {
    const items = resolveNode(n, problems);
    const done = items.filter((p) => solved[p.id]?.verdict === "AC").length;
    return { spec: n, items, done, cleared: items.length > 0 && done >= items.length };
  });
  let unlocked = true;
  const withLock = nodes.map((n) => {
    const state = { ...n, unlocked: unlocked && n.items.length > 0 };
    // 有题可做且前一个已通关才解锁
    if (!n.cleared) unlocked = false;
    return state;
  });
  return withLock;
}
