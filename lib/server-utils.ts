import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

const isServer = typeof window === "undefined";

/**
 * Custom error class for timeout operations
 */
export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Configuration options for retry logic
 */
export type RetryConfig = {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
};

export type LogMetadata = Record<string, unknown>;

/**
 * Validates interview history structure
 */
export const validateHistory = (history: unknown): { valid: boolean; error?: string } => {
  if (!Array.isArray(history)) {
    return { valid: false, error: "History must be an array" };
  }

  if (history.length > 50) {
    return { valid: false, error: "History length exceeds maximum of 50 turns" };
  }

  for (let i = 0; i < history.length; i++) {
    const turn = history[i];

    if (typeof turn !== "object" || turn === null) {
      return { valid: false, error: `Invalid turn at index ${i}` };
    }

    if (!("role" in turn) || !("content" in turn)) {
      return { valid: false, error: `Missing role or content at index ${i}` };
    }

    const role = (turn as { role: unknown }).role;
    const content = (turn as { content: unknown }).content;

    if (role !== "interviewer" && role !== "candidate") {
      return { valid: false, error: `Invalid role at index ${i}: ${String(role)}` };
    }

    if (typeof content !== "string") {
      return { valid: false, error: `Content must be a string at index ${i}` };
    }

    if (content.length < 1 || content.length > 5000) {
      return { valid: false, error: `Content length must be between 1 and 5000 chars at index ${i}` };
    }
  }

  return { valid: true };
};

/**
 * Sanitizes input text by removing HTML tags, null bytes, and excessive whitespace
 */
