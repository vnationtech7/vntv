import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { NewsletterUnsubscribeContent } from "./unsubscribe-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribe from Newsletter - VNTV",
  description: "Unsubscribe from VNTV newsletter",
  robots: "noindex, nofollow",
};

export default function NewsletterUnsubscribePage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <Suspense fallback={<UnsubscribeSkeleton />}>
          <NewsletterUnsubscribeContent />
        </Suspense>
      </div>
    </PublicLayout>
  );
}

function UnsubscribeSkeleton() {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="h-16 w-16 mx-auto mb-6 bg-background-panel rounded-full animate-pulse" />
      <div className="h-8 bg-background-panel rounded mb-4 animate-pulse" />
      <div className="h-4 bg-background-panel rounded animate-pulse" />
    </div>
  );
}
