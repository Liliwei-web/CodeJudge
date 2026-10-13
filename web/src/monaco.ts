import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

// 使用本地打包的 monaco，避免依赖 CDN
(self as any).MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

monaco.editor.defineTheme("codejudge-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6a9955", fontStyle: "italic" },
    { token: "keyword", foreground: "c586c0" },
    { token: "string", foreground: "ce9178" },
    { token: "number", foreground: "b5cea8" },
    { token: "type", foreground: "4ec9b0" },
    { token: "function", foreground: "dcdcaa" },
  ],
  colors: {
    "editor.background": "#1c1c1c",
    "editor.foreground": "#d4d4d4",
    "editorLineNumber.foreground": "#6b6b6b",
    "editorLineNumber.activeForeground": "#c6c6c6",
    "editor.selectionBackground": "#2f4a6b",
    "editor.lineHighlightBackground": "#262626",
    "editorCursor.foreground": "#ffa116",
    "editorIndentGuide.background1": "#333333",
    "editorGutter.background": "#1c1c1c",
    "scrollbarSlider.background": "#4a4a4a80",
  },
});

loader.config({ monaco });
export { monaco };
