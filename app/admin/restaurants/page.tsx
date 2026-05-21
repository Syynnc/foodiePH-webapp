"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Field, iCls, V } from "@/app/components/FormField";

type Restaurant = {
    id: string;
    name: string;
    cuisine: string | null;
    description: string | null;
    address: string | null;
    phone: string | null;
    imageUrl: string | null;
    rating: string | null;
    minOrder: number | null;
    deliveryTime: string | null;
    isActive: boolean | null;
    createdAt: string | null;
    ownerId: string | null;
    ownerEmail: string | null;
    ownerName: string | null;
    menuItemCount: number;
};

const EMPTY_FORM = {
    name: "", cuisine: "", description: "", address: "", phone: "",
    imageUrl: "", minOrder: "500", deliveryTime: "30–45 min", ownerId: "",
};

type FormData = typeof EMPTY_FORM;
type Errors = Partial<Record<keyof FormData, string>>;

function validateRestaurant(f: FormData): Errors {
    const e: Errors = {};
    const name = V.first(V.required(f.name, "Name"), V.minLen(f.name, 2, "Name"), V.maxLen(f.name, 100, "Name"));
    if (name) e.name = name;
    if (f.cuisine) { const err = V.maxLen(f.cuisine, 60, "Cuisine"); if (err) e.cuisine = err; }
    if (f.description) { const err = V.maxLen(f.description, 500, "Description"); if (err) e.description = err; }
    if (f.address) { const err = V.maxLen(f.address, 200, "Address"); if (err) e.address = err; }
    if (f.phone) { const err = V.phone(f.phone); if (err) e.phone = err; }
    if (f.imageUrl) { const err = V.url(f.imageUrl); if (err) e.imageUrl = err; }
    if (f.minOrder) { const err = V.nonNegativeInt(f.minOrder, "Min. order"); if (err) e.minOrder = err; }
    if (f.deliveryTime) { const err = V.maxLen(f.deliveryTime, 30, "Delivery time"); if (err) e.deliveryTime = err; }
    if (f.ownerId) { const err = V.uuid(f.ownerId); if (err) e.ownerId = err; }
    return e;
}

