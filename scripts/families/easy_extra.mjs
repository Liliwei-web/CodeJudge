/**
 * 简单扩展题库：数组条件统计（进阶）/ 字符串字符处理。
 */
import { arrCondRows } from "../lib/arrcond.mjs";
import { strCondRows, SPREDS } from "../lib/strcond.mjs";
import { ARR_PREDS } from "../lib/preds.mjs";
import { tasks } from "../lib/tasks.mjs";

const IFA = "第一行一个整数 $n$（$1 \\le n \\le 200$）；第二行 $n$ 个整数 $a_i$，用空格隔开。";
const IFS = "一行，一个只由英文字母或数字组成的字符串 $s$（$1 \\le |s| \\le 200$）。";

const A = arrCondRows({
  prefix: "exa",
  preds: ARR_PREDS.slice(0, 14),
  reds: ["alle", "kinds", "consec"],
  cfgBase: { nMin: 6, nMax: 16 },
  topic: "数组与统计",
  tags: ["数组", "统计"],
  inputFormat: IFA,
});

const S = strCondRows({
  prefix: "exs",
  preds: SPREDS,
  reds: ["last", "keep", "alle"],
  topic: "字符串处理",
  tags: ["字符串"],
  inputFormat: IFS,
});

export const easy_extraFamilies = tasks("简单", [...A, ...S].slice(0, 82));
