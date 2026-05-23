"use client";

import { use, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Field, iCls, V } from "@/app/components/FormField";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

type Restaurant = {
    id: string;
    name: string;
    cuisine: string | null;
    description: string | null;
    address: string | null;
    phone: string | null;
    imageUrl: string | null;
    minOrder: number | null;
    deliveryTime: string | null;
    isActive: boolean | null;
};

type MenuItem = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    category: string | null;
    isAvailable: boolean | null;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const EMPTY_ITEM = { name: "", description: "", price: "", imageUrl: "", category: "", isAvailable: "true" };
type ItemForm = typeof EMPTY_ITEM;
type ItemErrors = Partial<Record<keyof ItemForm, string>>;

function validateItem(f: ItemForm): ItemErrors {
    const e: ItemErrors = {};
    const name = V.first(V.required(f.name, "Name"), V.maxLen(f.name, 100, "Name"));
    if (name) e.name = name;
    if (!f.price || isNaN(Number(f.price)) || Number(f.price) <= 0) e.price = "Price must be greater than 0";
    if (f.imageUrl) { const err = V.url(f.imageUrl); if (err) e.imageUrl = err; }
    if (f.category) { const err = V.maxLen(f.category, 60, "Category"); if (err) e.category = err; }
    return e;
}

// ── Inline SVG icons ───────────────────────────────────────────────────────────

const Icons = {
    restaurant: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" /><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" /><path d="M10 14h4" /></svg>,
    menu: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    edit: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    trash: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
    plus: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    close: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    spinner: <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    back: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7" /></svg>,
};

// ── Item drawer ────────────────────────────────────────────────────────────────

function ItemDrawer({ initial, title, onSave, onCancel, saving, error }: {
    initial: ItemForm; title: string;
    onSave: (d: ItemForm) => void; onCancel: () => void;
    saving: boolean; error?: string;
}) {
    const [form, setForm] = useState<ItemForm>(initial);
    const [errors, setErrors] = useState<ItemErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof ItemForm, boolean>>>({});

    function set(k: keyof ItemForm) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const val = e.target.value;
            setForm(f => ({ ...f, [k]: val }));
            if (touched[k]) setErrors(prev => ({ ...prev, [k]: validateItem({ ...form, [k]: val })[k] }));
        };
    }
    function blur(k: keyof ItemForm) {
        return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const trimmed = e.target.value.trim();
            setForm(f => ({ ...f, [k]: trimmed }));
            setTouched(t => ({ ...t, [k]: true }));
            setErrors(prev => ({ ...prev, [k]: validateItem({ ...form, [k]: trimmed })[k] }));
        };
    }
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setTouched({ name: true, price: true, imageUrl: true, category: true });
        const errs = validateItem(form);
        setErrors(errs);
        if (Object.values(errs).some(Boolean)) return;
        onSave(form);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1208]/[0.07] flex-shrink-0">
                <h3 className="font-playfair text-[1.05rem] font-bold text-[#1a1208]">{title}</h3>
                <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#1a1208]/30 hover:text-[#1a1208]/60 hover:bg-[#1a1208]/[0.05] transition-all">{Icons.close}</button>
            </div>
            <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-6 py-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-4">
                        <Field label="Item Name" required error={errors.name}>
                            <input className={iCls(errors.name)} value={form.name} onChange={set("name")} onBlur={blur("name")} placeholder="e.g. Tonkotsu Ramen" maxLength={101} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Price (₱)" required error={errors.price}>
                                <input className={iCls(errors.price)} type="number" value={form.price} onChange={set("price")} onBlur={blur("price")} min="1" placeholder="0" />
                            </Field>
                            <Field label="Category" error={errors.category}>
                                <input className={iCls(errors.category)} value={form.category} onChange={set("category")} onBlur={blur("category")} placeholder="e.g. Mains" maxLength={61} />
                            </Field>
                        </div>
                        <Field label="Availability">
                            <select className={iCls()} value={form.isAvailable} onChange={set("isAvailable")} title="Availability">
                                <option value="true">Available</option>
                                <option value="false">Unavailable</option>
                            </select>
                        </Field>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Field label="Item Photo URL" error={errors.imageUrl}>
                                <input className={iCls(errors.imageUrl)} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} onBlur={() => setTouched(t => ({ ...t, imageUrl: true }))} placeholder="https://..." type="url" />
                            </Field>
                        </div>
                        <Field label="Description">
                            <textarea className={iCls(undefined, "resize-none h-[90px]")} value={form.description} onChange={set("description")} placeholder="Brief description of the item" />
                        </Field>
                    </div>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mt-4">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}
            </form>
            <div className="px-6 py-4 border-t border-[#1a1208]/[0.06] flex-shrink-0 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-[12px] font-semibold text-[#1a1208]/45 hover:text-[#1a1208] transition-colors">Cancel</button>
                <button onClick={handleSubmit as never} disabled={saving} className="flex items-center gap-2 bg-[#c8783a] text-white rounded-xl px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#b5692e] active:scale-[0.98] transition-all disabled:opacity-50">
                    {saving ? <>{Icons.spinner} Saving…</> : <>{Icons.check} Save Item</>}
                </button>
            </div>
        </div>
    );
}

