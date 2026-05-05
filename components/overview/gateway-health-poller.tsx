"use client";

import { Activity, Loader2 } from "lucide-react";
import { useFetchData } from "@/hooks/use-fetch-data";
import { RouteHealthList } from "./route-health-list";
import { EmptyState } from "@/components/shared/empty-state";

interface RouteHealth {
  id: string;
  path: string;
  circuitBreaker: "CLOSED" | "OPEN" | "HALF_OPEN";
  recentFailureRate: number;
}

interface GatewayHealth {
  status: "ok" | "degraded";
  routeCount: number;
  lastReloadAt: string;
  routes: RouteHealth[];
}

async function fetchGatewayHealth(): Promise<GatewayHealth> {
  const res = await fetch("/api/gateway/health");
  if (!res.ok) throw new Error("Gateway unreachable");
  return res.json();
}

export function GatewayHealthPoller() {
  const { data, isLoading, isError } = useFetchData(
    ["gateway-health"],
    fetchGatewayHealth,
    {
      refetchInterval: 30_000,
      staleTime: 0,
    },
  );

  if (isLoading) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-border bg-card">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Connecting to gateway...
          </span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-card">
        <EmptyState
          icon={Activity}
          title="Gateway unreachable"
          description="Start the gateway process to see live route health."
          className="py-10"
        />
      </div>
    );
  }

  return <RouteHealthList healthData={data.routes} />;
}
