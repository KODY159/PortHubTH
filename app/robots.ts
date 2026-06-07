import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/uploadpage", "/saved"], // หน้า private
    },
    sitemap: "https://porthubth.com/sitemap.xml",
  };
}
