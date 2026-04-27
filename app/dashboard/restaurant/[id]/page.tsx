"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useCart } from "@/app/context/CartContext";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
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

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { addToCart } = useCart();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/restaurants/${unwrappedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          setMenuCategories(data.menu || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center animate-pulse">
        <h2 className="font-playfair text-3xl font-bold text-[#1a1208]/60 mb-2">Loading...</h2>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <h2 className="font-playfair text-3xl font-bold mb-4">Restaurant not found</h2>
        <Link href="/dashboard" className="px-6 py-3 bg-[#c8783a] text-white rounded-full font-bold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const toggleHeart = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const flatMenu = menuCategories.flatMap(c => c.items);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* Hero Banner */}
      <div className="relative w-full h-[300px] md:h-[350px]">
        {restaurant.imageUrl ? (
          <Image src={restaurant.imageUrl} alt={restaurant.name} fill className="object-cover" priority sizes="(max-width: 1200px) 100vw, 1200px" />
        ) : (
          <div className="w-full h-full bg-[#1a1208]/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/80 via-[#1a1208]/20 to-transparent flex items-end">
          <div className="px-8 pb-10 w-full">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors font-medium">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
              Menu
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{restaurant.name}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  {restaurant.rating && (
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[13px] font-bold">
                      ★ {restaurant.rating}
                    </span>
                  )}
                  {restaurant.cuisine && <span className="text-[14px] font-medium">{restaurant.cuisine}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="px-8 py-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-playfair text-3xl font-bold text-[#1a1208]">Menu Items</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {flatMenu.map((item: MenuItem, i: number) => {
            const isLiked = likedItems[item.id] || false;
            return (
              <ScrollReveal key={item.id} delay={i * 80}>
                <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col h-full border border-[#1a1208]/[0.03] group">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover transition-transform duration-[600ms] group-hover:scale-105" sizes="(max-width: 768px) 100vw, 300px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="3"/><path d="m9 9 6 6m0-6-6 6"/>
                        </svg>
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => toggleHeart(item.id, e)}
                      title="Like item"
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all duration-300 ${isLiked ? 'bg-[#ff4757]/15 text-[#ff4757] scale-110' : 'bg-white/90 text-[#1a1208]/30 hover:text-[#ff4757] hover:scale-105'}`}
                    >
                      <svg width="18" height="18" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col px-1">
                    <h3 className="font-bold text-[17px] leading-tight text-[#1a1208] mb-1">{item.name}</h3>
                    <div className="font-black text-[20px] text-[#c8783a] mb-5">₱ {item.price}</div>
                    
                    <button 
                      onClick={() => addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.imageUrl || "",
                        restaurant: restaurant.name,
                        restaurantId: restaurant.id
                      })}
                      className="mt-auto w-full py-3.5 bg-[#1a1208]/5 hover:bg-[#c8783a] hover:text-white hover:shadow-[0_8px_20px_rgba(200,120,58,0.25)] text-[#1a1208] rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="transition-transform group-hover/btn:scale-110"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      Add to cart
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}