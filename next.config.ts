import type { NextConfig } from "next";

// Next.js's default Cache-Control for statically-optimized pages is
// s-maxage=31536000 (1 year) — meant for a platform like Vercel that can
// selectively purge a CDN on deploy. We self-host behind plain Cloudflare
// with no such purge hook, so that header lets any edge node that caches a
// page keep serving it, unmodified, for up to a year regardless of how many
// times the site gets redeployed. Override it to a short, CDN-safe TTL for
// the actual page routes — _next/static assets are untouched and keep
// their own separate, genuinely-safe-to-cache-forever hashed-filename
// caching.
const noLongCache = {
  headers: [{ key: "Cache-Control", value: "public, max-age=0, s-maxage=60, must-revalidate" }],
};

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      { source: "/", ...noLongCache },
      { source: "/about", ...noLongCache },
      { source: "/infrastructure", ...noLongCache },
      { source: "/postmortems", ...noLongCache },
      { source: "/postmortems/:slug", ...noLongCache },
      { source: "/updates", ...noLongCache },
      { source: "/updates/:slug", ...noLongCache },
    ];
  },
};

export default nextConfig;
