import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/auth/callback",
          "/settings",
          "/profile",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
