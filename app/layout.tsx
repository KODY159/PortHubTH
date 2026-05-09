import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portbaseth.com"),

  title: {
    default: "PortBaseTH",
    template: "%s | PortBaseTH",
  },

  description: "แพลตฟอร์มแชร์ Portfolio สำหรับนักเรียนไทย",

  openGraph: {
    siteName: "PortBaseTH",
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
    name: "PortBaseTH",
    url: "https://portbaseth.com",
    description: "รวม Portfolio จากนักเรียนที่ยื่นเข้ามหาวิทยาลัยไทย",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://portbaseth.com/browse?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="th">
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
