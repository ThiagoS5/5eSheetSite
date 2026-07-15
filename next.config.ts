import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy for a fully client-side app.
 *
 * - `script-src` keeps `'unsafe-inline'` because Next.js injects inline bootstrap
 *   scripts without a nonce; `'wasm-unsafe-eval'` is required because react-pdf's
 *   layout engine (yoga-layout) instantiates WebAssembly in the browser to build
 *   the PDF. `'unsafe-eval'` is added only in dev for Turbopack/React Fast Refresh.
 * - `style-src` allows inline styles used by Tailwind and EasyMDE.
 * - `img-src` allows the D&D art CDN plus `data:`/`blob:` (portraits, generated PDF).
 * - `frame-ancestors 'none'` blocks clickjacking; `object-src 'none'` and
 *   `base-uri 'self'` close classic injection vectors.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.5e.tools",
  "font-src 'self' data:",
  // react-pdf fetches embedded assets (fonts/images) as `data:`/`blob:` URIs.
  `connect-src 'self' data: blob:${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "frame-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // HSTS is only meaningful over HTTPS; harmless on localhost (browsers ignore it there).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.5e.tools",
        pathname: "/2024/img/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
