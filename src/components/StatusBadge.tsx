import type { KneeStatus } from "@/lib/types";

const cfg: Record<KneeStatus, { label: string; cls: string }> = {
  GREEN: { label: "GREEN", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" },
  YELLOW: { label: "YELLOW", cls: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30" },
  RED: { label: "RED", cls: "bg-red-500/15 text-red-200 border-red-500/30" },
  UNKNOWN: { label: "—", cls: "bg-white/10 text-white/70 border-white/15" }
};

export default function StatusBadge({ status }: { status: KneeStatus }) {
  const s = cfg[status];
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${s.cls}`}>{s.label}</span>;
}
