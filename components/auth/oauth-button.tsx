"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { logError } from "@/lib/server-utils";
import { signIn } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OAuthButtonProps {
  disabled: boolean;
  page: "login" | "signup";
  redirect?: string | null;
  setError: (message: string) => void;
  clearError: () => void;
}

export function OAuthButton({
  disabled,
  page,
  redirect,
  setError,
  clearError,
}: OAuthButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleGitHubSignIn = async () => {
    if (isPending || disabled) return;

    const callbackURL = redirect || "/overview";

    if (page !== "login" && page !== "signup") {
      logError(
        "OAuthButton:InvalidPage",
        new Error(`Invalid page prop: ${page}`),
        { page },
      );
      setError("Invalid page context for OAuth.");
      return;
    }

    try {
      setIsPending(true);
     clearError();

      const { error } = await signIn.social({
        provider: "github",
        callbackURL,
      });

      if (error) {
        logError("OAuthButton:github", error);
        setError(error.message || "Failed to sign in with GitHub.");
        return;
      }
    } catch (err) {
      logError(
        "OAuthButton:Unexpected",
        err instanceof Error ? err : new Error("Unknown error"),
      );
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const isAnyActionPending = isPending || disabled;

  return (
    <div className="space-y-4">
 

      
      <Button
        type="button"
        variant="outline"
        onClick={handleGitHubSignIn}
        className={cn(
          "w-full h-10 gap-2 text-sm font-normal text-muted-foreground hover:text-foreground transition-all",
          isPending && "bg-muted",
        )}
        disabled={isAnyActionPending}
        aria-label="Continue with GitHub"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
              <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
     className="h-4 w-4 shrink-0" 
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
        )}
        {isPending ? "Connecting..." : "Continue with GitHub"}
      </Button>
    </div>
  );
}
