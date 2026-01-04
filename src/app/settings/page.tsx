"use client";

import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { useAppState } from "@/lib/state";
import type { MediaPref, PlanMode } from "@/lib/types";
import { useState } from "react";

export default function SettingsPage() {
  const { state, setStartDateISO, setMediaPref, setPlanMode, setWeekOverride, resetAll } = useAppState();

  const [start, setStart] = useState(state.startDateISO ?? "");
  const [pref, setPref] = useState<MediaPref>(state.mediaPref);

  const [planMode, setPlanModeLocal] = useState<PlanMode>(state.planMode);
  const [week, setWeekLocal] = useState<number>(state.weekOverride ?? 1);

  const canSave = start === "" || /^\d{4}-\d{2}-\d{2}$/.test(start);

  return (
    <AppShell title="Ustawienia" subtitle="Start date + media (localStorage)">
      <Card title="Data startu">
        <div className="text-sm text-white/70 mb-2">Format: YYYY-MM-DD</div>
        <input
          type="date"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <button
          disabled={!canSave}
          onClick={() => setStartDateISO(start || null)}
          className="mt-3 w-full rounded-xl bg-white py-2 text-sm font-semibold text-black disabled:opacity-40"
        >
          Zapisz datę startu
        </button>
      </Card>

      <Card title="Preferencja mediów">
        <div className="grid grid-cols-3 gap-2">
          {(["image", "video", "both"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPref(p);
                setMediaPref(p);
              }}
              className={`rounded-xl border px-3 py-2 text-sm ${
                pref === p ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
              }`}
            >
              {p === "image" ? "Obrazek" : p === "video" ? "Wideo" : "Oba"}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-white/60">
          Brakujące media pokażemy jako placeholder “dodaj link w exerciseCatalog”.
        </div>
      </Card>

      <Card title="Plan (MVP)">
  <div className="text-xs text-white/60 mb-2">
    Tryb ręczny nie zmienia logiki rehabilitacji – tylko wybiera tydzień planu.
  </div>

  <div className="grid grid-cols-2 gap-2">
    <button
      onClick={() => {
        setPlanModeLocal("auto");
        setPlanMode("auto");
      }}
      className={`rounded-xl border px-3 py-2 text-sm ${
        planMode === "auto" ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
      }`}
    >
      Automatyczny
    </button>

    <button
      onClick={() => {
        setPlanModeLocal("manual");
        setPlanMode("manual");
        // jeśli użytkownik nie miał override, ustawiamy lokalnie 1 (UI), zapis zrobi dopiero zmiana week
        if (!state.weekOverride) setWeekLocal(week);
      }}
      className={`rounded-xl border px-3 py-2 text-sm ${
        planMode === "manual" ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
      }`}
    >
      Ręczny
    </button>
  </div>

  <div className="mt-3">
    <label className="text-xs text-white/70">Aktualny tydzień (1–12)</label>
    <input
      type="number"
      min={1}
      max={12}
      disabled={planMode !== "manual"}
      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-40"
      value={week}
      onChange={(e) => {
        const n = Number(e.target.value);
        const clamped = Number.isFinite(n) ? Math.min(12, Math.max(1, n)) : 1;
        setWeekLocal(clamped);
        setWeekOverride(clamped);
      }}
    />
    <div className="mt-2 text-xs text-white/60">
      Jeśli masz tryb ręczny, „Dzisiaj” pobierze szablon z tego tygodnia.
    </div>
  </div>
</Card>


      <Card title="Reset danych">
        <button
          onClick={() => {
            resetAll();
            alert("Zresetowano localStorage ✅");
          }}
          className="w-full rounded-xl border border-red-500/40 bg-red-500/10 py-2 text-sm font-semibold text-red-200"
        >
          Reset localStorage
        </button>
      </Card>
    </AppShell>
  );
}
