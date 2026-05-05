"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/server-utils";

/*
 * error.tsx — the standard Next.js error boundary for a route segment.
 *
 * MUST be a Client Component.
 *
 * It catches errors in:
 * - page.tsx (Server or Client)
 * - components (Server or Client)
 * - layout.tsx (Server or Client) — BUT only layouts below it in the tree.
 *
 * It does NOT catch errors in:
 * - The root layout (app/layout.tsx) -> Use global-error.tsx for that.
 *
 * Design principle: give the user a way to recover (Reset) or a way out (Dashboard/Home).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our monitoring service (Sentry via logError)
    logError("error-boundary:page", error, {
      digest: error.digest,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Error code — large, decorative, not semantic heading */}
        <p
          aria-hidden="true"
          className="mb-6 font-mono text-[80px] font-semibold leading-none tabular-nums text-border"
        >
          500
        </p>

        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred. We&apos;ve been notified and are looking into it.
          You can try refreshing the page or head back to the dashboard.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-10 rounded-full px-6"
            onClick={() => reset()}
          >
            Try again
          </Button>

          <Button variant="outline" className="h-10 rounded-full px-6" asChild>
            <Link href="/overview">Go to dashboard</Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-12 w-full min-w-0 overflow-x-auto max-w-xl text-left">
            <p className="mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground/50">
              Debug Information
            </p>
            <pre className="overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs text-muted-foreground">
              {error.message || "No error message available"}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
