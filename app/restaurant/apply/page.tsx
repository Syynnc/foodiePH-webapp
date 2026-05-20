"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Application = {
  id: string;
  status: "pending" | "approved" | "denied";
  adminNotes: string | null;
  createdAt: string | null;
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Validation ────────────────────────────────────────────────────────────────
const PH_PHONE_RE = /^\+639\d{9}$/;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_MB = 5;

type FormFields = { restaurantName: string; cuisine: string; address: string; phone: string; description: string };

function validateRestaurantForm(form: FormFields, permitFile: File | null) {
  const errs: Partial<Record<keyof FormFields | "permit", string>> = {};

  const name = form.restaurantName.trim();
  if (!name) errs.restaurantName = "Restaurant name is required.";
  else if (name.length < 2) errs.restaurantName = "Name must be at least 2 characters.";
  else if (name.length > 100) errs.restaurantName = "Name must be under 100 characters.";

  const cuisine = form.cuisine.trim();
  if (!cuisine) errs.cuisine = "Cuisine type is required.";
  else if (cuisine.length > 50) errs.cuisine = "Cuisine must be under 50 characters.";

  const address = form.address.trim();
  if (!address) errs.address = "Address is required.";
  else if (address.length > 200) errs.address = "Address must be under 200 characters.";

  const phone = form.phone.trim();
  if (!phone) errs.phone = "Phone number is required.";
  else if (!PH_PHONE_RE.test(phone)) errs.phone = "Enter a valid PH number: +639XXXXXXXXX";

  const description = form.description.trim();
  if (!description) errs.description = "Please provide a short description of your restaurant.";
  else if (description.length > 500) errs.description = "Description must be under 500 characters.";

  if (!permitFile) {
    errs.permit = "A business permit or registration document is required.";
  } else if (!ALLOWED_TYPES.includes(permitFile.type)) {
    errs.permit = "Only JPG, PNG, WebP, or PDF files are accepted.";
  } else if (permitFile.size > MAX_FILE_MB * 1024 * 1024) {
    errs.permit = `File must be under ${MAX_FILE_MB} MB.`;
  }

  return errs;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[11.5px] text-red-500 font-medium mt-0.5">{msg}</p>;
}

function inputCls(hasError?: boolean, extra = "") {
  return `w-full px-4 py-3 rounded-xl border text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/30 focus:outline-none focus:ring-2 transition-all ${extra} ${
    hasError
      ? "border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-400/15"
      : "border-[#1a1208]/[0.09] bg-white focus:border-[#c8783a]/50 focus:ring-[#c8783a]/15"
  }`;
}

