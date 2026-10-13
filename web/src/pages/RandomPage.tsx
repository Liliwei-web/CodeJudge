import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Difficulty, type ProblemMeta } from "../api";
import { ALL_DIFFS, addToRound, clearRound, filterToQuery, loadRound, pickFromPool, poolOf } from "../random";
import { useProgress } from "../store";

export default function RandomPage() {
  const nav = useNavigate();
  const progress = useProgress();
  const [problems, setProblems] = useState<ProblemMeta[]>([]);
  const [diffs, setDiffs] = useState<Difficulty[]>(ALL_DIFFS.slice());
  const [tag, setTag] = useState("全部");
  const [skipSolved, setSkipSolved] = useState(true);
  const [round, setRound] = useState<string[]>(() => loadRound());
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);

  useEffect(() => {
    api.problems().then((r) => setProblems(r.problems)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2800);
    return () => clearTimeout(t);
  }, [msg]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    problems.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return ["全部", ...[...s].sort()];
  }, [problems]);

  const pool = useMemo(
    () => poolOf(problems, { diffs, tag, skipSolved }, progress.solved),
    [problems, diffs, tag, skipSolved, progress.solved]
  );

  const byId = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);
  const roundItems = round.map((id) => byId.get(id)).filter((p): p is ProblemMeta => !!p);
  const roundPassed = roundItems.filter((p) => progress.solved[p.id]?.verdict === "AC").length;

  function toggleDiff(d: Difficulty) {
    setDiffs((cur) => {
      if (!cur.includes(d)) return ALL_DIFFS.filter((x) => cur.includes(x) || x === d);
      if (cur.length === 1) return cur; // 至少保留一档
      return cur.filter((x) => x !== d);
    });
  }

  function draw() {
    if (!pool.length) {
      setMsg({ text: "没有符合条件的题目，放宽一下筛选试试", kind: "err" });
      return;
    }
    const { problem, fresh } = pickFromPool(pool, round);
    if (!problem) {
      setMsg({ text: "没有可抽的题目了", kind: "err" });
      return;
    }
    setRound(addToRound(problem.id));
    if (!fresh) setMsg({ text: "本轮已抽完，已开启新一轮", kind: "ok" });
    nav(`/problem/${problem.id}?${filterToQuery({ diffs, tag, skipSolved })}`);
  }

  return (
    <>
      <div className="topbar">
        <span className="title">随机模式</span>
        <span className="crumbs">按条件随机抽题</span>
        <span className="spacer" />
        <span className="stat">本轮已抽 <b>{roundItems.length}</b> 题 · 已通过 {roundPassed}</span>
      </div>

      <div className="page">
        <div className="page-pad">
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="section-head">
              <b>抽题条件</b>
              <span className="spacer" />
              <span className="dim">符合条件 {pool.length} 题</span>
            </div>

            <div className="bank-head" style={{ marginBottom: 10 }}>
              <span className="dim" style={{ width: 46 }}>难度</span>
              {ALL_DIFFS.map((d) => (
                <span key={d} className={"chip click" + (diffs.includes(d) ? " on" : "")} onClick={() => toggleDiff(d)}>
                  {d}
                </span>
              ))}
              <span className="spacer" style={{ flex: 1 }} />
              <span className={"chip click" + (skipSolved ? " on" : "")} onClick={() => setSkipSolved(!skipSolved)}>
                跳过已通过
              </span>
            </div>

            <div className="bank-head">
              <span className="dim" style={{ width: 46 }}>标签</span>
              <select className="select" value={tag} onChange={(e) => setTag(e.target.value)}>
                {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="spacer" style={{ flex: 1 }} />
              <button className="btn ghost" onClick={() => { clearRound(); setRound([]); setMsg({ text: "已重置本轮", kind: "ok" }); }}>
                重置本轮
              </button>
              <button className="btn primary" disabled={!problems.length} onClick={draw}>🎲 抽一题</button>
            </div>
          </div>

          <div className="card">
            <div className="section-head">
              <b>本轮抽到的题目</b>
              <span className="spacer" />
              {roundItems.length > 0 && <span className="dim">按抽题顺序排列，点一下可以回到那道题</span>}
            </div>
            {roundItems.length === 0 ? (
              <div className="empty">还没有抽过题，点上方的「抽一题」开始</div>
            ) : (
              <div className="round-list">
                {roundItems.map((p, i) => {
                  const rec = progress.solved[p.id];
                  const ok = rec?.verdict === "AC";
                  return (
                    <span
                      key={p.id}
                      className={"chip click" + (ok ? " done" : "")}
                      title={`第 ${i + 1} 题 · ${p.difficulty} · ${rec ? rec.verdict : "未提交"}`}
                      onClick={() => nav(`/problem/${p.id}?${filterToQuery({ diffs, tag, skipSolved })}`)}
                    >
                      {ok ? "✓ " : i + 1 + ". "}{p.id.toUpperCase()} {p.title}
                      <span className={`dif dif-${p.difficulty}`} style={{ marginLeft: 6 }}>{p.difficulty}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {msg && <div className={"toast " + msg.kind}>{msg.text}</div>}
    </>
  );
}
