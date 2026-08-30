import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicLayout } from "@/components/layout/public-layout";
import { getArticle, getSuggestedArticles } from "@/app/actions/article";
import { ArticleCard, ShareButtons, ArticleBlockRenderer, ViewTracker } from "@/components/content";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: article } = await getArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found | VNTV",
      description: "The requested article could not be found.",
    };
  }

  const imageUrl = article.featured_image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${article.featured_image.storage_path}`
    : null;

  const publishedDate = article.published_at
    ? new Date(article.published_at).toISOString()
    : new Date().toISOString();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";
  const articleUrl = `${siteUrl}/news/${article.slug}`;

  return {
    title: article.seo_title || `${article.title} | VNTV`,
    description: article.seo_description || article.excerpt || `Read ${article.title} on VNTV - Africa's leading news platform`,
    
    keywords: article.tags.map(tag => tag.name).join(", "),
    
    authors: article.author ? [{ name: article.author.name }] : undefined,
    
    category: article.category?.name,
    
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || undefined,
      url: articleUrl,
      siteName: "VNTV",
      locale: "en_US",
      type: "article",
      publishedTime: publishedDate,
      modifiedTime: article.published_at || publishedDate,
      authors: article.author ? [article.author.name] : undefined,
      section: article.category?.name,
      tags: article.tags.map(tag => tag.name),
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: article.featured_image?.alt_text || article.title,
            },
          ]
        : undefined,
    },
    
    twitter: {
      card: "summary_large_image",
      site: "@vntv",
      creator: "@vntv",
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || undefined,
      images: imageUrl ? [imageUrl] : undefined,
    },
    
    alternates: {
      canonical: articleUrl,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { data: article, error } = await getArticle(slug);

  if (error || !article) {
    notFound();
  }

  // Get suggested articles
  const { data: suggestedArticles } = await getSuggestedArticles(
    article.id,
    article.category?.id || null,
    article.tags.map(t => t.id),
    6
  );

  const imageUrl = article.featured_image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${article.featured_image.storage_path}`
    : null;

  const publishedDate = article.published_at
    ? new Date(article.published_at)
    : new Date();

  // JSON-LD structured data for article
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || "",
    image: imageUrl ? [imageUrl] : [],
    datePublished: publishedDate.toISOString(),
    dateModified: article.published_at || publishedDate.toISOString(),
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
          ...(article.author.bio && { description: article.author.bio }),
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "VNTV",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com"}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com"}/news/${article.slug}`,
    },
    ...(article.category && { articleSection: article.category.name }),
    ...(article.tags.length > 0 && { keywords: article.tags.map(tag => tag.name).join(", ") }),
  };

  return (
    <PublicLayout>
      {/* View Tracker - tracks view count */}
      <ViewTracker articleId={article.id} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-2">
            {/* Category Badge */}
            {article.category && (
              <div className="mb-4">
                <span className="inline-block rounded bg-vntv-red px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                  {article.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-text-primary md:text-5xl">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              {article.author && (
                <span className="font-medium">{article.author.name}</span>
              )}
              <span>•</span>
              <time dateTime={publishedDate.toISOString()}>
                {publishedDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {article.is_breaking && (
                <>
                  <span>•</span>
                  <span className="font-bold text-vntv-red">BREAKING NEWS</span>
                </>
              )}
              {article.is_exclusive && (
                <>
                  <span>•</span>
                  <span className="font-bold text-vntv-red">EXCLUSIVE</span>
                </>
              )}
            </div>

            {/* Featured Image */}
            {imageUrl && (
              <div className="mb-8 overflow-hidden rounded-lg">
                <img
                  src={imageUrl}
                  alt={article.featured_image?.alt_text || article.title}
                  className="h-auto w-full"
                />
              </div>
            )}

            {/* Excerpt */}
            {article.excerpt && (
              <div className="mb-8 border-l-4 border-vntv-red pl-6">
                <p className="text-xl font-medium leading-relaxed text-text-secondary">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Sponsor Label */}
            {article.is_sponsored && article.sponsor_label && (
              <div className="mb-6 rounded-lg border border-border bg-background-panel p-4 text-sm text-text-secondary">
                {article.sponsor_label}
              </div>
            )}

            {/* Body Content */}
            <ArticleBlockRenderer blocks={article.body || []} />

            {/* Social Sharing */}
            <div className="mt-12 pt-8 border-t border-border">
              <ShareButtons
                url={`/news/${article.slug}`}
                title={article.title}
                description={article.excerpt || undefined}
              />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 border-t border-border pt-8">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: any) => (
                    <a
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="rounded-full border border-border bg-background-panel px-4 py-2 text-sm text-text-primary transition-colors hover:border-vntv-red hover:text-vntv-red"
                    >
                      {tag.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {article.author && article.author.bio && (
              <div className="mt-12 rounded-lg border border-border bg-background-panel p-6">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
                  About the Author
                </h3>
                <p className="font-bold text-text-primary">{article.author.name}</p>
                <p className="mt-2 text-sm text-text-secondary">
                  {article.author.bio}
                </p>
              </div>
            )}
          </article>

          {/* Sidebar - Suggested Articles */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide mb-6">
                <span className="w-1 h-4 bg-vntv-red rounded-sm" />
                RELATED STORIES
              </h2>

              {suggestedArticles && suggestedArticles.length > 0 ? (
                <div className="space-y-6">
                  {suggestedArticles.map((suggestedArticle) => (
                    <ArticleCard
                      key={suggestedArticle.id}
                      id={suggestedArticle.id}
                      title={suggestedArticle.title}
                      slug={suggestedArticle.slug}
                      excerpt={suggestedArticle.excerpt}
                      categoryName={suggestedArticle.category?.name}
                      categorySlug={suggestedArticle.category?.slug}
                      authorName={suggestedArticle.author?.name}
                      publishedAt={suggestedArticle.published_at}
                      imagePath={suggestedArticle.featured_image?.storage_path}
                      imageAlt={suggestedArticle.featured_image?.alt_text}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-sm">No related stories available.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
