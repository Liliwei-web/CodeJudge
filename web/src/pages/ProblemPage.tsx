import Editor, { type OnMount } from "@monaco-editor/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, type JudgeResult, type ProblemDetail, type ProblemMeta } from "../api";
import AnswerDialog from "../components/AnswerDialog";
import Markdown from "../components/Markdown";
import ResultPanel from "../components/ResultPanel";
import { useHealth } from "../App";
import { addToRound, filterFromQuery, filterToQuery, loadRound, pickFromPool, poolOf } from "../random";
import { getDraft, isInMistakes, recordSubmit, setDraft, toggleMistake, useProgress } from "../store";

const LANG_KEY = "codejudge.lang";

export default function ProblemPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const health = useHealth();
  const progress = useProgress();

  const randomMode = params.get("mode") === "random";
  const rf = useMemo(() => filterFromQuery(params), [params]);
  // 模板不再自动填充；用 ref 读取偏好，避免偏好变化时清空编辑器内容
  const autoTemplateRef = useRef(progress.prefs.autoTemplate);
  autoTemplateRef.current = progress.prefs.autoTemplate;

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [list, setList] = useState<ProblemMeta[]>([]);
  const [lang, setLang] = useState<string>(() => localStorage.getItem(LANG_KEY) || "python");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [tab, setTab] = useState<"cases" | "result">("result");
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);
  const [leftPct, setLeftPct] = useState(46);
  const [answerOpen, setAnswerOpen] = useState(params.get("answer") === "1");
  const wrapRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const langs = health?.languages ?? [];
  const current = useMemo(() => langs.find((l) => l.id === lang) ?? langs[0], [langs, lang]);

  useEffect(() => {
    setResult(null);
    setMsg(null);
    api.problem(id).then((r) => setProblem(r.problem)).catch((e) => setMsg({ text: e.message, kind: "err" }));
    setCustomInput("");
  }, [id]);

  useEffect(() => {
    api.problems().then((r) => setList(r.problems)).catch(() => {});
  }, []);

  // 语言或题目变化时载入草稿；没有草稿就是空白编辑器，模板需要手动插入
  useEffect(() => {
    if (!problem || !current) return;
    const draft = getDraft(problem.id, current.id);
    setCode(draft ?? (autoTemplateRef.current ? current.starter : ""));
  }, [problem, current]);

  // 从随机模式进入时，把当前题记入本轮
  useEffect(() => {
    if (randomMode && id) addToRound(id);
  }, [randomMode, id]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  function insertTemplate() {
    if (!problem || !current) return;
    setCode(current.starter);
    setDraft(problem.id, current.id, current.starter);
  }

  // 撤销上一步编辑（走 Monaco 自带的撤销栈）
  function undoEdit() {
    editorRef.current?.trigger("toolbar", "undo", null);
  }

  function clearCode() {
    if (!problem || !current) return;
    setCode("");
    setDraft(problem.id, current.id, "");
  }

  // 随机模式：按同样的条件再抽一题
  function rollNext() {
    const pool = poolOf(list, rf, progress.solved);
    const { problem: nextP, fresh } = pickFromPool(pool, loadRound(), id);
    if (!nextP) {
      setMsg({ text: "没有符合条件的题目了", kind: "err" });
      return;
    }
    addToRound(nextP.id);
    if (!fresh) setMsg({ text: "本轮已抽完，开始新一轮", kind: "ok" });
    nav(`/problem/${nextP.id}?${filterToQuery(rf)}`);
  }

  // 把参考答案填进编辑器（并切到对应语言）
  function fillAnswer(langId: string, source: string) {
    if (!problem) return;
    if (code.trim() && !confirm("把参考答案填入编辑器？当前编辑器里的内容会被覆盖。")) return;
    setDraft(problem.id, langId, source);
    setLang(langId);
    setCode(source);
    setAnswerOpen(false);
    setMsg({ text: "已填入参考答案，建议自己再理解一遍再提交", kind: "ok" });
  }

  const onChange = useCallback(
    (v: string | undefined) => {
      const next = v ?? "";
      setCode(next);
      if (problem) setDraft(problem.id, lang, next);
    },
    [problem, lang]
  );

  async function exec(kind: "run" | "submit") {
    if (!problem || !current) return;
    if (!current.available) {
      setMsg({ text: `${current.name} 编译器不可用，请先运行 npm run setup`, kind: "err" });
      return;
    }
    setRunning(true);
    setTab("result");
    setResult(null);
    try {
      const body: any = { problemId: problem.id, language: current.id, source: code };
      let res;
      if (kind === "run") {
        if (customInput.trim()) body.input = customInput.endsWith("\n") ? customInput : customInput + "\n";
        res = await api.run(body);
      } else {
        res = await api.submit(body);
      }
      setResult(res.result);
      if (kind === "submit") {
        recordSubmit({
          id: problem.id,
          verdict: res.result.verdict,
          score: res.result.score,
          language: current.id,
          passed: res.result.passed,
          total: res.result.total,
          maxTimeMs: res.result.maxTimeMs,
          code,
        });
        setMsg(
          res.result.verdict === "AC"
            ? { text: `通过！得分 ${res.result.score}，获得 ${problem.points} 经验`, kind: "ok" }
            : { text: `未通过：${res.result.passed}/${res.result.total} 个测试点`, kind: "err" }
        );
      }
    } catch (e: any) {
      setMsg({ text: e.message, kind: "err" });
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3200);
    return () => clearTimeout(t);
  }, [msg]);

  // 拖拽分栏
  useEffect(() => {
    function move(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el || !dragging.current) return;
      const rect = el.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(75, Math.max(22, pct)));
    }
    function up() {
      dragging.current = false;
      document.body.style.cursor = "";
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);
  const dragging = useRef(false);

  const idx = list.findIndex((p) => p.id === id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const solved = progress.solved[id]?.verdict === "AC";
  const starred = problem ? isInMistakes(problem.id) : false;

  return (
    <>
      <div className="topbar">
        <span className="crumbs" style={{ cursor: "pointer" }} onClick={() => nav("/problems")}>题库</span>
        <span className="crumbs">/</span>
        <span className="title">{id.toUpperCase()}</span>
        <span className="spacer" />
        {randomMode ? (
          <>
            <span className="chip">🎲 随机模式</span>
            <button className="btn ghost" onClick={rollNext}>换一题</button>
          </>
        ) : (
          <>
            <button className="btn ghost" disabled={!prev} onClick={() => prev && nav(`/problem/${prev.id}`)}>上一题</button>
            <button className="btn ghost" disabled={!next} onClick={() => next && nav(`/problem/${next.id}`)}>下一题</button>
          </>
        )}
        <span className="spacer" />
        <button className="btn ghost" onClick={() => setAnswerOpen(true)}>查看答案</button>
        <button className="btn ghost" onClick={() => problem && toggleMistake(problem.id)}>
          {starred ? "★ 已在错题本" : "☆ 加入错题本"}
        </button>
        {solved && <span className="badge ac">已通过</span>}
      </div>

      <div className="solve" ref={wrapRef}>
        <div className="left" style={{ flexBasis: `${leftPct}%` }}>
          {!problem ? (
            <div className="empty">加载中…</div>
          ) : (
            <>
              <h1 className="q-title">{problem.title}</h1>
              <div className="q-meta">
                <span className={`dif dif-${problem.difficulty}`}>{problem.difficulty}</span>
                <span className="chip">{problem.topic}</span>
                {problem.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                <span className="chip">分值 {problem.points}</span>
                <span className="chip">时限 {problem.timeLimitMs} ms</span>
              </div>

              <Markdown text={problem.description} />

              <div className="q-section">
                <h3>输入格式</h3>
                <Markdown text={problem.inputFormat} />
              </div>
              <div className="q-section">
                <h3>输出格式</h3>
                <Markdown text={problem.outputFormat} />
              </div>

              <div className="q-section">
                <h3>输入输出示例</h3>
                {problem.samples.map((s, i) => (
                  <div className="sample" key={i}>
                    <div className="lbl">示例 {i + 1} · 输入</div>
                    <pre>{s.input}</pre>
                    <div className="lbl">输出</div>
                    <pre>{s.output}</pre>
                    {s.explanation && <div className="lbl">说明：{s.explanation}</div>}
                  </div>
                ))}
              </div>

              {problem.hint && (
                <div className="q-section">
                  <h3>提示</h3>
                  <Markdown text={problem.hint} />
                </div>
              )}
            </>
          )}
        </div>

        <div
          className="splitter"
          onMouseDown={() => {
            dragging.current = true;
            document.body.style.cursor = "col-resize";
          }}
        />

        <div className="right">
          <div className="editor-bar">
            <span style={{ color: "var(--text-3)" }}>{"</>"} 代码</span>
            <select className="select" value={current?.id ?? ""} onChange={(e) => setLang(e.target.value)}>
              {langs.map((l) => (
                <option key={l.id} value={l.id} disabled={!l.available}>
                  {l.name}{l.available ? "" : "（未安装）"}
                </option>
              ))}
            </select>
            {current && !current.available && <span style={{ color: "var(--red)", fontSize: 12 }}>该语言不可用</span>}
            <span className="spacer" />
            <button className="btn ghost" onClick={insertTemplate} title="把当前语言的代码模板写进编辑器（默认是空板）">插入模板</button>
            <button className="btn ghost" onClick={undoEdit} title="撤销上一步编辑（等同于 Ctrl+Z）">撤销</button>
            <button className="btn ghost" disabled={!code} onClick={clearCode}>清空</button>
            <button className="btn" disabled={running} onClick={() => exec("run")}>运行</button>
            <button className="btn primary" disabled={running} onClick={() => exec("submit")}>{running ? "评测中…" : "提交"}</button>
          </div>

          <div className="editor-wrap">
            <Editor
              language={current?.monaco ?? "plaintext"}
              theme="codejudge-dark"
              value={code}
              onChange={onChange}
              onMount={(ed) => { editorRef.current = ed; }}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                automaticLayout: true,
                fontFamily: '"JetBrains Mono", "Cascadia Mono", Consolas, monospace',
                padding: { top: 12 },
                renderLineHighlight: "line",
              }}
            />
          </div>

          <div className={"console" + (result ? " grow" : "")}>
            <div className="console-tabs">
              <span className={"console-tab" + (tab === "cases" ? " on" : "")} onClick={() => setTab("cases")}>自定义测试</span>
              <span className={"console-tab" + (tab === "result" ? " on" : "")} onClick={() => setTab("result")}>测试结果</span>
              <span className="spacer" style={{ flex: 1 }} />
              <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                {health ? `Python ${health.languages.find((l) => l.id === "python")?.available ? "✓" : "✗"} · C++ ${health.languages.find((l) => l.id === "cpp")?.available ? "✓" : "✗"} · C ${health.languages.find((l) => l.id === "c")?.available ? "✓" : "✗"}` : ""}
              </span>
            </div>
            <div className="console-body">
              {tab === "cases" ? (
                <div>
                  <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 6 }}>自定义输入（留空则运行题目自带的样例）</div>
                  <textarea className="io" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="在这里输入测试数据…" />
                  <div style={{ marginTop: 10 }}>
                    <button className="btn" disabled={running} onClick={() => exec("run")}>▶ 运行</button>
                  </div>
                </div>
              ) : (
                <ResultPanel result={result} running={running} />
              )}
            </div>
          </div>
        </div>
      </div>

      {msg && <div className={"toast " + msg.kind}>{msg.text}</div>}

      {answerOpen && problem && (
        <AnswerDialog
          problemId={problem.id}
          title={`${problem.id.toUpperCase()} ${problem.title}`}
          initialLang={lang}
          onClose={() => setAnswerOpen(false)}
          onFill={fillAnswer}
        />
      )}
    </>
  );
}
