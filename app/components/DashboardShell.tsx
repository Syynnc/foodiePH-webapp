"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { useCart } from "@/app/context/CartContext";

export default function DashboardShell({ children, userEmail }: { children: ReactNode; userEmail: string }) {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQty } = useCart();
  const tax = cartTotal * 0.12;
  const dispatchFee = cartTotal > 0 ? 50 : 0;
  const finalTotal = cartTotal + tax + dispatchFee;
  const cartItemCount = cart.reduce((acc, c) => acc + c.qty, 0);

  return (
    <div className="relative flex flex-col h-[100dvh] bg-[#FDFBF7] text-[#1a1208] overflow-hidden font-sans">
      {/* ── Floating Nav ── */}
      <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-5xl">
        <div className="bg-[#FDFBF7]/85 backdrop-blur-xl border border-[#1a1208]/8 rounded-full px-4 py-2.5 flex items-center justify-between shadow-[0_2px_32px_rgba(0,0,0,0.06)]">
          <Link href="/" className="flex items-center gap-2 pl-4">
            <span className="font-playfair text-xl font-bold tracking-tight">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-[360px] mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center text-[#1a1208]/40">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search restaurants or food..." 
                className="w-full pl-11 pr-4 py-2.5 bg-[#1a1208]/[0.03] border border-[#1a1208]/[0.05] rounded-full outline-none text-[14px] placeholder-[#1a1208]/40 focus:ring-2 focus:ring-[#c8783a]/30 transition-all font-medium"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 pr-1">
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2.5 rounded-full hover:bg-[#1a1208]/[0.05] transition-all text-[#1a1208]/70 hover:text-[#1a1208]"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c8783a] text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-md border-2 border-[#FDFBF7]">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            <form action={signOut}>
              <button type="submit" className="p-2.5 rounded-full hover:bg-[#1a1208]/[0.05] text-[#1a1208]/50 hover:text-[#1a1208] transition-colors" title="Sign out">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              </button>
            </form>

            <Link href="/account" className="ml-2 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center ring-[2px] ring-offset-2 ring-transparent active:scale-95 hover:ring-[#c8783a]/60 shadow-[0_4px_10px_rgba(0,0,0,0.06)] transition-all relative">
               <Image src={`https://ui-avatars.com/api/?name=${userEmail.charAt(0)}&background=c8783a&color=fff`} alt="Profile" fill className="object-cover" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative pt-[95px]">
        {/* Page Content */}
        <div className="absolute inset-0 top-[95px] z-0">
          {children}
        </div>

        {/* Cart Sidebar Overlay Context / Dropdown Sidepanel */}
        {isCartOpen && (
          <div className="absolute inset-0 z-20" onClick={() => setIsCartOpen(false)}>
            {/* Backdrop click-to-close area */}
          </div>
        )}
        
        <aside className={`absolute top-0 right-0 z-30 h-full w-full max-w-[400px] bg-white border-l border-[#1a1208]/[0.06] shadow-[-20px_0_40px_rgba(0,0,0,0.03)] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between p-6 border-b border-[#1a1208]/[0.05]">
            <h2 className="font-playfair text-2xl font-bold text-[#1a1208]">Your Cart</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Close cart">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <svg width="48" height="48" className="mb-4 text-[#1a1208]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <p className="font-medium text-lg text-[#1a1208]">Your cart is empty</p>
                <p className="text-[13px] mt-1 text-[#1a1208]/60">Looks like you haven&apos;t added anything yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-4 items-center">
                    <div className="relative w-[70px] h-[70px] rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm border border-[#1a1208]/[0.02]">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="70px" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-bold text-[#1a1208] leading-tight mb-1 truncate">{item.name}</h4>
                      <p className="text-[12px] font-medium text-[#1a1208]/50 truncate mb-2">{item.restaurant}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-bold text-[15px] text-[#1a1208]">₱ {item.price * item.qty}</span>
                      <div className="bg-[#FDFBF7] rounded-lg border border-[#1a1208]/10 flex items-center w-[85px] mt-1">
                        <button onClick={() => updateQty(item.id, -1)} className="flex-1 h-7 text-[#1a1208]/50 hover:text-[#1a1208] transition-colors">-</button>
                        <span className="flex-1 text-center text-[12px] font-bold h-7 flex items-center justify-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="flex-1 h-7 text-[#1a1208]/50 hover:text-[#1a1208] transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-[#FDFBF7]/50 border-t border-[#1a1208]/[0.05]">
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#1a1208]/60 font-medium">Subtotal</span>
                <span className="font-bold text-[#1a1208]">₱ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#1a1208]/60 font-medium">Delivery</span>
                <span className="font-bold text-[#1a1208]">₱ {dispatchFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#1a1208]/60 font-medium">Tax</span>
                <span className="font-bold text-[#1a1208]">₱ {tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-[#1a1208]/[0.08]">
              <span className="text-[18px] font-bold text-[#1a1208]">Total</span>
              <span className="text-[26px] font-black text-[#1a1208]">₱ {finalTotal.toFixed(2)}</span>
            </div>

            <button 
              disabled={cart.length === 0}
              className="w-full bg-[#c8783a] disabled:bg-[#1a1208]/20 disabled:scale-100 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-[16px] shadow-[0_8px_20px_rgba(200,120,58,0.2)] hover:scale-[1.015] hover:bg-[#b56b33] transition-all active:scale-95"
            >
              Checkout Order
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}