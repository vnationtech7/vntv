"use client";

import { useState } from "react";
import { Share2, MessageCircle, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export function ShareButtons({ url, title, description, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url.startsWith("http") ? url : `${typeof window !== "undefined" ? window.location.origin : ""}${url}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : "";

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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
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

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
        <Share2 className="w-4 h-4" />
        Share This Story
      </h3>

      <div className="flex flex-wrap gap-2">
        {/* WhatsApp */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className="flex items-center gap-2"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
          className="flex items-center gap-2"
          aria-label="Share on Facebook"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
          </svg>
          <span className="hidden sm:inline">Facebook</span>
        </Button>

        {/* Twitter/X */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className="flex items-center gap-2"
          aria-label="Share on X"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">X</span>
        </Button>

        {/* LinkedIn */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("linkedin")}
          className="flex items-center gap-2"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
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
