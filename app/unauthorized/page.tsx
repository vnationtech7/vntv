"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <Container className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-status-error/10 p-6">
            <ShieldAlert className="w-16 h-16 text-status-error" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-lg text-text-secondary mb-2">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-text-tertiary mb-8">
          This area is restricted to authorized VNTV staff members with
          appropriate roles and permissions.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Link href="/">
            <Button variant="primary" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-text-tertiary">
            If you believe you should have access to this area, please contact
            your administrator.
          </p>
        </div>
      </div>
    </Container>
  );
}
