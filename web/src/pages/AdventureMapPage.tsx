import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type ProblemMeta } from "../api";
import { CHAPTERS, chapterProgress } from "../data/adventure";
import { useProgress } from "../store";

export default function AdventureMapPage() {
  const { chapterId = "" } = useParams();
  const nav = useNavigate();
  const progress = useProgress();
  const [problems, setProblems] = useState<ProblemMeta[]>([]);

  const chapter = CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0];

  useEffect(() => {
    api.problems().then((r) => setProblems(r.problems)).catch(() => {});
  }, []);

  const nodes = chapterProgress(chapter, problems, progress.solved);
  const clearedCount = nodes.filter((n) => n.cleared).length;
  const available = nodes.filter((n) => n.items.length > 0).length;

  return (
    <>
      <div className="topbar">
        <button className="btn ghost" onClick={() => nav("/adventure")}>‹ 返回</button>
        <span className="title">{chapter.name}</span>
        <span className="spacer" />
        <div className="adv-progress">
          <span className="stat">{clearedCount}/{available}</span>
          <div className="bar">
            {nodes.map((n) => (
              <i key={n.spec.id} className={n.cleared ? "on" : ""} />
            ))}
          </div>
        </div>
      </div>

      <div className="page">
        <div className="page-pad">
          <div className="map-wrap">
            <div className="map-stage">{chapter.stage}</div>
            <div className="map-node-wrap">
              {nodes.map((n, i) => (
                <div key={n.spec.id} className="map-node-wrap">
                  {i > 0 && <div className="map-link" />}
                  <div className="map-row">
                    {n.spec.chest && <span className="chest">{n.cleared ? "🎁" : "🎁"}</span>}
                    <div
                      className={
                        "map-node" +
                        (!n.items.length || !n.unlocked ? " locked" : n.cleared ? " done" : "") +
                        (n.unlocked && !n.cleared && n.items.length > 0 ? " current" : "")
                      }
                      title={n.items.length ? "" : "暂无匹配题目"}
                      onClick={() => {
                        if (!n.items.length || !n.unlocked) return;
                        const nextP = n.items.find((p) => progress.solved[p.id]?.verdict !== "AC") ?? n.items[0];
                        nav(`/problem/${nextP.id}`);
                      }}
                    >
                      <span className="ic">{n.cleared ? "🏠" : n.items.length && n.unlocked ? n.spec.icon : "🔒"}</span>
                      <span className="nm">{n.spec.name}</span>
                      <span className="pg">
                        {n.items.length ? `${n.done}/${n.items.length}` : "未开放"}
                      </span>
                    </div>
                    {n.spec.chest && <span className="chest">{n.cleared ? "✨" : "🎁"}</span>}
                  </div>
                </div>
              ))}
              <div className="map-link" />
              <div className="map-row">
                <span className="map-unknown">❓</span>
                <span className="map-unknown">❓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
