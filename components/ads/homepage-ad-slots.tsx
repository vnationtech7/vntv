import { AdSlot } from "./ad-slot";

/**
 * Homepage Ad Slots
 * Pre-configured ad slot components for homepage placements
 */

export function HomepageTopBanner() {
  return (
    <div className="w-full max-w-7xl mx-auto mb-8 max-h-[100px]">
      <AdSlot slotKey="homepage_top" />
    </div>
  );
}

export function HomepageHeroAd() {
  return (
    <div className="w-full mb-6">
      <AdSlot slotKey="homepage_hero" />
    </div>
  );
}

export function HomepageSidebar() {
  return (
    <div className="sticky top-20 space-y-6">
      <AdSlot slotKey="homepage_sidebar" />
    </div>
  );
}

export function HomepageMidContent() {
  return (
    <div className="w-full my-8">
      <AdSlot slotKey="homepage_mid_content" />
    </div>
  );
}
