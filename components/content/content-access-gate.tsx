"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { LoginModal } from "@/components/auth/login-modal";
import { SignupModal } from "@/components/auth/signup-modal";

export type GateType = "article" | "video";

interface ContentAccessGateProps {
  /**
   * Type of content being gated
   */
  type: GateType;
  
  /**
   * Whether the gate should be shown
   */
  isOpen: boolean;
  
  /**
   * Callback when gate is closed
   */
  onClose: () => void;
  
  /**
   * Callback after successful authentication
   */
  onAuthenticated?: () => void;
  
  /**
   * Content title (for better messaging)
   */
  contentTitle?: string;
}

/**
 * Content Access Gate Component
 * 
 * Gates content (articles or videos) for anonymous users.
 * Shows authentication modal when triggered.
 * 
 * Usage:
 * - Article: Trigger during article reading
 * - Video: Trigger at 25% playback progress
 */
export function ContentAccessGate({
  type,
  isOpen,
  onClose,
  onAuthenticated,
  contentTitle,
}: ContentAccessGateProps) {
  const [showLogin, setShowLogin] = useState(true);

  const message =
    type === "article"
      ? "Sign in to continue reading this article and unlock unlimited access to VNTV content."
      : "Sign in to continue watching this video and unlock unlimited access to VNTV content.";

  const handleAuthenticated = () => {
    // Call the callback if provided
    if (onAuthenticated) {
      onAuthenticated();
    }
    // Close the gate
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="space-y-6">
        {/* Gate Message */}
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-text-primary">
            Continue {type === "article" ? "Reading" : "Watching"}
          </h2>
          {contentTitle && (
            <p className="mb-4 text-lg font-medium text-text-secondary">
              {contentTitle}
            </p>
          )}
          <p className="text-text-secondary">{message}</p>
        </div>

        {/* Auth Forms */}
        {showLogin ? (
          <LoginModal
            isOpen={true}
            onClose={onClose}
            onSuccess={handleAuthenticated}
            showAsDialog={false}
          />
        ) : (
          <SignupModal
            isOpen={true}
            onClose={onClose}
            onSuccess={handleAuthenticated}
            showAsDialog={false}
          />
        )}

        {/* Switch between login/signup */}
        <div className="text-center">
          {showLogin ? (
            <p className="text-sm text-text-secondary">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setShowLogin(false)}
                className="font-medium text-accent-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm text-text-secondary">
              Already have an account?{" "}
              <button
                onClick={() => setShowLogin(true)}
                className="font-medium text-accent-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
