"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogStatusBadge } from "./log-status-badge";
import { Gauge, Zap, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMethodColor } from "@/lib/method-colors";
import type { RequestLogDTO as RequestLog } from "@/types";

interface LogTableRowProps {
  log: RequestLog;
  onClick: (log: RequestLog) => void;
}

function getLatencyColor(ms: number): string {
  if (ms < 100) return "text-muted-foreground";
  if (ms < 500) return "text-chart-3";
  return "text-destructive";
}

export function LogTableRow({ log, onClick }: LogTableRowProps) {
  return (
    <TableRow
      className="h-10 cursor-pointer border-border transition-colors hover:bg-muted/20"
      onClick={() => onClick(log)}
    >
      <TableCell className="py-1 font-mono text-[10px] text-muted-foreground">
        {format(new Date(log.timestamp), "HH:mm:ss.SSS")}
      </TableCell>

      <TableCell className="py-1">
        <Badge
          variant="outline"
          className={cn(
            "flex h-4 min-w-[38px] justify-center px-1 text-[9px]",
            getMethodColor(log.method),
          )}
        >
          {log.method}
        </Badge>
      </TableCell>

      <TableCell className="max-w-[280px] truncate py-1 font-mono text-[13px] text-foreground">
        {log.incomingPath}
      </TableCell>

      <TableCell className="py-1">
        <LogStatusBadge code={log.statusCode} />
      </TableCell>

      <TableCell className="py-1 text-right">
        <span
          className={cn(
            "font-mono text-[13px]",
            getLatencyColor(log.latencyMs),
          )}
        >
          {log.latencyMs}ms
        </span>
      </TableCell>

      <TableCell className="py-1 font-mono text-[11px] text-muted-foreground">
        {log.clientIdentity ?? "--"}
      </TableCell>

      <TableCell className="py-1 pr-6">
        <div className="flex items-center justify-end gap-1.5">
          {log.rateLimited && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Gauge className="h-3 w-3 text-chart-3" />
              </TooltipTrigger>
              <TooltipContent className="border-border bg-popover text-xs">
                Rate Limited
              </TooltipContent>
            </Tooltip>
          )}
          {log.circuitOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Zap className="h-3 w-3 text-destructive" />
              </TooltipTrigger>
              <TooltipContent className="border-border bg-popover text-xs">
                Circuit Open
              </TooltipContent>
            </Tooltip>
          )}
          {log.error && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3 w-3 text-destructive" />
              </TooltipTrigger>
              <TooltipContent className="border-border bg-popover max-w-[200px] text-xs">
                {log.error}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
