"use client";

import { useState, useEffect } from "react";
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

function SkeletonItem() {
  return (
    <div className="flex gap-4 bg-white rounded-2xl p-4 border border-[#1a1208]/[0.04] animate-pulse">
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-4 w-3/4 rounded bg-[#1a1208]/[0.06]" />
        <div className="h-3 w-full rounded bg-[#1a1208]/[0.04]" />
        <div className="h-3 w-1/3 rounded bg-[#1a1208]/[0.04]" />
      </div>
      <div className="w-[90px] h-[90px] rounded-xl bg-[#1a1208]/[0.06] flex-shrink-0" />
    </div>
  );
}

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const { addToCart, updateQty, cart } = useCart();

  useEffect(() => {
    fetch(`/api/restaurants/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(({ restaurant, menu }) => {
        setRestaurant(restaurant);
        setMenu(menu);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

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
    }, 700);
  }

  function getQtyInCart(itemId: string) {
    return cart.find((i) => i.id === itemId)?.qty ?? 0;
  }

  if (!loading && !restaurant) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-center px-6">
        <p className="font-playfair text-2xl font-bold text-[#1a1208] mb-2">Restaurant not found</p>
        <p className="text-sm text-[#1a1208]/40 mb-6">It may have been removed or is no longer active.</p>
        <Link href="/dashboard/restaurants" className="text-sm font-semibold text-[#c8783a] underline underline-offset-4">
          ← Back to restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1208] pb-28">

      {/* Hero */}
      <div className="relative w-full h-[280px] sm:h-[340px] overflow-hidden bg-[#f5ede0]">
        {restaurant?.imageUrl && (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name ?? ""}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/70 via-[#1a1208]/20 to-transparent" />

        <Link
          href="/dashboard/restaurants"
          className="absolute top-[100px] left-5 sm:left-8 z-10 flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-[13px] font-semibold px-4 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Link>

        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-6">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-8 w-64 rounded bg-white/20" />
              <div className="h-4 w-40 rounded bg-white/15" />
            </div>
          ) : (
            <>
              <h1 className="font-playfair text-[2rem] sm:text-[2.5rem] font-bold text-white leading-tight mb-1">
                {restaurant?.name}
              </h1>
              <p className="text-white/70 text-[14px] font-medium">{restaurant?.cuisine}</p>
            </>
          )}
        </div>
      </div>

      {/* Meta strip */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <div className="flex items-center gap-6 py-5 border-b border-[#1a1208]/[0.06]">
          {loading ? (
            <div className="flex gap-6 animate-pulse">
              {[80, 64, 96].map((w) => (
                <div key={w} className="h-4 rounded bg-[#1a1208]/[0.06]" style={{ width: w }} />
              ))}
            </div>
          ) : (
            <>
              {restaurant?.rating && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" fill="#facc15" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-[13px] font-bold text-[#1a1208]">{restaurant.rating}</span>
                </div>
              )}
              {restaurant?.deliveryTime && (
                <div className="flex items-center gap-1.5 text-[#1a1208]/55">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  <span className="text-[13px] font-semibold">{restaurant.deliveryTime}</span>
                </div>
              )}
              {restaurant?.minOrder && restaurant.minOrder > 0 && (
                <div className="flex items-center gap-1.5 text-[#10b981]">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M5 18H3c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1h2l2-4h5l2 4h3c.6 0 1 .4 1 1v4c0 .6-.4 1-1 1h-2" />
                    <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                  </svg>
                  <span className="text-[13px] font-bold">₱{restaurant.minOrder} min. order</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 space-y-10">
        {loading ? (
          <>
            {[3, 2].map((count, gi) => (
              <div key={gi} className="space-y-3">
                <div className="h-5 w-32 rounded bg-[#1a1208]/[0.06] animate-pulse mb-5" />
                {Array.from({ length: count }).map((_, i) => <SkeletonItem key={i} />)}
              </div>
            ))}
          </>
        ) : menu.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-2">No items available</p>
            <p className="text-sm text-[#1a1208]/40">This restaurant hasn't added menu items yet.</p>
          </div>
        ) : (
          menu.map((group) => (
            <section key={group.category}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-playfair text-[1.2rem] font-bold text-[#1a1208] whitespace-nowrap">
                  {group.category}
                </h2>
                <div className="flex-1 h-px bg-[#1a1208]/[0.06]" />
                <span className="text-[11px] font-bold text-[#1a1208]/30 uppercase tracking-widest whitespace-nowrap">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {group.items.map((item) => {
                  const qty = getQtyInCart(item.id);
                  const justAdded = addedIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white rounded-2xl p-4 border border-[#1a1208]/[0.04] hover:border-[#1a1208]/[0.10] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300"
                    >
                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-bold text-[#1a1208] leading-snug mb-1">{item.name}</p>
                          {item.description && (
                            <p className="text-[12px] text-[#1a1208]/45 font-light leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <svg width="11" height="11" fill="#facc15" viewBox="0 0 24 24">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span className="text-[11px] font-bold text-[#1a1208]/50">{item.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[16px] text-[#1a1208]">
                            ₱{item.price.toLocaleString()}
                          </span>

                          {qty > 0 ? (
                            <div className="flex items-center rounded-xl border border-[#c8783a]/30 bg-[#c8783a]/[0.04] overflow-hidden">
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-[#c8783a] hover:bg-[#c8783a]/[0.10] transition-colors text-lg font-bold"
                              >−</button>
                              <span className="w-7 text-center text-[13px] font-bold text-[#c8783a]">{qty}</span>
                              <button
                                onClick={() => handleAdd(item)}
                                className="w-8 h-8 flex items-center justify-center text-[#c8783a] hover:bg-[#c8783a]/[0.10] transition-colors text-lg font-bold"
                              >+</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAdd(item)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 ${justAdded
                                  ? "bg-[#10b981] text-white scale-95"
                                  : "bg-[#c8783a] hover:bg-[#b5692e] active:scale-95 text-white"
                                }`}
                            >
                              {justAdded ? (
                                <>
                                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Added
                                </>
                              ) : (
                                <>
                                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
                        <div className="relative w-[90px] h-[90px] rounded-xl overflow-hidden flex-shrink-0 bg-[#f5ede0]">
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="90px" />
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
    </div>
  );
}