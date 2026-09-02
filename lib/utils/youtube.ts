/**
 * YouTube utility functions
 * These are pure functions with no server dependencies
 */

/**
 * Extract YouTube video ID from URL
 * Supports all YouTube URL formats including Shorts
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // If it's already just an ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Remove protocol and www if present
  let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Try multiple extraction methods
  let videoId: string | null = null;

  // Method 1: Extract from query parameter (watch?v=)
  const vParam = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vParam && vParam[1]) {
    videoId = vParam[1];
  }

  // Method 2: Extract from path (youtu.be/, shorts/, embed/, v/)
  if (!videoId) {
    const pathMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    if (pathMatch && pathMatch[1]) {
      videoId = pathMatch[1];
    }
  }

  // Method 3: Find any 11-character alphanumeric string (last resort)
  if (!videoId) {
    const anyMatch = cleanUrl.match(/([a-zA-Z0-9_-]{11})/);
    if (anyMatch && anyMatch[1]) {
      videoId = anyMatch[1];
    }
  }

  return videoId;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: "default" | "hq" | "mq" | "sd" | "maxres" = "hq"
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
