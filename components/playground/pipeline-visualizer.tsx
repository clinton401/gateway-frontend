"use client";

import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  Circle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PipelineStage, StageStatus } from "@/lib/gateway-simulator";

const ALL_STAGE_NAMES = [
  "Route Matching",
  "Rate Limiter",
  "Auth Enforcer",
  "Circuit Breaker",
  "Request Transform",
  "Upstream Proxy",
];

interface PipelineVisualizerProps {
  stages: PipelineStage[];
  hasRun: boolean;
  isRunning: boolean;
}

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "running")
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  if (status === "passed")
    return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
  if (status === "failed")
    return <XCircle className="h-4 w-4 text-destructive" />;
  if (status === "skipped")
    return <MinusCircle className="h-4 w-4 text-muted-foreground/40" />;
  return <Circle className="h-4 w-4 text-muted-foreground/20" />;
}

function StageRow({ stage }: { stage: PipelineStage }) {
  const [expanded, setExpanded] = useState(false);
  const isInteractive =
    stage.status !== "idle" && stage.status !== "running" && !!stage.detail;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-all duration-200",
        stage.status === "passed" && "border-chart-2/20 bg-chart-2/5",
        stage.status === "failed" && "border-destructive/20 bg-destructive/5",
        stage.status === "skipped" && "border-border bg-transparent",
        stage.status === "running" && "border-primary/30 bg-primary/5",
        stage.status === "idle" && "border-border bg-transparent opacity-40",
      )}
    >
      <button
        type="button"
        onClick={() => isInteractive && setExpanded((e) => !e)}
        disabled={!isInteractive}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left",
          isInteractive && "cursor-pointer",
        )}
      >
        <StageIcon status={stage.status} />

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium",
              stage.status === "idle" || stage.status === "running"
                ? "text-muted-foreground"
                : "text-foreground",
            )}
          >
            {stage.name}
          </p>
          {stage.status !== "idle" && stage.status !== "running" && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {stage.summary}
            </p>
          )}
        </div>

        {isInteractive &&
          (expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ))}
      </button>

      {expanded && stage.detail && (
        <div className="border-t border-border px-4 py-3">
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-muted-foreground leading-relaxed">
            {stage.detail}
          </pre>
        </div>
      )}
    </div>
  );
}

export function PipelineVisualizer({
  stages,
  hasRun,
  isRunning,
}: PipelineVisualizerProps) {
  // Build full stage list -- resolved stages first, remaining as idle
//   const resolvedIds = new Set(stages.map((s) => s.id));

  const stageMap: Record<string, PipelineStage> = {};
  for (const s of stages) {
    stageMap[s.name] = s;
  }

  const displayStages: PipelineStage[] = ALL_STAGE_NAMES.map((name) => {
    if (stageMap[name]) return stageMap[name];
    return {
      id: name.toLowerCase().replace(/\s/g, "-"),
      name,
      status: "idle",
      summary: "",
      detail: null,
    };
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Pipeline Stages
        </h2>
        <span className="text-xs text-muted-foreground">
          {!hasRun
            ? "Configure a request and click Send"
            : isRunning
              ? "Processing..."
              : "Click any stage to expand details"}
        </span>
      </div>

      <div className="space-y-2">
        {displayStages.map((stage, i) => (
          <div key={stage.id} className="relative">
            {i < displayStages.length - 1 && (
              <div className="absolute bottom-0 left-[23px] top-full z-10 h-2 w-px bg-border" />
            )}
            <StageRow stage={stage} />
          </div>
        ))}
      </div>
    </div>
  );
}
