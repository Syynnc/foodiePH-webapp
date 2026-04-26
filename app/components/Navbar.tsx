"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "Menu",        href: "#menu"        },
  { label: "Restaurants", href: "#restaurants" },
  { label: "Deals",       href: "#deals"       },
  { label: "About",       href: "#about"       },
];

export function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [user,        setUser]        = useState<User | null>(null);
  const [profile,     setProfile]     = useState<{ full_name: string | null; email: string } | null>(null);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // ── Auth state ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch profile name ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      if (!user) {
        if (mounted) setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      
      if (mounted) {
        setProfile(data ?? { full_name: null, email: user.email ?? "" });
      }
    };
    
    fetchProfile();
    return () => { mounted = false; };
  }, [user, supabase]);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Scroll shadow ─────────────────────────────────────────────────────────
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setDropOpen(false);
  }

  // ── Initials avatar ───────────────────────────────────────────────────────
  const displayName = profile?.full_name ?? profile?.email ?? user?.email ?? "U";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl transition-all duration-500 ${scrolled ? "top-3" : "top-6"}`}>
        <div className="bg-[#FDFBF7]/85 backdrop-blur-xl border border-[#1a1208]/8 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_2px_32px_rgba(0,0,0,0.06)]">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-playfair text-xl font-bold tracking-tight">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
          </Link>

          {/* Desktop nav links */}
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

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* ── Signed-in state ── */
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-full border border-[#1a1208]/10 bg-white/60 px-3 py-1.5 transition-all duration-300 hover:border-[#1a1208]/20 hover:bg-white/80 focus:outline-none"
                >
                  {/* Avatar circle */}
                  <div className="w-6 h-6 rounded-full bg-[#c8783a] flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-white leading-none">{initials}</span>
                  </div>
                  <span className="text-sm font-medium text-[#1a1208] max-w-[120px] truncate">
                    {profile?.full_name ?? displayName.split("@")[0]}
                  </span>
                  <svg
                    className={`flex-shrink-0 transition-transform duration-300 ${dropOpen ? "rotate-180" : ""}`}
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="#1a1208" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown */}
                <div className={`absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-[#1a1208]/[0.07] shadow-[0_12px_40px_rgba(0,0,0,0.10)] overflow-hidden transition-all duration-300 origin-top-right ${dropOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                  {/* User info header */}
                  <div className="px-4 pt-4 pb-3 border-b border-[#1a1208]/[0.05]">
                    <p className="text-xs font-semibold text-[#1a1208] truncate">{profile?.full_name ?? "My Account"}</p>
                    <p className="text-[10px] text-[#1a1208]/40 truncate mt-0.5">{profile?.email ?? user.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#1a1208] hover:bg-[#1a1208]/[0.03] transition-colors duration-200"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#1a1208] hover:bg-[#1a1208]/[0.03] transition-colors duration-200"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      My Orders
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-[#1a1208]/[0.05] py-1.5">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-200"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Signed-out state ── */
              <>
                <Link
                  href="/auth"
                  className="text-sm font-medium text-[#1a1208]/55 hover:text-[#1a1208] transition-colors duration-300"
                >
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
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 flex-shrink-0"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-6 bg-[#1a1208] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block h-px w-6 bg-[#1a1208] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div className={`fixed inset-0 z-30 backdrop-blur-3xl bg-[#FDFBF7]/92 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col items-center gap-8">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`font-playfair text-4xl font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
              style={{ transitionDelay: menuOpen ? `${100 + i * 60}ms` : "0ms" }}
            >
              {link.label}
            </a>
          ))}

          {user ? (
            <div
              className={`mt-4 flex flex-col items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
              style={{ transitionDelay: menuOpen ? "380ms" : "0ms" }}
            >
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-[#c8783a] text-white px-8 py-3 text-base font-medium"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="text-sm font-medium text-[#1a1208]/45 underline underline-offset-4"
              >
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