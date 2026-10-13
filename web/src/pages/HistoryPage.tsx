import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, VERDICT_TEXT, type ProblemMeta, type Verdict } from "../api";
import { clearHistory, setDraft, useProgress } from "../store";

const PAGE_SIZE = 25;
const LANG_NAME: Record<string, string> = { python: "Python 3", cpp: "C++17", c: "C17" };

function fmtTime(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function HistoryPage() {
  const nav = useNavigate();
  const progress = useProgress();
  const [problems, setProblems] = useState<ProblemMeta[]>([]);
  const [verdictF, setVerdictF] = useState<"全部" | "未通过" | "AC">("全部");
  const [langF, setLangF] = useState("全部");
  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.problems().then((r) => setProblems(r.problems)).catch(() => {});
  }, []);

  const byId = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);
  const history = progress.history;

  const filtered = useMemo(() => {
    const k = kw.trim().toLowerCase();
    return history.filter((e) => {
      if (verdictF === "AC" && e.verdict !== "AC") return false;
      if (verdictF === "未通过" && e.verdict === "AC") return false;
      if (langF !== "全部" && e.language !== langF) return false;
      if (k) {
        const title = byId.get(e.id)?.title ?? "";
        if (!e.id.includes(k) && !title.toLowerCase().includes(k)) return false;
      }
      return true;
    });
  }, [history, verdictF, langF, kw, byId]);

  useEffect(() => setPage(1), [verdictF, langF, kw]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const acCount = history.filter((e) => e.verdict === "AC").length;

  /** 把当时提交的源码恢复成草稿，并切到对应语言 */
  function loadCode(id: string, language: string, code: string) {
    localStorage.setItem("codejudge.lang", language);
    setDraft(id, language, code);
    nav(`/problem/${id}`);
  }

  return (
    <>
      <div className="topbar">
        <span className="title">提交历史</span>
        <span className="crumbs">最近在前的提交记录</span>
        <span className="spacer" />
        <span className="stat">共 <b>{history.length}</b> 条 · 通过 {acCount}</span>
        <button
          className="btn ghost"
          disabled={!history.length}
          onClick={() => { if (confirm("确定清空全部提交历史？")) clearHistory(); }}
        >
          清空历史
        </button>
      </div>

      <div className="page">
        <div className="page-pad">
          <div className="bank-head" style={{ marginBottom: 14 }}>
            {(["全部", "未通过", "AC"] as const).map((v) => (
              <span key={v} className={"chip click" + (verdictF === v ? " on" : "")} onClick={() => setVerdictF(v)}>{v}</span>
            ))}
            <select className="select" value={langF} onChange={(e) => setLangF(e.target.value)}>
              {["全部", "python", "cpp", "c"].map((l) => (
                <option key={l} value={l}>{l === "全部" ? "全部语言" : LANG_NAME[l]}</option>
              ))}
            </select>
            <input className="input search" placeholder="搜索题号 / 题目" value={kw} onChange={(e) => setKw(e.target.value)} />
            <span className="spacer" style={{ flex: 1 }} />
            <span className="dim">共 {filtered.length} 条</span>
          </div>

          {!history.length ? (
            <div className="empty">还没有提交记录，去题库里挑一道题试试</div>
          ) : (
            <table className="plist">
              <thead>
                <tr>
                  <th style={{ width: 130 }}>时间</th>
                  <th style={{ width: 80 }}>编号</th>
                  <th>题目</th>
                  <th style={{ width: 88 }}>语言</th>
                  <th style={{ width: 96 }}>判定</th>
                  <th style={{ width: 74 }}>通过</th>
                  <th style={{ width: 60 }}>得分</th>
                  <th style={{ width: 78 }}>耗时</th>
                  <th style={{ width: 150 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((e, i) => {
                  const meta = byId.get(e.id);
                  const ok = e.verdict === "AC";
                  return (
                    <tr key={`${e.ts}-${i}`}>
                      <td className="dim">{fmtTime(e.ts)}</td>
                      <td className="dim">{e.id.toUpperCase()}</td>
                      <td className="t" onClick={() => nav(`/problem/${e.id}`)}>{meta?.title ?? e.id}</td>
                      <td className="dim">{LANG_NAME[e.language] ?? e.language}</td>
                      <td>
                        <span style={{ color: ok ? "var(--green)" : "var(--red)" }}>
                          {ok ? "✓ " : "✗ "}{VERDICT_TEXT[e.verdict as Verdict] ?? e.verdict}
                        </span>
                      </td>
                      <td className="dim">{e.passed}/{e.total}</td>
                      <td style={{ color: ok ? "var(--green)" : "var(--text-3)" }}>{e.score}</td>
                      <td className="dim">{e.maxTimeMs} ms</td>
                      <td>
                        <div className="row-actions">
                          {e.code && (
                            <button className="btn ghost mini" onClick={() => loadCode(e.id, e.language, e.code!)}>载入代码</button>
                          )}
                          <button className="btn ghost mini" onClick={() => nav(`/problem/${e.id}`)}>打开</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pager">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>上一页</button>
              <span style={{ margin: "0 8px" }}>{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>下一页</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
