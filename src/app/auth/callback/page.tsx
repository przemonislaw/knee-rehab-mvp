"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().finally(() => {
      router.replace("/today");
    });
  }, [router]);

  return <div className="mx-auto max-w-md p-6 text-sm">Finalizuję logowanie…</div>;
}
