"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ScrollReveal } from "@/app/components/ScrollReveal";

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

const CATEGORY_LABELS: Record<string, string> = {
  "Pizza":     "🍕 Pizza",
  "Pasta":     "🍝 Pasta",
  "Sides":     "🥗 Sides",
  "Sushi":     "🍣 Sushi",
  "Sashimi":   "🐟 Sashimi",
  "Rolls":     "🌀 Rolls",
  "Noodles":   "🍜 Noodles",
  "Dim Sum":   "🥟 Dim Sum",
  "Rice Bowls": "🍚 Rice",
  "Burgers":   "🍔 Burgers",
  "Chicken":   "🍗 Chicken",
  "Burritos":  "🌯 Burritos",
  "Grills":    "🔥 Grills",
  "Mains":     "🍽 Mains",
  "Meals":     "📦 Meals",
  "Drinks":    "🥤 Drinks",
  "Desserts":  "🍮 Desserts",
  "Starters":  "🥗 Starters",
};

function formatPrice(price: number) {
  return `₱${price.toLocaleString()}`;
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="group bg-white rounded-2xl p-3.5 border border-[#1a1208]/[0.04] hover:border-[#1a1208]/[0.10] hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] transition-all duration-500 flex gap-3.5">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#f5ede0]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1a1208]/20 text-2xl">🍽</div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0 justify-between">
        <div>
          <h4 className="font-semibold text-[13.5px] text-[#1a1208] leading-snug truncate">{item.name}</h4>
          {item.description && (
            <p className="text-[11px] text-[#1a1208]/45 leading-relaxed mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-playfair font-bold text-[15px] text-[#c8783a]">{formatPrice(item.price)}</span>
          {item.rating && (
            <div className="flex items-center gap-1">
              <svg width="9" height="9" fill="#facc15" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span className="text-[10px] font-semibold text-[#1a1208]/50">{item.rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [categories, setCategories] = useState<GroupedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed");
        const data: GroupedCategory[] = await res.json();
        setCategories(data);
        if (data[0]) setActiveTab(data[0].cuisine);
      } catch {
        // silent — empty state handles it
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleCategories = activeTab === "all"
    ? categories
    : categories.filter((c) => c.cuisine === activeTab);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1208] pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <ScrollReveal>
          <div className="mb-14">
            <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-4">Our Menu</p>
            <h1 className="font-playfair text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight mb-4">
              Everything on the menu,<br />
              <em className="not-italic text-[#c8783a]">in one place.</em>
            </h1>
            <p className="text-[#1a1208]/50 text-base font-light leading-[1.8] max-w-md">
              Browse dishes from all our partner restaurants. Filter by cuisine to find exactly what you&apos;re craving.
            </p>
          </div>
        </ScrollReveal>

        {/* Cuisine tab filters */}
        <ScrollReveal>
          <div className="flex flex-wrap gap-2 mb-14">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                activeTab === "all"
                  ? "bg-[#1a1208] text-white border-[#1a1208]"
                  : "bg-white text-[#1a1208]/55 border-[#1a1208]/10 hover:border-[#1a1208]/25"
              }`}
            >
              All Cuisines
            </button>
            {categories.map((cat) => (
              <button
                key={cat.cuisine}
                onClick={() => setActiveTab(cat.cuisine)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                  activeTab === cat.cuisine
                    ? "bg-[#1a1208] text-white border-[#1a1208]"
                    : "bg-white text-[#1a1208]/55 border-[#1a1208]/10 hover:border-[#1a1208]/25"
                }`}
              >
                {cat.cuisine}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5 border border-[#1a1208]/[0.04] flex gap-3.5 animate-pulse">
                <div className="w-20 h-20 rounded-xl bg-[#1a1208]/[0.06] flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-[#1a1208]/[0.06] rounded w-3/4" />
                  <div className="h-2.5 bg-[#1a1208]/[0.04] rounded w-full" />
                  <div className="h-2.5 bg-[#1a1208]/[0.04] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {!loading && visibleCategories.map((cuisine, ci) => (
          <ScrollReveal key={cuisine.cuisine} delay={ci * 60}>
            <div className="mb-16">
              {/* Cuisine heading */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ background: cuisine.color + "aa", color: cuisine.accent }}
                >
                  {cuisine.cuisine}
                </div>
                <div className="flex-1 h-px bg-[#1a1208]/[0.06]" />
                <Link
                  href={`#restaurants`}
                  className="text-[10px] uppercase tracking-[0.18em] font-medium text-[#1a1208]/35 hover:text-[#c8783a] transition-colors duration-300"
                >
                  {cuisine.label}
                </Link>
              </div>

              {/* Sub-categories */}
              {Object.entries(
                cuisine.items.reduce<Record<string, MenuItem[]>>((acc, item) => {
                  const key = item.category ?? "Other";
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(item);
                  return acc;
                }, {})
              ).map(([catName, items]) => (
                <div key={catName} className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1208]/40 mb-4">
                    {CATEGORY_LABELS[catName] ?? catName}
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
        {!loading && visibleCategories.length === 0 && (
          <div className="text-center py-24">
            <p className="font-playfair text-2xl font-semibold text-[#1a1208] mb-2">Nothing here yet</p>
            <p className="text-sm text-[#1a1208]/40">Check back soon — our partners are always adding new dishes.</p>
          </div>
        )}
      </div>
    </div>
  );
}