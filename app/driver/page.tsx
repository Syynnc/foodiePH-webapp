"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

type AvailableOrder = {
  id: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  createdAt: string | null;
  restaurantName: string | null;
  restaurantImage: string | null;
};

type MyOrder = AvailableOrder & {
  deliveryPhotoUrl: string | null;
  deliveredAt: string | null;
  items: { orderId: string; quantity: number; unitPrice: number; name: string | null }[];
};

type DriverInfo = {
  isDriver: boolean;
  driver: { firstName: string | null; lastName: string | null; vehicleType: string | null; plateNumber: string | null; licenseNumber: string | null } | null;
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const PAYMENT_LABELS: Record<string, string> = {
  gcash: "GCash", card: "Card", cod: "Cash on Delivery", corporate: "Corporate",
};

// ── Registration gate ────────────────────────────────────────────────────────
function RegisterForm({ onRegistered }: { onRegistered: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", licenseNumber: "", vehicleType: "motorcycle", plateNumber: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/driver/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      onRegistered();
    } catch {
      setErr("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <span className="font-playfair text-[1.25rem] font-bold tracking-tight text-[#1a1208]">
            Foodie<span className="text-[#c8783a]">.ph</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#1a1208]/35 font-medium">Driver</span>
        </Link>

        <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-3">Get Started</p>
        <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-tight mb-2">
          Register as a Rider
        </h1>
        <p className="text-[13px] text-[#1a1208]/45 font-light leading-relaxed mb-8">
          Fill in your details to start accepting deliveries on Foodie.ph.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40 mb-1.5">First Name</label>
              <input
                type="text"
                placeholder="Juan"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#1a1208]/[0.09] bg-white text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/30 focus:outline-none focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/15 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40 mb-1.5">Last Name</label>
              <input
                type="text"
                placeholder="dela Cruz"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#1a1208]/[0.09] bg-white text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/30 focus:outline-none focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40 mb-1.5">Vehicle Type</label>
            <select
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#1a1208]/[0.09] bg-white text-[13.5px] text-[#1a1208] focus:outline-none focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/15 transition-all"
            >
              <option value="motorcycle">Motorcycle</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Car</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40 mb-1.5">Plate Number</label>
            <input
              type="text"
              placeholder="e.g. ABC 1234"
              value={form.plateNumber}
              onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#1a1208]/[0.09] bg-white text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/30 focus:outline-none focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40 mb-1.5">License Number <span className="normal-case tracking-normal text-[#1a1208]/25 font-medium">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. N01-23-456789"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#1a1208]/[0.09] bg-white text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/30 focus:outline-none focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/15 transition-all"
            />
          </div>

          {err && <p className="text-[12px] text-red-400 font-medium">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c8783a] hover:bg-[#b5692e] disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-[0_6px_20px_rgba(200,120,58,0.28)] transition-all duration-300 active:scale-[0.98] mt-2"
          >
            {loading ? "Registering…" : "Start Delivering"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main driver dashboard ────────────────────────────────────────────────────
export default function DriverDashboard() {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [available, setAvailable] = useState<AvailableOrder[]>([]);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkDriver = useCallback(async () => {
    const res = await fetch("/api/driver/register");
    const data: DriverInfo = await res.json();
    setDriverInfo(data);
    return data.isDriver;
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/driver/orders");
    if (!res.ok) return;
    const data = await res.json();
    setAvailable(data.available ?? []);
    setMyOrders(data.myOrders ?? []);
  }, []);

  useEffect(() => {
    checkDriver().then((isDriver) => {
      if (isDriver) fetchOrders().finally(() => setLoading(false));
      else setLoading(false);
    });
  }, [checkDriver, fetchOrders]);

  // Poll every 10s when on the dashboard
  useEffect(() => {
    if (!driverInfo?.isDriver) return;
    pollRef.current = setInterval(fetchOrders, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [driverInfo, fetchOrders]);

  async function acceptOrder(orderId: string) {
    setAccepting(orderId);
    try {
      const res = await fetch(`/api/driver/orders/${orderId}/accept`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Could not accept order");
        return;
      }
      await fetchOrders();
    } finally {
      setAccepting(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c8783a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!driverInfo?.isDriver) {
    return <RegisterForm onRegistered={() => { checkDriver().then(() => fetchOrders().finally(() => setLoading(false))); }} />;
  }

  const activeDelivery = myOrders.find((o) => o.status === "on_the_way" || o.status === "preparing");
  const recentDeliveries = myOrders.filter((o) => o.status === "delivered").slice(0, 5);

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] text-[#1a1208]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#1a1208]/[0.06]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-playfair text-[1.15rem] font-bold tracking-tight">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </Link>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#1a1208]/35 font-medium border border-[#1a1208]/10 px-2 py-0.5 rounded-full">Rider</span>
          </div>
          <div className="flex items-center gap-3">
            {driverInfo?.driver?.firstName && (
              <span className="text-[12px] text-[#1a1208]/50 font-medium hidden sm:block">
                {driverInfo.driver.firstName} {driverInfo.driver.lastName}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[11px] text-[#1a1208]/45 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-8">

        {/* ── Active delivery ── */}
        {activeDelivery && (
          <section>
            <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-3">Active Delivery</p>
            <Link
              href={`/driver/order/${activeDelivery.id}`}
              className="block bg-[#1a1208] rounded-[1.5rem] p-5 hover:bg-[#2a1e0e] transition-colors duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-playfair text-[1.2rem] font-bold text-white leading-tight mb-1">
                    {activeDelivery.restaurantName ?? "Order"}
                  </p>
                  <p className="text-[11.5px] text-white/45">{timeAgo(activeDelivery.createdAt)}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full flex-shrink-0 ${
                  activeDelivery.status === "on_the_way"
                    ? "bg-[#3b82f6]/20 text-[#93c5fd]"
                    : "bg-[#c8783a]/20 text-[#fdba74]"
                }`}>
                  {activeDelivery.status === "on_the_way" ? "On the Way" : "Preparing"}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="opacity-45 flex-shrink-0">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <p className="text-[12.5px] text-white/60 font-medium">{activeDelivery.deliveryAddress}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#c8783a]">₱{activeDelivery.totalAmount.toLocaleString()}</span>
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-white/70">
                  {activeDelivery.status === "on_the_way" ? "Upload proof →" : "Confirm pickup →"}
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* ── Available orders ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40">Available Orders</p>
            <button onClick={fetchOrders} className="text-[11px] text-[#c8783a] font-semibold hover:text-[#b5692e] transition-colors">
              Refresh
            </button>
          </div>

          {available.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-[#1a1208]/[0.06]">
              <div className="w-12 h-12 rounded-2xl bg-[#1a1208]/[0.04] flex items-center justify-center mb-3">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#1a1208]/20">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#1a1208]/50 mb-0.5">No orders right now</p>
              <p className="text-[11px] text-[#1a1208]/30">New orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {available.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#1a1208]/[0.06] hover:border-[#1a1208]/[0.12] hover:shadow-[0_8px_24px_rgba(26,18,8,0.06)] transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Restaurant image */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f5ede0] flex-shrink-0">
                      {order.restaurantImage ? (
                        <Image src={order.restaurantImage} alt={order.restaurantName ?? ""} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                          <svg width="20" height="20" fill="none" stroke="#1a1208" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-[#1a1208] leading-tight truncate">{order.restaurantName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#1a1208]/35 flex-shrink-0">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p className="text-[11.5px] text-[#1a1208]/45 truncate">{order.deliveryAddress}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[12px] font-bold text-[#c8783a]">₱{order.totalAmount.toLocaleString()}</span>
                        <span className="text-[#1a1208]/15 text-[10px]">·</span>
                        <span className="text-[11px] text-[#1a1208]/35">{PAYMENT_LABELS[order.paymentMethod ?? ""] ?? order.paymentMethod}</span>
                        <span className="text-[#1a1208]/15 text-[10px]">·</span>
                        <span className="text-[11px] text-[#1a1208]/35">{timeAgo(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      onClick={() => acceptOrder(order.id)}
                      disabled={accepting === order.id || !!activeDelivery}
                      className="w-full py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#c8783a] text-white hover:bg-[#b5692e] shadow-[0_4px_14px_rgba(200,120,58,0.25)]"
                    >
                      {accepting === order.id ? "Accepting…" : activeDelivery ? "Finish current delivery first" : "Accept Order"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recent deliveries ── */}
        {recentDeliveries.length > 0 && (
          <section>
            <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-3">Recent Deliveries</p>
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] divide-y divide-[#1a1208]/[0.05] overflow-hidden">
              {recentDeliveries.map((order) => (
                <Link
                  key={order.id}
                  href={`/driver/order/${order.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-[#1a1208]/[0.02] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1208] truncate">{order.restaurantName}</p>
                    <p className="text-[11px] text-[#1a1208]/40 mt-0.5">{timeAgo(order.deliveredAt ?? order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[12px] font-bold text-[#1a1208]">₱{order.totalAmount.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      Done
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
