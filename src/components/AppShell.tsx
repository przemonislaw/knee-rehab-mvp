"use client";

import type { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="mx-auto max-w-[720px] px-4 pb-4 pt-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
      </header>
      <main className="mx-auto max-w-[720px] space-y-3 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
