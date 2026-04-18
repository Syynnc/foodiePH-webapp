"use client";

import Link from "next/link";
import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "./actions";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1a1208]/50">
        {label}
      </label>
      <div className="relative p-[1.5px] rounded-2xl bg-[#1a1208]/6 ring-1 ring-[#1a1208]/8">
        <div className="relative rounded-[calc(1rem-1.5px)] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          <input
            name={name}
            type={inputType}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3.5 text-sm bg-transparent text-[#1a1208] placeholder:text-[#1a1208]/30 outline-none rounded-[calc(1rem-1.5px)] focus:ring-2 focus:ring-[#c8783a]/30 transition-all duration-300"
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1208]/30 hover:text-[#1a1208]/60 transition-colors duration-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const message = searchParams.get("message");

  const [tab, setTab] = useState<"signin" | "signup">(defaultTab as "signin" | "signup");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSignIn(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) setError(result.error);
    });
  }

  function handleSignUp(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-4 py-16">
      {/* Ambient orb */}
      <div className="hero-orb absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" />

      {/* Back to home */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-40 flex items-center gap-2 rounded-full border border-[#1a1208]/10 bg-[#FDFBF7]/80 backdrop-blur-xl px-4 py-2 text-sm font-medium text-[#1a1208]/60 hover:text-[#1a1208] transition-all duration-300"
      >
        ← Back
      </Link>

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Outer shell */}
        <div className="p-2 rounded-[2.5rem] bg-[#1a1208]/5 ring-1 ring-[#1a1208]/8">
          {/* Inner core */}
          <div className="rounded-[calc(2.5rem-0.5rem)] bg-white/80 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] px-8 py-10">

            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="font-playfair inline-block text-2xl font-bold tracking-tight">
                Foodie<span className="text-[#c8783a]">.ph</span>
              </Link>
              <p className="text-xs uppercase tracking-[0.18em] text-[#1a1208]/40 mt-1 font-medium">
                Corporate Concierge Delivery
              </p>
            </div>

            {/* Tab switcher */}
            <div className="p-1 rounded-full bg-[#1a1208]/6 ring-1 ring-[#1a1208]/6 flex mb-8">
              {(["signin", "signup"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setError(null); }}
                  className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    tab === t
                      ? "bg-[#1a1208] text-[#FDFBF7] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                      : "text-[#1a1208]/50 hover:text-[#1a1208]"
                  }`}
                >
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Success message */}
            {message && (
              <div className="mb-6 p-3 rounded-xl bg-[#edf2e8] border border-green-200 text-sm text-green-800 text-center">
                {message}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-[#f5ebe8] border border-red-200 text-sm text-red-700 text-center">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            {tab === "signin" && (
              <form action={handleSignIn} className="flex flex-col gap-4">
                <InputField label="Email" name="email" type="email" placeholder="you@company.com" required />
                <InputField label="Password" name="password" type="password" placeholder="••••••••" required />
                <div className="text-right">
                  <Link href="#" className="text-xs text-[#c8783a] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="group mt-2 flex items-center justify-center gap-3 rounded-full bg-[#1a1208] text-[#FDFBF7] px-6 py-4 text-sm font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#c8783a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Signing in…" : "Sign In"}
                  {!isPending && (
                    <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                      →
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {tab === "signup" && (
              <form action={handleSignUp} className="flex flex-col gap-4">
                <InputField label="Full Name" name="full_name" placeholder="Juan dela Cruz" required />
                <InputField label="Company" name="company" placeholder="Acme Corp" />
                <InputField label="Email" name="email" type="email" placeholder="you@company.com" required />
                <InputField label="Password" name="password" type="password" placeholder="Min. 8 characters" required />
                <button
                  type="submit"
                  disabled={isPending}
                  className="group mt-2 flex items-center justify-center gap-3 rounded-full bg-[#1a1208] text-[#FDFBF7] px-6 py-4 text-sm font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#c8783a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Creating account…" : "Create Account"}
                  {!isPending && (
                    <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                      →
                    </span>
                  )}
                </button>
                <p className="text-center text-xs text-[#1a1208]/40 leading-5">
                  By signing up you agree to our{" "}
                  <Link href="#" className="text-[#c8783a] hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-[#c8783a] hover:underline">Privacy Policy</Link>.
                </p>
              </form>
            )}

            {/* Switch tab hint */}
            <p className="mt-6 text-center text-xs text-[#1a1208]/40">
              {tab === "signin" ? (
                <>
                  No account?{" "}
                  <button type="button" onClick={() => setTab("signup")} className="text-[#c8783a] hover:underline">
                    Sign up for free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("signin")} className="text-[#c8783a] hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FDFBF7]" />}>
      <AuthContent />
    </Suspense>
  );
}
