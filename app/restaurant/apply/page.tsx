"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ── Types ───────────────────────────────────────────────────────────────────── */
type Application = {
  id: string;
  status: "pending" | "approved" | "denied";
  adminNotes: string | null;
  createdAt: string | null;
};

type FormFields = {
  restaurantName: string;
  cuisine: string;
  address: string;
  phone: string;
  description: string;
  openingHours: string;
  minOrder: string;
  deliveryTime: string;
  website: string;
  facebook: string;
  seatingCapacity: string;
};

type FieldKey = keyof FormFields | "permit" | "logo";

/* ── Constants ───────────────────────────────────────────────────────────────── */
const PH_PHONE_RE = /^\+639\d{9}$/;
const ALLOWED_IMG = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC = [...ALLOWED_IMG, "application/pdf"];
const MAX_MB = 5;

const EMPTY: FormFields = {
  restaurantName: "", cuisine: "", address: "", phone: "",
  description: "", openingHours: "", minOrder: "", deliveryTime: "",
  website: "", facebook: "", seatingCapacity: "",
};

const STEPS = [
  { n: 1, label: "Restaurant",  sub: "Name, cuisine & contact"  },
  { n: 2, label: "Operations",  sub: "Hours, delivery & about"  },
  { n: 3, label: "Online",      sub: "Website & social media"   },
  { n: 4, label: "Documents",   sub: "Permit & logo upload"     },
];

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
function timeAgo(d: string | null) {
  if (!d) return "";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function validateStep(
  step: number,
  form: FormFields,
  permitFile: File | null,
  logoFile: File | null
): Partial<Record<FieldKey, string>> {
  const e: Partial<Record<FieldKey, string>> = {};
  if (step === 1) {
    const n = form.restaurantName.trim();
    if (!n) e.restaurantName = "Required.";
    else if (n.length < 2) e.restaurantName = "At least 2 characters.";
    else if (n.length > 100) e.restaurantName = "Under 100 characters.";
    if (!form.cuisine.trim()) e.cuisine = "Required.";
    if (!form.address.trim()) e.address = "Required.";
    else if (form.address.length > 200) e.address = "Under 200 characters.";
    if (!form.phone.trim()) e.phone = "Required.";
    else if (!PH_PHONE_RE.test(form.phone.trim())) e.phone = "+639XXXXXXXXX format.";
  }
  if (step === 2) {
    if (!form.description.trim()) e.description = "Required.";
    else if (form.description.length > 500) e.description = "Under 500 characters.";
    if (!form.openingHours.trim()) e.openingHours = "Required.";
    if (!form.deliveryTime.trim()) e.deliveryTime = "Required.";
    if (form.minOrder.trim()) {
      const n = parseInt(form.minOrder, 10);
      if (isNaN(n) || n < 0) e.minOrder = "Enter a valid peso amount.";
    }
    if (form.seatingCapacity.trim()) {
      const n = parseInt(form.seatingCapacity, 10);
      if (isNaN(n) || n < 1) e.seatingCapacity = "Enter a valid number.";
    }
  }
  if (step === 3) {
    if (form.website.trim() && !/^https?:\/\/.+/.test(form.website.trim()))
      e.website = "Must start with http:// or https://";
  }
  if (step === 4) {
    if (!permitFile) e.permit = "Required.";
    else if (!ALLOWED_DOC.includes(permitFile.type)) e.permit = "JPG, PNG, WebP, or PDF only.";
    else if (permitFile.size > MAX_MB * 1024 * 1024) e.permit = `Under ${MAX_MB} MB.`;
    if (logoFile) {
      if (!ALLOWED_IMG.includes(logoFile.type)) e.logo = "JPG, PNG, or WebP only.";
      else if (logoFile.size > MAX_MB * 1024 * 1024) e.logo = `Under ${MAX_MB} MB.`;
    }
  }
  return e;
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */
function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium mt-1">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {msg}
    </p>
  );
}

function Field({
  label, required, hint, error, touched, children,
}: {
  label: string; required?: boolean; hint?: string; error?: string; touched?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/40">
        {label}{" "}
        {required
          ? <span className="normal-case tracking-normal text-[#c8783a] font-medium">*</span>
          : <span className="normal-case tracking-normal text-[#1a1208]/20 font-normal">optional</span>}
      </label>
      {children}
      {touched && error ? <Err msg={error} /> : hint ? <p className="text-[10.5px] text-[#1a1208]/30 mt-0.5">{hint}</p> : null}
    </div>
  );
}

