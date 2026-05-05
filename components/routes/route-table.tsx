import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RouteTableRow } from "./route-table-row";
import { EmptyState } from "@/components/shared/empty-state";
import { GitBranch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { RouteDTO } from "@/types";

interface RouteTableProps {
  routes: RouteDTO[];
  isAdmin: boolean; // 🟢 1. Add the role prop to the table
}

export function RouteTable({ routes, isAdmin }: RouteTableProps) {
  if (routes.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No routes configured"
        description={
          isAdmin
            ? "Add your first route to start proxying traffic."
            : "No routes are currently available in the gateway."
        }
        // 🟢 2. Only show the "New Route" button if they are an Admin
        action={
          isAdmin ? (
            <Link href="/routes/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Route
              </Button>
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-8" />
            <TableHead className="text-xs font-medium text-muted-foreground">
              Route
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Upstream
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Auth
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Rate Limit
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Circuit Breaker
            </TableHead>
            <TableHead className="pr-6 text-right text-xs font-medium text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            // 🟢 3. Cascade the prop down to the row component
            <RouteTableRow key={route.id} route={route} isAdmin={isAdmin} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
