"use client";

import { useEffect, useState, useCallback, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Field, iCls, V } from "@/app/components/FormField";

type MenuItem = {
    id: string;
    restaurantId: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    category: string | null;
    isAvailable: boolean | null;
};

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
    ownerId: string | null;
    ownerEmail: string | null;
    ownerName: string | null;
    menuItems: MenuItem[];
};

// ── Shared types ──────────────────────────────────────────────────────────────

type RestForm = {
    name: string; cuisine: string; description: string; address: string;
    phone: string; imageUrl: string; minOrder: string; deliveryTime: string;
    ownerId: string; isActive: string;
};

type ItemForm = { name: string; description: string; price: string; imageUrl: string; category: string; isAvailable: string };
type Errs<T> = Partial<Record<keyof T, string>>;

// ── Validators ────────────────────────────────────────────────────────────────

function validateRest(f: RestForm): Errs<RestForm> {
    const e: Errs<RestForm> = {};
    const name = V.first(V.required(f.name, "Name"), V.minLen(f.name, 2, "Name"), V.maxLen(f.name, 100, "Name"));
    if (name) e.name = name;
    if (f.cuisine)      { const err = V.maxLen(f.cuisine, 60, "Cuisine"); if (err) e.cuisine = err; }
    if (f.description)  { const err = V.maxLen(f.description, 500, "Description"); if (err) e.description = err; }
    if (f.address)      { const err = V.maxLen(f.address, 200, "Address"); if (err) e.address = err; }
    if (f.phone)        { const err = V.phone(f.phone); if (err) e.phone = err; }
    if (f.imageUrl)     { const err = V.url(f.imageUrl); if (err) e.imageUrl = err; }
    if (f.minOrder)     { const err = V.nonNegativeInt(f.minOrder, "Min. order"); if (err) e.minOrder = err; }
    if (f.deliveryTime) { const err = V.maxLen(f.deliveryTime, 30, "Delivery time"); if (err) e.deliveryTime = err; }
    if (f.ownerId)      { const err = V.uuid(f.ownerId); if (err) e.ownerId = err; }
    return e;
}

function validateItem(f: ItemForm): Errs<ItemForm> {
    const e: Errs<ItemForm> = {};
    const name = V.first(V.required(f.name, "Name"), V.minLen(f.name, 2, "Name"), V.maxLen(f.name, 100, "Name"));
    if (name) e.name = name;
    const price = V.first(V.required(f.price, "Price"), V.positiveInt(f.price, "Price"));
    if (price) e.price = price;
    if (f.imageUrl)    { const err = V.url(f.imageUrl); if (err) e.imageUrl = err; }
    if (f.description) { const err = V.maxLen(f.description, 500, "Description"); if (err) e.description = err; }
    if (f.category)    { const err = V.maxLen(f.category, 60, "Category"); if (err) e.category = err; }
    return e;
}

// ── MenuItemForm ──────────────────────────────────────────────────────────────

const EMPTY_ITEM: ItemForm = { name: "", description: "", price: "", imageUrl: "", category: "", isAvailable: "true" };

