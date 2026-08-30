"use client";

import { useState } from "react";
import { Share2, ExternalLink, Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RssItemViewerProps {
  item: {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    url: string;
    author: string | null;
    image_url: string | null;
    published_at: string | null;
    fetched_at: string;
    feed?: {
      id: string;
      name: string;
      source_name: string;
      category_id: string | null;
    } | null;
  };
}

export default function RssItemViewer({ item }: RssItemViewerProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = item.title;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    };

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400");
    }

    setShowShareMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Source Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <ExternalLink className="w-3 h-3" />
          {item.feed?.source_name || "RSS Feed"}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{item.title}</h1>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
        {item.author && (
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{item.author}</span>
          </div>
        )}
        {(item.published_at || item.fetched_at) && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(item.published_at || item.fetched_at)}</span>
          </div>
        )}
      </div>

      {/* Share Button */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>

        {showShareMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowShareMenu(false)}
            />
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={() => handleShare("facebook")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                Facebook
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                Twitter/X
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                LinkedIn
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-t border-gray-200"
              >
                Copy Link
              </button>
            </div>
          </>
        )}
      </div>

      {/* Featured Image */}
      {item.image_url && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Description/Summary */}
      {item.description && (
        <div className="mb-6">
          <p className="text-xl text-gray-700 leading-relaxed">
            {item.description}
          </p>
        </div>
      )}

      {/* Content */}
      {item.content && (
        <div className="mb-8">
          <div
            className="prose prose-lg max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>
      )}

      {/* Read Original Source Button */}
      <div className="border-t border-gray-200 pt-6 mb-8">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Read Full Story at {item.feed?.source_name || "Original Source"}
        </a>
      </div>

      {/* Source Attribution */}
      <div className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Source:</strong> {item.feed?.source_name || item.feed?.name || "RSS Feed"}
        </p>
        <p className="text-xs text-gray-500">
          This content was aggregated from an external RSS feed. VNTV does not
          own or control this content. Click "Read Full Story" to visit the
          original source.
        </p>
      </div>
    </div>
  );
}
