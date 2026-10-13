import type { ReactNode } from "react";

const SUB: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ", n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
};
const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  n: "ⁿ", i: "ⁱ", "+": "⁺", "-": "⁻",
};

const MACROS: Record<string, string> = {
  le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠",
  times: "×", cdot: "·", div: "÷", pm: "±",
  dots: "…", ldots: "…", cdots: "…",
  lfloor: "⌊", rfloor: "⌋", lceil: "⌈", rceil: "⌉",
  infty: "∞", in: "∈", notin: "∉", to: "→", rightarrow: "→",
  bmod: " mod ", pmod: " mod ", circ: "°", sim: "~", approx: "≈",
  varphi: "φ", alpha: "α", beta: "β", gamma: "γ", delta: "δ", lambda: "λ", mu: "μ", pi: "π", sigma: "σ", theta: "θ",
  log: "log", ln: "ln", sqrt: "√", sum: "Σ", prod: "Π",
  "\\": "\n", ",": " ", ";": " ", " ": " ",
};

/** 把题库里的轻量 LaTeX 转成易读的 Unicode 文本 */
export function texToText(tex: string): string {
  let t = tex;
  t = t.replace(/\\binom\{([^{}]*)\}\{([^{}]*)\}/g, "C($1, $2)");
  t = t.replace(/\\([a-zA-Z]+)/g, (m, name: string) => (name in MACROS ? MACROS[name] : name));
  t = t.replace(/\\[,;!]/g, " ").replace(/\\\\/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  t = t.replace(/_\{?([0-9A-Za-z]{1,3})\}?/g, (_m, g: string) => [...g].map((c) => SUB[c] ?? c).join(""));
  t = t.replace(/\^\{?([0-9A-Za-z+-]{1,3})\}?/g, (_m, g: string) => [...g].map((c) => SUP[c] ?? c).join(""));
  return t;
}

/** 极简 Markdown 渲染：段落、**加粗**、`代码`、$公式$ */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) nodes.push(<strong key={`${keyPrefix}-b${i}`}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("$")) nodes.push(<code key={`${keyPrefix}-m${i}`} className="math">{texToText(tok.slice(1, -1))}</code>);
    else nodes.push(<code key={`${keyPrefix}-c${i}`}>{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Markdown({ text }: { text: string }) {
  const blocks = (text ?? "").split(/\n\s*\n/);
  return (
    <div className="q-body">
      {blocks.map((block, bi) => {
        const b = block.trim();
        if (!b) return null;
        if (b.startsWith("### ") || b.startsWith("## ")) return <h3 key={bi}>{b.replace(/^#+\s*/, "")}</h3>;
        if (b.startsWith("```")) {
          const body = b.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
          return <pre key={bi}>{body}</pre>;
        }
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <span key={li}>
                {inline(l, `${bi}-${li}`)}
                {li < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
