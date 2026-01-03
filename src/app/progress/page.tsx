"use client";

import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { computeStatus } from "@/lib/status";
import { useAppState } from "@/lib/state";

export default function ProgressPage() {
  const { state } = useAppState();

  const days = Object.keys(state.checkInsByDate)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 30);

  return (
    <AppShell title="Progress" subtitle="Historia check-in (localStorage)">
      <Card title="Check-in (ostatnie dni)">
        {days.length === 0 ? (
          <div className="text-sm text-white/70">Brak check-in.</div>
        ) : (
          <div className="space-y-2">
            {days.map((d) => {
              const arr = state.checkInsByDate[d] ?? [];
              const last = arr[arr.length - 1] ?? null;
              const status = computeStatus(last);

              return (
                <div key={d} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{d}</div>
                    <StatusBadge status={status} />
                  </div>
                  {last && (
                    <div className="mt-2 text-xs text-white/70">
                      ból {last.pain}/10 · sztywność {last.stiffness}/10 · obrzęk {last.swelling ? "tak" : "nie"} · niestabilność {last.instability ? "tak" : "nie"}
                    </div>
                  )}
                  {last?.comment && <div className="mt-2 text-xs text-white/60">{last.comment}</div>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
