import { Suspense } from "react";
import { StatCards } from "@/components/overview/stat-cards";
import { StatCardsSkeleton } from "@/components/overview/stat-cards-skeleton";
import { TrafficChartServer } from "@/components/overview/traffic-chart-server";
import { LatencyChartServer } from "@/components/overview/latency-chart-server";
import { ChartSkeleton } from "@/components/overview/chart-skeleton";
import { RecentLogsServer } from "@/components/overview/recent-logs-server";
import { RecentLogsSkeleton } from "@/components/overview/recent-logs-skeleton";
import { GatewayHealthPoller } from "@/components/overview/gateway-health-poller";

export const metadata = {
  title: "Overview",
  description: "Real-time health and traffic metrics for your API gateway.",
};

export const revalidate = 60;
export default function OverviewPage() {
  // No awaits here -- every section fetches independently and streams in.
  // The page shell renders immediately.
  return (
    <div className="space-y-6">
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Suspense fallback={<ChartSkeleton height="h-[340px]" />}>
            <TrafficChartServer />
          </Suspense>
        </div>
        <div className="min-w-0 lg:col-span-1">
          {/* Client component -- has its own internal loading state */}
          <GatewayHealthPoller />
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton height="h-[300px]" />}>
        <LatencyChartServer />
      </Suspense>

      <Suspense fallback={<RecentLogsSkeleton />}>
        <RecentLogsServer />
      </Suspense>
    </div>
  );
}
