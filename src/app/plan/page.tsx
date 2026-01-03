import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { getPlan } from "@/lib/plan";

export default function PlanPage() {
  const plan = getPlan();

  return (
    <AppShell title="Plan" subtitle="Fazy i szablony sesji (rehabPlan.json)">
      {plan.phases.map((p) => (
        <Card key={p.id} title={`${p.name_pl} (tyg. ${p.weeks.join(", ")})`}>
          {p.goals_pl?.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
              {p.goals_pl.map((g) => <li key={g}>{g}</li>)}
            </ul>
          ) : null}
          {p.load_pl && <div className="mt-2 text-xs text-white/60">{p.load_pl}</div>}
          {p.session_templates?.length ? (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-white/60">Szablony sesji:</div>
              {p.session_templates.map((t) => (
                <div key={t.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-medium">{t.name_pl}</div>
                  {t.notes_pl && <div className="mt-1 text-xs text-white/60">{t.notes_pl}</div>}
                  <div className="mt-1 text-xs text-white/50">Ćwiczeń: {t.includes.length}</div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      ))}
    </AppShell>
  );
}