function MenuItemForm({
    initial,
    onSave,
    onCancel,
    saving,
    title,
    serverError,
}: {
    initial: ItemForm;
    onSave: (d: ItemForm) => void;
    onCancel: () => void;
    saving: boolean;
    title: string;
    serverError?: string;
}) {
    const [form, setForm] = useState<ItemForm>(initial);
    const [errors, setErrors] = useState<Errs<ItemForm>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof ItemForm, boolean>>>({});

    function set(k: keyof ItemForm) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const val = e.target.value;
            setForm(f => ({ ...f, [k]: val }));
            if (touched[k]) {
                const next = validateItem({ ...form, [k]: val });
                setErrors(prev => ({ ...prev, [k]: next[k] }));
            }
        };
    }

    function blur(k: keyof ItemForm) {
        return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const trimmed = e.target.value.trim();
            setForm(f => ({ ...f, [k]: trimmed }));
            setTouched(t => ({ ...t, [k]: true }));
            const next = validateItem({ ...form, [k]: trimmed });
            setErrors(prev => ({ ...prev, [k]: next[k] }));
        };
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setTouched(Object.fromEntries(Object.keys(form).map(k => [k, true])) as typeof touched);
        const errs = validateItem(form);
        setErrors(errs);
        if (Object.values(errs).some(Boolean)) return;
        onSave(form);
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <h3 className="font-playfair text-[1.1rem] font-bold text-[#1a1208]">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="sm:col-span-2">
                    <Field label="Item Name" required error={errors.name}>
                        <input className={iCls(errors.name)} value={form.name} onChange={set("name")} onBlur={blur("name")} placeholder="e.g. Tonkotsu Ramen" maxLength={101} />
                    </Field>
                </div>

                <Field label="Price (₱)" required error={errors.price}>
                    <input className={iCls(errors.price)} type="number" value={form.price} onChange={set("price")} onBlur={blur("price")} placeholder="350" min="1" step="1" />
                </Field>

                <Field label="Category" error={errors.category}>
                    <input className={iCls(errors.category)} value={form.category} onChange={set("category")} onBlur={blur("category")} placeholder="e.g. Mains, Drinks, Desserts" maxLength={61} />
                </Field>

                <div className="sm:col-span-2">
                    <Field label="Image URL" error={errors.imageUrl}>
                        <input className={iCls(errors.imageUrl)} value={form.imageUrl} onChange={set("imageUrl")} onBlur={blur("imageUrl")} placeholder="https://..." type="url" />
                    </Field>
                </div>

                <div className="sm:col-span-2">
                    <Field label="Description" error={errors.description} charCount={form.description.length} maxChars={500}>
                        <textarea className={iCls(errors.description, "resize-none h-16")} value={form.description} onChange={set("description")} onBlur={blur("description")} placeholder="Brief description" maxLength={501} />
                    </Field>
                </div>

                <div>
                    <Field label="Availability">
                        <select className={iCls()} value={form.isAvailable} onChange={set("isAvailable")}>
                            <option value="true">Available</option>
                            <option value="false">Unavailable</option>
                        </select>
                    </Field>
                </div>
            </div>

            {serverError && (
                <div className="flex items-center gap-2 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {serverError}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-[12px] font-semibold text-[#1a1208]/45 hover:text-[#1a1208] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#c8783a] text-white rounded-xl px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#b5692e] active:scale-[0.98] transition-all duration-300 disabled:opacity-50">
                    {saving ? (
                        <><svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving…</>
                    ) : "Save Item"}
                </button>
            </div>
        </form>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminRestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"details" | "menu">("details");

    // Restaurant form state
    const [editForm, setEditForm] = useState<RestForm>({ name: "", cuisine: "", description: "", address: "", phone: "", imageUrl: "", minOrder: "", deliveryTime: "", ownerId: "", isActive: "true" });
    const [restErrors, setRestErrors] = useState<Errs<RestForm>>({});
    const [restTouched, setRestTouched] = useState<Partial<Record<keyof RestForm, boolean>>>({});
    const [savingRest, setSavingRest] = useState(false);
    const [restServerError, setRestServerError] = useState("");
    const [restSuccess, setRestSuccess] = useState(false);

    // Menu state
    const [showAddItem, setShowAddItem] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [savingItem, setSavingItem] = useState(false);
    const [menuServerError, setMenuServerError] = useState("");

    const load = useCallback(() => {
        setLoading(true);
        fetch(`/api/admin/restaurants/${id}`)
            .then(r => r.json())
            .then((d: Restaurant) => {
                setData(d);
                setEditForm({
                    name: d.name ?? "", cuisine: d.cuisine ?? "", description: d.description ?? "",
                    address: d.address ?? "", phone: d.phone ?? "", imageUrl: d.imageUrl ?? "",
                    minOrder: String(d.minOrder ?? 500), deliveryTime: d.deliveryTime ?? "",
                    ownerId: d.ownerId ?? "", isActive: String(d.isActive ?? true),
                });
                setRestErrors({});
                setRestTouched({});
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    useEffect(() => { load(); }, [load]);

    // ── Restaurant edit helpers ──

    function setRestField(k: keyof RestForm) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const val = e.target.value;
            setEditForm(f => ({ ...f, [k]: val }));
            if (restTouched[k]) {
                const next = validateRest({ ...editForm, [k]: val });
                setRestErrors(prev => ({ ...prev, [k]: next[k] }));
            }
        };
    }

    function blurRestField(k: keyof RestForm) {
        return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const trimmed = e.target.value.trim();
            setEditForm(f => ({ ...f, [k]: trimmed }));
            setRestTouched(t => ({ ...t, [k]: true }));
            const next = validateRest({ ...editForm, [k]: trimmed });
            setRestErrors(prev => ({ ...prev, [k]: next[k] }));
        };
    }

    async function saveRestaurant() {
        setRestTouched(Object.fromEntries(Object.keys(editForm).map(k => [k, true])) as typeof restTouched);
        const errs = validateRest(editForm);
        setRestErrors(errs);
        if (Object.values(errs).some(Boolean)) return;

        setSavingRest(true); setRestServerError(""); setRestSuccess(false);
        const res = await fetch(`/api/admin/restaurants/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm),
        });
        setSavingRest(false);
        if (!res.ok) { setRestServerError((await res.json()).error ?? "Failed"); return; }
        setRestSuccess(true);
        load();
        setTimeout(() => setRestSuccess(false), 3000);
    }

    // ── Menu item helpers ──

    async function addMenuItem(form: ItemForm) {
        setSavingItem(true); setMenuServerError("");
        const res = await fetch("/api/admin/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, restaurantId: id }),
        });
        setSavingItem(false);
        if (!res.ok) { setMenuServerError((await res.json()).error ?? "Failed"); return; }
        setShowAddItem(false);
        load();
    }

    async function updateMenuItem(form: ItemForm) {
        if (!editingItem) return;
        setSavingItem(true); setMenuServerError("");
        const res = await fetch(`/api/admin/menu/${editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setSavingItem(false);
        if (!res.ok) { setMenuServerError((await res.json()).error ?? "Failed"); return; }
        setEditingItem(null);
        load();
    }

    async function deleteMenuItem(itemId: string, name: string) {
        if (!confirm(`Delete "${name}"?\n\nThis cannot be undone.`)) return;
        await fetch(`/api/admin/menu/${itemId}`, { method: "DELETE" });
        load();
    }

    // Group by category
    const grouped = (data?.menuItems ?? []).reduce<Record<string, MenuItem[]>>((acc, item) => {
        const cat = item.category ?? "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const restHasErrors = Object.values(restErrors).some(Boolean);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-5">
                <div className="h-8 w-40 bg-[#1a1208]/[0.06] rounded-xl animate-pulse" />
                <div className="h-72 bg-white border border-[#1a1208]/[0.07] rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <p className="text-[13px] text-[#1a1208]/40">Restaurant not found.</p>
                <Link href="/admin/restaurants" className="text-[#c8783a] text-[13px] font-semibold mt-2 inline-block hover:underline">Back to list</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-7">

            {/* Breadcrumb */}
            <Link href="/admin/restaurants" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1a1208]/35 hover:text-[#c8783a] transition-colors duration-200">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
                Restaurants
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-tight">{data.name}</h1>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {data.cuisine && <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#1a1208]/35">{data.cuisine}</span>}
                        <span className={`text-[10px] uppercase tracking-[0.15em] font-bold rounded-full px-2.5 py-0.5 ${data.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                            {data.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[11px] text-[#1a1208]/30">{data.menuItems.length} menu items</span>
                    </div>
                </div>
                {data.imageUrl && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <Image src={data.imageUrl} alt="" width={56} height={56} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#1a1208]/[0.05] p-1 rounded-xl w-fit">
                {(["details", "menu"] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] rounded-lg transition-all duration-200 ${tab === t ? "bg-white text-[#1a1208] shadow-sm" : "text-[#1a1208]/40 hover:text-[#1a1208]/60"}`}
                    >
                        {t === "details" ? "Details" : `Menu (${data.menuItems.length})`}
                    </button>
                ))}
            </div>

            {/* ── Details tab ── */}
            {tab === "details" && (
                <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="sm:col-span-2">
                            <Field label="Restaurant Name" required error={restErrors.name}>
                                <input className={iCls(restErrors.name)} value={editForm.name} onChange={setRestField("name")} onBlur={blurRestField("name")} maxLength={101} />
                            </Field>
                        </div>

                        <Field label="Cuisine Type" error={restErrors.cuisine}>
                            <input className={iCls(restErrors.cuisine)} value={editForm.cuisine} onChange={setRestField("cuisine")} onBlur={blurRestField("cuisine")} placeholder="e.g. Filipino, Italian" maxLength={61} />
                        </Field>

                        <Field label="Delivery Time" error={restErrors.deliveryTime}>
                            <input className={iCls(restErrors.deliveryTime)} value={editForm.deliveryTime} onChange={setRestField("deliveryTime")} onBlur={blurRestField("deliveryTime")} placeholder="e.g. 25–35 min" maxLength={31} />
                        </Field>

                        <Field label="Min. Order (₱)" error={restErrors.minOrder}>
                            <input className={iCls(restErrors.minOrder)} type="number" value={editForm.minOrder} onChange={setRestField("minOrder")} onBlur={blurRestField("minOrder")} min="0" step="1" />
                        </Field>

                        <Field label="Phone" error={restErrors.phone} hint="+63 followed by 10 digits">
                            <input className={iCls(restErrors.phone)} value={editForm.phone} onChange={e => { const v = e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, ""); setRestField("phone")({ ...e, target: { ...e.target, value: v } }); }} onBlur={blurRestField("phone")} type="tel" maxLength={16} placeholder="+639312345678" />
                        </Field>

                        <Field label="Status">
                            <select className={iCls()} value={editForm.isActive} onChange={setRestField("isActive")}>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </Field>

                        <Field label="Owner User ID" error={restErrors.ownerId} hint="Link an owner account by their UUID.">
                            <input className={iCls(restErrors.ownerId, "font-mono text-[12px]")} value={editForm.ownerId} onChange={setRestField("ownerId")} onBlur={blurRestField("ownerId")} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" spellCheck={false} />
                        </Field>

                        <div className="sm:col-span-2">
                            <Field label="Address" error={restErrors.address}>
                                <input className={iCls(restErrors.address)} value={editForm.address} onChange={setRestField("address")} onBlur={blurRestField("address")} maxLength={201} />
                            </Field>
                        </div>

                        <div className="sm:col-span-2">
                            <Field label="Image URL" error={restErrors.imageUrl}>
                                <input className={iCls(restErrors.imageUrl)} value={editForm.imageUrl} onChange={setRestField("imageUrl")} onBlur={blurRestField("imageUrl")} type="url" placeholder="https://..." />
                            </Field>
                        </div>

                        <div className="sm:col-span-2">
                            <Field label="Description" error={restErrors.description} charCount={editForm.description.length} maxChars={500}>
                                <textarea className={iCls(restErrors.description, "resize-none h-20")} value={editForm.description} onChange={setRestField("description")} onBlur={blurRestField("description")} maxLength={501} />
                            </Field>
                        </div>
                    </div>

                    {restServerError && (
                        <div className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {restServerError}
                        </div>
                    )}
                    {restSuccess && (
                        <div className="flex items-center gap-2 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-4">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Restaurant updated successfully.
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1a1208]/[0.06]">
                        {restHasErrors && (
                            <p className="text-[11px] text-red-500 font-medium">Fix the errors above before saving.</p>
                        )}
                        <button
                            onClick={saveRestaurant}
                            disabled={savingRest}
                            className="flex items-center gap-2 bg-[#1a1208] text-white rounded-xl px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#2d2014] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 ml-auto"
                        >
                            {savingRest ? (
                                <><svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving…</>
                            ) : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Menu tab ── */}
            {tab === "menu" && (
                <div className="space-y-5">

                    {showAddItem && (
                        <div className="bg-white border border-[#1a1208]/[0.08] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                            <MenuItemForm
                                title="New Menu Item"
                                initial={EMPTY_ITEM}
                                onSave={addMenuItem}
                                onCancel={() => { setShowAddItem(false); setMenuServerError(""); }}
                                saving={savingItem}
                                serverError={menuServerError}
                            />
                        </div>
                    )}

                    {!showAddItem && (
                        <button
                            onClick={() => { setShowAddItem(true); setMenuServerError(""); }}
                            className="flex items-center gap-2.5 border border-dashed border-[#c8783a]/30 text-[#c8783a] rounded-xl px-5 py-3 text-[12px] font-semibold hover:bg-[#c8783a]/[0.04] hover:border-[#c8783a]/50 transition-all duration-200 w-full justify-center"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Menu Item
                        </button>
                    )}

                    {Object.keys(grouped).length === 0 ? (
                        <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl p-14 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#F4F0EB] flex items-center justify-center mx-auto mb-4">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeOpacity="0.2" strokeWidth="1.5"><path d="M3 2h18" /><path d="M3 8h18" /><path d="M3 14h18" /><path d="M3 20h18" /></svg>
                            </div>
                            <p className="text-[13px] text-[#1a1208]/35 font-medium">No menu items yet</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden">
                                <div className="px-5 py-3 border-b border-[#1a1208]/[0.05] bg-[#F4F0EB]/60">
                                    <p className="text-[9.5px] uppercase tracking-[0.22em] font-bold text-[#1a1208]/35">{category}</p>
                                </div>
                                <div className="divide-y divide-[#1a1208]/[0.04]">
                                    {items.map((item) => (
                                        <div key={item.id}>
                                            {editingItem?.id === item.id ? (
                                                <div className="p-5">
                                                    <MenuItemForm
                                                        title="Edit Item"
                                                        initial={{
                                                            name: item.name,
                                                            description: item.description ?? "",
                                                            price: String(item.price),
                                                            imageUrl: item.imageUrl ?? "",
                                                            category: item.category ?? "",
                                                            isAvailable: String(item.isAvailable ?? true),
                                                        }}
                                                        onSave={updateMenuItem}
                                                        onCancel={() => { setEditingItem(null); setMenuServerError(""); }}
                                                        saving={savingItem}
                                                        serverError={menuServerError}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F4F0EB]/40 transition-colors group">
                                                    {item.imageUrl ? (
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                                            <Image src={item.imageUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-[#F4F0EB] flex items-center justify-center text-[#1a1208]/15 shrink-0">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /></svg>
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-[13px] font-semibold text-[#1a1208] truncate">{item.name}</p>
                                                            {!item.isAvailable && (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 border border-red-200 rounded-full px-1.5 py-0.5 shrink-0">Unavailable</span>
                                                            )}
                                                        </div>
                                                        {item.description && <p className="text-[11px] text-[#1a1208]/35 truncate mt-0.5">{item.description}</p>}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-[#1a1208] tabular-nums shrink-0">₱{item.price.toLocaleString()}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                        <button onClick={() => setEditingItem(item)} className="w-7 h-7 flex items-center justify-center text-[#1a1208]/35 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.06] rounded-lg transition-all">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => deleteMenuItem(item.id, item.name)} className="w-7 h-7 flex items-center justify-center text-[#1a1208]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                                <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
