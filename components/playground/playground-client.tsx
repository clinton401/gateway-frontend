"use client";

import { useState, useRef } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestBuilder } from "./request-builder";
import { PipelineVisualizer } from "./pipeline-visualizer";
import { RequestDiff } from "./request-diff";
import { simulateGateway } from "@/lib/gateway-simulator";
import type { RouteDTO as Route } from "@/types";
import type {
  SimRequest,
  SimResult,
  PipelineStage,
} from "@/lib/gateway-simulator";

interface PlaygroundClientProps {
  routes: Route[];
}

const STAGE_DELAY_MS = 500;

export function PlaygroundClient({ routes }: PlaygroundClientProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route>(routes[0]);
  const [simRequest, setSimRequest] = useState<SimRequest>({
    method: routes[0]?.method === "ALL" ? "GET" : (routes[0]?.method ?? "GET"),
    path: routes[0]?.path ?? "/",
    headers: {},
    body: "",
  });

  const [visibleStages, setVisibleStages] = useState<PipelineStage[]>([]);
  const [finalResult, setFinalResult] = useState<SimResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const abortRef = useRef(false);

  function reset() {
    abortRef.current = true;
    setVisibleStages([]);
    setFinalResult(null);
    setIsRunning(false);
    setHasRun(false);
  }

  async function handleSend() {
    if (isRunning) return;

    abortRef.current = false;
    setIsRunning(true);
    setFinalResult(null);
    setHasRun(true);

    // Run the full simulation synchronously
    const result = simulateGateway(selectedRoute, simRequest);

    // Reveal stages one at a time with animation delays
    setVisibleStages([]);

    for (let i = 0; i < result.stages.length; i++) {
      if (abortRef.current) break;

      // Show "running" state first
      setVisibleStages((prev) => [
        ...prev.slice(0, i),
        { ...result.stages[i], status: "running" },
      ]);

      await new Promise((r) => setTimeout(r, STAGE_DELAY_MS));

      if (abortRef.current) break;

      // Then show the real status
      setVisibleStages((prev) => [...prev.slice(0, i), result.stages[i]]);

      // Stop animating further if this stage blocked the request
      if (result.stages[i].status === "failed") break;

      await new Promise((r) => setTimeout(r, 120));
    }

    if (!abortRef.current) {
      setFinalResult(result);
    }

    setIsRunning(false);
  }

  return (
    <div className="space-y-6">
      {/* Top: Builder + Pipeline side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Request Builder */}
        <RequestBuilder
          routes={routes}
          selectedRoute={selectedRoute}
          request={simRequest}
          onRouteChange={(route) => {
            setSelectedRoute(route);
            setSimRequest({
              method: route.method === "ALL" ? "GET" : route.method,
              path: route.path,
              headers: {},
              body: "",
            });
            reset();
          }}
          onRequestChange={setSimRequest}
        />

        {/* Right: Pipeline Visualizer */}
        <PipelineVisualizer
          stages={visibleStages}
          hasRun={hasRun}
          isRunning={isRunning}
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center flex-wrap gap-3">
        <Button
          onClick={handleSend}
          disabled={isRunning}
          className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Play className="mr-2 h-4 w-4" />
          {isRunning ? "Processing..." : "Send Request"}
        </Button>

        {hasRun && !isRunning && (
          <Button
            variant="outline"
            onClick={reset}
            className="border-border bg-secondary text-foreground hover:bg-accent"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        )}

        {finalResult && (
          <div className="flex items-center gap-2">
            <span
              className={
                finalResult.blocked
                  ? "text-sm font-medium text-destructive"
                  : "text-sm font-medium text-chart-2"
              }
            >
              {finalResult.blocked
                ? `Blocked at: ${finalResult.blockStage}`
                : "Request forwarded successfully"}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              HTTP {finalResult.clientResponse.statusCode}
            </span>
          </div>
        )}
      </div>

      {/* Bottom: Request diff -- only shown after a successful run */}
      {finalResult && (
        <RequestDiff
          original={simRequest}
          result={finalResult}
          route={selectedRoute}
        />
      )}
    </div>
  );
}
