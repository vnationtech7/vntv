/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate episode slug from title and episode number
 */
export function generateEpisodeSlug(title: string, episodeNumber: number): string {
  const titleSlug = generateSlug(title);
  return `episode-${episodeNumber}-${titleSlug}`;
}

/**
 * Generate a unique slug by checking against existing slugs
 */
export async function generateUniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> {
  let slug = generateSlug(text);
  let attempt = 1;

  while (attempt <= maxAttempts) {
    const exists = await checkExists(slug);
    if (!exists) {
      return slug;
    }
    slug = `${generateSlug(text)}-${attempt}`;
    attempt++;
  }

  // Fallback: append timestamp
  return `${generateSlug(text)}-${Date.now()}`;
}
