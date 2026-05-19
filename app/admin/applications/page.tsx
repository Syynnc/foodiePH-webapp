"use client";

import { useEffect, useState, useCallback } from "react";

type DriverApp = {
    id: string;
    userId: string;
    status: string;
    vehicleType: string | null;
    plateNumber: string | null;
    licenseNumber: string | null;
    govIdUrl: string | null;
    adminNotes: string | null;
    createdAt: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
};

type RestaurantApp = {
    id: string;
    userId: string;
    status: string;
    restaurantName: string;
    cuisine: string | null;
    address: string | null;
    phone: string | null;
    description: string | null;
    permitUrl: string | null;
    adminNotes: string | null;
    createdAt: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
};

type Tab = "driver" | "restaurant";
type StatusFilter = "pending" | "approved" | "denied" | "all";

const STATUS_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    pending: { label: "Pending", dot: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
    approved: { label: "Approved", dot: "#10b981", bg: "#ecfdf5", text: "#065f46" },
    denied: { label: "Denied", dot: "#ef4444", bg: "#fef2f2", text: "#991b1b" },
};

function timeAgo(d: string | null) {
    if (!d) return "—";
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function ReviewModal({
    appId,
    appType,
    name,
    onClose,
    onDone,
}: {
    appId: string;
    appType: Tab;
    name: string;
    onClose: () => void;
    onDone: () => void;
}) {
    const [action, setAction] = useState<"approve" | "deny">("approve");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    async function submit() {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`/api/admin/applications/${appId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: appType, action, notes: notes.trim() || null }),
            });
            if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
            onDone();
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Action failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1208]/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-5 border-b border-[#1a1208]/[0.07]">
                    <h2 className="text-[14px] font-bold text-[#1a1208]">Review Application</h2>
                    <p className="text-[12px] text-[#1a1208]/45 mt-0.5 truncate">{name}</p>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Action toggle */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F4F0EB] p-1 rounded-xl">
                        {(["approve", "deny"] as const).map((a) => (
                            <button
                                key={a}
                                onClick={() => setAction(a)}
                                className={`py-2 rounded-lg text-[12px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${action === a
                                    ? a === "approve"
                                        ? "bg-emerald-500 text-white shadow-sm"
                                        : "bg-red-500 text-white shadow-sm"
                                    : "text-[#1a1208]/40 hover:text-[#1a1208]/70"
                                    }`}
                            >
                                {a === "approve" ? "Approve" : "Deny"}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1a1208]/40">
                            {action === "deny" ? "Reason for denial" : "Notes (optional)"}
                        </label>
                        <textarea
                            rows={3}
                            placeholder={action === "deny" ? "Explain why the application is being denied…" : "Any notes for the applicant…"}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[#1a1208]/[0.09] bg-white text-[13px] text-[#1a1208] placeholder-[#1a1208]/30 focus:outline-none focus:border-[#c8783a]/50 focus:ring-2 focus:ring-[#c8783a]/15 transition-all resize-none"
                        />
                    </div>

                    {err && <p className="text-[12px] text-red-400">{err}</p>}
                </div>

                <div className="px-6 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-[#1a1208]/[0.09] text-[12px] font-semibold text-[#1a1208]/50 hover:text-[#1a1208] hover:border-[#1a1208]/20 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.08em] text-white disabled:opacity-50 transition-all duration-200 ${action === "approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
                    >
                        {loading ? "Saving…" : action === "approve" ? "Approve" : "Deny"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value, capitalize, muted }: { label: string; value: string; capitalize?: boolean; muted?: boolean }) {
    return (
        <div>
            <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/30 mb-0.5">{label}</p>
            <p className={`text-[12.5px] font-medium ${muted ? "text-[#1a1208]/30" : "text-[#1a1208]/70"} ${capitalize ? "capitalize" : ""}`}>{value}</p>
        </div>
    );
}

export default function AdminApplicationsPage() {
    const [tab, setTab] = useState<Tab>("driver");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
    const [driverApps, setDriverApps] = useState<DriverApp[]>([]);
    const [restaurantApps, setRestaurantApps] = useState<RestaurantApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string } | null>(null);

    const fetchApps = useCallback(async (type: Tab, status: StatusFilter) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/applications?type=${type}&status=${status}`);
            const data = await res.json();
            if (type === "driver") setDriverApps(data.applications ?? []);
            else setRestaurantApps(data.applications ?? []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApps(tab, statusFilter);
    }, [tab, statusFilter, fetchApps]);

    const apps = tab === "driver" ? driverApps : restaurantApps;

    return (
        <>
            {reviewTarget && (
                <ReviewModal
                    appId={reviewTarget.id}
                    appType={tab}
                    name={reviewTarget.name}
                    onClose={() => setReviewTarget(null)}
                    onDone={() => {
                        setReviewTarget(null);
                        fetchApps(tab, statusFilter);
                    }}
                />
            )}

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <p className="text-[9px] uppercase tracking-[0.28em] font-bold text-[#c8783a] mb-2">Admin Console</p>
                    <h1 className="font-playfair text-[2.4rem] font-bold text-[#1a1208] leading-[1.05]">Applications</h1>
                    <p className="text-[13px] text-[#1a1208]/40 mt-1.5 font-light">Review driver and restaurant owner applications</p>
                </div>

                {/* Type tabs */}
                <div className="flex gap-1 bg-[#F4F0EB] p-1 rounded-xl w-fit">
                    {(["driver", "restaurant"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-lg text-[12px] font-bold uppercase tracking-[0.08em] transition-all duration-200 ${tab === t ? "bg-white text-[#1a1208] shadow-sm" : "text-[#1a1208]/40 hover:text-[#1a1208]/70"}`}
                        >
                            {t === "driver" ? "Riders" : "Restaurants"}
                        </button>
                    ))}
                </div>

                {/* Status filter */}
                <div className="flex gap-2 flex-wrap">
                    {(["pending", "approved", "denied", "all"] as StatusFilter[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 ${statusFilter === s
                                ? "bg-[#1a1208] text-white border-[#1a1208]"
                                : "text-[#1a1208]/40 border-[#1a1208]/10 hover:border-[#1a1208]/20 hover:text-[#1a1208]/60"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-[#1a1208]/[0.06] overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-[#1a1208]/[0.04]">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-5 py-4">
                                    <div className="h-9 w-9 bg-[#1a1208]/[0.05] rounded-full animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-[#1a1208]/[0.05] rounded-full w-40 animate-pulse" />
                                        <div className="h-2.5 bg-[#1a1208]/[0.04] rounded-full w-56 animate-pulse" />
                                    </div>
                                    <div className="h-6 w-20 bg-[#1a1208]/[0.05] rounded-full animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : apps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#F4F0EB] flex items-center justify-center">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                                </svg>
                            </div>
                            <p className="text-[12px] text-[#1a1208]/30 font-medium">No {statusFilter === "all" ? "" : statusFilter} applications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#1a1208]/[0.05]">
                            {apps.map((app) => {
                                const sm = STATUS_META[app.status] ?? STATUS_META.pending;
                                const isDriver = tab === "driver";
                                const dApp = app as DriverApp;
                                const rApp = app as RestaurantApp;
                                const applicantName = (`${app.firstName ?? ""} ${app.lastName ?? ""}`).trim() || (app.email ?? "—");
                                const docUrl = isDriver ? dApp.govIdUrl : rApp.permitUrl;
                                const isPdf = docUrl?.toLowerCase().endsWith(".pdf");

                                return (
                                    <div key={app.id} className="p-5 hover:bg-[#FDFBF7] transition-colors duration-150">
                                        <div className="flex flex-col md:flex-row gap-5">

                                            {/* Document preview */}
                                            <div className="shrink-0 w-full md:w-40">
                                                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 mb-2">
                                                    {isDriver ? "Gov. ID" : "Business Permit"}
                                                </p>
                                                {docUrl ? (
                                                    <a href={docUrl} target="_blank" rel="noopener noreferrer" className="block group relative">
                                                        {isPdf ? (
                                                            <div className="w-full h-28 rounded-xl border border-[#1a1208]/[0.08] bg-[#F4F0EB] flex flex-col items-center justify-center gap-2 group-hover:border-[#c8783a]/30 transition-colors">
                                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                                    <polyline points="14 2 14 8 20 8" />
                                                                </svg>
                                                                <span className="text-[10px] font-semibold text-[#c8783a]">View PDF</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-28 rounded-xl border border-[#1a1208]/[0.08] overflow-hidden bg-[#F4F0EB] group-hover:border-[#c8783a]/30 transition-colors relative">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={docUrl} alt="Document" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-[#1a1208]/0 group-hover:bg-[#1a1208]/10 transition-colors flex items-center justify-center">
                                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white bg-[#1a1208]/60 px-2 py-1 rounded-lg">Open</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </a>
                                                ) : (
                                                    <div className="w-full h-28 rounded-xl border border-dashed border-[#1a1208]/[0.1] bg-[#F4F0EB]/50 flex items-center justify-center">
                                                        <span className="text-[10px] text-[#1a1208]/25 font-medium">No file</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Main info */}
                                            <div className="flex-1 min-w-0 space-y-3">
                                                {/* Top row: name + status + time */}
                                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                                    <div>
                                                        <div className="flex items-center gap-2.5 flex-wrap">
                                                            <p className="text-[15px] font-bold text-[#1a1208] leading-tight">
                                                                {isDriver ? applicantName : rApp.restaurantName}
                                                            </p>
                                                            <span
                                                                className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2.5 py-1"
                                                                style={{ background: sm.bg, color: sm.text }}
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sm.dot }} />
                                                                {sm.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-[12px] text-[#1a1208]/40 mt-0.5">{app.email ?? "—"}</p>
                                                    </div>
                                                    <span className="text-[11px] text-[#1a1208]/30 shrink-0 mt-0.5">{timeAgo(app.createdAt)}</span>
                                                </div>

                                                {/* Detail grid */}
                                                {isDriver ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                                                        <Detail label="Vehicle" value={dApp.vehicleType ?? "—"} capitalize />
                                                        <Detail label="Plate No." value={dApp.plateNumber ?? "—"} />
                                                        <Detail label="License No." value={dApp.licenseNumber || "Not provided"} muted={!dApp.licenseNumber} />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                                                        <Detail label="Applicant" value={applicantName} />
                                                        <Detail label="Cuisine" value={rApp.cuisine || "Not specified"} muted={!rApp.cuisine} />
                                                        <Detail label="Phone" value={rApp.phone || "Not provided"} muted={!rApp.phone} />
                                                        {rApp.address && (
                                                            <div className="col-span-2 sm:col-span-3">
                                                                <Detail label="Address" value={rApp.address} />
                                                            </div>
                                                        )}
                                                        {rApp.description && (
                                                            <div className="col-span-2 sm:col-span-3">
                                                                <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#1a1208]/30 mb-0.5">About</p>
                                                                <p className="text-[12.5px] text-[#1a1208]/60 leading-relaxed line-clamp-2">{rApp.description}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Admin notes (if reviewed) */}
                                                {app.adminNotes && app.status !== "pending" && (
                                                    <div className="flex items-start gap-2 bg-[#F4F0EB] rounded-xl px-3.5 py-2.5">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1208]/35 mt-0.5 shrink-0">
                                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                                        </svg>
                                                        <p className="text-[11.5px] text-[#1a1208]/50 leading-relaxed">{app.adminNotes}</p>
                                                    </div>
                                                )}

                                                {/* Action */}
                                                {app.status === "pending" && (
                                                    <div className="pt-1">
                                                        <button
                                                            onClick={() => setReviewTarget({ id: app.id, name: isDriver ? applicantName : rApp.restaurantName })}
                                                            className="inline-flex items-center gap-2 bg-[#1a1208] hover:bg-[#c8783a] text-white text-[12px] font-bold uppercase tracking-[0.08em] px-4 py-2 rounded-xl transition-all duration-200 active:scale-[0.98]"
                                                        >
                                                            Review Application
                                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M5 12h14m-7-7 7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
