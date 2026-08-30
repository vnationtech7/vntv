import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { getAuthor, getAuthorArticles, getAuthorArticleCount } from "@/app/actions/author";
import { ArticleCard } from "@/components/content";
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Globe, Mail } from "lucide-react";

// Custom SVG icons for social platforms
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: author } = await getAuthor(slug);

  if (!author) {
    return {
      title: "Author Not Found | VNTV",
      description: "The requested author could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";

  return {
    title: `${author.name} - Author Profile | VNTV`,
    description: author.bio || `Read articles by ${author.name} on VNTV - Africa's leading news platform`,
    
    openGraph: {
      title: `${author.name} | VNTV`,
      description: author.bio || `Read articles by ${author.name}`,
      url: `${siteUrl}/author/${author.slug}`,
      siteName: "VNTV",
      type: "profile",
      images: author.avatar_url ? [
        {
          url: author.avatar_url,
          width: 400,
          height: 400,
          alt: author.name,
        }
      ] : undefined,
    },
    
    twitter: {
      card: "summary",
      site: "@vntv",
      title: `${author.name} | VNTV`,
      description: author.bio || `Read articles by ${author.name}`,
      images: author.avatar_url ? [author.avatar_url] : undefined,
    },
    
    alternates: {
      canonical: `${siteUrl}/author/${author.slug}`,
    },
  };
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;

  const currentPage = parseInt(page, 10) || 1;
  const limit = 12;

  // Fetch author and articles
  const [authorResult, articlesResult] = await Promise.all([
    getAuthor(slug),
    getAuthorArticles(slug, {
      page: currentPage,
      limit,
    }),
  ]);

  if (authorResult.error || !authorResult.data) {
    notFound();
  }

  const author = authorResult.data;
  const articles = articlesResult.data || [];
  const total = articlesResult.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get article count
  const articleCount = await getAuthorArticleCount(author.id);

  return (
    <PublicLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {/* Author Profile Header */}
        <div className="mb-12 flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {author.avatar_url ? (
              <Image
                src={author.avatar_url}
                alt={author.name}
                width={200}
                height={200}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-[200px] h-[200px] rounded-full bg-surface-secondary flex items-center justify-center">
                <span className="text-6xl font-bold text-text-secondary">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
              {author.name}
            </h1>
            
            {author.bio && (
              <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                {author.bio}
              </p>
            )}

            {/* Stats */}
            <div className="mb-6">
              <span className="text-sm text-text-secondary">
                {articleCount} {articleCount === 1 ? "article" : "articles"} published
              </span>
            </div>

            {/* Social Links */}
            {(author.twitter_handle || author.linkedin_url || author.website_url || author.email) && (
              <div className="flex flex-wrap gap-3">
                {author.twitter_handle && (
                  <a
                    href={`https://twitter.com/${author.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors"
                  >
                    <TwitterIcon />
                    <span className="text-sm">Twitter</span>
                  </a>
                )}
                
                {author.linkedin_url && (
                  <a
                    href={author.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors"
                  >
                    <LinkedInIcon />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                
                {author.website_url && (
                  <a
                    href={author.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
                
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Articles Section */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Articles by {author.name}
          </h2>

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
                    <Link href={`/author/${author.slug}?page=${currentPage - 1}`}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}

                  <div className="flex items-center gap-2 px-4">
                    <span className="text-sm text-text-secondary">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  {currentPage < totalPages && (
                    <Link href={`/author/${author.slug}?page=${currentPage + 1}`}>
                      <Button variant="outline">Next</Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-text-secondary">
                No articles published yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
