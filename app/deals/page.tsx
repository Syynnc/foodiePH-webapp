"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollReveal } from "@/app/components/ScrollReveal";

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
    description: "No minimum spend required. Valid for all partner restaurants in Metro Manila and Cebu.",
    code: "FIRSTFOODIE",
    expiry: "No expiry",
    highlight: true,
  },
  {
    id: "corp-credit",
    badge: "Corporate",
    badgeColor: "#3a8a6a",
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
    badgeColor: "#5a8a4a",
    title: "20% Off Sushi",
    subtitle: "Fridays to Sundays",
    description: "All Asian & Sushi restaurants offering 20% off on weekend orders. Discount applied automatically at checkout.",
    code: null,
    expiry: "Every Fri–Sun, 11am–10pm",
    highlight: false,
  },
  {
    id: "lunch-promo",
    badge: "Daily",
    badgeColor: "#c8503a",
    title: "Lunch Bundles",
    subtitle: "₱149 meals, 11am–2pm",
    description: "Select partner restaurants offer curated lunch bundles under ₱149. Look for the 🍱 tag in the menu.",
    code: null,
    expiry: "11:00 AM – 2:00 PM daily",
    highlight: false,
  },
  {
    id: "referral",
    badge: "Referral",
    badgeColor: "#8a5a3a",
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
    badgeColor: "#3a5a8a",
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
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-[#1a1208]/[0.04] hover:bg-[#1a1208]/[0.08] rounded-xl px-4 py-2.5 transition-all duration-300 group"
    >
      <span className="font-mono text-[12px] font-bold text-[#1a1208] tracking-[0.1em] uppercase">{code}</span>
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 group-hover:opacity-60 transition-opacity">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className={`relative rounded-[1.5rem] overflow-hidden border transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] ${
      deal.highlight
        ? "bg-[#1a1208] text-white border-[#1a1208]"
        : "bg-white text-[#1a1208] border-[#1a1208]/[0.07]"
    }`}>
      
      {/* Decorative blob */}
      {deal.highlight && (
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(200,120,58,0.3) 0%, transparent 70%)" }}
        />
      )}

      {/* Voucher top strip */}
      <div className={`px-6 pt-6 pb-5 ${deal.highlight ? "" : ""}`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <span
            className="text-[9px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full"
            style={{
              background: deal.badgeColor + (deal.highlight ? "30" : "18"),
              color: deal.highlight ? deal.badgeColor : deal.badgeColor,
            }}
          >
            {deal.badge}
          </span>
          <span className={`text-[10px] font-medium ${deal.highlight ? "text-white/35" : "text-[#1a1208]/30"}`}>
            {deal.expiry}
          </span>
        </div>

        <h3 className={`font-playfair text-[2rem] font-bold leading-none mb-1 ${deal.highlight ? "text-white" : "text-[#1a1208]"}`}>
          {deal.title}
        </h3>
        <p className={`text-sm font-medium mb-3 ${deal.highlight ? "text-white/55" : "text-[#1a1208]/50"}`}>
          {deal.subtitle}
        </p>
        <p className={`text-[12.5px] leading-[1.75] ${deal.highlight ? "text-white/45" : "text-[#1a1208]/45"}`}>
          {deal.description}
        </p>
      </div>

      {/* Dashed divider — voucher tear line */}
      <div className={`mx-6 border-t border-dashed ${deal.highlight ? "border-white/15" : "border-[#1a1208]/10"}`} />

      {/* Bottom strip */}
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {deal.code ? (
          <CopyButton code={deal.code} />
        ) : (
          <span className={`text-[11px] font-medium ${deal.highlight ? "text-white/35" : "text-[#1a1208]/35"}`}>
            Applied automatically
          </span>
        )}
        <Link
          href="/auth?tab=signup"
          className={`flex items-center gap-1.5 text-[12px] font-semibold transition-colors duration-300 ${
            deal.highlight
              ? "text-[#c8783a] hover:text-[#e09050]"
              : "text-[#c8783a] hover:text-[#b5692e]"
          }`}
        >
          Claim
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1208] pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-4">Promotions</p>
            <h1 className="font-playfair text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight mb-4">
              Deals that hit different<br />
              <em className="not-italic text-[#c8783a]">every time you order.</em>
            </h1>
            <p className="text-[#1a1208]/50 text-base font-light leading-[1.8] max-w-md">
              From first-order freebies to corporate credits — we&apos;ve got a deal for everyone. Click a promo code to copy it.
            </p>
          </div>
        </ScrollReveal>

        {/* Deals grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEALS.map((deal, i) => (
            <ScrollReveal key={deal.id} delay={i * 70}>
              <DealCard deal={deal} />
            </ScrollReveal>
          ))}
        </div>

        {/* CTA strip */}
        <ScrollReveal>
          <div className="mt-20 rounded-[1.5rem] bg-[#1a1208]/[0.03] border border-[#1a1208]/[0.07] px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-playfair text-xl font-semibold text-[#1a1208] mb-1">Want exclusive partner deals?</p>
              <p className="text-sm text-[#1a1208]/45 font-light">Corporate accounts unlock private pricing and monthly invoicing.</p>
            </div>
            <Link
              href="/auth?tab=signup"
              className="flex-shrink-0 flex items-center gap-2 bg-[#c8783a] text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-[#b5692e] transition-colors duration-300"
            >
              Apply for Corporate
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-7-7 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}