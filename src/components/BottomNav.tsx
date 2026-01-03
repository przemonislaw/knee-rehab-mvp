"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/today", label: "Dzisiaj" },
  { href: "/plan", label: "Plan" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Ustawienia" }
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto grid max-w-[720px] grid-cols-4">
        {items.map((it) => {
          const active = path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`py-3 text-center text-xs ${active ? "text-white" : "text-white/60"}`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
