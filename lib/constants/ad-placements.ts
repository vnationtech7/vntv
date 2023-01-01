/**
 * Ad Slot Placement Constants
 * Common ad slot placements used across the platform
 * Includes aspect ratio recommendations and dimension guidelines
 */

export const AD_PLACEMENTS = [
  { 
    value: "homepage_top", 
    label: "Homepage Top Banner",
    ratio: "16:3",
    width: 1200,
    height: 225,
    description: "Wide banner above homepage hero"
  },
  { 
    value: "homepage_hero", 
    label: "Homepage Hero Section",
    ratio: "16:9",
    width: 1200,
    height: 675,
    description: "Large hero area banner"
  },
  { 
    value: "homepage_sidebar", 
    label: "Homepage Sidebar",
    ratio: "1:1",
    width: 300,
    height: 300,
    description: "Square sidebar ad"
  },
  { 
    value: "homepage_mid_content", 
    label: "Homepage Mid Content",
    ratio: "16:3",
    width: 1200,
    height: 225,
    description: "Wide banner between content sections"
  },
  { 
    value: "article_top", 
    label: "Article Top Banner",
    ratio: "16:3",
    width: 1200,
    height: 225,
    description: "Wide banner above article"
  },
  { 
    value: "article_inline", 
    label: "Article Inline (Mid-content)",
    ratio: "4:1",
    width: 800,
    height: 200,
    description: "Horizontal banner in article content"
  },
  { 
    value: "article_sidebar", 
    label: "Article Sidebar",
    ratio: "1:1",
    width: 300,
    height: 300,
    description: "Square sidebar ad"
  },
  { 
    value: "article_bottom", 
    label: "Article Bottom",
    ratio: "16:3",
    width: 1200,
    height: 225,
    description: "Wide banner below article"
  },
  { 
    value: "video_top", 
    label: "Video Page Top",
    ratio: "16:3",
    width: 1200,
    height: 225,
    description: "Wide banner above video"
  },
  { 
    value: "video_sponsor", 
    label: "Video Sponsorship Banner",
    ratio: "16:2",
    width: 1200,
    height: 150,
    description: "Slim sponsor banner"
  },
  { 
    value: "video_sidebar", 
    label: "Video Page Sidebar",
    ratio: "1:1",
    width: 300,
    height: 300,
    description: "Square sidebar ad on video pages"
  },
  { 
    value: "category_top", 
    label: "Category Page Top",
    ratio: "16:3",
    width: 1200,
    height: 225,
    description: "Wide banner above category"
  },
  { 
    value: "category_sidebar", 
    label: "Category Page Sidebar",
    ratio: "1:1",
    width: 300,
    height: 300,
    description: "Square sidebar ad"
  },
] as const;

export type AdPlacement = typeof AD_PLACEMENTS[number]["value"];

/**
 * Get placement details by value
 */
export function getPlacementDetails(value: string) {
  return AD_PLACEMENTS.find(p => p.value === value);
}

/**
 * Validate image dimensions against placement requirements
 * Returns true if dimensions match exactly (strict validation)
 */
export function validateImageDimensions(
  width: number,
  height: number,
  placementValue: string
): { valid: boolean; message: string } {
  const placement = getPlacementDetails(placementValue);
  
  if (!placement) {
    return { valid: false, message: "Invalid placement" };
  }

  const expectedWidth = placement.width;
  const expectedHeight = placement.height;

  if (width === expectedWidth && height === expectedHeight) {
    return { valid: true, message: "Perfect match!" };
  }

  return {
    valid: false,
    message: `Image must be exactly ${expectedWidth}x${expectedHeight}px (${placement.ratio}). Your image is ${width}x${height}px.`
  };
}
