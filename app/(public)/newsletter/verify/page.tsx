import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { NewsletterVerificationContent } from "./verification-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Newsletter Subscription - VNTV",
  description: "Verify your VNTV newsletter subscription",
  robots: "noindex, nofollow",
};

export default function NewsletterVerifyPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <Suspense fallback={<VerificationSkeleton />}>
          <NewsletterVerificationContent />
        </Suspense>
      </div>
    </PublicLayout>
  );
}

function VerificationSkeleton() {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="h-16 w-16 mx-auto mb-6 bg-background-panel rounded-full animate-pulse" />
      <div className="h-8 bg-background-panel rounded mb-4 animate-pulse" />
      <div className="h-4 bg-background-panel rounded animate-pulse" />
    </div>
  );
}
