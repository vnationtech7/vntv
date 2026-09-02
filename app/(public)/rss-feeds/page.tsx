import { PublicLayout } from "@/components/layout";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "RSS Feeds - VNTV",
  description: "Browse all approved RSS feeds from trusted sources",
};

interface RssFeedsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

async function getApprovedRssItems(categorySlug?: string) {
  const supabase = await createClient();

  // First, get category ID if filtering by category
  let categoryId: string | undefined;
  if (categorySlug && categorySlug !== "all") {
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .limit(1);
    
    if (categories && categories.length > 0) {
      categoryId = (categories[0] as { id: string }).id;
    }
  }

  // Build the query
  let query = supabase
    .from("rss_items")
    .select(`
      id,
      title,
      description,
      url,
      image_url,
      author,
      published_at,
      feed:rss_feeds!inner(
        id, 
        name, 
        source_name,
        category_id,
        category:categories(id, name, slug)
      )
    `)
    .eq("status", "approved")
    .not("published_at", "is", null);

  // Filter by category if provided
  if (categoryId) {
    query = query.eq("feed.category_id", categoryId);
  }

  const { data, error } = await query
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching RSS items:", error);
    return [];
  }

  return data || [];
}

async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export default async function RssFeedsPage({ searchParams }: RssFeedsPageProps) {
  const { category } = await searchParams;
  const [rssItems, categories] = await Promise.all([
    getApprovedRssItems(category),
    getCategories(),
  ]);

  const selectedCategory = category || "all";

  return (
    <PublicLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-wide mb-2">
            <span className="w-1 h-6 bg-[--red] rounded-sm" />
            RSS FEEDS
          </h1>
          <p className="text-[--muted]">
            Latest news from trusted sources around Africa
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-6 border-b border-[--border]">
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-px scrollbar-hide">
            <Link
              href="/rss-feeds"
              className={`px-4 py-2 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
                selectedCategory === "all"
                  ? "text-[--red] border-[--red]"
                  : "text-[--muted] border-transparent hover:text-[--text] hover:border-[--border]"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/rss-feeds?category=${cat.slug}`}
                className={`px-4 py-2 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
                  selectedCategory === cat.slug
                    ? "text-[--red] border-[--red]"
                    : "text-[--muted] border-transparent hover:text-[--text] hover:border-[--border]"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* RSS Items Grid */}
        {rssItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[--muted-2]">
              {selectedCategory === "all" 
                ? "No RSS feeds available at the moment."
                : `No RSS items found in ${categories.find(c => c.slug === selectedCategory)?.name || "this category"}.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rssItems.map((item) => (
              <Link
                key={item.id}
                href={`/rss/${item.id}`}
                className="group bg-[--panel] border border-[--border] rounded-lg overflow-hidden hover:border-[--red] transition-all hover:shadow-lg"
              >
                {/* Image */}
                {item.image_url && (
                  <div className="relative aspect-video bg-[--panel-2] overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Source Badge */}
                  {item.feed && (
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      <span className="inline-block text-xs font-bold text-[--red] uppercase">
                        {item.feed.source_name || item.feed.name}
                      </span>
                      {item.feed.category && (
                        <span className="inline-block text-xs font-semibold text-[--muted] uppercase">
                          • {item.feed.category.name}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-base font-bold leading-tight mb-2 line-clamp-2 group-hover:text-[--red] transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-[--muted-2] line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-[--muted-2]">
                    {item.author && <span>{item.author}</span>}
                    {item.published_at && (
                      <span>
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Read More */}
                  <div className="mt-4 flex items-center gap-1 text-sm font-bold text-[--red]">
                    Read on VNTV
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
