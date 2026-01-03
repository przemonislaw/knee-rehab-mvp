import rehabPlanJson from "@/data/rehabPlan.json";
import exerciseCatalogJson from "@/data/exerciseCatalog.json";
import type { Exercise, ExerciseCatalog, Phase, RehabPlan, SessionTemplate } from "./types";

const rehabPlan = rehabPlanJson as RehabPlan;
const exerciseCatalog = exerciseCatalogJson as ExerciseCatalog;

export function getPlan(): RehabPlan {
  return rehabPlan;
}

export function getCatalog(): ExerciseCatalog {
  return exerciseCatalog;
}

export function getExerciseById(id: string): Exercise | undefined {
  return exerciseCatalog.exercises.find((e) => e.id === id);
}

export function getPhaseForWeek(weekNumber: number): Phase | null {
  return rehabPlan.phases.find((p) => p.weeks.includes(weekNumber)) ?? null;
}

export function getTemplates(phase: Phase | null): SessionTemplate[] {
  return phase?.session_templates ?? [];
}

export function resolveExercises(template: SessionTemplate): Exercise[] {
  return template.includes
    .map((id) => getExerciseById(id))
    .filter(Boolean) as Exercise[];
}
