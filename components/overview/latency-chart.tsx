"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LatencyDataPoint } from "@/types";

export function LatencyChart({
  data: latencyData,
}: {
  data: LatencyDataPoint[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Latency Percentiles
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-(--color-chart-1)" />
            p50
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-(--color-chart-3)" />
            p95
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-(--color-chart-4)" />
            p99
          </span>
        </div>
      </div>
      <ScrollArea className="w-full">
        {/* 
          🟢 THE FIX: 
          Replaced min-w-145 with min-w-[600px] and added w-full relative 
        */}
        <div className="relative h-64 w-full min-w-[580px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyData} margin={{ right: 8 }}>
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="time"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={32}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{
                  color: "var(--color-foreground)",
                  marginBottom: "4px",
                }}
                formatter={(
                  value:
                    | number
                    | string
                    | readonly (number | string)[]
                    | undefined,
                ) => {
                  const displayValue = Array.isArray(value) ? value[0] : value;
                  return [`${displayValue ?? 0}ms`];
                }}
              />
              <Line
                type="monotone"
                dataKey="p50"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
                name="p50"
              />
              <Line
                type="monotone"
                dataKey="p95"
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                dot={false}
                name="p95"
              />
              <Line
                type="monotone"
                dataKey="p99"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                dot={false}
                name="p99"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
