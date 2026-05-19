"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

type Application = {
  id: string;
  status: "pending" | "approved" | "denied";
  adminNotes: string | null;
  createdAt: string | null;
};

type DriverInfo = {
  isDriver: boolean;
  driver: {
    firstName: string | null;
    lastName: string | null;
    vehicleType: string | null;
    plateNumber: string | null;
    licenseNumber: string | null;
  } | null;
  profileName: { firstName: string; lastName: string };
  application: Application | null;
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const PAYMENT_LABELS: Record<string, string> = {
  gcash: "GCash",
  card: "Card",
  cod: "Cash",
  corporate: "Corporate",
};

const VEHICLE_ICONS: Record<string, string> = {
  motorcycle: "M",
  bicycle: "B",
  car: "C",
};

// ── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonPulse({ className }: { className: string }) {
  return (
    <div className={`bg-[#1a1208]/[0.06] rounded-xl animate-pulse ${className}`} />
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7]">
      <div className="border-b border-[#1a1208]/[0.06] bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <SkeletonPulse className="w-28 h-5" />
          <SkeletonPulse className="w-20 h-5" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-4">
            <SkeletonPulse className="w-32 h-3 mb-5" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <SkeletonPulse className="w-14 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <SkeletonPulse className="w-40 h-4" />
                    <SkeletonPulse className="w-56 h-3" />
                    <SkeletonPulse className="w-28 h-3" />
                  </div>
                </div>
                <SkeletonPulse className="w-full h-10 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <SkeletonPulse className="w-full h-36 rounded-2xl" />
            <SkeletonPulse className="w-full h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Validation helpers ────────────────────────────────────────────────────────
const PLATE_RE = /^[A-Z0-9]{2,4}[\s-]?[A-Z0-9]{1,5}$/i;
const LICENSE_RE = /^[A-Z]\d{2}-\d{2}-\d{6}$/i;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_MB = 5;

function validateDriverForm(
  form: { plateNumber: string; licenseNumber: string },
  govIdFile: File | null,
) {
  const errs: Record<string, string> = {};
  const plate = form.plateNumber.trim();
  if (!plate) errs.plateNumber = "Plate number is required.";
  else if (!PLATE_RE.test(plate)) errs.plateNumber = "Enter a valid plate number (e.g. ABC 1234).";

  const lic = form.licenseNumber.trim();
  if (!lic) errs.licenseNumber = "License number is required.";
  else if (!LICENSE_RE.test(lic)) errs.licenseNumber = "Enter a valid license number (e.g. N01-23-456789).";

  if (!govIdFile) {
    errs.govId = "A government-issued ID is required.";
  } else if (!ALLOWED_TYPES.includes(govIdFile.type)) {
    errs.govId = "Only JPG, PNG, WebP, or PDF files are accepted.";
  } else if (govIdFile.size > MAX_FILE_MB * 1024 * 1024) {
    errs.govId = `File must be under ${MAX_FILE_MB} MB.`;
  }

  return errs;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[11.5px] text-red-500 font-medium mt-0.5">{msg}</p>;
}

function inputCls(hasError?: boolean) {
  return `w-full px-4 py-3 rounded-xl border text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/30 focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-400/15"
      : "border-[#1a1208]/[0.09] bg-white focus:border-[#c8783a]/50 focus:ring-[#c8783a]/15"
  }`;
}

// ── Application form ─────────────────────────────────────────────────────────
function ApplyForm({
  firstName,
  lastName,
  onSubmitted,
}: {
  firstName: string;
  lastName: string;
  onSubmitted: () => void;
}) {
  const [form, setForm] = useState({
    firstName,
    lastName,
    licenseNumber: "",
    vehicleType: "motorcycle",
    plateNumber: "",
  });
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  function touch(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function revalidate(nextForm = form, nextFile = govIdFile) {
    const errs = validateDriverForm(nextForm, nextFile);
    setErrors(errs);
    return errs;
  }

  function handlePlateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9\s-]/g, "");
    const next = { ...form, plateNumber: val };
    setForm(next);
    if (touched.plateNumber) revalidate(next, govIdFile);
  }

  function handleLicenseChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const next = { ...form, licenseNumber: val };
    setForm(next);
    if (touched.licenseNumber) revalidate(next, govIdFile);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setGovIdFile(file);
    touch("govId");
    revalidate(form, file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ plateNumber: true, licenseNumber: true, govId: true });
    const errs = revalidate(form, govIdFile);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerErr("");
    try {
      const fd = new FormData();
      fd.append("vehicleType", form.vehicleType);
      fd.append("plateNumber", form.plateNumber.trim());
      fd.append("licenseNumber", form.licenseNumber.trim());
      fd.append("govId", govIdFile!);

      const res = await fetch("/api/driver/apply", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      onSubmitted();
    } catch (e) {
      setServerErr(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Decorative panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1a1208] p-14 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `radial-gradient(circle at 30% 50%, #c8783a 0%, transparent 60%), radial-gradient(circle at 80% 20%, #c8783a 0%, transparent 50%)` }}
        />
        <Link href="/" className="font-playfair text-[1.35rem] font-bold tracking-tight text-white relative z-10">
          Foodie<span className="text-[#c8783a]">.ph</span>
          <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium">Rider</span>
        </Link>
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] font-bold text-white/30 mb-4">Why ride with us</p>
            {[
              { title: "Flexible schedule", body: "Accept orders on your own time. Go online when it works for you." },
              { title: "Fast payouts", body: "Earnings deposited within 24 hours of each completed delivery." },
              { title: "Priority support", body: "Dedicated driver support line, available 7 days a week." },
            ].map((item) => (
              <div key={item.title} className="py-5 border-t border-white/[0.07] first:border-t-0">
                <p className="text-[14px] font-semibold text-white mb-1">{item.title}</p>
                <p className="text-[12px] text-white/40 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/20">&copy; 2025 Foodie.ph. All rights reserved.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="font-playfair text-[1.25rem] font-bold tracking-tight text-[#1a1208]">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#1a1208]/35 font-medium">Driver</span>
          </Link>

          <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-3">Apply Now</p>
          <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-tight mb-2">Become a Rider</h1>
          <p className="text-[13px] text-[#1a1208]/45 font-light leading-relaxed mb-8">
            Submit your application and our team will review it within 1–2 business days.
          </p>

          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "First Name", value: form.firstName },
                { label: "Last Name", value: form.lastName },
              ].map((f) => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">{f.label}</label>
                  <input
                    type="text" readOnly value={f.value}
                    className="w-full px-4 py-3 rounded-xl border border-[#1a1208]/[0.09] bg-[#1a1208]/[0.03] text-[13.5px] text-[#1a1208] cursor-default select-none focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">Vehicle Type</label>
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

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">
                Plate Number <span className="normal-case tracking-normal text-red-400 font-medium">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ABC 1234"
                value={form.plateNumber}
                onChange={handlePlateChange}
                onBlur={() => { touch("plateNumber"); revalidate(); }}
                maxLength={12}
                className={inputCls(touched.plateNumber && !!errors.plateNumber)}
              />
              <FieldError msg={touched.plateNumber ? errors.plateNumber : undefined} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">
                License Number <span className="normal-case tracking-normal text-red-400 font-medium">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. N01-23-456789"
                value={form.licenseNumber}
                onChange={handleLicenseChange}
                onBlur={() => { touch("licenseNumber"); revalidate(); }}
                maxLength={15}
                className={inputCls(touched.licenseNumber && !!errors.licenseNumber)}
              />
              <FieldError msg={touched.licenseNumber ? errors.licenseNumber : undefined} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">
                Government-Issued ID <span className="normal-case tracking-normal text-red-400 font-medium">*</span>
              </label>
              <label className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                touched.govId && errors.govId
                  ? "border-red-400 bg-red-50/40"
                  : govIdFile
                  ? "border-[#c8783a]/40 bg-[#c8783a]/5"
                  : "border-[#1a1208]/[0.09] bg-white hover:border-[#c8783a]/30"
              }`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1208]/40 shrink-0">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-[13px] text-[#1a1208]/50 truncate">
                  {govIdFile ? govIdFile.name : "Upload photo of your ID"}
                </span>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
              </label>
              <FieldError msg={touched.govId ? errors.govId : undefined} />
              {!errors.govId && <p className="text-[10.5px] text-[#1a1208]/35">JPG, PNG, WebP, or PDF · Max {MAX_FILE_MB} MB</p>}
            </div>

            {serverErr && (
              <div className="flex items-center gap-2.5 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {serverErr}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#c8783a] hover:bg-[#b5692e] disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-[0_6px_20px_rgba(200,120,58,0.28)] transition-all duration-300 active:scale-[0.98] mt-2"
            >
              {loading ? "Submitting…" : "Submit Application"}
            </button>

            <p className="text-center text-[11px] text-[#1a1208]/30 leading-relaxed">
              Applications are reviewed within 1–2 business days. You will be notified once a decision is made.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Application status screens ────────────────────────────────────────────────
function ApplicationPending({ createdAt }: { createdAt: string | null }) {
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.26em] font-bold text-amber-500 mb-2">Under Review</p>
          <h1 className="font-playfair text-[1.8rem] font-bold text-[#1a1208] leading-tight mb-2">Application Pending</h1>
          <p className="text-[13px] text-[#1a1208]/45 leading-relaxed">
            Your rider application is being reviewed by our team. This usually takes 1–2 business days.
          </p>
          {createdAt && (
            <p className="text-[11px] text-[#1a1208]/30 mt-3">Submitted {timeAgo(createdAt)}</p>
          )}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#1a1208]/50 hover:text-[#c8783a] transition-colors duration-200"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function ApplicationDenied({
  adminNotes,
  onReapply,
}: {
  adminNotes: string | null;
  onReapply: () => void;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.26em] font-bold text-red-400 mb-2">Not Approved</p>
          <h1 className="font-playfair text-[1.8rem] font-bold text-[#1a1208] leading-tight mb-2">Application Denied</h1>
          <p className="text-[13px] text-[#1a1208]/45 leading-relaxed">
            Unfortunately, your application was not approved at this time.
          </p>
          {adminNotes && (
            <div className="mt-4 text-left bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-red-400 mb-1">Reason</p>
              <p className="text-[12.5px] text-[#1a1208]/60 leading-relaxed">{adminNotes}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={onReapply}
            className="w-full bg-[#c8783a] hover:bg-[#b5692e] text-white py-3 rounded-xl font-semibold text-[13px] transition-all duration-300 active:scale-[0.98]"
          >
            Apply Again
          </button>
          <Link href="/" className="text-[12px] font-semibold text-[#1a1208]/40 hover:text-[#c8783a] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Stats sidebar panel ──────────────────────────────────────────────────────
function StatsPanel({ driver, myOrders }: { driver: DriverInfo["driver"]; myOrders: MyOrder[] }) {
  const todayStr = new Date().toDateString();

  const todayDeliveries = useMemo(
    () => myOrders.filter((o) => o.status === "delivered" && new Date(o.deliveredAt ?? o.createdAt ?? "").toDateString() === todayStr),
    [myOrders, todayStr]
  );
  const todayEarnings = useMemo(() => todayDeliveries.reduce((s, o) => s + o.totalAmount, 0), [todayDeliveries]);
  const allDelivered = useMemo(() => myOrders.filter((o) => o.status === "delivered"), [myOrders]);
  const initials = [driver?.firstName?.[0], driver?.lastName?.[0]].filter(Boolean).join("").toUpperCase();

  return (
    <div className="space-y-4">
      <div className="bg-[#1a1208] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle at 80% 20%, #c8783a 0%, transparent 55%)` }} />
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#c8783a]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[14px] font-bold text-[#c8783a]">{initials || "R"}</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-white leading-tight">{driver?.firstName} {driver?.lastName}</p>
              <p className="text-[11px] text-white/35 mt-0.5 font-medium">
                {driver?.vehicleType ? driver.vehicleType.charAt(0).toUpperCase() + driver.vehicleType.slice(1) : "Rider"} &middot; {driver?.plateNumber || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[10px] text-white/40 font-medium">Online</span>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          <div className="bg-white/[0.06] rounded-xl px-4 py-3 border border-white/[0.06]">
            <p className="text-[10px] text-white/35 uppercase tracking-[0.16em] font-medium mb-1">Today</p>
            <p className="text-[1.4rem] font-bold text-white leading-none tabular-nums">{todayDeliveries.length}</p>
            <p className="text-[10px] text-white/30 mt-0.5">deliveries</p>
          </div>
          <div className="bg-white/[0.06] rounded-xl px-4 py-3 border border-white/[0.06]">
            <p className="text-[10px] text-white/35 uppercase tracking-[0.16em] font-medium mb-1">Earned</p>
            <p className="text-[1.4rem] font-bold text-[#c8783a] leading-none tabular-nums">₱{todayEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-white/30 mt-0.5">today</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] px-5 py-4 flex items-center justify-between">
        <div className="text-center">
          <p className="text-[10px] text-[#1a1208]/35 uppercase tracking-[0.14em] font-medium mb-0.5">Total</p>
          <p className="text-[1.1rem] font-bold text-[#1a1208] tabular-nums">{allDelivered.length}</p>
          <p className="text-[10px] text-[#1a1208]/35">deliveries</p>
        </div>
        <div className="w-px h-10 bg-[#1a1208]/[0.07]" />
        <div className="text-center">
          <p className="text-[10px] text-[#1a1208]/35 uppercase tracking-[0.14em] font-medium mb-0.5">This week</p>
          <p className="text-[1.1rem] font-bold text-[#1a1208] tabular-nums">
            {allDelivered.filter((o) => {
              if (!o.deliveredAt) return false;
              const d = new Date(o.deliveredAt);
              const now = new Date();
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              weekStart.setHours(0, 0, 0, 0);
              return d >= weekStart;
            }).length}
          </p>
          <p className="text-[10px] text-[#1a1208]/35">deliveries</p>
        </div>
        <div className="w-px h-10 bg-[#1a1208]/[0.07]" />
        <div className="text-center">
          <p className="text-[10px] text-[#1a1208]/35 uppercase tracking-[0.14em] font-medium mb-0.5">Vehicle</p>
          <p className="text-[1.1rem] font-bold text-[#1a1208] tabular-nums">{VEHICLE_ICONS[driver?.vehicleType ?? ""] ?? "—"}</p>
          <p className="text-[10px] text-[#1a1208]/35">{driver?.vehicleType ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}

// ── Recent deliveries sidebar list ───────────────────────────────────────────
function RecentDeliveriesList({ orders }: { orders: MyOrder[] }) {
  const recent = orders.filter((o) => o.status === "delivered").slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6 text-center">
        <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-4">Recent Deliveries</p>
        <p className="text-[12px] text-[#1a1208]/30 leading-relaxed">Completed deliveries will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40">Recent Deliveries</p>
      </div>
      <div className="divide-y divide-[#1a1208]/[0.05]">
        {recent.map((order) => (
          <Link
            key={order.id}
            href={`/driver/order/${order.id}`}
            className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#1a1208]/[0.02] transition-colors duration-200 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#f5ede0] flex-shrink-0">
                {order.restaurantImage ? (
                  <Image src={order.restaurantImage} alt="" fill className="object-cover" sizes="32px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#c8783a]/50">{order.restaurantName?.[0] ?? "?"}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-[#1a1208] truncate">{order.restaurantName}</p>
                <p className="text-[10.5px] text-[#1a1208]/40 mt-0.5">{timeAgo(order.deliveredAt ?? order.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[12px] font-bold text-[#1a1208] tabular-nums">₱{order.totalAmount.toLocaleString()}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            </div>
          </Link>
        ))}
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
  const [showApplyForm, setShowApplyForm] = useState(false);
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

  if (loading) return <DashboardSkeleton />;
  if (!driverInfo) return <DashboardSkeleton />;

  // Approved driver → show dashboard
  if (driverInfo.isDriver) {
    const activeDelivery = myOrders.find((o) => o.status === "on_the_way" || o.status === "preparing");

    return (
      <div className="min-h-[100dvh] bg-[#F4F0EB] text-[#1a1208]">
        <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#1a1208]/[0.06]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-playfair text-[1.15rem] font-bold tracking-tight">
                Foodie<span className="text-[#c8783a]">.ph</span>
              </Link>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#1a1208]/35 font-medium border border-[#1a1208]/10 px-2 py-0.5 rounded-full">Rider</span>
            </div>
            <div className="flex items-center gap-4">
              {driverInfo.driver?.firstName && (
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeDelivery && (
            <div className="mb-8">
              <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-3">Active Delivery</p>
              <Link
                href={`/driver/order/${activeDelivery.id}`}
                className="block bg-[#1a1208] rounded-[1.75rem] p-6 lg:p-8 hover:bg-[#2a1e0e] transition-colors duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle at 70% 50%, #c8783a 0%, transparent 55%)` }} />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                        {activeDelivery.restaurantImage ? (
                          <Image src={activeDelivery.restaurantImage} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white/30 text-[10px] font-bold">{activeDelivery.restaurantName?.[0]}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-playfair text-[1.25rem] font-bold text-white leading-tight">{activeDelivery.restaurantName ?? "Order"}</p>
                        <p className="text-[11.5px] text-white/40 mt-0.5">{timeAgo(activeDelivery.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="opacity-40 flex-shrink-0 mt-0.5">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <p className="text-[13px] text-white/55 font-medium leading-snug">{activeDelivery.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full ${activeDelivery.status === "on_the_way" ? "bg-[#3b82f6]/20 text-[#93c5fd]" : "bg-[#c8783a]/20 text-[#fdba74]"}`}>
                      {activeDelivery.status === "on_the_way" ? "On the Way" : "Preparing"}
                    </span>
                    <div className="text-right">
                      <p className="text-[1.35rem] font-bold text-[#c8783a] tabular-nums leading-none">₱{activeDelivery.totalAmount.toLocaleString()}</p>
                      <p className="text-[11px] text-white/35 mt-1 font-medium group-hover:text-white/55 transition-colors">
                        {activeDelivery.status === "on_the_way" ? "Upload proof →" : "Confirm pickup →"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40">Available Orders</p>
                  {available.length > 0 && (
                    <p className="text-[12px] text-[#1a1208]/50 mt-0.5">{available.length} order{available.length !== 1 ? "s" : ""} waiting nearby</p>
                  )}
                </div>
                <button
                  onClick={fetchOrders}
                  className="flex items-center gap-1.5 text-[11px] text-[#c8783a] font-semibold hover:text-[#b5692e] transition-colors duration-200 active:scale-[0.97]"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                  Refresh
                </button>
              </div>

              {available.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-[#1a1208]/[0.06]">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a1208]/[0.04] flex items-center justify-center mb-4">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#1a1208]/20">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <p className="text-[14px] font-semibold text-[#1a1208]/50 mb-1">No orders right now</p>
                  <p className="text-[12px] text-[#1a1208]/30 max-w-[200px] leading-relaxed">New orders will appear here. Checking every 10 seconds.</p>
                  <div className="flex gap-1 mt-5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#c8783a]/30 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {available.map((order, idx) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-[#1a1208]/[0.06] hover:border-[#1a1208]/[0.12] hover:shadow-[0_8px_32px_rgba(26,18,8,0.07)] transition-all duration-300 overflow-hidden"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-start gap-4 p-5">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f5ede0] flex-shrink-0">
                          {order.restaurantImage ? (
                            <Image src={order.restaurantImage} alt={order.restaurantName ?? ""} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg width="20" height="20" fill="none" stroke="#1a1208" strokeWidth="1.5" viewBox="0 0 24 24" className="opacity-20">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" />
                                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[14px] font-bold text-[#1a1208] leading-tight truncate">{order.restaurantName}</p>
                            <span className="text-[13px] font-bold text-[#c8783a] flex-shrink-0 tabular-nums">₱{order.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#1a1208]/35 flex-shrink-0">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            <p className="text-[12px] text-[#1a1208]/45 truncate">{order.deliveryAddress}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] text-[#1a1208]/40 bg-[#1a1208]/[0.05] px-2 py-0.5 rounded-full font-medium">
                              {PAYMENT_LABELS[order.paymentMethod ?? ""] ?? order.paymentMethod}
                            </span>
                            <span className="text-[#1a1208]/15 text-[10px]">·</span>
                            <span className="text-[11px] text-[#1a1208]/35">{timeAgo(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-5 pb-5">
                        <button
                          onClick={() => acceptOrder(order.id)}
                          disabled={accepting === order.id || !!activeDelivery}
                          className="w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#c8783a] text-white hover:bg-[#b5692e] shadow-[0_4px_14px_rgba(200,120,58,0.22)]"
                        >
                          {accepting === order.id ? "Accepting…" : activeDelivery ? "Finish current delivery first" : "Accept Order"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <StatsPanel driver={driverInfo.driver} myOrders={myOrders} />
              <RecentDeliveriesList orders={myOrders} />
            </aside>
          </div>

          <div className="pb-8" />
        </div>
      </div>
    );
  }

  // Not a driver — check application state
  const app = driverInfo.application;

  if (!showApplyForm && app?.status === "pending") {
    return <ApplicationPending createdAt={app.createdAt} />;
  }

  if (!showApplyForm && app?.status === "denied") {
    return <ApplicationDenied adminNotes={app.adminNotes} onReapply={() => setShowApplyForm(true)} />;
  }

  // No application yet, or user clicked "Apply Again" after denial
  return (
    <ApplyForm
      firstName={driverInfo.profileName.firstName}
      lastName={driverInfo.profileName.lastName}
      onSubmitted={() => {
        setShowApplyForm(false);
        checkDriver().then(() => setLoading(false));
      }}
    />
  );
}
