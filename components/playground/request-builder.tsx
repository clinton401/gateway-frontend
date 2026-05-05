"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getMethodColor } from "@/lib/method-colors";
import type { RouteDTO as Route } from "@/types";
import type { SimRequest } from "@/lib/gateway-simulator";

const INPUT_CLASS =
  "border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-ring font-mono text-xs";

interface RequestBuilderProps {
  routes: Route[];
  selectedRoute: Route;
  request: SimRequest;
  onRouteChange: (route: Route) => void;
  onRequestChange: (req: SimRequest) => void;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const HAS_BODY = ["POST", "PUT", "PATCH"];

export function RequestBuilder({
  routes,
  selectedRoute,
  request,
  onRouteChange,
  onRequestChange,
}: RequestBuilderProps) {
  const [customHeaders, setCustomHeaders] = useState<
    { key: string; value: string }[]
  >([]);

  function update(partial: Partial<SimRequest>) {
    onRequestChange({ ...request, ...partial });
  }

  function updateHeader(key: string, value: string) {
    onRequestChange({
      ...request,
      headers: { ...request.headers, [key]: value },
    });
  }

  function removeHeader(key: string) {
    const next = { ...request.headers };
    delete next[key];
    onRequestChange({ ...request, headers: next });
  }

  function addCustomHeader() {
    setCustomHeaders((prev) => [...prev, { key: "", value: "" }]);
  }

  function updateCustomHeader(i: number, field: "key" | "value", val: string) {
    const updated = [...customHeaders];
    updated[i][field] = val;
    setCustomHeaders(updated);

    // Sync into request headers
    const headers = { ...request.headers };
    // Remove old key if renamed
    if (field === "key" && customHeaders[i].key) {
      delete headers[customHeaders[i].key];
    }
    if (updated[i].key) {
      headers[updated[i].key] = updated[i].value;
    }
    onRequestChange({ ...request, headers });
  }

  function removeCustomHeader(i: number) {
    const header = customHeaders[i];
    if (header.key) removeHeader(header.key);
    setCustomHeaders((prev) => prev.filter((_, idx) => idx !== i));
  }

  const showBody = HAS_BODY.includes(request.method);
  const authMode = selectedRoute.authMode;

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Request Builder
        </h2>
        <span className="text-xs text-muted-foreground">
          Configure the incoming request
        </span>
      </div>

      {/* Route selector */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Route</Label>
        <Select
          value={selectedRoute.id}
          onValueChange={(id) => {
            const route = routes.find((r) => r.id === id);
            if (route) onRouteChange(route);
          }}
        >
          <SelectTrigger className={cn(INPUT_CLASS, "h-9")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover font-mono text-xs">
            {routes.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      getMethodColor(r.method).split(" ")[0],
                    )}
                  >
                    {r.method}
                  </span>
                  <span>{r.path}</span>
                  {!r.enabled && (
                    <span className="text-muted-foreground">(disabled)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Method + Path */}
      <div className="flex gap-2">
        {selectedRoute.method === "ALL" ? (
          <Select
            value={request.method}
            onValueChange={(v) => update({ method: v })}
          >
            <SelectTrigger className={cn(INPUT_CLASS, "h-9 w-28 shrink-0")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover font-mono text-xs">
              {HTTP_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  <span className={getMethodColor(m).split(" ")[0]}>{m}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div
            className={cn(
              "flex h-9 w-24 shrink-0 items-center justify-center rounded-md border border-border bg-secondary px-3 font-mono text-xs font-semibold",
              getMethodColor(selectedRoute.method).split(" ")[0],
            )}
          >
            {selectedRoute.method}
          </div>
        )}

        <Input
          value={request.path}
          onChange={(e) => update({ path: e.target.value })}
          className={cn(INPUT_CLASS, "h-9 flex-1")}
          placeholder="/api/v1/users"
        />
      </div>

      {/* Route info */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5">
          <span className="text-[10px] uppercase text-muted-foreground">
            Upstream
          </span>
          <span className="font-mono text-[10px] text-foreground">
            {selectedRoute.upstream}
          </span>
        </div>
        {selectedRoute.circuitBreakerState && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5",
              selectedRoute.circuitBreakerState === "CLOSED" && "bg-chart-2/10",
              selectedRoute.circuitBreakerState === "OPEN" &&
                "bg-destructive/10",
              selectedRoute.circuitBreakerState === "HALF_OPEN" &&
                "bg-chart-3/10",
            )}
          >
            <span className="text-[10px] uppercase text-muted-foreground">
              CB
            </span>
            <span
              className={cn(
                "font-mono text-[10px] font-medium",
                selectedRoute.circuitBreakerState === "CLOSED" &&
                  "text-chart-2",
                selectedRoute.circuitBreakerState === "OPEN" &&
                  "text-destructive",
                selectedRoute.circuitBreakerState === "HALF_OPEN" &&
                  "text-chart-3",
              )}
            >
              {selectedRoute.circuitBreakerState}
            </span>
          </div>
        )}
      </div>

      {/* Auth credentials */}
      {authMode === "apiKey" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            API Key{" "}
            <span className="font-mono">
              ({selectedRoute.authKeyHeader ?? "x-api-key"})
            </span>
          </Label>
          <Input
            placeholder="gw_live_..."
            value={
              request.headers[selectedRoute.authKeyHeader ?? "x-api-key"] ?? ""
            }
            onChange={(e) =>
              updateHeader(
                selectedRoute.authKeyHeader ?? "x-api-key",
                e.target.value,
              )
            }
            className={cn(INPUT_CLASS, "h-9")}
          />
          <p className="text-[10px] text-muted-foreground">
            Leave empty to test the missing auth scenario.
          </p>
        </div>
      )}

      {authMode === "jwt" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Bearer Token <span className="font-mono">(Authorization)</span>
          </Label>
          <Input
            placeholder="eyJhbGci..."
            value={(request.headers["authorization"] ?? "").replace(
              "Bearer ",
              "",
            )}
            onChange={(e) =>
              updateHeader(
                "authorization",
                e.target.value ? `Bearer ${e.target.value}` : "",
              )
            }
            className={cn(INPUT_CLASS, "h-9")}
          />
          <p className="text-[10px] text-muted-foreground">
            Enter just the token, not the &quot;Bearer&quot; prefix. Leave empty
            to test missing auth.
          </p>
        </div>
      )}

      {/* Custom headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Custom Headers
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addCustomHeader}
            className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        {customHeaders.map((h, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Header-Name"
              value={h.key}
              onChange={(e) => updateCustomHeader(i, "key", e.target.value)}
              className={cn(INPUT_CLASS, "h-8 flex-1 text-[11px]")}
            />
            <Input
              placeholder="value"
              value={h.value}
              onChange={(e) => updateCustomHeader(i, "value", e.target.value)}
              className={cn(INPUT_CLASS, "h-8 flex-1 text-[11px]")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeCustomHeader(i)}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Request body */}
      {showBody && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Request Body{" "}
            <span className="text-muted-foreground/60">(JSON)</span>
          </Label>
          <Textarea
            value={request.body}
            onChange={(e) => update({ body: e.target.value })}
            placeholder='{"key": "value"}'
            rows={4}
            className={cn(INPUT_CLASS, "resize-none")}
          />
        </div>
      )}
    </div>
  );
}
