# Image Optimization Guide

This guide explains how to use the VNTV image optimization system for better performance and user experience.

## Overview

The VNTV CMS includes a comprehensive image optimization system that provides:

- **Automatic WebP Conversion**: Images are automatically served in WebP format (with fallbacks)
- **Responsive Images**: Multiple sizes generated for different screen sizes
- **Lazy Loading**: Images load only when needed
- **Blur Placeholders**: Low-quality placeholders while images load
- **CDN Integration**: Optimized delivery through Supabase Storage CDN
- **Smart Caching**: Efficient browser and CDN caching

## Quick Start

### Using the OptimizedImage Component

The easiest way to display optimized images:

```tsx
import { OptimizedImage } from "@/components/ui/optimized-image";

export function MyComponent() {
  return (
    <OptimizedImage
      src="https://your-supabase-url.com/storage/v1/object/public/media/image.jpg"
      alt="Description of image"
      size="medium"
      quality={85}
      responsive={true}
      lazyLoad={true}
      blurPlaceholder={true}
      className="rounded-lg"
    />
  );
}
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | required | Image URL |
| `alt` | string | required | Alt text for accessibility |
| `size` | ImageSize | "medium" | Preset size: thumbnail, small, medium, large, xlarge, original |
| `quality` | number | 85 | JPEG/WebP quality (1-100) |
| `format` | ImageFormat | "webp" | Output format: webp, jpeg, png, original |
| `responsive` | boolean | true | Generate responsive srcSet |
| `lazyLoad` | boolean | true | Enable lazy loading |
| `blurPlaceholder` | boolean | true | Show blur placeholder while loading |
| `className` | string | "" | CSS classes |

## Image Size Presets

Pre-configured sizes for common use cases:

```typescript
thumbnail:  150x150   // List views, avatars
small:      400x300   // Mobile devices
medium:     800x600   // Tablets, default
large:      1200x900  // Desktop
xlarge:     1600x1200 // Large screens
original:   -         // Original dimensions
```

## Manual Optimization

For more control, use the utility functions:

### Get Optimized URL

```typescript
import { getOptimizedImageUrl } from "@/lib/utils/image-optimizer";

const optimizedUrl = getOptimizedImageUrl(originalUrl, {
  width: 800,
  height: 600,
  quality: 85,
  format: "webp",
  fit: "cover",
});
```

### Get Thumbnail

```typescript
import { getThumbnailUrl } from "@/lib/utils/image-optimizer";

const thumbnailUrl = getThumbnailUrl(originalUrl, 200); // 200x200
```

### Generate Responsive Set

```typescript
import { generateResponsiveImageSet } from "@/lib/utils/image-optimizer";

const imageSet = generateResponsiveImageSet(originalUrl, {
  sizes: ["small", "medium", "large"],
  quality: 85,
  format: "webp",
});

// Use in JSX
<img
  src={imageSet.src}
  srcSet={imageSet.srcSet}
  sizes={imageSet.sizes}
  alt="Description"
/>
```

## Using with Media Assets

When working with media from the database:

```typescript
import { getOptimizedMediaUrl, getMediaThumbnailUrl } from "@/app/admin/media/actions";

// Get optimized URL for a media asset
const optimizedUrl = getOptimizedMediaUrl(mediaAsset, {
  width: 800,
  quality: 85,
  format: "webp",
});

// Get thumbnail
const thumbnailUrl = getMediaThumbnailUrl(mediaAsset, 150);
```

## Best Practices

### 1. Choose the Right Size

Use the smallest size that looks good:

```tsx
// ✅ Good - appropriate size for context
<OptimizedImage src={url} size="small" alt="Thumbnail" />

// ❌ Bad - unnecessarily large
<OptimizedImage src={url} size="xlarge" alt="Thumbnail" />
```

### 2. Use Responsive Images

Always enable responsive images for content:

```tsx
// ✅ Good - responsive
<OptimizedImage 
  src={url} 
  alt="Article image"
  responsive={true}
/>

// ❌ Bad - single size
<OptimizedImage 
  src={url} 
  alt="Article image"
  responsive={false}
