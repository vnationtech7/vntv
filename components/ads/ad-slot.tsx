"use client";

import { useEffect, useState } from "react";
import { getActiveAdvertisementsForSlot, type Advertisement } from "@/app/actions/advertisements";
import { getGoogleAdSenseConfig, getAdsGlobalSettings } from "@/app/actions/site-settings";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

interface AdSlotProps {
  slotKey: string; // Actually the placement value from AD_PLACEMENTS
  className?: string;
}

/**
 * AdSlot Component
 * Dynamically renders active advertisements for a given slot
 * Supports:
 * - Custom ads (from database)
 * - Google AdSense fallback
 * - Graceful empty state (no space taken if no ads)
 * 
 * Usage:
 * <AdSlot slotKey="homepage_top_banner" />
 * <AdSlot slotKey="article_sidebar" className="my-4" />
 */
export function AdSlot({ slotKey, className = "" }: AdSlotProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adSenseConfig, setAdSenseConfig] = useState<any>(null);
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    const loadAds = async () => {
      console.log(`🎯 [AD-SLOT] Loading ads for slot: "${slotKey}"`);
      
      // Load custom ads and settings in parallel
      const [adsResult, adSenseResult, settingsResult] = await Promise.all([
        getActiveAdvertisementsForSlot(slotKey),
        getGoogleAdSenseConfig(),
        getAdsGlobalSettings(),
      ]);

      console.log(`🎯 [AD-SLOT] Result for "${slotKey}":`, adsResult);

      if (adsResult.data && adsResult.data.length > 0) {
        console.log(`✅ [AD-SLOT] Found ${adsResult.data.length} ads for "${slotKey}"`);
        setAds(adsResult.data);
      } else {
        console.log(`❌ [AD-SLOT] No ads found for "${slotKey}"`);
      }

      if (adSenseResult.data) {
        setAdSenseConfig(adSenseResult.data);
      }

      if (settingsResult.data) {
        setGlobalSettings(settingsResult.data);
      }

      setLoading(false);
    };

    loadAds();
  }, [slotKey]);

  // Rotate ads if multiple available (every 10 seconds)
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [ads.length]);

  if (loading) {
    return null; // Don't show loading state
  }

  // Check if custom ads are enabled
  const customAdsEnabled = globalSettings?.custom_ads_enabled !== false;
  const hasCustomAds = customAdsEnabled && ads.length > 0;

  // Check if AdSense is enabled as fallback
  const adSenseEnabled = adSenseConfig?.enabled === true;
  const adSenseFallbackEnabled = globalSettings?.adsense_fallback_enabled !== false;
  const shouldShowAdSense = adSenseEnabled && adSenseFallbackEnabled && !hasCustomAds;

  // Get AdSense slot ID for this placement
  const adSenseSlotId = adSenseConfig?.slots?.[slotKey] || "";

  // If no custom ads and no AdSense, return null (graceful empty state)
  if (!hasCustomAds && !shouldShowAdSense) {
    return null;
  }

  return (
    <div className={`ad-slot ${className}`} data-slot-key={slotKey}>
      {hasCustomAds ? (
        // Show custom ad
        <>
          {ads[currentAdIndex].creative_type === "image" ? (
            <ImageAd ad={ads[currentAdIndex]} />
          ) : (
            <HtmlAd ad={ads[currentAdIndex]} />
          )}

          {/* Ad indicator for transparency */}
          {globalSettings?.show_ad_label && (
            <div className="text-xs text-text-tertiary mt-1 text-center">
              Advertisement
              {ads[currentAdIndex].sponsor_id && ` • Sponsored`}
            </div>
          )}
        </>
      ) : shouldShowAdSense && adSenseSlotId ? (
        // Show AdSense ad
        <AdSenseAd
          client={adSenseConfig.ad_client}
          slot={adSenseSlotId}
          showLabel={globalSettings?.show_ad_label}
        />
      ) : null}
    </div>
  );
}

function ImageAd({ ad }: { ad: Advertisement }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Prioritize image_path (direct upload) over image_id (media library)
  let imageUrl: string | null = null;
  
  if (ad.image_path) {
    // Direct upload to advertisements bucket
    imageUrl = `${supabaseUrl}/storage/v1/object/public/advertisements/${ad.image_path}`;
  } else if (ad.image) {
    // Fallback to media library (backward compatibility)
    imageUrl = `${supabaseUrl}/storage/v1/object/public/${ad.image.storage_path}`;
  }

  if (!imageUrl) {
    return null;
  }

  const content = (
    <div className="relative w-full overflow-hidden rounded-lg bg-surface-secondary" style={{ maxHeight: '100px' }}>
      <Image
        src={imageUrl}
        alt={ad.image?.alt_text || ad.name}
        width={ad.image_width || 1200}
        height={ad.image_height || 400}
        className="w-full h-auto object-contain"
        style={{ maxHeight: '100px' }}
        priority
      />
    </div>
  );

  if (ad.target_url) {
    return (
      <Link href={ad.target_url} target="_blank" rel="noopener noreferrer sponsored">
        {content}
      </Link>
    );
  }

  return content;
}

function HtmlAd({ ad }: { ad: Advertisement }) {
  if (!ad.html_content) {
    return null;
  }

  const wrapper = ad.target_url ? (
    <Link href={ad.target_url} target="_blank" rel="noopener noreferrer sponsored">
      <div
        className="ad-html-content"
        dangerouslySetInnerHTML={{ __html: ad.html_content }}
      />
    </Link>
  ) : (
    <div
      className="ad-html-content"
      dangerouslySetInnerHTML={{ __html: ad.html_content }}
    />
  );

  return <div className="overflow-hidden rounded-lg">{wrapper}</div>;
}

function AdSenseAd({
  client,
  slot,
  showLabel,
}: {
  client: string;
  slot: string;
  showLabel?: boolean;
}) {
  return (
    <div className="adsense-container">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script
        id={`adsense-${slot}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
      {showLabel && (
        <div className="text-xs text-text-tertiary mt-1 text-center">
          Advertisement
        </div>
      )}
    </div>
  );
}
