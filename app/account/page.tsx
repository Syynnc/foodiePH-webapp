"use client";

import { useState, useEffect } from "react";
import { signOut } from "@/app/auth/actions";
import { Field, iCls, V } from "@/app/components/FormField";

type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  company: string | null;
  phone: string | null;
  creditLine: number | null;
  isCorporate: boolean | null;
  role: string;
  createdAt: string | null;
};

type FormState = { fullName: string; phone: string; company: string };
type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  const name = V.first(V.required(f.fullName, "Full name"), V.minLen(f.fullName, 2, "Full name"), V.maxLen(f.fullName, 100, "Full name"));
  if (name) e.fullName = name;
  if (f.phone)   { const err = V.phone(f.phone);             if (err) e.phone   = err; }
  if (f.company) { const err = V.maxLen(f.company, 100, "Company"); if (err) e.company = err; }
  return e;
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    admin:      { label: "Admin",            cls: "bg-[#1a1208]/8 text-[#1a1208]" },
    restaurant: { label: "Restaurant Owner", cls: "bg-amber-50 text-amber-700" },
    driver:     { label: "Driver",           cls: "bg-blue-50 text-blue-700" },
    customer:   { label: "Customer",         cls: "bg-emerald-50 text-emerald-700" },
  };
  const cfg = map[role] ?? { label: role, cls: "bg-[#1a1208]/8 text-[#1a1208]" };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState<FormState>({ fullName: "", phone: "", company: "" });
  const [errors, setErrors]   = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  useEffect(() => {
    fetch("/api/account")
      .then(r => r.json())
      .then((p: Profile) => {
        setProfile(p);
        setForm({ fullName: p.fullName ?? "", phone: p.phone ?? "", company: p.company ?? "" });
      })
      .finally(() => setLoading(false));
  }, []);

  function set(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setForm(f => ({ ...f, [k]: val }));
      if (touched[k]) {
        const next = validate({ ...form, [k]: val });
        setErrors(prev => ({ ...prev, [k]: next[k] }));
      }
    };
  }

  function blur(k: keyof FormState) {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      const trimmed = e.target.value.trim();
      setForm(f => ({ ...f, [k]: trimmed }));
      setTouched(t => ({ ...t, [k]: true }));
      const next = validate({ ...form, [k]: trimmed });
      setErrors(prev => ({ ...prev, [k]: next[k] }));
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = { fullName: true, phone: true, company: true };
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSaving(true); setServerError(""); setSaved(false);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setServerError((await res.json()).error ?? "Failed to save."); return; }
    const updated: Profile = await res.json();
    setProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-5 md:px-8 pt-8 pb-20 space-y-6">
          <div className="h-8 w-40 bg-[#1a1208]/[0.07] rounded-full animate-pulse" />
          <div className="bg-white rounded-2xl border border-[#1a1208]/[0.07] p-6 space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-20 bg-[#1a1208]/[0.06] rounded-full" />
                <div className="h-10 bg-[#F4F0EB] rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#FDFBF7]">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-8 pb-20 space-y-6">

        {/* Header */}
        <div>
          <p className="text-[9px] uppercase tracking-[0.26em] font-semibold text-[#c8783a] mb-2">My Account</p>
          <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-tight">Account Settings</h1>
        </div>

        {/* Profile overview card */}
        <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl p-5 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-[#c8783a]/10 flex items-center justify-center shrink-0">
            <span className="font-playfair text-[1.4rem] font-bold text-[#c8783a]">
              {(profile?.fullName ?? profile?.email ?? "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="text-[15px] font-bold text-[#1a1208] truncate">{profile?.fullName ?? "—"}</p>
              {profile?.role && <RoleBadge role={profile.role} />}
            </div>
            <p className="text-[12px] text-[#1a1208]/45 truncate">{profile?.email}</p>
            {profile?.company && (
              <p className="text-[11px] text-[#1a1208]/30 mt-0.5">{profile.company}</p>
            )}
          </div>
          {profile?.isCorporate && (
            <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8783a] border border-[#c8783a]/20 bg-[#c8783a]/5 rounded-full px-2.5 py-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Corporate
            </div>
          )}
        </div>

        {/* Edit profile form */}
        <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1208]/[0.06]">
            <h2 className="text-[13px] font-bold text-[#1a1208]">Profile Information</h2>
            <p className="text-[11px] text-[#1a1208]/40 mt-0.5">Update your personal details</p>
          </div>
          <form onSubmit={handleSave} noValidate className="p-6 space-y-4">

            <Field label="Full Name" required error={errors.fullName}>
              <input
                className={iCls(errors.fullName)}
                value={form.fullName}
                onChange={set("fullName")}
                onBlur={blur("fullName")}
                placeholder="Juan dela Cruz"
                maxLength={101}
              />
            </Field>

            <Field label="Phone" error={errors.phone} hint="Used for delivery notifications">
              <input
                className={iCls(errors.phone)}
                value={form.phone}
                onChange={set("phone")}
                onBlur={blur("phone")}
                placeholder="+63 912 345 6789"
                type="tel"
                maxLength={20}
              />
            </Field>

            <Field label="Company" error={errors.company} hint="Your corporate account name">
              <input
                className={iCls(errors.company)}
                value={form.company}
                onChange={set("company")}
                onBlur={blur("company")}
                placeholder="Acme Corp"
                maxLength={101}
              />
            </Field>

            <Field label="Email">
              <input
                className={iCls(undefined, "opacity-50 cursor-not-allowed")}
                value={profile?.email ?? ""}
                readOnly
                disabled
              />
            </Field>

            {serverError && (
              <div className="flex items-center gap-2.5 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {serverError}
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2.5 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Profile saved successfully.
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#c8783a] text-white rounded-xl px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#b5692e] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Saving…
                  </>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Account details */}
        <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1208]/[0.06]">
            <h2 className="text-[13px] font-bold text-[#1a1208]">Account Details</h2>
          </div>
          <div className="divide-y divide-[#1a1208]/[0.05]">
            <Row label="Account ID">
              <span className="font-mono text-[11px] text-[#1a1208]/50 truncate max-w-[200px]">{profile?.id}</span>
            </Row>
            <Row label="Role">
              {profile?.role && <RoleBadge role={profile.role} />}
            </Row>
            <Row label="Credit Line">
              <span className="text-[13px] font-semibold text-[#1a1208]">
                ₱{(profile?.creditLine ?? 0).toLocaleString()}
              </span>
            </Row>
            <Row label="Member Since">
              <span className="text-[12px] text-[#1a1208]/50">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
                  : "—"}
              </span>
            </Row>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1208]/[0.06]">
            <h2 className="text-[13px] font-bold text-[#1a1208]">Session</h2>
          </div>
          <div className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-[#1a1208]">Sign out</p>
              <p className="text-[11px] text-[#1a1208]/40 mt-0.5">You will be redirected to the home page.</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-red-600 border border-red-200 hover:bg-red-50 rounded-xl px-4 py-2.5 transition-all duration-200 active:scale-[0.98]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 gap-4">
      <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1a1208]/35 shrink-0">{label}</span>
      <div className="flex justify-end">{children}</div>
    </div>
  );
}
