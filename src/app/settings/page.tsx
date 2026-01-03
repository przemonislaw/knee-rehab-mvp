"use client";

import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { useAppState } from "@/lib/state";
import type { MediaPref } from "@/lib/types";
import { useState } from "react";

export default function SettingsPage() {
  const { state, setStartDateISO, setMediaPref, resetAll } = useAppState();

  const [start, setStart] = useState(state.startDateISO ?? "");
  const [pref, setPref] = useState<MediaPref>(state.mediaPref);

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
