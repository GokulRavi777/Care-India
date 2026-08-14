"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        <span>Validating Auth...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[10px] sm:text-xs text-cyan-300 font-mono font-bold uppercase bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 select-none shadow-[0_0_10px_rgba(0,242,254,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Demo Mode Active
        </span>
        <span className="text-xs text-slate-300 font-mono hidden sm:inline max-w-[150px] truncate bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
          {user.email}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 rounded-xl hover:bg-rose-500/20 transition-all cursor-pointer focus:outline-none"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-xs font-semibold text-cyan-300 hover:text-white border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/25 px-4 py-1.5 rounded-xl transition-all shadow-[0_0_12px_rgba(0,242,254,0.15)]"
      >
        Sign In / Demo Access
      </Link>
    </div>
  );
}
