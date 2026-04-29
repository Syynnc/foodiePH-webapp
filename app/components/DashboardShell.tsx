"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { useCart } from "@/app/context/CartContext";

type OrderLineItem = {
  orderId: string;
  quantity: number;
  unitPrice: number;
  name: string | null;
  imageUrl: string | null;
};

type Order = {
  id: string;
  status: string;
  subTotal: number;
  totalAmount: number;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  createdAt: string | null;
  restaurantName: string | null;
  restaurantImage: string | null;
  items: OrderLineItem[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
  preparing:   { label: "Preparing Order", color: "#c8783a", bg: "rgba(200,120,58,0.1)",  step: 0 },
  on_the_way:  { label: "On the Way",      color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  step: 1 },
  delivered:   { label: "Delivered",       color: "#10b981", bg: "rgba(16,185,129,0.1)",  step: 2 },
  cancelled:   { label: "Cancelled",       color: "#ef4444", bg: "rgba(239,68,68,0.1)",   step: -1 },
};

const ACTIVE_STATUSES = new Set(["preparing", "on_the_way"]);

function StatusDot({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#1a1208", bg: "rgba(26,18,8,0.08)", step: -1 };
  const isActive = ACTIVE_STATUSES.has(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em]`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "animate-pulse" : ""}`}
        style={{ background: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg || cfg.step < 0) return null;
  const steps = ["Preparing", "On the Way", "Delivered"];
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-500 ${
              i <= cfg.step ? "bg-[#c8783a]" : "bg-[#1a1208]/10"
            }`}
          >
            {i <= cfg.step && (
              <svg width="8" height="8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-1 rounded-full overflow-hidden bg-[#1a1208]/[0.07]">
              <div
                className="h-full bg-[#c8783a] rounded-full transition-all duration-700"
                style={{ width: i < cfg.step ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

type CheckoutStep = "cart" | "delivery" | "payment" | "confirm";

const PAYMENT_METHODS = [
  {
    id: "gcash",
    label: "GCash",
    description: "Pay via GCash e-wallet",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, JCB",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h2m4 0h4" />
      </svg>
    ),
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: "corporate",
    label: "Corporate Billing",
    description: "Charge to company account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M12 12v4m-2-2h4" />
      </svg>
    ),
  },
];

export default function DashboardShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQty, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [addressError, setAddressError] = useState(false);

  // Orders panel
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const data: Order[] = await res.json();
      setUserOrders(data);
    } catch { /* silent */ }
  }, []);

  // Load orders when panel opens; poll every 12s while open and there are active orders
  useEffect(() => {
    if (!isOrdersOpen) return;
    setOrdersLoading(true);
    fetchOrders().finally(() => setOrdersLoading(false));

    const iv = setInterval(() => {
      const hasActive = userOrders.some((o) => ACTIVE_STATUSES.has(o.status));
      if (hasActive) fetchOrders();
    }, 12000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOrdersOpen, fetchOrders]);

  const activeOrderCount = userOrders.filter((o) => ACTIVE_STATUSES.has(o.status)).length;

  const tax = cartTotal * 0.12;
  const deliveryFee = cartTotal > 0 ? 50 : 0;
  const finalTotal = cartTotal + tax + deliveryFee;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const restaurantId = cart[0]?.restaurantId ?? null;

  function openCart() {
    setIsOrdersOpen(false);
    setStep("cart");
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
    setTimeout(() => setStep("cart"), 500);
  }

  function openOrders() {
    setIsCartOpen(false);
    setIsOrdersOpen(true);
  }

  function closeOrders() {
    setIsOrdersOpen(false);
  }

  function handleProceedToDelivery() {
    setStep("delivery");
  }

  function handleDeliveryNext() {
    if (!deliveryAddress.trim()) {
      setAddressError(true);
      return;
    }
    setAddressError(false);
    setStep("payment");
  }

  function handlePaymentNext() {
    if (!paymentMethod) return;
    setStep("confirm");
  }

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
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod,
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      clearCart();
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
        setStep("cart");
        setDeliveryAddress("");
        setDeliveryNote("");
        setPaymentMethod("");
      }, 3200);
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  const stepLabel: Record<CheckoutStep, string> = {
    cart: "Your Cart",
    delivery: "Delivery Details",
    payment: "Payment Method",
    confirm: "Confirm Order",
  };

  const stepBack: Partial<Record<CheckoutStep, CheckoutStep>> = {
    delivery: "cart",
    payment: "delivery",
    confirm: "payment",
  };

  return (
    <div className="relative flex flex-col h-[100dvh] bg-[#FDFBF7] text-[#1a1208] overflow-hidden font-sans">

      {/* ── Floating nav ─────────────────────────────────────────────────── */}
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

            {/* Orders */}
            <button
              onClick={openOrders}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#1a1208]/[0.05] transition-all text-[#1a1208]/60 hover:text-[#1a1208] group"
              aria-label="My orders"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
              <span className="text-[12px] font-medium hidden sm:block">Orders</span>
              {activeOrderCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c8783a] animate-pulse" />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
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

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden relative pt-[88px]">
        <div className="absolute inset-0 top-[88px] z-0">
          {children}
        </div>

        {/* Scrim */}
        <div
          onClick={() => { closeCart(); closeOrders(); }}
          className={`absolute inset-0 z-20 transition-all duration-500 ${
            isCartOpen || isOrdersOpen
              ? "bg-[#1a1208]/25 backdrop-blur-[3px] pointer-events-auto"
              : "bg-transparent backdrop-blur-none pointer-events-none"
          }`}
        />

        {/* ── Cart / Checkout drawer ────────────────────────────────────── */}
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
          style={{ maxHeight: "min(640px, 82vh)" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-0.5 flex-shrink-0">
            <div className="w-8 h-[3px] rounded-full bg-[#1a1208]/12" />
          </div>

          {/* ── Order success ─────────────────────────────────────────── */}
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
              <div className="mt-2 bg-white border border-[#1a1208]/[0.07] rounded-2xl px-5 py-4 text-left w-full max-w-xs">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/30 mb-3">Order details</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#1a1208]/50">Delivery to</span>
                    <span className="font-semibold text-[#1a1208] text-right max-w-[180px] truncate">{deliveryAddress}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#1a1208]/50">Payment</span>
                    <span className="font-semibold text-[#1a1208]">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#1a1208]/50">Total paid</span>
                    <span className="font-bold text-[#c8783a]">₱{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── Drawer header ─────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 pt-4 pb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {stepBack[step] && (
                    <button
                      onClick={() => setStep(stepBack[step]!)}
                      className="w-7 h-7 rounded-xl bg-[#1a1208]/[0.05] hover:bg-[#1a1208]/[0.09] flex items-center justify-center transition-colors mr-0.5"
                      aria-label="Back"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                    </button>
                  )}
                  <h2 className="font-playfair text-[1.35rem] font-bold text-[#1a1208] leading-none">
                    {stepLabel[step]}
                  </h2>
                  {step === "cart" && cartCount > 0 && (
                    <span className="bg-[#1a1208] text-[#FDFBF7] text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                      {cartCount}
                    </span>
                  )}
                </div>

                {/* Step indicator */}
                {step !== "cart" && (
                  <div className="flex items-center gap-1.5 mr-10">
                    {(["delivery", "payment", "confirm"] as const).map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          s === step
                            ? "w-5 bg-[#c8783a]"
                            : (["delivery", "payment", "confirm"].indexOf(s) < ["delivery", "payment", "confirm"].indexOf(step))
                              ? "w-3 bg-[#1a1208]/30"
                              : "w-3 bg-[#1a1208]/10"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-xl bg-[#1a1208]/[0.05] hover:bg-[#1a1208]/[0.10] flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>

              <div className="h-px bg-[#1a1208]/[0.06] mx-6 flex-shrink-0" />

              {/* ── STEP: CART ────────────────────────────────────────── */}
              {step === "cart" && (
                <>
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
                    <div className="flex-1 min-h-0 flex flex-col md:flex-row">

                      {/* Items list */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 min-h-0 md:border-r border-[#1a1208]/[0.06]">
                        <div className="flex flex-col gap-3">
                          {cart.map((item, idx) => (
                            <div
                              key={`${item.id}-${idx}`}
                              className="flex items-center gap-3.5 bg-white rounded-xl p-3 border border-[#1a1208]/[0.05] hover:border-[#1a1208]/[0.09] transition-colors"
                            >
                              <div className="relative w-[52px] h-[52px] rounded-lg overflow-hidden flex-shrink-0 bg-[#f5ede0]">
                                {item.image
                                  ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="52px" />
                                  : <div className="w-full h-full flex items-center justify-center opacity-20">
                                      <svg width="18" height="18" fill="none" stroke="#1a1208" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                    </div>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-[#1a1208] leading-snug truncate">{item.name}</p>
                                <p className="text-[11px] text-[#1a1208]/35 font-medium mt-0.5 truncate">{item.restaurant}</p>
                              </div>
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
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/30 mb-3">Order Summary</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#1a1208]/50 font-medium">Subtotal</span>
                            <span className="text-[12px] font-semibold text-[#1a1208] tabular-nums">₱{cartTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#1a1208]/50 font-medium">Delivery</span>
                            <span className="text-[12px] font-semibold text-[#10b981] tabular-nums">
                              {deliveryFee === 0 ? "Free" : `₱${deliveryFee}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#1a1208]/50 font-medium">VAT (12%)</span>
                            <span className="text-[12px] font-semibold text-[#1a1208] tabular-nums">₱{tax.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between pt-3 border-t border-[#1a1208]/[0.07]">
                          <span className="text-[12px] font-bold text-[#1a1208]/60 uppercase tracking-wider">Total</span>
                          <span className="font-playfair text-[1.6rem] font-bold text-[#1a1208] leading-none tabular-nums">
                            ₱{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        <button
                          onClick={handleProceedToDelivery}
                          className="group w-full bg-[#c8783a] hover:bg-[#b5692e] active:scale-[0.98] text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-[0_6px_20px_rgba(200,120,58,0.28)] hover:shadow-[0_10px_28px_rgba(200,120,58,0.36)] transition-all duration-300 flex items-center justify-center gap-2.5 mt-auto"
                        >
                          Proceed to Checkout
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:translate-x-0.5">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </button>
                        <p className="text-center text-[10px] text-[#1a1208]/25 font-medium tracking-wide">
                          Free cancellation within 2 minutes
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── STEP: DELIVERY ────────────────────────────────────── */}
              {step === "delivery" && (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 flex flex-col gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/40 mb-2">
                      Delivery Address <span className="text-red-400 normal-case tracking-normal font-medium">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => { setDeliveryAddress(e.target.value); setAddressError(false); }}
                      placeholder="e.g. Unit 12B, BGC Tower, Taguig City"
                      className={`w-full px-4 py-3 rounded-xl border text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/30 bg-white outline-none transition-all duration-200 ${
                        addressError
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-[#1a1208]/[0.09] focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/15"
                      }`}
                    />
                    {addressError && (
                      <p className="text-[11px] text-red-400 mt-1.5 font-medium">Please enter a delivery address.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/40 mb-2">
                      Delivery Notes <span className="text-[#1a1208]/25 normal-case tracking-normal font-medium">(optional)</span>
                    </label>
                    <textarea
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Gate code, landmark, special instructions…"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#1a1208]/[0.09] focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/15 text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/30 bg-white outline-none transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Quick addresses */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/30 mb-2.5">Common Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {["BGC, Taguig", "Makati CBD", "Ortigas Center", "Eastwood, QC", "IT Park, Cebu"].map((loc) => (
                        <button
                          key={loc}
                          onClick={() => { setDeliveryAddress(loc); setAddressError(false); }}
                          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 ${
                            deliveryAddress === loc
                              ? "bg-[#1a1208] text-white border-[#1a1208]"
                              : "bg-white text-[#1a1208]/55 border-[#1a1208]/10 hover:border-[#1a1208]/25"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[#1a1208]/[0.06]">
                    <button
                      onClick={handleDeliveryNext}
                      className="group w-full bg-[#c8783a] hover:bg-[#b5692e] active:scale-[0.98] text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-[0_6px_20px_rgba(200,120,58,0.28)] transition-all duration-300 flex items-center justify-center gap-2.5"
                    >
                      Continue to Payment
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:translate-x-0.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: PAYMENT ─────────────────────────────────────── */}
              {step === "payment" && (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 flex flex-col gap-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/40">
                    Select a payment method
                  </p>

                  <div className="flex flex-col gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`group flex items-center gap-4 w-full text-left px-4 py-4 rounded-2xl border transition-all duration-200 ${
                          paymentMethod === method.id
                            ? "border-[#c8783a] bg-[#c8783a]/[0.05] shadow-[0_0_0_3px_rgba(200,120,58,0.1)]"
                            : "border-[#1a1208]/[0.09] bg-white hover:border-[#1a1208]/20 hover:bg-[#1a1208]/[0.02]"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          paymentMethod === method.id ? "bg-[#c8783a] text-white" : "bg-[#1a1208]/[0.05] text-[#1a1208]/50"
                        }`}>
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13.5px] font-semibold leading-tight ${paymentMethod === method.id ? "text-[#1a1208]" : "text-[#1a1208]/70"}`}>
                            {method.label}
                          </p>
                          <p className="text-[11px] text-[#1a1208]/35 mt-0.5">{method.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all duration-200 flex items-center justify-center ${
                          paymentMethod === method.id ? "border-[#c8783a] bg-[#c8783a]" : "border-[#1a1208]/20"
                        }`}>
                          {paymentMethod === method.id && (
                            <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-[#1a1208]/[0.06]">
                    <button
                      onClick={handlePaymentNext}
                      disabled={!paymentMethod}
                      className="group w-full bg-[#c8783a] hover:bg-[#b5692e] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-[0_6px_20px_rgba(200,120,58,0.28)] transition-all duration-300 flex items-center justify-center gap-2.5"
                    >
                      Review Order
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:translate-x-0.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: CONFIRM ─────────────────────────────────────── */}
              {step === "confirm" && (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 flex flex-col gap-4">
                  {/* Items summary */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/35 mb-3">
                      {cartCount} item{cartCount !== 1 ? "s" : ""} from {cart[0]?.restaurant}
                    </p>
                    <div className="bg-white border border-[#1a1208]/[0.06] rounded-2xl divide-y divide-[#1a1208]/[0.05] overflow-hidden">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[11px] font-bold text-[#1a1208]/30 w-4 flex-shrink-0 tabular-nums">{item.qty}×</span>
                            <span className="text-[13px] font-medium text-[#1a1208] truncate">{item.name}</span>
                          </div>
                          <span className="text-[13px] font-bold text-[#1a1208] tabular-nums flex-shrink-0">₱{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery + payment details */}
                  <div className={`grid gap-2.5 ${deliveryNote ? "grid-cols-1" : "grid-cols-2"}`}>
                    <div className={`bg-[#FDFBF7] rounded-xl px-3.5 py-3 ${deliveryNote ? "col-span-1" : ""}`}>
                      <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/30 mb-1">Deliver to</p>
                      <p className="text-[12.5px] font-semibold text-[#1a1208] leading-snug">{deliveryAddress}</p>
                    </div>
                    {deliveryNote && (
                      <div className="bg-[#FDFBF7] rounded-xl px-3.5 py-3">
                        <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/30 mb-1">Notes</p>
                        <p className="text-[12.5px] text-[#1a1208]/65 leading-snug">{deliveryNote}</p>
                      </div>
                    )}
                    <div className={`bg-[#FDFBF7] rounded-xl px-3.5 py-3 ${deliveryNote ? "col-span-1" : ""}`}>
                      <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/30 mb-1">Payment</p>
                      <p className="text-[12.5px] font-semibold text-[#1a1208] leading-snug">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-white border border-[#1a1208]/[0.06] rounded-2xl px-4 py-4 space-y-2">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-[#1a1208]/50">Subtotal</span>
                      <span className="font-semibold text-[#1a1208]">₱{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-[#1a1208]/50">Delivery fee</span>
                      <span className="font-semibold text-[#10b981]">{deliveryFee === 0 ? "Free" : `₱${deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-[#1a1208]/50">VAT (12%)</span>
                      <span className="font-semibold text-[#1a1208]">₱{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-[#1a1208]/[0.07]">
                      <span className="text-[13px] font-bold text-[#1a1208]">Total</span>
                      <span className="font-playfair text-[1.2rem] font-bold text-[#1a1208] leading-none">
                        ₱{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-2">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="group w-full bg-[#c8783a] hover:bg-[#b5692e] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-[0_6px_20px_rgba(200,120,58,0.28)] hover:shadow-[0_10px_28px_rgba(200,120,58,0.36)] transition-all duration-300 flex items-center justify-center gap-2.5"
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
                          Place Order · ₱{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:translate-x-0.5">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-[#1a1208]/25 font-medium tracking-wide mt-2">
                      By placing this order you agree to our Terms of Service
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* ── Orders drawer ────────────────────────────────────────── */}
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
            ${isOrdersOpen ? "translate-y-0" : "translate-y-full"}
          `}
          style={{ maxHeight: "min(680px, 84vh)" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-0.5 flex-shrink-0">
            <div className="w-8 h-[3px] rounded-full bg-[#1a1208]/12" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="font-playfair text-[1.35rem] font-bold text-[#1a1208] leading-none">My Orders</h2>
              {activeOrderCount > 0 && (
                <span className="flex items-center gap-1 bg-[#c8783a]/10 text-[#c8783a] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8783a] animate-pulse" />
                  {activeOrderCount} active
                </span>
              )}
            </div>
            <button
              onClick={closeOrders}
              className="w-8 h-8 rounded-xl bg-[#1a1208]/[0.05] hover:bg-[#1a1208]/[0.10] flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>

          <div className="h-px bg-[#1a1208]/[0.06] mx-6 flex-shrink-0" />

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
            {ordersLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-[#1a1208]/[0.05] animate-pulse space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-40 bg-[#1a1208]/[0.07] rounded-full" />
                      <div className="h-5 w-20 bg-[#1a1208]/[0.06] rounded-full" />
                    </div>
                    <div className="h-2 w-full bg-[#1a1208]/[0.04] rounded-full" />
                    <div className="h-3 w-32 bg-[#1a1208]/[0.05] rounded-full" />
                  </div>
                ))}
              </div>
            ) : userOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#1a1208]/[0.04] flex items-center justify-center">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#1a1208]/25">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <path d="M9 12h6M9 16h4"/>
                  </svg>
                </div>
                <div>
                  <p className="font-playfair text-[1.1rem] font-semibold text-[#1a1208] mb-1">No orders yet</p>
                  <p className="text-[12px] text-[#1a1208]/40 font-light leading-relaxed">
                    Your order history will appear here<br />once you place your first order.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Active orders first, then history */}
                {[...userOrders].sort((a, b) => {
                  const aActive = ACTIVE_STATUSES.has(a.status) ? 1 : 0;
                  const bActive = ACTIVE_STATUSES.has(b.status) ? 1 : 0;
                  return bActive - aActive;
                }).map((order) => {
                  const isActive = ACTIVE_STATUSES.has(order.status);
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isActive
                          ? "border-[#c8783a]/25 shadow-[0_4px_20px_rgba(200,120,58,0.08)]"
                          : "border-[#1a1208]/[0.06]"
                      }`}
                    >
                      {/* Card header */}
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="w-full text-left px-5 py-4 flex items-start gap-4"
                      >
                        {/* Restaurant image / icon */}
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#f5ede0] flex-shrink-0">
                          {order.restaurantImage ? (
                            <Image src={order.restaurantImage} alt={order.restaurantName ?? ""} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-25">
                              <svg width="20" height="20" fill="none" stroke="#1a1208" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-bold text-[#1a1208] leading-tight truncate">
                                {order.restaurantName ?? "Order"}
                              </p>
                              <p className="text-[11px] text-[#1a1208]/35 mt-0.5">
                                {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₱{order.totalAmount.toLocaleString()} · {timeAgo(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-2">
                              <StatusDot status={order.status} />
                              <svg
                                width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                                className={`text-[#1a1208]/25 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                              >
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </div>
                          </div>

                          {/* Progress bar for active orders */}
                          {isActive && (
                            <div className="mt-3">
                              <ProgressBar status={order.status} />
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="border-t border-[#1a1208]/[0.06] px-5 py-4 space-y-4">
                          {/* Line items */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a1208]/30 mb-2.5">Items</p>
                            <div className="flex flex-col gap-2">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#f5ede0] flex-shrink-0">
                                    {item.imageUrl ? (
                                      <Image src={item.imageUrl} alt={item.name ?? ""} fill className="object-cover" sizes="36px" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center opacity-20">
                                        <svg width="14" height="14" fill="none" stroke="#1a1208" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[12.5px] font-medium text-[#1a1208] truncate">{item.name}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-[11px] text-[#1a1208]/40">{item.quantity}× ₱{item.unitPrice.toLocaleString()}</p>
                                    <p className="text-[12px] font-bold text-[#1a1208]">₱{(item.quantity * item.unitPrice).toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery + payment */}
                          <div className="grid grid-cols-2 gap-3">
                            {order.deliveryAddress && (
                              <div className="bg-[#FDFBF7] rounded-xl px-3 py-2.5">
                                <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/30 mb-1">Deliver to</p>
                                <p className="text-[12px] font-medium text-[#1a1208] leading-snug">{order.deliveryAddress}</p>
                              </div>
                            )}
                            {order.paymentMethod && (
                              <div className="bg-[#FDFBF7] rounded-xl px-3 py-2.5">
                                <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/30 mb-1">Payment</p>
                                <p className="text-[12px] font-medium text-[#1a1208] leading-snug capitalize">{order.paymentMethod.replace("_", " ")}</p>
                              </div>
                            )}
                          </div>

                          {/* Total */}
                          <div className="flex justify-between items-center pt-1 border-t border-[#1a1208]/[0.06]">
                            <span className="text-[12px] text-[#1a1208]/45 font-medium">Total paid</span>
                            <span className="font-playfair text-[1.15rem] font-bold text-[#1a1208]">₱{order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
