/**
 * CodeJudge 服务入口：静态站点 + 判题 API。
 */
import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import { PORT, WEB_DIST, TMP_ROOT, detectToolchain } from "./config.js";
import { api } from "./routes/api.js";
import { problemCount } from "./problems/store.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", api);

if (fs.existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(WEB_DIST, "index.html")));
} else {
  app.get("/", (req, res) => {
    res
      .status(200)
      .type("html")
      .send("<h1>CodeJudge API 正在运行</h1><p>前端尚未构建。开发模式请访问 Vite 端口（默认 5173），或执行 <code>npm run build</code>。</p>");
  });
}

fs.mkdirSync(TMP_ROOT, { recursive: true });

app.listen(PORT, () => {
  const t = detectToolchain();
  const mark = (v) => (v ? "可用" : "不可用");
  console.log("");
  console.log("  CodeJudge 判题服务已启动");
  console.log(`  地址        : http://localhost:${PORT}`);
  console.log(`  题目数量    : ${problemCount()}`);
  console.log(`  临时目录    : ${TMP_ROOT}`);
  console.log(`  工具链目录  : ${t.toolchainDir || "(未安装，请运行 npm run setup)"}`);
  console.log(`  语言        : Python ${mark(t.python.path)} | C++ ${mark(t.gpp.path)} | C ${mark(t.gcc.path)}`);
  console.log("");
});
