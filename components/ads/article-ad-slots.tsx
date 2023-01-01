import { AdSlot } from "./ad-slot";

/**
 * Article Ad Slots
 * Pre-configured ad slot components for article pages
 */

export function ArticleTopBanner() {
  return (
    <div className="w-full mb-6">
      <AdSlot slotKey="article_top" />
    </div>
  );
}

export function ArticleInline() {
  return (
    <div className="my-8">
      <AdSlot slotKey="article_inline" />
    </div>
  );
}

export function ArticleSidebar() {
  return (
    <div className="sticky top-20 space-y-6">
      <AdSlot slotKey="article_sidebar" />
    </div>
  );
}

export function ArticleBottomBanner() {
  return (
    <div className="w-full mt-8">
      <AdSlot slotKey="article_bottom" />
    </div>
  );
}
