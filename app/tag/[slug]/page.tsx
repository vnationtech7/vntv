import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { getTag, getTagArticles, getTagArticleCount } from "@/app/actions/tag";
import { ArticleCard } from "@/components/content";
import { Button } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { Tag as TagIcon } from "lucide-react";

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: tag } = await getTag(slug);

  if (!tag) {
    return {
      title: "Tag Not Found | VNTV",
      description: "The requested tag could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";

  return {
    title: `${tag.name} - Tagged Articles | VNTV`,
    description: `Browse articles tagged with ${tag.name} on VNTV - Africa's leading news platform`,
    
    openGraph: {
      title: `${tag.name} | VNTV`,
      description: `Browse articles tagged with ${tag.name}`,
      url: `${siteUrl}/tag/${tag.slug}`,
      siteName: "VNTV",
      type: "website",
    },
    
    twitter: {
      card: "summary",
      site: "@vntv",
      title: `${tag.name} | VNTV`,
      description: `Browse articles tagged with ${tag.name}`,
    },
    
    alternates: {
      canonical: `${siteUrl}/tag/${tag.slug}`,
    },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;

  const currentPage = parseInt(page, 10) || 1;
  const limit = 12;

  // Fetch tag and articles
  const [tagResult, articlesResult] = await Promise.all([
    getTag(slug),
    getTagArticles(slug, {
      page: currentPage,
      limit,
    }),
  ]);

  if (tagResult.error || !tagResult.data) {
    notFound();
  }

  const tag = tagResult.data;
  const articles = articlesResult.data || [];
  const total = articlesResult.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get article count
  const articleCount = await getTagArticleCount(tag.id);

  return (
    <PublicLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {/* Tag Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-accent-yellow/10 rounded-lg">
              <TagIcon className="w-6 h-6 text-accent-yellow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">
              {tag.name}
            </h1>
          </div>
          <p className="text-lg text-text-secondary">
            {articleCount} {articleCount === 1 ? "article" : "articles"} tagged with &quot;{tag.name}&quot;
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  slug={article.slug}
                  excerpt={article.excerpt}
                  publishedAt={article.published_at}
                  categoryName={article.category?.name}
                  categorySlug={article.category?.slug}
                  authorName={article.author?.name}
                  imagePath={article.featured_image?.storage_path}
                  imageAlt={article.featured_image?.alt_text}
                  variant="default"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link href={`/tag/${tag.slug}?page=${currentPage - 1}`}>
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}

                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-text-secondary">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {currentPage < totalPages && (
                  <Link href={`/tag/${tag.slug}?page=${currentPage + 1}`}>
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <TagIcon className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-xl text-text-secondary">
              No articles found with this tag yet.
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
