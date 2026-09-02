"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, Video } from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils/youtube";
import type { FeaturedContent } from "@/app/actions/homepage";

interface HeroSectionProps {
  content: FeaturedContent[];
}

export function HeroSection({ content }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Debug logging
  console.log("HeroSection content:", JSON.stringify(content, null, 2));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (content.length <= 1 || !autoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % content.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [content.length, autoplay]);

  useEffect(() => {
    // Reset video when changing content
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (autoplay && currentItem.content_type === 'video') {
        videoRef.current.play().catch(() => {
          // Autoplay failed, probably due to browser policy
          setIsPlaying(false);
        });
      }
    }
  }, [currentIndex]);

  if (!content || content.length === 0) {
    return (
      <section className="relative">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="lg:col-span-2">
              <div className="relative aspect-[16/9] w-full animate-pulse overflow-hidden rounded-lg bg-[--panel]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentItem = content[currentIndex];
  const sidebarItems = content.slice(1, 4); // Always limit to 3 items max

  const getImageUrl = (storagePath: string | undefined) => {
    if (!storagePath) return null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const url = `${supabaseUrl}/storage/v1/object/public/${storagePath}`;
    console.log("Generated image URL:", url, "from storage_path:", storagePath);
    return url;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const imageUrl = currentItem.featured_image?.storage_path
    ? getImageUrl(currentItem.featured_image.storage_path)
    : currentItem.content_type === 'video' && currentItem.source_type === 'youtube' && currentItem.source_url
    ? (() => {
        const videoId = extractYouTubeId(currentItem.source_url);
        return videoId ? getYouTubeThumbnail(videoId, "maxres") : null;
      })()
    : null;

  console.log("Current item:", currentItem);
  console.log("Featured image:", currentItem.featured_image);
  console.log("Image URL:", imageUrl);

  const isVideo = currentItem.content_type === 'video';
  const videoUrl = isVideo && currentItem.source_type === 'upload' && currentItem.source_url
    ? getImageUrl(currentItem.source_url)
    : null;

  return (
    <section className="bg-[--bg] py-8">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 lg:items-start">
          {/* Main Hero */}
          <Link
            href={isVideo ? `/videos/${currentItem.slug}` : `/news/${currentItem.slug}`}
            className="group relative rounded-lg overflow-hidden bg-[--panel] aspect-video block lg:h-[440px]"
          >
            {/* Background - Video or Image */}
            <div className="absolute inset-0">
              {isVideo && videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={imageUrl || undefined}
                  loop
                  muted={muted}
                  playsInline
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentItem.featured_image?.alt_text || currentItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[--panel] to-[--panel-2]" />
              )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Video Indicator (top right) */}
            {isVideo && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Video className="w-4 h-4 text-white" />
                {currentItem.duration_seconds && (
                  <span className="text-xs font-bold text-white">
                    {formatDuration(currentItem.duration_seconds)}
                  </span>
                )}
              </div>
            )}

            {/* Video Controls (center) */}
            {isVideo && videoUrl && (
              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (videoRef.current) {
                      if (isPlaying) {
                        videoRef.current.pause();
                      } else {
                        videoRef.current.play();
                      }
                    }
                  }}
                  className="w-16 h-16 rounded-full bg-[--red] flex items-center justify-center hover:bg-[#c11026] transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" fill="white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  )}
                </button>
              </div>
            )}

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-end p-8">
              {/* TOP STORY Badge */}
              <div className="mb-4">
                <span className="inline-block bg-[--red] text-white text-xs font-extrabold tracking-wider px-4 py-2 rounded">
                  {isVideo ? 'FEATURED VIDEO' : 'TOP STORY'}
                </span>
              </div>

              {/* Category Badge */}
              {currentItem.category && (
                <div className="mb-3">
                  <span className="text-[--red] text-xs font-extrabold tracking-wide uppercase">
                    {currentItem.category.name}
                  </span>
                </div>
              )}

              {/* Headline */}
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 max-w-2xl group-hover:text-[--red] transition-colors">
                {currentItem.title}
              </h1>

              {/* Excerpt */}
              {currentItem.excerpt && (
                <p className="text-sm text-gray-300 mb-4 max-w-xl line-clamp-2">
                  {currentItem.excerpt}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
                {currentItem.author && (
                  <>
                    <span>{currentItem.author.name}</span>
                    <span>•</span>
                  </>
                )}
                <span suppressHydrationWarning>
                  {mounted ? getTimeAgo(currentItem.published_at || '') : '...'}
                </span>
              </div>

              {/* CTA */}
              <div className="inline-flex items-center gap-2 bg-[--red] text-white text-sm font-extrabold tracking-wide px-6 py-3 rounded-md w-fit hover:bg-[#c11026] transition-colors">
                {isVideo ? (
                  <>
                    <Play className="w-4 h-4" fill="currentColor" />
                    WATCH NOW
                  </>
                ) : (
                  'READ FULL STORY'
                )}
              </div>
            </div>

            {/* Carousel Dots */}
            {content.length > 1 && (
              <div className="absolute bottom-6 right-6 z-30 flex gap-2">
                {content.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-[--red]'
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Autoplay & Mute Controls */}
            {isVideo && (
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setAutoplay(!autoplay);
                  }}
                  className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
                  aria-label="Toggle autoplay"
                >
                  {autoplay ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMuted(!muted);
                  }}
                  className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
                  aria-label="Toggle mute"
                >
                  {muted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            )}
          </Link>

          {/* Sidebar - Top Stories */}
          <div className="flex flex-col gap-3 lg:h-[440px]">
            {sidebarItems.slice(0, 3).map((item) => {
              const itemImageUrl = item.featured_image?.storage_path
                ? getImageUrl(item.featured_image.storage_path)
                : item.content_type === 'video' && item.source_type === 'youtube' && item.source_url
                ? (() => {
                    const videoId = extractYouTubeId(item.source_url);
                    return videoId ? getYouTubeThumbnail(videoId, "hq") : null;
                  })()
                : null;
              const itemIsVideo = item.content_type === 'video';

              return (
                <Link
                  key={item.id}
                  href={itemIsVideo ? `/videos/${item.slug}` : `/news/${item.slug}`}
                  className="group bg-[--panel] border border-[--border] rounded-lg overflow-hidden flex-1 relative hover:border-[--red] transition-colors"
                >
                  {/* Full-size Thumbnail */}
                  <div className="relative h-full min-h-[140px] bg-black">
                    {itemImageUrl ? (
                      <img
                        src={itemImageUrl}
                        alt={item.featured_image?.alt_text || item.title}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[--panel] to-[--panel-2]" />
                    )}
                    
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Video Play Icon */}
                    {itemIsVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 border-2 border-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    )}

                    {/* Video Indicator Badge */}
                    {itemIsVideo && item.duration_seconds && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded">
                        <span className="text-xs text-white font-bold">
                          {formatDuration(item.duration_seconds)}
                        </span>
                      </div>
                    )}

                    {/* Content Overlay - at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      {/* Title */}
                      <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-2 text-white drop-shadow-lg group-hover:text-[--red] transition-colors">
                        {item.title}
                      </h3>

                      {/* Time */}
                      <p className="text-xs text-white/80 font-medium" suppressHydrationWarning>
                        {mounted ? getTimeAgo(item.published_at || '') : '...'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
