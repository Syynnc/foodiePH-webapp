"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
    {
        href: "/admin",
        label: "Overview",
        exact: true,
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: "/admin/restaurants",
        label: "Restaurants",
        exact: false,
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
                <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
                <path d="M10 14h4" />
            </svg>
        ),
    },
    {
        href: "/admin/users",
        label: "Users",
        exact: false,
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
        ),
    },
    {
        href: "/admin/applications",
        label: "Applications",
        exact: false,
        icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
];

export default function AdminShell({
    children,
    email,
    name,
}: {
    children: ReactNode;
    email: string;
    name: string | null;
}) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const initials = name
        ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : email.slice(0, 2).toUpperCase();

    const displayName = name ?? "Admin";

    return (
        /* Root: fixed viewport height — this is what makes the sidebar full height */
        <div className="h-[100dvh] bg-[#F4F0EB] flex overflow-hidden">

            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-[#1a1208]/40 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                style={{ width: collapsed ? 72 : 240 }}
                className={`
                    relative z-40 h-full bg-[#1a1208] flex flex-col shrink-0
                    transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                    fixed md:static
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* Brand */}
                <div className={`flex items-center border-b border-white/[0.07] h-16 shrink-0 ${collapsed ? "justify-center px-0" : "px-5 gap-3"}`}>
                    <Link href="/" className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#c8783a] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(200,120,58,0.35)]">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
                                <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
                                <path d="M10 14h4" />
                            </svg>
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <p className="font-playfair text-[1rem] font-bold text-white leading-none whitespace-nowrap">Foodie</p>
                                <p className="text-[8px] uppercase tracking-[0.22em] text-white/30 mt-0.5 whitespace-nowrap">Admin Console</p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-none">
                    {!collapsed && (
                        <p className="px-3 text-[8.5px] uppercase tracking-[0.24em] font-bold text-white/20 mb-3 whitespace-nowrap">
                            Menu
                        </p>
                    )}
                    {NAV.map((item) => {
                        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                title={collapsed ? item.label : undefined}
                                className={`
                                    flex items-center gap-3 rounded-xl text-[13px] font-medium
                                    transition-all duration-200 group relative
                                    ${collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5 w-full"}
                                    ${active
                                        ? "bg-[#c8783a] text-white shadow-[0_4px_16px_rgba(200,120,58,0.30)]"
                                        : "text-white/45 hover:text-white hover:bg-white/[0.07]"
                                    }
                                `}
                            >
                                <span className={`shrink-0 ${active ? "text-white" : "text-white/40 group-hover:text-white/70"} transition-colors`}>
                                    {item.icon}
                                </span>
                                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}

                                {/* Tooltip when collapsed */}
                                {collapsed && (
                                    <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#2d2014] text-white text-[11px] font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg z-50">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse toggle — desktop */}
                <div className="hidden md:flex px-2.5 pb-3 shrink-0">
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200 ${collapsed ? "justify-center px-0" : ""}`}
                    >
                        <svg
                            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        {!collapsed && <span className="text-[11px] font-medium whitespace-nowrap">Collapse</span>}
                    </button>
                </div>

                {/* User */}
                <div className={`border-t border-white/[0.07] shrink-0 ${collapsed ? "py-4 flex justify-center" : "px-4 py-4"}`}>
                    {collapsed ? (
                        <div className="w-9 h-9 rounded-full bg-[#c8783a]/25 border border-[#c8783a]/30 flex items-center justify-center" title={`${displayName} · ${email}`}>
                            <span className="text-[11px] font-bold text-[#c8783a]">{initials}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#c8783a]/20 border border-[#c8783a]/25 flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-bold text-[#c8783a]">{initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] font-semibold text-white/80 truncate leading-none mb-0.5">{displayName}</p>
                                <p className="text-[10px] text-white/30 truncate">{email}</p>
                            </div>
                            <Link
                                href="/auth/signout"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200 shrink-0"
                                title="Sign out"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                {/* Top bar */}
                <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-[#F4F0EB] border-b border-[#1a1208]/[0.08]">
                    {/* Mobile burger */}
                    <button
                        onClick={() => setMobileOpen(o => !o)}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-[#1a1208]/10 text-[#1a1208]/50 hover:text-[#1a1208] hover:border-[#1a1208]/20 transition-all duration-200"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    {/* Breadcrumb */}
                    <div className="hidden md:flex items-center gap-2 text-[12px]">
                        <span className="text-[#1a1208]/30 font-medium">Admin</span>
                        <span className="text-[#1a1208]/20">/</span>
                        <span className="text-[#1a1208]/70 font-semibold capitalize">
                            {pathname === "/admin" ? "Overview" : pathname.split("/").filter(Boolean).slice(1).join(" / ")}
                        </span>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 ml-auto">
                        <Link
                            href="/"
                            className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-[#1a1208]/40 hover:text-[#c8783a] border border-[#1a1208]/10 hover:border-[#c8783a]/30 rounded-lg px-3 py-1.5 transition-all duration-200"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            View Site
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-[#c8783a]/15 border border-[#c8783a]/20 flex items-center justify-center">
                            <span className="text-[10.5px] font-bold text-[#c8783a]">{initials}</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
