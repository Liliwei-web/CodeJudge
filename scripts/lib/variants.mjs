/**
 * 题面变体分级：同一道题型按「数据规模 / 取值范围」展开成多道题。
 * 用于把精编题型扩成大规模题库，同时保证每题都有真实可判分的测试数据。
 */

const ROMAN = ["", " II", " III", " IV", " V", " VI", " VII", " VIII", " IX", " X"];

/** 8 档规模系数 */
export const TIERS = [1, 2, 3, 5, 8, 12, 16, 20];

/**
 * 按系数放大配置；nMax / mMax 最多放大 nCap 倍，避免静态数组与复杂度失控。
 */
export function scaleCfg(base, k, nCap = 20) {
  const out = { ...base };
  if (base.nMax != null) out.nMax = Math.min(Math.round(base.nMax * nCap), Math.round(base.nMax * k));
  if (base.nMin != null) out.nMin = Math.max(1, Math.min(out.nMax ?? Number.MAX_SAFE_INTEGER, Math.round(base.nMin * k)));
  if (base.hi != null) out.hi = Math.round(base.hi * k);
  if (base.lo != null && base.lo !== 0) out.lo = base.lo > 0 ? Math.round(base.lo * k) : -Math.round(-base.lo * k);
  if (base.kMax != null) out.kMax = Math.max(1, Math.round(base.kMax * k));
  if (base.tMax != null) out.tMax = Math.max(1, Math.round(base.tMax * k));
  if (base.mMax != null) out.mMax = Math.min(Math.round(base.mMax * nCap), Math.round(base.mMax * k));
  if (base.wMax != null) out.wMax = Math.round(base.wMax * k);
  return out;
}

/** 8 档放大型变体 */
export const V8 = TIERS.map((k, i) => ({ suffix: ROMAN[i], cfgFn: (b) => scaleCfg(b, k) }));

/** 固定规模、仅数据不同的变体（用于规模敏感 / NP 类题目） */
export const V4S = ROMAN.slice(0, 4).map((s) => ({ suffix: s }));
export const V8S = ROMAN.slice(0, 8).map((s) => ({ suffix: s }));
