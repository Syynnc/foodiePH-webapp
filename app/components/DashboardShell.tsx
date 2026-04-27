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
          items: cart.map((i) => ({ menuItemId: i.id, quantity: i.qty, unitPrice: i.price })),
          subTotal: cartTotal,
          totalAmount: Math.round(finalTotal),
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      clearCart();
      setOrderSuccess(true);
      setTimeout(() => { setOrderSuccess(false); setIsCartOpen(false); }, 2800);
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return (
    <div className="relative flex flex-col h-[100dvh] bg-[#FDFBF7] text-[#1a1208] overflow-hidden font-sans">

      {/* ── Floating nav ────────────────────────────────────────────────────── */}
      <nav className="absolute top-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2.5rem)] max-w-5xl">
        <div className="bg-[#FDFBF7]/88 backdrop-blur-2xl border border-[#1a1208]/[0.07] rounded-2xl px-3 py-2 flex items-center justify-between shadow-[0_4px_40px_rgba(26,18,8,0.08)]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 px-2 flex-shrink-0">
            <span className="font-playfair text-[1.15rem] font-bold tracking-tight">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-[400px] mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3.5 flex items-center text-[#1a1208]/30 pointer-events-none">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search restaurants or dishes…"
                className="w-full pl-10 pr-4 py-2 bg-[#1a1208]/[0.04] border border-[#1a1208]/[0.06] rounded-xl outline-none text-[13px] placeholder-[#1a1208]/30 focus:ring-2 focus:ring-[#c8783a]/20 focus:border-[#c8783a]/30 transition-all font-medium"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 pr-1">

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#1a1208]/[0.05] transition-all text-[#1a1208]/60 hover:text-[#1a1208] group"
              aria-label="Open cart"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <>
                  <span className="text-[12px] font-bold text-[#1a1208] tabular-nums hidden sm:block">
                    {cartCount}
                  </span>
                  <span className="absolute top-1 right-1 sm:hidden w-[7px] h-[7px] bg-[#c8783a] rounded-full" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-[#1a1208]/[0.08] mx-1" />

            {/* Sign out */}
            <form action={signOut}>
              <button
                type="submit"
                className="p-2 rounded-xl hover:bg-[#1a1208]/[0.05] text-[#1a1208]/40 hover:text-[#1a1208] transition-colors"
                title="Sign out"
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
              </button>
            </form>

            {/* Avatar */}
            <Link
              href="/account"
              className="ml-1 w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 relative ring-2 ring-transparent hover:ring-[#c8783a]/40 transition-all active:scale-95"
            >
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail.charAt(0))}&background=c8783a&color=fff&bold=true`}
                alt="Profile"
                fill
                className="object-cover"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Page content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden relative pt-[88px]">
        <div className="absolute inset-0 top-[88px] z-0">
          {children}
        </div>

        {/* Scrim */}
        <div
          onClick={() => setIsCartOpen(false)}
          className={`absolute inset-0 z-20 transition-all duration-500 ${
            isCartOpen
              ? "bg-[#1a1208]/25 backdrop-blur-[3px] pointer-events-auto"
              : "bg-transparent backdrop-blur-none pointer-events-none"
          }`}
        />

        {/* ── Cart drawer ──────────────────────────────────────────────────── */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            absolute bottom-0 left-1/2 -translate-x-1/2 z-30
            w-full max-w-[800px]
            bg-[#FDFBF7] rounded-t-[1.75rem]
            border-t border-x border-[#1a1208]/[0.07]
            shadow-[0_-24px_80px_rgba(26,18,8,0.14)]
            flex flex-col
            transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isCartOpen ? "translate-y-0" : "translate-y-full"}
          `}
          style={{ maxHeight: "min(600px, 78vh)" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-0.5 flex-shrink-0">
            <div className="w-8 h-[3px] rounded-full bg-[#1a1208]/12" />
          </div>

          {/* ── Order success ──────────────────────────────────────────────── */}
          {orderSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-8 gap-4">
              <div className="w-[72px] h-[72px] rounded-full bg-[#10b981]/[0.09] border border-[#10b981]/20 flex items-center justify-center">
                <svg width="30" height="30" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <p className="font-playfair text-[1.5rem] font-bold text-[#1a1208] mb-1">Order placed!</p>
                <p className="text-[13px] text-[#1a1208]/40 font-light leading-relaxed">
                  Your food is being prepared.<br/>Estimated delivery in 25–40 min.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Header ────────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 pt-4 pb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="font-playfair text-[1.45rem] font-bold text-[#1a1208] leading-none">
                    Your Cart
                  </h2>
                  {cartCount > 0 && (
                    <span className="bg-[#1a1208] text-[#FDFBF7] text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                      {cartCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#1a1208]/[0.05] hover:bg-[#1a1208]/[0.10] flex items-center justify-center transition-colors"
                  aria-label="Close cart"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>

              <div className="h-px bg-[#1a1208]/[0.06] mx-6 flex-shrink-0" />

              {/* ── Empty ─────────────────────────────────────────────────── */}
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-14 text-center px-8 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a1208]/[0.04] flex items-center justify-center">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#1a1208]/25">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                      <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-playfair text-[1.1rem] font-semibold text-[#1a1208] mb-1">Nothing here yet</p>
                    <p className="text-[12px] text-[#1a1208]/40 font-light leading-relaxed">
                      Browse a restaurant and add<br />something delicious to get started.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Two-column layout: items left, summary right ──────── */
                <div className="flex-1 min-h-0 flex flex-col md:flex-row">

                  {/* Items list */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 min-h-0 md:border-r border-[#1a1208]/[0.06]">
                    <div className="flex flex-col gap-3">
                      {cart.map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          className="flex items-center gap-3.5 bg-white rounded-xl p-3 border border-[#1a1208]/[0.05] hover:border-[#1a1208]/[0.09] transition-colors"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-[52px] h-[52px] rounded-lg overflow-hidden flex-shrink-0 bg-[#f5ede0]">
                            {item.image
                              ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="52px" />
                              : <div className="w-full h-full flex items-center justify-center opacity-20">
                                  <svg width="18" height="18" fill="none" stroke="#1a1208" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                </div>
                            }
                          </div>

                          {/* Name + restaurant */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1a1208] leading-snug truncate">{item.name}</p>
                            <p className="text-[11px] text-[#1a1208]/35 font-medium mt-0.5 truncate">{item.restaurant}</p>
                          </div>

                          {/* Price + stepper */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-[13px] font-bold text-[#1a1208] tabular-nums">
                              ₱{(item.price * item.qty).toLocaleString()}
                            </span>
                            <div className="flex items-center rounded-lg border border-[#1a1208]/[0.09] bg-[#FDFBF7] overflow-hidden">
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center text-[#1a1208]/45 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.05] transition-colors text-[15px] font-bold leading-none"
                                aria-label="Decrease"
                              >−</button>
                              <span className="w-6 text-center text-[11px] font-bold text-[#1a1208] tabular-nums">{item.qty}</span>
                              <button
                                onClick={() => updateQty(item.id, 1)}
                                className="w-6 h-6 flex items-center justify-center text-[#1a1208]/45 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.05] transition-colors text-[15px] font-bold leading-none"
                                aria-label="Increase"
                              >+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary panel */}
                  <div className="flex-shrink-0 md:w-[280px] flex flex-col px-6 py-4 border-t md:border-t-0 border-[#1a1208]/[0.06] gap-3">

                    {/* Breakdown */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/30 mb-3">Order Summary</p>

                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#1a1208]/50 font-medium">Subtotal</span>
                        <span className="text-[12px] font-semibold text-[#1a1208] tabular-nums">₱{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#1a1208]/50 font-medium">Delivery</span>
                        <span className="text-[12px] font-semibold text-[#10b981] tabular-nums">
                          {deliveryFee === 0 ? "Free" : `₱${deliveryFee.toFixed(0)}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#1a1208]/50 font-medium">VAT (12%)</span>
                        <span className="text-[12px] font-semibold text-[#1a1208] tabular-nums">₱{tax.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-end justify-between pt-3 border-t border-[#1a1208]/[0.07]">
                      <span className="text-[12px] font-bold text-[#1a1208]/60 uppercase tracking-wider">Total</span>
                      <div className="text-right">
                        <span className="font-playfair text-[1.6rem] font-bold text-[#1a1208] leading-none tabular-nums">
                          ₱{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Place order */}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="group w-full bg-[#c8783a] hover:bg-[#b5692e] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-[0_6px_20px_rgba(200,120,58,0.28)] hover:shadow-[0_10px_28px_rgba(200,120,58,0.36)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center gap-2.5 mt-auto"
                    >
                      {isPlacingOrder ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                          </svg>
                          Placing order…
                        </>
                      ) : (
                        <>
                          Place Order
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[10px] text-[#1a1208]/25 font-medium tracking-wide">
                      Free cancellation within 2 minutes
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
