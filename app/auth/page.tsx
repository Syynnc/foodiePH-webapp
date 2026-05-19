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
  error,
  onBlur,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1a1208]/50">
        {label}{required && <span className="text-[#c8783a] ml-0.5">*</span>}
      </label>
      <div className={`relative p-[1.5px] rounded-2xl ring-1 transition-all duration-200 ${hasError ? "bg-red-100 ring-red-300" : "bg-[#1a1208]/6 ring-[#1a1208]/8"}`}>
        <div className="relative rounded-[calc(1rem-1.5px)] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          <input
            name={name}
            type={inputType}
            placeholder={placeholder}
            required={required}
            onBlur={onBlur}
            onChange={onChange}
            className={`w-full px-4 py-3.5 text-sm bg-transparent text-[#1a1208] placeholder:text-[#1a1208]/30 outline-none rounded-[calc(1rem-1.5px)] transition-all duration-300 ${hasError ? "focus:ring-2 focus:ring-red-300/50" : "focus:ring-2 focus:ring-[#c8783a]/30"}`}
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
      {hasError && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

type SignInErrors = { email?: string; password?: string };
type SignUpErrors = { first_name?: string; last_name?: string; email?: string; password?: string };

function validateEmail(v: string) {
  if (!v.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Enter a valid email address";
  return "";
}
function validatePassword(v: string) {
  if (!v) return "Password is required";
  if (v.length < 8) return "Password must be at least 8 characters";
  return "";
}
function validateName(v: string, label: string) {
  if (!v.trim()) return `${label} is required`;
  if (v.trim().length < 2) return `${label} must be at least 2 characters`;
  if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ '\-]+$/.test(v.trim())) return `${label} must contain letters only`;
  return "";
}

function AuthContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const message = searchParams.get("message");

  const [tab, setTab] = useState<"signin" | "signup">(defaultTab as "signin" | "signup");
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function switchTab(newTab: "signin" | "signup") {
    if (newTab === tab || isExiting) return;
    setError(null); setSiErrors({}); setSuErrors({}); setSiTouched({}); setSuTouched({});
    setIsExiting(true);
    setTimeout(() => {
      setTab(newTab);
      setIsExiting(false);
    }, 180);
  }

  const [siErrors, setSiErrors] = useState<SignInErrors>({});
  const [siTouched, setSiTouched] = useState<Record<string, boolean>>({});
  const [suErrors, setSuErrors] = useState<SignUpErrors>({});
  const [suTouched, setSuTouched] = useState<Record<string, boolean>>({});

  function siBlur(name: keyof SignInErrors, value: string) {
    setSiTouched(t => ({ ...t, [name]: true }));
    const err = name === "email" ? validateEmail(value) : validatePassword(value);
    setSiErrors(e => ({ ...e, [name]: err }));
  }
  function siChange(name: keyof SignInErrors, value: string) {
    if (!siTouched[name]) return;
    const err = name === "email" ? validateEmail(value) : validatePassword(value);
    setSiErrors(e => ({ ...e, [name]: err }));
  }

  async function suBlur(name: keyof SignUpErrors, value: string) {
    setSuTouched(t => ({ ...t, [name]: true }));
    let err = name === "first_name" ? validateName(value, "First name") : name === "last_name" ? validateName(value, "Last name") : name === "email" ? validateEmail(value) : validatePassword(value);
    if (name === "email" && !err) {
      try {
        const res = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        });
        const json = await res.json();
        if (json.exists) err = "An account with this email already exists.";
      } catch { /* fail open */ }
    }
    setSuErrors(e => ({ ...e, [name]: err }));
  }
  function suChange(name: keyof SignUpErrors, value: string) {
    if (!suTouched[name]) return;
    const err = name === "first_name" ? validateName(value, "First name") : name === "last_name" ? validateName(value, "Last name") : name === "email" ? validateEmail(value) : validatePassword(value);
    setSuErrors(e => ({ ...e, [name]: err }));
  }

  function handleSignIn(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const errs: SignInErrors = { email: validateEmail(email), password: validatePassword(password) };
    setSiErrors(errs);
    setSiTouched({ email: true, password: true });
    if (errs.email || errs.password) return;
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) setError(result.error);
    });
  }

  function handleSignUp(formData: FormData) {
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const errs: SignUpErrors = { first_name: validateName(first_name, "First name"), last_name: validateName(last_name, "Last name"), email: validateEmail(email), password: validatePassword(password) };
    setSuErrors(errs);
    setSuTouched({ first_name: true, last_name: true, email: true, password: true });
    if (errs.first_name || errs.last_name || errs.email || errs.password) return;
    setError(null);
    startTransition(async () => {
      // Re-check email existence right before submit in case the inline blur check was skipped
      try {
        const res = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const json = await res.json();
        if (json.exists) {
          setSuErrors(e => ({ ...e, email: "An account with this email already exists." }));
          return;
        }
      } catch { /* fail open — server action will catch it */ }

      const result = await signUp(formData);
      if (result?.error) {
        if (result.error.toLowerCase().includes("already exists")) {
          setSuErrors(e => ({ ...e, email: result.error }));
        } else {
          setError(result.error);
        }
      }
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
                  onClick={() => switchTab(t)}
                  className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${tab === t
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

            {/* Server error */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-[#f5ebe8] border border-red-200 text-sm text-red-700 text-center">
                {error}
              </div>
            )}

            {/* Forms */}
            <div
              key={tab}
              className="auth-form-enter"
              style={{
                opacity: isExiting ? 0 : undefined,
                transform: isExiting ? 'translateY(6px)' : undefined,
                transition: isExiting ? 'opacity 0.18s ease, transform 0.18s ease' : undefined,
              }}
            >

            {/* Sign In Form */}
            {tab === "signin" && (
              <form action={handleSignIn} className="flex flex-col gap-4">
                <InputField
                  label="Email" name="email" type="email" placeholder="you@company.com" required
                  error={siErrors.email}
                  onBlur={e => siBlur("email", e.target.value)}
                  onChange={e => siChange("email", e.target.value)}
                />
                <InputField
                  label="Password" name="password" type="password" placeholder="••••••••" required
                  error={siErrors.password}
                  onBlur={e => siBlur("password", e.target.value)}
                  onChange={e => siChange("password", e.target.value)}
                />
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
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="First Name" name="first_name" placeholder="Juan" required
                    error={suErrors.first_name}
                    onBlur={e => suBlur("first_name", e.target.value)}
                    onChange={e => suChange("first_name", e.target.value)}
                  />
                  <InputField
                    label="Last Name" name="last_name" placeholder="dela Cruz" required
                    error={suErrors.last_name}
                    onBlur={e => suBlur("last_name", e.target.value)}
                    onChange={e => suChange("last_name", e.target.value)}
                  />
                </div>
                <InputField label="Company" name="company" placeholder="Acme Corp" />
                <InputField
                  label="Email" name="email" type="email" placeholder="you@company.com" required
                  error={suErrors.email}
                  onBlur={e => suBlur("email", e.target.value)}
                  onChange={e => suChange("email", e.target.value)}
                />
                <InputField
                  label="Password" name="password" type="password" placeholder="Min. 8 characters" required
                  error={suErrors.password}
                  onBlur={e => suBlur("password", e.target.value)}
                  onChange={e => suChange("password", e.target.value)}
                />
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

            </div>{/* end auth-form-enter */}

            {/* Switch tab hint */}
            <p className="mt-6 text-center text-xs text-[#1a1208]/40">
              {tab === "signin" ? (
                <>
                  No account?{" "}
                  <button type="button" onClick={() => switchTab("signup")} className="text-[#c8783a] hover:underline">
                    Sign up for free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchTab("signin")} className="text-[#c8783a] hover:underline">
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