/>
```

### 3. Enable Lazy Loading

Lazy load images below the fold:

```tsx
// ✅ Good - lazy load
<OptimizedImage 
  src={url} 
  alt="Image"
  lazyLoad={true}
/>

// Only disable for above-the-fold images
<OptimizedImage 
  src={heroImage} 
  alt="Hero"
  lazyLoad={false}
/>
```

### 4. Optimize Quality

Balance quality and file size:

- **90-100**: Critical images (hero, featured)
- **80-90**: Standard content images
- **70-80**: Thumbnails, background images
- **50-70**: Decorative elements

```tsx
// Hero image - high quality
<OptimizedImage src={hero} alt="Hero" quality={95} />

// Thumbnail - lower quality
<OptimizedImage src={thumb} alt="Thumb" quality={75} />
```

### 5. Use WebP with Fallbacks

The `OptimizedImage` component automatically provides fallbacks:

```tsx
// This generates:
// <picture>
//   <source type="image/webp" srcSet="..." />
//   <img src="fallback.jpg" ... />
// </picture>
<OptimizedImage src={url} alt="Image" format="webp" />
```

## Performance Tips

### Preload Critical Images

For above-the-fold images:

```tsx
// In head
<link 
  rel="preload" 
  as="image" 
  href={getOptimizedImageUrl(url, { width: 800, format: "webp" })}
/>
```

### Use Blur Placeholders

Improves perceived performance:

```tsx
<OptimizedImage 
  src={url} 
  alt="Image"
  blurPlaceholder={true} // Shows blur while loading
/>
```

### Cache Bust When Needed

For updated images:

```typescript
import { getCacheBustedUrl } from "@/lib/utils/image-optimizer";

const url = getCacheBustedUrl(imageUrl, Date.now());
```

## Troubleshooting

### Image Not Loading

1. Check the source URL is valid
2. Verify storage permissions in Supabase
3. Check browser console for errors
4. Try `format="original"` to bypass optimization

### Poor Image Quality

1. Increase `quality` prop (85-95)
2. Use larger size preset
3. Check original image quality

### Slow Loading

1. Enable `lazyLoad={true}`
2. Use smaller size presets
3. Reduce quality for non-critical images
4. Check network conditions

## API Reference

### Utility Functions

```typescript
// Get optimized URL
getOptimizedImageUrl(url, options): string

// Get thumbnail URL
getThumbnailUrl(url, size): string

// Get blur placeholder
getBlurPlaceholderUrl(url): string

// Generate responsive set
generateResponsiveImageSet(url, options): ResponsiveImageSet

// Calculate aspect ratio
getAspectRatio(width, height): string

// Format file size
formatFileSize(bytes): string

// Estimate optimization savings
estimateOptimizationSavings(format, size, targetFormat, quality): { estimatedSize, savingsPercent }
```

### Server Actions

```typescript
// Get optimized media URL
getOptimizedMediaUrl(asset, options): string

// Get media thumbnail
getMediaThumbnailUrl(asset, size): string

// Get public URL
getMediaPublicUrl(storagePath): string
```

## Examples

### Article Featured Image

```tsx
<OptimizedImage
  src={article.featured_image_url}
  alt={article.title}
  size="large"
  quality={90}
  responsive={true}
  lazyLoad={false} // Above fold
  className="w-full rounded-lg"
/>
```

### Thumbnail Grid

```tsx
{items.map(item => (
  <OptimizedImage
    key={item.id}
    src={item.image_url}
    alt={item.title}
    size="thumbnail"
    quality={75}
    lazyLoad={true}
    className="h-32 w-32 object-cover rounded"
  />
))}
```

### Hero Banner

```tsx
<OptimizedImage
  src={heroImage}
  alt="Hero banner"
  size="xlarge"
  quality={95}
  responsive={true}
  lazyLoad={false}
  blurPlaceholder={true}
  className="w-full h-[600px] object-cover"
/>
```

## Further Reading

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [WebP Image Format](https://developers.google.com/speed/webp)
- [Responsive Images MDN](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Image Lazy Loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading)
