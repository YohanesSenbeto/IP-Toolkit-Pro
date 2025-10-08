import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

// Temporary relaxation note:
// The initial strict production CSP blocked essential Next.js bootstrap inline scripts/styles.
// We add 'unsafe-inline' for now to restore functionality. Plan: replace with nonce & hashes.
// Set RELAX_CSP=false (default) to use this relaxed policy until nonce implementation lands.
// When nonce-based CSP is ready, remove 'unsafe-inline' below.
const prodCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // TODO: implement nonce/hashes then drop 'unsafe-inline'
  "style-src 'self' 'unsafe-inline'",  // TODO: move critical inline to CSS files or hash them
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-ancestors 'self'",
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
];

// Dev: allow inline to unblock Next.js dev overlays, style injection & hot reload; still scoped to self for external resources.
const devCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: ws: wss:",
  "frame-ancestors 'self'",
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
];

const ContentSecurityPolicy = (isDev ? devCSP : prodCSP).join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
