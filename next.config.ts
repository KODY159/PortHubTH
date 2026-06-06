import { withSentryConfig } from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const securityHeaders = [
  // ป้องกัน Clickjacking
  { key: "X-Frame-Options", value: "DENY" },

  // ป้องกัน MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },

  // ลด referrer info ที่ส่งไปยัง third-party
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // ป้องกัน browser caching sensitive pages
  { key: "X-DNS-Prefetch-Control", value: "on" },

  // CSP — บอก browser ว่าโหลด resource จากไหนได้บ้าง
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js ต้องการ unsafe-inline และ unsafe-eval สำหรับ dev
      // production ควรใช้ nonce แทน แต่ซับซ้อนกว่า
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // รูปจาก supabase storage และ data URLs (สำหรับ preview)
      "img-src 'self' data: blob: https://*.supabase.co",
      // API calls และ WebSocket ไปที่ Supabase
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.ingest.us.sentry.io",
      // PDF iframe
      "frame-src blob: https://*.supabase.co",
    ].join("; "),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // apply กับทุก route
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;

export default withSentryConfig(undefined, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "kody159",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
