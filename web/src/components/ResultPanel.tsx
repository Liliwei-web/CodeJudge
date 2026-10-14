import { useEffect, useState } from "react";
import type { JudgeResult } from "../api";
import { VERDICT_TEXT } from "../api";

export default function ResultPanel({ result, running }: { result: JudgeResult | null; running: boolean }) {
  // 折叠状态只属于当前这次评测；换一次结果就全部收起
  const [open, setOpen] = useState<Record<number, boolean>>({});
  useEffect(() => {
    setOpen({});
  }, [result]);

  if (running) return <div className="empty">评测中…</div>;
  if (!result) return <div className="empty">点击「运行」用样例自测，或点击「提交」进行完整评测</div>;

  if (!result.compile.ok) {
    return (
      <div>
        <div className="verdict CE">✗ {VERDICT_TEXT.CE}</div>
        <pre style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginTop: 10, whiteSpace: "pre-wrap", fontSize: 12.5, color: "#ff9b9b" }}>
          {result.compile.output || "编译器没有给出详细信息"}
        </pre>
      </div>
    );
  }

  // 自定义输入没有命中样例时不存在期望输出，无从判断对错
  const judged = result.cases.some((c) => c.compared);
  const fails = result.cases.filter((c) => c.verdict !== "AC");
  // 只有拿到该测试点数据的错题才能展开（隐藏测试点在「做错」时才会回传数据）
  const canExpandFail = fails.some((c) => c.input !== null);

  return (
    <div>
      <div className={"verdict" + (judged ? " " + result.verdict : "")}>
        {judged && (result.verdict === "AC" ? "✓ " : "✗ ")}
        {judged ? VERDICT_TEXT[result.verdict] : "运行完成（自定义输入，无期望输出可比对）"}
        <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 13 }}>
          {judged
            ? `通过 ${result.passed}/${result.total} · 得分 ${result.score} · 最慢 ${result.maxTimeMs} ms`
            : `最慢 ${result.maxTimeMs} ms`}
        </span>
      </div>

      {fails.length > 0 && (
        <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 6 }}>
          {canExpandFail
            ? "出错的测试点可以展开查看该点的输入、期望输出和你的输出；正确的测试点不展示数据。"
            : "隐藏测试点只显示判定结果，不显示具体数据。"}
        </div>
      )}

      <div style={{ marginTop: 6 }}>
        {result.cases.map((c) => {
          const bad = c.verdict !== "AC";
          const canExpand = bad && c.input !== null;
          const expanded = !!open[c.index];
          return (
            <div className={"case" + (bad ? " bad" : "")} key={c.index}>
              <div className="head">
                <span className="v" style={{ color: c.compared ? (bad ? "var(--red)" : "var(--green)") : "var(--text-3)" }}>
                  {c.compared ? (bad ? "✗" : "✓") : "•"} {c.compared ? VERDICT_TEXT[c.verdict] : "已运行（未比对）"}
                </span>
                <span style={{ color: "var(--text-3)" }}>{c.name}</span>
                <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 12 }}>{c.timeMs} ms</span>
              </div>

              {canExpand && (
                <>
                  <button className="case-toggle" onClick={() => setOpen((o) => ({ ...o, [c.index]: !o[c.index] }))}>
                    <span className="arrow">{expanded ? "▼" : "▶"}</span>
                    {expanded ? "收起该测试点数据" : "展开该测试点数据（输入 / 期望输出 / 你的输出）"}
                  </button>

                  {expanded && (
                    <div className="kv">
                      <div className="k">输入</div>
                      <pre>{c.input || "(空)"}</pre>
                      {c.expected !== null && (
                        <>
                          <div className="k" style={{ marginTop: 6 }}>期望输出</div>
                          <pre>{c.expected || "(空)"}</pre>
                        </>
                      )}
                      <div className="k" style={{ marginTop: 6 }}>你的输出</div>
                      <pre>{c.actual || "(空)"}</pre>
                      {c.stderr && (
                        <>
                          <div className="k" style={{ marginTop: 6 }}>标准错误</div>
                          <pre style={{ color: "#ff9b9b" }}>{c.stderr}</pre>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
