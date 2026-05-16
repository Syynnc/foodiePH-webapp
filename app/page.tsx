"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ScrollReveal } from "./components/ScrollReveal";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

const CATEGORIES = [
  { label: "Ramen & Noodles", count: "38 spots", img: "https://images.unsplash.com/photo-1638866281450-3933540af86a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tint: "rgba(180,90,30,0.15)" },
  { label: "Sushi & Japanese", count: "24 spots", img: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tint: "rgba(80,130,100,0.12)" },
  { label: "Tacos & Mexican", count: "19 spots", img: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=1194&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tint: "rgba(200,140,40,0.12)" },
  { label: "Pizza & Italian", count: "31 spots", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tint: "rgba(180,60,40,0.12)" },
  { label: "Healthy Bowls", count: "27 spots", img: "https://images.unsplash.com/photo-1602881917445-0b1ba001addf?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tint: "rgba(60,140,80,0.12)" },
  { label: "Burgers", count: "42 spots", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=999&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tint: "rgba(160,100,40,0.12)" },
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
      className={`z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-white/60 flex items-center gap-3 hover:cursor-none">
        <div className="w-9 h-9 rounded-xl bg-[#c8783a]/12 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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
    { name: "Dagooc A.", order: "Tonkotsu Ramen", time: "2 min ago" },
    { name: "Cabilla D.", order: "Salmon Sushi Set", time: "4 min ago" },
    { name: "Riobuya N.", order: "3× Street Tacos", time: "7 min ago" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % items.length), 3000);
    return () => clearInterval(iv);
  }, [items.length]);
  const item = items[idx];
  return (
    <div className="z-10">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-white/60 w-52 overflow-hidden hover:cursor-none">
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
  return (
    <div className="relative min-h-[100dvh] bg-[#FDFBF7] text-[#1a1208]">

      <Navbar />

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

          {/* Floating UI badges — positioned from the outer 6xl container so they
              sit in the ~240px gutter on each side of the 2xl text column */}
          <div className="absolute left-4 top-52 hidden xl:block z-10 w-max">
            <DeliveryBadge />
          </div>
          <div className="absolute right-4 top-72 hidden xl:block z-10 w-max">
            <OrderTicker />
          </div>

          <div className="max-w-2xl relative flex flex-col items-center">

            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[#1a1208]/12 bg-white/70 backdrop-blur-sm px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8783a]" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1208]/60 hover:cursor-none">
                Food Delivery · Philippines
              </span>
            </div>

            <h1 className="font-playfair animate-fade-up delay-100 text-[clamp(2.1rem,6vw,5rem)] font-bold leading-[1.06] tracking-tight mb-6">
              Cravings delivered<br />
              <span className="italic text-[#c8783a]">right to your door.</span>
            </h1>

            <p className="animate-fade-up delay-200 text-lg leading-8 text-[#1a1208]/60 font-light mb-10 max-w-md mx-auto">
              From ramen to sushi, tacos to pizza — order from 100+ local restaurants and get fresh food delivered fast.
            </p>

            {/* CTA buttons */}
            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
              <Link
                href="/auth?tab=signup"
                className="group w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-[#1a1208] text-[#FDFBF7] px-8 py-4 text-[13px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#c8783a] active:scale-[0.98] shadow-[0_8px_28px_rgba(26,18,8,0.22)]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Order Now
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/restaurants"
                className="group w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#1a1208]/10 text-[#1a1208]/70 px-7 py-4 text-[13px] font-semibold transition-all duration-300 hover:border-[#1a1208]/25 hover:text-[#1a1208] hover:bg-white active:scale-[0.98] shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Browse Restaurants
              </Link>
            </div>
            <p className="animate-fade-up delay-400 text-xs text-[#1a1208]/35 mt-3">Free to join · No subscription required</p>

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
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-[#1a1208]/50">4.8 App Store</span>
              </div>
            </div>

            {/* Inline badge strip — visible on md through lg, hidden at xl where badges float */}
            <div className="animate-fade-up delay-500 hidden md:flex xl:hidden items-center justify-center gap-3 mt-6 flex-wrap">
              {/* Delivery time pill */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-white/60 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#c8783a]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1a1208] leading-tight">25–35 min delivery</p>
                  <p className="text-[10px] text-[#1a1208]/50 leading-tight">Your area is covered</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5 flex-shrink-0" style={{ animation: "pulse 2s infinite" }} />
              </div>
              {/* Live orders pill */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-white/60 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#c8783a]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l19-9-9 19-2-8-8-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1a1208] leading-tight">Orders flying in</p>
                  <p className="text-[10px] text-[#1a1208]/50 leading-tight">Live in your area</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5 flex-shrink-0" style={{ animation: "pulse 2s infinite" }} />
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

      {/* ── What's Trending ── */}
      <section id="menu" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">

          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] font-semibold text-[#c8783a] mb-3">
                  What&apos;s Trending
                </p>
                <h2 className="font-playfair text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.03] tracking-tight">
                  Every craving,{" "}
                  <em className="not-italic text-[#c8783a]">covered.</em>
                </h2>
              </div>
              <Link href="/restaurants" className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a1208]/40 hover:text-[#c8783a] transition-colors duration-300 self-start sm:self-end">
                Browse all
                <span className="w-6 h-6 rounded-full border border-[#1a1208]/12 flex items-center justify-center text-[#1a1208]/30 group-hover:bg-[#c8783a] group-hover:border-[#c8783a] group-hover:text-white transition-all duration-400">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                </span>
              </Link>
            </div>
          </ScrollReveal>

          {/* Editorial list + single hero image */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

            {/* Category list */}
            <div className="flex-1 divide-y divide-[#1a1208]/[0.06]">
              {CATEGORIES.map((cat, i) => (
                <ScrollReveal key={cat.label} delay={i * 40}>
                  <a href="#" className="group relative flex items-center gap-4 md:gap-6 py-5 px-3 -mx-3 rounded-2xl hover:bg-[#1a1208]/[0.025] transition-all duration-400">
                    <span className="absolute left-0 top-4 bottom-4 w-[2px] bg-[#c8783a] opacity-0 group-hover:opacity-100 rounded-full transition-all duration-400" />
                    <span className="font-playfair text-[0.9rem] font-bold text-[#c8783a]/25 w-8 flex-shrink-0 select-none group-hover:text-[#c8783a]/55 transition-colors duration-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-playfair text-[1.3rem] md:text-[1.5rem] font-semibold text-[#1a1208] flex-1 leading-snug">
                      {cat.label}
                    </h3>
                    <div className="hidden md:block flex-1 h-px bg-[#1a1208]/[0.06] group-hover:bg-[#c8783a]/20 transition-colors duration-400" />
                    {/* Thumbnail slides in on hover — desktop only */}
                    <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 hidden md:block">
                      <Image src={cat.img} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <span className="text-[11px] font-medium text-[#1a1208]/30 flex-shrink-0 hidden sm:block tabular-nums group-hover:text-[#1a1208]/55 transition-colors duration-300">
                      {cat.count}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-[#1a1208]/[0.08] flex items-center justify-center text-[#1a1208]/25 flex-shrink-0 group-hover:bg-[#c8783a] group-hover:border-[#c8783a] group-hover:text-white transition-all duration-400">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>

            {/* Single hero image — desktop only */}
            <ScrollReveal className="hidden md:block flex-shrink-0">
              <div className="relative w-[260px] rounded-[1.75rem] overflow-hidden h-[480px]">
                <Image src={CATEGORIES[2].img} alt="" fill className="object-cover" sizes="260px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/80 via-[#1a1208]/15 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-white/55 border border-white/15 rounded-full px-2.5 py-1 mb-3 backdrop-blur-sm bg-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8783a]" />
                    Most ordered
                  </span>
                  <p className="font-playfair text-[1.55rem] font-bold text-white leading-tight">{CATEGORIES[2].label}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Fresh From Our Partners ── */}
      <section id="about" className="py-24" style={{ background: "#F5EDE0" }}>
        <div className="max-w-6xl mx-auto px-6">

          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-[9px] uppercase tracking-[0.26em] font-semibold text-[#1a1208]/40 mb-4">
                  Fresh From Our Partners
                </p>
                <h2 className="font-playfair text-[clamp(2.4rem,4.5vw,3.8rem)] font-bold leading-[1.04] tracking-tight text-[#1a1208]">
                  Handpicked.<br />
                  <em className="not-italic text-[#c8783a]">Every day.</em>
                </h2>
              </div>
              <p className="text-[13.5px] text-[#1a1208]/45 font-light max-w-[220px] leading-[1.85] self-start sm:self-end sm:mb-1">
                Locally sourced. Prepared fresh each day by our partner kitchens.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-[5fr_3fr] gap-8 md:gap-14 items-start">

            {/* Curated dish list */}
            <div>
              {[
                { dish: "Tonkotsu Ramen", partner: "Early Bird", desc: "Slow-cooked 12-hour pork broth, chashu, soft egg, bamboo shoots" },
                { dish: "Salmon Sashimi Set", partner: "Manam", desc: "Same-day catch from Batangas, yuzu ponzu, microgreens" },
                { dish: "Chicken Inasal", partner: "Mang Inasal", desc: "Char-grilled over coconut husks, annatto baste, sinangag rice" },
                { dish: "Truffle Burrata Pizza", partner: "Wildflour", desc: "Wild mushroom, black truffle oil, fresh arugula, aged parmesan" },
                { dish: "Kare-Kare", partner: "Aristocrat", desc: "Slow-braised oxtail, bagoong, ground peanut sauce, banana blossom" },
              ].map((item, i) => (
                <ScrollReveal key={item.dish} delay={i * 55}>
                  <div className="group flex items-start gap-5 py-5 border-b border-[#1a1208]/[0.07] last:border-b-0 cursor-pointer -mx-3 px-3 rounded-xl hover:bg-[#1a1208]/[0.025] transition-colors duration-300">
                    <span className="font-playfair text-[0.85rem] font-bold text-[#c8783a]/30 w-6 flex-shrink-0 mt-1 select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                        <h3 className="font-playfair text-[1.2rem] font-bold text-[#1a1208] leading-tight">{item.dish}</h3>
                        <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#1a1208]/35">{item.partner}</span>
                      </div>
                      <p className="text-[12.5px] text-[#1a1208]/40 font-light leading-[1.7]">{item.desc}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full border border-[#1a1208]/[0.07] flex items-center justify-center text-[#1a1208]/20 flex-shrink-0 mt-0.5 group-hover:bg-[#c8783a] group-hover:border-[#c8783a] group-hover:text-white transition-all duration-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
              <ScrollReveal delay={310}>
                <div className="mt-8">
                  <Link href="/menu" className="group inline-flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#1a1208] hover:text-[#c8783a] transition-colors duration-300">
                    View full menu
                    <svg className="transition-transform duration-300 group-hover:translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* Single accent image — desktop only */}
            <ScrollReveal className="hidden md:block">
              <div className="relative rounded-[1.75rem] overflow-hidden h-[500px]">
                <Image src={GALLERY[0].src} alt="" fill className="object-cover" sizes="35vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/55 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/50 mb-1.5">Featured today</p>
                  <p className="font-playfair text-white text-[1.2rem] font-bold leading-tight">{GALLERY[0].alt}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="deals" className="px-6 py-28" style={{ background: "#F2E8D9" }}>
        <div className="max-w-6xl mx-auto">

          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20">
              <div>
                <p className="text-[9px] uppercase tracking-[0.26em] font-semibold text-[#1a1208]/35 mb-4">
                  How It Works
                </p>
                <h2 className="font-playfair text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.03] text-[#1a1208]">
                  Three steps to<br />
                  <em className="not-italic text-[#c8783a]">your front door.</em>
                </h2>
              </div>
              <p className="text-[13.5px] text-[#1a1208]/45 font-light max-w-[260px] leading-[1.9]">
                From browsing to biting — the whole experience takes less than two minutes.
              </p>
            </div>
          </ScrollReveal>

          {/* Vertical timeline — no images */}
          <div className="relative max-w-2xl">
            {/* Vertical connector */}
            <div className="absolute left-7 top-7 bottom-16 w-px bg-[#1a1208]/10 hidden md:block pointer-events-none" />

            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 100}>
                <div className="flex gap-6 md:gap-10 pb-14 last:pb-0">
                  {/* Numbered circle */}
                  <div
                    className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                    style={{
                      background: i === 0 ? "#c8783a" : "rgba(26,18,8,0.06)",
                      boxShadow: i === 0 ? "0 8px 24px rgba(200,120,58,0.28)" : "none",
                    }}
                  >
                    <span className={`font-playfair text-[1.05rem] font-bold ${i === 0 ? "text-white" : "text-[#1a1208]/35"}`}>{step.n}</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-playfair text-[1.7rem] font-bold text-[#1a1208] leading-tight">{step.title}</h3>
                      {i === 0 && (
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#c8783a] border border-[#c8783a]/25 rounded-full px-2.5 py-1">
                          Start here
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-[#1a1208]/45 font-light leading-[1.9] max-w-[380px]">{step.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Feature tags */}
          <ScrollReveal delay={320}>
            <div className="mt-16 pt-12 border-t border-[#1a1208]/10 flex flex-wrap gap-2.5">
              {["Fast checkout", "Live order tracking", "Multiple payment methods", "Corporate billing", "Free first delivery"].map((tag) => (
                <span key={tag} className="text-[11px] font-medium text-[#1a1208]/45 border border-[#1a1208]/12 rounded-full px-4 py-2 hover:border-[#c8783a]/40 hover:text-[#c8783a] transition-all duration-300 cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Start Ordering ── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="relative rounded-[2rem] overflow-hidden bg-[#1a1208]">
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
              />
              <div className="relative grid grid-cols-1 lg:grid-cols-[3fr_2fr]">

                {/* Left: headline + CTA */}
                <div className="px-10 py-16 md:px-16 md:py-20 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                  <p className="text-[9px] uppercase tracking-[0.26em] font-semibold text-[#c8783a] mb-6">Start Ordering</p>
                  <h2 className="font-playfair text-[clamp(2.6rem,5vw,4.4rem)] font-bold leading-[1.04] tracking-tight text-white mb-6">
                    Hungry right now?<br />
                    <em className="not-italic text-[#c8783a]">We&apos;ve got you.</em>
                  </h2>
                  <p className="text-white/40 text-[14px] font-light leading-[1.9] mb-10 max-w-[340px]">
                    Join thousands of food lovers across Metro Manila and Cebu getting fresh meals delivered daily.
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
                    <Link
                      href="/auth?tab=signup"
                      className="group inline-flex items-center gap-3 rounded-full bg-[#c8783a] text-white px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#b5692e] active:scale-[0.98] shadow-[0_8px_28px_rgba(200,120,58,0.32)]"
                    >
                      Get Started Free
                      <svg className="transition-transform duration-300 group-hover:translate-x-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </Link>
                    <Link href="/auth" className="text-white/35 text-[13px] font-medium hover:text-white/65 transition-colors duration-300 underline underline-offset-4">
                      Sign in instead
                    </Link>
                  </div>
                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2">
                    {["100+ Restaurants", "30-min delivery", "Corporate billing"].map((feat) => (
                      <span key={feat} className="text-[10px] font-medium text-white/40 border border-white/12 rounded-full px-3 py-1.5">{feat}</span>
                    ))}
                  </div>
                </div>

                {/* Right: proof stats */}
                <div className="px-10 py-16 md:px-12 md:py-20 flex flex-col justify-center">
                  <div className="divide-y divide-white/[0.06]">
                    {[
                      { stat: "100+", label: "Restaurant partners across PH" },
                      { stat: "30 min", label: "Average delivery time" },
                      { stat: "50k+", label: "Orders placed this month" },
                      { stat: "4.8", label: "Average customer rating" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-5 py-5 first:pt-0 last:pb-0">
                        <span className="font-playfair text-[1.9rem] font-bold text-[#c8783a] leading-none w-24 flex-shrink-0 tabular-nums">{item.stat}</span>
                        <span className="text-[13px] text-white/38 font-light leading-snug">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}