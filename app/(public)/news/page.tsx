// @ts-nocheck
import { PublicLayout } from "@/components/layout";
import { createClient } from "@/lib/supabase/server";
import { ContentCard } from "@/components/content";

export const metadata = {
  title: "Articles - VNTV",
  description: "Read the latest articles and news from VNTV",
};

async function getArticlesByCategory() {
  const supabase = await createClient();

  // Fetch all published articles
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, featured_image_id, category_id, author_id, published_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(100);

  if (articlesError || !articles) {
    return { latest: [], byCategory: {} };
  }

  // Get related data
  const categoryIds = articles.map(a => a.category_id).filter(Boolean);
  const authorIds = articles.map(a => a.author_id).filter(Boolean);
  const imageIds = articles.map(a => a.featured_image_id).filter(Boolean);

  const [categoriesResult, authorsResult, imagesResult] = await Promise.all([
    categoryIds.length > 0
      ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
      : { data: [] },
    authorIds.length > 0
      ? supabase.from("authors").select("id, name, slug").in("id", authorIds)
      : { data: [] },
    imageIds.length > 0
      ? supabase.from("media_assets").select("id, storage_path, alt_text").in("id", imageIds)
      : { data: [] },
  ]);

  // Map related data
  const categoriesMap = new Map(categoriesResult.data?.map((c: any) => [c.id, c]) || []);
  const authorsMap = new Map(authorsResult.data?.map((a: any) => [a.id, a]) || []);
  const imagesMap = new Map(imagesResult.data?.map((i: any) => [i.id, i]) || []);

  // Enrich articles
  const enrichedArticles = articles.map(article => ({
    ...article,
    category: article.category_id ? categoriesMap.get(article.category_id) || null : null,
    author: article.author_id ? authorsMap.get(article.author_id) || null : null,
    featured_image: article.featured_image_id ? imagesMap.get(article.featured_image_id) || null : null,
  }));

  // Group by category
  const byCategory: Record<string, any[]> = {};
  enrichedArticles.forEach(article => {
    if (article.category) {
      const categoryName = article.category.name;
      if (!byCategory[categoryName]) {
        byCategory[categoryName] = [];
      }
      byCategory[categoryName].push(article);
    }
  });

  return {
    latest: enrichedArticles.slice(0, 12), // First 12 for hero section
    byCategory,
  };
}

export default async function NewsPage() {
  const { latest, byCategory } = await getArticlesByCategory();

  // Define category display order
  const categoryOrder = ['Ghana', 'Nigeria', 'Africa', 'World', 'Politics', 'Business', 'Entertainment', 'Sports'];

  return (
    <PublicLayout>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-wide mb-2">
            <span className="w-1 h-6 bg-[--red] rounded-sm" />
            OUR ARTICLES
          </h1>
          <p className="text-[--muted]">
            In-depth coverage and analysis from our editorial team
          </p>
        </div>

        {/* Latest Articles - Featured Grid (12 items) */}
        {latest.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Latest Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {latest.map((article) => (
                <ContentCard
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
                  variant="compact"
                  contentType="article"
                />
              ))}
            </div>
          </section>
        )}

        {/* Articles by Category - Organized Sections */}
        {categoryOrder.map(categoryName => {
          const articles = byCategory[categoryName];
          if (!articles || articles.length === 0) return null;

          return (
            <section key={categoryName} className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{categoryName}</h2>
                {articles[0]?.category?.slug && (
                  <a
                    href={`/category/${articles[0].category.slug}`}
                    className="text-sm font-semibold text-[--red] hover:underline"
                  >
                    View all {categoryName}
                  </a>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.slice(0, 8).map((article) => (
                  <ContentCard
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
                    variant="compact"
                    contentType="article"
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Other Categories */}
        {Object.keys(byCategory)
          .filter(cat => !categoryOrder.includes(cat))
          .map(categoryName => {
            const articles = byCategory[categoryName];
            if (!articles || articles.length === 0) return null;

            return (
              <section key={categoryName} className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{categoryName}</h2>
                  {articles[0]?.category?.slug && (
                    <a
                      href={`/category/${articles[0].category.slug}`}
                      className="text-sm font-semibold text-[--red] hover:underline"
                    >
                      View all {categoryName}
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {articles.slice(0, 8).map((article) => (
                    <ContentCard
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
                      variant="compact"
                      contentType="article"
                    />
                  ))}
                </div>
              </section>
            );
          })}

        {/* Empty State */}
        {latest.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[--muted-2]">No articles available at the moment.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
