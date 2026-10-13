import type { Difficulty, ProblemMeta } from "./api";

const ROUND_KEY = "codejudge.random.round";

export const ALL_DIFFS: Difficulty[] = ["入门", "简单", "中等", "困难"];

export interface RandomFilter {
  diffs: Difficulty[];
  tag: string;
  skipSolved: boolean;
}

export function parseDiffs(value: string | null): Difficulty[] {
  if (!value) return ALL_DIFFS.slice();
  const picked = value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => (ALL_DIFFS as string[]).includes(s)) as Difficulty[];
  return picked.length ? picked : ALL_DIFFS.slice();
}

/** 把抽题条件编进 URL，做题页据此继续“换一题” */
export function filterToQuery(f: RandomFilter, extra: Record<string, string> = {}) {
  const p = new URLSearchParams({ mode: "random", diffs: f.diffs.join(",") });
  if (f.tag && f.tag !== "全部") p.set("tag", f.tag);
  if (f.skipSolved) p.set("skip", "1");
  for (const [k, v] of Object.entries(extra)) p.set(k, v);
  return p.toString();
}

export function filterFromQuery(params: URLSearchParams): RandomFilter {
  return {
    diffs: parseDiffs(params.get("diffs")),
    tag: params.get("tag") || "全部",
    skipSolved: params.get("skip") !== "0",
  };
}

export function poolOf(
  problems: ProblemMeta[],
  f: RandomFilter,
  solved: Record<string, { verdict: string }>
): ProblemMeta[] {
  return problems.filter((p) => {
    if (!f.diffs.includes(p.difficulty)) return false;
    if (f.tag !== "全部" && !p.tags.includes(f.tag)) return false;
    if (f.skipSolved && solved[p.id]?.verdict === "AC") return false;
    return true;
  });
}

export function loadRound(): string[] {
  try {
    const raw = sessionStorage.getItem(ROUND_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveRound(ids: string[]) {
  try {
    sessionStorage.setItem(ROUND_KEY, JSON.stringify(ids));
  } catch {
    /* 忽略 */
  }
}

export function addToRound(id: string) {
  const cur = loadRound();
  if (!cur.includes(id)) {
    cur.push(id);
    saveRound(cur);
  }
  return cur;
}

export function clearRound() {
  saveRound([]);
}

/** 从题库池里随机取一道；本轮抽过的不会重复，抽完自动开启新一轮 */
export function pickFromPool(
  pool: ProblemMeta[],
  drawn: string[],
  exclude?: string
): { problem: ProblemMeta | null; fresh: boolean } {
  if (!pool.length) return { problem: null, fresh: false };
  const drawnSet = new Set(drawn);
  let candidates = pool.filter((p) => !drawnSet.has(p.id) && p.id !== exclude);
  let fresh = true;
  if (!candidates.length) {
    candidates = pool.filter((p) => p.id !== exclude);
    fresh = false;
  }
  if (!candidates.length) return { problem: null, fresh: false };
  return { problem: candidates[Math.floor(Math.random() * candidates.length)], fresh };
}
