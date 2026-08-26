"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  Button,
  Input,
} from "@/components/ui";
import { Divider } from "@/components/layout";
import { Mail, Lock, Loader } from "@/components/icons";
import { signIn, signInWithOAuth } from "@/app/auth/actions";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup?: () => void;
  onSwitchToReset?: () => void;
}

export function LoginModal({
  open,
  onOpenChange,
  onSwitchToSignup,
  onSwitchToReset,
}: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, redirect happens automatically
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    await signInWithOAuth("google");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>
            Welcome to <span className="text-[--color-vntv-red]">VN</span>TV
          </DialogTitle>
          <DialogDescription>Sign in to your account</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {/* OAuth Providers */}
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            <Divider label="OR" />

            {/* Email/Password Form */}
            <form action={handleSubmit} className="space-y-4">
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                required
                fullWidth
                disabled={loading}
                icon={<Mail className="w-4 h-4" />}
              />

              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                required
                fullWidth
                disabled={loading}
                icon={<Lock className="w-4 h-4" />}
              />

              {error && (
                <div className="text-[12px] text-[--color-error] bg-[--color-error-light] p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth loading={loading}>
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>

            {/* Links */}
            <div className="space-y-2 text-center text-[13px]">
              <button
                type="button"
                onClick={onSwitchToReset}
                className="text-[--color-vntv-red] hover:underline"
              >
                Forgot password?
              </button>

              <div className="text-[--color-foreground-muted]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-[--color-vntv-red] hover:underline font-bold"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
