"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

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

const inputCls = "w-full border border-[#1a1208]/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#1a1208] bg-white placeholder:text-[#1a1208]/25 outline-none focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/10 transition-all duration-200";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-semibold text-[#1a1208]/40 mb-1.5 block";
const EMPTY_ITEM = { name: "", description: "", price: "", imageUrl: "", category: "", isAvailable: "true" };

function MenuItemForm({ initial, onSave, onCancel, saving, title }: {
    initial: typeof EMPTY_ITEM;
    onSave: (d: typeof EMPTY_ITEM) => void;
    onCancel: () => void;
    saving: boolean;
    title: string;
}) {
    const [form, setForm] = useState(initial);
    const set = (k: keyof typeof EMPTY_ITEM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
            <h3 className="font-playfair text-[1.1rem] font-bold text-[#1a1208]">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                    <label className={labelCls}>Item Name *</label>
                    <input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Tonkotsu Ramen" required />
                </div>
                <div>
                    <label className={labelCls}>Price (₱) *</label>
                    <input className={inputCls} type="number" value={form.price} onChange={set("price")} min="1" required />
                </div>
                <div>
                    <label className={labelCls}>Category</label>
                    <input className={inputCls} value={form.category} onChange={set("category")} placeholder="e.g. Mains, Drinks" />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>Image URL</label>
                    <input className={inputCls} value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea className={`${inputCls} resize-none h-16`} value={form.description} onChange={set("description")} placeholder="Brief description" />
                </div>
                <div>
                    <label className={labelCls}>Availability</label>
                    <select className={inputCls} value={form.isAvailable} onChange={set("isAvailable")}>
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-[12px] font-semibold text-[#1a1208]/50 hover:text-[#1a1208] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#c8783a] text-white rounded-xl px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#b5692e] active:scale-[0.98] transition-all duration-300 disabled:opacity-50">
                    {saving ? "Saving…" : "Save Item"}
                </button>
            </div>
        </form>
    );
}

export default function RestaurantPortal() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"details" | "menu">("details");
    const [notLinked, setNotLinked] = useState(false);

    // Details form
    const [form, setForm] = useState<Record<string, string>>({});
    const [savingRest, setSavingRest] = useState(false);
    const [restError, setRestError] = useState("");
    const [restSuccess, setRestSuccess] = useState(false);

    // Menu
    const [showAddItem, setShowAddItem] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [savingItem, setSavingItem] = useState(false);
    const [menuError, setMenuError] = useState("");

    const loadAll = useCallback(async () => {
        setLoading(true);
        const [rRes, mRes] = await Promise.all([
            fetch("/api/restaurant/profile"),
            fetch("/api/restaurant/menu"),
        ]);
        if (rRes.status === 404) { setNotLinked(true); setLoading(false); return; }
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
        }
        if (mRes.ok) setMenuItems(await mRes.json());
        setLoading(false);
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    async function saveDetails() {
        setSavingRest(true); setRestError(""); setRestSuccess(false);
        const res = await fetch("/api/restaurant/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setSavingRest(false);
        if (!res.ok) { setRestError((await res.json()).error ?? "Failed"); return; }
        setRestSuccess(true);
        loadAll();
        setTimeout(() => setRestSuccess(false), 3000);
    }

    async function addItem(f: typeof EMPTY_ITEM) {
        setSavingItem(true); setMenuError("");
        const res = await fetch("/api/restaurant/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(f),
        });
        setSavingItem(false);
        if (!res.ok) { setMenuError((await res.json()).error ?? "Failed"); return; }
        setShowAddItem(false);
        loadAll();
    }

    async function updateItem(f: typeof EMPTY_ITEM) {
        if (!editingItem) return;
        setSavingItem(true); setMenuError("");
        const res = await fetch(`/api/restaurant/menu/${editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(f),
        });
        setSavingItem(false);
        if (!res.ok) { setMenuError((await res.json()).error ?? "Failed"); return; }
        setEditingItem(null);
        loadAll();
    }

    async function deleteItem(itemId: string, name: string) {
        if (!confirm(`Delete "${name}"?`)) return;
        await fetch(`/api/restaurant/menu/${itemId}`, { method: "DELETE" });
        loadAll();
    }

    const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const grouped = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
        const cat = item.category ?? "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center">
                <div className="space-y-3 w-80">
                    <div className="h-6 bg-[#1a1208]/[0.07] rounded-xl animate-pulse" />
                    <div className="h-40 bg-[#1a1208]/[0.05] rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (notLinked) {
        return (
            <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-[#c8783a]/10 flex items-center justify-center mx-auto mb-5">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 11l19-9-9 19-2-8-8-2z" />
                        </svg>
                    </div>
                    <h2 className="font-playfair text-[1.7rem] font-bold text-[#1a1208] mb-3">No Restaurant Linked</h2>
                    <p className="text-[13px] text-[#1a1208]/45 leading-[1.8] mb-6">
                        Your account doesn&apos;t have a restaurant linked yet. Contact the platform admin to get your restaurant set up.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#c8783a] hover:underline">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
                        Back to home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#FDFBF7]">

            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-[#FDFBF7]/90 backdrop-blur-xl border-b border-[#1a1208]/[0.07] px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="w-8 h-8 rounded-lg bg-[#c8783a] flex items-center justify-center flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 11l19-9-9 19-2-8-8-2z" />
                            </svg>
                        </Link>
                        <div>
                            <p className="font-playfair text-[0.95rem] font-bold text-[#1a1208] leading-none">{restaurant?.name ?? "Restaurant Portal"}</p>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#1a1208]/30 mt-0.5">Owner Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] uppercase tracking-[0.15em] font-bold rounded-full px-2.5 py-1 ${restaurant?.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                            {restaurant?.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

                {/* Page heading */}
                <div>
                    <p className="text-[9px] uppercase tracking-[0.26em] font-semibold text-[#c8783a] mb-2">Restaurant Portal</p>
                    <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-tight">{restaurant?.name}</h1>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {restaurant?.cuisine && <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#1a1208]/35">{restaurant.cuisine}</span>}
                        <span className="text-[11px] text-[#1a1208]/30">{menuItems.length} menu items</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-[#1a1208]/[0.04] p-1 rounded-xl w-fit">
                    {(["details", "menu"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] rounded-lg transition-all duration-200 ${tab === t ? "bg-white text-[#1a1208] shadow-sm" : "text-[#1a1208]/40 hover:text-[#1a1208]/60"}`}
                        >
                            {t === "details" ? "Details" : `Menu (${menuItems.length})`}
                        </button>
                    ))}
                </div>

                {/* Details tab */}
                {tab === "details" && (
                    <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Restaurant Name *</label>
                                <input className={inputCls} value={form.name ?? ""} onChange={setField("name")} required />
                            </div>
                            <div>
                                <label className={labelCls}>Cuisine Type</label>
                                <input className={inputCls} value={form.cuisine ?? ""} onChange={setField("cuisine")} placeholder="e.g. Filipino, Italian" />
                            </div>
                            <div>
                                <label className={labelCls}>Delivery Time</label>
                                <input className={inputCls} value={form.deliveryTime ?? ""} onChange={setField("deliveryTime")} placeholder="e.g. 25–35 min" />
                            </div>
                            <div>
                                <label className={labelCls}>Min. Order (₱)</label>
                                <input className={inputCls} type="number" value={form.minOrder ?? ""} onChange={setField("minOrder")} min="0" />
                            </div>
                            <div>
                                <label className={labelCls}>Phone</label>
                                <input className={inputCls} value={form.phone ?? ""} onChange={setField("phone")} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Address</label>
                                <input className={inputCls} value={form.address ?? ""} onChange={setField("address")} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Image URL</label>
                                <input className={inputCls} value={form.imageUrl ?? ""} onChange={setField("imageUrl")} placeholder="https://..." />
                            </div>
                            {form.imageUrl && (
                                <div className="sm:col-span-2">
                                    <div className="w-full h-40 rounded-xl overflow-hidden">
                                        <Image src={form.imageUrl} alt="" width={800} height={160} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Description</label>
                                <textarea className={`${inputCls} resize-none h-20`} value={form.description ?? ""} onChange={setField("description")} placeholder="Tell customers about your restaurant" />
                            </div>
                        </div>

                        {restError && <p className="text-[12px] text-red-500 mt-4 bg-red-50 rounded-xl px-4 py-2.5">{restError}</p>}
                        {restSuccess && <p className="text-[12px] text-emerald-600 mt-4 bg-emerald-50 rounded-xl px-4 py-2.5">Details saved successfully.</p>}

                        <div className="flex justify-end mt-5">
                            <button
                                onClick={saveDetails}
                                disabled={savingRest}
                                className="flex items-center gap-2 bg-[#c8783a] text-white rounded-xl px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#b5692e] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                            >
                                {savingRest ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Menu tab */}
                {tab === "menu" && (
                    <div className="space-y-5">

                        {showAddItem && (
                            <div className="bg-white border border-[#1a1208]/[0.08] rounded-2xl p-6">
                                {menuError && <p className="text-[12px] text-red-500 mb-4 bg-red-50 rounded-xl px-4 py-2.5">{menuError}</p>}
                                <MenuItemForm title="New Menu Item" initial={EMPTY_ITEM} onSave={addItem} onCancel={() => { setShowAddItem(false); setMenuError(""); }} saving={savingItem} />
                            </div>
                        )}

                        {!showAddItem && (
                            <button
                                onClick={() => { setShowAddItem(true); setMenuError(""); }}
                                className="flex items-center gap-2.5 border border-dashed border-[#c8783a]/30 text-[#c8783a] rounded-xl px-5 py-3 text-[12px] font-semibold hover:bg-[#c8783a]/[0.04] hover:border-[#c8783a]/50 transition-all duration-200 w-full justify-center"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Menu Item
                            </button>
                        )}

                        {Object.keys(grouped).length === 0 ? (
                            <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl p-12 text-center">
                                <svg className="mx-auto mb-3 text-[#1a1208]/12" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" /><path d="M12 8v4l3 3" />
                                </svg>
                                <p className="text-[13px] text-[#1a1208]/35">Your menu is empty — add items above</p>
                            </div>
                        ) : (
                            Object.entries(grouped).map(([category, items]) => (
                                <div key={category} className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-[#1a1208]/[0.05] bg-[#1a1208]/[0.015]">
                                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/40">{category}</p>
                                    </div>
                                    <div className="divide-y divide-[#1a1208]/[0.05]">
                                        {items.map((item) => (
                                            <div key={item.id}>
                                                {editingItem?.id === item.id ? (
                                                    <div className="p-5">
                                                        {menuError && <p className="text-[12px] text-red-500 mb-3 bg-red-50 rounded-xl px-4 py-2">{menuError}</p>}
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
                                                            onSave={updateItem}
                                                            onCancel={() => { setEditingItem(null); setMenuError(""); }}
                                                            saving={savingItem}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#1a1208]/[0.015] transition-colors group">
                                                        {item.imageUrl ? (
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                                <Image src={item.imageUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-[#1a1208]/[0.04] flex items-center justify-center text-[#1a1208]/15 flex-shrink-0">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /></svg>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-[13px] font-semibold text-[#1a1208] truncate">{item.name}</p>
                                                                {!item.isAvailable && (
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 border border-red-200 rounded-full px-1.5 py-0.5">Unavailable</span>
                                                                )}
                                                            </div>
                                                            {item.description && <p className="text-[11px] text-[#1a1208]/35 truncate mt-0.5">{item.description}</p>}
                                                        </div>
                                                        <span className="text-[13px] font-bold text-[#1a1208] tabular-nums flex-shrink-0">₱{item.price.toLocaleString()}</span>
                                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                            <button onClick={() => setEditingItem(item)} className="w-7 h-7 flex items-center justify-center text-[#1a1208]/35 hover:text-[#1a1208] hover:bg-[#1a1208]/[0.06] rounded-lg transition-all">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                </svg>
                                                            </button>
                                                            <button onClick={() => deleteItem(item.id, item.name)} className="w-7 h-7 flex items-center justify-center text-[#1a1208]/25 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
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
            </main>
        </div>
    );
}
