import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { getMethodColor } from "@/lib/method-colors";
import type { RequestLogDTO } from "@/types";

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return "text-chart-2";
  if (code >= 400 && code < 500) return "text-chart-3";
  return "text-destructive";
}

function getLatencyColor(ms: number): string {
  if (ms < 100) return "text-muted-foreground";
  if (ms < 500) return "text-chart-3";
  return "text-destructive";
}

interface RecentLogsTableProps {
  logs: RequestLogDTO[];
}

export function RecentLogsTable({ logs }: RecentLogsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <h3 className="text-sm font-medium text-foreground">Recent Requests</h3>
        {logs.length > 0 && (
          <Link
            href="/logs"
            className="text-xs text-primary transition-colors hover:text-primary/80"
          >
            View all
          </Link>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState
            icon={ScrollText}
            title="No requests yet"
            description="Request logs will appear here once traffic starts flowing through the gateway."
            className="px-4"
          />
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Timestamp
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Method
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Path
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Latency
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Client
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-border transition-colors hover:bg-muted/30"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5 py-0 text-[10px]",
                        getMethodColor(log.method),
                      )}
                    >
                      {log.method}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-[180px] truncate font-mono text-sm text-foreground whitespace-nowrap">
                    {log.incomingPath}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <span
                      className={cn(
                        "font-mono text-xs font-medium",
                        getStatusColor(log.statusCode),
                      )}
                    >
                      {log.statusCode}
                    </span>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <span
                      className={cn(
                        "font-mono text-sm",
                        getLatencyColor(log.latencyMs),
                      )}
                    >
                      {log.latencyMs}ms
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {log.clientIdentity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
