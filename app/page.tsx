"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ScrollReveal } from "./components/ScrollReveal";

const NAV_LINKS = ["Menu", "Restaurants", "Deals", "About"];

const CATEGORIES = [
  { label: "Ramen & Noodles", count: "38 spots", color: "bg-[#f5ede0]" },
  { label: "Sushi & Japanese", count: "24 spots", color: "bg-[#edf2e8]" },
  { label: "Tacos & Mexican", count: "19 spots", color: "bg-[#e8edf5]" },
  { label: "Pizza & Italian", count: "31 spots", color: "bg-[#f5ebe8]" },
  { label: "Healthy Bowls", count: "27 spots", color: "bg-[#edf5e8]" },
  { label: "Burgers", count: "42 spots", color: "bg-[#f5f0e8]" },
];

const PARTNERS = [
  "Jollibee", "Wildflour", "Manam", "Army Navy", "Early Bird",
  "Hap Chan", "Vikings", "Mang Inasal", "Baliwag", "Aristocrat",
  "Mesa", "Spiral", "Cibo", "Cyma", "Sarsa",
  "Jollibee", "Wildflour", "Manam", "Army Navy", "Early Bird",
  "Hap Chan", "Vikings", "Mang Inasal", "Baliwag", "Aristocrat",
  "Mesa", "Spiral", "Cibo", "Cyma", "Sarsa",
];

const STATS = [
  { value: "100+", label: "Restaurants" },
  { value: "30min", label: "Avg. Delivery" },
  { value: "4.8★", label: "App Rating" },
  { value: "50k+", label: "Happy Orders" },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Browse & Discover",
    body: "Explore hundreds of local restaurants, filter by cuisine, dietary needs, or delivery time.",
    img: "https://picsum.photos/seed/foodbrowse/600/400",
  },
  {
    n: "02",
    title: "Order in Seconds",
    body: "Pick your favourites, customize your meal, and check out with saved payment details.",
    img: "https://picsum.photos/seed/foodorder/600/400",
  },
  {
    n: "03",
    title: "Track & Enjoy",
    body: "Watch your rider in real-time and get notified the moment your food arrives hot.",
    img: "https://picsum.photos/seed/foodtrack/600/400",
  },
];

const GALLERY = [
  { src: "https://picsum.photos/seed/ramen1/500/700", alt: "Ramen bowl" },
  { src: "https://picsum.photos/seed/sushi2/500/500", alt: "Sushi platter" },
  { src: "https://picsum.photos/seed/taco3/500/650", alt: "Street tacos" },
  { src: "https://picsum.photos/seed/pizza4/500/500", alt: "Wood-fired pizza" },
  { src: "https://picsum.photos/seed/bowl5/500/700", alt: "Poke bowl" },
];

