import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function DataTableSkeleton({ rows = 5, cols = 4 }: DataTableSkeletonProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-800 hover:bg-transparent">
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-[100px] bg-zinc-800" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} className="border-b border-zinc-800 hover:bg-transparent">
              {Array.from({ length: cols }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
