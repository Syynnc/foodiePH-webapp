"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type RestaurantSummary = {
    id: string;
    name: string;
    cuisine: string | null;
    imageUrl: string | null;
    isActive: boolean | null;
};

function SkeletonCard() {
    return (
        <div className="bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden animate-pulse">
            <div className="h-36 bg-[#F4F0EB]" />
            <div className="p-4 space-y-2">
                <div className="h-3.5 w-3/4 bg-[#1a1208]/[0.07] rounded-full" />
                <div className="h-2.5 w-1/2 bg-[#1a1208]/[0.04] rounded-full" />
            </div>
        </div>
    );
}

export default function RestaurantSelectorPage() {
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/restaurant/my-restaurants")
            .then(r => r.ok ? r.json() : [])
            .then((rows: RestaurantSummary[]) => {
                if (rows.length === 1) {
                    router.replace(`/restaurant/${rows[0].id}`);
                    return;
                }
                setRestaurants(rows);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-[100dvh] bg-[#FDFBF7] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#c8783a]/30 border-t-[#c8783a] rounded-full animate-spin" />
            </div>
        );
    }

    if (restaurants.length === 0) {
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
            <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 pb-20">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-md bg-[#c8783a] flex items-center justify-center">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 11l19-9-9 19-2-8-8-2z" />
                            </svg>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.26em] font-bold text-[#c8783a]">Owner Portal</p>
                    </div>
                    <h1 className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-tight">Your Restaurants</h1>
                    <p className="text-[13px] text-[#1a1208]/45 mt-1">Select a restaurant to manage.</p>
                </div>

                {/* Restaurant grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {restaurants.map(r => (
                        <Link
                            key={r.id}
                            href={`/restaurant/${r.id}`}
                            className="group bg-white border border-[#1a1208]/[0.07] rounded-2xl overflow-hidden hover:border-[#1a1208]/15 hover:shadow-[0_8px_32px_rgba(26,18,8,0.08)] transition-all duration-300"
                        >
                            {/* Cover */}
                            <div className="relative h-36 bg-[#1a1208] overflow-hidden">
                                {r.imageUrl ? (
                                    <Image src={r.imageUrl} alt={r.name} fill className="object-cover opacity-70 group-hover:opacity-80 group-hover:scale-[1.02] transition-all duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-[0.06]">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
                                            <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" /><path d="M10 14h4" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/60 to-transparent" />
                                <div className="absolute top-3 right-3">
                                    <span className={`text-[9px] font-bold uppercase tracking-[0.15em] rounded-full px-2 py-0.5 ${r.isActive ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"}`}>
                                        {r.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[14px] font-bold text-[#1a1208] truncate">{r.name}</p>
                                    {r.cuisine && <p className="text-[11px] text-[#1a1208]/40 mt-0.5 truncate">{r.cuisine}</p>}
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a1208]/20 shrink-0 group-hover:text-[#c8783a] transition-colors">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
