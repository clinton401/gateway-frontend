import { TrafficChart } from "@/components/overview/traffic-chart";
import { getTrafficChartData } from "@/lib/queries/overview";

export async function TrafficChartServer() {
  const data = await getTrafficChartData();
  return <TrafficChart data={data} />;
}
