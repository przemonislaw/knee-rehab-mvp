export function dateISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function diffDays(a: Date, b: Date): number {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.floor((bb - aa) / (1000 * 60 * 60 * 24));
}

export function weekNumberFromStart(startISO: string, today = new Date()): number {
  const start = parseISODate(startISO);
  const days = diffDays(start, today);
  if (days < 0) return 1;
  return Math.floor(days / 7) + 1;
}

export function getStartDateISO(): string | null {
  const v = process.env.NEXT_PUBLIC_START_DATE;
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

export function getMediaPref(): "image" | "video" | "both" {
  const v = process.env.NEXT_PUBLIC_MEDIA_PREF;
  if (v === "image" || v === "video" || v === "both") return v;
  return "both";
}
