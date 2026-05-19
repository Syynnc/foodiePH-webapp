"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
    restaurants: number;
    menuItems: number;
    orders: number;
    users: number;
    recentOrders: { id: string; totalAmount: number; status: string; createdAt: string | null }[];
};

const STATUS_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    preparing:  { label: "Preparing",  dot: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
    on_the_way: { label: "On the way", dot: "#3b82f6", bg: "#eff6ff", text: "#1e40af" },
    delivered:  { label: "Delivered",  dot: "#10b981", bg: "#ecfdf5", text: "#065f46" },
    cancelled:  { label: "Cancelled",  dot: "#ef4444", bg: "#fef2f2", text: "#991b1b" },
};

function timeAgo(d: string | null) {
    if (!d) return "—";
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function StatCard({
    value,
    label,
    href,
    delta,
    icon,
    loading,
}: {
    value: number;
    label: string;
    href: string;
    delta?: string;
    icon: React.ReactNode;
    loading: boolean;
}) {
    return (
        <Link
            href={href}
            className="group bg-white rounded-2xl border border-[#1a1208]/[0.06] p-6 hover:border-[#c8783a]/25 hover:shadow-[0_8px_32px_rgba(200,120,58,0.08)] transition-all duration-300 flex flex-col gap-4"
        >
            <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#F4F0EB] flex items-center justify-center text-[#1a1208]/40 group-hover:bg-[#c8783a]/10 group-hover:text-[#c8783a] transition-all duration-300 shrink-0">
                    {icon}
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1208]/15 group-hover:text-[#c8783a]/50 transition-colors duration-300 mt-0.5">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
            </div>

            <div>
                {loading ? (
                    <div className="h-9 w-20 bg-[#1a1208]/[0.06] rounded-xl animate-pulse mb-1" />
                ) : (
                    <p className="font-playfair text-[2.4rem] font-bold text-[#1a1208] leading-none tabular-nums">
                        {value.toLocaleString()}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[11px] font-semibold text-[#1a1208]/35 uppercase tracking-[0.12em]">{label}</p>
                    {delta && !loading && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5">{delta}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(r => r.json())
            .then(d => { setStats(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8">

            {/* ── Page header ── */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.28em] font-bold text-[#c8783a] mb-2">Admin Console</p>
                    <h1 className="font-playfair text-[2.4rem] font-bold text-[#1a1208] leading-[1.05]">Overview</h1>
                    <p className="text-[13px] text-[#1a1208]/40 mt-1.5 font-light">Platform-wide snapshot</p>
                </div>
                <Link
                    href="/admin/restaurants?new=1"
                    className="hidden sm:flex items-center gap-2 bg-[#1a1208] text-white rounded-xl px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#2d2014] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_16px_rgba(26,18,8,0.18)] shrink-0"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Restaurant
                </Link>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    loading={loading}
                    value={stats?.restaurants ?? 0}
                    label="Restaurants"
                    href="/admin/restaurants"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
                            <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
                            <path d="M10 14h4" />
                        </svg>
                    }
                />
                <StatCard
                    loading={loading}
                    value={stats?.menuItems ?? 0}
                    label="Menu Items"
                    href="/admin/restaurants"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 2h18" /><path d="M3 8h18" /><path d="M3 14h18" /><path d="M3 20h18" />
                        </svg>
                    }
                />
                <StatCard
                    loading={loading}
                    value={stats?.orders ?? 0}
                    label="Total Orders"
                    href="#"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                    }
                />
                <StatCard
                    loading={loading}
                    value={stats?.users ?? 0}
                    label="Users"
                    href="/admin/users"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="7" r="4" />
                            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                        </svg>
                    }
                />
            </div>

            {/* ── Bottom row: Quick actions + Recent orders ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

                {/* Quick actions */}
                <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-[0.24em] font-bold text-[#1a1208]/30">Quick Actions</p>

                    {[
                        {
                            href: "/admin/restaurants?new=1",
                            label: "Add Restaurant",
                            sub: "Create a new listing",
                            icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
                                    <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
                                    <line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" />
                                </svg>
                            ),
                        },
                        {
                            href: "/admin/restaurants",
                            label: "Manage Menus",
                            sub: "Edit items & pricing",
                            icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 2h18" /><path d="M3 8h18" /><path d="M3 14h18" /><path d="M3 20h18" />
                                </svg>
                            ),
                        },
                        {
                            href: "/admin/applications",
                            label: "Applications",
                            sub: "Review driver & restaurant applications",
                            icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            ),
                        },
                        {
                            href: "/admin/users",
                            label: "User Roles",
                            sub: "Assign & manage access",
                            icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                                    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                                </svg>
                            ),
                        },
                    ].map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group flex items-center gap-4 bg-white border border-[#1a1208]/[0.06] rounded-2xl px-4 py-3.5 hover:border-[#c8783a]/25 hover:shadow-[0_4px_20px_rgba(200,120,58,0.07)] transition-all duration-300"
                        >
                            <div className="w-9 h-9 rounded-xl bg-[#F4F0EB] flex items-center justify-center text-[#1a1208]/40 group-hover:bg-[#c8783a]/10 group-hover:text-[#c8783a] transition-all duration-300 shrink-0">
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-[#1a1208] leading-none">{item.label}</p>
                                <p className="text-[11px] text-[#1a1208]/35 mt-0.5">{item.sub}</p>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1208]/15 group-hover:text-[#c8783a]/50 shrink-0 transition-colors duration-300">
                                <path d="M5 12h14m-7-7 7 7-7 7" />
                            </svg>
                        </Link>
                    ))}
                </div>

                {/* Recent orders */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] uppercase tracking-[0.24em] font-bold text-[#1a1208]/30">Recent Orders</p>
                        <span className="text-[10px] font-semibold text-[#1a1208]/30">Last 5</span>
                    </div>

                    <div className="bg-white border border-[#1a1208]/[0.06] rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="divide-y divide-[#1a1208]/[0.04]">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 px-5 py-4">
                                        <div className="h-4 bg-[#1a1208]/[0.05] rounded-full w-24 animate-pulse" style={{ animationDelay: `${i * 70}ms` }} />
                                        <div className="h-5 bg-[#1a1208]/[0.05] rounded-full w-20 animate-pulse ml-auto" style={{ animationDelay: `${i * 70}ms` }} />
                                    </div>
                                ))}
                            </div>
                        ) : !stats?.recentOrders?.length ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#F4F0EB] flex items-center justify-center">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                </div>
                                <p className="text-[12px] text-[#1a1208]/30 font-medium">No orders yet</p>
                            </div>
                        ) : (
                            <>
                                {/* Table header */}
                                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-[#1a1208]/[0.05] bg-[#F4F0EB]/60">
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30">Order ID</span>
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 w-24 text-center">Status</span>
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 w-16 text-right">Total</span>
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 w-16 text-right">When</span>
                                </div>

                                <div className="divide-y divide-[#1a1208]/[0.04]">
                                    {stats.recentOrders.map((order) => {
                                        const s = STATUS_META[order.status] ?? { label: order.status, dot: "#999", bg: "#f9f9f9", text: "#555" };
                                        return (
                                            <div key={order.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-[#F4F0EB]/50 transition-colors duration-150">
                                                <span className="text-[11.5px] font-mono font-semibold text-[#1a1208]/50 truncate">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                <span
                                                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2.5 py-1 w-24 justify-center"
                                                    style={{ background: s.bg, color: s.text }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                                                    {s.label}
                                                </span>
                                                <span className="text-[13px] font-bold text-[#1a1208] tabular-nums w-16 text-right">
                                                    ₱{order.totalAmount.toLocaleString()}
                                                </span>
                                                <span className="text-[11px] text-[#1a1208]/30 w-16 text-right">
                                                    {timeAgo(order.createdAt)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
