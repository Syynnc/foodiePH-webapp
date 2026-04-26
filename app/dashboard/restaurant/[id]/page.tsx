"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useCart } from "@/app/context/CartContext";

const MOCK_RESTAURANTS: Record<string, any> = {
  "jollibee": {
    name: "Jollibee", category: "Fast Food", rating: "4.8", reviews: "10k+",
    deliveryBase: "Free delivery", deliveryTime: "15-20 mins",
    image: "https://images.unsplash.com/photo-1579065497397-2824d41272ce?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    menu: [
      { id: "jb-1", name: "1-pc. Chickenjoy w/ Rice", price: 95, image: "https://images.unsplash.com/photo-1626082928501-8b0d4c82c61e?q=80&w=600&auto=format&fit=crop" },
      { id: "jb-2", name: "Yumburger", price: 40, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
      { id: "jb-3", name: "Jolly Spaghetti", price: 60, image: "https://images.unsplash.com/photo-1626808642875-0aa54548ebfd?q=80&w=600&auto=format&fit=crop" },
    ]
  },
  "mcdonalds": {
    name: "McDonald's PH", category: "Burgers", rating: "4.7", reviews: "8k+",
    deliveryBase: "₱39 delivery", deliveryTime: "20-30 mins",
    image: "https://plus.unsplash.com/premium_photo-1683619761468-b06992704398?q=80&w=665&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    menu: [
      { id: "mc-1", name: "Big Mac", price: 160, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
      { id: "mc-2", name: "6-pc. Chicken McNuggets", price: 140, image: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=600&auto=format&fit=crop" },
      { id: "mc-3", name: "World Famous Fries (Large)", price: 85, image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=600&auto=format&fit=crop" },
    ]
  },
  "mang-inasal": {
    name: "Mang Inasal", category: "Chicken", rating: "4.6", reviews: "5k+",
    deliveryBase: "Free delivery", deliveryTime: "15-25 mins",
    image: "https://images.unsplash.com/photo-1592011432621-f7f576f44484?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    menu: [
      { id: "mi-1", name: "Paa Large", price: 145, image: "https://images.unsplash.com/photo-1598514982205-f36b96d1ea8d?q=80&w=600&auto=format&fit=crop" },
      { id: "mi-2", name: "Pecho Large", price: 165, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop" },
      { id: "mi-3", name: "Pork BBQ (2 sticks)", price: 130, image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=600&auto=format&fit=crop" },
    ]
  },
  "kfc": {
    name: "KFC Philippines", category: "Fast Food", rating: "4.7", reviews: "7k+",
    deliveryBase: "Free delivery", deliveryTime: "15-30 mins",
    image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    menu: [
      { id: "kfc-1", name: "Original Recipe Chicken", price: 100, image: "https://images.unsplash.com/photo-1626082928501-8b0d4c82c61e?q=80&w=600&auto=format&fit=crop" },
      { id: "kfc-2", name: "Zinger Burger", price: 160, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
      { id: "kfc-3", name: "Famous Bowl", price: 80, image: "https://images.unsplash.com/photo-1588673756209-6449195b28d1?q=80&w=600&auto=format&fit=crop" },
    ]
  },
};

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const rest = MOCK_RESTAURANTS[unwrappedParams.id];
  const { addToCart } = useCart();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  if (!rest) {
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

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* Hero Banner */}
      <div className="relative w-full h-[300px] md:h-[350px]">
        <Image src={rest.image} alt={rest.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/80 via-[#1a1208]/20 to-transparent flex items-end">
          <div className="px-8 pb-10 w-full">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors font-medium">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
              Menu
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{rest.name}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[13px] font-bold">
                    ★ {rest.rating} ({rest.reviews})
                  </span>
                  <span className="text-[14px] font-medium">{rest.category}</span>
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
          {rest.menu.map((item: any, i: number) => {
            const isLiked = likedItems[item.id] || false;
            return (
              <ScrollReveal key={item.id} delay={i * 80}>
                <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col h-full border border-[#1a1208]/[0.03] group">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-[600ms] group-hover:scale-105" sizes="(max-width: 768px) 100vw, 300px" />
                    
                    <button 
                      onClick={(e) => toggleHeart(item.id, e)}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all duration-300 ${isLiked ? 'bg-[#ff4757]/15 text-[#ff4757] scale-110' : 'bg-white/90 text-[#1a1208]/30 hover:text-[#ff4757] hover:scale-105'}`}
                    >
                      <svg width="18" height="18" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col px-1">
                    <h3 className="font-bold text-[17px] leading-tight text-[#1a1208] mb-1">{item.name}</h3>
                    <div className="font-black text-[20px] text-[#c8783a] mb-5">₱ {item.price}</div>
                    
                    <button 
                      onClick={() => addToCart({ ...item, restaurant: rest.name })}
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