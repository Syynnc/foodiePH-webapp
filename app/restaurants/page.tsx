"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { ScrollReveal } from "@/app/components/ScrollReveal";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  imageUrl: string | null;
  rating: string | null;
  minOrder: number | null;
  deliveryTime: string | null;
};

const FILTERS = [
  { id: "all",     label: "All"             },
  { id: "pizza",   label: "Pizza & Italian" },
  { id: "asian",   label: "Asian & Sushi"   },
  { id: "burgers", label: "Burgers"         },
  { id: "chicken", label: "Chicken & Filipino" },
];

function matches(r: Restaurant, filterId: string) {
  if (filterId === "all") return true;
  const c = (r.cuisine ?? "").toLowerCase();
  if (filterId === "pizza")   return c.includes("pizza");
  if (filterId === "asian")   return c.includes("asian");
  if (filterId === "burgers") return c.includes("burger");
  if (filterId === "chicken") return c.includes("chicken");
  return true;
}

function formatDelivery(min: number | null) {
  return !min || min === 0 ? "Free delivery" : `₱${min} min. order`;
}

function getCuisineTags(cuisine: string | null) {
  return (cuisine ?? "").split(/[&,]/).map((s) => s.trim()).filter(Boolean);
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[24px] p-4 border border-[#1a1208]/[0.03] animate-pulse">
      <div className="w-full aspect-[4/3] rounded-[16px] bg-[#1a1208]/[0.06] mb-4" />
      <div className="px-1 space-y-2.5">
        <div className="h-3.5 w-3/4 rounded bg-[#1a1208]/[0.06]" />
        <div className="h-3 w-1/2 rounded bg-[#1a1208]/[0.04]" />
        <div className="h-px w-full bg-[#1a1208]/[0.04] my-3" />
        <div className="flex gap-3">
          <div className="h-3 w-24 rounded bg-[#1a1208]/[0.04]" />
          <div className="h-3 w-20 rounded bg-[#1a1208]/[0.04]" />
        </div>
      </div>
    </div>
  );
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.json())
      .then((data) => setRestaurants(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return restaurants
      .filter((r) => matches(r, filter))
      .filter((r) => {
        if (!search.trim()) return true;
        return r.name.toLowerCase().includes(search.toLowerCase()) ||
               (r.cuisine ?? "").toLowerCase().includes(search.toLowerCase());
      });
  }, [restaurants, filter, search]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1208] pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <ScrollReveal>
          <div className="mb-12">
            <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-4">Our Partners</p>
            <h1 className="font-playfair text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight mb-4">
              100+ restaurants,<br />
              <em className="not-italic text-[#c8783a]">one platform.</em>
            </h1>
          </div>
        </ScrollReveal>

        {/* Search + filter row */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 bg-white border border-[#1a1208]/[0.08] rounded-2xl px-4 py-3 focus-within:border-[#1a1208]/25 transition-colors duration-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or cuisine…"
                className="flex-1 text-sm bg-transparent outline-none text-[#1a1208] placeholder:text-[#1a1208]/30 font-medium min-w-0"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  type="button"
                  aria-label="Clear search"
                  title="Clear search"
                  className="text-[#1a1208]/30 hover:text-[#1a1208]/60 transition-colors duration-200"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Cuisine filter pills */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold border uppercase tracking-[0.1em] transition-all duration-300 ${
                    filter === f.id
                      ? "bg-[#1a1208] text-white border-[#1a1208]"
                      : "bg-white text-[#1a1208]/50 border-[#1a1208]/10 hover:border-[#1a1208]/25"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Count */}
        {!loading && (
          <div className="font-semibold text-sm text-[#1a1208]/50 mb-8">
            {filtered.length} {filtered.length === 1 ? "restaurant" : "restaurants"} found
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((rest, i) => (
                <ScrollReveal key={rest.id} delay={i * 60}>
                  <Link href={`/dashboard/restaurant/${rest.id}`} className="block h-full group">
                    <div className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.07)] transition-all duration-500 flex flex-col h-full border border-[#1a1208]/[0.03]">
                      
                      {/* Image */}
                      <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden mb-4 bg-[#f5ede0]">
                        {rest.imageUrl ? (
                          <Image
                            src={rest.imageUrl}
                            alt={rest.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 340px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#1a1208]/15 text-4xl">🍽</div>
                        )}

                        {rest.rating && (
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                            <svg width="10" height="10" fill="#facc15" viewBox="0 0 24 24">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span className="text-[11px] font-bold text-[#1a1208]">{rest.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 px-1">
                        <h3 className="font-bold text-[17px] leading-tight text-[#1a1208] truncate mb-1">{rest.name}</h3>
                        <p className="text-[13px] font-medium text-[#1a1208]/45 mb-3">{rest.cuisine}</p>

                        <div className="flex items-center gap-4 mt-auto mb-4 border-t border-[#1a1208]/[0.04] pt-3.5 text-[#1a1208]/55">
                          <div className="flex items-center gap-1.5">
                            <svg width="13" height="13" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M5 18H3c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1h2l2-4h5l2 4h3c.6 0 1 .4 1 1v4c0 .6-.4 1-1 1h-2"/>
                              <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
                            </svg>
                            <span className="text-[11px] font-bold text-[#10b981]">{formatDelivery(rest.minOrder)}</span>
                          </div>
                          {rest.deliveryTime && (
                            <div className="flex items-center gap-1.5">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                              </svg>
                              <span className="text-[11px] font-bold">{rest.deliveryTime}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {getCuisineTags(rest.cuisine).map((tag) => (
                            <span key={tag} className="bg-[#1a1208]/[0.03] text-[#1a1208]/55 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))
          }
        </div>

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-playfair text-2xl font-semibold text-[#1a1208] mb-2">No results</p>
            <p className="text-sm text-[#1a1208]/40">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}