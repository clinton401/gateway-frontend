"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowLeftRight,
  Check,
  Code,
  Copy,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecentLogsTable } from "@/components/overview/recent-logs-table";
// 🟢 1. Import the ScrollArea components
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { RouteDTO as Route, RequestLogDTO as RequestLog } from "@/types";

interface RouteStats {
  totalRequests: number;
  totalErrors: number;
  successRate: number;
  avgLatencyMs: number;
}

interface RouteDetailTabsProps {
  route: Route;
  logs: RequestLog[];
  stats: RouteStats;
}

export function RouteDetailTabs({ route, logs, stats }: RouteDetailTabsProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(route, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const transformSections = [
    {
      key: "requestHeaderTransform",
      label: "Request Headers",
      data: route.requestHeaderTransform,
    },
    {
      key: "responseHeaderTransform",
      label: "Response Headers",
      data: route.responseHeaderTransform,
    },
    {
      key: "requestBodyTransform",
      label: "Request Body",
      data: route.requestBodyTransform,
    },
    {
      key: "responseBodyTransform",
      label: "Response Body",
      data: route.responseBodyTransform,
    },
  ] as const;

  return (
    <Tabs defaultValue="overview">
      {/* 🟢 2. Wrap the list in a ScrollArea. Move the mb-6 here. */}
      <ScrollArea className="mb-6 w-full rounded-md">
        {/* 🟢 3. Add `w-max` to TabsList so it doesn't shrink, forcing the scroll */}
        <TabsList className="inline-flex w-max border border-border bg-secondary p-1">
          <TabsTrigger
            value="overview"
            className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <ScrollText className="mr-1.5 h-3.5 w-3.5" />
            Logs
          </TabsTrigger>
          <TabsTrigger
            value="transforms"
            className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
            Transforms
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="text-xs data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Code className="mr-1.5 h-3.5 w-3.5" />
            Config
          </TabsTrigger>
        </TabsList>
        {/* 🟢 4. Add the horizontal scrollbar indicator */}
        <ScrollBar orientation="horizontal" className="hidden sm:flex" />
      </ScrollArea>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-4 mt-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total Requests",
              value: stats.totalRequests.toLocaleString(),
            },
            { label: "Success Rate", value: `${stats.successRate}%` },
            {
              label: "Avg Latency",
              value: stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs}ms` : "--",
            },
            {
              label: "Total Errors",
              value: stats.totalErrors.toLocaleString(),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1.5 font-mono text-xl font-bold text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Sparkline placeholder */}
        <div className="flex items-center justify-center rounded-xl border border-border py-4 bg-card">
          <p className="text-xs text-muted-foreground">
            Traffic chart coming soon
          </p>
        </div>
      </TabsContent>

      {/* Logs */}
      <TabsContent value="logs" className="mt-0">
        <RecentLogsTable logs={logs} />
      </TabsContent>

      {/* Transforms */}
      <TabsContent value="transforms" className="mt-0 space-y-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Configured Transforms
          </h3>
          <div className="space-y-5">
            {transformSections.map(({ label, data }) =>
              data && data.length > 0 ? (
                <div key={label}>
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <div className="space-y-1.5">
                    {data.map((op, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs text-foreground"
                      >
                        <span className="text-primary">{op.op}</span>
                        {"header" in op && op.header && (
                          <span className="ml-2 text-muted-foreground">
                            {op.header}
                          </span>
                        )}
                        {"field" in op && op.field && (
                          <span className="ml-2 text-muted-foreground">
                            {op.field}
                          </span>
                        )}
                        {"from" in op && op.from && (
                          <span className="ml-2 text-muted-foreground">
                            {op.from} &rarr; {op.to}
                          </span>
                        )}
                        {"value" in op && op.value && (
                          <span className="ml-2 text-chart-2">
                            = {op.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={label}>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-xs italic text-muted-foreground/50">
                    None configured
                  </p>
                </div>
              ),
            )}

            {/* Path transform */}
            {route.requestPathTransform ? (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Request Path
                </p>
                <pre className="rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs text-foreground">
                  {JSON.stringify(route.requestPathTransform, null, 2)}
                </pre>
              </div>
            ) : (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  Request Path
                </p>
                <p className="text-xs italic text-muted-foreground/50">
                  None configured
                </p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Config JSON */}
      <TabsContent value="config" className="mt-0">
        <div className="relative">
          <pre className="max-h-[500px] overflow-auto rounded-xl border border-border bg-card p-6 font-mono text-xs text-muted-foreground">
            {JSON.stringify(route, null, 2)}
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-chart-2" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">Copy config</span>
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
