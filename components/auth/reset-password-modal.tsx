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
import { Mail, Loader } from "@/components/icons";
import { resetPassword } from "@/app/auth/actions";

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export function ResetPasswordModal({
  open,
  onOpenChange,
  onSwitchToLogin,
}: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await resetPassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Check your email</DialogTitle>
            <DialogDescription>
              We've sent you a password reset link. Please check your email.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setSuccess(false);
                onSwitchToLogin?.();
              }}
            >
              Back to Login
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
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

            {error && (
              <div className="text-[12px] text-[--color-error] bg-[--color-error-light] p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={onSwitchToLogin}
            >
              Back to Login
            </Button>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
