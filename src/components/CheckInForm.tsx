"use client";

import { useEffect, useState } from "react";
import Card from "./Card";

type CheckInInput = {
  pain: number;
  swelling: boolean;
  instability: boolean;
  stiffness: number;
  comment?: string;
};

export default function CheckInForm({
  onSubmit
}: {
  onSubmit: (v: CheckInInput) => void | Promise<void>;
}) {
  const [pain, setPain] = useState(0);
  const [swelling, setSwelling] = useState(false);
  const [instability, setInstability] = useState(false);
  const [stiffness, setStiffness] = useState(0);
  const [comment, setComment] = useState("");

  const [saveState, setSaveState] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (saveState !== "saved") return;
    const t = setTimeout(() => setSaveState("idle"), 1500);
    return () => clearTimeout(t);
  }, [saveState]);

  async function handleSubmit() {
    setSaveState("pending");
    setSaveError(null);

    const payload: CheckInInput = {
      pain,
      swelling,
      instability,
      stiffness,
      comment: comment.trim() ? comment.trim() : undefined
    };

    try {
      await Promise.resolve(onSubmit(payload));
      setSaveState("saved");
    } catch (e: any) {
      setSaveState("error");
      setSaveError(e?.message ?? "Nie udało się zapisać");
    }
  }

  const buttonLabel =
    saveState === "pending" ? "Zapisuję…" : saveState === "saved" ? "Zapisane ✅" : "Zapisz check-in";

  return (
    <Card title="Check-in po sesji">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-white/80">
          Ból (0–10)
          <input
            type="number"
            min={0}
            max={10}
            value={pain}
            onChange={(e) => setPain(parseInt(e.target.value || "0", 10))}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm text-white/80">
          Sztywność (0–10)
          <input
            type="number"
            min={0}
            max={10}
            value={stiffness}
            onChange={(e) => setStiffness(parseInt(e.target.value || "0", 10))}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={swelling}
            onChange={(e) => setSwelling(e.target.checked)}
            className="h-4 w-4"
          />
          Obrzęk (tak/nie)
        </label>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={instability}
            onChange={(e) => setInstability(e.target.checked)}
            className="h-4 w-4"
          />
          Uczucie „uciekania” (tak/nie)
        </label>
      </div>

      <label className="mt-3 block text-sm text-white/80">
        Komentarz
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          rows={3}
        />
      </label>

      <button
        onClick={handleSubmit}
        disabled={saveState === "pending"}
        className="mt-3 w-full rounded-xl bg-white py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {buttonLabel}
      </button>

      {saveState === "pending" && <div className="mt-2 text-xs text-white/60">Zapisuję check-in…</div>}
      {saveState === "error" && (
        <div className="mt-2 text-xs text-red-200">Błąd: {saveError ?? "Nie udało się zapisać"}</div>
      )}
    </Card>
  );
}
