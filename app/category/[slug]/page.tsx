import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { getCategory, getCategoryContent } from "@/app/actions/category";
import { ArticleCard, ContentCard } from "@/components/content";
import { Button } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    subcategory?: string;
    sort?: "latest" | "trending" | "featured";
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found | VNTV",
      description: "The requested category could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";

  return {
    title: `${category.name} - Latest News & Articles | VNTV`,
    description: category.description || `Browse the latest ${category.name} news, articles, and stories on VNTV - Africa's leading news platform`,
    
    openGraph: {
      title: `${category.name} | VNTV`,
      description: category.description || `Browse the latest ${category.name} news and articles`,
      url: `${siteUrl}/category/${category.slug}`,
      siteName: "VNTV",
      type: "website",
    },
    
    twitter: {
      card: "summary",
      site: "@vntv",
      title: `${category.name} | VNTV`,
      description: category.description || `Browse the latest ${category.name} news and articles`,
    },
    
    alternates: {
      canonical: `${siteUrl}/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { subcategory, sort = "latest", page = "1" } = await searchParams;

  const currentPage = parseInt(page, 10) || 1;
  const limit = 24;

  // Fetch category and unified content (articles + RSS)
  const [categoryResult, contentResult] = await Promise.all([
    getCategory(slug),
    getCategoryContent(slug, {
      subcategorySlug: subcategory,
      sortBy: sort,
      page: currentPage,
      limit,
    }),
  ]);

  if (categoryResult.error || !categoryResult.data) {
    notFound();
  }

  const category = categoryResult.data;
  const content = contentResult.data || [];
  const total = contentResult.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <PublicLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {/* Category Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-text-secondary max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Filters and Sorting */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Subcategory Filter */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link href={`/category/${category.slug}`}>
                <Button
                  variant={!subcategory ? "primary" : "outline"}
                  size="sm"
                >
                  All
                </Button>
              </Link>
              {category.subcategories.map((sub: any) => (
                <Link
                  key={sub.id}
                  href={`/category/${category.slug}?subcategory=${sub.slug}`}
                >
                  <Button
                    variant={subcategory === sub.slug ? "primary" : "outline"}
                    size="sm"
                  >
                    {sub.name}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Sort Options */}
          <div className="flex gap-2">
            <Link
              href={`/category/${category.slug}${subcategory ? `?subcategory=${subcategory}` : ""}`}
            >
              <Button
                variant={sort === "latest" ? "primary" : "outline"}
                size="sm"
              >
                Latest
              </Button>
            </Link>
            <Link
              href={`/category/${category.slug}?sort=trending${subcategory ? `&subcategory=${subcategory}` : ""}`}
            >
              <Button
                variant={sort === "trending" ? "primary" : "outline"}
                size="sm"
              >
                Trending
              </Button>
            </Link>
            <Link
              href={`/category/${category.slug}?sort=featured${subcategory ? `&subcategory=${subcategory}` : ""}`}
            >
              <Button
                variant={sort === "featured" ? "primary" : "outline"}
                size="sm"
              >
                Featured
              </Button>
            </Link>
          </div>
        </div>

        {/* Articles Grid */}
        {content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
              {content.map((item) => (
                <ContentCard
                  key={`${item.type}-${item.id}`}
                  id={item.id}
                  title={item.title}
                  slug={item.slug || ""}
                  excerpt={item.description}
                  publishedAt={item.published_at}
                  categoryName={category.name}
                  categorySlug={category.slug}
                  authorName={item.author?.name}
                  imagePath={item.type === "article" && item.image?.storage_path ? item.image.storage_path : undefined}
                  imageUrl={item.type === "rss" && item.image?.url ? item.image.url : undefined}
                  imageAlt={item.image?.alt_text}
                  variant="default"
                  contentType={item.type}
                  sourceName={item.type === "rss" && item.feed ? (item.feed.source_name || item.feed.name) : undefined}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/category/${category.slug}?page=${currentPage - 1}${sort !== "latest" ? `&sort=${sort}` : ""}${subcategory ? `&subcategory=${subcategory}` : ""}`}
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
                    href={`/category/${category.slug}?page=${currentPage + 1}${sort !== "latest" ? `&sort=${sort}` : ""}${subcategory ? `&subcategory=${subcategory}` : ""}`}
                  >
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-text-secondary">
              No content found in this category yet.
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
