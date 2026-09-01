"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { unsubscribeWithToken, resubscribeWithToken } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail, MailX } from "lucide-react";
import Link from "next/link";

type UnsubscribeStatus = "loading" | "success" | "error" | "already-unsubscribed" | "resubscribed";

export function NewsletterUnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<UnsubscribeStatus>("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [showResubscribe, setShowResubscribe] = useState(false);
  const [isResubscribing, setIsResubscribing] = useState(false);

  useEffect(() => {
    async function unsubscribe() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid unsubscribe link. Please check your email for the correct link.");
        return;
      }

      const result = await unsubscribeWithToken(token);

      if (result.success) {
        if (result.alreadyUnsubscribed) {
          setStatus("already-unsubscribed");
          setShowResubscribe(true);
        } else {
          setStatus("success");
          setShowResubscribe(true);
        }
        setMessage(result.message || "Unsubscribed successfully");
        setEmail(result.email || "");
      } else {
        setStatus("error");
        setMessage(result.error || "Unsubscribe failed");
      }
    }

    unsubscribe();
  }, [token]);

  async function handleResubscribe() {
    if (!token) return;

    setIsResubscribing(true);
    const result = await resubscribeWithToken(token);

    if (result.success) {
      setStatus("resubscribed");
      setMessage(result.message || "Resubscribed successfully!");
      setShowResubscribe(false);
    } else {
      setMessage(result.error || "Failed to resubscribe");
    }
    setIsResubscribing(false);
  }

  return (
    <div className="mx-auto max-w-md text-center">
      {status === "loading" && (
        <>
          <div className="flex justify-center mb-6">
            <Loader2 className="h-16 w-16 text-vntv-red animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Processing Your Request
          </h1>
          <p className="text-text-secondary">
            Please wait while we unsubscribe you from our newsletter...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex justify-center mb-6">
            <MailX className="h-16 w-16 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Unsubscribed Successfully
          </h1>
          <p className="text-text-secondary mb-2">
            {message}
          </p>
          {email && (
            <p className="text-sm text-text-tertiary mb-6">
              {email}
            </p>
          )}
          <p className="text-text-secondary mb-8">
            We're sorry to see you go. You won't receive any more emails from us.
          </p>
          
          {showResubscribe && (
            <div className="bg-background-panel border border-border rounded-lg p-6 mb-8">
              <p className="text-sm text-text-secondary mb-4">
                Changed your mind?
              </p>
              <Button 
                variant="primary" 
                onClick={handleResubscribe}
                disabled={isResubscribing}
                className="w-full sm:w-auto"
              >
                {isResubscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resubscribing...
                  </>
                ) : (
                  "Resubscribe to Newsletter"
                )}
              </Button>
            </div>
          )}

          <Link href="/">
            <Button variant="outline">
              Go to Homepage
            </Button>
          </Link>
        </>
      )}

      {status === "already-unsubscribed" && (
        <>
          <div className="flex justify-center mb-6">
            <Mail className="h-16 w-16 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Already Unsubscribed
          </h1>
          <p className="text-text-secondary mb-8">
            {message}
          </p>
          
          {showResubscribe && (
            <div className="bg-background-panel border border-border rounded-lg p-6 mb-8">
              <p className="text-sm text-text-secondary mb-4">
                Would you like to resubscribe?
              </p>
              <Button 
                variant="primary" 
                onClick={handleResubscribe}
                disabled={isResubscribing}
                className="w-full sm:w-auto"
              >
                {isResubscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resubscribing...
                  </>
                ) : (
                  "Resubscribe to Newsletter"
                )}
              </Button>
            </div>
          )}

          <Link href="/">
            <Button variant="outline">
              Go to Homepage
            </Button>
          </Link>
        </>
      )}

      {status === "resubscribed" && (
        <>
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Welcome Back!
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
            Something Went Wrong
          </h1>
          <p className="text-text-secondary mb-8">
            {message}
          </p>
          <Link href="/">
            <Button variant="outline">
              Go to Homepage
            </Button>
          </Link>
        </>
      )}

      {/* Feedback section */}
      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-sm text-text-tertiary">
          Have feedback? We'd love to hear from you.{" "}
          <Link href="/contact" className="text-vntv-red hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
