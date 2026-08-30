import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { getCategory, getCategoryArticles } from "@/app/actions/category";
import { ArticleCard } from "@/components/content";
import { Button } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

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
  const limit = 12;

  // Fetch category and articles
  const [categoryResult, articlesResult] = await Promise.all([
    getCategory(slug),
    getCategoryArticles(slug, {
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
  const articles = articlesResult.data || [];
  const total = articlesResult.total || 0;
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
              No articles found in this category yet.
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