function RestaurantForm({
    initial,
    onSave,
    onCancel,
    saving,
    serverError,
}: {
    initial: FormData;
    onSave: (data: FormData) => void;
    onCancel: () => void;
    saving: boolean;
    serverError?: string;
}) {
    const [form, setForm] = useState<FormData>(initial);
    const [errors, setErrors] = useState<Errors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

    function set(k: keyof FormData) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const val = e.target.value;
            setForm(f => ({ ...f, [k]: val }));
            // Re-validate live once field has been touched
            if (touched[k]) {
                const next = validateRestaurant({ ...form, [k]: val });
                setErrors(prev => ({ ...prev, [k]: next[k] }));
            }
        };
    }

    function blur(k: keyof FormData) {
        return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const trimmed = e.target.value.trim();
            setForm(f => ({ ...f, [k]: trimmed }));
            setTouched(t => ({ ...t, [k]: true }));
            const next = validateRestaurant({ ...form, [k]: trimmed });
            setErrors(prev => ({ ...prev, [k]: next[k] }));
        };
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Mark everything touched & validate all
        const allTouched = Object.fromEntries(Object.keys(form).map(k => [k, true])) as typeof touched;
        setTouched(allTouched);
        const errs = validateRestaurant(form);
        setErrors(errs);
        if (Object.values(errs).some(Boolean)) return;
        onSave(form);
    }

    const hasErrors = Object.values(errors).some(Boolean);

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="sm:col-span-2">
                    <Field label="Restaurant Name" required error={errors.name}>
                        <input
                            className={iCls(errors.name)}
                            value={form.name}
                            onChange={set("name")}
                            onBlur={blur("name")}
                            placeholder="e.g. Wildflour Café"
                            maxLength={101}
                        />
                    </Field>
                </div>

                <Field label="Cuisine Type" error={errors.cuisine}>
                    <input
                        className={iCls(errors.cuisine)}
                        value={form.cuisine}
                        onChange={set("cuisine")}
                        onBlur={blur("cuisine")}
                        placeholder="e.g. Italian, Filipino"
                        maxLength={61}
                    />
                </Field>

                <Field label="Delivery Time" error={errors.deliveryTime}>
                    <input
                        className={iCls(errors.deliveryTime)}
                        value={form.deliveryTime}
                        onChange={set("deliveryTime")}
                        onBlur={blur("deliveryTime")}
                        placeholder="e.g. 25–35 min"
                        maxLength={31}
                    />
                </Field>

                <Field label="Min. Order (₱)" error={errors.minOrder}>
                    <input
                        className={iCls(errors.minOrder)}
                        type="number"
                        value={form.minOrder}
                        onChange={set("minOrder")}
                        onBlur={blur("minOrder")}
                        placeholder="500"
                        min="0"
                        step="1"
                    />
                </Field>

                <Field label="Phone" error={errors.phone} hint="+63 followed by 10 digits">
                    <input
                        className={iCls(errors.phone)}
                        value={form.phone}
                        onChange={e => { const v = e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, ""); set("phone")({ ...e, target: { ...e.target, value: v } }); }}
                        onBlur={blur("phone")}
                        placeholder="+639312345678"
                        type="tel"
                        maxLength={13}
                    />
                </Field>

                <div className="sm:col-span-2">
                    <Field label="Address" error={errors.address}>
                        <input
                            className={iCls(errors.address)}
                            value={form.address}
                            onChange={set("address")}
                            onBlur={blur("address")}
                            placeholder="Full street address"
                            maxLength={201}
                        />
                    </Field>
                </div>

                <div className="sm:col-span-2">
                    <Field label="Image URL" error={errors.imageUrl} hint="Must start with https://. Leave blank for no image.">
                        <input
                            className={iCls(errors.imageUrl)}
                            value={form.imageUrl}
                            onChange={set("imageUrl")}
                            onBlur={blur("imageUrl")}
                            placeholder="https://example.com/image.jpg"
                            type="url"
                        />
                    </Field>
                </div>

                <div className="sm:col-span-2">
                    <Field
                        label="Description"
                        error={errors.description}
                        charCount={form.description.length}
                        maxChars={500}
                    >
                        <textarea
                            className={iCls(errors.description, "resize-none h-20")}
                            value={form.description}
                            onChange={set("description")}
                            onBlur={blur("description")}
                            placeholder="Brief description of the restaurant"
                            maxLength={501}
                        />
                    </Field>
                </div>

                <div className="sm:col-span-2">
                    <Field
                        label="Owner Account (User ID)"
                        error={errors.ownerId}
                        hint="Paste the user's UUID to link their account. They'll get the 'restaurant' role and access to the owner portal."
                    >
                        <input
                            className={iCls(errors.ownerId, "font-mono text-[12px]")}
                            value={form.ownerId}
                            onChange={set("ownerId")}
                            onBlur={blur("ownerId")}
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            spellCheck={false}
                        />
                    </Field>
                </div>
            </div>

            {serverError && (
                <div className="flex items-center gap-2.5 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {serverError}
                </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#1a1208]/[0.06]">
                {hasErrors && (
                    <p className="text-[11px] text-red-500 font-medium">Fix the errors above before saving.</p>
                )}
                <div className="flex items-center gap-3 ml-auto">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 text-[12px] font-semibold text-[#1a1208]/45 hover:text-[#1a1208] transition-colors duration-200"
                    >
                        Cancel
                    </button>
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
                        ) : "Save Restaurant"}
                    </button>
                </div>
            </div>
        </form>
    );
}

const PAGE_LIMIT = 15;

