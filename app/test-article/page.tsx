import { PublicLayout } from "@/components/layout/public-layout";
import { ArticleCard, ShareButtons, ArticleBlockRenderer } from "@/components/content";
import type { ArticleBlock } from "@/components/content";
import type { Metadata } from "next";

// Sample article data for testing
const testArticle = {
  id: "test-123",
  slug: "test-article-milestone-7",
  title: "Testing Milestone 7: Article Reading Experience with All Features",
  excerpt: "This is a comprehensive test article showcasing all Milestone 7 features including social sharing, rich content blocks, SEO metadata, and theme support. Use this page to verify everything works correctly.",
  published_at: new Date().toISOString(),
  category: {
    id: "cat-1",
    name: "TESTING",
    slug: "testing",
  },
  author: {
    id: "author-1",
    name: "Test Author",
    slug: "test-author",
    bio: "This is a test author bio. The author bio appears at the bottom of articles to provide more context about who wrote the piece. This helps build credibility and allows readers to learn more about the writer.",
    avatar_url: null,
  },
  tags: [
    { id: "tag-1", name: "Milestone 7", slug: "milestone-7" },
    { id: "tag-2", name: "Testing", slug: "testing" },
    { id: "tag-3", name: "Features", slug: "features" },
  ],
  is_breaking: false,
  is_exclusive: true,
  is_sponsored: false,
  sponsor_label: null,
  view_count: 42,
};

// Sample rich content blocks for testing
const testBlocks: ArticleBlock[] = [
  {
    type: "paragraph",
    content: "This is the opening paragraph of our test article. It demonstrates how regular paragraphs appear in the article reading experience. The text should be readable with proper spacing and line height in both light and dark themes.",
  },
  {
    type: "heading",
    level: 2,
    content: "Testing Heading Level 2",
  },
  {
    type: "paragraph",
    content: "After a heading, we have another paragraph. This helps establish the visual hierarchy and ensures that all content blocks work together harmoniously. The spacing between different block types is important for readability.",
  },
  {
    type: "heading",
    level: 3,
    content: "This is a Level 3 Heading",
  },
  {
    type: "list",
    ordered: false,
    items: [
      "This is an unordered list item",
      "Lists help break down information into digestible chunks",
      "They should be properly styled with bullets",
      "And have appropriate spacing between items",
    ],
  },
  {
    type: "heading",
    level: 3,
    content: "Ordered List Example",
  },
  {
    type: "list",
    ordered: true,
    items: [
      "First item in ordered list",
      "Second item with numbering",
      "Third item to show sequence",
      "Fourth item for completeness",
    ],
  },
  {
    type: "quote",
    content: "This is a blockquote to test the quote styling. It should have a red accent border on the left, a panel background, and the quote icon from Lucide React. Quotes are important for highlighting key statements or testimonials.",
    author: "Test Author",
    source: "Milestone 7 Testing",
  },
  {
    type: "heading",
    level: 2,
    content: "Testing Different Heading Levels",
  },
  {
    type: "heading",
    level: 4,
    content: "This is Heading Level 4",
  },
  {
    type: "paragraph",
    content: "Paragraph after H4. Each heading level should have a distinct size and weight, creating a clear visual hierarchy that helps readers navigate the content structure.",
  },
  {
    type: "heading",
    level: 5,
    content: "This is Heading Level 5",
  },
  {
    type: "paragraph",
    content: "Even smaller headings like H5 and H6 should be distinguishable from body text while maintaining the overall hierarchy.",
  },
  {
    type: "heading",
    level: 6,
    content: "This is Heading Level 6 (smallest)",
  },
  {
    type: "paragraph",
    content: "H6 is the smallest heading level but should still be bold enough to serve as a section marker.",
  },
  {
    type: "divider",
  },
  {
    type: "heading",
    level: 2,
    content: "Testing Visual Separators",
  },
  {
    type: "paragraph",
    content: "The divider above creates visual separation between major sections. It should be subtle but effective in both light and dark themes.",
  },
  {
    type: "paragraph",
    content: "Multiple paragraphs in sequence should have consistent spacing. This paragraph follows the previous one and demonstrates the vertical rhythm of the article layout. Proper typography makes content more readable and engaging.",
  },
  {
    type: "paragraph",
    content: "This is the final paragraph of our test content. In a real article, this would be where the conclusion or final thoughts appear. The article should flow naturally from start to finish with all elements working together to create an excellent reading experience.",
  },
];

