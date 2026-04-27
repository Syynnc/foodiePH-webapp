"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  rating: string | null;
};

type MenuGroup = {
  category: string;
  items: MenuItem[];
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  imageUrl: string | null;
  rating: string | null;
  minOrder: number | null;
  deliveryTime: string | null;
};

function SkeletonCard() {
  return (
    <div className="flex gap-4 p-5 bg-white rounded-2xl border border-[#1a1208]/[0.05] animate-pulse">
      <div className="flex-1 space-y-3">
        <div className="h-4 w-3/4 rounded-full bg-[#1a1208]/[0.07]" />
        <div className="h-3 w-full rounded-full bg-[#1a1208]/[0.04]" />
        <div className="h-3 w-2/3 rounded-full bg-[#1a1208]/[0.04]" />
        <div className="h-5 w-1/4 rounded-full bg-[#1a1208]/[0.07] mt-4" />
      </div>
      <div className="w-[100px] h-[100px] rounded-xl bg-[#1a1208]/[0.07] flex-shrink-0" />
    </div>
  );
}

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [headerVisible, setHeaderVisible] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addToCart, updateQty, cart, cartTotal, setIsCartOpen: openGlobalCart } = useCart();

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    fetch(`/api/restaurants/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(({ restaurant, menu }) => {
        setRestaurant(restaurant);
        setMenu(menu);
        if (menu?.[0]?.category) setActiveCategory(menu[0].category);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollY = container.scrollTop;

    // Show compact header after hero
    const heroHeight = heroRef.current?.offsetHeight ?? 300;
    setHeaderVisible(scrollY > heroHeight - 80);

    // Highlight active category
    const offsets = Object.entries(categoryRefs.current)
      .map(([cat, el]) => ({ cat, top: el ? el.getBoundingClientRect().top : Infinity }))
      .sort((a, b) => a.top - b.top);

    const active = offsets.find((o) => o.top > 120) ?? offsets[offsets.length - 1];
    const previous = offsets[offsets.indexOf(active ?? offsets[0]) - 1];
    if (previous) setActiveCategory(previous.cat);
    else if (offsets[0]) setActiveCategory(offsets[0].cat);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function scrollToCategory(cat: string) {
    const el = categoryRefs.current[cat];
    const container = scrollContainerRef.current;
    if (!el || !container) return;
    const offset = el.offsetTop - 120;
    container.scrollTo({ top: offset, behavior: "smooth" });
    setActiveCategory(cat);
  }

  function handleAdd(item: MenuItem) {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.imageUrl ?? "",
      restaurant: restaurant?.name ?? "",
      restaurantId: params.id,
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 900);
  }

  function getQty(itemId: string) {
    return cart.find((i) => i.id === itemId)?.qty ?? 0;
  }

  if (!loading && !restaurant) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="font-playfair text-2xl font-bold text-[#1a1208]">Restaurant not found</p>
        <p className="text-sm text-[#1a1208]/40">It may have been removed or is no longer active.</p>
        <Link href="/dashboard" className="mt-2 text-sm font-semibold text-[#c8783a] underline underline-offset-4">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="relative min-h-screen bg-[#FDFBF7] overflow-y-auto">

      {/* ── Compact sticky header (appears after hero) ──────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          headerVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="bg-[#FDFBF7]/90 backdrop-blur-xl border-b border-[#1a1208]/[0.06] px-5 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1208]/[0.05] hover:bg-[#1a1208]/[0.09] transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <span className="font-playfair font-bold text-[#1a1208] text-lg leading-none">
              {loading ? "Loading…" : restaurant?.name}
            </span>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => openGlobalCart(true)}
              className="flex items-center gap-2 bg-[#c8783a] text-white text-[13px] font-semibold px-4 py-2 rounded-full"
            >
              <span className="w-5 h-5 rounded-full bg-white/20 text-[11px] font-bold flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
              ₱{cartTotal.toLocaleString()}
            </button>
          )}
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative w-full h-[300px] sm:h-[380px] overflow-hidden bg-[#1a1208]/10">
        {restaurant?.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant?.name ?? ""}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#c8783a]/20 to-[#1a1208]/20" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/80 via-[#1a1208]/25 to-[#1a1208]/10" />

        {/* Back button */}
        <Link
          href="/dashboard"
          className="absolute top-5 left-5 sm:left-8 z-10 flex items-center gap-2 text-white text-[13px] font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 transition-all duration-300"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Link>

        {/* Restaurant info */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-7">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-9 w-64 rounded-lg bg-white/20" />
              <div className="h-4 w-48 rounded-lg bg-white/15" />
            </div>
          ) : (
            <>
              <h1 className="font-playfair text-[2rem] sm:text-[2.6rem] font-bold text-white leading-tight mb-2 tracking-tight">
                {restaurant?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {restaurant?.cuisine && (
                  <span className="text-white/80 text-[13px] font-medium">
                    {restaurant.cuisine}
                  </span>
                )}
                {restaurant?.rating && (
                  <>
                    <span className="text-white/30 text-xs">·</span>
                    <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[12px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                      <svg width="11" height="11" fill="#facc15" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {restaurant.rating}
                    </span>
                  </>
                )}
                {restaurant?.deliveryTime && (
                  <>
                    <span className="text-white/30 text-xs">·</span>
                    <span className="flex items-center gap-1.5 text-white/80 text-[12px] font-medium">
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                      {restaurant.deliveryTime}
                    </span>
                  </>
                )}
                {restaurant?.minOrder && restaurant.minOrder > 0 && (
                  <>
                    <span className="text-white/30 text-xs">·</span>
                    <span className="text-white/80 text-[12px] font-medium">₱{restaurant.minOrder} min.</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Sticky category tabs ────────────────────────────────────────────── */}
      {(menu.length > 1 || loading) && (
        <div className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#1a1208]/[0.06]">
          <div
            ref={tabsRef}
            className="flex items-center gap-1 px-5 sm:px-8 py-3 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded-full bg-[#1a1208]/[0.06] animate-pulse flex-shrink-0"
                    style={{ width: 64 + i * 16 }}
                  />
                ))
              : menu.map((group) => (
                  <button
                    key={group.category}
                    onClick={() => scrollToCategory(group.category)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                      activeCategory === group.category
                        ? "bg-[#1a1208] text-[#FDFBF7] shadow-[0_2px_8px_rgba(26,18,8,0.18)]"
                        : "text-[#1a1208]/50 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.05]"
                    }`}
                  >
                    {group.category}
                  </button>
                ))}
          </div>
        </div>
      )}

      {/* ── Menu ────────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-36 space-y-10">
        {loading ? (
          <>
            {[4, 3].map((count, gi) => (
              <div key={gi} className="space-y-3">
                <div className="h-5 w-28 rounded-full bg-[#1a1208]/[0.07] animate-pulse mb-5" />
                {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ))}
          </>
        ) : menu.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#c8783a]/[0.08] flex items-center justify-center mb-4">
              <svg width="28" height="28" fill="none" stroke="#c8783a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">No items available</p>
            <p className="text-sm text-[#1a1208]/40">This restaurant hasn't added menu items yet.</p>
          </div>
        ) : (
          menu.map((group) => (
            <section
              key={group.category}
              ref={(el) => { categoryRefs.current[group.category] = el; }}
            >
              {/* Category heading */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-playfair text-[1.15rem] font-bold text-[#1a1208] whitespace-nowrap leading-none">
                  {group.category}
                </h2>
                <div className="flex-1 h-px bg-[#1a1208]/[0.07]" />
                <span className="text-[11px] font-bold text-[#1a1208]/25 uppercase tracking-widest whitespace-nowrap">
                  {group.items.length}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3">
                {group.items.map((item) => {
                  const qty = getQty(item.id);
                  const justAdded = addedIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className="group flex gap-4 bg-white rounded-2xl p-4 border border-[#1a1208]/[0.05] hover:border-[#1a1208]/[0.10] hover:shadow-[0_6px_24px_rgba(26,18,8,0.07)] transition-all duration-300"
                    >
                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2 justify-between">
                        <div>
                          <p className="text-[15px] font-bold text-[#1a1208] leading-snug mb-1">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-[12px] text-[#1a1208]/45 font-light leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <svg width="10" height="10" fill="#facc15" viewBox="0 0 24 24">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span className="text-[11px] font-bold text-[#1a1208]/45">{item.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[17px] text-[#1a1208]">
                            ₱{item.price.toLocaleString()}
                          </span>

                          {qty > 0 ? (
                            /* Qty stepper */
                            <div className="flex items-center rounded-xl overflow-hidden border border-[#c8783a]/25 bg-[#c8783a]/[0.04]">
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-[#c8783a] hover:bg-[#c8783a]/10 transition-colors text-lg font-bold leading-none"
                                aria-label="Decrease quantity"
                              >−</button>
                              <span className="w-7 text-center text-[13px] font-bold text-[#c8783a] tabular-nums">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleAdd(item)}
                                className="w-8 h-8 flex items-center justify-center text-[#c8783a] hover:bg-[#c8783a]/10 transition-colors text-lg font-bold leading-none"
                                aria-label="Increase quantity"
                              >+</button>
                            </div>
                          ) : (
                            /* Add button */
                            <button
                              onClick={() => handleAdd(item)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                                justAdded
                                  ? "bg-[#10b981] text-white scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                                  : "bg-[#1a1208]/[0.06] text-[#1a1208] hover:bg-[#c8783a] hover:text-white hover:shadow-[0_4px_14px_rgba(200,120,58,0.30)] active:scale-95"
                              }`}
                            >
                              {justAdded ? (
                                <>
                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Added
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M12 5v14M5 12h14" />
                                  </svg>
                                  Add
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail */}
                      {item.imageUrl && (
                        <div className="relative w-[96px] h-[96px] rounded-xl overflow-hidden flex-shrink-0 bg-[#f5ede0]">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="96px"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* ── Floating cart bar ───────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          cartCount > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 pb-5">
          <button
            onClick={() => openGlobalCart(true)}
            className="w-full flex items-center justify-between bg-[#1a1208] text-[#FDFBF7] px-5 py-4 rounded-2xl shadow-[0_8px_40px_rgba(26,18,8,0.30)] hover:bg-[#c8783a] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#FDFBF7]/15 text-[12px] font-bold flex items-center justify-center tabular-nums">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
              <span className="text-[14px] font-semibold">
                {cartCount === 1 ? "1 item" : `${cartCount} items`} in cart
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[16px]">₱{cartTotal.toLocaleString()}</span>
              <svg
                width="16" height="16"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                viewBox="0 0 24 24"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