// Floating delivery badge
function DeliveryBadge() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={`absolute bottom-8 left-0 z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-white/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#c8783a]/12 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#1a1208] leading-tight">25–35 min delivery</p>
          <p className="text-[10px] text-[#1a1208]/50 leading-tight">Your area is covered</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 ml-1 flex-shrink-0" style={{ animation: "pulse 2s infinite" }} />
      </div>
    </div>
  );
}

// Live order ticker
function OrderTicker() {
  const items = [
    { name: "Marcus T.", order: "Tonkotsu Ramen", time: "2 min ago" },
    { name: "Lia C.", order: "Salmon Sushi Set", time: "4 min ago" },
    { name: "Ray P.", order: "3× Street Tacos", time: "7 min ago" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % items.length), 3000);
    return () => clearInterval(iv);
  }, []);
  const item = items[idx];
  return (
    <div className="absolute top-8 right-0 z-10">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-white/60 w-52 overflow-hidden">
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#1a1208]/40 mb-1.5 font-medium">Live Orders</p>
        <div key={idx} className="animate-fade-up">
          <p className="text-[12px] font-semibold text-[#1a1208] leading-tight truncate">{item.name} · {item.order}</p>
          <p className="text-[10px] text-[#1a1208]/45 mt-0.5">{item.time}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-[100dvh] bg-[#FDFBF7] text-[#1a1208]">

      {/* ── Floating Nav ── */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl">
        <div className="bg-[#FDFBF7]/85 backdrop-blur-xl border border-[#1a1208]/8 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_2px_32px_rgba(0,0,0,0.06)]">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-playfair text-xl font-bold tracking-tight">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link} href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-[#1a1208]/55 hover:text-[#1a1208] transition-colors duration-300">
                {link}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth"
              className="text-sm font-medium text-[#1a1208]/55 hover:text-[#1a1208] transition-colors duration-300">
              Sign in
            </Link>
            <Link href="/auth?tab=signup"
              className="group flex items-center gap-2 rounded-full bg-[#c8783a] text-white px-5 py-2.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#b5692e] active:scale-[0.98]">
              Order Now
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">↗</span>
            </Link>
          </div>

          <button type="button"
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            <span className={`block h-px w-6 bg-[#1a1208] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block h-px w-6 bg-[#1a1208] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-30 backdrop-blur-3xl bg-[#FDFBF7]/92 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col items-center gap-8">
          {NAV_LINKS.map((link, i) => (
            <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}
              className={`font-playfair text-4xl font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
              style={{ transitionDelay: menuOpen ? `${100 + i * 60}ms` : "0ms" }}>
              {link}
            </a>
          ))}
          <Link href="/auth" onClick={() => setMenuOpen(false)}
            className={`mt-4 rounded-full bg-[#c8783a] text-white px-8 py-3 text-base font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
            style={{ transitionDelay: menuOpen ? "380ms" : "0ms" }}>
            Order Now
          </Link>
        </div>
      </div>

      {/* ── Hero — full bleed background image ── */}
      <section className="relative min-h-[100dvh] flex items-end overflow-hidden">

        {/* Background: the illustration */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt="Food delivery illustration"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Soft gradient overlays to make text legible without killing the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7]/70 via-transparent to-transparent" />
        </div>

        {/* Content — bottom-left aligned */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 pt-36">
          <div className="max-w-xl">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[#1a1208]/12 bg-white/70 backdrop-blur-sm px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8783a]" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1208]/60">
                Food Delivery · Philippines
              </span>
            </div>

            <h1 className="font-playfair animate-fade-up delay-100 text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.06] tracking-tight mb-6">
              Cravings delivered<br />
              <span className="italic text-[#c8783a]">right to your door.</span>
            </h1>

            <p className="animate-fade-up delay-200 text-lg leading-8 text-[#1a1208]/60 font-light mb-10 max-w-md">
              From ramen to sushi, tacos to pizza — order from 100+ local restaurants and get fresh food delivered fast.
            </p>

            {/* Search bar CTA */}
            <div className="animate-fade-up delay-300">
              <div className="flex flex-col sm:flex-row gap-3 bg-white/80 backdrop-blur-xl border border-[#1a1208]/8 rounded-2xl p-3 shadow-[0_8px_40px_rgba(0,0,0,0.08)] max-w-lg">
                <div className="flex items-center gap-3 flex-1 px-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your delivery address"
                    className="flex-1 text-sm bg-transparent outline-none text-[#1a1208] placeholder:text-[#1a1208]/35 py-1.5 font-medium"
                  />
                </div>
                <Link href="/auth?tab=signup"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-[#c8783a] text-white px-6 py-3 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#b5692e] active:scale-[0.98] flex-shrink-0">
                  Find Food
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
                    <path d="M5 12h14m-7-7 7 7-7 7"/>
                  </svg>
                </Link>
              </div>
              <p className="text-xs text-[#1a1208]/35 mt-3 pl-2">No signup needed to browse · Free delivery on first order</p>
            </div>

            {/* Trust row */}
            <div className="animate-fade-up delay-500 flex items-center gap-6 mt-10 flex-wrap">
              <div className="flex -space-x-2">
                {["11", "12", "14", "19"].map((seed) => (
                  <div key={seed} className="w-8 h-8 rounded-full ring-2 ring-[#FDFBF7] overflow-hidden relative">
                    <Image src={`https://i.pravatar.cc/64?img=${seed}`} alt="Customer" fill className="object-cover" sizes="32px" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#1a1208]/50 font-light">
                <span className="font-semibold text-[#1a1208]">50,000+</span> happy customers this month
              </p>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#c8783a" stroke="none">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-[#1a1208]/50">4.8 App Store</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating UI badges */}
        <div className="absolute right-12 bottom-1/2 translate-y-1/2 hidden lg:block z-10">
          <div className="relative w-64 h-48">
            <DeliveryBadge />
            <OrderTicker />
          </div>
        </div>
      </section>

      {/* ── Partner Marquee ── */}
      <section id="restaurants" className="py-10 border-y border-[#1a1208]/8 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex gap-12 pr-12">
            {PARTNERS.map((name, i) => (
              <span key={i} className="text-sm font-medium uppercase tracking-[0.18em] text-[#1a1208]/28 hover:text-[#c8783a] transition-colors duration-300 cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 80}>
              <div className="text-center p-6 rounded-2xl bg-[#1a1208]/[0.03] hover:bg-[#1a1208]/[0.055] transition-colors duration-500">
                <div className="font-playfair text-[2.4rem] font-bold mb-1 text-[#c8783a] leading-none">{s.value}</div>
                <div className="text-xs uppercase tracking-[0.15em] text-[#1a1208]/45 mt-1">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section id="menu" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#1a1208]/10 bg-[#1a1208]/[0.04] px-4 py-1.5 mb-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1208]/55">What&apos;s Trending</span>
                </div>
                <h2 className="font-playfair text-[clamp(2.2rem,4.5vw,3.5rem)] font-bold leading-tight">
                  Every craving,<br />
                  <span className="italic text-[#c8783a]">covered.</span>
                </h2>
              </div>
              <Link href="/auth?tab=signup"
                className="text-sm font-medium text-[#c8783a] hover:text-[#b5692e] transition-colors duration-300 flex items-center gap-1.5 flex-shrink-0">
                View all cuisines
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </ScrollReveal>

          {/* Asymmetric bento — 2 wide + 4 standard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => (
              <ScrollReveal key={cat.label} delay={i * 55}>
                <div className={`group cursor-pointer rounded-[1.5rem] ${cat.color} p-7 flex flex-col justify-between min-h-[140px] hover:scale-[1.015] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border border-[#1a1208]/[0.06]`}>
                  <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[#1a1208]/45">{cat.count}</span>
                  <div className="flex items-end justify-between gap-2 mt-4">
                    <h3 className="font-playfair text-xl font-semibold leading-snug">{cat.label}</h3>
                    <div className="w-8 h-8 rounded-full bg-[#1a1208]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c8783a] group-hover:text-white transition-colors duration-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7 7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Food Gallery Strip ── */}
      <section id="about" className="px-6 py-12 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1a1208]/10 bg-[#1a1208]/[0.04] px-4 py-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1208]/55">Fresh From Our Partners</span>
            </div>
          </ScrollReveal>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {GALLERY.map((g, i) => (
              <ScrollReveal key={i} delay={i * 70}
                className="flex-shrink-0 snap-start relative rounded-2xl overflow-hidden img-shimmer w-44 md:w-52 aspect-[3/4]">
                <Image src={g.src} alt={g.alt} fill className="object-cover hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" sizes="224px" />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="deals" className="px-6 py-28 bg-[#1a1208] text-[#FDFBF7]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="mb-20 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/45">How It Works</span>
              </div>
              <h2 className="font-playfair text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-tight">
                Order in three steps.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 100}>
                <div className="p-1.5 rounded-[2rem] bg-white/[0.05] ring-1 ring-white/8 h-full">
                  <div className="relative h-full rounded-[calc(2rem-0.375rem)] bg-white/[0.04] overflow-hidden">
                    <div className="relative h-40 overflow-hidden">
                      <Image src={step.img} alt={step.title} fill className="object-cover opacity-40" sizes="400px" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1208]/80" />
                    </div>
                    <div className="p-7 flex flex-col gap-3">
                      <span className="font-playfair text-5xl font-bold text-white/8 leading-none">{step.n}</span>
                      <div>
                        <h3 className="font-playfair text-xl font-semibold mb-2 leading-snug">{step.title}</h3>
                        <p className="text-sm leading-7 text-white/48 font-light">{step.body}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="p-2 rounded-[2.5rem] bg-[#1a1208]/[0.055] ring-1 ring-[#1a1208]/8">
              <div className="relative rounded-[calc(2.5rem-0.5rem)] bg-gradient-to-br from-[#c8783a] to-[#a85e2a] p-14 text-center overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <div className="absolute inset-0">
                  <Image
                    src="/hero-bg.png"
                    alt="Food background"
                    fill
                    className="object-cover opacity-[0.08]"
                    sizes="1200px"
                  />
                </div>
                <div className="relative">
                  <h2 className="font-playfair text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-white leading-tight mb-5">
                    Hungry right now?<br />
                    <span className="italic">We&apos;ve got you.</span>
                  </h2>
                  <p className="text-white/65 text-lg font-light mb-10 max-w-sm mx-auto">
                    Join thousands of food lovers across Metro Manila and Cebu getting fresh meals delivered daily.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/auth?tab=signup"
                      className="group inline-flex items-center gap-3 rounded-full bg-white text-[#1a1208] px-8 py-4 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#FDFBF7] active:scale-[0.98]">
                      Get Started — It&apos;s Free
                      <span className="w-7 h-7 rounded-full bg-[#1a1208]/8 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">↗</span>
                    </Link>
                    <Link href="/auth"
                      className="text-white/70 text-sm font-medium hover:text-white transition-colors duration-300 underline underline-offset-4">
                      Already have an account?
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-12 border-t border-[#1a1208]/8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-playfair text-xl font-bold">
            Foodie<span className="text-[#c8783a]">.ph</span>
          </span>
          <p className="text-sm text-[#1a1208]/38 font-light">
            © {new Date().getFullYear()} Foodie.ph · Metro Manila &amp; Metro Cebu
          </p>
          <div className="flex gap-6 text-sm text-[#1a1208]/38">
            <Link href="#" className="hover:text-[#1a1208] transition-colors duration-300">Privacy</Link>
            <Link href="#" className="hover:text-[#1a1208] transition-colors duration-300">Terms</Link>
            <Link href="/auth" className="hover:text-[#1a1208] transition-colors duration-300">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