// Sample suggested articles for testing
const suggestedArticles = [
  {
    id: "suggested-1",
    title: "Related Article One: Testing the Suggested Articles Feature",
    slug: "related-article-one",
    excerpt: "This is a suggested article that appears in the sidebar to help readers discover more content.",
    published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    category: { id: "cat-1", name: "TESTING", slug: "testing" },
    author: { id: "author-1", name: "Test Author", slug: "test-author" },
    featured_image: null,
  },
  {
    id: "suggested-2",
    title: "Related Article Two: Three-Strategy Algorithm Test",
    slug: "related-article-two",
    excerpt: "Suggested articles use a 3-strategy algorithm: same category, same tags, then latest articles.",
    published_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    category: { id: "cat-1", name: "TESTING", slug: "testing" },
    author: { id: "author-2", name: "Another Author", slug: "another-author" },
    featured_image: null,
  },
  {
    id: "suggested-3",
    title: "Related Article Three: Mobile Responsive Design Check",
    slug: "related-article-three",
    excerpt: "Check that the suggested articles sidebar works on mobile, tablet, and desktop.",
    published_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    category: { id: "cat-2", name: "FEATURES", slug: "features" },
    author: { id: "author-1", name: "Test Author", slug: "test-author" },
    featured_image: null,
  },
];

// Generate metadata for SEO testing
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";
  
  return {
    title: `${testArticle.title} | VNTV`,
    description: testArticle.excerpt,
    keywords: testArticle.tags.map(tag => tag.name).join(", "),
    authors: [{ name: testArticle.author.name }],
    category: testArticle.category.name,
    
    openGraph: {
      title: testArticle.title,
      description: testArticle.excerpt,
      url: `${siteUrl}/test-article`,
      siteName: "VNTV",
      locale: "en_US",
      type: "article",
      publishedTime: testArticle.published_at,
      authors: [testArticle.author.name],
      section: testArticle.category.name,
      tags: testArticle.tags.map(tag => tag.name),
    },
    
    twitter: {
      card: "summary_large_image",
      site: "@vntv",
      creator: "@vntv",
      title: testArticle.title,
      description: testArticle.excerpt,
    },
    
    alternates: {
      canonical: `${siteUrl}/test-article`,
    },
    
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function TestArticlePage() {
  const publishedDate = new Date(testArticle.published_at);

  // JSON-LD structured data
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: testArticle.title,
    description: testArticle.excerpt,
    datePublished: publishedDate.toISOString(),
    author: {
      "@type": "Person",
      name: testArticle.author.name,
      description: testArticle.author.bio,
    },
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
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com"}/test-article`,
    },
    articleSection: testArticle.category.name,
    keywords: testArticle.tags.map(tag => tag.name).join(", "),
  };

  return (
    <PublicLayout>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      {/* Test Instructions Banner */}
      <div className="bg-vntv-red/10 border-b border-vntv-red/30 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-lg font-bold text-vntv-red mb-2">🧪 Milestone 7 Test Page</h2>
          <p className="text-sm text-text-secondary">
            This page demonstrates all Milestone 7 features. Test the following:
          </p>
          <ul className="text-sm text-text-secondary mt-2 space-y-1 list-disc list-inside">
            <li>Social sharing buttons (try each platform + copy link)</li>
            <li>Rich content blocks (9 different types below)</li>
            <li>Theme switching (use toggle in header)</li>
            <li>Responsive design (resize browser or test on mobile)</li>
            <li>SEO metadata (view page source for meta tags and JSON-LD)</li>
            <li>Accessibility (try keyboard navigation)</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-2">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block rounded bg-vntv-red px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                {testArticle.category.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-text-primary md:text-5xl">
              {testArticle.title}
            </h1>

            {/* Meta */}
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="font-medium">{testArticle.author.name}</span>
              <span>•</span>
              <time dateTime={publishedDate.toISOString()}>
                {publishedDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {testArticle.is_exclusive && (
                <>
                  <span>•</span>
                  <span className="font-bold text-vntv-red">EXCLUSIVE</span>
                </>
              )}
            </div>

            {/* Excerpt */}
            <div className="mb-8 border-l-4 border-vntv-red pl-6">
              <p className="text-xl font-medium leading-relaxed text-text-secondary">
                {testArticle.excerpt}
              </p>
            </div>

            {/* Body Content - Rich Blocks */}
            <ArticleBlockRenderer blocks={testBlocks} />

            {/* Social Sharing */}
            <div className="mt-12 pt-8 border-t border-border">
              <ShareButtons
                url="/test-article"
                title={testArticle.title}
                description={testArticle.excerpt}
              />
            </div>

            {/* Tags */}
            <div className="mt-12 border-t border-border pt-8">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {testArticle.tags.map((tag) => (
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

            {/* Author Bio */}
            <div className="mt-12 rounded-lg border border-border bg-background-panel p-6">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
                About the Author
              </h3>
              <p className="font-bold text-text-primary">{testArticle.author.name}</p>
              <p className="mt-2 text-sm text-text-secondary">
                {testArticle.author.bio}
              </p>
            </div>
          </article>

          {/* Sidebar - Suggested Articles */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide mb-6">
                <span className="w-1 h-4 bg-vntv-red rounded-sm" />
                RELATED STORIES
              </h2>

              <div className="space-y-6">
                {suggestedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    slug={article.slug}
                    excerpt={article.excerpt}
                    categoryName={article.category?.name}
                    categorySlug={article.category?.slug}
                    authorName={article.author?.name}
                    publishedAt={article.published_at}
                    imagePath={article.featured_image?.storage_path}
                    imageAlt={article.featured_image?.alt_text}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
