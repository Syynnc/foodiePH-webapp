"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
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
    img: "https://images.unsplash.com/photo-1601972602288-3be527b4f18a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    n: "02",
    title: "Order in Seconds",
    body: "Pick your favourites, customize your meal, and check out with saved payment details.",
    img: "https://images.unsplash.com/photo-1609427955204-d0a737cb2c1a?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    n: "03",
    title: "Track & Enjoy",
    body: "Watch your rider in real-time and get notified the moment your food arrives hot.",
    img: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=1115&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const GALLERY = [
  { src: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Ramen bowl" },
  { src: "https://images.unsplash.com/photo-1736885978380-8d7d9f7d7880?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Sushi platter" },
  { src: "https://images.unsplash.com/photo-1683062332605-4e1209d75346?q=80&w=1236&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Street tacos" },
  { src: "https://images.unsplash.com/photo-1694718950978-6e574ee95440?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Wood-fired pizza" },
  { src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Poke Bowl" },
  { src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=780&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Pancake" },  
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
      className={`z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "translate-y-32 opacity-100" : "translate-y-6 opacity-0"
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
  }, [items.length]);
  const item = items[idx];
  return (
    <div className="z-10">
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
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">

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
          <div className="absolute inset-0 bg-[#FDFBF7]/50" />
        </div>

        {/* Content — centered */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12 pt-36 flex flex-col items-center text-center">
          <div className="max-w-2xl relative flex flex-col items-center">
            
            {/* Floating UI badges - placed around the hero text */}
            <div className="absolute -left-32 top-32 hidden xl:block z-10 scale-95 w-max">
              <DeliveryBadge />
            </div>
            <div className="absolute -right-28 top-64 hidden xl:block z-10 scale-95 w-max">
              <OrderTicker />
            </div>

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

            <p className="animate-fade-up delay-200 text-lg leading-8 text-[#1a1208]/60 font-light mb-10 max-w-md mx-auto">
              From ramen to sushi, tacos to pizza — order from 100+ local restaurants and get fresh food delivered fast.
            </p>

            {/* Search bar CTA */}
            <div className="animate-fade-up delay-300 w-full max-w-lg">
              <div className="flex flex-col sm:flex-row gap-3 bg-white/80 backdrop-blur-xl border border-[#1a1208]/8 rounded-2xl p-3 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3 flex-1 px-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your delivery address"
                    className="flex-1 text-sm bg-transparent outline-none text-[#1a1208] placeholder:text-[#1a1208]/35 py-1.5 font-medium min-w-0"
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
              <p className="text-xs text-[#1a1208]/35 mt-3">No signup needed to browse · Free delivery on first order</p>
            </div>

            {/* Trust row */}
            <div className="animate-fade-up delay-500 flex items-center justify-center gap-6 mt-10 flex-wrap">
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
      <section id="menu" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
      
          {/* Header row */}
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-medium text-[#1a1208]/45 mb-4">
                  What&apos;s Trending
                </p>
                <h2 className="font-playfair text-[clamp(2.4rem,4.5vw,3.6rem)] font-bold leading-[1.05] tracking-tight">
                  Every craving,{" "}
                  <em className="not-italic text-[#c8783a]">covered.</em>
                </h2>
              </div>
              <a
                href="/auth?tab=signup"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#1a1208]/50 hover:text-[#c8783a] transition-colors duration-300 md:mb-1 flex-shrink-0"
              >
                View all cuisines
                <svg
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </a>
            </div>
          </ScrollReveal>
      
          {/*
            Layout: 3-col grid on lg+, 2-col on sm, 1-col on xs.
            First card spans 2 cols on lg (feature card). 
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat, i) => (
              <ScrollReveal key={cat.label} delay={i * 60}>
                <a
                  href="#"
                  className={`
                    group block rounded-[1.25rem] p-6 border border-[#1a1208]/[0.07]
                    hover:border-[#1a1208]/[0.14] hover:-translate-y-0.5
                    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${i === 0 ? "sm:col-span-2 lg:col-span-1 min-h-[200px]" : "min-h-[152px]"}
                  `}
                  style={{ backgroundColor: cat.color + "55" }}
                >
                  {/* Count */}
                  <p className="text-[9px] uppercase tracking-[0.22em] font-medium text-[#1a1208]/38 mb-auto">
                    {cat.count}
                  </p>
      
                  {/* Spacer pushes content to bottom */}
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex justify-end mt-1 mb-6">
                      {/* Small decorative dot cluster */}
                      <div className="flex gap-1 opacity-40">
                        <span className="block w-1.5 h-1.5 rounded-full bg-[#1a1208]" />
                        <span className="block w-1.5 h-1.5 rounded-full bg-[#c8783a]" />
                      </div>
                    </div>
      
                    <div className="flex items-end justify-between gap-3">
                      <h3 className="font-playfair text-[1.15rem] font-semibold leading-snug text-[#1a1208]">
                        {cat.label}
                      </h3>
                      <div
                        className="
                          flex-shrink-0 w-8 h-8 rounded-full border border-[#1a1208]/12
                          flex items-center justify-center
                          group-hover:bg-[#c8783a] group-hover:border-[#c8783a]
                          transition-all duration-300
                        "
                      >
                        <svg
                          className="text-[#1a1208]/40 group-hover:text-white transition-colors duration-300"
                          width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round"
                        >
                          <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      
      {/* ── Food Gallery Strip ── */}
      <section id="about" className="py-20 overflow-hidden">
      
        {/* Header — full bleed with px */}
        <ScrollReveal>
          <div className="px-6 max-w-5xl mx-auto mb-10 flex items-center gap-6">
            <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 flex-shrink-0">
              Fresh From Our Partners
            </p>
            <div className="flex-1 h-px bg-[#1a1208]/10" />
            <a
              href="#"
              className="text-[9px] uppercase tracking-[0.22em] font-medium text-[#c8783a] hover:text-[#b5692e] transition-colors duration-300 flex-shrink-0"
            >
              See all →
            </a>
          </div>
        </ScrollReveal>
      
        {/* Scroll strip — bleeds past container */}
        <div
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-6 md:justify-center"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {GALLERY.map((g, i) => {
            // Alternating heights for visual rhythm
            const heights = ["h-72", "h-56", "h-80", "h-60", "h-72"];
            return (
              <ScrollReveal
                key={i}
                delay={i * 65}
                className={`
                  flex-shrink-0 snap-start relative rounded-2xl overflow-hidden img-shimmer
                  w-44 md:w-52 ${heights[i % heights.length]}
                  cursor-pointer
                `}
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  className="object-cover hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  sizes="224px"
                />
                {/* Bottom label overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="font-playfair text-white text-sm font-semibold leading-snug">
                    {g.alt}
                  </span>
                </div>
              </ScrollReveal>
            );
          })}
          {/* Trailing spacer so last card doesn't touch viewport edge */}
          <div className="flex-shrink-0 w-6" aria-hidden="true" />
        </div>
      </section>
      
      {/* ── How It Works ── */}
      <section id="deals" className="px-6 py-28 bg-[#1a1208] text-[#FDFBF7]">
        <div className="max-w-5xl mx-auto">
      
          {/* Header */}
          <ScrollReveal>
            <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-white/30 mb-4">
                  How It Works
                </p>
                <h2 className="font-playfair text-[clamp(2.2rem,4.5vw,3.6rem)] font-bold leading-[1.05]">
                  Three steps to<br />
                  <em className="not-italic text-[#c8783a]">your front door.</em>
                </h2>
              </div>
              <p className="text-sm text-white/38 font-light max-w-xs leading-7">
                From browsing to biting — the whole experience takes less than two minutes.
              </p>
            </div>
          </ScrollReveal>
      
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.07] rounded-3xl overflow-hidden">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 110}>
                <div className="relative bg-[#1a1208] p-8 flex flex-col gap-0 group hover:bg-white/[0.03] transition-colors duration-500 h-full">
      
                  {/* Ghosted step number — decorative watermark */}
                  <span
                    className="absolute top-6 right-7 font-playfair text-[5.5rem] font-bold leading-none select-none pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.04)" }}
                  >
                    {step.n}
                  </span>
      
                  {/* Image — cinematic strip */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-8 flex-shrink-0">
                    <Image
                      src={step.img}
                      alt={step.title}
                      fill
                      className="object-cover opacity-50 group-hover:opacity-65 group-hover:scale-[1.03] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      sizes="400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c8783a]/20 to-transparent" />
                  </div>
      
                  {/* Step index pill */}
                  <div className="inline-flex items-center gap-2 mb-5">
                    <span className="w-5 h-5 rounded-full bg-[#c8783a]/15 border border-[#c8783a]/30 text-[#c8783a] text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                      {parseInt(step.n)}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-medium">
                      Step {step.n}
                    </span>
                  </div>
      
                  <h3 className="font-playfair text-[1.2rem] font-semibold mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-[1.8] text-white/42 font-light">
                    {step.body}
                  </p>
      
                  {/* Connector arrow — visible on desktop between steps 1→2 and 2→3 */}
                  {i < 2 && (
                    <div
                      className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#1a1208] border border-white/10 items-center justify-center"
                      aria-hidden="true"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      
      {/* ── CTA Banner ── */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
      
            {/* Outer frame */}
            <div className="rounded-[2rem] overflow-hidden ring-1 ring-[#1a1208]/[0.09] bg-[#1a1208]/[0.03]">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
      
                {/* ── Left — Headline ── */}
                <div className="px-10 py-14 md:px-14 flex flex-col justify-between gap-10">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/38 mb-6">
                      Start Ordering
                    </p>
                    <h2 className="font-playfair text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.08] tracking-tight mb-5">
                      Hungry right now?<br />
                      <em className="not-italic text-[#c8783a]">We&apos;ve got you.</em>
                    </h2>
                    <p className="text-[#1a1208]/50 text-base font-light leading-[1.8] max-w-[320px]">
                      Join thousands of food lovers across Metro Manila and Cebu getting fresh meals delivered daily.
                    </p>
                  </div>
      
                  {/* Bottom trust bar */}
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {["11", "12", "14", "19"].map((seed) => (
                        <div key={seed} className="w-7 h-7 rounded-full ring-2 ring-[#FDFBF7] overflow-hidden relative">
                          <Image src={`https://i.pravatar.cc/64?img=${seed}`} alt="" fill className="object-cover" sizes="28px" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#1a1208]/45 font-light leading-tight">
                      <span className="font-semibold text-[#1a1208]">50,000+</span> orders this month
                    </p>
                  </div>
                </div>
      
                {/* ── Right — Action ── */}
                <div className="relative px-10 py-14 md:px-14 bg-gradient-to-br from-[#c8783a] to-[#a85e28] flex flex-col justify-center gap-8 overflow-hidden">
      
                  {/* Soft noise overlay — reuses the existing grain from globals.css */}
                  <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    }}
                  />
      
                  {/* Decorative circle blob */}
                  <div
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)" }}
                  />
      
                  <div className="relative">
                    <p className="font-playfair text-white/70 text-sm font-light mb-6 leading-relaxed">
                      Free delivery on your first order. No commitment, cancel any time.
                    </p>
      
                    {/* CTA buttons */}
                    <div className="flex flex-col gap-3">
                      <a
                        href="/auth?tab=signup"
                        className="group inline-flex items-center justify-center gap-3 rounded-full bg-white text-[#1a1208] px-7 py-3.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#FDFBF7] hover:-translate-y-px active:scale-[0.98] shadow-[0_2px_20px_rgba(0,0,0,0.18)]"
                      >
                        Get Started — It&apos;s Free
                        <span className="w-6 h-6 rounded-full bg-[#1a1208]/8 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                          ↗
                        </span>
                      </a>
      
                      <a
                        href="/auth"
                        className="inline-flex items-center justify-center text-white/60 text-sm font-medium hover:text-white transition-colors duration-300 underline underline-offset-4 py-1"
                      >
                        Already have an account?
                      </a>
                    </div>
      
                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 mt-8">
                      {["100+ Restaurants", "30-min delivery", "Eat now, pay later"].map((feat) => (
                        <span
                          key={feat}
                          className="text-[10px] font-medium text-white/70 border border-white/20 rounded-full px-3 py-1"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
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
