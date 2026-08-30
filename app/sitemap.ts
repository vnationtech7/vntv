// @ts-nocheck
import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/video`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  // Fetch published articles
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, published_at, updated_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(1000);

  const articlePages: MetadataRoute.Sitemap =
    articles?.map((article) => ({
      url: `${siteUrl}/news/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })) || [];

  // Fetch published videos
  const { data: videos } = await supabase
    .from("videos")
    .select("slug, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1000);

  const videoPages: MetadataRoute.Sitemap =
    videos?.map((video) => ({
      url: `${siteUrl}/video/${video.slug}`,
      lastModified: new Date(video.updated_at || video.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug")
    .eq("is_active", true)
    .is("parent_id", null);

  const categoryPages: MetadataRoute.Sitemap =
    categories?.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })) || [];

  return [...staticPages, ...articlePages, ...videoPages, ...categoryPages];
}
