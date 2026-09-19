import { interpolateRdYlGn } from "d3-scale-chromatic";

/** Map a 0-100 composite score to a color on a red -> yellow -> green ramp. */
export function scoreColor(score: number): string {
  const t = Math.max(0, Math.min(100, score)) / 100;
  return interpolateRdYlGn(t);
}
