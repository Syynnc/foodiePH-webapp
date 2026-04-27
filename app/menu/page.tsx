"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  rating: string | null;
  restaurantId: string;
  restaurantName?: string;
};

type GroupedCategory = {
  label: string;
  cuisine: string;
  color: string;
  accent: string;
  items: MenuItem[];
};

const CATEGORY_CLEAN: Record<string, string> = {
  "Pizza": "Pizza",
  "Pasta": "Pasta",
  "Sides": "Sides",
  "Sushi": "Sushi",
  "Sashimi": "Sashimi",
  "Rolls": "Rolls",
  "Noodles": "Noodles",
  "Dim Sum": "Dim Sum",
  "Rice Bowls": "Rice Bowls",
  "Burgers": "Burgers",
  "Chicken": "Chicken",
  "Burritos": "Burritos",
  "Grills": "Grills",
  "Mains": "Mains",
  "Meals": "Meals",
  "Drinks": "Drinks",
  "Desserts": "Desserts",
  "Starters": "Starters",
};

function formatPrice(price: number) {
  return `₱${price.toLocaleString()}`;
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="group bg-white rounded-2xl p-4 border border-[#1a1208]/[0.05] hover:border-[#1a1208]/[0.11] hover:shadow-[0_10px_32px_rgba(26,18,8,0.07)] transition-all duration-500 flex gap-4">
      <div className="relative w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0 bg-[#f5ede0] img-shimmer">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-[1.07] transition-transform duration-600 ease-[cubic-bezier(0.32,0.72,0,1)]"
            sizes="88px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-15">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
        <div>
          <h4 className="font-semibold text-[13.5px] text-[#1a1208] leading-snug truncate mb-0.5">{item.name}</h4>
          {item.description && (
            <p className="text-[11px] text-[#1a1208]/40 leading-[1.65] line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-playfair font-bold text-[15px] text-[#c8783a]">{formatPrice(item.price)}</span>
          {item.rating && (
            <div className="flex items-center gap-1">
              <svg width="9" height="9" fill="#facc15" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[10px] font-bold text-[#1a1208]/45">{item.rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonItem() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#1a1208]/[0.04] flex gap-4 animate-pulse">
      <div className="w-[88px] h-[88px] rounded-xl bg-[#1a1208]/[0.06] flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-[#1a1208]/[0.06] rounded-full w-3/4" />
        <div className="h-2.5 bg-[#1a1208]/[0.04] rounded-full w-full" />
        <div className="h-2.5 bg-[#1a1208]/[0.04] rounded-full w-2/3" />
        <div className="h-3 bg-[#1a1208]/[0.05] rounded-full w-1/4 mt-3" />
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [categories, setCategories] = useState<GroupedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed");
        const data: GroupedCategory[] = await res.json();
        setCategories(data);
        if (data[0]) setActiveTab(data[0].cuisine);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleCategories =
    activeTab === "all"
      ? categories
      : categories.filter((c) => c.cuisine === activeTab);

  const totalItems = categories.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFBF7] text-[#1a1208] pt-28 pb-24">

        {/* ── Page hero ── */}
        <div className="px-6 md:px-10 mb-10">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-4">Our Menu</p>
                  <h1 className="font-playfair text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight mb-3">
                    Everything on the menu,<br />
                    <em className="not-italic text-[#c8783a]">in one place.</em>
                  </h1>
                  <p className="text-[#1a1208]/50 text-base font-light leading-[1.8]">
                    Browse dishes from all our partner restaurants. Filter by cuisine to find what you&apos;re craving.
                  </p>
                </div>
                {!loading && !error && totalItems > 0 && (
                  <div className="hidden md:flex flex-shrink-0 items-center gap-3 bg-[#1a1208]/[0.03] border border-[#1a1208]/[0.06] rounded-2xl px-5 py-4">
                    <div>
                      <p className="font-playfair text-[1.9rem] font-bold text-[#c8783a] leading-none">{totalItems}</p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#1a1208]/40 mt-0.5">Dishes available</p>
                    </div>
                    <div className="w-px h-10 bg-[#1a1208]/[0.08]" />
                    <div>
                      <p className="font-playfair text-[1.9rem] font-bold text-[#1a1208] leading-none">{categories.length}</p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#1a1208]/40 mt-0.5">Cuisines</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-10 flex flex-col md:flex-row gap-10">

          {/* ── Sidebar filters (desktop) ── */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-28 space-y-1">
              <p className="text-[9px] uppercase tracking-[0.22em] font-medium text-[#1a1208]/35 px-3 py-2 mb-1">
                Filter by Cuisine
              </p>
              <button
                onClick={() => setActiveTab("all")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  activeTab === "all"
                    ? "bg-[#1a1208] text-white"
                    : "text-[#1a1208]/55 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.05]"
                }`}
              >
                All Cuisines
                {!loading && (
                  <span className="ml-1.5 text-[10px] opacity-50">({totalItems})</span>
                )}
              </button>
              {!loading && categories.map((cat) => (
                <button
                  key={cat.cuisine}
                  onClick={() => setActiveTab(cat.cuisine)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                    activeTab === cat.cuisine
                      ? "bg-[#1a1208] text-white"
                      : "text-[#1a1208]/55 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.05]"
                  }`}
                >
                  {cat.cuisine}
                  <span className="ml-1.5 text-[10px] opacity-50">({cat.items.length})</span>
                </button>
              ))}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 rounded-xl bg-[#1a1208]/[0.05] animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          </aside>

          {/* ── Mobile pill filters ── */}
          <div className="md:hidden mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                  activeTab === "all"
                    ? "bg-[#1a1208] text-white border-[#1a1208]"
                    : "bg-white text-[#1a1208]/55 border-[#1a1208]/10 hover:border-[#1a1208]/25"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.cuisine}
                  onClick={() => setActiveTab(cat.cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                    activeTab === cat.cuisine
                      ? "bg-[#1a1208] text-white border-[#1a1208]"
                      : "bg-white text-[#1a1208]/55 border-[#1a1208]/10 hover:border-[#1a1208]/25"
                  }`}
                >
                  {cat.cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Loading */}
            {loading && (
              <div className="space-y-12">
                {[5, 4].map((count, gi) => (
                  <div key={gi}>
                    <div className="h-4 w-24 rounded-full bg-[#1a1208]/[0.07] animate-pulse mb-6" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.from({ length: count }).map((_, i) => (
                        <SkeletonItem key={i} />
                      ))}
                    </div>
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
                <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">Could not load menu</p>
                <p className="text-sm text-[#1a1208]/40">Please refresh the page to try again.</p>
              </div>
            )}

            {/* Categories */}
            {!loading && !error && visibleCategories.map((cuisine, ci) => (
              <ScrollReveal key={cuisine.cuisine} delay={ci * 55}>
                <div className="mb-14">
                  <div className="flex items-center gap-4 mb-7">
                    <div
                      className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em]"
                      style={{ background: cuisine.color + "99", color: cuisine.accent }}
                    >
                      {cuisine.cuisine}
                    </div>
                    <div className="flex-1 h-px bg-[#1a1208]/[0.06]" />
                    <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[#1a1208]/30">
                      {cuisine.items.length} dishes
                    </span>
                  </div>

                  {Object.entries(
                    cuisine.items.reduce<Record<string, MenuItem[]>>((acc, item) => {
                      const key = item.category ?? "Other";
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(item);
                      return acc;
                    }, {})
                  ).map(([catName, items]) => (
                    <div key={catName} className="mb-8">
                      <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#1a1208]/35 mb-4 pl-1">
                        {CATEGORY_CLEAN[catName] ?? catName}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map((item) => (
                          <MenuItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            ))}

            {/* Empty */}
            {!loading && !error && visibleCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#c8783a]/[0.07] flex items-center justify-center mb-4">
                  <svg width="28" height="28" fill="none" stroke="#c8783a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">Nothing here yet</p>
                <p className="text-sm text-[#1a1208]/40">Check back soon — our partners are always adding new dishes.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── CTA strip ── */}
        <div className="max-w-5xl mx-auto px-6 md:px-10 mt-16">
          <ScrollReveal>
            <div className="bg-[#1a1208] rounded-[1.75rem] px-8 md:px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden">
              <div
                className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(200,120,58,0.18) 0%, transparent 70%)" }}
              />
              <div className="relative">
                <p className="font-playfair text-[1.6rem] font-bold text-white mb-2">Hungry and ready to order?</p>
                <p className="text-white/40 text-sm font-light leading-relaxed">
                  Sign in or create an account to start ordering from your favourite restaurants.
                </p>
              </div>
              <Link
                href="/auth?tab=signup"
                className="relative flex-shrink-0 flex items-center gap-2 bg-[#c8783a] text-white rounded-full px-7 py-3.5 text-sm font-semibold hover:bg-[#b5692e] transition-colors duration-300 active:scale-[0.97]"
              >
                Order Now
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>

      </div>
      <Footer />
    </>
  );
}
