import {
  Gauge,
  Server,
  Shield,
  ShieldCheck,
  ShieldOff,
  Key,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouteDTO as Route } from "@/types";

interface RouteSidebarCardsProps {
  route: Route;
}

function SidebarCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function RouteSidebarCards({ route }: RouteSidebarCardsProps) {
  return (
    <>
      {/* Circuit breaker */}
      <SidebarCard icon={Zap} title="Circuit Breaker">
        {route.cbFailureThreshold ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">State</span>
              {route.circuitBreakerState ? (
                <span
                  className={cn(
                    "font-mono text-xs font-medium",
                    route.circuitBreakerState === "CLOSED" && "text-chart-2",
                    route.circuitBreakerState === "OPEN" && "text-destructive",
                    route.circuitBreakerState === "HALF_OPEN" && "text-chart-3",
                  )}
                >
                  {route.circuitBreakerState}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Unknown</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Threshold</span>
              <span className="font-mono text-xs text-foreground">
                {route.cbFailureThreshold}/{route.cbWindowSize} failures
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Cooldown</span>
              <span className="font-mono text-xs text-foreground">
                {(route.cbCooldownMs ?? 0) / 1000}s
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/50">Not configured</p>
        )}
      </SidebarCard>

      {/* Rate limit */}
      <SidebarCard icon={Gauge} title="Rate Limiting">
        {route.rateLimitMax && route.rateLimitWindowMs ? (
          <div className="space-y-2">
            <p className="font-mono text-sm font-medium text-foreground">
              {route.rateLimitMax.toLocaleString()}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                req / {route.rateLimitWindowMs / 1000}s
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Keyed by:{" "}
              <span className="font-mono text-foreground">
                {route.rateLimitKeyBy}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/50">Not configured</p>
        )}
      </SidebarCard>

      {/* Auth */}
      <SidebarCard icon={Shield} title="Authentication">
        <div className="flex items-center gap-2">
          {route.authMode === "none" && (
            <ShieldOff className="h-4 w-4 text-muted-foreground/40" />
          )}
          {route.authMode === "apiKey" && (
            <Key className="h-4 w-4 text-muted-foreground" />
          )}
          {route.authMode === "jwt" && (
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-mono text-sm text-foreground">
            {route.authMode === "none"
              ? "No auth"
              : route.authMode === "apiKey"
                ? "API Key"
                : "JWT"}
          </span>
        </div>

        {route.authMode === "jwt" && route.authJwtRequiredClaims && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-muted-foreground">Required claims</p>
            {Object.entries(route.authJwtRequiredClaims).map(([k, v]) => (
              <div
                key={k}
                className="rounded-md bg-secondary px-2 py-1 font-mono text-xs"
              >
                <span className="text-primary">{k}</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-foreground">{v}</span>
              </div>
            ))}
          </div>
        )}

        {route.authMode === "apiKey" && route.authKeyHeader && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Header: {route.authKeyHeader}
          </p>
        )}
      </SidebarCard>

      {/* Upstream */}
      <SidebarCard icon={Server} title="Upstream">
        <p className="break-all rounded-md bg-secondary px-3 py-2 font-mono text-xs text-foreground">
          {route.upstream}
        </p>
        {route.stripPath && (
          <p className="mt-2 text-xs text-muted-foreground">
            Strip prefix:{" "}
            <span className="font-mono text-foreground">{route.stripPath}</span>
          </p>
        )}
      </SidebarCard>
    </>
  );
}
