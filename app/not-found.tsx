import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

/*
 * not-found.tsx — rendered by Next.js when notFound() is thrown or a
 * route simply doesn't exist.
 *
 * No "use client" — this is a Server Component.
 * The subtle entrance animation is handled via CSS (Tailwind animate-in)
 * rather than Framer Motion, keeping this a pure server render.
 *
 * Design principle: give the user two clear paths out.
 * Don't make them use the browser back button.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Error code — large, decorative, not semantic heading */}
        <p
          aria-hidden="true"
          className="mb-6 font-mono text-[80px] font-semibold leading-none tabular-nums text-border"
        >
          404
        </p>

        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Double-check the URL or head back to the dashboard.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-10 rounded-full px-6"
            asChild
          >
            <Link href="/overview">Go to dashboard</Link>
          </Button>

          <Button variant="outline" className="h-10 rounded-full px-6" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