// ── Item card ──────────────────────────────────────────────────────────────────

function ItemCard({ item, onEdit, onDelete, onToggle, toggling }: {
    item: MenuItem; onEdit: () => void; onDelete: () => void; onToggle: () => void; toggling: boolean;
}) {
    return (
        <div className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#1a1208]/15 flex flex-col ${item.isAvailable ? "border-[#1a1208]/[0.07]" : "border-[#1a1208]/[0.04] opacity-60"}`}>
            <div className="relative h-32 bg-[#F4F0EB] flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1a1208]/10">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    </div>
                )}
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-[#1a1208]/30 flex items-center justify-center">
                        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white bg-[#1a1208]/60 rounded-full px-2.5 py-1 backdrop-blur-sm">Unavailable</span>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 bg-[#1a1208]/80 backdrop-blur-sm text-white font-bold text-[12px] px-2.5 py-1 rounded-full">₱{item.price.toLocaleString()}</div>
            </div>
            <div className="p-3.5 flex flex-col flex-1 gap-2">
                <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#1a1208] leading-snug line-clamp-1">{item.name}</p>
                    {item.description && <p className="text-[11px] text-[#1a1208]/40 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 pt-2.5 border-t border-[#1a1208]/[0.05]">
                    <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#1a1208]/45 hover:text-[#1a1208] border border-[#1a1208]/10 hover:border-[#1a1208]/25 rounded-lg py-1.5 transition-all duration-200">{Icons.edit} Edit</button>
                    <button onClick={onToggle} disabled={toggling} className={`flex-1 text-[11px] font-semibold border rounded-lg py-1.5 transition-all duration-200 disabled:opacity-40 ${item.isAvailable ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}>{item.isAvailable ? "Disable" : "Enable"}</button>
                    <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center text-[#1a1208]/20 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all duration-200 flex-shrink-0">{Icons.trash}</button>
                </div>
            </div>
        </div>
    );
}

// ── Sidebar field ──────────────────────────────────────────────────────────────

const sidebarInput = "w-full bg-white/[0.07] border border-white/[0.10] rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/25 outline-none focus:border-[#c8783a]/60 focus:ring-2 focus:ring-[#c8783a]/15 transition-all duration-200";

function SidebarField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-[9.5px] uppercase tracking-[0.18em] font-semibold text-white/35 mb-1.5 flex items-center gap-1">
                {label}{required && <span className="text-[#c8783a]">*</span>}
            </label>
            {children}
            {hint && <p className="text-[9px] text-white/20 mt-1 leading-relaxed">{hint}</p>}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function RestaurantPortal({ params }: { params: Promise<{ id: string }> }) {
    const { id: restaurantId } = use(params);

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState<Record<string, string>>({});
    const [savingRest, setSavingRest] = useState(false);
    const [restError, setRestError] = useState("");
    const [restSuccess, setRestSuccess] = useState(false);
    const [detailsDirty, setDetailsDirty] = useState(false);

    const [drawer, setDrawer] = useState<null | "add" | MenuItem>(null);
    const [savingItem, setSavingItem] = useState(false);
    const [menuError, setMenuError] = useState("");
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [bulkToggling, setBulkToggling] = useState(false);
    const [mobileTab, setMobileTab] = useState<"menu" | "details">("menu");

    const loadAll = useCallback(async () => {
        const [rRes, mRes] = await Promise.all([
            fetch(`/api/restaurant/${restaurantId}/profile`),
            fetch(`/api/restaurant/${restaurantId}/menu`),
        ]);
        if (rRes.ok) {
            const r: Restaurant = await rRes.json();
            setRestaurant(r);
            setForm({
                name: r.name ?? "",
                cuisine: r.cuisine ?? "",
                description: r.description ?? "",
                address: r.address ?? "",
                phone: r.phone ?? "",
                imageUrl: r.imageUrl ?? "",
                minOrder: String(r.minOrder ?? 500),
                deliveryTime: r.deliveryTime ?? "",
            });
            setDetailsDirty(false);
        }
        if (mRes.ok) setMenuItems(await mRes.json());
        setLoading(false);
    }, [restaurantId]);

    useEffect(() => {
        const t = setTimeout(() => { void loadAll(); }, 0);
        return () => clearTimeout(t);
    }, [loadAll]);

    const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(f => ({ ...f, [k]: e.target.value }));
        setDetailsDirty(true);
    };

    async function saveDetails() {
        setSavingRest(true); setRestError(""); setRestSuccess(false);
        const res = await fetch(`/api/restaurant/${restaurantId}/profile`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        setSavingRest(false);
        if (!res.ok) {
            const msg = (await res.json()).error ?? "Failed";
            setRestError(msg); toast.error(msg); return;
        }
        setRestSuccess(true); setDetailsDirty(false);
        toast.success("Restaurant details saved.");
        loadAll();
        setTimeout(() => setRestSuccess(false), 3000);
    }

    async function addItem(f: ItemForm) {
        setSavingItem(true); setMenuError("");
        const res = await fetch(`/api/restaurant/${restaurantId}/menu`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
        });
        setSavingItem(false);
        if (!res.ok) { const msg = (await res.json()).error ?? "Failed"; setMenuError(msg); toast.error(msg); return; }
        toast.success("Menu item added.");
        setDrawer(null); loadAll();
    }

    async function updateItem(f: ItemForm) {
        if (!drawer || drawer === "add") return;
        setSavingItem(true); setMenuError("");
        const res = await fetch(`/api/restaurant/${restaurantId}/menu/${(drawer as MenuItem).id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
        });
        setSavingItem(false);
        if (!res.ok) { const msg = (await res.json()).error ?? "Failed"; setMenuError(msg); toast.error(msg); return; }
        toast.success("Menu item updated.");
        setDrawer(null); loadAll();
    }

    async function deleteItem(item: MenuItem) {
        if (!confirm(`Delete "${item.name}"?`)) return;
        await fetch(`/api/restaurant/${restaurantId}/menu/${item.id}`, { method: "DELETE" });
        toast.success(`"${item.name}" deleted.`);
        loadAll();
    }

    async function bulkToggleCategory(isAvailable: boolean) {
        setBulkToggling(true);
        const res = await fetch(`/api/restaurant/${restaurantId}/menu`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: activeCategory, isAvailable }),
        });
        setBulkToggling(false);
        if (!res.ok) { toast.error("Bulk update failed"); return; }
        const count = menuItems.filter(i => (i.category ?? "Uncategorized") === activeCategory).length;
        toast.success(`${count} item${count !== 1 ? "s" : ""} in "${activeCategory}" ${isAvailable ? "enabled" : "disabled"}.`);
        loadAll();
    }

    async function toggleAvailability(item: MenuItem) {
        setTogglingId(item.id);
        await fetch(`/api/restaurant/${restaurantId}/menu/${item.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAvailable: !item.isAvailable }),
        });
        toast.success(item.isAvailable ? `"${item.name}" disabled.` : `"${item.name}" enabled.`);
        setTogglingId(null); loadAll();
    }

    const categories = ["all", ...Array.from(new Set(menuItems.map(i => i.category ?? "Uncategorized")))];
    const visibleItems = activeCategory === "all" ? menuItems : menuItems.filter(i => (i.category ?? "Uncategorized") === activeCategory);

    if (loading) {
        return (
            <div className="h-[100dvh] bg-[#F4F0EB] flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-80 bg-[#1a1208] p-6 space-y-4 flex-shrink-0 hidden md:block">
                    <div className="h-5 w-32 bg-white/[0.07] rounded-full animate-pulse" />
                    <div className="h-32 bg-white/[0.04] rounded-2xl animate-pulse" />
                    {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-white/[0.04] rounded-xl animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />)}
                </div>
                <div className="flex-1 p-8 grid grid-cols-3 gap-4 content-start">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ animationDelay: `${i * 40}ms` }}>
                            <div className="h-32 bg-[#F4F0EB]" />
                            <div className="p-4 space-y-2">
                                <div className="h-3.5 w-3/4 bg-[#1a1208]/[0.07] rounded-full" />
                                <div className="h-3 w-1/2 bg-[#1a1208]/[0.04] rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const drawerOpen = drawer !== null;

    return (
        <div className="h-[100dvh] bg-[#F4F0EB] flex flex-col md:flex-row overflow-hidden">

            {/* Mobile tab bar */}
            <div className="md:hidden flex border-b border-[#1a1208]/[0.09] bg-white shrink-0">
                {(["menu", "details"] as const).map(tab => (
                    <button key={tab} onClick={() => setMobileTab(tab)}
                        className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${mobileTab === tab ? "text-[#c8783a] border-b-2 border-[#c8783a]" : "text-[#1a1208]/40"}`}>
                        {tab === "menu" ? "Menu" : "Details"}
                    </button>
                ))}
            </div>

            {/* LEFT: sidebar */}
            <aside className={`md:w-[300px] xl:w-[340px] flex-shrink-0 flex flex-col md:h-full overflow-hidden bg-[#1a1208] ${mobileTab === "details" ? "flex h-[calc(100dvh-42px)]" : "hidden md:flex"}`}>

                <div className="relative h-44 flex-shrink-0 overflow-hidden bg-[#0d0905]">
                    {form.imageUrl ? (
                        <Image src={form.imageUrl} alt={restaurant?.name ?? ""} fill className="object-cover opacity-60" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-[0.07]">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" /><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" /><path d="M10 14h4" /></svg>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208] via-[#1a1208]/50 to-transparent" />
                    <div className="absolute top-4 left-5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#c8783a] flex items-center justify-center">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.28em] font-bold text-white/50">Owner Portal</span>
                    </div>
                    <div className="absolute top-4 right-4">
                        <span className={`text-[9px] font-bold uppercase tracking-[0.16em] rounded-full px-2.5 py-1 ${restaurant?.isActive ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"}`}>
                            {restaurant?.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                        <h1 className="font-playfair text-[1.25rem] font-bold text-white leading-snug line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{restaurant?.name}</h1>
                        {restaurant?.cuisine && <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#c8783a] mt-0.5">{restaurant.cuisine}</p>}
                    </div>
                </div>

                <div className="flex-shrink-0 grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
                    {[
                        { label: "Items", value: menuItems.length },
                        { label: "Min Order", value: form.minOrder ? `₱${Number(form.minOrder).toLocaleString()}` : "—" },
                        { label: "Delivery", value: form.deliveryTime || "—" },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col items-center py-3 px-2 gap-0.5">
                            <span className="font-playfair text-[1rem] font-bold text-white leading-none tabular-nums">{value}</span>
                            <span className="text-[8.5px] uppercase tracking-[0.18em] font-semibold text-white/30">{label}</span>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-none">
                    <div className="px-5 pt-5 pb-2">
                        <p className="text-[8.5px] uppercase tracking-[0.28em] font-bold text-white/25 mb-3">Identity</p>
                        <div className="space-y-3">
                            <SidebarField label="Restaurant Name" required>
                                <input className={sidebarInput} value={form.name ?? ""} onChange={setField("name")} placeholder="Restaurant name" />
                            </SidebarField>
                            <SidebarField label="Cuisine Type">
                                <input className={sidebarInput} value={form.cuisine ?? ""} onChange={setField("cuisine")} placeholder="e.g. Italian, Filipino" />
                            </SidebarField>
                            <SidebarField label="Description">
                                <textarea className={`${sidebarInput} resize-none h-[72px]`} value={form.description ?? ""} onChange={setField("description")} placeholder="Tell customers about your restaurant" />
                            </SidebarField>
                        </div>
                    </div>
                    <div className="mx-5 my-1 border-t border-white/[0.06]" />
                    <div className="px-5 pt-3 pb-2">
                        <p className="text-[8.5px] uppercase tracking-[0.28em] font-bold text-white/25 mb-3">Operations</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <SidebarField label="Min. Order (₱)">
                                <input className={sidebarInput} type="number" value={form.minOrder ?? ""} onChange={setField("minOrder")} placeholder="500" min="0" />
                            </SidebarField>
                            <SidebarField label="Delivery Time">
                                <input className={sidebarInput} value={form.deliveryTime ?? ""} onChange={setField("deliveryTime")} placeholder="25–35 min" />
                            </SidebarField>
                        </div>
                    </div>
                    <div className="mx-5 my-1 border-t border-white/[0.06]" />
                    <div className="px-5 pt-3 pb-2">
                        <p className="text-[8.5px] uppercase tracking-[0.28em] font-bold text-white/25 mb-3">Contact</p>
                        <div className="space-y-2.5">
                            <SidebarField label="Phone">
                                <input className={sidebarInput} value={form.phone ?? ""} onChange={e => { const v = e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, ""); setField("phone")({ ...e, target: { ...e.target, value: v } }); }} placeholder="+639312345678" type="tel" maxLength={16} />
                            </SidebarField>
                            <SidebarField label="Address">
                                <input className={sidebarInput} value={form.address ?? ""} onChange={setField("address")} placeholder="Full street address" />
                            </SidebarField>
                        </div>
                    </div>
                    <div className="mx-5 my-1 border-t border-white/[0.06]" />
                    <div className="px-5 pt-3 pb-5">
                        <p className="text-[8.5px] uppercase tracking-[0.28em] font-bold text-white/25 mb-3">Cover Photo</p>
                        <SidebarField label="Cover Photo URL" hint="Paste a direct image link (https://...).">
                            <input className={sidebarInput} value={form.imageUrl ?? ""} onChange={setField("imageUrl")} placeholder="https://..." type="url" />
                        </SidebarField>
                    </div>
                </div>

                {(restError || restSuccess) && (
                    <div className="px-5 pb-3 flex-shrink-0">
                        {restError && <div className="flex items-center gap-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{restError}</div>}
                        {restSuccess && <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">{Icons.check} Saved successfully.</div>}
                    </div>
                )}

                <div className="px-5 py-4 border-t border-white/[0.06] flex-shrink-0 space-y-2.5">
                    {/* Manage Orders shortcut */}
                    <Link href="/restaurant/orders"
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] bg-white/[0.08] text-white/70 hover:bg-white/[0.14] hover:text-white border border-white/[0.08] transition-all duration-200">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
                        </svg>
                        Manage Orders
                    </Link>

                    <button onClick={saveDetails} disabled={savingRest || !detailsDirty}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${detailsDirty ? "bg-[#c8783a] text-white hover:bg-[#d4894b] active:scale-[0.98] shadow-[0_4px_20px_rgba(200,120,58,0.35)]" : "bg-white/[0.06] text-white/20 cursor-not-allowed"}`}>
                        {savingRest ? <>{Icons.spinner} Saving…</> : <>{Icons.check} Save Changes</>}
                    </button>
                    <Link href="/restaurant" className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-white/25 hover:text-white/50 transition-colors duration-200">
                        {Icons.back} All restaurants
                    </Link>
                </div>
            </aside>

            {/* RIGHT: menu panel */}
            <div className={`flex-1 flex flex-col overflow-hidden ${mobileTab === "menu" ? "flex" : "hidden md:flex"}`}>
                <div className="flex-shrink-0 bg-[#F4F0EB] px-6 pt-5 pb-0">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 text-[#1a1208]/40 mb-1">{Icons.menu}<span className="text-[9px] uppercase tracking-[0.22em] font-bold">Menu Management</span></div>
                            <h2 className="font-playfair text-[1.5rem] font-bold text-[#1a1208]">Menu<span className="ml-2.5 text-[1rem] font-normal text-[#1a1208]/30">({menuItems.length} items)</span></h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pb-4">
                        <button onClick={() => { setDrawer("add"); setMenuError(""); }} className="flex-shrink-0 flex items-center gap-2 bg-[#c8783a] text-white rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-[#b5692e] active:scale-[0.97] transition-all duration-200 shadow-[0_4px_16px_rgba(200,120,58,0.35)]">
                            {Icons.plus} Add Item
                        </button>
                        {activeCategory !== "all" && (
                            <>
                                <div className="w-px h-5 bg-[#1a1208]/10 flex-shrink-0" />
                                <button onClick={() => bulkToggleCategory(true)} disabled={bulkToggling} className="flex-shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1.5 hover:bg-emerald-100 active:scale-[0.97] transition-all duration-200 disabled:opacity-40">
                                    {bulkToggling ? Icons.spinner : Icons.check} Enable All
                                </button>
                                <button onClick={() => bulkToggleCategory(false)} disabled={bulkToggling} className="flex-shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3.5 py-1.5 hover:bg-amber-100 active:scale-[0.97] transition-all duration-200 disabled:opacity-40">
                                    {bulkToggling ? Icons.spinner : Icons.close} Disable All
                                </button>
                            </>
                        )}
                        <div className="w-px h-5 bg-[#1a1208]/10 flex-shrink-0" />
                        <div className="flex items-center gap-1.5 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 ${activeCategory === cat ? "bg-[#1a1208] text-white border-[#1a1208]" : "bg-white text-[#1a1208]/50 border-[#1a1208]/10 hover:border-[#1a1208]/25 hover:text-[#1a1208]/70"}`}>
                                    {cat === "all" ? `All (${menuItems.length})` : `${cat} (${menuItems.filter(i => (i.category ?? "Uncategorized") === cat).length})`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {visibleItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-[#1a1208]/[0.07] flex items-center justify-center text-[#1a1208]/15">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[#1a1208]/35">{activeCategory === "all" ? "No menu items yet" : `No items in "${activeCategory}"`}</p>
                                <p className="text-[11px] text-[#1a1208]/25 mt-1">Click &ldquo;Add Item&rdquo; to get started</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                            {visibleItems.map(item => (
                                <ItemCard key={item.id} item={item}
                                    onEdit={() => { setDrawer(item); setMenuError(""); }}
                                    onDelete={() => deleteItem(item)}
                                    onToggle={() => toggleAvailability(item)}
                                    toggling={togglingId === item.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer */}
            <div className={`fixed inset-0 bg-[#1a1208]/25 backdrop-blur-[2px] z-30 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setDrawer(null)} />
            <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl max-h-[58dvh] bg-white rounded-t-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.14)] z-40 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${drawerOpen ? "translate-y-0" : "translate-y-full"}`}>
                {drawerOpen && (
                    drawer === "add" ? (
                        <ItemDrawer title="New Menu Item" initial={EMPTY_ITEM} onSave={addItem} onCancel={() => setDrawer(null)} saving={savingItem} error={menuError} />
                    ) : (
                        <ItemDrawer title="Edit Item"
                            initial={{ name: (drawer as MenuItem).name, description: (drawer as MenuItem).description ?? "", price: String((drawer as MenuItem).price), imageUrl: (drawer as MenuItem).imageUrl ?? "", category: (drawer as MenuItem).category ?? "", isAvailable: String((drawer as MenuItem).isAvailable ?? true) }}
                            onSave={updateItem} onCancel={() => setDrawer(null)} saving={savingItem} error={menuError}
                        />
                    )
                )}
            </div>
        </div>
    );
}
