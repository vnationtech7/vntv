/**
 * One-time script to convert all existing approved RSS items to articles
 * Run this once to migrate your already-approved RSS items
 * 
 * Usage: npx tsx scripts/convert-approved-rss-items.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅" : "❌");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function convertApprovedRssItems() {
  console.log("🔄 Fetching approved RSS items...");

  // Get all approved items that haven't been converted yet
  const { data: items, error } = await supabase
    .from("rss_items")
    .select("*")
    .eq("status", "approved")
    .is("article_id", null);

  if (error) {
    console.error("❌ Error fetching RSS items:", error);
    return;
  }

  if (!items || items.length === 0) {
    console.log("✅ No approved RSS items to convert");
    return;
  }

  console.log(`📋 Found ${items.length} approved RSS items to convert`);

  let successful = 0;
  let failed = 0;

  for (const item of items) {
    try {
      console.log(`\n🔄 Converting: ${item.title}`);

      // Generate unique slug
      const baseSlug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from("articles")
          .select("id")
          .eq("slug", slug)
          .limit(1)
          .single();

        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Get or create RSS Feed author
      let authorId;
      const { data: rssAuthor } = await supabase
        .from("authors")
        .select("id")
        .eq("slug", "rss-feed")
        .limit(1)
        .single();

      if (rssAuthor) {
        authorId = rssAuthor.id;
      } else {
        const { data: newAuthor } = await supabase
          .from("authors")
          .insert({
            name: "RSS Feed",
            slug: "rss-feed",
            bio: "Automated news aggregation from trusted sources",
          })
          .select("id")
          .single();

        authorId = newAuthor?.id;
      }

      // Get default News category
      const { data: newsCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", "news")
        .limit(1)
        .single();

      const categoryId = newsCategory?.id;

      // Create the article
      const { data: article, error: articleError } = await supabase
        .from("articles")
        .insert({
          title: item.title,
          slug,
          summary: item.description || null,
          content: item.content || item.description || "",
          featured_image_url: item.image_url || null,
          category_id: categoryId,
          author_id: authorId,
          status: "published",
          published_at: new Date().toISOString(),
          source_url: item.url,
          source_name: item.feed_id ? "RSS Feed" : null,
        })
        .select()
        .single();

      if (articleError) {
        console.error(`  ❌ Failed to create article:`, articleError.message);
        failed++;
        continue;
      }

      // Update RSS item
      await supabase
        .from("rss_items")
        .update({
          article_id: article.id,
          status: "published",
        })
        .eq("id", item.id);

      console.log(`  ✅ Created article: ${article.slug}`);
      successful++;
    } catch (error) {
      console.error(`  ❌ Error:`, error);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Successfully converted: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("=".repeat(50));
}

// Run the migration
convertApprovedRssItems()
  .then(() => {
    console.log("\n🎉 Migration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
