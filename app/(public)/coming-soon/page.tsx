import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Home } from "lucide-react";

export const metadata = {
  title: "Coming Soon - VNTV",
  description: "This page is coming soon",
};

export default function ComingSoonPage() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-vntv-red/10">
            <Clock className="h-10 w-10 text-vntv-red" />
          </div>

          <h1 className="text-4xl font-extrabold text-text-primary mb-4">
            Coming Soon
          </h1>

          <p className="text-lg text-text-secondary mb-8">
            We're working hard to bring you this feature. Check back soon for updates!
          </p>

          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