function inp(err?: boolean) {
  return `w-full px-4 py-3 rounded-xl border text-[13.5px] text-[#1a1208] placeholder-[#1a1208]/25 focus:outline-none focus:ring-2 transition-all duration-200 ${
    err
      ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/10"
      : "border-[#1a1208]/[0.09] bg-white focus:border-[#c8783a]/50 focus:ring-[#c8783a]/12"
  }`;
}

function FileInput({
  label, required, file, accept, hint, error, touched,
  icon, onChange,
}: {
  label: string; required?: boolean; file: File | null; accept: string; hint: string;
  error?: string; touched?: boolean; icon: React.ReactNode; onChange: (f: File | null) => void;
}) {
  return (
    <Field label={label} required={required} error={error} touched={touched}>
      <label className={`flex items-center gap-3.5 w-full px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-200 group ${
        touched && error ? "border-red-300 bg-red-50/50" :
        file ? "border-[#c8783a]/40 bg-[#c8783a]/[0.04]" :
        "border-[#1a1208]/[0.09] bg-white hover:border-[#c8783a]/30 hover:bg-[#c8783a]/[0.02]"
      }`}>
        <span className={`shrink-0 transition-colors ${file ? "text-[#c8783a]" : "text-[#1a1208]/30 group-hover:text-[#1a1208]/50"}`}>{icon}</span>
        <span className="text-[13px] text-[#1a1208]/50 truncate flex-1">
          {file ? file.name : hint}
        </span>
        {file && (
          <button
            type="button"
            onClick={(ev) => { ev.preventDefault(); onChange(null); }}
            className="shrink-0 text-[#1a1208]/25 hover:text-red-400 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </Field>
  );
}

/* ── Status screens ──────────────────────────────────────────────────────────── */
type StatusVariant = "pending" | "approved" | "denied";

const STATUS_STYLES: Record<StatusVariant, { icon_wrap: string; eyebrow: string }> = {
  pending: {
    icon_wrap: "bg-amber-50 border border-amber-200",
    eyebrow:   "text-amber-500",
  },
  approved: {
    icon_wrap: "bg-emerald-50 border border-emerald-200",
    eyebrow:   "text-emerald-500",
  },
  denied: {
    icon_wrap: "bg-red-50 border border-red-200",
    eyebrow:   "text-red-400",
  },
};

function StatusScreen({ variant, icon, eyebrow, title, body, extra, cta }: {
  variant: StatusVariant; icon: React.ReactNode; eyebrow: string; title: string;
  body: string; extra?: React.ReactNode; cta: React.ReactNode;
}) {
  const s = STATUS_STYLES[variant];
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-6">
      <div className="max-w-[380px] w-full">
        <div className="mb-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${s.icon_wrap}`}>
            {icon}
          </div>
          <p className={`text-[9px] uppercase tracking-[0.28em] font-bold mb-3 ${s.eyebrow}`}>{eyebrow}</p>
          <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-[1.1] mb-3">{title}</h1>
          <p className="text-[13.5px] text-[#1a1208]/45 leading-relaxed">{body}</p>
          {extra}
        </div>
        {cta}
      </div>
    </div>
  );
}

/* ══ Main Page ═══════════════════════════════════════════════════════════════════ */
export default function RestaurantApplyPage() {
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  const [form, setForm] = useState<FormFields>(EMPTY);
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/restaurant/apply")
      .then((r) => r.json())
      .then((d) => setApp(d.application ?? null))
      .catch(() => setApp(null));
  }, []);

  /* helpers */
  function field(k: keyof FormFields) {
    return {
      value: form[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const next = { ...form, [k]: e.target.value };
        setForm(next);
        if (touched[k]) setErrors(validateStep(step, next, permitFile, logoFile));
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const next = { ...form, [k]: e.target.value.trim() };
        setForm(next);
        setTouched((t) => ({ ...t, [k]: true }));
        setErrors(validateStep(step, next, permitFile, logoFile));
      },
    };
  }

  function phoneField() {
    return {
      value: form.phone,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
        const next = { ...form, phone: val };
        setForm(next);
        if (touched.phone) setErrors(validateStep(step, next, permitFile, logoFile));
      },
      onBlur: () => {
        setTouched((t) => ({ ...t, phone: true }));
        setErrors(validateStep(step, form, permitFile, logoFile));
      },
    };
  }

  function goNext() {
    // Touch all fields of this step
    const stepFields: Record<number, FieldKey[]> = {
      1: ["restaurantName", "cuisine", "address", "phone"],
      2: ["description", "openingHours", "deliveryTime", "minOrder", "seatingCapacity"],
      3: ["website", "facebook"],
      4: ["permit", "logo"],
    };
    const tf = Object.fromEntries(stepFields[step].map((k) => [k, true]));
    setTouched((t) => ({ ...t, ...tf }));
    const errs = validateStep(step, form, permitFile, logoFile);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep((s) => s + 1);
    setAnimKey((k) => k + 1);
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => s - 1);
    setAnimKey((k) => k + 1);
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const errs = validateStep(4, form, permitFile, logoFile);
    setTouched((t) => ({ ...t, permit: true, logo: true }));
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerErr("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, (v as string).trim()));
      fd.append("permit", permitFile!);
      if (logoFile) fd.append("logo", logoFile);
      const res = await fetch("/api/restaurant/apply", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setApp(data.application);
    } catch (e) {
      setServerErr(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Loading ── */
  if (app === undefined) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center">
        <div className="space-y-3 w-48">
          <div className="h-2.5 rounded-full bg-[#1a1208]/[0.07] animate-pulse w-full" />
          <div className="h-2.5 rounded-full bg-[#1a1208]/[0.07] animate-pulse w-[72%] [animation-delay:150ms]" />
          <div className="h-2.5 rounded-full bg-[#1a1208]/[0.07] animate-pulse w-[55%] [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  /* ── Pending ── */
  if (app?.status === "pending" && !showForm) return (
    <StatusScreen
      variant="pending"
      icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
      eyebrow="Under Review"
      title="Application Pending"
      body="Your restaurant application is being reviewed. This usually takes 1–2 business days."
      extra={app.createdAt && <p className="text-[11.5px] text-[#1a1208]/30 mt-3">Submitted {timeAgo(app.createdAt)}</p>}
      cta={
        <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#1a1208]/40 hover:text-[#c8783a] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Back to Home
        </Link>
      }
    />
  );

  /* ── Approved ── */
  if (app?.status === "approved") return (
    <StatusScreen
      variant="approved"
      icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>}
      eyebrow="Approved"
      title={"You're a\nRestaurant Partner"}
      body="Your application has been approved. Head to the owner portal to set up your menu and start receiving orders."
      cta={
        <Link href="/restaurant" className="inline-flex items-center justify-between gap-4 bg-[#1a1208] text-white px-6 py-4 rounded-2xl font-semibold text-[13.5px] hover:bg-[#c8783a] transition-all duration-300 group w-full">
          <span>Open Restaurant Portal</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
        </Link>
      }
    />
  );

  /* ── Denied ── */
  if (app?.status === "denied" && !showForm) return (
    <StatusScreen
      variant="denied"
      icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
      eyebrow="Not Approved"
      title="Application Denied"
      body="Your application was not approved at this time."
      extra={app.adminNotes && (
        <div className="mt-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3.5">
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-red-400 mb-1.5">Reason</p>
          <p className="text-[12.5px] text-[#1a1208]/60 leading-relaxed">{app.adminNotes}</p>
        </div>
      )}
      cta={
        <div className="flex flex-col gap-3">
          <button type="button" onClick={() => { setShowForm(true); setStep(1); setAnimKey(k => k + 1); }}
            className="w-full bg-[#1a1208] hover:bg-[#c8783a] text-white py-4 rounded-2xl font-semibold text-[13.5px] transition-all duration-300">
            Apply Again
          </button>
          <Link href="/" className="text-center text-[12px] font-semibold text-[#1a1208]/35 hover:text-[#c8783a] transition-colors">Back to Home</Link>
        </div>
      }
    />
  );

  /* ══ WIZARD FORM ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex flex-col lg:flex-row">

      {/* ── Left sidebar ─────────────────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-0 lg:h-[100dvh] lg:w-[300px] xl:w-[340px] shrink-0 bg-[#1a1208] flex flex-col p-8 lg:p-10 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 apply-sidebar-glow" />

        {/* Logo */}
        <Link href="/" className="relative font-playfair text-[1.2rem] font-bold tracking-tight text-white mb-12 lg:mb-16 inline-flex items-center gap-2">
          Foodie<span className="text-[#c8783a]">.ph</span>
          <span className="text-[9px] uppercase tracking-[0.22em] text-white/20 font-medium ml-1">Partners</span>
        </Link>

        {/* Step progress */}
        <div className="relative flex-1">
          {/* Vertical track */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.08]" />
          {/* Filled track — height driven by step index via discrete Tailwind classes */}
          <div className={`absolute left-[15px] top-2 w-px bg-[#c8783a]/50 transition-all duration-700 ease-out ${
            step === 1 ? "h-0" :
            step === 2 ? "h-1/3" :
            step === 3 ? "h-2/3" :
                         "h-full"
          }`} />

          <div className="space-y-7 relative">
            {STEPS.map((s) => {
              const done = step > s.n;
              const active = step === s.n;
              return (
                <div key={s.n} className="flex items-start gap-4">
                  {/* Dot */}
                  <div className={`w-[30px] h-[30px] rounded-full border flex items-center justify-center shrink-0 transition-all duration-500 ${
                    done ? "bg-[#c8783a] border-[#c8783a]" :
                    active ? "bg-[#1a1208] border-[#c8783a] shadow-[0_0_0_4px_rgba(200,120,58,0.15)]" :
                    "bg-transparent border-white/[0.12]"
                  }`}>
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <span className={`text-[11px] font-bold ${active ? "text-[#c8783a]" : "text-white/20"}`}>{s.n}</span>
                    )}
                  </div>
                  {/* Label */}
                  <div className={`pt-0.5 transition-all duration-300 ${active ? "opacity-100" : done ? "opacity-60" : "opacity-25"}`}>
                    <p className={`text-[13px] font-semibold leading-tight ${active ? "text-white" : "text-white"}`}>{s.label}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-10 pt-8 border-t border-white/[0.07] relative">
          <p className="text-[11px] text-white/25 leading-relaxed">
            Applications reviewed within 1–2 business days. You will receive a notification once a decision is made.
          </p>
          <p className="text-[10px] text-white/15 mt-4">&copy; 2025 Foodie.ph</p>
        </div>
      </aside>

      {/* ── Form panel ───────────────────────────────────────────────────────── */}
      <main ref={formRef} className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-12 lg:py-16">

          {/* Step header */}
          <div key={`hdr-${step}`} className="mb-10 apply-fade-up">
            <p className="text-[9px] uppercase tracking-[0.28em] font-bold text-[#c8783a] mb-3">
              Step {step} of {STEPS.length}
            </p>
            <h1 className="font-playfair text-[2.2rem] font-bold text-[#1a1208] leading-[1.05] mb-2">
              {STEPS[step - 1].label}
            </h1>
            <p className="text-[13.5px] text-[#1a1208]/40 leading-relaxed">
              {[
                "Tell us about your restaurant — name, type of cuisine, and how to reach you.",
                "Help customers know what to expect — hours, delivery speed, and your story.",
                "Add your online presence so customers can find and follow you.",
                "Upload your business permit and an optional photo for your profile.",
              ][step - 1]}
            </p>
          </div>

          {/* ── Step fields ── */}
          <div key={`fields-${animKey}`} className="flex flex-col gap-5 apply-fade-up-delay">

            {step === 1 && <>
              <Field label="Restaurant Name" required error={errors.restaurantName} touched={touched.restaurantName}>
                <input type="text" placeholder="e.g. Café de Manila" maxLength={101} className={inp(touched.restaurantName && !!errors.restaurantName)} {...field("restaurantName")} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Cuisine Type" required error={errors.cuisine} touched={touched.cuisine}>
                  <input type="text" placeholder="e.g. Filipino" maxLength={51} className={inp(touched.cuisine && !!errors.cuisine)} {...field("cuisine")} />
                </Field>
                <Field label="Contact Phone" required error={errors.phone} touched={touched.phone} hint="+639XXXXXXXXX">
                  <input type="tel" placeholder="+63912…" maxLength={13} className={inp(touched.phone && !!errors.phone)} value={form.phone} onChange={phoneField().onChange} onBlur={phoneField().onBlur} />
                </Field>
              </div>

              <Field label="Full Address" required error={errors.address} touched={touched.address} hint="Street, Barangay, City">
                <input type="text" placeholder="123 Rizal Ave, Brgy. Santo Niño, Cebu City" maxLength={201} className={inp(touched.address && !!errors.address)} {...field("address")} />
              </Field>
            </>}

            {step === 2 && <>
              <Field label="About Your Restaurant" required error={errors.description} touched={touched.description}>
                <textarea rows={4} placeholder="Describe your specialties, ambiance, or story — what makes you different?" maxLength={501} className={inp(touched.description && !!errors.description) + " resize-none"} {...field("description")} />
                <p className={`text-[10.5px] mt-1 text-right ${form.description.length > 450 ? "text-amber-500" : "text-[#1a1208]/20"}`}>
                  {form.description.length}/500
                </p>
              </Field>

              <Field label="Opening Hours" required error={errors.openingHours} touched={touched.openingHours} hint="e.g. Mon–Sat 10:00 AM – 9:00 PM, closed Sun">
                <input type="text" placeholder="Mon–Sat 10:00 AM – 9:00 PM" maxLength={101} className={inp(touched.openingHours && !!errors.openingHours)} {...field("openingHours")} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Est. Delivery Time" required error={errors.deliveryTime} touched={touched.deliveryTime}>
                  <input type="text" placeholder="30–45 mins" maxLength={51} className={inp(touched.deliveryTime && !!errors.deliveryTime)} {...field("deliveryTime")} />
                </Field>
                <Field label="Minimum Order (₱)" error={errors.minOrder} touched={touched.minOrder}>
                  <input type="number" min={0} placeholder="300" className={inp(touched.minOrder && !!errors.minOrder)} {...field("minOrder")} />
                </Field>
              </div>

              <Field label="Dine-in Seating Capacity" error={errors.seatingCapacity} touched={touched.seatingCapacity} hint="Leave blank if delivery/takeout only">
                <input type="number" min={1} placeholder="e.g. 40 seats" className={inp(touched.seatingCapacity && !!errors.seatingCapacity)} {...field("seatingCapacity")} />
              </Field>
            </>}

            {step === 3 && <>
              <div className="bg-[#1a1208]/[0.03] border border-[#1a1208]/[0.06] rounded-2xl p-5 mb-2">
                <p className="text-[12px] text-[#1a1208]/40 leading-relaxed">
                  Both fields are optional. Adding them helps build trust with customers who look you up before ordering.
                </p>
              </div>

              <Field label="Website" error={errors.website} touched={touched.website} hint="Must start with https://">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1208]/25">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  </span>
                  <input type="url" placeholder="https://yourrestaurant.com" className={inp(touched.website && !!errors.website) + " pl-10"} {...field("website")} />
                </div>
              </Field>

              <Field label="Facebook Page">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1208]/25">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  </span>
                  <input type="text" placeholder="facebook.com/yourpage or @handle" maxLength={200} className={inp(false) + " pl-10"} {...field("facebook")} />
                </div>
              </Field>
            </>}

            {step === 4 && <>
              <FileInput
                label="Restaurant Logo / Photo"
                file={logoFile}
                accept="image/*"
                hint="Upload your logo or a front-of-store photo"
                error={errors.logo}
                touched={touched.logo}
                onChange={(f) => {
                  setLogoFile(f);
                  setTouched((t) => ({ ...t, logo: true }));
                  setErrors(validateStep(4, form, permitFile, f));
                }}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                }
              />
              <p className="text-[10.5px] text-[#1a1208]/30 -mt-3">JPG, PNG, or WebP · Max {MAX_MB} MB · Optional</p>

              <div className="border-t border-[#1a1208]/[0.07] pt-5">
                <FileInput
                  label="Business Permit"
                  required
                  file={permitFile}
                  accept="image/*,.pdf"
                  hint="Upload your DTI, SEC, or Mayor's permit"
                  error={errors.permit}
                  touched={touched.permit}
                  onChange={(f) => {
                    setPermitFile(f);
                    setTouched((t) => ({ ...t, permit: true }));
                    setErrors(validateStep(4, form, f, logoFile));
                  }}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                    </svg>
                  }
                />
                <p className="text-[10.5px] text-[#1a1208]/30 mt-1.5">JPG, PNG, WebP, or PDF · Max {MAX_MB} MB · Required</p>
              </div>

              {serverErr && (
                <div className="flex items-start gap-3 text-[12px] text-red-600 bg-red-50 border border-red-200/80 rounded-xl px-4 py-3.5 mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{serverErr}</span>
                </div>
              )}
            </>}
          </div>

          {/* ── Navigation ── */}
          <div key={`nav-${step}`} className="flex items-center justify-between mt-10 pt-8 border-t border-[#1a1208]/[0.07] apply-fade-up-nav">
            <button
              type="button"
              onClick={step === 1 ? undefined : goBack}
              disabled={step === 1}
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#1a1208]/35 hover:text-[#1a1208]/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              Back
            </button>

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2.5 bg-[#1a1208] hover:bg-[#c8783a] text-white px-7 py-3 rounded-xl font-semibold text-[13px] transition-all duration-300 active:scale-[0.98]"
              >
                Continue
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="inline-flex items-center gap-2.5 bg-[#c8783a] hover:bg-[#b5692e] disabled:opacity-60 text-white px-7 py-3 rounded-xl font-bold text-[13px] shadow-[0_6px_20px_rgba(200,120,58,0.3)] transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Application
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
