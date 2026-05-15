"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "../components/Footer";
import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Restaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  imageUrl: string | null;
  rating: string | null;
  minOrder: number | null;
  deliveryTime: string | null;
  isActive: boolean | null;
};

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORIES: { id: string; label: string; match: string | null; icon: React.ReactNode }[] = [
  {
    id: "all", label: "All", match: null,
    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    id: "pizza", label: "Pizza", match: "pizza",
    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2 2 19.8h20L12 2z" /><path d="M12 2v17.8" /><path d="M2 19.8h20" /><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" /><circle cx="14" cy="10" r="1" fill="currentColor" stroke="none" /></svg>,
  },
  {
    id: "asian", label: "Asian", match: "asian",
    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M7 3c0 6 4 9 5 9s5-3 5-9" /><path d="M5 21c0-4.5 3-7 7-7s7 2.5 7 7" /><path d="M5 21h14" /></svg>,
  },
  {
    id: "burgers", label: "Burgers", match: "burger",
    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 12h16" /><path d="M4 17h16" /><path d="M4 7h16" /><path d="M20 12c0-4-3.6-7-8-7S4 8 4 12" /></svg>,
  },
  {
    id: "chicken", label: "Filipino", match: "chicken",
    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 3c-4 0-7 3-7 7 0 2.5 1.5 4.5 3 6l-3 5h10l-3-5c1.5-1.5 3-3.5 3-6 0-4-3-7-3-7z" /><path d="M9 10h6" /></svg>,
  },
  {
    id: "healthy", label: "Healthy", match: "healthy",
    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7-6 8.5" /><path d="M3 11a9 9 0 0 0 9 9" /><path d="M12 2C8 6 6 10 7 14c2-2 4-2.5 5-2" /><path d="M12 2c4 4 6 8 5 12-2-2-4-2.5-5-2" /></svg>,
  },
  {
    id: "dessert", label: "Desserts", match: "dessert",
    icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2c-4 0-7 2.5-7 6 0 2 1 3.5 2.5 4.5L6 21h12l-1.5-8.5C18 11.5 19 10 19 8c0-3.5-3-6-7-6z" /><path d="M9 21v-6" /><path d="M15 21v-6" /></svg>,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function matchesCategory(r: Restaurant, catId: string) {
  if (catId === "all") return true;
  const cat = CATEGORIES.find((c) => c.id === catId);
  if (!cat?.match) return true;
  return (r.cuisine ?? "").toLowerCase().includes(cat.match);
}

function formatMin(minOrder: number | null) {
  if (!minOrder || minOrder === 0) return "Free delivery";
  return `₱${minOrder} min.`;
}

// ── Skeletons ──────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden animate-pulse bg-[#1a1208]/[0.07]" style={{ aspectRatio: "21/9" }} />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-[1.4rem] overflow-hidden bg-white border border-[#1a1208]/[0.04] animate-pulse">
      <div className="w-full aspect-[3/2] bg-[#1a1208]/[0.07]" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-2/3 rounded-full bg-[#1a1208]/[0.07]" />
        <div className="h-3 w-1/3 rounded-full bg-[#1a1208]/[0.04]" />
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((data: Restaurant[]) => setRestaurants(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) => matchesCategory(r, activeCategory));
  const [hero, ...rest] = filtered;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#FDFBF7]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 pt-6 pb-20">

        {/* ── Top bar ───────────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c8783a] mb-1">
              Good afternoon
            </p>
            <h1 className="font-playfair text-[2rem] md:text-[2.6rem] font-bold text-[#1a1208] leading-none tracking-tight">
              What are you<br className="hidden sm:block" /> craving today?
            </h1>
          </div>
          {!loading && !error && (
            <div className="flex-shrink-0 text-right hidden sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/30 mb-0.5">Available</p>
              <p className="font-playfair text-[2.2rem] font-bold text-[#1a1208] leading-none">{filtered.length}</p>
              <p className="text-[11px] font-bold text-[#1a1208]/30 uppercase tracking-widest">
                {filtered.length === 1 ? "restaurant" : "restaurants"}
              </p>
            </div>
          )}
        </div>

        {/* ── Category filter strip ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 border ${isActive
                  ? "bg-[#1a1208] text-[#FDFBF7] border-[#1a1208] shadow-[0_4px_14px_rgba(26,18,8,0.22)]"
                  : "bg-white text-[#1a1208]/55 border-[#1a1208]/[0.08] hover:border-[#1a1208]/20 hover:text-[#1a1208]"
                  }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
            </div>
            <p className="font-playfair text-lg font-semibold text-[#1a1208]">Couldn't load restaurants</p>
            <p className="text-sm text-[#1a1208]/40">{error}</p>
          </div>
        )}

        {/* ── Loading ────────────────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-6">
            <HeroSkeleton />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        )}

        {/* ── Empty ─────────────────────────────────────────────────────────── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1208]/[0.04] flex items-center justify-center">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#1a1208]/25">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="font-playfair text-lg font-semibold text-[#1a1208]">Nothing here yet</p>
            <p className="text-sm text-[#1a1208]/40">Try a different category.</p>
          </div>
        )}

        {/* ── Hero card ─────────────────────────────────────────────────────── */}
        {!loading && !error && hero && (
          <Link
            href={`/dashboard/restaurant/${hero.id}`}
            className="block group mb-5"
            style={{ animation: "fadeUp 0.5s ease both" }}
          >
            <div className="relative w-full overflow-hidden rounded-[2rem] bg-[#1a1208]/10"
              style={{ aspectRatio: "21/9" }}>
              {hero.imageUrl
                ? <Image src={hero.imageUrl} alt={hero.name} fill className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]" priority sizes="100vw" />
                : <div className="w-full h-full bg-gradient-to-br from-[#c8783a]/30 to-[#1a1208]/30" />
              }

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0905]/85 via-[#0d0905]/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0905]/50 to-transparent" />

              {/* Featured badge */}
              <div className="absolute top-5 left-6 flex items-center gap-1.5 bg-[#c8783a] text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full shadow-[0_4px_14px_rgba(200,120,58,0.40)]">
                <svg width="8" height="8" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                Featured
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between gap-6">
                <div>
                  <p className="text-[#c8783a] text-[11px] font-bold uppercase tracking-[0.18em] mb-2">{hero.cuisine}</p>
                  <h2 className="font-playfair text-[1.8rem] md:text-[2.4rem] font-bold text-white leading-none tracking-tight mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                    {hero.name}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    {hero.rating && (
                      <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[12px] font-bold px-3 py-1.5 rounded-full border border-white/12">
                        <svg width="10" height="10" fill="#facc15" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        {hero.rating}
                      </span>
                    )}
                    {hero.deliveryTime && (
                      <span className="flex items-center gap-1.5 text-white/70 text-[12px] font-medium">
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        {hero.deliveryTime}
                      </span>
                    )}
                    <span className="text-white/70 text-[12px] font-medium">{formatMin(hero.minOrder)}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 bg-white text-[#1a1208] text-[13px] font-bold px-5 py-3 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.20)] transition-all duration-300 group-hover:bg-[#c8783a] group-hover:text-white group-hover:shadow-[0_8px_28px_rgba(200,120,58,0.35)]">
                    Order now
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── Restaurant grid ───────────────────────────────────────────────── */}
        {!loading && !error && rest.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {rest.map((r, i) => (
              <Link
                key={r.id}
                href={`/dashboard/restaurant/${r.id}`}
                className="block group"
                style={{ animation: `fadeUp 0.5s ease ${80 + i * 60}ms both` }}
              >
                <div className="bg-white rounded-[1.4rem] overflow-hidden border border-[#1a1208]/[0.05] hover:border-[#1a1208]/[0.10] hover:shadow-[0_12px_40px_rgba(26,18,8,0.10)] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col h-full">

                  {/* Image */}
                  <div className="relative w-full aspect-[3/2] bg-[#f5ede0] overflow-hidden flex-shrink-0">
                    {r.imageUrl
                      ? <Image src={r.imageUrl} alt={r.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.07]" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                      : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                          <svg width="32" height="32" fill="none" stroke="#1a1208" strokeWidth="1" viewBox="0 0 24 24">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                        </div>
                      )
                    }

                    {/* Rating */}
                    {r.rating && (
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[#1a1208] text-[11px] font-bold px-2 py-1 rounded-full shadow-sm">
                        <svg width="9" height="9" fill="#facc15" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        {r.rating}
                      </div>
                    )}

                    {/* Hover overlay CTA */}
                    <div className="absolute inset-0 bg-[#0d0905]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-1.5 bg-white text-[#1a1208] text-[12px] font-bold px-4 py-2 rounded-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        View menu
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5 flex flex-col flex-1 gap-1">
                    <h3 className="font-bold text-[14px] text-[#1a1208] leading-snug line-clamp-1">{r.name}</h3>
                    <p className="text-[12px] text-[#1a1208]/45 font-medium line-clamp-1">{r.cuisine}</p>

                    <div className="flex items-center gap-2.5 mt-auto pt-2.5 border-t border-[#1a1208]/[0.05]">
                      {r.deliveryTime && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1a1208]/50">
                          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                          {r.deliveryTime}
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold ml-auto ${r.minOrder === 0 || !r.minOrder ? "text-[#10b981]" : "text-[#1a1208]/45"}`}>
                        {formatMin(r.minOrder)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── CSS animations ────────────────────────────────────────────────────── */}
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Footer />
    </div>
  );
}
