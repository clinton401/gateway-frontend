"use client";

import { RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/shared/status-dot";
import { CopyButton } from "@/components/shared/copy-button";
import { useFetchData } from "@/hooks/use-fetch-data";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface HealthMonitorProps {
  gatewayUrl: string;
}

interface GatewayHealth {
  status: "ok" | "degraded";
  routeCount: number;
  lastReloadAt: string;
}

async function fetchHealth(): Promise<GatewayHealth> {
  const res = await fetch("/api/gateway/health");
  if (!res.ok) throw new Error("Unreachable");
  return res.json();
}

export function HealthMonitor({ gatewayUrl }: HealthMonitorProps) {
  const healthEndpoint = `${gatewayUrl}/gateway/health`;

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useFetchData(
    ["gateway-health-settings"],
    fetchHealth,
    {
      refetchInterval: 30_000,
      staleTime: 0,
    }
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Health & Monitoring
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Live status of the gateway process.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="h-8 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {/* Health endpoint */}
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Health Endpoint
            </span>
            <div className="flex items-center gap-2">
              <code className="rounded bg-secondary px-2 py-1 font-mono text-xs text-foreground">
                {healthEndpoint}
              </code>
              <CopyButton value={healthEndpoint} />
            </div>
          </div>
          <a
            href={healthEndpoint}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">
              Status
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StatusDot status={isError ? "error" : "healthy"} />
              <span className="text-xs text-foreground">
                {isError ? "Offline" : "Online"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase text-muted-foreground">
              Last Check
            </p>
            <p className="mt-1 text-xs text-foreground">
              {dataUpdatedAt
                ? formatDistanceToNow(new Date(dataUpdatedAt), {
                    addSuffix: true,
                  })
                : "--"}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-muted-foreground">
              Routes Loaded
            </p>
            <p className="mt-1 text-xs text-foreground">
              {data?.routeCount != null ? `${data.routeCount} routes` : "--"}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-muted-foreground">
              Last Config Reload
            </p>
            <p className="mt-1 text-xs text-foreground">
              {data?.lastReloadAt
                ? formatDistanceToNow(new Date(data.lastReloadAt), {
                    addSuffix: true,
                  })
                : "--"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}