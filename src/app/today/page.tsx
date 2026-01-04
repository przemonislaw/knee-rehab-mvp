"use client";

import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import SessionPicker from "@/components/SessionPicker";
import ExerciseRow from "@/components/ExerciseRow";
import CheckInForm from "@/components/CheckInForm";

import { dateISO, weekNumberFromStart } from "@/lib/date";
import { getPhaseForWeek, getTemplates, resolveExercises } from "@/lib/plan";
import { computeStatus } from "@/lib/status";
import { useAppState } from "@/lib/state";

export default function TodayPage() {
  const { state, pickTemplateForDate, upsertExerciseProgress, addCheckIn } = useAppState();

  const todayISO = dateISO(new Date());

  const weekNo =
  state.planMode === "manual" && state.weekOverride
    ? state.weekOverride
    : state.startDateISO
      ? weekNumberFromStart(state.startDateISO, new Date())
      : null;
      
  const phase = weekNo ? getPhaseForWeek(weekNo) : null;
  const templates = getTemplates(phase);

  const selectedId = state.selectedTemplateByDate[todayISO] ?? (templates[0]?.id ?? null);
  const selectedTemplate = templates.find((t) => t.id === selectedId) ?? null;

  const exercises = selectedTemplate ? resolveExercises(selectedTemplate) : [];

  // latest check-in global (po timestamp)
  const latest = (() => {
    let best: any = null;
    for (const arr of Object.values(state.checkInsByDate)) {
      if (!arr) continue;
      for (const c of arr) if (!best || c.timestampISO > best.timestampISO) best = c;
    }
    return best;
  })();

  const status = computeStatus(latest);

  return (
    <AppShell title="Plan na dziś" subtitle={`Dzisiaj: ${todayISO}`}>
      <Card title="Status kolana" right={<StatusBadge status={status} />}>
        <div className="text-sm text-white/80">
          {status === "GREEN" && "GREEN: OK — rób plan."}
          {status === "YELLOW" && "YELLOW: Uwaga — wg reguł zmniejsz intensywność / regeneracja."}
          {status === "RED" && "RED: Stop — wg reguł przerwij i regeneruj."}
          {status === "UNKNOWN" && "Brak check-in — status nieznany."}
        </div>
        <div className="mt-2 text-xs text-white/60">
          Aplikacja nie zmienia planu — tylko ostrzega (wg decisionRules.md).
        </div>
      </Card>

      {!state.startDateISO ? (
        <Card title="Ustaw datę startu">
          <div className="text-sm text-white/70">
            Przejdź do <b>Ustawienia</b> i wpisz datę startu (YYYY-MM-DD).
          </div>
        </Card>
      ) : (
        <Card title="Kontekst planu">
          <div className="text-sm">Tydzień: <b>{weekNo}</b></div>
          <div className="mt-1 text-sm text-white/80">Faza: <b>{phase?.name_pl ?? "—"}</b></div>
          {phase?.load_pl && <div className="mt-2 text-xs text-white/60">{phase.load_pl}</div>}
        </Card>
      )}

      <SessionPicker
        templates={templates}
        selectedId={selectedId}
        onPick={(id) => pickTemplateForDate(todayISO, id)}
      />

      {selectedTemplate && (
        <Card title={selectedTemplate.name_pl}>
          <div className="text-xs text-white/60">{selectedTemplate.notes_pl ?? "Odhacz wykonanie i zapisz parametry."}</div>
        </Card>
      )}

      {exercises.map((ex) => (
        <ExerciseRow
          key={ex.id}
          id={ex.id}
          name={ex.name_pl}
          progress={state.exerciseProgressByDate[todayISO]?.[ex.id] ?? null}
          onChange={(patch) => upsertExerciseProgress(todayISO, ex.id, patch)}
        />
      ))}

      <CheckInForm
        onSubmit={(v) =>
          addCheckIn(todayISO, {
            pain: v.pain,
            swelling: v.swelling,
            instability: v.instability,
            stiffness: v.stiffness,
            comment: v.comment
          })
        }
      />
    </AppShell>
  );
}
