"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  flushRateLimitCounters,
  resetCircuitBreakers,
} from "@/actions/settings";
import useCreateToast from "@/hooks/use-create-toast";

export function DangerZone() {
  const [flushPending, startFlush] = useTransition();
  const [resetPending, startReset] = useTransition();
  const { createSuccess, createError } = useCreateToast();

  function handleFlush() {
    startFlush(async () => {
      const result = await flushRateLimitCounters();
      if (result.success) {
        createSuccess(
          `Flushed ${result.flushed} rate limit counter${result.flushed !== 1 ? "s" : ""}`,
        );
      } else {
        createError(result.error ?? "Failed to flush counters");
      }
    });
  }

  function handleReset() {
    startReset(async () => {
      const result = await resetCircuitBreakers();
      if (result.success) {
        createSuccess(
          `Reset ${result.reset} circuit breaker${result.reset !== 1 ? "s" : ""} to CLOSED`,
        );
      } else {
        createError(result.error ?? "Failed to reset circuit breakers");
      }
    });
  }

  return (
    <section className="space-y-6">
      <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>

      <div className="divide-y divide-destructive/10 overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5">
        {/* Flush rate limits */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              Flush Rate Limit Counters
            </p>
            <p className="max-w-md text-xs text-muted-foreground">
              Clear all active sliding window counters in Redis. Clients will
              have their limits reset immediately.
            </p>
          </div>
          <div className="shrink-0">
            {flushPending ? (
              <div className="flex h-9 items-center gap-2 px-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Flushing...
              </div>
            ) : (
              <ConfirmDialog
                title="Flush Rate Limit Counters"
                description="This will clear all active rate limit windows. Clients that were being throttled will immediately regain their full quota. This cannot be undone."
                triggerLabel="Flush Counters"
                confirmLabel="Flush Now"
                destructive
                onConfirm={handleFlush}
              />
            )}
          </div>
        </div>

        {/* Reset circuit breakers */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              Reset All Circuit Breakers
            </p>
            <p className="max-w-md text-xs text-muted-foreground">
              Force all circuit breakers to CLOSED state. Use this when
              upstreams have recovered but breakers are stuck open.
            </p>
          </div>
          <div className="shrink-0">
            {resetPending ? (
              <div className="flex h-9 items-center gap-2 px-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </div>
            ) : (
              <ConfirmDialog
                title="Reset Circuit Breakers"
                description="All circuit breakers will be forced to CLOSED, and failure tracking windows will be cleared. Traffic will immediately flow to all upstreams regardless of their recent health. Only do this if you have confirmed the upstreams are healthy."
                triggerLabel="Reset Breakers"
                confirmLabel="Reset Now"
                destructive
                onConfirm={handleReset}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
