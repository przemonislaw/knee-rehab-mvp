import type { CheckIn, KneeStatus } from "./types";

/**
 * Zgodnie z decisionRules.md (MVP):
 * - GREEN: ból ≤2/10 i brak obrzęku i brak uczucia "uciekania"
 * - YELLOW: ból =3/10 LUB obrzęk/niestabilność
 * - RED: ból >3/10
 *
 * Uwaga: "ostry ból w trakcie" jest w regułach, ale check-in w MVP go nie zbiera,
 * więc nie próbujemy go zgadywać.
 */
export function computeStatus(latest: CheckIn | null): KneeStatus {
  if (!latest) return "UNKNOWN";
  if (latest.pain > 3) return "RED";
  if (latest.pain === 3) return "YELLOW";
  if (latest.swelling || latest.instability) return "YELLOW";
  return "GREEN";
}
