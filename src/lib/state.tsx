"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, CheckIn, ExerciseProgress, MediaPref } from "./types";
import { getSupabase } from "./supabase";

type SyncStatus = "saved" | "saving" | "error";


type Ctx = {
  state: AppState;
  loading: boolean;
  authed: boolean;

  syncStatus: SyncStatus;
  lastSyncError: string | null;
  clearLastSyncError: () => void;

  signInWithEmailOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;

  setStartDateISO: (iso: string | null) => void;
  setMediaPref: (pref: MediaPref) => void;

  pickTemplateForDate: (dateISO: string, templateId: string) => void;
  upsertExerciseProgress: (dateISO: string, exerciseId: string, patch: Partial<ExerciseProgress>) => void;

  addCheckIn: (dateISO: string, input: Omit<CheckIn, "id" | "timestampISO">) => Promise<void>;

  resetAll: () => void;
};

const AppStateContext = createContext<Ctx | null>(null);

function emptyState(): AppState {
  return {
    version: 1,
    startDateISO: null,
    mediaPref: "both",
    selectedTemplateByDate: {},
    exerciseProgressByDate: {},
    checkInsByDate: {}
  };
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState());
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);


const [syncStatus, setSyncStatus] = useState<SyncStatus>("saved");
const [lastSyncError, setLastSyncError] = useState<string | null>(null);
const syncTokenRef = useRef(0);

