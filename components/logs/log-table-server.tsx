import { getLogs } from "@/lib/queries/logs";
import { LogTable } from "./log-table";

interface LogTableServerProps {
  search?: string;
  routeId?: string;
  status?: string;
  rateLimited?: string;
  page?: string;
}

export async function LogTableServer(props: LogTableServerProps) {
  const result = await getLogs(props);
  return <LogTable {...result} />;
}
