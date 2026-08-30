import { PublicLayout } from "@/components/layout/public-layout";
import { globalSearch } from "@/app/actions/search";
import { ArticleCard } from "@/components/content";
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Search as SearchIcon, FileText, Video, User } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: "all" | "article" | "video" | "author";
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Search results for "${q}" | VNTV` : "Search | VNTV",
    description: q 
      ? `Search results for "${q}" on VNTV - Africa's leading news platform`
      : "Search VNTV for news, articles, videos, and authors",
    robots: {
      index: false, // Don't index search results pages
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, type = "all", page = "1" } = await searchParams;

  const currentPage = parseInt(page, 10) || 1;
  const limit = 20;

  // Perform search
  const { data: results, total } = q
    ? await globalSearch(q, {
        type,
        page: currentPage,
        limit,
      })
    : { data: [], total: 0 };

  const totalPages = Math.ceil(total / limit);

  // Group results by type for "all" filter
  const articleResults = results.filter((r) => r.type === "article");
  const videoResults = results.filter((r) => r.type === "video");
  const authorResults = results.filter((r) => r.type === "author");

  // Highlight search term in text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-accent-yellow/30 text-text-primary">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <PublicLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-text-primary mb-4">
            {q ? (
              <>
                Search results for &quot;{q}&quot;
              </>
            ) : (
              "Search"
            )}
          </h1>
          {q && total > 0 && (
            <p className="text-lg text-text-secondary">
              Found {total} {total === 1 ? "result" : "results"}
            </p>
          )}
        </div>

        {/* Type Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href={`/search?q=${encodeURIComponent(q || "")}`}>
            <Button variant={type === "all" ? "primary" : "outline"} size="sm">
              <SearchIcon className="w-4 h-4 mr-2" />
              All ({total})
            </Button>
          </Link>
          <Link href={`/search?q=${encodeURIComponent(q || "")}&type=article`}>
            <Button variant={type === "article" ? "primary" : "outline"} size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Articles ({articleResults.length})
            </Button>
          </Link>
          <Link href={`/search?q=${encodeURIComponent(q || "")}&type=video`}>
            <Button variant={type === "video" ? "primary" : "outline"} size="sm">
              <Video className="w-4 h-4 mr-2" />
              Videos ({videoResults.length})
            </Button>
          </Link>
          <Link href={`/search?q=${encodeURIComponent(q || "")}&type=author`}>
            <Button variant={type === "author" ? "primary" : "outline"} size="sm">
              <User className="w-4 h-4 mr-2" />
              Authors ({authorResults.length})
            </Button>
          </Link>
        </div>

        {/* Results */}
        {!q ? (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-xl text-text-secondary">
              Enter a search query to find articles, videos, and authors
            </p>
          </div>
        ) : results.length > 0 ? (
          <>
            {/* Articles and Videos */}
            {(type === "all" || type === "article" || type === "video") && (
              <div className="mb-12">
                {type === "all" && articleResults.length > 0 && (
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Articles</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
                  {(type === "all" ? articleResults : type === "article" ? results : []).map((result) => (
                    <ArticleCard
                      key={result.id}
                      id={result.id}
                      title={result.title}
                      slug={result.slug}
                      excerpt={result.excerpt}
                      publishedAt={result.published_at}
                      categoryName={result.category?.name}
                      categorySlug={result.category?.slug}
                      authorName={result.author?.name}
                      imagePath={result.featured_image?.storage_path}
                      imageAlt={result.featured_image?.alt_text}
                      variant="default"
                    />
                  ))}
                </div>

                {type === "all" && videoResults.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Videos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
                      {videoResults.map((result) => (
                        <Link
                          key={result.id}
                          href={`/video/${result.slug}`}
                          className="block group"
                        >
                          <div className="bg-surface-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-accent-yellow transition-all">
                            {result.featured_image && (
                              <div className="relative aspect-video">
                                <Image
                                  src={result.featured_image.storage_path}
                                  alt={result.featured_image.alt_text || result.title}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Video className="w-12 h-12 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="p-4">
                              <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-yellow transition-colors mb-2">
                                {q ? highlightText(result.title, q) : result.title}
                              </h3>
                              {result.description && (
                                <p className="text-sm text-text-secondary line-clamp-2">
                                  {q ? highlightText(result.description, q) : result.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Authors */}
            {(type === "all" || type === "author") && (
              <>
                {type === "all" && authorResults.length > 0 && (
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Authors</h2>
                )}
                {(type === "all" ? authorResults : type === "author" ? results : []).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {(type === "all" ? authorResults : type === "author" ? results : []).map((result) => (
                      <Link
                        key={result.id}
                        href={`/author/${result.slug}`}
                        className="flex gap-4 p-6 bg-surface-secondary rounded-lg hover:ring-2 hover:ring-accent-yellow transition-all"
                      >
                        {result.avatar_url ? (
                          <Image
                            src={result.avatar_url}
                            alt={result.title}
                            width={80}
                            height={80}
                            className="rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl font-bold text-text-secondary">
                              {result.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-text-primary mb-2">
                            {q ? highlightText(result.title, q) : result.title}
                          </h3>
                          {result.description && (
                            <p className="text-sm text-text-secondary line-clamp-2">
                              {q ? highlightText(result.description, q) : result.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {type !== "all" && totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(q)}&type=${type}&page=${currentPage - 1}`}
                  >
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}

                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-text-secondary">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={`/search?q=${encodeURIComponent(q)}&type=${type}&page=${currentPage + 1}`}
                  >
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-xl text-text-secondary mb-2">
              No results found for &quot;{q}&quot;
            </p>
            <p className="text-text-tertiary">
              Try different keywords or check your spelling
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
