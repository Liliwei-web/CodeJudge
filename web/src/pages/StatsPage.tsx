import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type ProblemMeta } from "../api";
import { clearAll, collectMistakeIds, setAutoTemplate, useProgress } from "../store";

const DIFFS = ["入门", "简单", "中等", "困难"] as const;
const DAILY_DAYS = 14;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 本地日期键（YYYY-MM-DD），用于把提交记录按天聚合 */
function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dayLabel(d: Date) {
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

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

  // 每日刷题：按本地日期聚合提交记录，统计当天做过的题目（去重）、通过题目与提交次数
  const daily = useMemo(() => {
    const byDay = new Map<string, { tried: Set<string>; ac: Set<string>; submissions: number }>();
    for (const e of progress.history) {
      const key = dayKey(e.ts);
      let rec = byDay.get(key);
      if (!rec) {
        rec = { tried: new Set(), ac: new Set(), submissions: 0 };
        byDay.set(key, rec);
      }
      rec.tried.add(e.id);
      rec.submissions++;
      if (e.verdict === "AC") rec.ac.add(e.id);
    }
    const todayKey = dayKey(Date.now());
    const now = new Date();
    const days: { key: string; label: string; today: boolean; tried: number; ac: number; submissions: number }[] = [];
    for (let i = DAILY_DAYS - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = dayKey(d.getTime());
      const rec = byDay.get(key);
      days.push({
        key,
        label: dayLabel(d),
        today: key === todayKey,
        tried: rec?.tried.size ?? 0,
        ac: rec?.ac.size ?? 0,
        submissions: rec?.submissions ?? 0,
      });
    }
    return days;
  }, [progress.history]);

  const todayRow = daily[daily.length - 1];
  const maxDaily = Math.max(1, ...daily.map((d) => d.tried));
  const dailySolved = daily.reduce((sum, d) => sum + d.ac, 0);

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
            <div className="stat-card"><div className="n">{todayRow?.tried ?? 0}</div><div className="l">今日刷题（通过 {todayRow?.ac ?? 0}）</div></div>
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

          <div className="card" style={{ marginBottom: 16 }}>
            <b>每日刷题</b>
            <div className="dim" style={{ marginTop: 4 }}>
              最近 {DAILY_DAYS} 天 · 条形是当天做过的题目数（去重），右侧为通过题数 / 提交次数
            </div>
            <div style={{ marginTop: 10 }}>
              {daily.map((d) => (
                <div className="bar-row" key={d.key}>
                  <span className="nm" style={{ width: 92, color: d.today ? "var(--orange)" : undefined }}>
                    {d.label}{d.today ? " 今日" : ""}
                  </span>
                  <span className="bar"><i style={{ width: `${(d.tried / maxDaily) * 100}%` }} /></span>
                  <span style={{ color: "var(--text-3)", width: 140, textAlign: "right" }}>
                    {d.tried} 题 · 通过 {d.ac} · 提交 {d.submissions}
                  </span>
                </div>
              ))}
            </div>
            <div className="dim" style={{ marginTop: 8 }}>
              近 {DAILY_DAYS} 天共通过 {dailySolved} 题（按本地提交记录统计，最多保留最近 500 条）
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
