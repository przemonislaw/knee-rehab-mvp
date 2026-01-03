"use client";

import { useAppState } from "@/lib/state";
import type { Exercise } from "@/lib/types";
import MediaBlock from "@/components/MediaBlock";

export default function PrefsClient({ ex }: { ex: Exercise }) {
  const { state } = useAppState();
  return <MediaBlock ex={ex} pref={state.mediaPref} />;
}
