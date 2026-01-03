"use client";

import Link from "next/link";
import Card from "./Card";
import type { ExerciseProgress } from "@/lib/types";

export default function ExerciseRow({
  id,
  name,
  progress,
  onChange
}: {
  id: string;
  name: string;
  progress: ExerciseProgress | null;
  onChange: (patch: Partial<ExerciseProgress>) => void;
}) {
  const done = progress?.done ?? false;

  return (
    <Card
      title={
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => onChange({ done: e.target.checked })}
            className="mt-1 h-5 w-5 accent-white"
          />
          <div className="min-w-0">
            <div className="text-sm font-medium leading-5">{name}</div>
            <Link href={`/exercise/${id}`} className="text-xs text-white/60 no-underline">
              Szczegóły →
            </Link>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-white/70">
          Serie
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
            value={progress?.sets ?? ""}
            onChange={(e) => onChange({ sets: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </label>
        <label className="text-xs text-white/70">
          Powtórzenia
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
            value={progress?.reps ?? ""}
            onChange={(e) => onChange({ reps: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </label>

        <label className="text-xs text-white/70">
          Czas (s)
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
            value={progress?.durationSeconds ?? ""}
            onChange={(e) => onChange({ durationSeconds: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </label>

        <label className="text-xs text-white/70">
          Obciążenie (opis)
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
            value={progress?.load ?? ""}
            onChange={(e) => onChange({ load: e.target.value === "" ? null : e.target.value })}
          />
        </label>
      </div>

      <label className="mt-2 block text-xs text-white/70">
        Notatka
        <textarea
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
          rows={2}
          value={progress?.note ?? ""}
          onChange={(e) => onChange({ note: e.target.value === "" ? null : e.target.value })}
        />
      </label>
    </Card>
  );
}
