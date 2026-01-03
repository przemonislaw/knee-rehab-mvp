import type { ReactNode } from "react";

export default function Card({ title, right, children }: { title?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="text-base font-semibold">{title}</div>
          <div>{right}</div>
        </div>
      )}
      {children}
    </div>
  );
}
