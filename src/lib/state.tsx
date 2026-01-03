"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppState, CheckIn, ExerciseProgress, MediaPref } from "./types";

const KEY = "kneeRehab:appState:v1";

function defaultState(): AppState {
  return {
    version: 1,
    startDateISO: null,
    mediaPref: "both",
    selectedTemplateByDate: {},
    exerciseProgressByDate: {},
    checkInsByDate: {}
  };
}

function safeUUID(): string {
  // fallback dla środowisk bez crypto.randomUUID
  // (w nowoczesnych przeglądarkach będzie randomUUID)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1) return defaultState();

    return {
      ...defaultState(),
      ...parsed,
      // zabezpieczenia na brak pól
      selectedTemplateByDate: parsed.selectedTemplateByDate ?? {},
      exerciseProgressByDate: parsed.exerciseProgressByDate ?? {},
      checkInsByDate: parsed.checkInsByDate ?? {}
    };
  } catch {
    return defaultState();
  }
}

function saveToStorage(s: AppState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

type Ctx = {
  state: AppState;

  setStartDateISO: (iso: string | null) => void;
  setMediaPref: (pref: MediaPref) => void;

  pickTemplateForDate: (dateISO: string, templateId: string) => void;
  upsertExerciseProgress: (dateISO: string, exerciseId: string, patch: Partial<ExerciseProgress>) => void;

  addCheckIn: (dateISO: string, input: Omit<CheckIn, "id" | "timestampISO">) => void;

  resetAll: () => void;
};

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState());

  // initial load
  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  // persist on change
  useEffect(() => {
    try {
      saveToStorage(state);
    } catch {
      // ignore
    }
  }, [state]);

  // sync między tabami
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(loadFromStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const api: Ctx = useMemo(
    () => ({
      state,

      setStartDateISO: (iso) => setState((s) => ({ ...s, startDateISO: iso })),

      setMediaPref: (pref) => setState((s) => ({ ...s, mediaPref: pref })),

      pickTemplateForDate: (dateISO, templateId) =>
        setState((s) => ({
          ...s,
          selectedTemplateByDate: { ...s.selectedTemplateByDate, [dateISO]: templateId }
        })),

      upsertExerciseProgress: (dateISO, exerciseId, patch) =>
        setState((s) => {
          const day = s.exerciseProgressByDate[dateISO] ?? {};
          const prev = day[exerciseId] ?? { done: false, updatedAtISO: new Date().toISOString() };

          const next: ExerciseProgress = {
            done: patch.done ?? prev.done,
            sets: patch.sets ?? prev.sets ?? null,
            reps: patch.reps ?? prev.reps ?? null,
            durationSeconds: patch.durationSeconds ?? prev.durationSeconds ?? null,
            load: patch.load ?? prev.load ?? null,
            note: patch.note ?? prev.note ?? null,
            updatedAtISO: new Date().toISOString()
          };

          return {
            ...s,
            exerciseProgressByDate: {
              ...s.exerciseProgressByDate,
              [dateISO]: { ...day, [exerciseId]: next }
            }
          };
        }),

      addCheckIn: (dateISO, input) =>
        setState((s) => {
          const arr = s.checkInsByDate[dateISO] ?? [];
          const checkin: CheckIn = {
            id: safeUUID(),
            timestampISO: new Date().toISOString(),
            pain: input.pain,
            swelling: input.swelling,
            instability: input.instability,
            stiffness: input.stiffness,
            comment: input.comment
          };

          return {
            ...s,
            checkInsByDate: {
              ...s.checkInsByDate,
              [dateISO]: [...arr, checkin]
            }
          };
        }),

      resetAll: () => {
        localStorage.removeItem(KEY);
        setState(defaultState());
      }
    }),
    [state]
  );

  return <AppStateContext.Provider value={api}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
