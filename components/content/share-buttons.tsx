"use client";

import { useState, useEffect } from "react";
import { Share2, MessageCircle, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui";
import { FaFacebook, FaXTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa6";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  contentType?: "article" | "video";
  contentId?: string;
}

export function ShareButtons({ 
  url, 
  title, 
  description, 
  className = "",
  contentType,
  contentId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  const shareUrl = url.startsWith("http") ? url : `${typeof window !== "undefined" ? window.location.origin : ""}${url}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    // Check if Web Share API is supported
    if (typeof navigator !== "undefined" && navigator.share) {
      setSupportsNativeShare(true);
    }
  }, []);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Track share
      if (contentType && contentId) {
        trackShare("copy", contentType, contentId);
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: title,
        text: description || title,
        url: shareUrl,
      });
      
      // Track share
      if (contentType && contentId) {
        trackShare("native", contentType, contentId);
      }
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    // Track share
    if (contentType && contentId) {
      trackShare(platform, contentType, contentId);
    }

    const width = 600;
    const height = 400;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      shareLinks[platform],
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  async function trackShare(platform: string, type: string, id: string) {
    try {
      await fetch("/api/track-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          contentType: type,
          contentId: id,
        }),
      });
    } catch (err) {
      // Silent fail - don't block sharing
      console.error("Failed to track share:", err);
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
        <Share2 className="w-4 h-4" />
        Share This Story
      </h3>

      <div className="flex flex-wrap gap-2">
        {/* Native Share (Mobile) */}
        {supportsNativeShare && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleNativeShare}
            className="flex items-center gap-2 md:hidden"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}

        {/* WhatsApp */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className={`flex items-center gap-2 ${supportsNativeShare ? "hidden md:flex" : ""}`}
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
          className={`flex items-center gap-2 ${supportsNativeShare ? "hidden md:flex" : ""}`}
          aria-label="Share on Facebook"
        >
          <FaFacebook className="w-4 h-4" />
          <span className="hidden sm:inline">Facebook</span>
        </Button>

        {/* Twitter/X */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className={`flex items-center gap-2 ${supportsNativeShare ? "hidden md:flex" : ""}`}
          aria-label="Share on X"
        >
          <FaXTwitter className="w-4 h-4" />
          <span className="hidden sm:inline">X</span>
        </Button>

        {/* LinkedIn */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("linkedin")}
          className={`flex items-center gap-2 ${supportsNativeShare ? "hidden md:flex" : ""}`}
          aria-label="Share on LinkedIn"
        >
          <FaLinkedin className="w-4 h-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </Button>

        {/* Copy Link */}
        <Button
          variant={copied ? "primary" : "outline"}
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
          aria-label="Copy link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Copy Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
