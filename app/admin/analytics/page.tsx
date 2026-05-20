"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────────

type DailyPoint = { date: string; orderCount: number; revenue: number };
type StatusPoint = { status: string; count: number };
type TopRestaurant = { id: string; name: string; imageUrl: string | null; orderCount: number; revenue: number };
type Summary = { totalRevenue: number; monthRevenue: number; activeDrivers: number; deliveredOrders: number };

type Analytics = {
    daily: DailyPoint[];
    statusBreakdown: StatusPoint[];
    topRestaurants: TopRestaurant[];
    summary: Summary;
};

// ── Status colours ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    pending:    "#f59e0b",
    confirmed:  "#3b82f6",
    preparing:  "#f97316",
    ready:      "#8b5cf6",
    delivering: "#0ea5e9",
    on_the_way: "#0ea5e9",
    delivered:  "#10b981",
    cancelled:  "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
    pending:    "Pending",
    confirmed:  "Confirmed",
    preparing:  "Preparing",
    ready:      "Ready",
    delivering: "Delivering",
    on_the_way: "On the Way",
    delivered:  "Delivered",
    cancelled:  "Cancelled",
};

// ── Mini bar chart ─────────────────────────────────────────────────────────────

function BarChart({ data, valueKey, color, formatValue }: {
    data: DailyPoint[];
    valueKey: "orderCount" | "revenue";
    color: string;
    formatValue: (v: number) => string;
}) {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
        <div className="flex items-end gap-1.5 h-24 w-full">
            {data.map((d, i) => {
                const pct = (d[valueKey] / max) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[#1a1208] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {formatValue(d[valueKey])}
                        </div>
                        <div
                            className="w-full rounded-t-md transition-all duration-500"
                            style={{ height: `${Math.max(pct, 4)}%`, background: color }}
                        />
                        <span className="text-[8px] text-[#1a1208]/30 font-medium leading-none truncate w-full text-center">
                            {d.date.split(" ")[1]}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Donut chart ────────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: StatusPoint[] }) {
    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) return (
        <div className="flex items-center justify-center h-[120px] text-[12px] text-[#1a1208]/30">No data</div>
    );

    let cumulative = 0;
    const slices = data.map(d => {
        const pct = d.count / total;
        const start = cumulative;
        cumulative += pct;
        return { ...d, pct, start };
    });

    // Build SVG arcs
    const R = 40;
    const cx = 60;
    const cy = 60;
    function polarToCartesian(angle: number, r: number) {
        const rad = (angle - 90) * (Math.PI / 180);
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }
    function arcPath(startPct: number, endPct: number) {
        const startAngle = startPct * 360;
        const endAngle = endPct * 360;
        const s = polarToCartesian(startAngle, R);
        const e = polarToCartesian(endAngle, R);
        const large = (endAngle - startAngle) > 180 ? 1 : 0;
        return `M ${cx} ${cy} L ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`;
    }

    return (
        <div className="flex items-center gap-4">
            <svg width="120" height="120" viewBox="0 0 120 120">
                {slices.map((s, i) => (
                    <path
                        key={i}
                        d={arcPath(s.start, s.start + s.pct)}
                        fill={STATUS_COLORS[s.status] ?? "#ccc"}
                        className="hover:opacity-80 transition-opacity cursor-default"
                    />
                ))}
                <circle cx={cx} cy={cy} r="24" fill="#FDFBF7" />
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1a1208">{total}</text>
                <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="#1a1208" opacity="0.4">ORDERS</text>
            </svg>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s.status] ?? "#ccc" }} />
                        <span className="text-[11px] text-[#1a1208]/60 truncate flex-1">{STATUS_LABELS[s.status] ?? s.status}</span>
                        <span className="text-[11px] font-bold text-[#1a1208] tabular-nums">{s.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Summary card ───────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, icon, loading }: {
    label: string; value: string; sub?: string;
    icon: React.ReactNode; loading: boolean;
}) {
    return (
        <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0EB] flex items-center justify-center text-[#1a1208]/40">
                {icon}
            </div>
            {loading
                ? <div className="h-8 w-24 bg-[#1a1208]/[0.06] rounded-xl animate-pulse" />
                : <p className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-none tabular-nums">{value}</p>
            }
            <div>
                <p className="text-[11px] font-semibold text-[#1a1208]/35 uppercase tracking-[0.12em]">{label}</p>
                {sub && <p className="text-[10px] text-[#1a1208]/25 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function ChartSkeleton({ height = 120 }: { height?: number }) {
    return <div className="w-full rounded-xl bg-[#1a1208]/[0.05] animate-pulse" style={{ height }} />;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const [data, setData] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then(r => r.ok ? r.json() : null)
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const fmt = (n: number) => `₱${n.toLocaleString()}`;

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div>
                <p className="text-[9px] uppercase tracking-[0.28em] font-bold text-[#c8783a] mb-2">Admin Console</p>
                <h1 className="font-playfair text-[2.4rem] font-bold text-[#1a1208] leading-[1.05]">Analytics</h1>
                <p className="text-[13px] text-[#1a1208]/40 mt-1.5 font-light">Platform performance at a glance</p>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard
                    loading={loading}
                    label="Total Revenue"
                    value={loading ? "—" : fmt(data?.summary.totalRevenue ?? 0)}
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M8 12h4"/></svg>}
                />
                <SummaryCard
                    loading={loading}
                    label="This Month"
                    value={loading ? "—" : fmt(data?.summary.monthRevenue ?? 0)}
                    sub="Last 30 days"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
                />
                <SummaryCard
                    loading={loading}
                    label="Delivered Orders"
                    value={loading ? "—" : (data?.summary.deliveredOrders ?? 0).toLocaleString()}
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>}
                />
                <SummaryCard
                    loading={loading}
                    label="Active Drivers"
                    value={loading ? "—" : (data?.summary.activeDrivers ?? 0).toString()}
                    sub="Online & available"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>}
                />
            </div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Orders per day */}
                <div className="bg-white border border-[#1a1208]/[0.06] rounded-2xl p-6">
                    <p className="text-[9px] uppercase tracking-[0.24em] font-bold text-[#1a1208]/30 mb-1">Last 7 Days</p>
                    <p className="text-[15px] font-bold text-[#1a1208] mb-4">Daily Orders</p>
                    {loading
                        ? <ChartSkeleton height={96} />
                        : <BarChart data={data?.daily ?? []} valueKey="orderCount" color="#c8783a" formatValue={v => `${v} orders`} />
                    }
                </div>

                {/* Revenue per day */}
                <div className="bg-white border border-[#1a1208]/[0.06] rounded-2xl p-6">
                    <p className="text-[9px] uppercase tracking-[0.24em] font-bold text-[#1a1208]/30 mb-1">Last 7 Days</p>
                    <p className="text-[15px] font-bold text-[#1a1208] mb-4">Daily Revenue</p>
                    {loading
                        ? <ChartSkeleton height={96} />
                        : <BarChart data={data?.daily ?? []} valueKey="revenue" color="#1a1208" formatValue={v => fmt(v)} />
                    }
                </div>
            </div>

            {/* ── Bottom row: donut + top restaurants ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

                {/* Status breakdown */}
                <div className="bg-white border border-[#1a1208]/[0.06] rounded-2xl p-6">
                    <p className="text-[9px] uppercase tracking-[0.24em] font-bold text-[#1a1208]/30 mb-1">All Time</p>
                    <p className="text-[15px] font-bold text-[#1a1208] mb-5">Order Status</p>
                    {loading
                        ? <ChartSkeleton height={120} />
                        : <DonutChart data={data?.statusBreakdown ?? []} />
                    }
                </div>

                {/* Top restaurants */}
                <div className="bg-white border border-[#1a1208]/[0.06] rounded-2xl overflow-hidden">
                    <div className="px-6 pt-6 pb-3">
                        <p className="text-[9px] uppercase tracking-[0.24em] font-bold text-[#1a1208]/30 mb-1">By Order Volume</p>
                        <p className="text-[15px] font-bold text-[#1a1208]">Top Restaurants</p>
                    </div>

                    {loading ? (
                        <div className="divide-y divide-[#1a1208]/[0.04] px-6 pb-4 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 pt-3 animate-pulse">
                                    <div className="w-9 h-9 rounded-xl bg-[#1a1208]/[0.06] flex-shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 w-32 bg-[#1a1208]/[0.06] rounded-full" />
                                        <div className="h-2 w-20 bg-[#1a1208]/[0.04] rounded-full" />
                                    </div>
                                    <div className="h-4 w-12 bg-[#1a1208]/[0.06] rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : !data?.topRestaurants.length ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-[12px] text-[#1a1208]/30">No restaurant data yet</p>
                        </div>
                    ) : (
                        <>
                            {/* Table header */}
                            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-2.5 border-y border-[#1a1208]/[0.05] bg-[#F4F0EB]/60">
                                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30">Restaurant</span>
                                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 w-16 text-right">Orders</span>
                                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 w-24 text-right">Revenue</span>
                            </div>
                            <div className="divide-y divide-[#1a1208]/[0.04]">
                                {data.topRestaurants.map((r, i) => (
                                    <div key={r.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-3.5 hover:bg-[#F4F0EB]/50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-[10px] font-bold text-[#1a1208]/20 w-4 flex-shrink-0 tabular-nums">#{i + 1}</span>
                                            <div className="w-8 h-8 rounded-lg bg-[#f5ede0] overflow-hidden flex-shrink-0">
                                                {r.imageUrl
                                                    ? <Image src={r.imageUrl} alt={r.name} width={32} height={32} className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center">
                                                        <svg width="14" height="14" fill="none" stroke="#c8783a" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"/><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9"/>
                                                        </svg>
                                                      </div>
                                                }
                                            </div>
                                            <span className="text-[13px] font-semibold text-[#1a1208] truncate">{r.name}</span>
                                        </div>
                                        <span className="text-[13px] font-bold text-[#1a1208] tabular-nums w-16 text-right">
                                            {r.orderCount.toLocaleString()}
                                        </span>
                                        <span className="text-[13px] font-bold text-[#c8783a] tabular-nums w-24 text-right">
                                            {fmt(r.revenue)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
