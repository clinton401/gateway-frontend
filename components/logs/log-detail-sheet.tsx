"use client";

import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { LogStatusBadge } from "./log-status-badge";
import { getMethodColor } from "@/lib/method-colors";
import { cn } from "@/lib/utils";
import type { RequestLogDTO as RequestLog } from "@/types";

interface LogDetailSheetProps {
  log: RequestLog | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: unknown;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn("break-all text-sm text-foreground", mono && "font-mono")}
      >
        {value === null || value === undefined ? "--" : String(value)}
      </span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  );
}

export function LogDetailSheet({
  log,
  isOpen,
  onOpenChange,
}: LogDetailSheetProps) {
  if (!log) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-border bg-background p-0 sm:max-w-[480px]">
        <SheetHeader className="sticky top-0 z-10 border-b border-border bg-background/80 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 px-1.5 text-[10px]",
                getMethodColor(log.method),
              )}
            >
              {log.method}
            </Badge>
            <SheetTitle className="truncate pr-6 font-mono text-sm text-foreground">
              {log.incomingPath}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="space-y-8 p-6">
          <section>
            <SectionHeading>Request</SectionHeading>
            <div className="rounded-xl border border-border bg-card px-4">
              <DetailRow label="Incoming Path" value={log.incomingPath} />
              <DetailRow label="Matched Route" value={log.routePath} />
              <DetailRow label="Method" value={log.method} />
              <DetailRow label="Client Identity" value={log.clientIdentity} />
              <DetailRow
                label="Request Size"
                value={log.requestSize ? `${log.requestSize} bytes` : "--"}
              />
            </div>
          </section>

          <section>
            <SectionHeading>Response</SectionHeading>
            <div className="rounded-xl border border-border bg-card px-4">
              <div className="flex items-center gap-12 border-b border-border py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Status
                  </span>
                  <div className="text-2xl font-bold">
                    <LogStatusBadge code={log.statusCode} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Latency
                  </span>
                  <div className="font-mono text-2xl font-bold text-foreground">
                    {log.latencyMs}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ms
                    </span>
                  </div>
                </div>
              </div>
              <DetailRow
                label="Response Size"
                value={log.responseSize ? `${log.responseSize} bytes` : "--"}
              />
            </div>
          </section>

          <section>
            <SectionHeading>Gateway</SectionHeading>
            <div className="rounded-xl border border-border bg-card px-4">
              <DetailRow
                label="Rate Limited"
                value={log.rateLimited ? "Yes" : "No"}
                mono={false}
              />
              <DetailRow
                label="Circuit Breaker"
                value={log.circuitOpen ? "Open" : "Closed"}
                mono={false}
              />
              {log.error && (
                <DetailRow label="Error Message" value={log.error} />
              )}
            </div>
          </section>

          <section>
            <SectionHeading>Timestamp</SectionHeading>
            <div className="rounded-xl border border-border bg-card px-4">
              <DetailRow
                label="ISO"
                value={format(
                  new Date(log.timestamp),
                  "yyyy-MM-dd HH:mm:ss.SSS",
                )}
              />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
