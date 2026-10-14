/**
 * 入门扩展题库：数组条件统计 / 字符串字符统计（基础循环与判断训练）。
 * 每个题型只出现一次，标题与既有题目互不重复。
 */
import { arrCondRows } from "../lib/arrcond.mjs";
import { strCondRows, SPREDS } from "../lib/strcond.mjs";
import { ARR_PREDS } from "../lib/preds.mjs";
import { tasks } from "../lib/tasks.mjs";

const IFA = "第一行一个整数 $n$（$1 \\le n \\le 100$）；第二行 $n$ 个整数 $a_i$，用空格隔开。";
const IFS = "一行，一个只由英文字母或数字组成的字符串 $s$（$1 \\le |s| \\le 100$）。";

const A = arrCondRows({
  prefix: "ixa",
  preds: ARR_PREDS.slice(0, 14),
  reds: ["first", "last", "exists"],
  cfgBase: { nMin: 6, nMax: 14 },
  topic: "循环与数组",
  tags: ["数组", "条件判断"],
  inputFormat: IFA,
});

const S = strCondRows({
  prefix: "ixs",
  preds: SPREDS,
  reds: ["count", "first", "exists"],
  topic: "字符串基础",
  tags: ["字符串", "循环"],
  inputFormat: IFS,
});

export const intro_extraFamilies = tasks("入门", [...A, ...S].slice(0, 82));
