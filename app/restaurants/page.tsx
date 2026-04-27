"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  imageUrl: string | null;
  rating: string | null;
  minOrder: number | null;
  deliveryTime: string | null;
};

const CUISINE_FILTERS = [
  "All",
  "Italian",
  "Japanese",
  "American",
  "Mexican",
  "Chinese",
  "Filipino",
];

function StarIcon() {
  return (
    <svg width="10" height="10" fill="#facc15" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      href={`/dashboard/restaurant/${restaurant.id}`}
      className="group block bg-white rounded-[1.5rem] overflow-hidden border border-[#1a1208]/[0.06] hover:border-[#1a1208]/[0.12] hover:shadow-[0_16px_44px_rgba(26,18,8,0.08)] hover:-translate-y-0.5 transition-all duration-500"
    >
      <div className="relative h-[200px] overflow-hidden bg-[#f5ede0] img-shimmer">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#c8783a]/15 to-[#1a1208]/10 flex items-center justify-center">
            <svg width="36" height="36" fill="none" stroke="#1a1208" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="opacity-15">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {restaurant.cuisine && (
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] bg-[#FDFBF7]/90 backdrop-blur-md text-[#1a1208] px-3 py-1.5 rounded-full border border-[#1a1208]/[0.06] shadow-[0_2px_8px_rgba(26,18,8,0.1)]">
              {restaurant.cuisine}
            </span>
          </div>
        )}
        {restaurant.rating && (
          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1.5 text-[11px] font-bold bg-[#FDFBF7]/90 backdrop-blur-md text-[#1a1208] px-2.5 py-1.5 rounded-full border border-[#1a1208]/[0.06] shadow-[0_2px_8px_rgba(26,18,8,0.1)]">
              <StarIcon />
              {restaurant.rating}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-playfair text-[1.15rem] font-bold text-[#1a1208] leading-snug group-hover:text-[#c8783a] transition-colors duration-400">
            {restaurant.name}
          </h3>
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="#1a1208"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-400 -translate-x-1 group-hover:translate-x-0"
          >
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {restaurant.deliveryTime && (
            <span className="flex items-center gap-1.5 text-[11.5px] text-[#1a1208]/50">
              <ClockIcon />
              {restaurant.deliveryTime}
            </span>
          )}
          {restaurant.deliveryTime && restaurant.minOrder && restaurant.minOrder > 0 && (
            <span className="w-1 h-1 rounded-full bg-[#1a1208]/20" />
          )}
          {restaurant.minOrder && restaurant.minOrder > 0 && (
            <span className="text-[11.5px] text-[#1a1208]/50">
              ₱{restaurant.minOrder.toLocaleString()} min.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[1.5rem] overflow-hidden border border-[#1a1208]/[0.05] animate-pulse">
      <div className="h-[200px] bg-[#1a1208]/[0.06]" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-[#1a1208]/[0.07] rounded-full" />
        <div className="h-3 w-1/2 bg-[#1a1208]/[0.04] rounded-full" />
      </div>
    </div>
  );
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data: Restaurant[]) => setRestaurants(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.cuisine ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCuisine =
      activeCuisine === "All" ||
      (r.cuisine ?? "").toLowerCase().includes(activeCuisine.toLowerCase());
    return matchSearch && matchCuisine;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFBF7] text-[#1a1208] pt-28 pb-24">

        {/* ── Hero ── */}
        <div className="px-6 md:px-10 mb-12">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-4">Our Partners</p>
                  <h1 className="font-playfair text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight mb-3">
                    100+ restaurants,<br />
                    <em className="not-italic text-[#c8783a]">one platform.</em>
                  </h1>
                  <p className="text-[#1a1208]/50 text-base font-light leading-[1.8] max-w-md">
                    Every restaurant here is hand-picked, reviewed in person, and held to our quality standards before going live.
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 flex-shrink-0">
                  <div className="text-center">
                    <p className="font-playfair text-[2.4rem] font-bold text-[#c8783a] leading-none">{loading ? "—" : restaurants.length}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#1a1208]/40 mt-1">Active</p>
                  </div>
                  <div className="w-px bg-[#1a1208]/[0.08]" />
                  <div className="text-center">
                    <p className="font-playfair text-[2.4rem] font-bold text-[#1a1208] leading-none">30min</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#1a1208]/40 mt-1">Avg. delivery</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* ── Search + Filters ── */}
        <div className="px-6 md:px-10 mb-10">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#1a1208"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search restaurants or cuisines…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#1a1208]/[0.09] rounded-full text-[#1a1208] placeholder-[#1a1208]/30 focus:outline-none focus:border-[#1a1208]/25 transition-colors duration-300"
                  />
                </div>

                {/* Cuisine pills */}
                <div className="flex flex-wrap gap-2">
                  {CUISINE_FILTERS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCuisine(c)}
                      className={`px-4 py-2 rounded-full text-[12.5px] font-medium border transition-all duration-300 ${
                        activeCuisine === c
                          ? "bg-[#1a1208] text-white border-[#1a1208]"
                          : "bg-white text-[#1a1208]/55 border-[#1a1208]/10 hover:border-[#1a1208]/25"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="px-6 md:px-10">
          <div className="max-w-5xl mx-auto">

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ animationDelay: `${i * 60}ms` }}>
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                  <svg width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">Could not load restaurants</p>
                <p className="text-sm text-[#1a1208]/40">Please refresh the page to try again.</p>
              </div>
            )}

            {/* Empty search result */}
            {!loading && !error && filtered.length === 0 && restaurants.length > 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#c8783a]/[0.07] flex items-center justify-center mb-4">
                  <svg width="24" height="24" fill="none" stroke="#c8783a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">No results found</p>
                <p className="text-sm text-[#1a1208]/40 mb-4">Try a different search term or cuisine filter.</p>
                <button
                  onClick={() => { setSearch(""); setActiveCuisine("All"); }}
                  className="text-sm font-semibold text-[#c8783a] hover:text-[#b5692e] transition-colors underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Empty DB */}
            {!loading && !error && restaurants.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">No restaurants yet</p>
                <p className="text-sm text-[#1a1208]/40">Check back soon — we&apos;re onboarding new partners daily.</p>
              </div>
            )}

            {/* Results */}
            {!loading && !error && filtered.length > 0 && (
              <>
                {(search || activeCuisine !== "All") && (
                  <p className="text-sm text-[#1a1208]/40 mb-6">
                    {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} found
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((r, i) => (
                    <ScrollReveal key={r.id} delay={i * 50}>
                      <RestaurantCard restaurant={r} />
                    </ScrollReveal>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>

        {/* ── Why our restaurants ── */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="px-6 md:px-10 mt-24">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <div className="border-t border-[#1a1208]/[0.07] pt-14">
                  <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-6">The Foodie.ph Standard</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                      {
                        title: "In-Person Review",
                        body: "Every restaurant is visited and assessed by our team before listing. No shortcuts, no third-party audits.",
                      },
                      {
                        title: "Trained Riders",
                        body: "Our delivery riders are trained, insured, and equipped with thermal bags to keep every order at the right temperature.",
                      },
                      {
                        title: "Live Support",
                        body: "Something goes wrong? Our support team responds in under 5 minutes during operating hours.",
                      },
                    ].map((item, i) => (
                      <div key={item.title} className="flex gap-4">
                        <span className="font-playfair text-[1.8rem] font-bold text-[#c8783a]/30 leading-none flex-shrink-0 pt-0.5">0{i + 1}</span>
                        <div>
                          <p className="font-semibold text-[#1a1208] text-sm mb-1.5">{item.title}</p>
                          <p className="text-[12.5px] text-[#1a1208]/45 font-light leading-[1.78]">{item.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* ── Partner CTA ── */}
        <div className="px-6 md:px-10 mt-16">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="rounded-[1.75rem] bg-[#1a1208]/[0.03] border border-[#1a1208]/[0.07] px-8 md:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">Own a restaurant in Manila or Cebu?</p>
                  <p className="text-sm text-[#1a1208]/45 font-light">Apply to join our platform and reach thousands of corporate clients.</p>
                </div>
                <Link
                  href="/auth?tab=signup"
                  className="flex-shrink-0 flex items-center gap-2 bg-[#c8783a] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#b5692e] transition-colors duration-300 active:scale-[0.97]"
                >
                  Apply as Partner
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
