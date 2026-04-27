import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";

const STATS = [
  { value: "100+", label: "Partner Restaurants" },
  { value: "30min", label: "Avg. Delivery" },
  { value: "4.8", label: "Star Rating" },
  { value: "50k+", label: "Orders Delivered" },
];

const VALUES = [
  {
    number: "01",
    title: "Quality First",
    body: "Every partner restaurant is vetted for food safety, packaging standards, and customer satisfaction before joining the platform.",
  },
  {
    number: "02",
    title: "Speed & Reliability",
    body: "Our logistics network is optimized for Metro Manila and Cebu traffic patterns. Most orders arrive in under 35 minutes.",
  },
  {
    number: "03",
    title: "Built for Teams",
    body: "Group ordering, eat-now-pay-later corporate billing, and dedicated account managers for businesses with recurring needs.",
  },
  {
    number: "04",
    title: "Local at Heart",
    body: "We prioritize homegrown restaurants and Filipino-owned businesses. Every peso you spend here flows back into the local food economy.",
  },
];

const TIMELINE = [
  { year: "2022", event: "Founded in Cebu City with 3 restaurants and 50 users." },
  { year: "2023", event: "Expanded to Metro Manila. Crossed 10,000 active users." },
  { year: "2024", event: "Launched corporate billing and group ordering features." },
  { year: "2025", event: "Crossed 100 partner restaurants and 50,000 orders delivered." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FDFBF7] text-[#1a1208]">

        {/* ── Hero — asymmetric split ── */}
        <section className="pt-32 pb-20 px-6 md:px-10 lg:px-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_460px] gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] font-medium text-[#1a1208]/40 mb-6 animate-fade-up">
                About Foodie.ph
              </p>
              <h1 className="font-playfair text-[clamp(2.8rem,5.5vw,4.8rem)] font-bold leading-[1.04] tracking-tight mb-8 animate-fade-up delay-100">
                We believe great food<br />
                <em className="not-italic text-[#c8783a]">should reach everyone.</em>
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-up delay-200">
                <p className="text-[#1a1208]/55 text-base font-light leading-[1.9]">
                  Foodie.ph started in 2022 as a small pilot in Cebu City — connecting three local restaurants with fifty hungry office workers. Today we operate across Metro Manila and Metro Cebu, with over 100 hand-picked partner restaurants and a growing community of corporate clients.
                </p>
                <p className="text-[#1a1208]/55 text-base font-light leading-[1.9]">
                  We&apos;re not a faceless aggregator. Every restaurant on our platform is reviewed in person. Every rider is trained and insured. And every peso you spend here flows back into the local food economy you love.
                </p>
              </div>
            </div>

            <div className="relative h-[460px] md:h-[540px] rounded-[2rem] overflow-hidden animate-fade-in delay-300 img-shimmer">
              <Image
                src="https://picsum.photos/seed/foodieph-hero/880/1080"
                alt="Beautifully plated Filipino food"
                fill
                className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 460px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/55 via-[#1a1208]/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-[#FDFBF7]/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(26,18,8,0.14),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-playfair text-[2rem] font-bold text-[#c8783a] leading-none">50k+</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#1a1208]/45 mt-1">Happy orders</p>
                  </div>
                  <div className="w-px h-10 bg-[#1a1208]/10" />
                  <div>
                    <p className="font-playfair text-[2rem] font-bold text-[#1a1208] leading-none">100+</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#1a1208]/45 mt-1">Restaurants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className="border-t border-b border-[#1a1208]/[0.06]">
          <ScrollReveal>
            <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#1a1208]/[0.06]">
              {STATS.map((s) => (
                <div key={s.label} className="py-10 px-6 flex flex-col items-center text-center">
                  <span className="font-playfair text-[3rem] font-bold text-[#c8783a] leading-none mb-2">{s.value}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#1a1208]/40">{s.label}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── Photo mosaic ── */}
        <section className="py-24 px-6 md:px-10 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-3 grid-rows-2 gap-3 h-[400px] md:h-[480px]">
                <div className="relative col-span-2 row-span-2 rounded-[1.5rem] overflow-hidden img-shimmer">
                  <Image
                    src="https://picsum.photos/seed/foodph-main/1000/800"
                    alt="Feature food dish"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                    sizes="(max-width: 768px) 66vw, 660px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/45 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <span className="text-white text-[11px] font-semibold bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">Metro Manila</span>
                  </div>
                </div>
                <div className="relative rounded-[1.5rem] overflow-hidden img-shimmer">
                  <Image
                    src="https://picsum.photos/seed/foodph-sushi/600/400"
                    alt="Fresh sashimi platter"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.06]"
                    sizes="(max-width: 768px) 33vw, 300px"
                  />
                  <div className="absolute inset-0 bg-[#1a1208]/12" />
                </div>
                <div className="relative rounded-[1.5rem] overflow-hidden img-shimmer">
                  <Image
                    src="https://picsum.photos/seed/foodph-grill/600/400"
                    alt="Grilled specialty"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.06]"
                    sizes="(max-width: 768px) 33vw, 300px"
                  />
                  <div className="absolute inset-0 bg-[#1a1208]/12" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-white text-[11px] font-semibold bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">Metro Cebu</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Values — numbered rows ── */}
        <section className="py-16 px-6 md:px-10 lg:px-16" style={{ background: "rgba(26,18,8,0.018)" }}>
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.28em] font-medium text-[#1a1208]/40 mb-4">What We Stand For</p>
                  <h2 className="font-playfair text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.06] tracking-tight">
                    Our values in<br />
                    <em className="not-italic text-[#c8783a]">plain language.</em>
                  </h2>
                </div>
                <p className="text-[#1a1208]/40 text-sm font-light leading-relaxed max-w-xs md:text-right">
                  Four principles that shape how we operate, hire, and grow — from our team in Cebu to every rider on the road.
                </p>
              </div>
            </ScrollReveal>

            <div className="divide-y divide-[#1a1208]/[0.07]">
              {VALUES.map((v, i) => (
                <ScrollReveal key={v.title} delay={i * 60}>
                  <div className="group grid grid-cols-1 md:grid-cols-[72px_1fr_1fr] gap-3 md:gap-10 py-9 hover:bg-[#1a1208]/[0.025] transition-all duration-500 rounded-2xl px-3 -mx-3">
                    <span className="font-playfair text-[2.2rem] font-bold text-[#c8783a]/35 leading-none pt-0.5 hidden md:block group-hover:text-[#c8783a]/55 transition-colors duration-500">
                      {v.number}
                    </span>
                    <h3 className="font-playfair text-[1.15rem] font-bold leading-snug text-[#1a1208] self-start pt-0.5">
                      {v.title}
                    </h3>
                    <p className="text-sm text-[#1a1208]/50 font-light leading-[1.85]">
                      {v.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="py-24 px-6 md:px-10 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <p className="text-[9px] uppercase tracking-[0.28em] font-medium text-[#1a1208]/40 mb-4">Our Story</p>
              <h2 className="font-playfair text-[clamp(1.8rem,3.5vw,3rem)] font-bold leading-[1.07] tracking-tight mb-14">
                From Cebu to the country,<br />
                <em className="not-italic text-[#c8783a]">one order at a time.</em>
              </h2>
            </ScrollReveal>

            <div className="relative">
              <div className="absolute left-[3px] md:left-1/2 top-0 bottom-0 w-px bg-[#1a1208]/[0.08] md:-translate-x-px hidden sm:block" />
              <div className="flex flex-col gap-0">
                {TIMELINE.map((t, i) => (
                  <ScrollReveal key={t.year} delay={i * 80}>
                    <div className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10 py-8 ${i % 2 === 0 ? "sm:flex-row-reverse sm:text-right" : ""}`}>
                      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#c8783a] ring-4 ring-[#FDFBF7]" />
                      <div className={`sm:w-1/2 ${i % 2 === 0 ? "sm:pr-14" : "sm:pl-14"}`}>
                        <span className="font-playfair text-[2rem] font-bold text-[#c8783a]/50 leading-none block mb-2">{t.year}</span>
                        <p className="text-sm text-[#1a1208]/55 font-light leading-[1.8]">{t.event}</p>
                      </div>
                      <div className="sm:w-1/2" />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Dark CTA ── */}
        <section className="pb-24 px-6 md:px-10 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="bg-[#1a1208] rounded-[2rem] px-10 md:px-16 py-16 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
                />
                <div
                  className="absolute -top-28 -right-28 w-80 h-80 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(200,120,58,0.22) 0%, transparent 70%)" }}
                />
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                  <div className="flex-1">
                    <p className="text-[9px] uppercase tracking-[0.28em] font-medium text-white/30 mb-5">Get Started</p>
                    <h2 className="font-playfair text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.06] text-white mb-4">
                      Ready to eat well?
                    </h2>
                    <p className="text-white/40 text-sm font-light leading-[1.85] max-w-sm">
                      Join thousands of food lovers across the Philippines ordering smarter every day.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 flex-shrink-0">
                    <Link
                      href="/auth?tab=signup"
                      className="flex items-center justify-center gap-2.5 bg-[#c8783a] text-white rounded-full px-8 py-4 text-sm font-semibold hover:bg-[#b5692e] transition-colors duration-300 active:scale-[0.98]"
                    >
                      Create an Account
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs leading-none">↗</span>
                    </Link>
                    <Link
                      href="/auth"
                      className="text-center text-white/35 text-sm font-medium hover:text-white/70 transition-colors duration-300"
                    >
                      Already a member?
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
