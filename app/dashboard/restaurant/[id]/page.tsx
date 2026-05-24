"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { Footer } from "@/app/components/Footer";
import { createClient } from "@/lib/supabase/client";

type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  rating?: string | null;
};

type RestaurantData = {
  id: string;
  name: string;
  cuisine: string | null;
  rating: string | null;
  minOrder: number | null;
  deliveryTime: string | null;
  imageUrl: string | null;
};

type MenuCategory = {
  category: string;
  items: MenuItem[];
};

/* ─── Skeleton card ─────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#1a1208]/[0.05] animate-pulse">
      <div className="w-full aspect-[4/3] bg-[#1a1208]/[0.07]" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 w-3/4 rounded-full bg-[#1a1208]/[0.07]" />
        <div className="h-3 w-full rounded-full bg-[#1a1208]/[0.04]" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-16 rounded-full bg-[#1a1208]/[0.07]" />
          <div className="h-8 w-20 rounded-xl bg-[#1a1208]/[0.06]" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */
export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart, updateQty, cart } = useCart();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ── Data fetch ─────────────────────────────────────────────────────── */
  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then((data) => {
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          setMenuCategories(data.menu ?? []);
          if (data.menu?.[0]?.category) setActiveCategory(data.menu[0].category);
        }
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [id]);

  /* ── Check if current user owns this restaurant ─────────────────────── */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch("/api/restaurant/my-restaurants")
        .then((r) => r.ok ? r.json() : [])
        .then((rows: { id: string }[]) => {
          if (Array.isArray(rows) && rows.some((r) => r.id === id)) setIsOwner(true);
        })
        .catch(() => {});
    });
  }, [id]);

  /* ── Scroll tracking ────────────────────────────────────────────────── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const heroH = heroRef.current?.offsetHeight ?? 360;
    setShowStickyNav(el.scrollTop > heroH - 60);

    // active category highlight
    const entries = Object.entries(sectionRefs.current)
      .map(([cat, ref]) => ({ cat, top: ref?.getBoundingClientRect().top ?? Infinity }))
      .sort((a, b) => a.top - b.top);
    const pivot = entries.findIndex((e) => e.top > 100);
    if (pivot > 0) setActiveCategory(entries[pivot - 1].cat);
    else if (pivot === -1 && entries.length > 0) setActiveCategory(entries[entries.length - 1].cat);
    else if (entries[0]) setActiveCategory(entries[0].cat);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function jumpTo(cat: string) {
    const el = sectionRefs.current[cat];
    const container = scrollRef.current;
    if (!el || !container) return;
    const offset = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 64;
    container.scrollTo({ top: offset, behavior: "smooth" });
    setActiveCategory(cat);
  }

  /* ── Cart helpers ────────────────────────────────────────────────────── */
  function handleAdd(item: MenuItem) {
    if (!restaurant) return;
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.imageUrl ?? "", restaurant: restaurant.name, restaurantId: restaurant.id });
    setAddedIds((p) => new Set(p).add(item.id));
    setTimeout(() => setAddedIds((p) => { const n = new Set(p); n.delete(item.id); return n; }), 950);
  }
  const getQty = (itemId: string) => cart.find((i) => i.id === itemId)?.qty ?? 0;

  /* ── Empty states ────────────────────────────────────────────────────── */
  if (!loading && !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-6">
        <div className="w-14 h-14 rounded-2xl bg-[#c8783a]/10 flex items-center justify-center">
          <svg width="24" height="24" fill="none" stroke="#c8783a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
        </div>
        <p className="font-playfair text-xl font-bold text-[#1a1208]">Restaurant not found</p>
        <Link href="/dashboard" className="text-sm font-semibold text-[#c8783a] underline underline-offset-4">← Back to Dashboard</Link>
      </div>
    );
  }

  const allItems = menuCategories.flatMap((c) => c.items);

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto custom-scrollbar bg-[#FDFBF7]">

      {/* ── Sticky category bar (appears after hero scrolls away) ─────── */}
      {showStickyNav && menuCategories.length > 1 && (
        <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#1a1208]/[0.07]">
          <div className="flex items-center gap-1 pl-5 py-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <Link href="/dashboard" className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1a1208]/[0.06] hover:bg-[#1a1208]/10 flex items-center justify-center mr-1 transition-colors">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            {menuCategories.map((g) => (
              <button key={g.category} onClick={() => jumpTo(g.category)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-300 ${activeCategory === g.category ? "bg-[#1a1208] text-[#FDFBF7] shadow-[0_2px_8px_rgba(26,18,8,0.18)]" : "text-[#1a1208]/45 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.05]"}`}>
                {g.category}
              </button>
            ))}
            <span className="flex-shrink-0 w-5" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative w-full h-[360px] md:h-[420px] overflow-hidden bg-[#1a1208]/10 flex-shrink-0">
        {/* Background image */}
        {restaurant?.imageUrl
          ? <Image src={restaurant.imageUrl} alt={restaurant?.name ?? ""} fill className="object-cover scale-[1.02]" priority sizes="100vw" />
          : <div className="w-full h-full bg-gradient-to-br from-[#c8783a]/30 to-[#1a1208]/30" />
        }

        {/* Layered gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0905]/90 via-[#0d0905]/30 to-[#0d0905]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0905]/40 to-transparent" />

        {/* Back button */}
        <Link href="/dashboard"
          className="absolute top-5 left-6 z-10 flex items-center gap-1.5 text-white/85 hover:text-white text-[13px] font-semibold bg-white/10 hover:bg-white/18 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/12 transition-all duration-300">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          Menu
        </Link>

        {/* Owner-only: manage orders button */}
        {isOwner && (
          <Link href="/restaurant/orders"
            className="absolute top-5 right-6 z-10 flex items-center gap-2 text-white/90 hover:text-white text-[13px] font-semibold bg-white/10 hover:bg-white/18 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/12 transition-all duration-300">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
            </svg>
            Manage Orders
          </Link>
        )}

        {/* Restaurant info — bottom left */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 flex items-end justify-between gap-6">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-2.5 animate-pulse">
                <div className="h-9 w-64 rounded-xl bg-white/20" />
                <div className="h-4 w-48 rounded-full bg-white/15" />
              </div>
            ) : (
              <>
                <h1 className="font-playfair text-[2.2rem] md:text-[2.8rem] font-bold text-white leading-[1.1] mb-2.5 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  {restaurant?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {restaurant?.cuisine && (
                    <span className="text-white/70 text-[13px] font-medium">{restaurant.cuisine}</span>
                  )}
                  {restaurant?.rating && (
                    <>
                      <span className="text-white/25 text-[10px]">·</span>
                      <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[12px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                        <svg width="10" height="10" fill="#facc15" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {restaurant.rating}
                      </span>
                    </>
                  )}
                  {restaurant?.deliveryTime && (
                    <>
                      <span className="text-white/25 text-[10px]">·</span>
                      <span className="flex items-center gap-1.5 text-white/70 text-[12px] font-medium">
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {restaurant.deliveryTime}
                      </span>
                    </>
                  )}
                  {restaurant?.minOrder && restaurant.minOrder > 0 && (
                    <>
                      <span className="text-white/25 text-[10px]">·</span>
                      <span className="text-white/70 text-[12px] font-medium">₱{restaurant.minOrder} min.</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Item count pill — top right of bottom strip */}
          {!loading && allItems.length > 0 && (
            <div className="flex-shrink-0 text-right">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/12 text-white/80 text-[12px] font-semibold px-3 py-1.5 rounded-full">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {allItems.length} items
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category tabs (below hero) ────────────────────────────────────── */}
      {(menuCategories.length > 1 || loading) && (
        <div ref={tabsRef} className="bg-[#FDFBF7] border-b border-[#1a1208]/[0.06] pl-5 flex items-center gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-7 rounded-full bg-[#1a1208]/[0.06] animate-pulse flex-shrink-0" style={{ width: 52 + i * 12 }} />
              ))
            : menuCategories.map((g) => (
                <button key={g.category} onClick={() => jumpTo(g.category)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-300 whitespace-nowrap ${activeCategory === g.category ? "bg-[#1a1208] text-[#FDFBF7] shadow-[0_2px_8px_rgba(26,18,8,0.18)]" : "text-[#1a1208]/45 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.05]"}`}>
                  {g.category}
                </button>
              ))
          }
          <span className="flex-shrink-0 w-5" aria-hidden="true" />
        </div>
      )}

      {/* ── Menu grid ────────────────────────────────────────────────────── */}
      <div className="px-5 md:px-7 py-6 space-y-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#c8783a]/10 flex items-center justify-center mb-4">
              <svg width="26" height="26" fill="none" stroke="#c8783a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">No items yet</p>
            <p className="text-sm text-[#1a1208]/40">This restaurant hasn&apos;t added any menu items.</p>
          </div>
        ) : (
          menuCategories.map((cat) => (
            <section key={cat.category} ref={(el) => { sectionRefs.current[cat.category] = el; }}>

              {/* Category heading */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-playfair text-[1.15rem] font-bold text-[#1a1208] whitespace-nowrap">{cat.category}</h2>
                <div className="flex-1 h-px bg-[#1a1208]/[0.08]" />
                <span className="text-[11px] font-bold text-[#1a1208]/20 uppercase tracking-widest">{cat.items.length}</span>
              </div>

              {/* Cards grid — uses full width */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {cat.items.map((item) => {
                  const qty = getQty(item.id);
                  const justAdded = addedIds.has(item.id);

                  return (
                    <div key={item.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-[#1a1208]/[0.05] hover:border-[#1a1208]/[0.10] hover:shadow-[0_8px_32px_rgba(26,18,8,0.09)] transition-all duration-300 flex flex-col">

                      {/* Food photo */}
                      <div className="relative w-full aspect-[4/3] bg-[#f5ede0] overflow-hidden flex-shrink-0">
                        {item.imageUrl
                          ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                          : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg width="32" height="32" fill="none" stroke="#c8783a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="opacity-30">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                              </svg>
                            </div>
                          )
                        }
                        {/* Rating badge */}
                        {item.rating && (
                          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-[#0d0905]/50 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            <svg width="8" height="8" fill="#facc15" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {item.rating}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 p-3 gap-2">
                        <div className="flex-1">
                          <p className="text-[13px] font-bold text-[#1a1208] leading-snug line-clamp-2">{item.name}</p>
                          {item.description && (
                            <p className="text-[11px] text-[#1a1208]/40 font-light mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                          )}
                        </div>

                        {/* Price + action */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="font-bold text-[15px] text-[#1a1208] leading-none">₱{item.price.toLocaleString()}</span>

                          <button type="button" onClick={() => handleAdd(item)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex-shrink-0 ${
                              justAdded
                                ? "bg-[#10b981] text-white shadow-[0_3px_10px_rgba(16,185,129,0.25)] scale-95"
                                : "bg-[#1a1208]/[0.06] text-[#1a1208] hover:bg-[#c8783a] hover:text-white hover:shadow-[0_4px_14px_rgba(200,120,58,0.30)] active:scale-95"
                            }`}>
                            {justAdded
                              ? <><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Added</>
                              : <><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add</>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Bottom breathing room */}
      <div className="h-8" />

      <Footer />
    </div>
  );
}
