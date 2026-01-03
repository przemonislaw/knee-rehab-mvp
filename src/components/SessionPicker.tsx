"use client";

import Card from "./Card";

export default function SessionPicker({
  templates,
  selectedId,
  onPick
}: {
  templates: { id: string; name_pl: string; notes_pl?: string }[];
  selectedId: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <Card title="Wybierz sesję na dziś">
      <div className="space-y-2">
        {templates.length === 0 && <div className="text-sm text-white/70">Brak szablonów sesji w tej fazie.</div>}
        {templates.map((t) => {
          const active = selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left ${
                active ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="text-sm font-medium">{t.name_pl}</div>
              {t.notes_pl && <div className="mt-1 text-xs text-white/60">{t.notes_pl}</div>}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
