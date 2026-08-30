/**
 * Image Optimization Utilities
 * Handles image resizing, format conversion, and CDN URL generation
 */

export type ImageSize = 
  | "thumbnail"    // 150x150
  | "small"        // 400x300
  | "medium"       // 800x600
  | "large"        // 1200x900
  | "xlarge"       // 1600x1200
  | "original";    // Original size

export type ImageFormat = "webp" | "jpeg" | "png" | "original";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: ImageFormat;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

export interface ResponsiveImageSet {
  src: string;
  srcSet: string;
  sizes: string;
  webpSrcSet?: string;
}

/**
 * Size presets for common use cases
 */
export const IMAGE_SIZE_PRESETS: Record<ImageSize, { width: number; height: number }> = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 400, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 },
  xlarge: { width: 1600, height: 1200 },
  original: { width: 0, height: 0 }, // Will use original dimensions
};

/**
 * Generate Supabase Storage transform URL
 * Supabase Storage supports image transformations via URL parameters
 */
export function getOptimizedImageUrl(
  publicUrl: string,
  options: ImageTransformOptions = {}
): string {
  try {
    const url = new URL(publicUrl);
    const params = new URLSearchParams();

    // Add transformation parameters
    if (options.width) {
      params.append("width", options.width.toString());
    }

    if (options.height) {
      params.append("height", options.height.toString());
    }

    if (options.quality && options.quality >= 1 && options.quality <= 100) {
      params.append("quality", options.quality.toString());
    }

    if (options.format && options.format !== "original") {
      params.append("format", options.format);
    }

    if (options.fit) {
      params.append("resize", options.fit);
    }

    // Append transform params to URL
    const transformParams = params.toString();
    if (transformParams) {
      url.search = transformParams;
    }

    return url.toString();
  } catch (error) {
    console.error("Error generating optimized image URL:", error);
    return publicUrl; // Fallback to original URL
  }
}

/**
 * Get image URL with preset size
 */
export function getImageUrlBySize(
  publicUrl: string,
  size: ImageSize,
  quality: number = 85
): string {
  if (size === "original") {
    return publicUrl;
  }

  const preset = IMAGE_SIZE_PRESETS[size];
  return getOptimizedImageUrl(publicUrl, {
    width: preset.width,
    height: preset.height,
    quality,
    format: "webp", // Use WebP for better compression
    fit: "cover",
  });
}

/**
 * Generate responsive image srcset for different screen sizes
 */
export function generateResponsiveImageSet(
  publicUrl: string,
  options: {
    sizes?: ImageSize[];
    quality?: number;
    format?: ImageFormat;
  } = {}
): ResponsiveImageSet {
  const sizes = options.sizes || ["small", "medium", "large", "xlarge"];
  const quality = options.quality || 85;
  const format = options.format || "webp";

  // Generate srcSet for different widths
  const srcSetEntries = sizes.map((size) => {
    const preset = IMAGE_SIZE_PRESETS[size];
    const url = getOptimizedImageUrl(publicUrl, {
      width: preset.width,
      quality,
      format,
      fit: "cover",
    });
    return `${url} ${preset.width}w`;
  });

  // Also generate WebP srcSet
  const webpSrcSetEntries = sizes.map((size) => {
    const preset = IMAGE_SIZE_PRESETS[size];
    const url = getOptimizedImageUrl(publicUrl, {
      width: preset.width,
      quality,
      format: "webp",
      fit: "cover",
    });
    return `${url} ${preset.width}w`;
  });

  // Default src (medium size)
  const defaultSrc = getImageUrlBySize(publicUrl, "medium", quality);

  return {
    src: defaultSrc,
    srcSet: srcSetEntries.join(", "),
    sizes: "(max-width: 640px) 400px, (max-width: 1024px) 800px, (max-width: 1536px) 1200px, 1600px",
    webpSrcSet: webpSrcSetEntries.join(", "),
  };
}

/**
 * Get thumbnail URL (optimized for list views)
 */
export function getThumbnailUrl(publicUrl: string, size: number = 150): string {
  return getOptimizedImageUrl(publicUrl, {
    width: size,
    height: size,
    quality: 80,
    format: "webp",
    fit: "cover",
  });
}

/**
 * Get blur placeholder URL (very small, low quality for lazy loading)
 */
export function getBlurPlaceholderUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    width: 20,
    quality: 20,
    format: "webp",
    fit: "cover",
  });
}

/**
 * Check if browser supports WebP format
 * Can be used on client side for fallback logic
 */
export function supportsWebP(): boolean {
  if (typeof window === "undefined") return false;

  const canvas = document.createElement("canvas");
  if (canvas.getContext && canvas.getContext("2d")) {
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }
  return false;
}

/**
 * Calculate aspect ratio from dimensions
 */
export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Get dimensions for a target width while maintaining aspect ratio
 */
export function getDimensionsForWidth(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
): { width: number; height: number } {
  const aspectRatio = originalHeight / originalWidth;
  return {
    width: targetWidth,
    height: Math.round(targetWidth * aspectRatio),
  };
}

/**
 * Get dimensions for a target height while maintaining aspect ratio
 */
export function getDimensionsForHeight(
  originalWidth: number,
  originalHeight: number,
  targetHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  return {
    width: Math.round(targetHeight * aspectRatio),
    height: targetHeight,
  };
}

/**
 * Estimate file size reduction from optimization
 * Returns approximate percentage reduction
 */
export function estimateOptimizationSavings(
  originalFormat: string,
  originalSize: number,
  targetFormat: ImageFormat,
  quality: number = 85
): { estimatedSize: number; savingsPercent: number } {
  let reductionFactor = 1;

  // Format conversion savings
  if (targetFormat === "webp") {
    if (originalFormat.includes("png")) {
      reductionFactor = 0.6; // WebP typically 40% smaller than PNG
    } else if (originalFormat.includes("jpeg") || originalFormat.includes("jpg")) {
      reductionFactor = 0.75; // WebP typically 25% smaller than JPEG
    }
  }

  // Quality reduction savings
  if (quality < 100) {
    reductionFactor *= quality / 100;
  }

  const estimatedSize = Math.round(originalSize * reductionFactor);
  const savingsPercent = Math.round(((originalSize - estimatedSize) / originalSize) * 100);

  return {
    estimatedSize,
    savingsPercent,
  };
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Generate CDN cache-busting URL
 */
export function getCacheBustedUrl(url: string, version?: string | number): string {
  const separator = url.includes("?") ? "&" : "?";
  const timestamp = version || Date.now();
  return `${url}${separator}v=${timestamp}`;
}
