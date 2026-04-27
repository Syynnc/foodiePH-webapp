"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";

type Deal = {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  code: string | null;
  expiry: string;
  highlight: boolean;
};

const DEALS: Deal[] = [
  {
    id: "first-order",
    badge: "New Users",
    badgeColor: "#c8783a",
    title: "Free Delivery",
    subtitle: "on your first order",
    description: "No minimum spend required. Valid for all partner restaurants in Metro Manila and Cebu. Sign up, place your order, and the delivery fee is on us.",
    code: "FIRSTFOODIE",
    expiry: "No expiry",
    highlight: true,
  },
  {
    id: "corp-credit",
    badge: "Corporate",
    badgeColor: "#3a7a5a",
    title: "₱500 Credit",
    subtitle: "for your team's first group order",
    description: "Sign up as a corporate account and get ₱500 off your first group order of ₱2,000 or more.",
    code: "CORPFOODIE",
    expiry: "Valid until Dec 31, 2025",
    highlight: false,
  },
  {
    id: "weekend-deals",
    badge: "Every Weekend",
    badgeColor: "#4a7a3a",
    title: "20% Off Sushi",
    subtitle: "Fridays to Sundays",
    description: "All Asian and Sushi restaurants offering 20% off on weekend orders. Discount applied automatically at checkout.",
    code: null,
    expiry: "Every Fri–Sun, 11am–10pm",
    highlight: false,
  },
  {
    id: "lunch-promo",
    badge: "Daily",
    badgeColor: "#a8502a",
    title: "Lunch Bundles",
    subtitle: "Under ₱149, 11am–2pm",
    description: "Select partner restaurants offer curated lunch bundles under ₱149. Look for the Lunch Bundle tag in the menu.",
    code: null,
    expiry: "11:00 AM – 2:00 PM daily",
    highlight: false,
  },
  {
    id: "referral",
    badge: "Referral",
    badgeColor: "#7a4a2a",
    title: "₱100 Each",
    subtitle: "you and a friend both save",
    description: "Share your referral link. When they complete their first order, you both get ₱100 off your next delivery.",
    code: null,
    expiry: "Ongoing",
    highlight: false,
  },
  {
    id: "enow-paylater",
    badge: "Exclusive",
    badgeColor: "#2a4a7a",
    title: "Eat Now, Pay Later",
    subtitle: "corporate accounts only",
    description: "Qualified corporate accounts can order now and settle at month-end. Apply in your account settings.",
    code: null,
    expiry: "Subject to credit approval",
    highlight: false,
  },
];

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2.5 rounded-xl px-4 py-2.5 border transition-all duration-300 active:scale-[0.97]"
      style={{
        background: copied ? "rgba(16,185,129,0.08)" : "rgba(26,18,8,0.04)",
        borderColor: copied ? "rgba(16,185,129,0.3)" : "rgba(26,18,8,0.08)",
      }}
    >
      <span className="font-mono text-[11.5px] font-bold text-[#1a1208] tracking-[0.12em] uppercase">
        {copied ? "Copied!" : code}
      </span>
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 group-hover:opacity-70 transition-opacity">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function CopyButtonDark({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2.5 rounded-xl px-4 py-2.5 border transition-all duration-300 active:scale-[0.97]"
      style={{
        background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.08)",
        borderColor: copied ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.12)",
      }}
    >
      <span className="font-mono text-[11.5px] font-bold text-white tracking-[0.12em] uppercase">
        {copied ? "Copied!" : code}
      </span>
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 group-hover:opacity-70 transition-opacity">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="relative rounded-[1.4rem] overflow-hidden border border-[#1a1208]/[0.07] bg-white hover:border-[#1a1208]/[0.12] hover:shadow-[0_12px_36px_rgba(26,18,8,0.06)] hover:-translate-y-0.5 transition-all duration-500">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-5">
          <span
            className="text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-full"
            style={{ background: deal.badgeColor + "1a", color: deal.badgeColor }}
          >
            {deal.badge}
          </span>
          <span className="text-[10px] font-medium text-[#1a1208]/30 text-right">{deal.expiry}</span>
        </div>
        <h3 className="font-playfair text-[1.9rem] font-bold leading-none mb-1.5 text-[#1a1208]">
          {deal.title}
        </h3>
        <p className="text-sm font-medium mb-3 text-[#1a1208]/45">{deal.subtitle}</p>
        <p className="text-[12.5px] leading-[1.78] text-[#1a1208]/45">{deal.description}</p>
      </div>

      <div className="relative mx-6 my-1">
        <div className="border-t border-dashed border-[#1a1208]/[0.09]" />
        <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FDFBF7] border border-[#1a1208]/[0.07]" />
        <div className="absolute -right-9 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FDFBF7] border border-[#1a1208]/[0.07]" />
      </div>

      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {deal.code ? (
          <CopyButton code={deal.code} />
        ) : (
          <span className="text-[11px] font-medium text-[#1a1208]/30 italic">Applied automatically</span>
        )}
        <Link
          href="/auth?tab=signup"
          className="flex items-center gap-1.5 text-[12px] font-bold text-[#c8783a] hover:text-[#b5692e] transition-colors duration-300 group"
        >
          Claim deal
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

const highlightDeal = DEALS.find((d) => d.highlight)!;
const otherDeals = DEALS.filter((d) => !d.highlight);

export default function DealsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFBF7] text-[#1a1208] pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">

          {/* ── Header ── */}
          <ScrollReveal>
            <div className="mb-14">
              <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-4">Promotions</p>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <h1 className="font-playfair text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight">
                  Deals worth<br />
                  <em className="not-italic text-[#c8783a]">saving for later.</em>
                </h1>
                <p className="text-[#1a1208]/50 text-sm font-light leading-[1.8] max-w-xs md:text-right">
                  From first-order freebies to corporate credits — click any promo code to copy it instantly.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Featured deal — full-width hero card ── */}
          <ScrollReveal>
            <div className="relative bg-[#1a1208] rounded-[2rem] overflow-hidden mb-6 p-8 md:p-12">
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
              />
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(200,120,58,0.28) 0%, transparent 70%)" }}
              />
              <div
                className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(200,120,58,0.12) 0%, transparent 70%)" }}
              />

              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="text-[9px] uppercase tracking-[0.22em] font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(200,120,58,0.25)", color: "#e09050" }}
                    >
                      {highlightDeal.badge}
                    </span>
                    <span className="text-[10px] font-medium text-white/30">{highlightDeal.expiry}</span>
                  </div>
                  <h2 className="font-playfair text-[clamp(2.4rem,4.5vw,4rem)] font-bold text-white leading-none mb-2">
                    {highlightDeal.title}
                  </h2>
                  <p className="text-white/55 text-base font-medium mb-4">{highlightDeal.subtitle}</p>
                  <p className="text-white/40 text-sm font-light leading-[1.8] max-w-md">{highlightDeal.description}</p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-4 flex-shrink-0">
                  {highlightDeal.code && <CopyButtonDark code={highlightDeal.code} />}
                  <Link
                    href="/auth?tab=signup"
                    className="flex items-center gap-2 bg-[#c8783a] text-white rounded-full px-7 py-3.5 text-sm font-semibold hover:bg-[#b5692e] transition-colors duration-300 active:scale-[0.97]"
                  >
                    Claim this deal
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Other deals — 2-col asymmetric grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {otherDeals.map((deal, i) => (
              <ScrollReveal key={deal.id} delay={i * 65}>
                <DealCard deal={deal} />
              </ScrollReveal>
            ))}
          </div>

          {/* ── How it works strip ── */}
          <ScrollReveal>
            <div className="border-t border-[#1a1208]/[0.07] pt-14 mb-14">
              <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-8">How Deals Work</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  { step: "1", title: "Find a deal", body: "Browse the promotions above and pick the one that fits your order." },
                  { step: "2", title: "Copy or note it", body: "Click a promo code to copy it, or note that some discounts apply automatically." },
                  { step: "3", title: "Apply at checkout", body: "Paste your code during checkout and watch the total drop before you confirm." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <span className="font-playfair text-[2rem] font-bold text-[#c8783a]/30 leading-none flex-shrink-0 pt-0.5">{s.step}</span>
                    <div>
                      <p className="font-semibold text-[#1a1208] text-sm mb-1">{s.title}</p>
                      <p className="text-[12.5px] text-[#1a1208]/45 font-light leading-[1.78]">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── CTA strip ── */}
          <ScrollReveal>
            <div className="rounded-[1.5rem] bg-[#1a1208]/[0.03] border border-[#1a1208]/[0.07] px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1.5">Want exclusive partner deals?</p>
                <p className="text-sm text-[#1a1208]/45 font-light leading-relaxed">
                  Corporate accounts unlock private pricing, monthly invoicing, and team-size discounts.
                </p>
              </div>
              <Link
                href="/auth?tab=signup"
                className="flex-shrink-0 flex items-center gap-2 bg-[#c8783a] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#b5692e] transition-colors duration-300 active:scale-[0.97]"
              >
                Apply for Corporate
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>

        </div>
      </div>
      <Footer />
    </>
  );
}
