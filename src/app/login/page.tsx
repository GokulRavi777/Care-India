"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@careindia.org");
  const [password, setPassword] = useState("DemoUser@2026");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setSuccessMessage("Authentication successful! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 600);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setSuccessMessage(`Logging in as ${demoEmail}...`);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setSuccessMessage("Signed in successfully! Launching dashboard...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo sign in failed.";
      setErrorMessage(msg);
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-cyan-500/15 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-md bg-[#0D1426]/90 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 transition-all">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/95 p-1.5 border border-cyan-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,242,254,0.25)]">
            <Image
              src="/logo.png"
              alt="Care India Logo"
              width={64}
              height={64}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <h2 className="font-serif font-bold text-2xl text-white tracking-tight">Care India Portal</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Sign in to access verified healthcare navigation</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-[#070B16] border border-cyan-500/30 rounded-2xl p-4 mb-6 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Demo Access Credentials
            </span>
            <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">
              Ready to use
            </span>
          </div>

          <div className="space-y-1 font-mono text-xs text-slate-300">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Email:</span>
              <span className="text-white font-semibold selection:bg-cyan-500/30">demo@careindia.org</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Password:</span>
              <span className="text-cyan-300 font-semibold selection:bg-cyan-500/30">DemoUser@2026</span>
            </div>
          </div>

          {/* 1-Click Fast Access Buttons */}
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400">1-Click Fast Sign-In Profiles:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("alice@careindia.org", "DemoUser@2026")}
                disabled={loading}
                className="text-[11px] font-mono font-semibold py-1.5 px-2.5 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all text-center cursor-pointer"
              >
                🫀 Alice (Cardiac)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("bob@careindia.org", "DemoUser@2026")}
                disabled={loading}
                className="text-[11px] font-mono font-semibold py-1.5 px-2.5 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all text-center cursor-pointer"
              >
                🩺 Bob (Diabetes)
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-medium mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl font-medium mb-4 flex items-center gap-2">
            <span>✨</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-400" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@careindia.org"
              className="w-full px-4 py-3 bg-[#070B16] border border-white/[0.08] focus:border-cyan-400 rounded-xl text-white font-mono text-sm focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-[#070B16] border border-white/[0.08] focus:border-cyan-400 rounded-xl text-white font-mono text-sm focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-[#070C1A] font-bold rounded-xl transition-all cursor-pointer select-none text-sm shadow-[0_0_15px_rgba(0,242,254,0.3)] disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating Session..." : "Sign In with Credentials"}
          </button>
        </form>

        {/* Bottom Link back to Dashboard */}
        <div className="text-center mt-6 pt-4 border-t border-white/[0.06]">
          <Link
            href="/"
            className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
          >
            ← Back to Healthcare Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
