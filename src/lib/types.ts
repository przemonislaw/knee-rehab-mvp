export type RehabPlan = {
  version: string;
  language: string;
  phases: Phase[];
};

export type Phase = {
  id: string;
  name_pl: string;
  weeks: number[];
  load_pl?: string;
  goals_pl?: string[];
  session_templates?: SessionTemplate[];
  week_by_week_pl?: Record<string, string>;
  rules_ref?: string;

  progression_criteria_to_next_phase_pl?: string[];
  readiness_check_pl?: string[];
  if_not_ready_pl?: string;
  return_to_sport_criteria_pl?: string[];
};

export type SessionTemplate = {
  id: string;
  name_pl: string;
  includes: string[];
  notes_pl?: string;
};

export type ExerciseCatalog = {
  version: string;
  language: string;
  exercises: Exercise[];
};

export type MediaStatus = "draft" | "approved";
export type ExerciseImageKind = "start" | "end";

export type ExerciseImage = {
  kind: ExerciseImageKind;
  url?: string | null;

  // wymagane – bo chcesz zawsze oznaczać AI obrazki jako DRAFT
  status: MediaStatus;

  source?: string | null;  // np. "AI"
  license?: string | null; // np. "internal"
  notes?: string | null;   // np. "Poglądowe – do weryfikacji"
};

export type PlanMode = "auto" | "manual";

export type Exercise = {
  id: string;
  name_pl: string;
  category?: string;
  equipment?: string[];
  how_pl?: string;
  images?: ExerciseImage[]; // nowe A/B
  parameters?: Record<string, unknown>;
  safety_pl?: string;

  imageUrl?: string | null;
  videoUrl?: string | null;
  source?: string | null;
  license?: string | null;
  notes?: string | null;
};

export type MediaPref = "image" | "video" | "both";
export type KneeStatus = "GREEN" | "YELLOW" | "RED" | "UNKNOWN";

export type ExerciseProgress = {
  done: boolean;
  sets?: number | null;
  reps?: number | null;
  durationSeconds?: number | null;
  load?: string | null;
  note?: string | null;
  updatedAtISO: string;
};

export type CheckIn = {
  id: string;
  timestampISO: string;
  pain: number;
  swelling: boolean;
  instability: boolean;
  stiffness: number;
  comment?: string;
};

export type AppState = {
  version: 1;

  // ustawienia użytkownika (w Settings)
  startDateISO: string | null; // YYYY-MM-DD
  mediaPref: MediaPref;
  planMode: PlanMode;
  weekOverride: number | null;

  // dane dzienne
  selectedTemplateByDate: Record<string, string | undefined>;
  exerciseProgressByDate: Record<string, Record<string, ExerciseProgress | undefined>>;
  checkInsByDate: Record<string, CheckIn[] | undefined>;
};
