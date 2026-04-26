"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ScrollReveal } from "@/app/components/ScrollReveal";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Category config ───────────────────────────────────────────────────────────
// `match` is compared against the cuisine column value (case-insensitive includes)

const CATEGORIES = [
  {
    id: "all",
    label: "All Spots",
    match: null,
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/>
        <path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/>
      </svg>
    ),
  },
  {
    id: "pizza",
    label: "Pizza & Italian",
    match: "pizza",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2C7.03 2 3 6.03 3 11c0 5 9 11 9 11s9-6 9-11c0-4.97-4.03-9-9-9z"/>
        <path d="M12 2v20"/><path d="M3 11h18"/>
        <circle cx="9" cy="8" r="1"/><circle cx="14" cy="14" r="1"/>
        <circle cx="10" cy="15" r="1"/><circle cx="15" cy="8" r="1"/>
      </svg>
    ),
  },
  {
    id: "asian",
    label: "Asian & Sushi",
    match: "asian",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2v20"/><path d="M2.5 9.5 12 4l9.5 5.5"/>
        <path d="M2.5 14.5 12 20l9.5-5.5"/>
      </svg>
    ),
  },
  {
    id: "burgers",
    label: "Burgers & Fast Food",
    match: "burger",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M2 14h20"/><path d="M22 14v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4"/>
        <path d="M2 14a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2"/>
        <path d="M12 4c-4.4 0-8 3.1-8 7h16c0-3.9-3.6-7-8-7z"/>
      </svg>
    ),
  },
  {
    id: "chicken",
    label: "Chicken & Filipino",
    match: "chicken",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="m14 6-2 2"/><path d="M2 10a10 10 0 1 1 20 0"/>
        <path d="M12 12c-1.1 0-2-.9-2-2"/>
      </svg>
    ),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesCategory(restaurant: Restaurant, categoryId: string): boolean {
  if (categoryId === "all") return true;
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat?.match) return true;
  return (restaurant.cuisine ?? "").toLowerCase().includes(cat.match);
}

function formatDelivery(minOrder: number | null): string {
  if (!minOrder || minOrder === 0) return "Free delivery";
  return `₱${minOrder} min. order`;
}

function getCuisineTags(cuisine: string | null): string[] {
  if (!cuisine) return [];
  // e.g. "Chicken & Filipino" → ["Chicken", "Filipino"]
  return cuisine
    .split(/[&,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[24px] p-4 border border-[#1a1208]/[0.03] animate-pulse">
      <div className="w-full aspect-[4/3] rounded-[16px] bg-[#1a1208]/[0.06] mb-4" />
      <div className="px-1 space-y-3">
        <div className="h-4 w-3/4 rounded bg-[#1a1208]/[0.06]" />
        <div className="h-3 w-1/2 rounded bg-[#1a1208]/[0.04]" />
        <div className="h-px w-full bg-[#1a1208]/[0.04] my-2" />
        <div className="flex gap-3">
          <div className="h-3 w-24 rounded bg-[#1a1208]/[0.04]" />
          <div className="h-3 w-20 rounded bg-[#1a1208]/[0.04]" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch("/api/restaurants");
        if (!res.ok) throw new Error("Failed to fetch restaurants");
        const data: Restaurant[] = await res.json();
        setRestaurants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter((r) => matchesCategory(r, activeCategory));

  return (
    <div className="h-full overflow-y-auto px-8 lg:px-16 py-8 custom-scrollbar max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10 text-center sm:text-left flex flex-col justify-center sm:block">
        <h1 className="font-playfair text-4xl font-bold tracking-tight text-[#1a1208] mb-2 mt-4">
          Restaurants available
        </h1>
        <p className="text-[#1a1208]/60 text-[16px] font-medium max-w-xl">
          Find your favorite spots near you and order in seconds. Hand-picked and delivered hot to your door.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-14 pb-4">
        {CATEGORIES.map((cat, i) => {
          const isActive = activeCategory === cat.id;
          return (
            <ScrollReveal key={cat.id} delay={i * 50}>
              <button
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-[18px] border transition-all duration-300 whitespace-nowrap group focus:outline-none ${
                  isActive
                    ? "bg-[#1a1208] text-white border-[#1a1208] shadow-[0_8px_20px_rgba(26,18,8,0.2)] scale-[1.02]"
                    : "bg-white text-[#1a1208]/60 border-[#1a1208]/[0.05] hover:border-[#1a1208]/20 hover:text-[#1a1208] hover:bg-[#FDFBF7]"
                }`}
              >
                <div
                  className={`flex items-center justify-center transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {cat.icon}
                </div>
                <span className="text-[14px] font-bold tracking-tight">{cat.label}</span>
              </button>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Count */}
      {!loading && !error && (
        <div className="font-bold text-[18px] text-[#1a1208] mb-6">
          {filtered.length} {filtered.length === 1 ? "Spot" : "Spots"} Found
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
          </div>
          <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">Couldn&apos;t load restaurants</p>
          <p className="text-sm text-[#1a1208]/45">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-[#1a1208]/[0.04] flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ opacity: 0.3 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">No spots here yet</p>
          <p className="text-sm text-[#1a1208]/45">Try a different category.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 pb-20">

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}

        {/* Restaurant cards */}
        {!loading &&
          !error &&
          filtered.map((rest, i) => (
            <ScrollReveal key={rest.id} delay={i * 80}>
              <Link href={`/dashboard/restaurant/${rest.id}`} className="block h-full group">
                <div className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full border border-[#1a1208]/[0.03]">

                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden mb-4 bg-[#FDFBF7]">
                    {rest.imageUrl ? (
                      <Image
                        src={rest.imageUrl}
                        alt={rest.name}
                        fill
                        className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#1a1208]/20">
                        <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="3"/><path d="m9 9 6 6m0-6-6 6"/>
                        </svg>
                      </div>
                    )}

                    {/* Rating Bubble */}
                    {rest.rating && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                        <svg width="10" height="10" fill="#facc15" viewBox="0 0 24 24">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span className="text-[12px] font-bold text-[#1a1208]">{rest.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 px-1">
                    <h3 className="font-bold text-[18px] leading-tight text-[#1a1208] truncate mb-1">
                      {rest.name}
                    </h3>
                    <p className="text-[14px] font-medium text-[#1a1208]/50 mb-3">
                      {rest.cuisine}
                    </p>

                    <div className="flex items-center gap-4 text-[#1a1208]/60 mt-auto mb-4 border-t border-[#1a1208]/[0.04] pt-4">
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M5 18H3c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1h2l2-4h5l2 4h3c.6 0 1 .4 1 1v4c0 .6-.4 1-1 1h-2"/>
                          <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
                        </svg>
                        <span className="text-[12px] font-bold tracking-tight text-[#10b981]">
                          {formatDelivery(rest.minOrder)}
                        </span>
                      </div>
                      {rest.deliveryTime && (
                        <div className="flex items-center gap-1.5">
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                          </svg>
                          <span className="text-[12px] font-bold tracking-tight">{rest.deliveryTime}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getCuisineTags(rest.cuisine).map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#1a1208]/[0.03] text-[#1a1208]/60 text-[10.5px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
      </div>
    </div>
  );
}