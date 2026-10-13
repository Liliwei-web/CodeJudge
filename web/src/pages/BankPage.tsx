import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Difficulty, type ProblemMeta } from "../api";
import { useProgress } from "../store";

const DIFFS: Difficulty[] = ["入门", "简单", "中等", "困难"];
const PAGE_SIZE = 25;

export default function BankPage() {
  const nav = useNavigate();
  const progress = useProgress();
  const [problems, setProblems] = useState<ProblemMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [diff, setDiff] = useState<Difficulty | "全部">("全部");
  const [tag, setTag] = useState<string>("全部");
  const [q, setQ] = useState("");
  const [onlyUnsolved, setOnlyUnsolved] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.problems()
      .then((r) => setProblems(r.problems))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    problems.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return ["全部", ...[...s].sort()];
  }, [problems]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return problems.filter((p) => {
      if (diff !== "全部" && p.difficulty !== diff) return false;
      if (tag !== "全部" && !p.tags.includes(tag)) return false;
      if (onlyUnsolved && progress.solved[p.id]?.verdict === "AC") return false;
      if (kw && !(p.title.toLowerCase().includes(kw) || p.id.includes(kw) || p.tags.some((t) => t.toLowerCase().includes(kw)))) return false;
      return true;
    });
  }, [problems, diff, tag, q, onlyUnsolved, progress]);

  useEffect(() => setPage(1), [diff, tag, q, onlyUnsolved]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const solvedTotal = problems.filter((p) => progress.solved[p.id]?.verdict === "AC").length;

  return (
    <>
      <div className="topbar">
        <span className="title">题库</span>
        <span className="crumbs">全部题目</span>
        <span className="spacer" />
        <span className="stat">已解决 <b>{solvedTotal}</b> / {problems.length}</span>
      </div>
      <div className="page">
        <div className="page-pad">
          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <b>学习进度</b>
              <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                {problems.length ? Math.round((solvedTotal / problems.length) * 100) : 0}%
              </span>
            </div>
            <div className="progress-line">
              <i style={{ width: `${problems.length ? (solvedTotal / problems.length) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="bank-head">
            <input className="input search" placeholder="搜索题目 / 标签 / 编号" value={q} onChange={(e) => setQ(e.target.value)} />
            <div style={{ display: "flex", gap: 6 }}>
              {(["全部", ...DIFFS] as const).map((d) => (
                <span key={d} className={"chip click" + (diff === d ? " on" : "")} onClick={() => setDiff(d as Difficulty)}>{d}</span>
              ))}
            </div>
            <select className="select" value={tag} onChange={(e) => setTag(e.target.value)}>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className={"chip click" + (onlyUnsolved ? " on" : "")} onClick={() => setOnlyUnsolved(!onlyUnsolved)}>隐藏已通过</span>
            <span className="spacer" style={{ flex: 1 }} />
            <span style={{ color: "var(--text-3)", fontSize: 12 }}>共 {filtered.length} 题</span>
          </div>

          {err && <div className="toast err">{err}</div>}
          {loading ? (
            <div className="empty">加载中…</div>
          ) : (
            <table className="plist">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>状态</th>
                  <th style={{ width: 90 }}>编号</th>
                  <th>题目</th>
                  <th style={{ width: 150 }}>标签</th>
                  <th style={{ width: 70 }}>难度</th>
                  <th style={{ width: 70 }}>分值</th>
                  <th style={{ width: 64 }}></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => {
                  const st = progress.solved[p.id];
                  return (
                    <tr key={p.id}>
                      <td>{st?.verdict === "AC" ? <span className="badge ac">✓</span> : <span className="badge wait">—</span>}</td>
                      <td style={{ color: "var(--text-3)" }}>{p.id.toUpperCase()}</td>
                      <td className="t" onClick={() => nav(`/problem/${p.id}`)}>{p.title}</td>
                      <td>
                        <div className="tag-list">
                          {p.tags.slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}
                        </div>
                      </td>
                      <td className={`dif dif-${p.difficulty}`}>{p.difficulty}</td>
                      <td style={{ color: "var(--text-3)" }}>{p.points}</td>
                      <td>
                        <button className="btn ghost mini" onClick={(e) => { e.stopPropagation(); nav(`/problem/${p.id}?answer=1`); }}>答案</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pager">
              <button disabled={page === 1} onClick={() => setPage(1)}>«</button>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>上一页</button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                const num = start + i;
                if (num > totalPages) return null;
                return <button key={num} className={num === page ? "on" : ""} onClick={() => setPage(num)}>{num}</button>;
              })}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>下一页</button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
              <span style={{ marginLeft: 8 }}>{page} / {totalPages}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
