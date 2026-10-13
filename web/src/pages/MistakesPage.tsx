import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, VERDICT_TEXT, type Difficulty, type ProblemMeta, type Verdict } from "../api";
import { clearMistakes, collectMistakeIds, toggleMistake, useProgress } from "../store";

const DIFFS: Difficulty[] = ["入门", "简单", "中等", "困难"];

function fmtTime(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function MistakesPage() {
  const nav = useNavigate();
  const progress = useProgress();
  const [problems, setProblems] = useState<ProblemMeta[]>([]);
  const [diff, setDiff] = useState<Difficulty | "全部">("全部");
  const loaded = problems.length > 0;

  useEffect(() => {
    api.problems().then((r) => setProblems(r.problems)).catch(() => {});
  }, []);

  const byId = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);
  const ids = useMemo(() => collectMistakeIds(progress), [progress]);
  const list = useMemo(
    () => ids.map((id) => byId.get(id)).filter((p): p is ProblemMeta => !!p),
    [ids, byId]
  );

  const groups = DIFFS.map((d) => ({
    d,
    items: list.filter((p) => p.difficulty === d).sort((a, b) => a.id.localeCompare(b.id)),
  })).filter((g) => g.items.length && (diff === "全部" || diff === g.d));

  return (
    <>
      <div className="topbar">
        <span className="title">错题本</span>
        <span className="crumbs">提交过但还没通过的题目会自动收进来</span>
        <span className="spacer" />
        <span className="stat">共 <b>{list.length}</b> 题</span>
        <button
          className="btn ghost"
          disabled={!list.length}
          onClick={() => { if (confirm("确定清空错题本？（题目本身和提交历史不受影响）")) clearMistakes(); }}
        >
          清空错题本
        </button>
      </div>

      <div className="page">
        <div className="page-pad">
          <div className="bank-head" style={{ marginBottom: 14 }}>
            {(["全部", ...DIFFS] as const).map((d) => (
              <span key={d} className={"chip click" + (diff === d ? " on" : "")} onClick={() => setDiff(d as Difficulty | "全部")}>{d}</span>
            ))}
            <span className="spacer" style={{ flex: 1 }} />
            <span className="dim">在做题页点「☆ 加入错题本」可以手动收藏</span>
          </div>

          {!loaded ? (
            <div className="empty">加载中…</div>
          ) : !list.length ? (
            <div className="empty">错题本是空的 —— 提交过但没通过的题目会自动进来，也可以手动加入</div>
          ) : !groups.length ? (
            <div className="empty">该难度下没有错题</div>
          ) : (
            groups.map((g) => (
              <div key={g.d} className="card" style={{ marginBottom: 16 }}>
                <div className="section-head">
                  <b className={`dif dif-${g.d}`}>{g.d}</b>
                  <span className="dim">{g.items.length} 题</span>
                </div>
                <table className="plist">
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>编号</th>
                      <th>题目</th>
                      <th style={{ width: 110 }}>主题</th>
                      <th style={{ width: 110 }}>上次判定</th>
                      <th style={{ width: 70 }}>尝试</th>
                      <th style={{ width: 110 }}>最近提交</th>
                      <th style={{ width: 150 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((p) => {
                      const rec = progress.solved[p.id];
                      const ok = rec?.verdict === "AC";
                      return (
                        <tr key={p.id}>
                          <td className="dim">{p.id.toUpperCase()}</td>
                          <td className="t" onClick={() => nav(`/problem/${p.id}`)}>{p.title}</td>
                          <td className="dim">{p.topic}</td>
                          <td>
                            {rec ? (
                              <span style={{ color: ok ? "var(--green)" : "var(--red)" }}>
                                {ok ? "✓ " : "✗ "}{VERDICT_TEXT[rec.verdict as Verdict] ?? rec.verdict}
                              </span>
                            ) : (
                              <span className="dim">手动加入</span>
                            )}
                          </td>
                          <td className="dim">{rec?.attempts ?? 0}</td>
                          <td className="dim">{fmtTime(rec?.ts)}</td>
                          <td>
                            <div className="row-actions">
                              <button className="btn ghost mini" onClick={() => nav(`/problem/${p.id}`)}>重做</button>
                              <button className="btn ghost mini" onClick={() => toggleMistake(p.id)}>移出</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