function normalizeError(err: unknown): string {
  if (!err) return "Nieznany błąd zapisu";
  if (typeof err === "string") return err;
  const anyErr = err as any;
  if (anyErr?.message) return String(anyErr.message);
  if (anyErr?.error_description) return String(anyErr.error_description);
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function beginSync(): number {
  const token = ++syncTokenRef.current;
  setSyncStatus("saving");
  setLastSyncError(null);
  return token;
}

function endSyncOk(token: number) {
  if (token !== syncTokenRef.current) return;
  setSyncStatus("saved");
}

function endSyncErr(token: number, err: unknown) {
  if (token !== syncTokenRef.current) return;
  setSyncStatus("error");
  setLastSyncError(normalizeError(err));
}

function clearLastSyncError() {
  setLastSyncError(null);
  if (syncStatus === "error") setSyncStatus("saved");
}


  // keep latest state for async writes (avoid stale closure)
  const stateRef = useRef<AppState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // --- AUTH
  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadFromDb() {
    const supabase = getSupabase();
    const { data: s } = await supabase.auth.getSession();
    const user = s.session?.user;
    if (!user) return;

    // settings
    const settingsRes = await supabase
      .from("user_settings")
      .select("start_date, media_pref")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!settingsRes.error && settingsRes.data !== null) {
      const row = settingsRes.data;
      setState((prev) => ({
        ...prev,
        startDateISO: row.start_date ?? null,
        mediaPref: (row.media_pref ?? "both") as MediaPref
      }));
    } else {
      // jeśli nie ma rekordu, utwórz default (upsert)
      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        start_date: null,
        media_pref: "both"
      });
      if (error) console.error("Supabase user_settings bootstrap upsert failed:", error);
    }

    // today template
    const todayISO = toISODate(new Date());
    const daySessionRes = await supabase
      .from("day_sessions")
      .select("date_iso, template_id")
      .eq("user_id", user.id)
      .eq("date_iso", todayISO)
      .maybeSingle();

    if (daySessionRes.error) {
      console.error("Supabase day_sessions select failed:", daySessionRes.error);
    }

    setState((prev) => ({
      ...prev,
      selectedTemplateByDate: {
        ...prev.selectedTemplateByDate,
        ...(daySessionRes.data?.date_iso
          ? { [daySessionRes.data.date_iso]: daySessionRes.data.template_id }
          : {})
      }
    }));

    // exercise logs for today
    const logsRes = await supabase
      .from("exercise_logs")
      .select("date_iso, exercise_id, done, sets, reps, duration_seconds, load, note, updated_at")
      .eq("user_id", user.id)
      .eq("date_iso", todayISO);

    if (logsRes.error) {
      console.error("Supabase exercise_logs select failed:", logsRes.error);
    }

    if (!logsRes.error && logsRes.data) {
      const mapForDay: Record<string, ExerciseProgress> = {};
      for (const r of logsRes.data) {
        mapForDay[r.exercise_id] = {
          done: Boolean(r.done),
          sets: r.sets ?? null,
          reps: r.reps ?? null,
          durationSeconds: r.duration_seconds ?? null,
          load: r.load ?? null,
          note: r.note ?? null,
          updatedAtISO: r.updated_at ?? new Date().toISOString()
        };
      }
      setState((prev) => ({
        ...prev,
        exerciseProgressByDate: {
          ...prev.exerciseProgressByDate,
          [todayISO]: mapForDay
        }
      }));
    }

    // check-ins last 30 days (dla statusu i Progress page)
    const fromISO = daysAgoISO(30);
    const checkRes = await supabase
      .from("check_ins")
      .select("id, date_iso, created_at, pain, swelling, instability, stiffness, comment")
      .eq("user_id", user.id)
      .gte("date_iso", fromISO)
      .order("created_at", { ascending: true });

    if (checkRes.error) {
      console.error("Supabase check_ins select failed:", checkRes.error);
    }

    if (!checkRes.error && checkRes.data) {
      const byDate: Record<string, CheckIn[]> = {};
      for (const r of checkRes.data) {
        const d = r.date_iso as string;
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push({
          id: r.id,
          timestampISO: r.created_at,
          pain: r.pain,
          swelling: r.swelling,
          instability: r.instability,
          stiffness: r.stiffness,
          comment: r.comment ?? undefined
        });
      }
      setState((prev) => ({
        ...prev,
        checkInsByDate: { ...prev.checkInsByDate, ...byDate }
      }));
    }
  }

  // załaduj dane po zalogowaniu
  useEffect(() => {
    if (!authed) {
      setState(emptyState());
      return;
    }
    setLoading(true);
    loadFromDb().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const api: Ctx = useMemo(
    () => ({
      syncStatus,
      lastSyncError,
      clearLastSyncError,
      state,
      loading,
      authed,

      signInWithEmailOtp: async (email: string) => {
        const supabase = getSupabase();
        const emailRedirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo }
        });
        if (error) throw error;
      },

      signOut: async () => {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      },

      
setStartDateISO: (iso) => {
  const supabase = getSupabase();

  // optimistic
  setState((s) => ({ ...s, startDateISO: iso }));

  const token = beginSync();

  supabase.auth
    .getSession()
    .then(async ({ data }) => {
      try {
        const user = data.session?.user;
        if (!user) {
          endSyncOk(token);
          return;
        }

        const currentPref = stateRef.current.mediaPref;

        const { error } = await supabase.from("user_settings").upsert({
          user_id: user.id,
          start_date: iso,
          media_pref: currentPref
        });

        if (error) {
          console.error("Supabase user_settings upsert failed (setStartDateISO):", error);
          endSyncErr(token, error);
        } else {
          endSyncOk(token);
        }
      } catch (e) {
        console.error("Supabase user_settings upsert failed (setStartDateISO):", e);
        endSyncErr(token, e);
      }
    })
    .catch((e) => {
      console.error("Supabase user_settings upsert failed (setStartDateISO):", e);
      endSyncErr(token, e);
    });
},

      
setMediaPref: (pref) => {
  const supabase = getSupabase();

  // optimistic
  setState((s) => ({ ...s, mediaPref: pref }));

  const token = beginSync();

  supabase.auth
    .getSession()
    .then(async ({ data }) => {
      try {
        const user = data.session?.user;
        if (!user) {
          endSyncOk(token);
          return;
        }

        const currentStart = stateRef.current.startDateISO;

        const { error } = await supabase.from("user_settings").upsert({
          user_id: user.id,
          start_date: currentStart,
          media_pref: pref
        });

        if (error) {
          console.error("Supabase user_settings upsert failed (setMediaPref):", error);
          endSyncErr(token, error);
        } else {
          endSyncOk(token);
        }
      } catch (e) {
        console.error("Supabase user_settings upsert failed (setMediaPref):", e);
        endSyncErr(token, e);
      }
    })
    .catch((e) => {
      console.error("Supabase user_settings upsert failed (setMediaPref):", e);
      endSyncErr(token, e);
    });
},

      
pickTemplateForDate: (dateISO, templateId) => {
  const supabase = getSupabase();

  // optimistic
  setState((s) => ({
    ...s,
    selectedTemplateByDate: { ...s.selectedTemplateByDate, [dateISO]: templateId }
  }));

  const token = beginSync();

  supabase.auth
    .getSession()
    .then(async ({ data }) => {
      try {
        const user = data.session?.user;
        if (!user) {
          endSyncOk(token);
          return;
        }

        const { error } = await supabase.from("day_sessions").upsert({
          user_id: user.id,
          date_iso: dateISO,
          template_id: templateId
        });

        if (error) {
          console.error("Supabase day_sessions upsert failed:", error);
          endSyncErr(token, error);
        } else {
          endSyncOk(token);
        }
      } catch (e) {
        console.error("Supabase day_sessions upsert failed:", e);
        endSyncErr(token, e);
      }
    })
    .catch((e) => {
      console.error("Supabase day_sessions upsert failed:", e);
      endSyncErr(token, e);
    });
},

      
upsertExerciseProgress: (dateISO, exerciseId, patch) => {
  const supabase = getSupabase();

  // optimistic
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
  });

  const token = beginSync();

  supabase.auth
    .getSession()
    .then(async ({ data }) => {
      try {
        const user = data.session?.user;
        if (!user) {
          endSyncOk(token);
          return;
        }

        const { error } = await supabase.from("exercise_logs").upsert({
          user_id: user.id,
          date_iso: dateISO,
          exercise_id: exerciseId,
          done: patch.done ?? undefined,
          sets: patch.sets ?? undefined,
          reps: patch.reps ?? undefined,
          duration_seconds: patch.durationSeconds ?? undefined,
          load: patch.load ?? undefined,
          note: patch.note ?? undefined
        });

        if (error) {
          console.error("Supabase exercise_logs upsert failed:", error);
          endSyncErr(token, error);
        } else {
          endSyncOk(token);
        }
      } catch (e) {
        console.error("Supabase exercise_logs upsert failed:", e);
        endSyncErr(token, e);
      }
    })
    .catch((e) => {
      console.error("Supabase exercise_logs upsert failed:", e);
      endSyncErr(token, e);
    });
},

      
addCheckIn: async (dateISO, input) => {
  const supabase = getSupabase();

  // optimistic UI
  const optimistic: CheckIn = {
    id: `optimistic-${Date.now()}`,
    timestampISO: new Date().toISOString(),
    pain: input.pain,
    swelling: input.swelling,
    instability: input.instability,
    stiffness: input.stiffness,
    comment: input.comment
  };

  setState((s) => {
    const arr = s.checkInsByDate[dateISO] ?? [];
    return {
      ...s,
      checkInsByDate: { ...s.checkInsByDate, [dateISO]: [...arr, optimistic] }
    };
  });

  const token = beginSync();

  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      // offline / local-only mode
      endSyncOk(token);
      return;
    }

    const { data: inserted, error } = await supabase
      .from("check_ins")
      .insert({
        user_id: user.id,
        date_iso: dateISO,
        pain: input.pain,
        swelling: input.swelling,
        instability: input.instability,
        stiffness: input.stiffness,
        comment: input.comment ?? null
      })
      .select("id, created_at")
      .maybeSingle();

    if (error) {
      console.error("Supabase check_ins insert failed:", error);
      endSyncErr(token, error);
      return;
    }

    // replace optimistic row with real id/timestamp (if returned)
    if (inserted?.id && inserted?.created_at) {
      setState((s) => {
        const arr = s.checkInsByDate[dateISO] ?? [];
        return {
          ...s,
          checkInsByDate: {
            ...s.checkInsByDate,
            [dateISO]: arr.map((c) =>
              c.id === optimistic.id
                ? { ...c, id: inserted.id as string, timestampISO: inserted.created_at as string }
                : c
            )
          }
        };
      });
    }

    endSyncOk(token);
  } catch (e) {
    console.error("Supabase check_ins insert failed:", e);
    endSyncErr(token, e);
  }
},

      resetAll: () => {
        // reset lokalny stan; bazę czyścimy później (opcjonalnie) – MVP
        setState(emptyState());
      }
    }),
    [state, loading, authed, syncStatus, lastSyncError]
  );

  // --- prosty login screen w providerze (żeby nie ruszać routingu)
  if (!loading && !authed) {
    return <EmailLogin onSignIn={api.signInWithEmailOtp} />;
  }

  return <AppStateContext.Provider value={api}>{children}</AppStateContext.Provider>;
}

function EmailLogin({ onSignIn }: { onSignIn: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Zaloguj się</h1>
      <p className="mt-2 text-sm opacity-80">Wpisz email — wyślę link/kod logowania (Supabase).</p>

      <input
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
        type="email"
        placeholder="ppietruszewski@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="mt-3 w-full rounded-xl bg-white py-2 text-sm font-semibold text-black disabled:opacity-40"
        disabled={!email.includes("@")}
        onClick={async () => {
          setErr(null);
          try {
            await onSignIn(email.trim());
            setSent(true);
          } catch (e: any) {
            setErr(e?.message ?? "Błąd logowania");
          }
        }}
      >
        Wyślij link/kod
      </button>

      {sent && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          Wysłane. Otwórz mail i kliknij link (lub wpisz kod).
        </div>
      )}
      {err && <div className="mt-3 text-sm text-red-300">{err}</div>}
    </div>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
