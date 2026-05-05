"use client";

import { logError } from "@/lib/server-utils";
import { useEffect } from "react";
import Link from "next/link";

/*
 * global-error.tsx — catches errors thrown in the root layout (layout.tsx).
 *
 * MUST be "use client" — same reason as error.tsx.
 *
 * Critical difference from error.tsx:
 * This completely REPLACES the root layout when it renders — meaning
 * none of your providers, fonts, or global CSS are applied.
 * You MUST include <html> and <body> tags here.
 *
 * Because of this, you cannot use shadcn Button or any component that
 * depends on your ThemeProvider or CSS variables. Use plain HTML elements
 * with inline Tailwind classes only.
 *
 * When does this trigger:
 * - A thrown error inside app/layout.tsx
 * - A thrown error inside app/providers.tsx (if you have one)
 * - A crash in a context provider that wraps the entire app
 *
 * This should be extremely rare in production. The page is intentionally
 * minimal because we cannot guarantee any CSS variables are available.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("global-error:root", error, {
      digest: error.digest,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof window !== "undefined" ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: "oklch(0.9551 0 0)", // --background
          color: "oklch(0.3211 0 0)", // --foreground
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <p
            aria-hidden="true"
            style={{
              fontFamily: "'Fira Code', 'Courier New', monospace",
              fontSize: 80,
              fontWeight: 600,
              lineHeight: 1,
              color: "oklch(0.8853 0 0)", // --muted
              marginBottom: 24,
            }}
          >
            500
          </p>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}
          >
            Application error
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "oklch(0.5103 0 0)", // --muted-foreground
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            A critical error occurred while loading the application. This has
            been logged automatically.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <pre
              style={{
                textAlign: "left",
                fontSize: 12,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                background: "oklch(0.9702 0 0)", // --card
                border: "1px solid oklch(0.8576 0 0)", // --border
                borderRadius: 6,
                padding: 12,
                overflowX: "auto",
                color: "oklch(0.5103 0 0)", // --muted-foreground
                marginBottom: 24,
              }}
            >
              {error.message}
            </pre>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                padding: "0 24px",
                borderRadius: 6, // Updated to match your --radius approx
                background: "oklch(0.4891 0 0)", // --primary
                color: "oklch(1.0000 0 0)", // --primary-foreground
                fontSize: 14,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                width: "100%",
                maxWidth: 200,
              }}
            >
              Try again
            </button>

            <Link
              href="/"
              style={{
                fontSize: 13,
                color: "oklch(0.5103 0 0)", // --muted-foreground
                textDecoration: "none",
              }}
            >
              Go to home page
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
