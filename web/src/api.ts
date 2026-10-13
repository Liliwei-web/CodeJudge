export type Difficulty = "入门" | "简单" | "中等" | "困难";

export interface ProblemMeta {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  tags: string[];
  source: string;
  points: number;
  timeLimitMs: number;
  hiddenTestCount: number;
  sampleCount: number;
}

export interface Sample { input: string; output: string; explanation: string }

export interface ProblemDetail extends ProblemMeta {
  description: string;
  inputFormat: string;
  outputFormat: string;
  hint: string;
  samples: Sample[];
}

export interface SolutionEntry { id: string; name: string; code: string }

export interface LangStatus { id: string; name: string; monaco: string; available: boolean; starter: string }

export interface Health {
  ok: boolean;
  toolchainDir: string | null;
  languages: LangStatus[];
  dataset: { total: number; byDifficulty: Record<string, number>; bySource: Record<string, number> };
  versions: { node: string | null; python: string | null; gcc: string | null; gpp: string | null };
}

export type Verdict = "AC" | "WA" | "TLE" | "RE" | "CE" | "OLE";

export interface JudgeCase {
  index: number;
  name: string;
  verdict: Verdict;
  timeMs: number;
  /** 是否真的和期望输出比对过（自定义输入且不是样例时为 false） */
  compared: boolean;
  input: string | null;
  expected: string | null;
  actual: string;
  stderr: string;
}

export interface JudgeResult {
  mode: "run" | "submit";
  language: string;
  verdict: Verdict;
  score: number;
  passed: number;
  total: number;
  maxTimeMs: number;
  compile: { ok: boolean; output: string };
  cases: JudgeCase[];
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data?.error || `请求失败 (${res.status})`);
  return data as T;
}

export const api = {
  health: () => req<Health>("/api/health"),
  problems: () => req<{ problems: ProblemMeta[] }>("/api/problems"),
  problem: (id: string) => req<{ problem: ProblemDetail }>(`/api/problems/${id}`),
  solution: (id: string) => req<{ solutions: SolutionEntry[] }>(`/api/problems/${id}/solution`),
  run: (body: { problemId: string; language: string; source: string }) =>
    req<{ result: JudgeResult }>("/api/run", { method: "POST", body: JSON.stringify(body) }),
  submit: (body: { problemId: string; language: string; source: string }) =>
    req<{ result: JudgeResult }>("/api/submit", { method: "POST", body: JSON.stringify(body) }),
};

export const VERDICT_TEXT: Record<Verdict, string> = {
  AC: "答案正确",
  WA: "答案错误",
  TLE: "超出时间限制",
  RE: "运行时错误",
  CE: "编译错误",
  OLE: "输出超出限制",
};
