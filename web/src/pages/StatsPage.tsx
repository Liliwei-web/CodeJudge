import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type ProblemMeta } from "../api";
import { clearAll, collectMistakeIds, setAutoTemplate, useProgress } from "../store";

const DIFFS = ["入门", "简单", "中等", "困难"] as const;

export default function StatsPage() {
  const nav = useNavigate();
  const progress = useProgress();
  const [problems, setProblems] = useState<ProblemMeta[]>([]);

  useEffect(() => {
    api.problems().then((r) => setProblems(r.problems)).catch(() => {});
  }, []);

  const solvedSet = new Set(Object.entries(progress.solved).filter(([, r]) => r.verdict === "AC").map(([k]) => k));
  const xp = problems.filter((p) => solvedSet.has(p.id)).reduce((s, p) => s + p.points, 0);
  const maxXP = problems.reduce((s, p) => s + p.points, 0);
  const level = Math.floor(Math.sqrt(xp / 60)) + 1;

  const byDiff = DIFFS.map((d) => {
    const total = problems.filter((p) => p.difficulty === d).length;
    const done = problems.filter((p) => p.difficulty === d && solvedSet.has(p.id)).length;
    return { d, total, done };
  });

  const topics = [...new Set(problems.map((p) => p.topic))].map((t) => {
    const list = problems.filter((p) => p.topic === t);
    return { t, total: list.length, done: list.filter((p) => solvedSet.has(p.id)).length };
  }).sort((a, b) => b.total - a.total);

  const submissions = Object.keys(progress.solved).length;
  const accepted = solvedSet.size;
  const mistakes = collectMistakeIds(progress).length;
  const historyCount = progress.history.length;

  return (
    <>
      <div className="topbar">
        <span className="title">学习统计</span>
        <span className="spacer" />
        <button className="btn ghost" onClick={() => { if (confirm("确定清空本地全部做题进度？")) clearAll(); }}>清空进度</button>
      </div>
      <div className="page">
        <div className="page-pad">
          <div className="stat-grid">
            <div className="stat-card"><div className="n">{accepted}</div><div className="l">已通过的题目</div></div>
            <div className="stat-card"><div className="n">{submissions}</div><div className="l">尝试过的题目</div></div>
            <div className="stat-card"><div className="n">{xp}</div><div className="l">经验值（共 {maxXP}）</div></div>
            <div className="stat-card"><div className="n">Lv.{level}</div><div className="l">探险等级</div></div>
            <div className="stat-card clickable" onClick={() => nav("/mistakes")}><div className="n">{mistakes}</div><div className="l">错题本 →</div></div>
            <div className="stat-card clickable" onClick={() => nav("/history")}><div className="n">{historyCount}</div><div className="l">提交记录 →</div></div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <b>难度分布</b>
            <div style={{ marginTop: 10 }}>
              {byDiff.map(({ d, total, done }) => (
                <div className="bar-row" key={d}>
                  <span className="nm">{d}</span>
                  <span className="bar"><i style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></span>
                  <span style={{ color: "var(--text-3)", width: 70, textAlign: "right" }}>{done}/{total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <b>专题进度</b>
            <div style={{ marginTop: 10 }}>
              {topics.map(({ t, total, done }) => (
                <div className="bar-row" key={t}>
                  <span className="nm" style={{ width: 110 }}>{t}</span>
                  <span className="bar"><i style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></span>
                  <span style={{ color: "var(--text-3)", width: 70, textAlign: "right" }}>{done}/{total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <b>偏好设置</b>
            <div className="pref-row" style={{ marginTop: 10 }}>
              <span
                className={"chip click" + (progress.prefs.autoTemplate ? " on" : "")}
                onClick={() => setAutoTemplate(!progress.prefs.autoTemplate)}
              >
                {progress.prefs.autoTemplate ? "已开启" : "已关闭"}
              </span>
              <span>打开题目时自动插入代码模板</span>
              <span className="desc">默认关闭：编辑器是空板，需要模板时在做题页点「插入模板」</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
