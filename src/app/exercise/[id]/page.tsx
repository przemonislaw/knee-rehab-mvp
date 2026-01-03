import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { getExerciseById } from "@/lib/plan";
import PrefsClient from "./prefsClient";

export default function ExercisePage({ params }: { params: { id: string } }) {
  const ex = getExerciseById(params.id);

  if (!ex) {
    return (
      <AppShell title="Ćwiczenie" subtitle="Nie znaleziono">
        <Card title="Błąd">Nie znaleziono ćwiczenia: {params.id}</Card>
      </AppShell>
    );
  }

  return (
    <AppShell title={ex.name_pl} subtitle={`ID: ${ex.id}`}>
      <Card title="Instrukcja">
        <div className="whitespace-pre-wrap text-sm text-white/80">{ex.how_pl ?? "—"}</div>
        {ex.equipment?.length ? (
          <div className="mt-3 text-xs text-white/60">Sprzęt: {ex.equipment.join(", ")}</div>
        ) : null}
        {ex.safety_pl ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            {ex.safety_pl}
          </div>
        ) : null}
      </Card>

      <PrefsClient ex={ex} />

      {ex.parameters ? (
        <Card title="Parametry (z katalogu)">
          <pre className="overflow-auto text-xs text-white/70">{JSON.stringify(ex.parameters, null, 2)}</pre>
        </Card>
      ) : null}
    </AppShell>
  );
}
