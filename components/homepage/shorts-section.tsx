"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils/youtube";

interface ShortsSectionProps {
  shorts: Array<{
    id: string;
    title: string;
    slug: string;
    source_type: string;
    source_url: string;
    thumbnail?: { storage_path: string } | null;
    video_type?: string;
  }>;
}

export function ShortsSection({ shorts }: ShortsSectionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});

  if (!shorts || shorts.length === 0) {
    return null;
  }

  const handleMouseEnter = (id: string, isYouTube: boolean) => {
    setHoveredId(id);
    
    if (isYouTube) {
      // For YouTube videos, send play command via postMessage
      const iframe = iframeRefs.current[id];
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
      }
    } else {
      // For uploaded videos
      const video = videoRefs.current[id];
      console.log('[Shorts Hover] Attempting to play uploaded video:', id, video);
      if (video) {
        video.muted = true;
        video.play().then(() => {
          console.log('[Shorts Hover] Video playing successfully');
        }).catch((error) => {
          console.error('[Shorts Hover] Autoplay failed:', error);
        });
      } else {
        console.error('[Shorts Hover] Video element not found for id:', id);
      }
    }
  };

  const handleMouseLeave = (id: string, isYouTube: boolean) => {
    setHoveredId(null);
    
    if (isYouTube) {
      // For YouTube videos, send pause command via postMessage
      const iframe = iframeRefs.current[id];
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    } else {
      // For uploaded videos
      const video = videoRefs.current[id];
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }
  };

  const getThumbnail = (short: typeof shorts[0]): string | null => {
    // Priority 1: Custom thumbnail
    if (short.thumbnail?.storage_path) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      // Thumbnails are stored in media bucket
      return `${supabaseUrl}/storage/v1/object/public/media/${short.thumbnail.storage_path}`;
    }
    
    // Priority 2: YouTube thumbnail
    if (short.source_type === "youtube" && short.source_url) {
      const videoId = extractYouTubeId(short.source_url);
      if (videoId) {
        return getYouTubeThumbnail(videoId, "maxres"); // Higher quality thumbnail
      }
    }
    
    return null;
  };

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide">
          <span className="w-1 h-4 bg-[--red] rounded-sm" />
          SHORTS
        </h2>
        <Link
          href="/videos?type=short"
          className="flex items-center gap-1 text-xs font-bold text-[--muted] hover:text-[--red] transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Shorts Grid - Bigger cards (4 columns instead of 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {shorts.map((short) => {
          const thumbnailUrl = getThumbnail(short);
          const isUploadedVideo = short.source_type === "upload" && short.source_url;
          const isYouTube = short.source_type === "youtube" && !!short.source_url;
          const youtubeVideoId = isYouTube ? extractYouTubeId(short.source_url) : null;
          const isHovered = hoveredId === short.id;
          
          // Construct video URL correctly
          let videoSrc = '';
          if (isUploadedVideo) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            
            // Check if source_url is already a full URL or just a path
            if (short.source_url.startsWith('http')) {
              // Already a full URL
              videoSrc = short.source_url;
            } else if (short.source_url.startsWith('videos/')) {
              // Path format: videos/user-id/year/month/filename.mp4
              videoSrc = `${supabaseUrl}/storage/v1/object/public/${short.source_url}`;
            } else {
              // Missing "videos/" prefix - add it
              videoSrc = `${supabaseUrl}/storage/v1/object/public/videos/${short.source_url}`;
            }
            
            console.log('[Shorts] Video source for', short.title, ':', { 
              raw: short.source_url, 
              constructed: videoSrc 
            });
          }
          
          return (
            <div
              key={short.id}
              className="group block"
              onMouseEnter={() => handleMouseEnter(short.id, isYouTube)}
              onMouseLeave={() => handleMouseLeave(short.id, isYouTube)}
            >
              <Link
                href={`/videos/${short.slug}`}
                className="block"
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-lg border border-[--border] bg-[--panel] transition-all hover:border-[--red] hover:shadow-lg">
                  {/* Uploaded Video */}
                  {isUploadedVideo && videoSrc && (
                    <>
                      {/* Thumbnail overlay (visible when not hovering) */}
                      {!isHovered && thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt={short.title}
                          className="absolute inset-0 h-full w-full object-cover z-10"
                        />
                      )}
                      {/* Video element - always rendered but shows through when hovered */}
                      <video
                        ref={(el) => {
                          videoRefs.current[short.id] = el;
                          if (el) {
                            console.log('[Shorts Video] Registered video element:', short.id, el.src);
                          }
                        }}
                        src={videoSrc}
                        poster={thumbnailUrl || undefined}
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover z-0"
                        onError={(e) => {
                          console.error('[Shorts Video] Failed to load video!');
                          console.error('[Shorts Video] Raw source_url:', short.source_url);
                          console.error('[Shorts Video] Constructed src:', (e.target as HTMLVideoElement).src);
                          console.error('[Shorts Video] Error details:', e);
                        }}
                      />
                    </>
                  )}

                  {/* YouTube Video */}
                  {isYouTube && youtubeVideoId && (
                    <>
                      {/* Show thumbnail when not hovered */}
                      {!isHovered && thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt={short.title}
                          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                          onError={(e) => {
                            // Fallback to hqdefault if maxres fails
                            const img = e.target as HTMLImageElement;
                            if (img.src.includes('maxresdefault')) {
                              img.src = getYouTubeThumbnail(youtubeVideoId, "hq") || '';
                            }
                          }}
                        />
                      )}
                      
                      {/* Show YouTube iframe when hovered */}
                      {isHovered && (
                        <iframe
                          ref={(el) => {
                            iframeRefs.current[short.id] = el;
                          }}
                          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeVideoId}&enablejsapi=1&rel=0&modestbranding=1`}
                          title={short.title}
                          allow="autoplay; encrypted-media"
                          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                          style={{ border: 'none' }}
                        />
                      )}
                    </>
                  )}

                  {/* Fallback for videos without source */}
                  {!isUploadedVideo && !isYouTube && (
                    <>
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={short.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[--panel] to-[--panel-2]">
                          <Play className="h-12 w-12 text-[--muted-2] opacity-20" />
                        </div>
                      )}
                    </>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Play Icon (shown when not hovering) */}
                  {!isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[--red]/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {short.title}
                    </h3>
                  </div>

                  {/* Short Badge */}
                  <div className="absolute top-2 left-2 pointer-events-none">
                    <span className="inline-block rounded bg-[--red] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      SHORT
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
