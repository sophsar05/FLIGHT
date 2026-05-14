import type { NextConfig } from 'next'

const securityHeaders = [
  // Prevent browsers from MIME-sniffing a response away from declared content-type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent page from being embedded in an iframe (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Only send origin in Referer header, strip path/query
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features this app does not use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Force HTTPS for 2 years (set after confirming HTTPS is stable on prod)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Basic XSS filter for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
