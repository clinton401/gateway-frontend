import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Access denied",
};

/*
 * forbidden.tsx — rendered when forbidden() is called in Next.js.
 * Available from Next.js 15+ via the forbidden() function.
 *
 * Triggered when:
 *   - An authenticated user tries to access a resource they don't own
 *   - A FREE plan user tries to access a PRO-only feature page
 *   - A non-admin user tries to access an admin route
 *
 * Different from unauthorized.tsx (401):
 *   - 401 = not authenticated (who are you?)
 *   - 403 = authenticated but not allowed (we know who you are, but no)
 *
 * The messaging here is deliberately vague — we don't tell the user
 * exactly why they're blocked (plan upgrade vs. wrong user) to avoid
 * leaking resource existence to unauthorised parties.
 *
 * For plan-upgrade prompts, redirect to /pricing instead of showing this page.
 */
export default function Forbidden() {
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
          403
        </p>

        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
          Access denied
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          You don&apos;t have permission to access this page. If you think this
          is a mistake, contact support.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-10 rounded-full  px-6 "
            asChild
          >
            <Link href="/overview">Go to dashboard</Link>
          </Button>

          <Button variant="outline" className="h-10 rounded-full px-6" asChild>
            <Link
              href={`mailto:${process.env.EMAIL_USER}?subject=Access%20Denied%20Issue&body=Hi%20RivetSync%20Support%2C%0A%0AI%20encountered%20a%20403%20Forbidden%20error%20when%20trying%20to%20access%20a%20page.%20Could%20you%20help%20me%20understand%20why%3F%0A%0AThanks!`}
            >
              Contact support
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
