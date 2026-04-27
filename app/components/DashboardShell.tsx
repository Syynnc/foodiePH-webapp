"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { useCart } from "@/app/context/CartContext";

export default function DashboardShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQty, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const tax = cartTotal * 0.12;
  const deliveryFee = cartTotal > 0 ? 50 : 0;
  const finalTotal = cartTotal + tax + deliveryFee;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // All items must be from the same restaurant (enforced by UX)
  const restaurantId = cart[0]?.restaurantId ?? null;

  async function handlePlaceOrder() {
    if (!cart.length || isPlacingOrder) return;
    setIsPlacingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          items: cart.map((i) => ({
            menuItemId: i.id,
            quantity: i.qty,
            unitPrice: i.price,
          })),
          subTotal: cartTotal,
          totalAmount: Math.round(finalTotal),
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      clearCart();
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return (
    <div className="relative flex flex-col h-[100dvh] bg-[#FDFBF7] text-[#1a1208] overflow-hidden font-sans">

      {/* ─────────────────────────────── Floating Nav ─────────────────────── */}
      <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-5xl">
        <div className="bg-[#FDFBF7]/85 backdrop-blur-xl border border-[#1a1208]/8 rounded-full px-4 py-2.5 flex items-center justify-between shadow-[0_2px_32px_rgba(0,0,0,0.06)]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-4 flex-shrink-0">
            <span className="font-playfair text-xl font-bold tracking-tight">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
          </Link>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-[360px] mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center text-[#1a1208]/40 pointer-events-none">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search restaurants or food..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#1a1208]/[0.03] border border-[#1a1208]/[0.05] rounded-full outline-none text-[13px] placeholder-[#1a1208]/35 focus:ring-2 focus:ring-[#c8783a]/25 transition-all font-medium"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 pr-1">

            {/* Cart toggle */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2.5 rounded-full hover:bg-[#1a1208]/[0.05] transition-all text-[#1a1208]/65 hover:text-[#1a1208]"
              aria-label="Open cart"
            >
              <svg width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#c8783a] text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm border-2 border-[#FDFBF7]">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Sign out */}
            <form action={signOut}>
              <button
                type="submit"
                className="p-2.5 rounded-full hover:bg-[#1a1208]/[0.05] text-[#1a1208]/45 hover:text-[#1a1208] transition-colors"
                title="Sign out"
              >
                <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </button>
            </form>

            {/* Avatar */}
            <Link
              href="/account"
              className="ml-1 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-offset-2 ring-transparent hover:ring-[#c8783a]/50 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all relative flex-shrink-0"
            >
              <Image
                src={`https://ui-avatars.com/api/?name=${userEmail.charAt(0)}&background=c8783a&color=fff`}
                alt="Profile"
                fill
                className="object-cover"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────── Page content ─────────────────────── */}
      <main className="flex-1 overflow-hidden relative pt-[95px]">
        <div className="absolute inset-0 top-[95px] z-0">
          {children}
        </div>

        {/* Scrim */}
        <div
          className={`absolute inset-0 z-20 transition-all duration-500 ${isCartOpen
            ? "bg-[#1a1208]/20 backdrop-blur-[2px] pointer-events-auto"
            : "bg-transparent backdrop-blur-none pointer-events-none"
            }`}
          onClick={() => setIsCartOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`
            absolute bottom-0 left-1/2 -translate-x-1/2 z-30
            w-full max-w-[680px]
            bg-[#FDFBF7] rounded-t-[2rem]
            border border-[#1a1208]/[0.07] border-b-0
            shadow-[0_-20px_60px_rgba(26,18,8,0.12)]
            flex flex-col
            transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isCartOpen ? "translate-y-0" : "translate-y-full"}
          `}
          style={{ maxHeight: "min(560px, 72vh)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex items-center justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-9 h-1 rounded-full bg-[#1a1208]/15" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-4 pb-5 flex-shrink-0">
            <div>
              <h2 className="font-playfair text-[1.6rem] font-bold text-[#1a1208] leading-none mb-0.5">
                Your Cart
              </h2>
              {cartCount > 0 && (
                <p className="text-[11px] text-[#1a1208]/40 font-medium uppercase tracking-[0.16em]">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-9 h-9 rounded-full bg-[#1a1208]/[0.05] flex items-center justify-center hover:bg-[#1a1208]/[0.10] transition-colors"
              aria-label="Close cart"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="h-px bg-[#1a1208]/[0.06] mx-7 flex-shrink-0" />

          {/* Order success state */}
          {orderSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-7">
              <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mb-4">
                <svg width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-playfair text-xl font-bold text-[#1a1208] mb-1">Order placed!</p>
              <p className="text-[13px] text-[#1a1208]/40 font-light">Your food is on its way.</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto px-7 py-5 custom-scrollbar min-h-0">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#c8783a]/[0.08] flex items-center justify-center mb-4">
                      <svg width="28" height="28" fill="none" stroke="#c8783a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                    <p className="font-playfair text-lg font-semibold text-[#1a1208] mb-1">Nothing here yet</p>
                    <p className="text-[13px] text-[#1a1208]/40 font-light leading-relaxed">
                      Add something delicious from<br />a restaurant to get started.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="flex items-center gap-4 bg-white rounded-[1.1rem] p-3.5 border border-[#1a1208]/[0.05] hover:border-[#1a1208]/[0.10] transition-colors duration-300"
                      >
                        <div className="relative w-[58px] h-[58px] rounded-xl overflow-hidden flex-shrink-0 bg-[#f5ede0]">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="58px" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#1a1208] leading-snug truncate">{item.name}</p>
                          <p className="text-[11px] text-[#1a1208]/40 font-medium mt-0.5 truncate">{item.restaurant}</p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className="font-bold text-[14px] text-[#1a1208]">
                            ₱{(item.price * item.qty).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-0 rounded-xl border border-[#1a1208]/[0.10] bg-[#FDFBF7] overflow-hidden">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center text-[#1a1208]/50 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.04] transition-colors text-base leading-none"
                            >−</button>
                            <span className="w-7 text-center text-[12px] font-bold text-[#1a1208]">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center text-[#1a1208]/50 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.04] transition-colors text-base leading-none"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary + Checkout */}
              {cart.length > 0 && (
                <div className="flex-shrink-0 px-7 pt-4 pb-7 border-t border-[#1a1208]/[0.06]">
                  <div className="grid grid-cols-2 gap-y-2 mb-4">
                    <span className="text-[13px] text-[#1a1208]/50 font-medium">Subtotal</span>
                    <span className="text-[13px] font-semibold text-[#1a1208] text-right">₱{cartTotal.toLocaleString()}</span>

                    <span className="text-[13px] text-[#1a1208]/50 font-medium">Delivery fee</span>
                    <span className="text-[13px] font-semibold text-[#1a1208] text-right">₱{deliveryFee.toFixed(2)}</span>

                    <span className="text-[13px] text-[#1a1208]/50 font-medium">VAT (12%)</span>
                    <span className="text-[13px] font-semibold text-[#1a1208] text-right">₱{tax.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between py-3.5 border-t border-[#1a1208]/[0.08] mb-5">
                    <span className="text-base font-bold text-[#1a1208]">Total</span>
                    <span className="font-playfair text-[1.75rem] font-bold text-[#1a1208] leading-none">
                      ₱{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="group w-full bg-[#c8783a] hover:bg-[#b5692e] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-[15px] shadow-[0_8px_24px_rgba(200,120,58,0.22)] hover:shadow-[0_12px_32px_rgba(200,120,58,0.30)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center gap-3"
                  >
                    {isPlacingOrder ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                        </svg>
                        Placing order…
                      </>
                    ) : (
                      <>
                        Place Order
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px">↗</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10.5px] text-[#1a1208]/30 font-medium mt-3 tracking-wide">
                    Free cancellation within 2 minutes of placing your order
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}