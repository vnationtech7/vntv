"use client";

import { useState, useEffect, ImgHTMLAttributes } from "react";
import {
  getOptimizedImageUrl,
  getBlurPlaceholderUrl,
  generateResponsiveImageSet,
  ImageSize,
  ImageFormat,
} from "@/lib/utils/image-optimizer";

export interface OptimizedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  src: string;
  alt: string;
  size?: ImageSize;
  quality?: number;
  format?: ImageFormat;
  responsive?: boolean;
  lazyLoad?: boolean;
  blurPlaceholder?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage Component
 * Automatically optimizes images with WebP conversion, responsive srcSet, and lazy loading
 */
export function OptimizedImage({
  src,
  alt,
  size = "medium",
  quality = 85,
  format = "webp",
  responsive = true,
  lazyLoad = true,
  blurPlaceholder = true,
  className = "",
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    if (responsive) {
      const imageSet = generateResponsiveImageSet(src, { quality, format });
      setImageSrc(imageSet.src);
    } else {
      const optimizedUrl = getOptimizedImageUrl(src, {
        quality,
        format,
        fit: "cover",
      });
      setImageSrc(optimizedUrl);
    }
  }, [src, quality, format, responsive]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    // Fallback to original image
    setImageSrc(src);
    onError?.();
  };

  if (hasError && !src) {
    return (
      <div
        className={`flex items-center justify-center bg-background-secondary text-text-tertiary ${className}`}
      >
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  const blurDataUrl = blurPlaceholder ? getBlurPlaceholderUrl(src) : undefined;

  if (responsive) {
    const imageSet = generateResponsiveImageSet(src, { quality, format });

    return (
      <picture>
        {/* WebP source for modern browsers */}
        <source type="image/webp" srcSet={imageSet.webpSrcSet} sizes={imageSet.sizes} />
        
        {/* Fallback for browsers that don't support WebP */}
        <img
          src={imageSrc}
          srcSet={imageSet.srcSet}
          sizes={imageSet.sizes}
          alt={alt}
          loading={lazyLoad ? "lazy" : "eager"}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${!isLoaded && blurPlaceholder ? "blur-sm" : ""} transition-all duration-300`}
          style={{
            backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          {...props}
        />
      </picture>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={lazyLoad ? "lazy" : "eager"}
      onLoad={handleLoad}
      onError={handleError}
      className={`${className} ${!isLoaded && blurPlaceholder ? "blur-sm" : ""} transition-all duration-300`}
      style={{
        backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      {...props}
    />
  );
}
