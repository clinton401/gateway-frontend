import { StatCard } from "@/components/overview/stat-card";
import { getOverviewStats } from "@/lib/queries/overview";

export async function StatCards() {
  const stats = await getOverviewStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Requests Today"
        value={stats.totalRequestsToday.toLocaleString()}
        delta={stats.totalRequestsDelta}
        deltaLabel="% vs yesterday"
        deltaIntent="higher-is-better"
      />
      <StatCard
        label="Error Rate"
        value={stats.errorRateToday}
        suffix="%"
        delta={stats.errorRateDelta}
        deltaLabel="% vs yesterday"
        deltaIntent="lower-is-better"
      />
      <StatCard
        label="Avg Latency"
        value={stats.avgLatencyMs}
        suffix="ms"
        delta={stats.avgLatencyDelta}
        deltaLabel="ms vs yesterday"
        deltaIntent="lower-is-better"
      />
      <StatCard
        label="Active Routes"
        value={`${stats.activeRoutes}/${stats.totalRoutes}`}
      />
    </div>
  );
}
