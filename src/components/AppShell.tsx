"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import { useAppState } from "@/lib/state";

function SyncDot({ status }: { status: "saved" | "saving" | "error" }) {
  const icon = status === "saved" ? "✅" : status === "saving" ? "🟡" : "🔴";
  const label = status === "saved" ? "Zapisane" : status === "saving" ? "Zapisuję…" : "Błąd zapisu";
  return (
    <div className="flex items-center gap-1 text-xs text-white/70" aria-label={label} title={label}>
      <span aria-hidden>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

export default function AppShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { syncStatus, lastSyncError, clearLastSyncError } = useAppState();

  const showSyncErrorBanner = Boolean(lastSyncError) && pathname === "/today";

  return (
    <div className="min-h-screen pb-20">
      <header className="mx-auto max-w-[720px] px-4 pb-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
          </div>
          <SyncDot status={syncStatus} />
        </div>

        {showSyncErrorBanner && (
          <div className="mt-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">Nie udało się zapisać.</div>
                <div className="mt-1 break-words text-xs text-red-100/80">{lastSyncError}</div>
                <div className="mt-2 text-xs text-red-100/70">
                  Jeśli problem się powtarza, spróbuj ponownie za chwilę albo sprawdź połączenie.
                </div>
              </div>
              <button
                onClick={clearLastSyncError}
                className="shrink-0 rounded-xl border border-red-500/40 bg-white/5 px-2 py-1 text-xs"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[720px] space-y-3 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
