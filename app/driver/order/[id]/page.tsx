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
  items: {
    orderId: string;
    quantity: number;
    unitPrice: number;
    name: string | null;
  }[];
};

const PAYMENT_LABELS: Record<string, string> = {
  gcash: "GCash",
  card: "Credit / Debit Card",
  cod: "Cash on Delivery",
  corporate: "Corporate Billing",
};

const STATUS_STEPS = [
  {
    key: "ready_for_pickup",
    label: "Ready for Pickup",
    desc: "Restaurant has finished preparing. Head to the restaurant to pick up.",
    shortDesc: "At restaurant",
  },
  {
    key: "on_the_way",
    label: "On the Way",
    desc: "You've picked up the order — heading to customer.",
    shortDesc: "In transit",
  },
  {
    key: "delivered",
    label: "Delivered",
    desc: "Order delivered. Great job!",
    shortDesc: "Complete",
  },
];

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function OrderSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[#F4F0EB]">
      <div className="border-b border-[#1a1208]/[0.06] bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-8 h-8 bg-[#1a1208]/[0.05] rounded-xl animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="w-40 h-4 bg-[#1a1208]/[0.06] rounded-lg animate-pulse" />
            <div className="w-24 h-3 bg-[#1a1208]/[0.04] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6 animate-pulse">
              <div className="h-3 w-32 bg-[#1a1208]/[0.06] rounded mb-6" />
              <div className="flex justify-between items-center">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1a1208]/[0.06]" />
                    <div className="w-12 h-2.5 rounded bg-[#1a1208]/[0.04]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6 h-24 animate-pulse" />
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6 h-14 animate-pulse" />
          </div>
          <div className="space-y-5">
            <div className="h-36 rounded-2xl bg-[#1a1208]/[0.06] animate-pulse" />
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] h-48 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      const res = await fetch(`/api/driver/orders/${id}/pickup`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      await fetchOrder();
    } catch {
      alert("Could not confirm pickup. Try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmDelivery() {
    if (!photoFile) {
      setUploadErr("Please take or upload a delivery photo first.");
      return;
    }
    setActionLoading(true);
    setUploadErr("");
    try {
      const fd = new FormData();
      fd.append("photo", photoFile);
      const res = await fetch(`/api/driver/orders/${id}/deliver`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      await fetchOrder();
    } catch (err) {
      setUploadErr(
        err instanceof Error ? err.message : "Upload failed. Try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <OrderSkeleton />;

  if (!order) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex flex-col items-center justify-center gap-4 px-5">
        <div className="w-14 h-14 rounded-2xl bg-[#1a1208]/[0.04] flex items-center justify-center">
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            className="text-[#1a1208]/25"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">
            Order not found
          </p>
          <p className="text-[12px] text-[#1a1208]/40">
            This order may have been reassigned.
          </p>
        </div>
        <Link
          href="/driver"
          className="text-sm text-[#c8783a] font-semibold border border-[#c8783a]/25 px-4 py-2 rounded-xl hover:bg-[#c8783a]/5 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const stepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "delivered";
  const itemsTotal = order.items.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0
  );
  const feesAndTax = order.totalAmount - itemsTotal;

  return (
    <div className="min-h-[100dvh] bg-[#F4F0EB] text-[#1a1208]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#1a1208]/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/driver")}
            className="w-8 h-8 rounded-xl bg-[#1a1208]/[0.05] hover:bg-[#1a1208]/10 flex items-center justify-center transition-colors flex-shrink-0 active:scale-[0.97]"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-playfair text-[1.05rem] font-bold text-[#1a1208] truncate leading-tight">
              {order.restaurantName}
            </p>
            <p className="text-[10.5px] text-[#1a1208]/35 font-medium">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] ${
              isDelivered
                ? "bg-[#10b981]/10 text-[#10b981]"
                : order.status === "on_the_way"
                ? "bg-blue-50 text-blue-500"
                : "bg-[#c8783a]/10 text-[#c8783a]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDelivered
                  ? "bg-[#10b981]"
                  : order.status === "on_the_way"
                  ? "bg-blue-400 animate-pulse"
                  : "bg-[#c8783a] animate-pulse"
              }`}
            />
            {isDelivered
              ? "Delivered"
              : order.status === "on_the_way"
              ? "On the Way"
              : "Preparing"}
          </span>
          <Link
            href="/"
            className="font-playfair text-[1rem] font-bold tracking-tight flex-shrink-0"
          >
            Foodie<span className="text-[#c8783a]">.ph</span>
          </Link>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* Delivery completed hero */}
            {isDelivered && (
              <div className="bg-[#10b981] rounded-2xl p-6 flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white leading-tight">
                    Delivery Complete
                  </p>
                  <p className="text-[12px] text-white/60 mt-0.5">
                    {timeAgo(order.deliveredAt ?? order.createdAt)} &middot;{" "}
                    <span className="font-semibold text-white/80">
                      ₱{order.totalAmount.toLocaleString()}
                    </span>{" "}
                    earned
                  </p>
                </div>
              </div>
            )}

            {/* Progress tracker */}
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6">
              <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#1a1208]/35 mb-6">
                Delivery Progress
              </p>
              <div className="relative">
                {/* Track line */}
                <div className="absolute top-4 left-4 right-4 h-[2px] bg-[#1a1208]/[0.07]">
                  <div
                    className="h-full bg-[#c8783a] transition-all duration-700"
                    style={{
                      width:
                        stepIdx === 0
                          ? "0%"
                          : stepIdx === 1
                          ? "50%"
                          : "100%",
                    }}
                  />
                </div>

                <div className="relative flex items-start justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= stepIdx;
                    const active = i === stepIdx;
                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center gap-2.5 flex-1"
                      >
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                            done
                              ? "bg-[#c8783a] shadow-[0_4px_12px_rgba(200,120,58,0.3)]"
                              : "bg-[#f4f0eb] border border-[#1a1208]/[0.10]"
                          }`}
                        >
                          {done ? (
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#1a1208]/15" />
                          )}
                          {active && !isDelivered && (
                            <span className="absolute inset-0 rounded-full bg-[#c8783a]/20 animate-ping" />
                          )}
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-[12px] font-bold leading-tight ${
                              done ? "text-[#1a1208]" : "text-[#1a1208]/30"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 ${
                              done ? "text-[#1a1208]/40" : "text-[#1a1208]/20"
                            }`}
                          >
                            {step.shortDesc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {stepIdx >= 0 && (
                <p className="text-[12px] text-[#1a1208]/45 mt-6 text-center font-light leading-relaxed border-t border-[#1a1208]/[0.05] pt-5">
                  {STATUS_STEPS[stepIdx]?.desc}
                </p>
              )}
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6">
              <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#1a1208]/35 mb-4">
                Deliver To
              </p>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#c8783a]/[0.08] flex items-center justify-center flex-shrink-0">
                  <svg
                    width="17"
                    height="17"
                    fill="none"
                    stroke="#c8783a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1a1208] leading-snug">
                    {order.deliveryAddress}
                  </p>
                  <p className="text-[11px] text-[#1a1208]/35 mt-1 font-medium">
                    Customer delivery address
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery proof (completed) */}
            {isDelivered && order.deliveryPhotoUrl && (
              <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6 space-y-4">
                <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#1a1208]/35">
                  Proof of Delivery
                </p>
                <div className="relative w-full h-60 rounded-xl overflow-hidden bg-[#F4F0EB]">
                  <Image
                    src={order.deliveryPhotoUrl}
                    alt="Delivery proof"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            {!isDelivered && (
              <div className="space-y-3">
                {order.status === "ready_for_pickup" && (
                  <button
                    onClick={confirmPickup}
                    disabled={actionLoading}
                    className="w-full bg-[#c8783a] hover:bg-[#b5692e] disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-[15px] shadow-[0_8px_24px_rgba(200,120,58,0.25)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        I&apos;ve Picked Up the Order
                      </>
                    )}
                  </button>
                )}

                {order.status === "on_the_way" && (
                  <div className="space-y-3">
                    <div className="bg-white rounded-2xl border border-[#1a1208]/[0.07] p-6">
                      <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#1a1208]/35 mb-4">
                        Delivery Proof Photo
                      </p>
                      {photoPreview ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-52 rounded-xl overflow-hidden">
                            <Image
                              src={photoPreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                              sizes="100vw"
                            />
                            <button
                              onClick={() => {
                                setPhotoFile(null);
                                setPhotoPreview(null);
                              }}
                              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#1a1208]/60 hover:bg-[#1a1208]/80 flex items-center justify-center transition-colors"
                            >
                              <svg
                                width="11"
                                height="11"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18 6 6 18m0-12 12 12" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-[11px] text-[#1a1208]/35 text-center">
                            {photoFile?.name}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-[#1a1208]/12 rounded-xl py-12 flex flex-col items-center gap-3 hover:border-[#c8783a]/40 hover:bg-[#c8783a]/[0.02] transition-all duration-300"
                        >
                          <div className="w-12 h-12 rounded-xl bg-[#c8783a]/[0.08] flex items-center justify-center">
                            <svg
                              width="22"
                              height="22"
                              fill="none"
                              stroke="#c8783a"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#1a1208]/60">
                              Take or upload a photo
                            </p>
                            <p className="text-[11px] text-[#1a1208]/30 mt-0.5 text-center">
                              Required to confirm delivery
                            </p>
                          </div>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </div>

                    {uploadErr && (
                      <p className="text-[12px] text-red-400 font-medium px-1">
                        {uploadErr}
                      </p>
                    )}

                    <button
                      onClick={confirmDelivery}
                      disabled={actionLoading || !photoFile}
                      className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-[15px] shadow-[0_8px_24px_rgba(16,185,129,0.25)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
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
            <div className="relative h-40 rounded-2xl overflow-hidden bg-[#1a1208]">
              {order.restaurantImage && (
                <Image
                  src={order.restaurantImage}
                  alt={order.restaurantName ?? ""}
                  fill
                  className="object-cover opacity-70"
                  sizes="380px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/80 via-[#1a1208]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-playfair text-white font-bold text-[1.1rem] leading-tight">
                  {order.restaurantName}
                </p>
                <p className="text-[11px] text-white/45 mt-1 font-medium">
                  Placed {timeAgo(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#1a1208]/35">
                  {order.items.length} Item
                  {order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="divide-y divide-[#1a1208]/[0.05]">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-bold text-[#1a1208]/25 w-5 tabular-nums flex-shrink-0 text-right">
                        {item.quantity}×
                      </span>
                      <span className="text-[13px] font-medium text-[#1a1208] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-[#1a1208] flex-shrink-0 ml-3 tabular-nums">
                      ₱{(item.quantity * item.unitPrice).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1a1208]/[0.06] bg-[#F4F0EB]/60 px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#1a1208]/45">
                    Items subtotal
                  </span>
                  <span className="text-[12px] font-semibold text-[#1a1208] tabular-nums">
                    ₱{itemsTotal.toLocaleString()}
                  </span>
                </div>
                {feesAndTax > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#1a1208]/45">
                      Fees &amp; tax
                    </span>
                    <span className="text-[12px] font-semibold text-[#1a1208] tabular-nums">
                      ₱{feesAndTax.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#1a1208]/[0.07]">
                  <span className="text-[13px] font-bold text-[#1a1208]">
                    Total
                  </span>
                  <span className="font-playfair text-[1.25rem] font-bold text-[#1a1208] tabular-nums">
                    ₱{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment + order meta */}
            <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] divide-y divide-[#1a1208]/[0.05] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1208]/[0.04] flex items-center justify-center">
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      className="text-[#1a1208]/40"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>
                  <p className="text-[11.5px] text-[#1a1208]/45 font-medium">
                    Payment
                  </p>
                </div>
                <p className="text-[13px] font-semibold text-[#1a1208]">
                  {PAYMENT_LABELS[order.paymentMethod ?? ""] ??
                    order.paymentMethod}
                </p>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1208]/[0.04] flex items-center justify-center">
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      className="text-[#1a1208]/40"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <p className="text-[11.5px] text-[#1a1208]/45 font-medium">
                    Ordered
                  </p>
                </div>
                <p className="text-[12px] font-semibold text-[#1a1208]/60">
                  {timeAgo(order.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
