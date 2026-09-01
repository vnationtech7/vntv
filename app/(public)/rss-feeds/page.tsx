import { PublicLayout } from "@/components/layout";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "RSS Feeds - VNTV",
  description: "Browse all approved RSS feeds from trusted sources",
};

async function getApprovedRssItems() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rss_items")
    .select(`
      id,
      title,
      description,
      url,
      image_url,
      author,
      published_at,
      feed:rss_feeds(id, name, source_name)
    `)
    .eq("status", "approved")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching RSS items:", error);
    return [];
  }

  return data || [];
}

export default async function RssFeedsPage() {
  const rssItems = await getApprovedRssItems();

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

        {/* RSS Items Grid */}
        {rssItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[--muted-2]">No RSS feeds available at the moment.</p>
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
                    <div className="mb-2">
                      <span className="inline-block text-xs font-bold text-[--red] uppercase">
                        {item.feed.source_name || item.feed.name}
                      </span>
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