export default function AdminRestaurantsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(searchParams.get("new") === "1");
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [refreshKey, setRefreshKey] = useState(0);
    const reload = useCallback(() => setRefreshKey(k => k + 1), []);

    useEffect(() => {
        let cancelled = false;
        const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT), ...(search ? { search } : {}) });
        fetch(`/api/admin/restaurants?${qs}`)
            .then(r => r.json())
            .then(d => {
                if (cancelled) return;
                setRestaurants(Array.isArray(d.data) ? d.data : []);
                setTotal(d.total ?? 0);
                setLoading(false);
            })
            .catch(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [page, search, refreshKey]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    }

    function clearSearch() {
        setSearchInput("");
        setSearch("");
        setPage(1);
    }

    async function handleCreate(form: FormData) {
        setSaving(true); setServerError("");
        const res = await fetch("/api/admin/restaurants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setSaving(false);
        if (!res.ok) { setServerError((await res.json()).error ?? "Failed to save. Try again."); return; }
        setShowForm(false);
        router.replace("/admin/restaurants");
        setPage(1);
        reload();
    }

    async function handleToggle(id: string, isActive: boolean) {
        const r = restaurants.find(r => r.id === id);
        if (!r) return;
        await fetch(`/api/admin/restaurants/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...r, isActive: String(!isActive) }),
        });
        reload();
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}" and all its menu items?\n\nThis cannot be undone.`)) return;
        await fetch(`/api/admin/restaurants/${id}`, { method: "DELETE" });
        reload();
    }

    const totalPages = Math.ceil(total / PAGE_LIMIT);
    const filtered = restaurants; // filtering is now server-side

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.26em] font-semibold text-[#c8783a] mb-2">Admin · Restaurants</p>
                    <h1 className="font-playfair text-[2.2rem] font-bold text-[#1a1208] leading-tight">Restaurants</h1>
                    <p className="text-[13px] text-[#1a1208]/40 mt-1">{total} total</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => { setShowForm(true); setServerError(""); }}
                        className="flex items-center gap-2.5 bg-[#1a1208] text-white rounded-xl px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#2d2014] active:scale-[0.98] transition-all duration-300 self-start sm:self-end shadow-[0_4px_14px_rgba(26,18,8,0.18)]"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Restaurant
                    </button>
                )}
            </div>

            {/* Add form */}
            {showForm && (
                <div className="bg-white border border-[#1a1208]/[0.08] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-playfair text-[1.35rem] font-bold text-[#1a1208]">New Restaurant</h2>
                        <button
                            onClick={() => { setShowForm(false); setServerError(""); }}
                            aria-label="Close new restaurant form"
                            title="Close"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1a1208]/30 hover:text-[#1a1208]/60 hover:bg-[#1a1208]/[0.05] transition-all duration-200"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    <RestaurantForm
                        initial={EMPTY_FORM}
                        onSave={handleCreate}
                        onCancel={() => { setShowForm(false); setServerError(""); }}
                        saving={saving}
                        serverError={serverError}
                    />
                </div>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex gap-2">
                <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1208]/25 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search by name or cuisine…"
                        className="w-full pl-9 pr-4 py-2.5 border border-[#1a1208]/10 rounded-xl text-[13px] text-[#1a1208] bg-white placeholder:text-[#1a1208]/25 outline-none focus:border-[#c8783a]/40 focus:ring-2 focus:ring-[#c8783a]/10 transition-all duration-200"
                    />
                    {searchInput && (
                        <button type="button" onClick={clearSearch} aria-label="Clear search" title="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1208]/25 hover:text-[#1a1208]/50 transition-colors">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
                <button type="submit" className="px-4 py-2.5 bg-[#1a1208] text-white rounded-xl text-[12px] font-bold uppercase tracking-[0.08em] hover:bg-[#2d2014] transition-colors">Search</button>
            </form>

            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    [...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white border border-[#1a1208]/[0.06] rounded-2xl overflow-hidden animate-pulse" style={{ animationDelay: `${i * 40}ms` }}>
                            <div className="h-36 bg-[#F4F0EB]" />
                            <div className="p-4 space-y-2.5">
                                <div className="h-3 bg-[#F4F0EB] rounded-full w-3/4" />
                                <div className="h-2.5 bg-[#F4F0EB] rounded-full w-1/2" />
                                <div className="h-2 bg-[#F4F0EB] rounded-full w-2/3" />
                            </div>
                        </div>
                    ))
                ) : !filtered.length ? (
                    <div className="col-span-full bg-white border border-[#1a1208]/[0.07] rounded-2xl p-14 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#F4F0EB] flex items-center justify-center mx-auto mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
                                <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" /><path d="M10 14h4" />
                            </svg>
                        </div>
                        <p className="text-[13px] font-semibold text-[#1a1208]/35">
                            {search ? `No restaurants matching "${search}"` : "No restaurants yet — add one above"}
                        </p>
                    </div>
                ) : (
                    filtered.map(r => (
                        <div key={r.id} className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden hover:border-[#1a1208]/15 hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] transition-all duration-300 group flex flex-col">

                            {/* Cover image */}
                            <div className="relative h-36 bg-[#F4F0EB] shrink-0 overflow-hidden">
                                {r.imageUrl ? (
                                    <Image
                                        src={r.imageUrl} alt={r.name} fill
                                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#1a1208]/10">
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
                                            <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" /><path d="M10 14h4" />
                                        </svg>
                                    </div>
                                )}
                                {/* Status badge overlaid on image */}
                                <div className="absolute top-2.5 right-2.5">
                                    <span className={`text-[9px] uppercase tracking-[0.15em] font-bold rounded-full px-2 py-0.5 backdrop-blur-sm ${r.isActive ? "bg-emerald-500/90 text-white" : "bg-[#1a1208]/60 text-white/80"}`}>
                                        {r.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                {/* Rating badge */}
                                {r.rating && (
                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-[#1a1208]/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                        <span className="text-[10px] font-bold text-white">{r.rating}</span>
                                    </div>
                                )}
                            </div>

                            {/* Body */}
                            <div className="p-4 flex flex-col flex-1 gap-3">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="text-[13.5px] font-bold text-[#1a1208] leading-snug line-clamp-1">{r.name}</h3>
                                    </div>
                                    {r.cuisine && (
                                        <span className="text-[9px] uppercase tracking-[0.18em] font-semibold text-[#1a1208]/35 border border-[#1a1208]/10 rounded-full px-2 py-0.5 inline-block">
                                            {r.cuisine}
                                        </span>
                                    )}

                                    {/* Stats row */}
                                    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                                        <span className="flex items-center gap-1 text-[11px] text-[#1a1208]/40">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" /><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
                                            </svg>
                                            {r.menuItemCount} items
                                        </span>
                                        {r.deliveryTime && (
                                            <span className="flex items-center gap-1 text-[11px] text-[#1a1208]/40">
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                {r.deliveryTime}
                                            </span>
                                        )}
                                        {r.minOrder != null && (
                                            <span className="text-[11px] text-[#1a1208]/40">₱{r.minOrder} min</span>
                                        )}
                                    </div>

                                    {r.ownerName && (
                                        <p className="mt-1.5 text-[10.5px] text-[#c8783a]/80 truncate">
                                            Owner: {r.ownerName}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-[#1a1208]/[0.06]">
                                    <Link
                                        href={`/admin/restaurants/${r.id}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#1a1208]/50 hover:text-[#1a1208] border border-[#1a1208]/10 hover:border-[#1a1208]/25 rounded-lg px-3 py-1.5 transition-all duration-200"
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleToggle(r.id, !!r.isActive)}
                                        className={`flex-1 text-[11px] font-semibold border rounded-lg px-3 py-1.5 transition-all duration-200 ${r.isActive
                                            ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                                            : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}
                                    >
                                        {r.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id, r.name)}
                                        className="w-8 h-8 flex items-center justify-center text-[#1a1208]/20 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all duration-200 shrink-0"
                                        title="Delete restaurant"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-[12px] text-[#1a1208]/40">
                        Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#1a1208]/10 text-[#1a1208]/40 hover:text-[#1a1208] hover:border-[#1a1208]/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Previous page"
                            title="Previous page"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | "…")[]>((acc, p, i, arr) => {
                                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === "…" ? (
                                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-[#1a1208]/25">…</span>
                                ) : (
                                    <button key={p}
                                        type="button"
                                        onClick={() => setPage(p as number)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-all ${p === page ? "bg-[#1a1208] text-white" : "text-[#1a1208]/50 hover:bg-[#1a1208]/[0.06] border border-[#1a1208]/10"}`}
                                    >{p}</button>
                                )
                            )
                        }
                        <button
                            type="button"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#1a1208]/10 text-[#1a1208]/40 hover:text-[#1a1208] hover:border-[#1a1208]/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Next page"
                            title="Next page"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
