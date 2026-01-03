"use client";

import { useState } from "react";
import Card from "./Card";

export default function CheckInForm({
  onSubmit
}: {
  onSubmit: (v: {
    pain: number;
    swelling: boolean;
    instability: boolean;
    stiffness: number;
    comment?: string;
  }) => void;
}) {
  const [pain, setPain] = useState(0);
  const [swelling, setSwelling] = useState(false);
  const [instability, setInstability] = useState(false);
  const [stiffness, setStiffness] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <Card title="Check-in po sesji">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-white/70">
          Ból (0–10)
          <input
            type="number"
            min={0}
            max={10}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
            value={pain}
            onChange={(e) => setPain(Number(e.target.value))}
          />
        </label>

        <label className="text-xs text-white/70">
          Sztywność (0–10)
          <input
            type="number"
            min={0}
            max={10}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
            value={stiffness}
            onChange={(e) => setStiffness(Number(e.target.value))}
          />
        </label>

        <label className="mt-2 flex items-center gap-2 text-xs text-white/80">
          <input
            type="checkbox"
            checked={swelling}
            onChange={(e) => setSwelling(e.target.checked)}
            className="h-5 w-5 accent-white"
          />
          Obrzęk (tak/nie)
        </label>

        <label className="mt-2 flex items-center gap-2 text-xs text-white/80">
          <input
            type="checkbox"
            checked={instability}
            onChange={(e) => setInstability(e.target.checked)}
            className="h-5 w-5 accent-white"
          />
          Niestabilność (tak/nie)
        </label>
      </div>

      <label className="mt-3 block text-xs text-white/70">
        Komentarz
        <textarea
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>

      <button
        onClick={() =>
          onSubmit({
            pain,
            swelling,
            instability,
            stiffness,
            comment: comment.trim() ? comment.trim() : undefined
          })
        }
        className="mt-3 w-full rounded-xl bg-white py-2 text-sm font-semibold text-black"
      >
        Zapisz check-in
      </button>
    </Card>
  );
}
