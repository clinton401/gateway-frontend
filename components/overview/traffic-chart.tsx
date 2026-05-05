"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TrafficDataPoint } from "@/types";

export function TrafficChart({ data }: { data: TrafficDataPoint[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h3 className="mb-6 text-sm font-medium text-foreground">
        Request Traffic
      </h3>
      <ScrollArea className="w-full">
        {/* 
          🟢 THE FIX: 
          1. Changed min-w-145 (invalid) to min-w-[600px] (or whatever px you need)
          2. Added w-full and relative to force Safari to respect the bounding box
        */}
        <div className="relative h-72 w-full min-w-[580px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ right: 8 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-4)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-4)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
                itemStyle={{ color: "var(--color-muted-foreground)" }}
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "12px",
                  color: "var(--color-muted-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#colorRequests)"
                name="Requests"
              />
              <Area
                type="monotone"
                dataKey="errors"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                fill="url(#colorErrors)"
                name="Errors"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
