"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendVerificationEmail } from "@/lib/auth-client";
import useCreateToast from "@/hooks/use-create-toast";
import { User } from "@/lib/get-server-user";

export function VerifyEmailNotice({ user }: { user: User }) {

  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);
  const { createSuccess, createError } = useCreateToast();

  async function handleResend() {
    setSending(true);
    try {
      const result = await sendVerificationEmail({
        email: user.email,
        callbackURL: "/email-verified",
      });

      if (result.error) {
        createError(
          result.error.message ?? "Failed to resend verification email."
        );
        return;
      }

      createSuccess("Verification email resent.");
      setResent(true);
    } catch (error) {
      console.error("Resend verification error:", error);
      createError("An unexpected error occurred. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification link to
        </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {user.email}
          </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          Click the link in the email to verify your account. The link expires
          in 1 hour.
        </p>
      </div>

      {resent ? (
        <div className="rounded-lg border border-green-900/50 bg-secondary px-4 py-3">
          <p className="text-center text-sm text-green-600">
            Verification email resent.
          </p>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full border-border bg-secondary text-foreground hover:bg-accent"
          onClick={handleResend}
          disabled={sending}
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Resend verification email"
          )}
        </Button>
      )}

      <div className="border-t border-border pt-4 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
