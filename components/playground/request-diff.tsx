"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RouteDTO as Route } from "@/types";
import type { SimRequest, SimResult } from "@/lib/gateway-simulator";

interface RequestDiffProps {
  original: SimRequest;
  result: SimResult;
  route: Route;
}

type Tab = "headers" | "body" | "response";

export function RequestDiff({ original, result, 
 }: RequestDiffProps) {
  const [tab, setTab] = useState<Tab>("headers");

  const tabs: { id: Tab; label: string }[] = [
    { id: "headers", label: "Headers" },
    { id: "body", label: "Body" },
    { id: "response", label: "Client Response" },
  ];

 const clientHeaders: Record<string, string> = {
   ...original.headers,
   host: "gatewayos.vercel.app",
 };

  const upstreamHeaders = result.upstreamRequest?.headers ?? {};

  // Compute changed/added/removed keys
  const allHeaderKeys = new Set([
    ...Object.keys(clientHeaders),
    ...Object.keys(upstreamHeaders),
  ]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-3 text-xs font-medium transition-colors",
              tab === t.id
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-0">
        {tab === "headers" && (
          // 🟢 NEW
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left: what client sent */}
            <div className="p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Client Sent
              </p>
              <div className="space-y-1.5">
                {Object.entries(clientHeaders).map(([k, v]) => {
                  const isRemoved = !Object.prototype.hasOwnProperty.call(
                    upstreamHeaders,
                    k,
                  );
                  return (
                    <div key={k} className="flex items-start gap-2">
                      {isRemoved ? (
                        <span className="mt-0.5 text-[10px] font-bold text-destructive">
                          --
                        </span>
                      ) : (
                        <span className="mt-0.5 text-[10px] text-muted-foreground/30">
                          ~~
                        </span>
                      )}
                      <div className="min-w-0">
                        <span
                          className={cn(
                            "font-mono text-xs",
                            isRemoved
                              ? "text-destructive/70 line-through"
                              : "text-muted-foreground",
                          )}
                        >
                          {k}:{" "}
                          <span
                            className={
                              isRemoved
                                ? "text-destructive/70"
                                : "text-foreground"
                            }
                          >
                            {v}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: what upstream receives */}
            <div className="p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {result.blocked
                  ? "Upstream Never Reached"
                  : "Upstream Receives"}
              </p>
              {result.blocked ? (
                <p className="text-xs text-muted-foreground">
                  Request was blocked at the{" "}
                  <span className="font-medium text-destructive">
                    {result.blockStage}
                  </span>{" "}
                  stage. The upstream service received no traffic.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {Array.from(allHeaderKeys).map((k) => {
                    const inOriginal = Object.prototype.hasOwnProperty.call(
                      clientHeaders,
                      k,
                    );
                    const inUpstream = Object.prototype.hasOwnProperty.call(
                      upstreamHeaders,
                      k,
                    );
                    const isAdded = !inOriginal && inUpstream;
                    const isModified =
                      inOriginal &&
                      inUpstream &&
                      clientHeaders[k] !== upstreamHeaders[k];

                    if (!inUpstream) return null;

                    return (
                      <div key={k} className="flex items-start gap-2">
                        {isAdded ? (
                          <span className="mt-0.5 text-[10px] font-bold text-chart-2">
                            ++
                          </span>
                        ) : isModified ? (
                          <span className="mt-0.5 text-[10px] font-bold text-chart-3">
                            ~~
                          </span>
                        ) : (
                          <span className="mt-0.5 text-[10px] text-muted-foreground/30">
                            ~~
                          </span>
                        )}
                        <span
                          className={cn(
                            "font-mono text-xs",
                            isAdded
                              ? "text-chart-2"
                              : isModified
                                ? "text-chart-3"
                                : "text-muted-foreground",
                          )}
                        >
                          {k}:{" "}
                          <span
                            className={
                              isAdded
                                ? "text-chart-2"
                                : isModified
                                  ? "text-chart-3"
                                  : "text-foreground"
                            }
                          >
                            {upstreamHeaders[k]}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "body" && (
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Client Sent
              </p>
              <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {original.body || "(empty body)"}
              </pre>
            </div>
            <div className="p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {result.blocked
                  ? "Upstream Never Reached"
                  : "Upstream Receives"}
              </p>
              {result.blocked ? (
                <p className="text-xs text-muted-foreground">
                  Body was never forwarded.
                </p>
              ) : (
                <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">
                  {result.upstreamRequest?.body || "(empty body)"}
                </pre>
              )}
            </div>
          </div>
        )}

        {tab === "response" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "font-mono text-2xl font-bold",
                  result.clientResponse.statusCode < 300 && "text-chart-2",
                  result.clientResponse.statusCode >= 400 &&
                    result.clientResponse.statusCode < 500 &&
                    "text-chart-3",
                  result.clientResponse.statusCode >= 500 && "text-destructive",
                )}
              >
                {result.clientResponse.statusCode}
              </span>
              <span className="text-sm text-muted-foreground">
                {result.clientResponse.statusText}
              </span>
              {result.blocked ? (
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                  Blocked by {result.blockStage}
                </span>
              ) : (
                <span className="rounded-full bg-chart-2/10 px-2.5 py-0.5 text-xs font-medium text-chart-2">
                  Forwarded to upstream
                </span>
              )}
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Response Body
              </p>
              <pre className="overflow-auto rounded-lg border border-border bg-secondary p-4 font-mono text-xs text-foreground">
                {result.clientResponse.body}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border px-5 py-3">
        <span className="text-[10px] text-muted-foreground">Legend:</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-chart-2">
          <span className="font-bold">++</span> Added by gateway
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-chart-3">
          <span className="font-bold">~~</span> Modified
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-destructive">
          <span className="font-bold line-through">--</span> Stripped
        </span>
      </div>
    </div>
  );
}
