import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { api, type SolutionEntry } from "../api";
import { beautifyC } from "../format";

const MONACO: Record<string, string> = { python: "python", cpp: "cpp", c: "c" };

export default function AnswerDialog({
  problemId,
  title,
  initialLang,
  onClose,
  onFill,
}: {
  problemId: string;
  title: string;
  initialLang?: string;
  onClose: () => void;
  onFill: (langId: string, source: string) => void;
}) {
  const [list, setList] = useState<SolutionEntry[] | null>(null);
  const [langId, setLangId] = useState(initialLang || "python");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  // 拖动位置：初始为 null 走 CSS 居中，拖动后改成 fixed 定位。
  // 弹窗关闭即卸载，下次打开重新挂载，位置自动回到居中。
  const modalRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let alive = true;
    setList(null);
    setErr("");
    api
      .solution(problemId)
      .then((r) => alive && setList(r.solutions))
      .catch((e) => alive && setErr(e.message));
    return () => {
      alive = false;
    };
  }, [problemId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const current = useMemo(() => (list && (list.find((s) => s.id === langId) ?? list[0])) || null, [list, langId]);
  const source = current?.code ?? "";
  const display = current && current.id !== "python" ? beautifyC(source) : source;

  function onDragStart(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button, .chip")) return;
    const el = modalRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    dragRef.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    setPos({ x: r.left, y: r.top });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 合成事件或指针已失效 */ }
  }

  function onDragMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    const el = modalRef.current;
    if (!d || !el) return;
    const maxX = Math.max(0, window.innerWidth - el.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - el.offsetHeight);
    setPos({
      x: Math.min(maxX, Math.max(0, e.clientX - d.dx)),
      y: Math.min(maxY, Math.max(0, e.clientY - d.dy)),
    });
  }

  function onDragEnd(e: ReactPointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* 指针已释放 */ }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setErr("复制失败，请手动选中复制");
    }
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="modal"
        ref={modalRef}
        style={pos ? { position: "fixed", left: pos.x, top: pos.y, margin: 0 } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-head"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <span className="title">参考答案 · {title}</span>
          <span className="spacer" />
          {(list ?? []).length > 1 &&
            (list ?? []).map((s) => (
              <span key={s.id} className={"chip click" + (current?.id === s.id ? " on" : "")} onClick={() => setLangId(s.id)}>
                {s.name}
              </span>
            ))}
          <button className="btn ghost mini" onClick={onClose}>关闭 ✕</button>
        </div>

        <div className="modal-body">
          {err && <div className="err-box">{err}</div>}
          {!list ? (
            <div className="empty">加载中…</div>
          ) : !current ? (
            <div className="empty">这道题没有参考代码</div>
          ) : (
            <>
              <div className="modal-hint">
                建议先自己想一想再看；想直接验证的话，点右下角「填入编辑器」把它填进代码区再提交。
              </div>
              <div className="modal-code">
                <Editor
                  language={MONACO[current.id] ?? "plaintext"}
                  theme="codejudge-dark"
                  value={display}
                  options={{
                    readOnly: true,
                    domReadOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    automaticLayout: true,
                    fontFamily: '"JetBrains Mono", "Cascadia Mono", Consolas, monospace',
                    renderLineHighlight: "none",
                    padding: { top: 10 },
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-foot">
          <span className="dim">参考代码仅用于对照学习，判题不会自动使用</span>
          <span className="spacer" />
          <button className="btn ghost" disabled={!current} onClick={copy}>{copied ? "✓ 已复制" : "复制代码"}</button>
          <button className="btn primary" disabled={!current} onClick={() => current && onFill(current.id, display)}>填入编辑器</button>
        </div>
      </div>
    </div>
  );
}
