import { AdSlot } from "./ad-slot";

/**
 * Category Ad Slots
 * Pre-configured ad slot components for category pages
 */

export function CategoryTopBanner() {
  return (
    <div className="w-full mb-6">
      <AdSlot slotKey="category_top" />
    </div>
  );
}

export function CategorySidebar() {
  return (
    <div className="sticky top-20">
      <AdSlot slotKey="category_sidebar" />
    </div>
  );
}
