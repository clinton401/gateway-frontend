import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KeyTableRow } from "./key-table-row";
import { EmptyState } from "@/components/shared/empty-state";
import { Key, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ApiKeyDTO as ApiKey } from "@/types";

interface KeyTableProps {
  apiKeys: ApiKey[];
  routeMap: Record<string, string>;
}

export function KeyTable({ apiKeys, routeMap }: KeyTableProps) {
  if (apiKeys.length === 0) {
    return (
      <EmptyState
        icon={Key}
        title="No API keys"
        description="Create your first API key to enable authenticated access."
        action={
          <Link href="/keys/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs font-medium text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Key Prefix
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Scope
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Last Used
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Expires
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="pr-4 text-right text-xs font-medium text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => (
            <KeyTableRow key={apiKey.id} apiKey={apiKey} routeMap={routeMap} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
