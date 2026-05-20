"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Footer } from "@/app/components/Footer";
import { useCart } from "@/app/context/CartContext";

type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
};

type Order = {
  id: string;
  status: string;
  subTotal: number | null;
  totalAmount: number | null;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  createdAt: string | null;
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantImage: string | null;
  items: OrderItem[];
};

const PAGE_LIMIT = 10;

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  pending:    { label: "Pending",    cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400" },
  confirmed:  { label: "Confirmed",  cls: "bg-blue-50 text-blue-700 border-blue-200",          dot: "bg-blue-400" },
  preparing:  { label: "Preparing",  cls: "bg-orange-50 text-orange-700 border-orange-200",    dot: "bg-orange-400" },
  ready:      { label: "Ready",      cls: "bg-purple-50 text-purple-700 border-purple-200",    dot: "bg-purple-400" },
  delivering: { label: "On the way", cls: "bg-sky-50 text-sky-700 border-sky-200",             dot: "bg-sky-400" },
  delivered:  { label: "Delivered",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, cls: "bg-[#1a1208]/8 text-[#1a1208]", dot: "bg-[#1a1208]/40" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Star Rating ────────────────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          disabled={readonly}
          title={`${n} Star`}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={(hovered || value) >= n ? "#f59e0b" : "none"} stroke={(hovered || value) >= n ? "#f59e0b" : "#d1d5db"} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ── Review form ────────────────────────────────────────────────────────────────

function ReviewSection({ orderId }: { orderId: string }) {
  const [existing, setExisting] = useState<{ rating: number; comment: string | null } | null | undefined>(undefined);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?orderId=${orderId}`)
      .then(r => r.ok ? r.json() : null)
      .then(setExisting)
      .catch(() => setExisting(null));
  }, [orderId]);

  async function submit() {
    if (rating === 0) { toast.error("Please select a star rating."); return; }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, rating, comment }),
    });
    setSubmitting(false);
    if (!res.ok) { toast.error((await res.json()).error ?? "Failed to submit review."); return; }
    toast.success("Review submitted. Thank you!");
    setExisting({ rating, comment });
  }

  if (existing === undefined) return <div className="h-4 w-24 bg-[#1a1208]/[0.05] rounded-full animate-pulse" />;

  if (existing) {
    return (
      <div className="pt-3 border-t border-[#1a1208]/[0.05]">
        <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#1a1208]/30 mb-1.5">Your Review</p>
        <StarRating value={existing.rating} readonly />
        {existing.comment && <p className="text-[11px] text-[#1a1208]/50 mt-1 italic">&ldquo;{existing.comment}&rdquo;</p>}
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-[#1a1208]/[0.05]">
      <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#1a1208]/30 mb-2">Rate this order</p>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment (optional)"
        maxLength={400}
        className="w-full mt-2 px-3 py-2 text-[12px] text-[#1a1208] placeholder:text-[#1a1208]/30 bg-[#FDFBF7] border border-[#1a1208]/10 rounded-xl outline-none focus:border-[#c8783a]/40 focus:ring-2 focus:ring-[#c8783a]/10 resize-none h-16 transition-all"
      />
      <button type="button" onClick={submit} disabled={submitting || rating === 0}
        className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white bg-[#c8783a] rounded-xl px-4 py-2 hover:bg-[#b5692e] disabled:opacity-40 transition-all active:scale-[0.98]">
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}

// ── Reorder button ─────────────────────────────────────────────────────────────

function ReorderButton({ order }: { order: Order }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [reordering, setReordering] = useState(false);

  async function handleReorder() {
    if (!order.restaurantId || order.items.length === 0) return;
    setReordering(true);

    try {
      // Fetch fresh menu data for the restaurant to get current prices / availability
      const res = await fetch(`/api/restaurants/${order.restaurantId}`);
      const data = res.ok ? await res.json() : null;
      const allMenuItems: { id: string; name: string; price: number; imageUrl: string | null; isAvailable: boolean | null }[] =
        data?.menu?.flatMap((cat: { items: unknown[] }) => cat.items) ?? [];

      let addedCount = 0;
      for (const item of order.items) {
        const fresh = allMenuItems.find(m => m.id === item.menuItemId);
        if (fresh && fresh.isAvailable !== false) {
          // Add each unit individually so qty tracking in addToCart works correctly
          for (let i = 0; i < item.quantity; i++) {
            addToCart({
              id: fresh.id,
              name: fresh.name,
              price: fresh.price,
              image: fresh.imageUrl ?? "",
              restaurant: order.restaurantName ?? "",
              restaurantId: order.restaurantId!,
            });
          }
          addedCount++;
        }
      }

      if (addedCount === 0) {
        toast.error("None of the items from this order are currently available.");
      } else {
        toast.success(`${addedCount} item${addedCount !== 1 ? "s" : ""} added back to cart`);
        setIsCartOpen(true);
      }
    } catch {
      toast.error("Couldn't load the menu. Please try again.");
    } finally {
      setReordering(false);
    }
  }

  if (!order.restaurantId) return null;

  return (
    <button
      type="button"
      onClick={handleReorder}
      disabled={reordering}
      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#c8783a] border border-[#c8783a]/30 rounded-xl px-3.5 py-2 hover:bg-[#c8783a]/[0.06] disabled:opacity-40 transition-all active:scale-[0.97]"
    >
      {reordering ? (
        <>
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
          Adding…
        </>
      ) : (
        <>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reorder
        </>
      )}
    </button>
  );
}

// ── Order card ─────────────────────────────────────────────────────────────────

function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, status: "cancelled" }),
    });
    setCancelling(false);
    if (!res.ok) {
      toast.error((await res.json()).error ?? "Failed to cancel order.");
      return;
    }
    toast.success("Order cancelled successfully.");
    onCancel(order.id);
  }

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
    : "—";
  const time = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-[#FDFBF7] transition-colors">
        <div className="w-12 h-12 rounded-xl bg-[#f5ede0] overflow-hidden shrink-0">
          {order.restaurantImage
            ? <Image src={order.restaurantImage} alt={order.restaurantName ?? ""} width={48} height={48} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="#c8783a" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/>
                </svg>
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-[14px] font-bold text-[#1a1208] truncate">{order.restaurantName ?? "Restaurant"}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-[11px] text-[#1a1208]/40">{date} · {time}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-bold text-[#1a1208]">₱{(order.totalAmount ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-[#1a1208]/30 mt-0.5">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 text-[#1a1208]/25 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[#1a1208]/[0.05] px-5 pb-5 pt-4 space-y-3">
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={`${order.id}-${item.id}-${idx}`} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-[#1a1208]/30 w-4 text-center shrink-0">×{item.quantity}</span>
                  <span className="text-[12px] text-[#1a1208] truncate">{item.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-[#1a1208] shrink-0">₱{(item.unitPrice * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#1a1208]/[0.05] pt-3 space-y-1.5">
            <div className="flex justify-between text-[11px] text-[#1a1208]/50">
              <span>Subtotal</span><span>₱{(order.subTotal ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-[#1a1208]">
              <span>Total</span><span>₱{(order.totalAmount ?? 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t border-[#1a1208]/[0.05] pt-3 space-y-1.5">
            {order.deliveryAddress && (
              <div className="flex items-start gap-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1208]/30 mt-0.5 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="text-[11px] text-[#1a1208]/50">{order.deliveryAddress}</span>
              </div>
            )}
            {order.paymentMethod && (
              <div className="flex items-center gap-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1208]/30 shrink-0"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span className="text-[11px] text-[#1a1208]/50 capitalize">{order.paymentMethod.replace(/_/g, " ")}</span>
              </div>
            )}
          </div>

          {/* ── #4 Reorder + review row ── */}
          <div className="border-t border-[#1a1208]/[0.05] pt-3 flex items-center justify-between gap-3 flex-wrap">
            <ReorderButton order={order} />
            {order.status === "pending" && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl px-3.5 py-2 transition-colors disabled:opacity-40"
              >
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </button>
            )}
            {order.status === "delivered" && (
              <Link
                href={`/dashboard/restaurant/${order.restaurantId}`}
                className="text-[11px] font-semibold text-[#1a1208]/40 hover:text-[#1a1208] transition-colors"
              >
                View menu →
              </Link>
            )}
          </div>

          {order.status === "delivered" && <ReviewSection orderId={order.id} />}
        </div>
      )}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-[#1a1208]/[0.06] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-[#1a1208]/[0.06] rounded-full" />
        <div className="h-2.5 w-24 bg-[#1a1208]/[0.04] rounded-full" />
      </div>
      <div className="h-4 w-16 bg-[#1a1208]/[0.06] rounded-full" />
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="text-[12px] text-[#1a1208]/40">
        {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} orders
      </p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#1a1208]/10 text-[#1a1208]/40 hover:text-[#1a1208] hover:border-[#1a1208]/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
            acc.push(p); return acc;
          }, [])
          .map((p, i) => p === "…"
            ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-[#1a1208]/25">…</span>
            : <button type="button" key={p} onClick={() => onChange(p as number)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-all ${p === page ? "bg-[#1a1208] text-white" : "text-[#1a1208]/50 hover:bg-[#1a1208]/[0.06] border border-[#1a1208]/10"}`}
              >{p}</button>
          )}
        <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#1a1208]/10 text-[#1a1208]/40 hover:text-[#1a1208] hover:border-[#1a1208]/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback((p: number) => {
    setLoading(true);
    fetch(`/api/orders?page=${p}&limit=${PAGE_LIMIT}`, {
      headers: { "Cache-Control": "no-cache" }
    })
      .then(r => r.ok ? r.json() : { data: [], total: 0 })
      .then(d => { setOrders(d.data ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { load(page); }, 0);
    return () => clearTimeout(t);
  }, [load, page]);

  return (
    <div className="h-full overflow-y-auto bg-[#FDFBF7]">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-8 pb-20 space-y-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.26em] font-semibold text-[#c8783a] mb-2">My Orders</p>
          <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-tight">Order History</h1>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : orders.length === 0 && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#c8783a]/10 flex items-center justify-center mb-4">
              <svg width="24" height="24" fill="none" stroke="#c8783a" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
                <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
            </div>
            <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">No orders yet</p>
            <p className="text-sm text-[#1a1208]/40 mb-6">Your past orders will show up here.</p>
            <Link href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.12em] text-white bg-[#c8783a] rounded-xl px-5 py-2.5 hover:bg-[#b5692e] transition-colors">
              Browse restaurants
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {orders.map(order => 
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onCancel={(id) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "cancelled" } : o))} 
                />
              )}
            </div>
            <Pagination page={page} total={total} limit={PAGE_LIMIT} onChange={p => setPage(p)} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
