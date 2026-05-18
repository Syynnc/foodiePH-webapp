import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // Supabase storage resolves via NAT64 which Next.js blocks as a private IP;
    // disabling the optimizer serves the URL directly and bypasses the check.
    unoptimized: true,
  },
};
 
export default nextConfig;
 