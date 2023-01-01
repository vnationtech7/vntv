import { AdSlot } from "./ad-slot";

/**
 * Video Ad Slots
 * Pre-configured ad slot components for video pages
 */

export function VideoTopSponsor() {
  return (
    <div className="w-full mb-4">
      <AdSlot slotKey="video_sponsor" />
    </div>
  );
}

export function VideoSidebar() {
  return (
    <div className="sticky top-20">
      <AdSlot slotKey="video_sidebar" />
    </div>
  );
}

export function VideoTopBanner() {
  return (
    <div className="w-full mt-6">
      <AdSlot slotKey="video_top" />
    </div>
  );
}
