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
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // รูปจาก supabase storage และ data URLs (สำหรับ preview)
      "img-src 'self' data: blob: https://*.supabase.co",
      // API calls และ WebSocket ไปที่ Supabase
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
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
