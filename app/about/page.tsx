import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/app/components/ScrollReveal";

const STATS = [
  { value: "100+",  label: "Partner Restaurants" },
  { value: "30min", label: "Average Delivery"     },
  { value: "4.8★",  label: "App Store Rating"     },
  { value: "50k+",  label: "Orders Delivered"     },
];

const VALUES = [
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Quality First",
    body: "Every partner restaurant is vetted for food safety, packaging standards, and customer satisfaction before joining the platform.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "Speed & Reliability",
    body: "Our logistics network is optimized for Metro Manila and Cebu traffic patterns. Most orders arrive in under 35 minutes.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Built for Teams",
    body: "Group ordering, eat-now-pay-later corporate billing, and dedicated account managers for businesses with recurring needs.",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Local at Heart",
    body: "We prioritise homegrown restaurants and Filipino-owned businesses. Ordering here means directly supporting local livelihoods.",
  },
];

const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=1170&auto=format&fit=crop",
    alt: "Ramen bowl",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1682450871972-ab5ca641643d?q=80&w=600&auto=format&fit=crop",
    alt: "Sashimi",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1626082928501-8b0d4c82c61e?q=80&w=600&auto=format&fit=crop",
    alt: "Fried chicken",
    span: "",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1208] pt-28 pb-24">

      {/* ── Mission ──────────────────────────────────────────────── */}
      <section className="px-6 mb-28">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-5">About Foodie.ph</p>
            <h1 className="font-playfair text-[clamp(2.6rem,5.5vw,4.2rem)] font-bold leading-[1.04] tracking-tight mb-8 max-w-3xl">
              We believe great food<br />
              <em className="not-italic text-[#c8783a]">should reach everyone.</em>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
              <p className="text-[#1a1208]/55 text-base font-light leading-[1.9]">
                Foodie.ph started in 2022 as a small pilot in Cebu City — connecting three local restaurants with fifty hungry office workers. Today we operate across Metro Manila and Metro Cebu, with over 100 hand-picked partner restaurants and a growing community of corporate clients.
              </p>
              <p className="text-[#1a1208]/55 text-base font-light leading-[1.9]">
                We&apos;re not a faceless aggregator. Every restaurant on our platform is reviewed in person. Every rider is trained and insured. And every peso you spend here flows back into the local food economy you love.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="px-6 mb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 70}>
              <div className="text-center p-7 rounded-2xl bg-[#1a1208]/[0.03] hover:bg-[#1a1208]/[0.055] transition-colors duration-500">
                <div className="font-playfair text-[2.6rem] font-bold mb-1.5 text-[#c8783a] leading-none">{s.value}</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#1a1208]/45">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Photo mosaic ──────────────────────────────────────── */}
      <section className="px-6 mb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-3 grid-rows-2 gap-3 h-[400px]">
              {GALLERY.map((g) => (
                <div key={g.alt} className={`relative rounded-2xl overflow-hidden ${g.span}`}>
                  <Image src={g.src} alt={g.alt} fill className="object-cover" sizes="600px" />
                  <div className="absolute inset-0 bg-[#1a1208]/10" />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────── */}
      <section className="px-6 mb-28">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="mb-14">
              <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-[#1a1208]/40 mb-4">What We Stand For</p>
              <h2 className="font-playfair text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.07] tracking-tight">
                Our values in<br />
                <em className="not-italic text-[#c8783a]">plain language.</em>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 70}>
                <div className="rounded-[1.25rem] p-7 border border-[#1a1208]/[0.07] hover:border-[#1a1208]/[0.13] bg-white hover:-translate-y-0.5 transition-all duration-500">
                  <div className="w-9 h-9 rounded-xl bg-[#c8783a]/10 flex items-center justify-center text-[#c8783a] mb-5 flex-shrink-0">
                    {v.icon}
                  </div>
                  <h3 className="font-playfair text-[1.15rem] font-semibold mb-2.5 leading-snug">{v.title}</h3>
                  <p className="text-sm text-[#1a1208]/50 font-light leading-[1.8]">{v.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark CTA ──────────────────────────────────────────────── */}
      <section className="px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="bg-[#1a1208] rounded-[2rem] px-12 py-16 text-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
              />
              <div className="relative">
                <p className="text-[9px] uppercase tracking-[0.24em] font-medium text-white/30 mb-5">Get Started</p>
                <h2 className="font-playfair text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.07] text-white mb-5">
                  Ready to eat well?
                </h2>
                <p className="text-white/40 text-sm font-light mb-10 max-w-sm mx-auto leading-[1.8]">
                  Join thousands of food lovers across the Philippines ordering smarter every day.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/auth?tab=signup"
                    className="group flex items-center gap-2.5 bg-[#c8783a] text-white rounded-full px-8 py-3.5 text-sm font-medium hover:bg-[#b5692e] transition-colors duration-300"
                  >
                    Create an Account
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">↗</span>
                  </Link>
                  <Link
                    href="/auth"
                    className="text-white/40 text-sm font-medium hover:text-white transition-colors duration-300 underline underline-offset-4"
                  >
                    Already a member?
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}