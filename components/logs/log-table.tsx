"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { LogTableRow } from "./log-table-row";
import { LogDetailSheet } from "./log-detail-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import type { RequestLogDTO as RequestLog } from "@/types";

interface LogTableProps {
  logs: RequestLog[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

export function LogTable({
  logs,
  total,
  page,
  pageCount,
  pageSize,
}: LogTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No logs found"
        description="No requests match your current filters. Try adjusting the search or status filter."
      />
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                Timestamp
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                Method
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                Path
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="h-10 text-right text-xs font-medium text-muted-foreground">
                Latency
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                Client
              </TableHead>
              <TableHead className="h-10 pr-6 text-right text-xs font-medium text-muted-foreground">
                Flags
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <LogTableRow key={log.id} log={log} onClick={setSelectedLog} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Showing {from} to {to} of {total.toLocaleString()} requests
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-border bg-secondary text-muted-foreground hover:text-foreground"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="px-2 text-xs text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-border bg-secondary text-muted-foreground hover:text-foreground"
            onClick={() => goToPage(page + 1)}
            disabled={page >= pageCount}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <LogDetailSheet
        log={selectedLog}
        isOpen={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      />
    </div>
  );
}
