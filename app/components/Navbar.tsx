"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "Menu", href: "/menu" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Deals", href: "/deals" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; email: string } | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Profile ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function fetch() {
      if (!user) { if (mounted) setProfile(null); return; }
      const { data } = await supabase
        .from("profiles").select("full_name, email").eq("id", user.id).single();
      if (mounted) setProfile(data ?? { full_name: null, email: user.email ?? "" });
    }
    fetch();
    return () => { mounted = false; };
  }, [user, supabase]);

  // ── Outside-click close ───────────────────────────────────────────────────
  useEffect(() => {
    function h(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Scroll compaction ─────────────────────────────────────────────────────
  useEffect(() => {
    function s() { setScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", s, { passive: true });
    return () => window.removeEventListener("scroll", s);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setDropOpen(false);
    window.location.href = "/";
  }

  const displayName = profile?.full_name ?? profile?.email ?? user?.email ?? "U";
  const initials = displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      {/* ── Pill navbar ────────────────────────────────────────────────────── */}
      <nav className={`fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl transition-all duration-500 ${scrolled ? "top-3" : "top-6"}`}>
        <div className="bg-[#FDFBF7]/85 backdrop-blur-xl border border-[#1a1208]/8 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_2px_32px_rgba(0,0,0,0.06)]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-playfair text-xl font-bold tracking-tight">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#1a1208]/55 hover:text-[#1a1208] transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Dashboard CTA */}
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2 rounded-full bg-[#c8783a] text-white px-5 py-2.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#b5692e] active:scale-[0.98]"
                >
                  Dashboard
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">↗</span>
                </Link>

                {/* Avatar + dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen((v) => !v)}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-[#1a1208]/10 bg-white/60 hover:border-[#1a1208]/20 hover:bg-white/80 transition-all duration-300 focus:outline-none"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#c8783a] flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white leading-none">{initials}</span>
                    </div>
                  </button>

                  <div className={`absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-[#1a1208]/[0.07] shadow-[0_12px_40px_rgba(0,0,0,0.10)] overflow-hidden transition-all duration-300 origin-top-right ${dropOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                    <div className="px-4 pt-4 pb-3 border-b border-[#1a1208]/[0.05]">
                      <p className="text-xs font-semibold text-[#1a1208] truncate">{profile?.full_name ?? "My Account"}</p>
                      <p className="text-[10px] text-[#1a1208]/40 truncate mt-0.5">{profile?.email ?? user.email}</p>
                    </div>
                    <div className="border-t border-[#1a1208]/[0.05] py-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-sm font-medium text-[#1a1208]/55 hover:text-[#1a1208] transition-colors duration-300">
                  Sign in
                </Link>
                <Link
                  href="/auth?tab=signup"
                  className="group flex items-center gap-2 rounded-full bg-[#c8783a] text-white px-5 py-2.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#b5692e] active:scale-[0.98]"
                >
                  Order Now
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">↗</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 flex-shrink-0"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-6 bg-[#1a1208] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block h-px w-6 bg-[#1a1208] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ── Mobile overlay ──────────────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-30 backdrop-blur-3xl bg-[#FDFBF7]/92 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col items-center gap-8">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`font-playfair text-4xl font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
              style={{ transitionDelay: menuOpen ? `${100 + i * 60}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div
              className={`mt-4 flex flex-col items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
              style={{ transitionDelay: menuOpen ? "380ms" : "0ms" }}
            >
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-full bg-[#c8783a] text-white px-8 py-3 text-base font-medium">
                Go to Dashboard
              </Link>
              <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="text-sm font-medium text-[#1a1208]/45 underline underline-offset-4">
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMenuOpen(false)}
              className={`mt-4 rounded-full bg-[#c8783a] text-white px-8 py-3 text-base font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
              style={{ transitionDelay: menuOpen ? "380ms" : "0ms" }}
            >
              Order Now
            </Link>
          )}
        </div>
      </div>
    </>
  );
}