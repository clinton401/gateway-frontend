import { Activity } from "lucide-react";
import { StatusDot } from "@/components/shared/status-dot";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { CircuitBreakerState } from "@/types";

interface RouteHealthEntry {
  id: string;
  path: string;
  circuitBreaker: CircuitBreakerState | null;
  recentFailureRate: number;
}

interface RouteHealthListProps {
  healthData: RouteHealthEntry[];
}

export function RouteHealthList({ healthData }: RouteHealthListProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Route Health</h3>
        {healthData.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Live
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
          </span>
        )}
      </div>

      {healthData.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No routes configured"
          description="Route health will appear here once you add routes to the gateway."
          className="py-10"
        />
      ) : (
        <div className="flex-1 divide-y divide-border overflow-y-auto">
          {healthData.map((route) => {
            let status: "healthy" | "error" | "warning" | "inactive" =
              "healthy";
            if (route.circuitBreaker === "OPEN") status = "error";
            else if (route.circuitBreaker === "HALF_OPEN") status = "warning";

            return (
              <div
                key={route.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StatusDot status={status} />
                  <span className="truncate font-mono text-sm text-foreground">
                    {route.path}
                  </span>
                </div>

                <span
                  className={cn(
                    "shrink-0 font-mono text-xs",
                    route.circuitBreaker === "CLOSED" && "text-chart-2",
                    route.circuitBreaker === "OPEN" && "text-destructive",
                    route.circuitBreaker === "HALF_OPEN" && "text-chart-3",
                    !route.circuitBreaker && "text-muted-foreground",
                  )}
                >
                  {route.circuitBreaker ?? "N/A"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
