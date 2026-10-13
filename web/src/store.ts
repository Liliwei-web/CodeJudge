import { useSyncExternalStore } from "react";

const KEY = "codejudge.progress.v2";
const HISTORY_LIMIT = 500; // 最多保留的提交条数
const HISTORY_CODE_LIMIT = 8000; // 单条源码截断长度
const HISTORY_CODE_BUDGET = 1_200_000; // 历史中源码字符总预算

export interface Record_ {
  verdict: string;
  score: number;
  attempts: number;
  ts: number;
}

export interface HistoryEntry {
  id: string;
  ts: number;
  language: string;
  verdict: string;
  score: number;
  passed: number;
  total: number;
  maxTimeMs: number;
  code?: string;
}

export interface ProgressState {
  solved: Record<string, Record_>;
  drafts: Record<string, string>;
  adventure: { cleared: Record<string, number>; chests: string[] };
  history: HistoryEntry[];
  mistakes: { manual: string[]; dismissed: string[] };
  prefs: { autoTemplate: boolean };
}

const initial: ProgressState = {
  solved: {},
  drafts: {},
  adventure: { cleared: {}, chests: [] },
  history: [],
  mistakes: { manual: [], dismissed: [] },
  prefs: { autoTemplate: false },
};

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const p = JSON.parse(raw);
    return {
      solved: p.solved ?? {},
      drafts: p.drafts ?? {},
      adventure: { cleared: p.adventure?.cleared ?? {}, chests: p.adventure?.chests ?? [] },
      history: Array.isArray(p.history) ? p.history : [],
      mistakes: { manual: p.mistakes?.manual ?? [], dismissed: p.mistakes?.dismissed ?? [] },
      prefs: { autoTemplate: !!p.prefs?.autoTemplate },
    };
  } catch {
    return initial;
  }
}

let state: ProgressState = typeof localStorage === "undefined" ? initial : load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return;
  } catch {
    /* 配额不足：丢弃历史里的源码后再试一次 */
  }
  try {
    state = { ...state, history: state.history.map(({ code, ...rest }) => rest) };
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 仍失败则只在内存中保留 */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/** 历史条数 / 源码体积双重裁剪，新提交在前 */
function trimHistory(list: HistoryEntry[]): HistoryEntry[] {
  const out = list.slice(0, HISTORY_LIMIT).map((e) => ({ ...e }));
  let budget = out.reduce((s, e) => s + (e.code?.length ?? 0), 0);
  for (let i = out.length - 1; i >= 0 && budget > HISTORY_CODE_BUDGET; i--) {
    const c = out[i].code;
    if (c) {
      budget -= c.length;
      delete out[i].code;
    }
  }
  return out;
}

export function recordSubmit(input: {
  id: string;
  verdict: string;
  score: number;
  language: string;
  passed?: number;
  total?: number;
  maxTimeMs?: number;
  code?: string;
}) {
  const prev = state.solved[input.id];
  const better = !prev || input.score > prev.score || (input.score === prev.score && prev.verdict !== "AC" && input.verdict === "AC");
  const ts = Date.now();
  const entry: HistoryEntry = {
    id: input.id,
    ts,
    language: input.language,
    verdict: input.verdict,
    score: input.score,
    passed: input.passed ?? 0,
    total: input.total ?? 0,
    maxTimeMs: input.maxTimeMs ?? 0,
  };
  if (input.code) entry.code = input.code.slice(0, HISTORY_CODE_LIMIT);

  state = {
    ...state,
    solved: {
      ...state.solved,
      [input.id]: better
        ? { verdict: input.verdict, score: input.score, attempts: (prev?.attempts ?? 0) + 1, ts }
        : { ...(prev as Record_), attempts: (prev?.attempts ?? 0) + 1, ts },
    },
    history: trimHistory([entry, ...state.history]),
  };
  emit();
}

export function isSolved(id: string) {
  return state.solved[id]?.verdict === "AC";
}

export function solvedCount() {
  return Object.values(state.solved).filter((r) => r.verdict === "AC").length;
}

export function clearHistory() {
  state = { ...state, history: [] };
  emit();
}

/** 是否在错题本中：手动标记优先，其次看“提交过但未通过” */
export function isInMistakes(id: string) {
  if (state.mistakes.dismissed.includes(id)) return false;
  if (state.mistakes.manual.includes(id)) return true;
  const rec = state.solved[id];
  return !!rec && rec.verdict !== "AC";
}

export function toggleMistake(id: string) {
  const manual = state.mistakes.manual.filter((x) => x !== id);
  const dismissed = state.mistakes.dismissed.filter((x) => x !== id);
  state = isInMistakes(id)
    ? { ...state, mistakes: { manual, dismissed: [...dismissed, id] } }
    : { ...state, mistakes: { manual: [...manual, id], dismissed } };
  emit();
}

/** 错题本题目列表：未通过自动收录 + 手动加入 - 手动移出 */
export function collectMistakeIds(s: ProgressState): string[] {
  const out = new Set<string>();
  for (const [id, rec] of Object.entries(s.solved)) if (rec.verdict !== "AC") out.add(id);
  for (const id of s.mistakes.manual) out.add(id);
  for (const id of s.mistakes.dismissed) out.delete(id);
  return [...out];
}

export function clearMistakes() {
  const ids = collectMistakeIds(state);
  const dismissed = [...new Set([...state.mistakes.dismissed, ...ids])];
  state = { ...state, mistakes: { manual: [], dismissed } };
  emit();
}

export function setAutoTemplate(v: boolean) {
  state = { ...state, prefs: { ...state.prefs, autoTemplate: v } };
  emit();
}

export function draftKey(problemId: string, lang: string) {
  return `${problemId}::${lang}`;
}

export function getDraft(problemId: string, lang: string): string | undefined {
  return state.drafts[draftKey(problemId, lang)];
}

export function setDraft(problemId: string, lang: string, code: string) {
  state = { ...state, drafts: { ...state.drafts, [draftKey(problemId, lang)]: code } };
  emit();
}

export function markNodeCleared(nodeId: string, count: number) {
  state = { ...state, adventure: { ...state.adventure, cleared: { ...state.adventure.cleared, [nodeId]: Math.max(state.adventure.cleared[nodeId] ?? 0, count) } } };
  emit();
}

export function addChest(nodeId: string) {
  if (state.adventure.chests.includes(nodeId)) return;
  state = { ...state, adventure: { ...state.adventure, chests: [...state.adventure.chests, nodeId] } };
  emit();
}

export function clearAll() {
  state = { ...initial, drafts: {}, prefs: state.prefs };
  emit();
}
