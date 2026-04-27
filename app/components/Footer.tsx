import Link from "next/link";

const NAV = [
  { label: "Menu", href: "/menu" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Deals", href: "/deals" },
  { label: "About", href: "/about" },
];

const COMPANY = [
  { label: "Our Story", href: "/about" },
  { label: "Careers", href: "#" },
  { label: "Press", href: "#" },
  { label: "Blog", href: "#" },
];

const SUPPORT = [
  { label: "Help Center", href: "#" },
  { label: "Corporate Accounts", href: "/auth?tab=signup" },
  { label: "Partner With Us", href: "/auth?tab=signup" },
  { label: "Contact Us", href: "#" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#FDFBF7] border-t border-[#1a1208]/[0.07]">

      {/* ── Main grid ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 lg:gap-8">

        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <span className="font-playfair text-[1.35rem] font-bold tracking-tight text-[#1a1208]">
              Foodie<span className="text-[#c8783a]">.ph</span>
            </span>
          </Link>
          <p className="text-[13.5px] text-[#1a1208]/45 font-light leading-[1.85] max-w-[240px] mb-7">
            Premium corporate food delivery across Metro Manila and Metro Cebu. 100+ partner restaurants, built for teams.
          </p>

          {/* Locations */}
          <div className="flex flex-col gap-2.5 mb-7">
            <div className="flex items-start gap-2.5">
              <svg width="13" height="13" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[12px] text-[#1a1208]/45 font-light leading-snug">Metro Manila, Philippines</span>
            </div>
            <div className="flex items-start gap-2.5">
              <svg width="13" height="13" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[12px] text-[#1a1208]/45 font-light leading-snug">Metro Cebu, Philippines</span>
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {[
              {
                label: "Instagram",
                href: "#",
                icon: (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                ),
              },
              {
                label: "Facebook",
                href: "#",
                icon: (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                ),
              },
              {
                label: "TikTok",
                href: "#",
                icon: (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                ),
              },
              {
                label: "LinkedIn",
                href: "#",
                icon: (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                ),
              },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 rounded-full border border-[#1a1208]/[0.09] flex items-center justify-center text-[#1a1208]/40 hover:text-[#c8783a] hover:border-[#c8783a]/30 transition-all duration-300"
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#1a1208]/35 mb-5">Explore</p>
          <ul className="flex flex-col gap-3">
            {NAV.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[13.5px] text-[#1a1208]/55 font-light hover:text-[#1a1208] transition-colors duration-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#1a1208]/35 mb-5">Company</p>
          <ul className="flex flex-col gap-3">
            {COMPANY.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[13.5px] text-[#1a1208]/55 font-light hover:text-[#1a1208] transition-colors duration-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#1a1208]/35 mb-5">Support</p>
          <ul className="flex flex-col gap-3">
            {SUPPORT.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[13.5px] text-[#1a1208]/55 font-light hover:text-[#1a1208] transition-colors duration-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Email */}
          <div className="mt-7 flex items-center gap-2.5">
            <svg width="13" height="13" fill="none" stroke="#c8783a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a
              href="mailto:hello@foodie.ph"
              className="text-[12px] text-[#1a1208]/45 font-light hover:text-[#c8783a] transition-colors duration-300"
            >
              hello@foodie.ph
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="border-t border-[#1a1208]/[0.06]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11.5px] text-[#1a1208]/30 font-light">
            © {year} Foodie.ph — All rights reserved.
          </p>

          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[11px] text-[#1a1208]/30 font-light">Operating in Metro Manila &amp; Metro Cebu</span>
          </div>

          <div className="flex items-center gap-5">
            {LEGAL.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[11.5px] text-[#1a1208]/30 font-light hover:text-[#1a1208]/60 transition-colors duration-300"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
