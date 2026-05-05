import { RecentLogsTable } from "@/components/overview/recent-logs-table";
import { getRecentLogs } from "@/lib/queries/overview";

export async function RecentLogsServer() {
  const logs = await getRecentLogs(10);
  return <RecentLogsTable logs={logs} />;
}
