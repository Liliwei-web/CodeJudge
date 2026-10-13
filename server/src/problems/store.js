/**
 * 题目存储：index.json 提供列表元数据，单题文件提供完整内容（含隐藏测试点）。
 * 对外接口一律剥离隐藏测试点与参考代码。
 */
import fs from "node:fs";
import path from "node:path";
import { INDEX_FILE, PROBLEM_DIR } from "../config.js";

let indexCache = null;
let indexById = null;
const detailCache = new Map();
const DETAIL_CACHE_MAX = 200;

export function loadIndex() {
  if (indexCache) return indexCache;
  if (!fs.existsSync(INDEX_FILE)) {
    indexCache = [];
    indexById = new Map();
    return indexCache;
  }
  indexCache = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
  indexById = new Map(indexCache.map((p) => [p.id, p]));
  return indexCache;
}

export function getMeta(id) {
  loadIndex();
  return indexById.get(id) || null;
}

export function getProblem(id) {
  if (detailCache.has(id)) return detailCache.get(id);
  const file = path.join(PROBLEM_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  const problem = JSON.parse(fs.readFileSync(file, "utf8"));
  if (detailCache.size >= DETAIL_CACHE_MAX) {
    detailCache.delete(detailCache.keys().next().value);
  }
  detailCache.set(id, problem);
  return problem;
}

/** 去掉隐藏测试点和参考代码，只保留给前端看的内容 */
export function publicProblem(p) {
  if (!p) return null;
  const { tests, solutions, ...rest } = p;
  return { ...rest, hiddenTestCount: (tests || []).length };
}

/** 参考代码：单独通过一个接口返回，避免混进题目详情 */
export function problemSolutions(id) {
  const p = getProblem(id);
  if (!p || !p.solutions) return null;
  return p.solutions;
}

export function problemCount() {
  return loadIndex().length;
}

export function datasetInfo() {
  const list = loadIndex();
  const byDifficulty = {};
  const bySource = {};
  for (const p of list) {
    byDifficulty[p.difficulty] = (byDifficulty[p.difficulty] || 0) + 1;
    bySource[p.source] = (bySource[p.source] || 0) + 1;
  }
  return { total: list.length, byDifficulty, bySource };
}
