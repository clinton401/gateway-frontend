import { LatencyChart } from "@/components/overview/latency-chart";
import { getLatencyChartData } from "@/lib/queries/overview";

export async function LatencyChartServer() {
  const data = await getLatencyChartData();
  return <LatencyChart data={data} />;
}
