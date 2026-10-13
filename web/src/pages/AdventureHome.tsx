import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type ProblemMeta } from "../api";
import { CHAPTERS, chapterProgress } from "../data/adventure";
import { useProgress } from "../store";

export default function AdventureHome() {
  const nav = useNavigate();
  const progress = useProgress();
  const [problems, setProblems] = useState<ProblemMeta[]>([]);

  useEffect(() => {
    api.problems().then((r) => setProblems(r.problems)).catch(() => {});
  }, []);

  const chapters = CHAPTERS.map((c) => {
    const nodes = chapterProgress(c, problems, progress.solved);
    const available = nodes.filter((n) => n.items.length > 0).length;
    const cleared = nodes.filter((n) => n.cleared).length;
    return { c, available, cleared, total: nodes.length };
  });

  const totalNodes = chapters.reduce((s, x) => s + x.available, 0);
  const clearedNodes = chapters.reduce((s, x) => s + x.cleared, 0);

  return (
    <>
      <div className="topbar">
        <span className="title">探险模式</span>
        <span className="spacer" />
        <span className="stat">关卡进度 <b>{clearedNodes}</b> / {totalNodes}</span>
      </div>
      <div className="page">
        <div className="page-pad">
          <div className="adv-hero">
            <div className="flag">🚩</div>
            <h1>探险模式</h1>
            <p>练习，成就进步 · 一关一关把算法拆开练</p>
          </div>

          <div className="chapter-grid">
            {chapters.map(({ c, available, cleared, total }) => (
              <div className="chapter" key={c.id} onClick={() => nav(`/adventure/${c.id}`)}>
                <div className="info">
                  <h3>{c.name}</h3>
                  <div className="sub">
                    {available > 0 ? `${available} 关卡 · 已通关 ${cleared}` : "关卡建设中（题库扩充后自动开放）"}
                  </div>
                  <div className="start" style={{ opacity: available ? 1 : 0.5 }}>
                    <span>👉</span> 开始
                  </div>
                </div>
                <div className="art">{c.art}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
