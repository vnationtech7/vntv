"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyNewsletterSubscription } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";

type VerificationStatus = "loading" | "success" | "error" | "already-verified";

export function NewsletterVerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email for the correct link.");
        return;
      }

      const result = await verifyNewsletterSubscription(token);

      if (result.success) {
        if (result.alreadyVerified) {
          setStatus("already-verified");
        } else {
          setStatus("success");
        }
        setMessage(result.message || "Subscription verified!");
        setEmail(result.email || "");
      } else {
        setStatus("error");
        setMessage(result.error || "Verification failed");
      }
    }

    verifyToken();
  }, [token]);

  return (
    <div className="mx-auto max-w-md text-center">
      {status === "loading" && (
        <>
          <div className="flex justify-center mb-6">
            <Loader2 className="h-16 w-16 text-vntv-red animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Verifying Your Subscription
          </h1>
          <p className="text-text-secondary">
            Please wait while we verify your email address...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Subscription Verified!
          </h1>
          <p className="text-text-secondary mb-2">
            {message}
          </p>
          {email && (
            <p className="text-sm text-text-tertiary mb-8">
              {email}
            </p>
          )}
          <p className="text-text-secondary mb-8">
            You'll now receive the latest African news and stories directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="primary">
                Go to Homepage
              </Button>
            </Link>
            <Link href="/category/africa">
              <Button variant="outline">
                Explore Africa News
              </Button>
            </Link>
          </div>
        </>
      )}

      {status === "already-verified" && (
        <>
          <div className="flex justify-center mb-6">
            <Mail className="h-16 w-16 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Already Verified
          </h1>
          <p className="text-text-secondary mb-8">
            {message}
          </p>
          <Link href="/">
            <Button variant="primary">
              Go to Homepage
            </Button>
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex justify-center mb-6">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Verification Failed
          </h1>
          <p className="text-text-secondary mb-8">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">
                Go to Homepage
              </Button>
            </Link>
            <Link href="/#newsletter">
              <Button variant="primary">
                Try Subscribing Again
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
