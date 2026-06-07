import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Sarabun } from "next/font/google";
import { Playfair_Display } from "next/font/google";

const sarabun = Sarabun({
  subsets: ["thai", "latin"], // ← สำคัญ ต้องใส่ "thai"
  weight: ["300", "400", "500", "600"],
  variable: "--font-sarabun",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://porthubth.com"),

  title: {
    default: "PortHubTH",
    template: "%s | PortHubTH",
  },

  description: "แพลตฟอร์มแชร์ Portfolio สำหรับนักเรียนไทย",

  openGraph: {
    siteName: "PortHubTH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PortHubTH",
    url: "https://porthubth.com",
    description: "รวม Portfolio จากนักเรียนที่ยื่นเข้ามหาวิทยาลัยไทย",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://porthubth.com/browse?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="th" className={`${sarabun.variable} ${playfair.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
