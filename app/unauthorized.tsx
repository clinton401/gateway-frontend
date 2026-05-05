"use client";
import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";


/*
 * unauthorized.tsx — rendered when unauthorized() is called in Next.js.
 * Available from Next.js 15+ via the unauthorized() function.
 *
 * Triggered when:
 *   - A user tries to access a protected route without a session
 *   - Middleware calls unauthorized() instead of redirect("/login")
 *
 * Different from forbidden.tsx (403):
 *   - 401 = not authenticated (who are you?)
 *   - 403 = authenticated but not allowed (we know who you are, but no)
 */
export default function Unauthorized() {

  const pathname = usePathname();
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-20"
      suppressHydrationWarning
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <p
          aria-hidden="true"
          className="mb-6 font-mono text-[80px] font-semibold leading-none tabular-nums text-border"
        >
          401
        </p>

        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
          Sign in required
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          You need to be signed in to access this page. Sign in to your account
          to continue.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-10 rounded-full px-6"
            asChild
          >
            <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
              Sign In
            </Link>
          </Button>

          <Button variant="outline" className="h-10 rounded-full px-6" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