export const sanitizeText = (input: unknown, maxLength: number = 5000): string => {
  if (input === null || input === undefined) return "";

  const str = String(input);
  if (!str) return "";

  let sanitized = str
    .replace(/<[^>]*>/g, "")
    .replace(/\u0000/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
};

/**
 * Executes a promise with a timeout
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timer: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeoutPromise,
  ]);
};

/**
 * Logs application warnings for operational monitoring
 */
export const logWarning = (context: string, message: string, metadata: LogMetadata = {}): void => {
  const timestamp = new Date().toISOString();

  const logEntry = {
    level: "warn",
    context,
    message,
    timestamp,
    ...metadata,
  };

  console.warn(`[WARN][${context}]`, JSON.stringify(logEntry));
};

/**
 * Executes a function with exponential backoff retry logic.
 * Only retries on network/timeout errors — not validation or auth errors.
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const { maxRetries = 2, initialDelay = 1000, maxDelay = 5000 } = config;

  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error: unknown) {
      attempt++;

      if (attempt > maxRetries) {
        throw error;
      }

      const isRetryable =
        error instanceof TimeoutError ||
        (error instanceof Error &&
          (error.name === "TimeoutError" ||
            error.message.includes("network") ||
            error.message.includes("fetch") ||
            error.message.includes("connection")));

      if (!isRetryable) {
        throw error;
      }

      logWarning("withRetry", `Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`, {
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }
};

const isNextRedirect = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const e = error as Record<string, unknown>;

  return (
    typeof e.digest === "string" && e.digest.startsWith("NEXT_REDIRECT") ||
    (typeof e.message === "string" && e.message.includes("NEXT_REDIRECT")) ||
    e.name === "RedirectError"
  );
};

const isNextNotFound = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const e = error as Record<string, unknown>;

  return (
    e.digest === "NEXT_NOT_FOUND" ||
    (typeof e.message === "string" && e.message.includes("NEXT_NOT_FOUND")) ||
    e.name === "NotFoundError"
  );
};

const isClientNoise = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const e = error as Record<string, unknown>;

  const msg = typeof e.message === "string" ? e.message.toLowerCase() : "";
  const stack = typeof e.stack === "string" ? e.stack.toLowerCase() : "";
  const name = typeof e.name === "string" ? e.name : "";

  if (
    name === "AbortError" ||
    msg.includes("failed to fetch") ||
    msg.includes("network error") ||
    msg.includes("networkerror") ||
    msg.includes("load failed") ||
    msg.includes("importing a module script failed") ||
    msg.includes("dynamically imported module") ||
    msg.includes("failed to load module") ||
    msg.includes("timeout")
  ) {
    return true;
  }

  if (
    stack.includes("chrome-extension://") ||
    stack.includes("moz-extension://") ||
    stack.includes("safari-extension://") ||
    msg.includes("resizeobserver loop") ||
    msg.includes("resizeobserver loop completed with undelivered notifications")
  ) {
    return true;
  }

  if (
    msg.includes("minified react error") ||
    msg.includes("hydration") ||
    msg.includes("text content does not match")
  ) {
    return true;
  }

  if (msg.includes("cors") || msg.includes("cross-origin")) {
    return true;
  }

  return false;
};

const isExpectedError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const e = error as Record<string, unknown>;
  const msg = typeof e.message === "string" ? e.message.toLowerCase() : "";

  if (error instanceof ZodError) return true;
  if (isNextRedirect(error) || isNextNotFound(error)) return true;

  if (
    isServer &&
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ["P2002", "P2025", "P2003"].includes(error.code)
  ) {
    return true;
  }

  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("429") ||
    msg.includes("quota exceeded")
  ) {
    return true;
  }

  if (error instanceof SyntaxError && msg.includes("json")) return true;

  if (
    msg.includes("unauthorized") ||
    msg.includes("forbidden") ||
    msg.includes("401") ||
    msg.includes("403") ||
    msg.includes("invalid credentials") ||
    msg.includes("access denied")
  ) {
    return true;
  }

  if (
    msg.includes("file too large") ||
    msg.includes("payload too large") ||
    msg.includes("413")
  ) {
    return true;
  }

  return false;
};

const isCriticalError = (error: unknown, location: string): boolean => {
  if (!isServer) return false;

  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientRustPanicError) return true;
  if (error instanceof Prisma.PrismaClientValidationError) return true;

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2024"
  ) {
    return true;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    (error as Record<string, unknown>).name === "UnhandledPromiseRejection"
  ) {
    return true;
  }

  if (location.includes("global-error") || location.includes("error-boundary")) {
    if (!isClientNoise(error) && !isExpectedError(error)) {
      return true;
    }
  }

  if (
    typeof window === "undefined" &&
    (error instanceof TypeError || error instanceof ReferenceError)
  ) {
    return true;
  }

  return false;
};

export const logError = (
  location: string,
  error: unknown,
  context?: Record<string, unknown>
) => {
  console.error(`❌ [${location}]`, error);

  if (context) {
    console.debug(`   Context:`, JSON.stringify(context, null, 2));
  }

  if (isCriticalError(error, location)) {
    sendToSentry(location, error, context, "fatal");
    return;
  }

  if (isClientNoise(error)) {
    console.debug(`   ℹ️ Skipped: Client noise`);
    return;
  }

  if (isExpectedError(error)) {
    console.debug(`   ℹ️ Skipped: Expected operational error`);
    return;
  }

  sendToSentry(location, error, context, "warning");
};

function sendToSentry(
  location: string,
  error: unknown,
  context?: Record<string, unknown>,
  level: Sentry.SeverityLevel = "error"
) {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    scope.setTag("location", location);
    scope.setTag("runtime", isServer ? "server" : "client");

    if (context) {
      scope.setContext("details", context);

      if (context.userId) {
        scope.setUser({ id: String(context.userId) });
      }

      if (context.resumeId) scope.setTag("resumeId", String(context.resumeId));
      if (context.route) scope.setTag("route", String(context.route));
    }

    if (
      isServer &&
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      scope.setTag("prisma_code", error.code);
      scope.setContext("prisma", {
        code: error.code,
        meta: error.meta,
        clientVersion: error.clientVersion,
      });
    }

    Sentry.captureException(error);
  });

  console.debug(`   📤 Sent to Sentry (${level})`);
}

/**
 * Logs application usage/telemetry for monitoring and PostHog analytics.
 * PostHog failure is non-critical and will never affect app behavior.
 */
export const logUsage = (action: string, metadata: LogMetadata): void => {
  console.log(
    `[USAGE]`,
    JSON.stringify({
      level: "info",
      action,
      timestamp: new Date().toISOString(),
      ...metadata,
    })
  );

  if (!metadata.userId) return;

  // PostHog Server-side tracking
  if (isServer) {
    // Dynamically import to prevent posthog-node from leaking into client bundle
    // import("./posthog")
    //   .then(({ posthogClient }) => {
    //     if (posthogClient) {
    //       posthogClient.capture({
    //         distinctId: String(metadata.userId),
    //         event: action,
    //         properties: {
    //           action,
    //           ...(metadata.plan ? { plan: String(metadata.plan) } : {}),
    //           $set: {
    //             ...(metadata.email ? { email: String(metadata.email) } : {}),
    //             ...(metadata.name ? { name: String(metadata.name) } : {}),
    //           },
    //         },
    //       });
    //     }
    //   })
    //   .catch(() => {
    //     logWarning("logUsage", "Failed to capture PostHog event", { action })
    //   });
  }
};