"use client";

import Link from "next/link";
import {
  Key,
  Pencil,
  ShieldCheck,
  ShieldOff,
  ExternalLink,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDot } from "@/components/shared/status-dot";
import { cn } from "@/lib/utils";
import { getMethodColor } from "@/lib/method-colors";
import type { RouteDTO, CircuitBreakerState } from "@/types";
import useCreateToast from "@/hooks/use-create-toast";
import { useTransition, useState } from "react";
import { toggleRouteEnabled, deleteRoute } from "@/actions/routes";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface RouteTableRowProps {
  route: RouteDTO;
  isAdmin: boolean; // 🟢 1. Add the role prop
}

function CircuitBreakerCell({
  state,
}: {
  state: CircuitBreakerState | null | undefined;
}) {
  if (!state) {
    return <span className="text-xs text-muted-foreground">--</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          state === "CLOSED" && "bg-chart-2",
          state === "OPEN" && "bg-destructive",
          state === "HALF_OPEN" && "bg-chart-3",
        )}
      />
      <span
        className={cn(
          "font-mono text-xs",
          state === "CLOSED" && "text-chart-2",
          state === "OPEN" && "text-destructive",
          state === "HALF_OPEN" && "text-chart-3",
        )}
      >
        {state}
      </span>
    </div>
  );
}

function AuthCell({ mode }: { mode: string }) {
  if (mode === "none") {
    return <ShieldOff className="h-4 w-4 text-muted-foreground/40" />;
  }
  if (mode === "apiKey") {
    return <Key className="h-4 w-4 text-muted-foreground" />;
  }
  return <ShieldCheck className="h-4 w-4 text-muted-foreground" />;
}

export function RouteTableRow({ route, isAdmin }: RouteTableRowProps) {
  const [isPending, startTransition] = useTransition();
  const { createSuccess, createError } = useCreateToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function handleToggle() {
    if (!isAdmin) return; // Failsafe
    startTransition(async () => {
      const result = await toggleRouteEnabled(route.id, !route.enabled);
      if (result.success) {
        createSuccess(route.enabled ? "Route disabled" : "Route enabled");
      } else {
        createError(result.error ?? "Failed to update route");
      }
    });
  }

  function handleDelete() {
    if (!isAdmin) return; // Failsafe
    startTransition(async () => {
      const result = await deleteRoute(route.id);
      if (!result?.success) {
        createError(result?.error ?? "Failed to delete route");
      }
    });
  }

  const statusDot = !route.enabled
    ? "inactive"
    : route.circuitBreakerState === "OPEN"
      ? "error"
      : route.circuitBreakerState === "HALF_OPEN"
        ? "warning"
        : "healthy";

  return (
    <>
      <TableRow className="border-border transition-colors hover:bg-muted/20">
        {/* Status indicator */}
        <TableCell className="w-8 pl-4">
          <StatusDot status={statusDot} />
        </TableCell>

        {/* Route path + method */}
        <TableCell>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm text-foreground">
              {route.path}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "w-fit px-1.5 py-0 text-[10px]",
                getMethodColor(route.method),
              )}
            >
              {route.method}
            </Badge>
          </div>
        </TableCell>

        {/* Upstream */}
        <TableCell>
          <span className="max-w-[200px] truncate font-mono text-xs text-muted-foreground block">
            {route.upstream}
          </span>
        </TableCell>

        {/* Auth */}
        <TableCell>
          <AuthCell mode={route.authMode} />
        </TableCell>

        {/* Rate limit */}
        <TableCell>
          {route.rateLimitMax && route.rateLimitWindowMs ? (
            <span className="font-mono text-xs text-muted-foreground">
              {route.rateLimitMax.toLocaleString()}/
              {route.rateLimitWindowMs / 1000}s
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40">--</span>
          )}
        </TableCell>

        {/* Circuit breaker */}
        <TableCell>
          <CircuitBreakerCell state={route.circuitBreakerState} />
        </TableCell>

        {/* Actions */}
        <TableCell className="pr-4 text-right">
          <div className="flex items-center justify-end gap-1">
            {/* View is always visible to everyone */}
            <Link href={`/routes/${route.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="sr-only">View route</span>
              </Button>
            </Link>

            {/* 🟢 2. Hide Edit for non-admins */}
            {isAdmin && (
              <Link href={`/routes/${route.id}/edit`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit route</span>
                </Button>
              </Link>
            )}

            {/* 🟢 3. Hide Dropdown (Toggle/Delete) for non-admins */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-border bg-popover text-popover-foreground"
                >
                  <DropdownMenuItem
                    onClick={handleToggle}
                    disabled={isPending}
                    className="text-sm cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    {route.enabled ? "Disable route" : "Enable route"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isPending}
                    className="text-sm text-destructive focus:text-destructive cursor-pointer"
                  >
                    Delete route
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      </TableRow>
      {isAdmin && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Route"
          description={`This will permanently delete ${route.path} and all associated request logs. Traffic to this route will stop immediately.`}
          confirmLabel={isPending ? "Deleting..." : "Delete Route"}
          destructive
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
