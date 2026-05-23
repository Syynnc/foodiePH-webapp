"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type OrderItem = {
  name: string | null;
  quantity: number;
  unitPrice: number;
};

type RestaurantOrder = {
  id: string;
  status: string;
  totalAmount: number;
  subTotal: number;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  createdAt: string | null;
  restaurantName: string | null;
  restaurantId: string | null;
  driverId: string | null;
  customerEmail: string | null;
  customerFirst: string | null;
  customerLast: string | null;
  customerPhone: string | null;
  items: OrderItem[];
};

/* ── Status config ─────────────────────────────────────────────────────────── */

const STATUS: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending:          { label: "New Order",        color: "#b45309", bg: "#fefce8", border: "#fde68a", dot: "#f59e0b" },
  confirmed:        { label: "Accepted",         color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", dot: "#3b82f6" },
  ready_for_pickup: { label: "Ready for Pickup", color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", dot: "#8b5cf6" },
  on_the_way:       { label: "On the Way",       color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", dot: "#0ea5e9" },
  delivered:        { label: "Delivered",        color: "#065f46", bg: "#f0fdf4", border: "#bbf7d0", dot: "#10b981" },
  cancelled:        { label: "Cancelled",        color: "#991b1b", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444" },
};

const ACTIVE_STATUSES = new Set(["pending", "confirmed", "ready_for_pickup"]);

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function customerName(order: RestaurantOrder) {
  if (order.customerFirst && order.customerLast) return `${order.customerFirst} ${order.customerLast}`;
  if (order.customerFirst) return order.customerFirst;
  return order.customerEmail ?? "Customer";
}

function initials(order: RestaurantOrder) {
  const n = customerName(order);
  const parts = n.split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : n.slice(0, 2).toUpperCase();
}

/* ── SVG Icons ─────────────────────────────────────────────────────────────── */

const Ico = {
  cart: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  checkCircle: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  bag: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  bike: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M15 6a1 1 0 0 0-1-1h-1"/><path d="m15 6-3 5H9l-1.5-3"/>
      <path d="M9 11h7.5l1.5-5"/><path d="M5.5 14 9 11"/>
    </svg>
  ),
  star: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  arrow: (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  x: (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  back: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  signOut: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  ),
  orders: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
    </svg>
  ),
  mapPin: (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  creditCard: (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
    </svg>
  ),
  user: (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  truck: (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/>
      <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    </svg>
  ),
  clock: (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  chevronRight: (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
};

/* ── Tab filter ────────────────────────────────────────────────────────────── */

type Tab = "active" | "ready" | "on_the_way" | "done";
const TABS: { id: Tab; label: string; statuses: string[]; icon: React.ReactNode }[] = [
  { id: "active",     label: "Queue",     statuses: ["pending", "confirmed"],  icon: Ico.cart },
  { id: "ready",      label: "Ready",     statuses: ["ready_for_pickup"],      icon: Ico.bag },
  { id: "on_the_way", label: "Delivery",  statuses: ["on_the_way"],            icon: Ico.bike },
  { id: "done",       label: "Done",      statuses: ["delivered", "cancelled"], icon: Ico.star },
];

/* ── Spinner ───────────────────────────────────────────────────────────────── */
function Spinner({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg className="animate-spin" width={size} height={size} fill="none" viewBox="0 0 24 24" style={{ color }}>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
    </svg>
  );
}

/* ── Status badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS[status] ?? { label: status, color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", dot: "#6b7280" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ACTIVE_STATUSES.has(status) ? "animate-pulse" : ""}`}
        style={{ background: cfg.dot }}/>
      {cfg.label}
    </span>
  );
}

/* ── Flow step ─────────────────────────────────────────────────────────────── */
function FlowStep({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors ${active ? "bg-[#1a1208] text-white" : "bg-[#1a1208]/[0.05] text-[#1a1208]/50"}`}>
      {icon}
      {label}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  /* ── Fetch ──────────────────────────────────────────────────────────────── */
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/restaurant/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) return;
      const json = await res.json();
      setOrders(json.data ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
    const iv = setInterval(fetchOrders, 15000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  /* ── Realtime ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("restaurant-orders-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  /* ── Actions ────────────────────────────────────────────────────────────── */
  async function action(orderId: string, endpoint: string, successMsg: string, errorMsg: string) {
    setActing(orderId);
    try {
      const res = await fetch(`/api/restaurant/orders/${orderId}/${endpoint}`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? errorMsg);
        return;
      }
      toast.success(successMsg);
      await fetchOrders();
    } catch {
      toast.error(errorMsg);
    } finally {
      setActing(null);
    }
  }

  /* ── Derived state ──────────────────────────────────────────────────────── */
  const currentTab = TABS.find((t) => t.id === tab)!;
  const filtered = orders.filter((o) => currentTab.statuses.includes(o.status));
  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const newCount = orders.filter((o) => o.status === "pending").length;

  // Auto-select first on tab switch
  useEffect(() => {
    const first = orders.find((o) => currentTab.statuses.includes(o.status));
    setSelectedId(first?.id ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, orders.length]);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-[100dvh] bg-[#f4f0eb] text-[#1a1208] font-sans overflow-hidden">

      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-[#1a1208] text-white px-6 h-13 flex items-center justify-between gap-6 z-20">
        <div className="flex items-center gap-4">
          <Link href="/restaurant" className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-[12px] font-medium">
            {Ico.back}
            <span className="hidden sm:block">Portal</span>
          </Link>
          <div className="w-px h-4 bg-white/10"/>
          <div className="flex items-center gap-2">
            <span className="text-white/40">{Ico.orders}</span>
            <span className="font-semibold text-[13px] tracking-tight">Order Management</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Flow pills — compact in topbar */}
          <div className="hidden lg:flex items-center gap-1.5">
            <FlowStep icon={Ico.cart}  label="New Order"/>
            <span className="text-white/20">{Ico.chevronRight}</span>
            <FlowStep icon={Ico.check} label="Accept"/>
            <span className="text-white/20">{Ico.chevronRight}</span>
            <FlowStep icon={Ico.bag}   label="Mark Ready"/>
            <span className="text-white/20">{Ico.chevronRight}</span>
            <FlowStep icon={Ico.bike}  label="Driver Pickup"/>
            <span className="text-white/20">{Ico.chevronRight}</span>
            <FlowStep icon={Ico.checkCircle} label="Delivered"/>
          </div>

          <div className="w-px h-4 bg-white/10 hidden lg:block"/>

          {newCount > 0 && (
            <span className="flex items-center gap-1.5 bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#fbbf24] text-[11px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse"/>
              {newCount} new
            </span>
          )}

          <form action={signOut}>
            <button type="submit" className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Sign out">
              {Ico.signOut}
            </button>
          </form>
        </div>
      </header>

      {/* ── Two-panel body ────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Order queue ─────────────────────────────────────────── */}
        <div className="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 flex flex-col border-r border-[#1a1208]/[0.09] bg-white overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-[#1a1208]/[0.07] flex-shrink-0">
            {TABS.map((t) => {
              const count = orders.filter((o) => t.statuses.includes(o.status)).length;
              const isActive = tab === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-3 text-[11px] font-bold uppercase tracking-[0.08em] border-b-2 transition-all duration-150 ${
                    isActive ? "border-[#c8783a] text-[#1a1208]" : "border-transparent text-[#1a1208]/35 hover:text-[#1a1208]/60"
                  }`}>
                  <span className={`${isActive ? "text-[#c8783a]" : "text-[#1a1208]/25"}`}>{t.icon}</span>
                  <span>{t.label}</span>
                  {count > 0 && (
                    <span className={`text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                      isActive ? "bg-[#c8783a] text-white" : "bg-[#1a1208]/[0.07] text-[#1a1208]/40"
                    }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Order list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col divide-y divide-[#1a1208]/[0.05]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-5 py-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1a1208]/[0.07]"/>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-28 bg-[#1a1208]/[0.07] rounded-full"/>
                        <div className="h-2.5 w-20 bg-[#1a1208]/[0.04] rounded-full"/>
                      </div>
                      <div className="h-5 w-16 bg-[#1a1208]/[0.05] rounded-full"/>
                    </div>
                    <div className="h-2.5 w-full bg-[#1a1208]/[0.04] rounded-full"/>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1a1208]/[0.04] flex items-center justify-center mb-3 text-[#1a1208]/20">
                  {currentTab.icon}
                </div>
                <p className="text-[13px] font-semibold text-[#1a1208]/50 mb-1">No orders here</p>
                <p className="text-[11px] text-[#1a1208]/30 leading-relaxed">
                  {tab === "active" ? "New orders appear as customers place them." : "Nothing to show right now."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#1a1208]/[0.05]">
                {filtered.map((order) => {
                  const isSelected = selectedId === order.id;
                  const cfg = STATUS[order.status];
                  const isActing = acting === order.id;

                  return (
                    <button key={order.id} type="button"
                      onClick={() => setSelected(order.id, setSelectedId)}
                      className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors duration-100 relative ${
                        isSelected ? "bg-[#faf7f2]" : "hover:bg-[#1a1208]/[0.015]"
                      }`}>

                      {/* Selected indicator */}
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c8783a]"/>}

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                        style={{ background: cfg?.dot ?? "#6b7280" }}>
                        {initials(order)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-[12.5px] font-semibold text-[#1a1208] leading-tight truncate">
                            {customerName(order)}
                          </p>
                          <span className="text-[10px] text-[#1a1208]/30 flex-shrink-0 flex items-center gap-1 mt-0.5">
                            {Ico.clock}
                            {timeAgo(order.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#1a1208]/40 truncate mb-2">
                          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                        </p>
                        <div className="flex items-center justify-between">
                          <StatusBadge status={order.status}/>
                          <span className="text-[12px] font-bold text-[#1a1208] tabular-nums">
                            ₱{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {isActing && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <Spinner size={18} color="#c8783a"/>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Order detail ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto hidden md:block">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-[#1a1208]/[0.05] flex items-center justify-center mb-4 text-[#1a1208]/20">
                {Ico.orders}
              </div>
              <p className="text-[14px] font-semibold text-[#1a1208]/40">Select an order to review</p>
              <p className="text-[12px] text-[#1a1208]/25 mt-1">Order details and actions appear here</p>
            </div>
          ) : (
            <OrderDetail
              order={selected}
              acting={acting === selected.id}
              onAction={(endpoint, ok, fail) => action(selected.id, endpoint, ok, fail)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helper to update selected ─────────────────────────────────────────────── */
function setSelected(id: string, setter: (id: string) => void) {
  setter(id);
}

/* ── Order detail panel ─────────────────────────────────────────────────────  */
function OrderDetail({
  order,
  acting,
  onAction,
}: {
  order: RestaurantOrder;
  acting: boolean;
  onAction: (endpoint: string, ok: string, fail: string) => void;
}) {
  const cfg = STATUS[order.status];

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-10 py-8">

      {/* ── Order header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
              style={{ background: cfg?.dot ?? "#6b7280" }}>
              {initials(order)}
            </div>
            <div>
              <p className="font-semibold text-[15px] text-[#1a1208] leading-tight">{customerName(order)}</p>
              {order.customerEmail && (
                <p className="text-[11px] text-[#1a1208]/40">{order.customerEmail}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={order.status}/>
          <span className="text-[10px] text-[#1a1208]/30 flex items-center gap-1">
            {Ico.clock} {new Date(order.createdAt ?? "").toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* ── Order items ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1a1208]/30 mb-3">Items Ordered</p>
        <div className="rounded-2xl border border-[#1a1208]/[0.07] overflow-hidden bg-white divide-y divide-[#1a1208]/[0.05]">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-md bg-[#1a1208]/[0.05] flex items-center justify-center text-[10px] font-bold text-[#1a1208]/40 tabular-nums flex-shrink-0">
                  {item.quantity}
                </span>
                <span className="text-[13px] font-medium text-[#1a1208] truncate">{item.name}</span>
              </div>
              <span className="text-[13px] font-bold text-[#1a1208] tabular-nums flex-shrink-0 ml-6">
                ₱{(item.quantity * item.unitPrice).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#faf7f2]">
            <span className="text-[12px] font-bold text-[#1a1208]/50 uppercase tracking-wide">Total</span>
            <span className="text-[16px] font-bold text-[#1a1208] tabular-nums">
              ₱{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Metadata grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {order.deliveryAddress && (
          <div className="rounded-xl border border-[#1a1208]/[0.07] bg-white px-4 py-3">
            <div className="flex items-center gap-1.5 text-[#1a1208]/35 mb-1.5">
              {Ico.mapPin}
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Deliver to</span>
            </div>
            <p className="text-[12px] font-medium text-[#1a1208] leading-snug">{order.deliveryAddress}</p>
          </div>
        )}
        {order.paymentMethod && (
          <div className="rounded-xl border border-[#1a1208]/[0.07] bg-white px-4 py-3">
            <div className="flex items-center gap-1.5 text-[#1a1208]/35 mb-1.5">
              {Ico.creditCard}
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Payment</span>
            </div>
            <p className="text-[12px] font-medium text-[#1a1208] capitalize">{order.paymentMethod.replace(/_/g, " ")}</p>
          </div>
        )}
        {order.restaurantName && (
          <div className="rounded-xl border border-[#1a1208]/[0.07] bg-white px-4 py-3">
            <div className="flex items-center gap-1.5 text-[#1a1208]/35 mb-1.5">
              {Ico.bag}
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Restaurant</span>
            </div>
            <p className="text-[12px] font-medium text-[#1a1208]">{order.restaurantName}</p>
          </div>
        )}
        {order.driverId ? (
          <div className="rounded-xl border border-[#0ea5e9]/25 bg-[#f0f9ff] px-4 py-3">
            <div className="flex items-center gap-1.5 text-[#0369a1]/60 mb-1.5">
              {Ico.truck}
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Driver</span>
            </div>
            <p className="text-[12px] font-semibold text-[#0369a1]">Assigned — en route</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#1a1208]/[0.07] bg-white px-4 py-3">
            <div className="flex items-center gap-1.5 text-[#1a1208]/35 mb-1.5">
              {Ico.truck}
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Driver</span>
            </div>
            <p className="text-[12px] text-[#1a1208]/35">Not yet assigned</p>
          </div>
        )}
      </div>

      {/* ── Action zone ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#1a1208]/[0.07] bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1a1208]/30 mb-4">Actions</p>

        {/* PENDING */}
        {order.status === "pending" && (
          <div className="space-y-2.5">
            <p className="text-[12px] text-[#1a1208]/50 leading-relaxed mb-3">
              Review the order and accept it to begin preparation, or reject it if you cannot fulfill it.
            </p>
            <div className="flex gap-2.5">
              <button type="button"
                onClick={() => onAction("accept", "Order accepted — start preparing.", "Failed to accept.")}
                disabled={acting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1208] hover:bg-[#2d2014] text-white text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {acting ? <Spinner size={15}/> : <>{Ico.check} Accept Order</>}
              </button>
              <button type="button"
                onClick={() => onAction("reject", "Order rejected.", "Failed to reject.")}
                disabled={acting}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#1a1208]/10 text-[#1a1208]/50 hover:border-red-200 hover:text-red-500 hover:bg-red-50 text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {acting ? <Spinner size={15} color="#ef4444"/> : <>{Ico.x} Reject</>}
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMED */}
        {order.status === "confirmed" && (
          <div className="space-y-2.5">
            <p className="text-[12px] text-[#1a1208]/50 leading-relaxed mb-3">
              Once food is packaged and ready, mark it for pickup. Drivers will only see orders marked ready.
            </p>
            <div className="flex gap-2.5">
              <button type="button"
                onClick={() => onAction("ready", "Order marked ready — drivers can now pick up.", "Failed to update.")}
                disabled={acting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c8783a] hover:bg-[#b5692e] text-white text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(200,120,58,0.25)]">
                {acting ? <Spinner size={15}/> : <>{Ico.bag} Mark Ready for Pickup</>}
              </button>
              <button type="button"
                onClick={() => onAction("reject", "Order cancelled.", "Failed to cancel.")}
                disabled={acting}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#1a1208]/10 text-[#1a1208]/50 hover:border-red-200 hover:text-red-500 hover:bg-red-50 text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {acting ? <Spinner size={15} color="#ef4444"/> : <>{Ico.x} Cancel</>}
              </button>
            </div>
          </div>
        )}

        {/* READY_FOR_PICKUP */}
        {order.status === "ready_for_pickup" && (
          <div className="flex items-start gap-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-xl px-4 py-3.5">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse flex-shrink-0 mt-1.5"/>
            <div>
              <p className="text-[12px] font-semibold text-[#6d28d9] mb-0.5">
                {order.driverId ? "Driver assigned and heading to you." : "Waiting for a driver to accept this order."}
              </p>
              <p className="text-[11px] text-[#6d28d9]/60">No action needed — drivers will pick up shortly.</p>
            </div>
          </div>
        )}

        {/* ON_THE_WAY */}
        {order.status === "on_the_way" && (
          <div className="flex items-start gap-3 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl px-4 py-3.5">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse flex-shrink-0 mt-1.5"/>
            <div>
              <p className="text-[12px] font-semibold text-[#0369a1] mb-0.5">Order is on its way to the customer.</p>
              <p className="text-[11px] text-[#0369a1]/60">The driver has picked up and is now in transit.</p>
            </div>
          </div>
        )}

        {/* DELIVERED */}
        {order.status === "delivered" && (
          <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3.5">
            <span className="text-[#10b981] flex-shrink-0 mt-0.5">{Ico.checkCircle}</span>
            <div>
              <p className="text-[12px] font-semibold text-[#065f46] mb-0.5">Order delivered successfully.</p>
              <p className="text-[11px] text-[#065f46]/60">This order has been completed.</p>
            </div>
          </div>
        )}

        {/* CANCELLED */}
        {order.status === "cancelled" && (
          <div className="flex items-start gap-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3.5">
            <span className="text-[#ef4444] flex-shrink-0 mt-0.5">{Ico.x}</span>
            <div>
              <p className="text-[12px] font-semibold text-[#991b1b] mb-0.5">This order was cancelled.</p>
              <p className="text-[11px] text-[#991b1b]/60">No further action required.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