export default function RestaurantApplyPage() {
  const [application, setApplication] = useState<Application | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<FormFields>({
    restaurantName: "",
    cuisine: "",
    address: "",
    phone: "",
    description: "",
  });
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields | "permit", string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields | "permit", boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  useEffect(() => {
    fetch("/api/restaurant/apply")
      .then((r) => r.json())
      .then((d) => setApplication(d.application ?? null))
      .catch(() => setApplication(null));
  }, []);

  function touch(field: keyof FormFields | "permit") {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function revalidate(nextForm = form, nextFile = permitFile) {
    const errs = validateRestaurantForm(nextForm, nextFile);
    setErrors(errs);
    return errs;
  }

  function handleChange(field: keyof FormFields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const next = { ...form, [field]: e.target.value };
      setForm(next);
      if (touched[field]) revalidate(next, permitFile);
    };
  }

  function handleBlur(field: keyof FormFields) {
    return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const trimmed = e.target.value.trim();
      const next = { ...form, [field]: trimmed };
      setForm(next);
      touch(field);
      revalidate(next, permitFile);
    };
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    const next = { ...form, phone: val };
    setForm(next);
    if (touched.phone) revalidate(next, permitFile);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPermitFile(file);
    touch("permit");
    revalidate(form, file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = { restaurantName: true, cuisine: true, address: true, phone: true, description: true, permit: true };
    setTouched(allTouched);
    const errs = revalidate(form, permitFile);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerErr("");
    try {
      const fd = new FormData();
      fd.append("restaurantName", form.restaurantName.trim());
      fd.append("cuisine", form.cuisine.trim());
      fd.append("address", form.address.trim());
      fd.append("phone", form.phone.trim());
      fd.append("description", form.description.trim());
      fd.append("permit", permitFile!);

      const res = await fetch("/api/restaurant/apply", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setApplication(data.application);
      setShowForm(false);
    } catch (e) {
      setServerErr(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (application === undefined) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#c8783a]/30 border-t-[#c8783a] animate-spin" />
      </div>
    );
  }

  // Pending
  if (application?.status === "pending" && !showForm) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.26em] font-bold text-amber-500 mb-2">Under Review</p>
            <h1 className="font-playfair text-[1.8rem] font-bold text-[#1a1208] leading-tight mb-2">Application Pending</h1>
            <p className="text-[13px] text-[#1a1208]/45 leading-relaxed">
              Your restaurant owner application is being reviewed. This usually takes 1–2 business days.
            </p>
            {application.createdAt && (
              <p className="text-[11px] text-[#1a1208]/30 mt-3">Submitted {timeAgo(application.createdAt)}</p>
            )}
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#1a1208]/50 hover:text-[#c8783a] transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Approved
  if (application?.status === "approved") {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.26em] font-bold text-emerald-500 mb-2">Approved</p>
            <h1 className="font-playfair text-[1.8rem] font-bold text-[#1a1208] leading-tight mb-2">You&apos;re a Restaurant Owner!</h1>
            <p className="text-[13px] text-[#1a1208]/45 leading-relaxed">
              Your application has been approved. You can now manage your restaurant on Foodie.ph.
            </p>
          </div>
          <Link
            href="/restaurant"
            className="inline-flex items-center gap-2 bg-[#c8783a] text-white px-6 py-3 rounded-xl font-semibold text-[13px] hover:bg-[#b5692e] transition-all duration-300"
          >
            Go to Restaurant Portal
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Denied
  if (application?.status === "denied" && !showForm) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.26em] font-bold text-red-400 mb-2">Not Approved</p>
            <h1 className="font-playfair text-[1.8rem] font-bold text-[#1a1208] leading-tight mb-2">Application Denied</h1>
            <p className="text-[13px] text-[#1a1208]/45 leading-relaxed">Your application was not approved at this time.</p>
            {application.adminNotes && (
              <div className="mt-4 text-left bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-red-400 mb-1">Reason</p>
                <p className="text-[12.5px] text-[#1a1208]/60 leading-relaxed">{application.adminNotes}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-[#c8783a] hover:bg-[#b5692e] text-white py-3 rounded-xl font-semibold text-[13px] transition-all duration-300"
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

  // Application form (null or showForm)
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1a1208] p-14 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `radial-gradient(circle at 30% 50%, #c8783a 0%, transparent 60%), radial-gradient(circle at 80% 20%, #c8783a 0%, transparent 50%)` }}
        />
        <Link href="/" className="font-playfair text-[1.35rem] font-bold tracking-tight text-white relative z-10">
          Foodie<span className="text-[#c8783a]">.ph</span>
          <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium">Partners</span>
        </Link>
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] font-bold text-white/30 mb-4">Why partner with us</p>
            {[
              { title: "Reach more customers", body: "Access thousands of Foodie.ph users across Metro Manila and Metro Cebu." },
              { title: "Simple order management", body: "Manage incoming orders, menus, and delivery status from one dashboard." },
              { title: "Dedicated support", body: "Our partner team is available to help you set up and grow your presence." },
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
      <div className="flex items-start justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="font-playfair text-[1.25rem] font-bold tracking-tight text-[#1a1208]">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
          </Link>

          <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-3">Partner Application</p>
          <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-tight mb-2">List Your Restaurant</h1>
          <p className="text-[13px] text-[#1a1208]/45 font-light leading-relaxed mb-8">
            Fill in your restaurant details. Our team will review and get back to you within 1–2 business days.
          </p>

          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">
                Restaurant Name <span className="normal-case tracking-normal text-red-400 font-medium">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Café de Manila"
                value={form.restaurantName}
                onChange={handleChange("restaurantName")}
                onBlur={handleBlur("restaurantName")}
                maxLength={101}
                className={inputCls(touched.restaurantName && !!errors.restaurantName)}
              />
              <FieldError msg={touched.restaurantName ? errors.restaurantName : undefined} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">Cuisine <span className="normal-case tracking-normal text-red-400 font-medium">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Filipino"
                  value={form.cuisine}
                  onChange={handleChange("cuisine")}
                  onBlur={handleBlur("cuisine")}
                  maxLength={51}
                  className={inputCls(touched.cuisine && !!errors.cuisine)}
                />
                <FieldError msg={touched.cuisine ? errors.cuisine : undefined} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">Phone <span className="normal-case tracking-normal text-red-400 font-medium">*</span></label>
                <input
                  type="tel"
                  placeholder="+63912…"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onBlur={handleBlur("phone")}
                  maxLength={13}
                  className={inputCls(touched.phone && !!errors.phone)}
                />
                <FieldError msg={touched.phone ? errors.phone : undefined} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">Address <span className="normal-case tracking-normal text-red-400 font-medium">*</span></label>
              <input
                type="text"
                placeholder="Street, City"
                value={form.address}
                onChange={handleChange("address")}
                onBlur={handleBlur("address")}
                maxLength={201}
                className={inputCls(touched.address && !!errors.address)}
              />
              <FieldError msg={touched.address ? errors.address : undefined} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">
                About your restaurant <span className="normal-case tracking-normal text-red-400 font-medium">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe your restaurant, specialties, or story…"
                value={form.description}
                onChange={handleChange("description")}
                onBlur={handleBlur("description")}
                maxLength={501}
                className={inputCls(touched.description && !!errors.description, "resize-none")}
              />
              <div className="flex items-center justify-between">
                <FieldError msg={touched.description ? errors.description : undefined} />
                <span className={`text-[10.5px] ml-auto ${form.description.length > 450 ? "text-amber-500" : "text-[#1a1208]/25"}`}>
                  {form.description.length}/500
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">
                Business Permit <span className="normal-case tracking-normal text-red-400 font-medium">*</span>
              </label>
              <label className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                touched.permit && errors.permit
                  ? "border-red-400 bg-red-50/40"
                  : permitFile
                  ? "border-[#c8783a]/40 bg-[#c8783a]/5"
                  : "border-[#1a1208]/[0.09] bg-white hover:border-[#c8783a]/30"
              }`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1208]/40 shrink-0">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-[13px] text-[#1a1208]/50 truncate">
                  {permitFile ? permitFile.name : "Upload permit or business registration"}
                </span>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
              </label>
              <FieldError msg={touched.permit ? errors.permit : undefined} />
              {!errors.permit && <p className="text-[10.5px] text-[#1a1208]/35">JPG, PNG, WebP, or PDF · Max {MAX_FILE_MB} MB</p>}
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
