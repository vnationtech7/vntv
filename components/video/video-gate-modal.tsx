"use client";

import { useState } from "react";
import { X, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/auth";

interface VideoGateModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when user successfully authenticates */
  onAuthenticated: () => void;
  /** Video title for display */
  videoTitle: string;
}

export function VideoGateModal({
  open,
  onClose,
  onAuthenticated,
  videoTitle,
}: VideoGateModalProps) {
  const { openLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    // Open the login modal
    openLogin();
    // The onAuthenticated callback will be triggered by the parent
    // when it detects the user has logged in
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in zoom-in duration-200">
        <div className="bg-surface-primary border border-border rounded-lg shadow-2xl max-w-md w-full p-8 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-accent-yellow/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-accent-yellow" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-text-primary mb-3">
              Continue Watching?
            </h2>
            <p className="text-text-secondary mb-2">
              Sign in to continue watching <strong>{videoTitle}</strong>
            </p>
            <p className="text-sm text-text-tertiary">
              Create a free account to watch unlimited videos and access exclusive content
            </p>
          </div>

          {/* Benefits List */}
          <div className="mb-6 space-y-2 text-left">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Play className="w-4 h-4 text-accent-yellow flex-shrink-0" />
              <span>Watch unlimited videos</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Play className="w-4 h-4 text-accent-yellow flex-shrink-0" />
              <span>Access exclusive VNTV Originals</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Play className="w-4 h-4 text-accent-yellow flex-shrink-0" />
              <span>Ad-free experience</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? "Opening..." : "Sign In to Continue"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={onClose}
            >
              Maybe Later
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-text-tertiary text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
}
