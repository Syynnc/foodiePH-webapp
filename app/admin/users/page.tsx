"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type User = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    company: string | null;
    createdAt: string | null;
};

function CopyUUID({ id }: { id: string }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleCopy() {
        navigator.clipboard.writeText(id).then(() => {
            setCopied(true);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <button
            onClick={handleCopy}
            title="Copy User ID"
            className={`group flex items-center gap-1.5 font-mono text-[10px] rounded-lg px-2.5 py-1.5 border transition-all duration-200 max-w-[168px] ${copied
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-[#1a1208]/10 bg-[#1a1208]/[0.02] text-[#1a1208]/35 hover:border-[#c8783a]/30 hover:text-[#c8783a] hover:bg-[#c8783a]/5"
                }`}
        >
            <span className="truncate">{id.slice(0, 8)}…</span>
            {copied ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            )}
        </button>
    );
}

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-[#c8783a]/10 text-[#c8783a]",
    driver: "bg-blue-50 text-blue-600",
    restaurant: "bg-purple-50 text-purple-600",
    customer: "bg-[#1a1208]/[0.05] text-[#1a1208]/50",
};

const ROLES = ["customer", "driver", "restaurant", "admin"];
const PROTECTED_EMAIL = "sindycasquejo@gmail.com";

function timeAgo(d: string | null) {
    if (!d) return "";
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [updating, setUpdating] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        fetch("/api/admin/users")
            .then(r => r.json())
            .then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    async function updateRole(id: string, role: string) {
        setUpdating(id);
        await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, role }),
        });
        setUpdating(null);
        load();
    }

    const filtered = users.filter(u => {
        const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");
        const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
            fullName.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === "all" || u.role === filterRole;
        return matchSearch && matchRole;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <p className="text-[9px] uppercase tracking-[0.26em] font-semibold text-[#c8783a] mb-2">Admin · Users</p>
                <h1 className="font-playfair text-[2.2rem] font-bold text-[#1a1208] leading-tight">Users</h1>
                <p className="text-[13px] text-[#1a1208]/40 mt-1">{users.length} registered accounts</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a1208]/25 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full pl-9 pr-4 py-2.5 border border-[#1a1208]/10 rounded-xl text-[13px] text-[#1a1208] bg-white placeholder:text-[#1a1208]/25 outline-none focus:border-[#c8783a]/40 transition-all duration-200"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {["all", ...ROLES].map(r => (
                        <button
                            key={r}
                            onClick={() => setFilterRole(r)}
                            className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] rounded-lg border transition-all duration-200 ${filterRole === r
                                ? "bg-[#1a1208] text-white border-[#1a1208]"
                                : "text-[#1a1208]/40 border-[#1a1208]/10 hover:border-[#1a1208]/25 hover:text-[#1a1208]/60"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-[#1a1208]/[0.04] rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                        ))}
                    </div>
                ) : !filtered.length ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto mb-3 text-[#1a1208]/12" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <p className="text-[13px] text-[#1a1208]/35">No users found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#1a1208]/[0.05]">
                        {/* Header row */}
                        <div className="hidden sm:grid grid-cols-[1fr_168px_auto_auto_auto] gap-4 px-5 py-2.5 bg-[#1a1208]/[0.015]">
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30">User</span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30">User ID</span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 text-center w-28">Role</span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 w-20">Joined</span>
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1208]/30 w-32">Change Role</span>
                        </div>
                        {filtered.map((user) => (
                            <div key={user.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_168px_auto_auto_auto] gap-2 sm:gap-4 items-start sm:items-center px-5 py-4 hover:bg-[#1a1208]/[0.015] transition-colors duration-200">
                                {/* User info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-[#1a1208]/[0.06] flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-bold text-[#1a1208]/40">
                                            {([user.firstName, user.lastName].filter(Boolean).join(" ") || user.email).slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-semibold text-[#1a1208] truncate">{[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}</p>
                                        <p className="text-[11px] text-[#1a1208]/35 truncate">{user.email}</p>
                                    </div>
                                </div>

                                {/* UUID copy */}
                                <CopyUUID id={user.id} />

                                {/* Role badge */}
                                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] rounded-full px-2.5 py-1 w-28 text-center ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                                    {user.role}
                                </span>

                                {/* Joined */}
                                <span className="text-[11px] text-[#1a1208]/30 w-20">{timeAgo(user.createdAt)}</span>

                                {/* Change role */}
                                <div className="w-32">
                                    {user.email === PROTECTED_EMAIL ? (
                                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1a1208]/30 italic px-2.5 py-1.5">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                            Protected
                                        </span>
                                    ) : updating === user.id ? (
                                        <div className="h-8 w-full bg-[#1a1208]/[0.05] rounded-lg animate-pulse" />
                                    ) : (
                                        <select
                                            value={user.role}
                                            onChange={e => updateRole(user.id, e.target.value)}
                                            className="w-full border border-[#1a1208]/10 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-[#1a1208] bg-white outline-none focus:border-[#c8783a]/40 transition-all duration-200 cursor-pointer"
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
