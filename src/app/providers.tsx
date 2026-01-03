"use client";

import { AppStateProvider } from "@/lib/state";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
