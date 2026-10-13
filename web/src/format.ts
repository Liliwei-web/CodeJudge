/**
 * 题库里的 C/C++ 参考代码是按「少行紧凑」风格生成的，直接展示几乎没法读。
 * 这里只做重排版：在字符串/字符常量之外、括号之外的 `;`、`{`、`}` 处断行，并按花括号缩进。
 * 不增删任何非空白字符，因此语义不变（仅用于展示与一键填入）。
 * 注意：`= {1,2}` / `f({..})` 这类初始化列表保持在同一行，避免被拆得七零八落。
 */

const INLINE_OPENERS = new Set(["=", ",", "[", "(", "{"]);

export function beautifyC(code: string): string {
  const lines: string[] = [];
  let depth = 0;
  let paren = 0; // for/while 头部里的分号不能断行
  let line = "";
  let quote: string | null = null;
  const braces: boolean[] = []; // 每个 { 是否为「初始化列表」（不换行、不缩进）

  const flush = () => {
    const text = line.trim();
    if (text) lines.push("    ".repeat(Math.max(0, depth)) + text);
    line = "";
  };
  const lastSignificant = () => {
    const t = line.trimEnd();
    return t ? t[t.length - 1] : "";
  };

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    if (quote) {
      line += ch;
      if (ch === "\\") {
        if (i + 1 < code.length) line += code[++i];
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      line += ch;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (braces[braces.length - 1] === true) { line += " "; continue; }
      flush();
      continue;
    }
    if (ch === "(") {
      paren++;
      line += ch;
      continue;
    }
    if (ch === ")") {
      paren = Math.max(0, paren - 1);
      line += ch;
      continue;
    }
    if (ch === ";") {
      line += ch;
      if (paren === 0 && braces[braces.length - 1] !== true) flush();
      continue;
    }
    if (ch === "{") {
      const inline = braces[braces.length - 1] === true || INLINE_OPENERS.has(lastSignificant());
      line += ch;
      braces.push(inline);
      if (!inline) {
        flush();
        depth++;
      }
      continue;
    }
    if (ch === "}") {
      const inline = braces.pop() === true;
      if (inline) {
        line += "}";
        continue;
      }
      flush();
      depth = Math.max(0, depth - 1);
      const m = /^(\s*)else\b/.exec(code.slice(i + 1));
      if (m) {
        i += m[0].length;
        line = "} else";
        continue;
      }
      line = "}";
      flush();
      continue;
    }
    line += ch;
  }
  flush();
  return lines.join("\n");
}
