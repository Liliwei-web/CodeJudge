/**
 * REST API。
 */
import express from "express";
import { detectToolchain } from "../config.js";
import { getLanguage, languageStatus } from "../judge/languages.js";
import { judge } from "../judge/index.js";
import { loadIndex, getProblem, publicProblem, problemSolutions, datasetInfo } from "../problems/store.js";

export const api = express.Router();

/** 简单的并发闸门，避免同时跑太多编译进程 */
function createGate(limit) {
  let running = 0;
  const queue = [];
  const next = () => {
    if (running >= limit || queue.length === 0) return;
    running++;
    const { fn, resolve, reject } = queue.shift();
    fn().then(resolve, reject).finally(() => { running--; next(); });
  };
  return (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); next(); });
}
const gate = createGate(2);

api.get("/health", (req, res) => {
  const tools = detectToolchain();
  res.json({
    ok: true,
    toolchainDir: tools.toolchainDir,
    languages: languageStatus(),
    dataset: datasetInfo(),
    versions: {
      node: process.version,
      python: tools.python.version,
      gcc: tools.gcc.version,
      gpp: tools.gpp.version,
    },
  });
});

api.get("/problems", (req, res) => {
  res.json({ problems: loadIndex() });
});

api.get("/problems/:id", (req, res) => {
  const problem = getProblem(req.params.id);
  if (!problem) return res.status(404).json({ error: "题目不存在" });
  res.json({ problem: publicProblem(problem) });
});

/** 参考代码（按语言）。单独接口，题目详情里不会带 */
api.get("/problems/:id/solution", (req, res) => {
  const solutions = problemSolutions(req.params.id);
  if (!solutions) return res.status(404).json({ error: "题目不存在或没有参考代码" });
  const order = ["python", "cpp", "c"];
  const list = order
    .filter((id) => typeof solutions[id] === "string" && solutions[id].trim())
    .map((id) => ({ id, name: getLanguage(id)?.name ?? id, code: solutions[id] }));
  res.json({ solutions: list });
});

async function handleJudge(req, res, mode) {
  const { problemId, language, source, input } = req.body || {};
  if (!problemId || !language || typeof source !== "string") {
    return res.status(400).json({ error: "缺少 problemId / language / source" });
  }
  if (source.length > 200000) {
    return res.status(413).json({ error: "代码过长（上限 200KB）" });
  }
  const problem = getProblem(problemId);
  if (!problem) return res.status(404).json({ error: "题目不存在" });
  const lang = getLanguage(language);
  if (!lang) return res.status(400).json({ error: "不支持的语言" });
  if (!lang.available()) {
    return res.status(409).json({ error: `当前环境未安装 ${lang.name} 编译器，请先运行 npm run setup` });
  }

  try {
    const result = await gate(() => judge({
      problem,
      lang,
      tools: detectToolchain(),
      source,
      mode,
      customInput: typeof input === "string" ? input : null,
    }));
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
}

api.post("/run", (req, res) => handleJudge(req, res, "run"));
api.post("/submit", (req, res) => handleJudge(req, res, "submit"));

