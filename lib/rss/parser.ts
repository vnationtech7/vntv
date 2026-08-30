import crypto from "crypto";

export interface ParsedRssItem {
  external_id: string | null;
  guid: string | null;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  author: string | null;
  image_url: string | null;
  published_at: Date | null;
  content_hash: string;
  raw_payload: any;
}

export interface RssParseResult {
  items: ParsedRssItem[];
  feedTitle?: string;
  feedDescription?: string;
  error?: string;
}

/**
 * Parse RSS or Atom feed from XML string
 */
export async function parseRssFeed(xmlContent: string): Promise<RssParseResult> {
  try {
    // Detect feed type
    const isAtom = xmlContent.includes("<feed") && xmlContent.includes("xmlns=\"http://www.w3.org/2005/Atom\"");
    const isRss = xmlContent.includes("<rss") || xmlContent.includes("<channel");

    if (isAtom) {
      return parseAtomFeed(xmlContent);
    } else if (isRss) {
      return parseRss2Feed(xmlContent);
    } else {
      return {
        items: [],
        error: "Unknown feed format. Must be RSS 2.0 or Atom.",
      };
    }
  } catch (error) {
    console.error("RSS parse error:", error);
    return {
      items: [],
      error: error instanceof Error ? error.message : "Failed to parse feed",
    };
  }
}

/**
 * Parse RSS 2.0 feed
 */
function parseRss2Feed(xmlContent: string): RssParseResult {
  const items: ParsedRssItem[] = [];

  // Extract feed metadata
  const channelMatch = xmlContent.match(/<channel[^>]*>([\s\S]*?)<\/channel>/);
  const channelContent = channelMatch ? channelMatch[1] : xmlContent;

  const feedTitle = extractTextContent(channelContent, "title", true);
  const feedDescription = extractTextContent(channelContent, "description", true);

  // Extract all items
  const itemMatches = channelContent.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    const itemContent = match[1];

    try {
      const title = extractTextContent(itemContent, "title");
      const link = extractTextContent(itemContent, "link");
      const guid = extractTextContent(itemContent, "guid");
      const description = extractTextContent(itemContent, "description");
      const content = extractTextContent(itemContent, "content:encoded") || 
                     extractTextContent(itemContent, "content");
      const author = extractTextContent(itemContent, "author") || 
                    extractTextContent(itemContent, "dc:creator");
      const pubDate = extractTextContent(itemContent, "pubDate");

      // Extract image
      let imageUrl: string | null = null;
      const mediaContent = itemContent.match(/<media:content[^>]+url=["']([^"']+)["']/);
      const mediaThumbnail = itemContent.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/);
      const enclosure = itemContent.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/);
      
      imageUrl = mediaContent?.[1] || mediaThumbnail?.[1] || enclosure?.[1] || null;

      // If no image found, try to extract from description/content
      if (!imageUrl && (description || content)) {
        const imgMatch = (description || content || "").match(/<img[^>]+src=["']([^"']+)["']/);
        imageUrl = imgMatch?.[1] || null;
      }

      if (!title || !link) {
        continue; // Skip items without title or link
      }

      // Calculate content hash for deduplication
      const contentForHash = `${title}|${link}|${description || ""}`.toLowerCase();
      const content_hash = calculateHash(contentForHash);

      items.push({
        external_id: guid || link,
        guid: guid || link,
        title: cleanText(title),
        description: description ? cleanText(description) : null,
        content: content ? cleanText(content) : null,
        url: link,
        author: author ? cleanText(author) : null,
        image_url: imageUrl,
        published_at: pubDate ? parseDate(pubDate) : null,
        content_hash,
        raw_payload: { itemContent }, // Store raw for debugging
      });
    } catch (error) {
      console.error("Error parsing RSS item:", error);
      continue;
    }
  }

  return {
    items,
    feedTitle: feedTitle ? cleanText(feedTitle) : undefined,
    feedDescription: feedDescription ? cleanText(feedDescription) : undefined,
  };
}

/**
 * Parse Atom feed
 */
function parseAtomFeed(xmlContent: string): RssParseResult {
  const items: ParsedRssItem[] = [];

  // Extract feed metadata
  const feedTitle = extractTextContent(xmlContent, "title", true);
  const feedSubtitle = extractTextContent(xmlContent, "subtitle", true);

  // Extract all entries
  const entryMatches = xmlContent.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/g);

  for (const match of entryMatches) {
    const entryContent = match[1];

    try {
      const title = extractTextContent(entryContent, "title");
      const linkMatch = entryContent.match(/<link[^>]+href=["']([^"']+)["']/);
      const link = linkMatch?.[1];
      const id = extractTextContent(entryContent, "id");
      const summary = extractTextContent(entryContent, "summary");
      const content = extractTextContent(entryContent, "content");
      const authorName = extractTextContent(entryContent, "author>name");
      const published = extractTextContent(entryContent, "published");
      const updated = extractTextContent(entryContent, "updated");

      // Extract image from content or media elements
      let imageUrl: string | null = null;
      const mediaMatch = entryContent.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/);
      imageUrl = mediaMatch?.[1] || null;

      if (!imageUrl && (summary || content)) {
        const imgMatch = (summary || content || "").match(/<img[^>]+src=["']([^"']+)["']/);
        imageUrl = imgMatch?.[1] || null;
      }

      if (!title || !link) {
        continue;
      }

      // Calculate content hash
      const contentForHash = `${title}|${link}|${summary || ""}`.toLowerCase();
      const content_hash = calculateHash(contentForHash);

      items.push({
        external_id: id || link,
        guid: id || link,
        title: cleanText(title),
        description: summary ? cleanText(summary) : null,
        content: content ? cleanText(content) : null,
        url: link,
        author: authorName ? cleanText(authorName) : null,
        image_url: imageUrl,
        published_at: parseDate(published || updated || ""),
        content_hash,
        raw_payload: { entryContent },
      });
    } catch (error) {
      console.error("Error parsing Atom entry:", error);
      continue;
    }
  }

  return {
    items,
    feedTitle: feedTitle ? cleanText(feedTitle) : undefined,
    feedDescription: feedSubtitle ? cleanText(feedSubtitle) : undefined,
  };
}

/**
 * Extract text content from XML tag
 */
function extractTextContent(xml: string, tagName: string, first = false): string | null {
  const pattern = first 
    ? new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`)
    : new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`);
  
  const match = xml.match(pattern);
  return match ? match[1].trim() : null;
}

/**
 * Clean HTML and decode entities
 */
function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // Remove CDATA
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

/**
 * Parse various date formats
 */
function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Calculate SHA-256 hash of content for deduplication
 */
function calculateHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Fetch and parse RSS feed from URL
 */
export async function fetchAndParseRssFeed(url: string): Promise<RssParseResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        items: [],
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const xmlContent = await response.text();
    return parseRssFeed(xmlContent);
  } catch (error) {
    console.error("RSS fetch error:", error);
    return {
      items: [],
      error: error instanceof Error ? error.message : "Failed to fetch feed",
    };
  }
}
