"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type OrderDetail = {
  id: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  createdAt: string | null;
  deliveryPhotoUrl: string | null;
  deliveredAt: string | null;
  restaurantName: string | null;
  restaurantImage: string | null;
  items: { orderId: string; quantity: number; unitPrice: number; name: string | null }[];
};

const PAYMENT_LABELS: Record<string, string> = {
  gcash: "GCash", card: "Credit / Debit Card", cod: "Cash on Delivery", corporate: "Corporate Billing",
};

const STATUS_STEPS = [
  { key: "preparing",  label: "Preparing",   desc: "Restaurant is preparing the order." },
  { key: "on_the_way", label: "On the Way",  desc: "You've picked up the order — heading to customer." },
  { key: "delivered",  label: "Delivered",   desc: "Order delivered. Great job!" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#1a1208]/35 mb-3">
      {children}
    </p>
  );
}

export default function DriverOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOrder = useCallback(async () => {
    const res = await fetch("/api/driver/orders");
    if (!res.ok) return;
    const data = await res.json();
    const all: OrderDetail[] = [...(data.myOrders ?? [])];
    const found = all.find((o) => o.id === id);
    if (found) setOrder(found);
  }, [id]);

  useEffect(() => {
    fetchOrder().finally(() => setLoading(false));

    const supabase = createClient();
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, () => {
        fetchOrder();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrder, id]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadErr("");
  }

  async function confirmPickup() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/driver/orders/${id}/pickup`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      await fetchOrder();
    } catch {
      alert("Could not confirm pickup. Try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmDelivery() {
    if (!photoFile) { setUploadErr("Please take or upload a delivery photo first."); return; }
    setActionLoading(true);
    setUploadErr("");
    try {
      const fd = new FormData();
      fd.append("photo", photoFile);
      const res = await fetch(`/api/driver/orders/${id}/deliver`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      await fetchOrder();
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c8783a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex flex-col items-center justify-center gap-3 px-5">
        <p className="font-playfair text-xl font-semibold text-[#1a1208]">Order not found</p>
        <Link href="/driver" className="text-sm text-[#c8783a] font-semibold underline underline-offset-4">← Back to dashboard</Link>
      </div>
    );
  }

  const stepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "delivered";
  const itemsTotal = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const feesAndTax = order.totalAmount - itemsTotal;

  return (
    <div className="min-h-[100dvh] bg-[#F4F0EB] text-[#1a1208]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#1a1208]/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/driver")}
            className="w-8 h-8 rounded-xl bg-[#1a1208]/[0.05] hover:bg-[#1a1208]/10 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-playfair text-[1.1rem] font-bold text-[#1a1208] truncate">{order.restaurantName}</p>
            <p className="text-[11px] text-[#1a1208]/35 font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          {/* Status badge */}
          <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] ${
            isDelivered
              ? "bg-[#10b981]/10 text-[#10b981]"
              : order.status === "on_the_way"
              ? "bg-blue-50 text-blue-500"
              : "bg-[#c8783a]/10 text-[#c8783a]"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDelivered ? "bg-[#10b981]" : order.status === "on_the_way" ? "bg-blue-400 animate-pulse" : "bg-[#c8783a] animate-pulse"}`} />
            {isDelivered ? "Delivered" : order.status === "on_the_way" ? "On the Way" : "Preparing"}
          </span>
          <Link href="/" className="font-playfair text-[1rem] font-bold tracking-tight flex-shrink-0">
            Foodie<span className="text-[#c8783a]">.ph</span>
          </Link>
        </div>
      </div>

      {/* ── Body: 2-column grid on lg+ ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* Progress tracker */}
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6">
              <SectionLabel>Delivery Progress</SectionLabel>
              <div className="flex items-start">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= stepIdx;
                  const active = i === stepIdx;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center gap-2 relative">
                      {i < STATUS_STEPS.length - 1 && (
                        <div className="absolute left-1/2 top-4 w-full h-[2px] bg-[#1a1208]/[0.07]">
                          <div className="h-full bg-[#c8783a] transition-all duration-700" style={{ width: i < stepIdx ? "100%" : "0%" }} />
                        </div>
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${done ? "bg-[#c8783a] shadow-[0_4px_12px_rgba(200,120,58,0.3)]" : "bg-[#1a1208]/[0.06]"}`}>
                        {done ? (
                          <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#1a1208]/15" />
                        )}
                        {active && !isDelivered && (
                          <span className="absolute inset-0 rounded-full bg-[#c8783a]/20 animate-ping" />
                        )}
                      </div>
                      <p className={`text-[11px] font-bold text-center leading-tight px-1 ${done ? "text-[#1a1208]" : "text-[#1a1208]/30"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {stepIdx >= 0 && (
                <p className="text-[12px] text-[#1a1208]/45 mt-5 text-center font-light leading-relaxed border-t border-[#1a1208]/[0.05] pt-4">
                  {STATUS_STEPS[stepIdx]?.desc}
                </p>
              )}
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6">
              <SectionLabel>Deliver To</SectionLabel>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#c8783a]/[0.08] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1a1208] leading-snug">{order.deliveryAddress}</p>
                  <p className="text-[11px] text-[#1a1208]/35 mt-0.5 font-medium">Customer delivery address</p>
                </div>
              </div>
            </div>

            {/* Delivery proof (completed) */}
            {isDelivered && order.deliveryPhotoUrl && (
              <div className="bg-white rounded-2xl border border-[#10b981]/25 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                    <svg width="13" height="13" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p className="text-[13px] font-bold text-[#10b981]">Delivery Completed</p>
                </div>
                <div className="relative w-full h-56 rounded-xl overflow-hidden bg-[#F4F0EB]">
                  <Image src={order.deliveryPhotoUrl} alt="Delivery proof" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 700px" />
                </div>
              </div>
            )}

            {/* Actions */}
            {!isDelivered && (
              <div className="space-y-3">
                {order.status === "preparing" && (
                  <button
                    onClick={confirmPickup}
                    disabled={actionLoading}
                    className="w-full bg-[#c8783a] hover:bg-[#b5692e] disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-[15px] shadow-[0_8px_24px_rgba(200,120,58,0.25)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {actionLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Confirming…</>
                    ) : (
                      <>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                        I&apos;ve Picked Up the Order
                      </>
                    )}
                  </button>
                )}

                {order.status === "on_the_way" && (
                  <div className="space-y-3">
                    <div className="bg-white rounded-2xl border border-[#1a1208]/[0.07] p-6">
                      <SectionLabel>Delivery Proof Photo</SectionLabel>
                      {photoPreview ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-52 rounded-xl overflow-hidden">
                            <Image src={photoPreview} alt="Preview" fill className="object-cover" sizes="100vw" />
                            <button
                              onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1a1208]/60 flex items-center justify-center"
                            >
                              <svg width="11" height="11" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 6 6 18m0-12 12 12"/></svg>
                            </button>
                          </div>
                          <p className="text-[11px] text-[#1a1208]/40 text-center">{photoFile?.name}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-[#1a1208]/15 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-[#c8783a]/40 hover:bg-[#c8783a]/[0.02] transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#c8783a]/[0.08] flex items-center justify-center">
                            <svg width="20" height="20" fill="none" stroke="#c8783a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                              <circle cx="12" cy="13" r="4"/>
                            </svg>
                          </div>
                          <p className="text-[13px] font-semibold text-[#1a1208]/60">Take or upload a photo</p>
                          <p className="text-[11px] text-[#1a1208]/30">Required to confirm delivery</p>
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                    </div>

                    {uploadErr && <p className="text-[12px] text-red-400 font-medium px-1">{uploadErr}</p>}

                    <button
                      onClick={confirmDelivery}
                      disabled={actionLoading || !photoFile}
                      className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-[15px] shadow-[0_8px_24px_rgba(16,185,129,0.25)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      {actionLoading ? (
                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Uploading…</>
                      ) : (
                        <>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Confirm Delivery
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Order summary ── */}
          <div className="space-y-5">

            {/* Restaurant hero */}
            {order.restaurantImage && (
              <div className="relative h-36 rounded-2xl overflow-hidden">
                <Image src={order.restaurantImage} alt={order.restaurantName ?? ""} fill className="object-cover" sizes="380px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="font-playfair text-white font-bold text-[1.1rem] leading-tight">{order.restaurantName}</p>
                </div>
              </div>
            )}

            {/* Order items */}
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <SectionLabel>{order.items.length} Item{order.items.length !== 1 ? "s" : ""}</SectionLabel>
              </div>
              <div className="divide-y divide-[#1a1208]/[0.05]">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-bold text-[#1a1208]/25 w-5 tabular-nums flex-shrink-0">{item.quantity}×</span>
                      <span className="text-[13px] font-medium text-[#1a1208] truncate">{item.name}</span>
                    </div>
                    <span className="text-[12px] font-bold text-[#1a1208] flex-shrink-0 ml-3 tabular-nums">
                      ₱{(item.quantity * item.unitPrice).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1a1208]/[0.06] bg-[#F4F0EB]/60 px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#1a1208]/45">Items subtotal</span>
                  <span className="text-[12px] font-semibold text-[#1a1208] tabular-nums">₱{itemsTotal.toLocaleString()}</span>
                </div>
                {feesAndTax > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#1a1208]/45">Fees &amp; tax</span>
                    <span className="text-[12px] font-semibold text-[#1a1208] tabular-nums">₱{feesAndTax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#1a1208]/[0.07]">
                  <span className="text-[13px] font-bold text-[#1a1208]">Total</span>
                  <span className="font-playfair text-[1.25rem] font-bold text-[#1a1208]">₱{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1a1208]/[0.04] flex items-center justify-center">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#1a1208]/40">
                    <rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>
                  </svg>
                </div>
                <p className="text-[11.5px] text-[#1a1208]/45 font-medium">Payment method</p>
              </div>
              <p className="text-[13px] font-semibold text-[#1a1208]">
                {PAYMENT_LABELS[order.paymentMethod ?? ""] ?? order.paymentMethod}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
