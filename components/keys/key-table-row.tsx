"use client";

import { useTransition, useState } from "react";
import { Calendar, Clock, MoreHorizontal } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import {
  toggleApiKeyEnabled,
  deleteApiKey,
  updateApiKeyName,
} from "@/actions/keys";
import useCreateToast from "@/hooks/use-create-toast";
import type { ApiKeyDTO as ApiKey } from "@/types";
import { ConfirmDialog } from "../shared/confirm-dialog";

interface KeyTableRowProps {
  apiKey: ApiKey;
  routeMap: Record<string, string>;
}

export function KeyTableRow({ apiKey, routeMap }: KeyTableRowProps) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(apiKey.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { createSuccess, createError } = useCreateToast();

  const isExpired = Boolean(apiKey.expiresAt && isPast(apiKey.expiresAt));

  let status: "healthy" | "error" | "inactive" = "healthy";
  if (!apiKey.enabled) status = "inactive";
  else if (isExpired) status = "error";

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleApiKeyEnabled(apiKey.id, !apiKey.enabled);
      if (result.success) {
        createSuccess(apiKey.enabled ? "Key disabled" : "Key enabled");
      } else {
        createError(result.error ?? "Failed to update key");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteApiKey(apiKey.id);
      if (result.success) {
        createSuccess("Key deleted");
        setDeleteOpen(false);
      } else {
        createError(result.error ?? "Failed to delete key");
      }
    });
  }

  function handleRename() {
    startTransition(async () => {
      const result = await updateApiKeyName(apiKey.id, editName);
      if (result.success) {
        createSuccess("Key renamed");
        setEditOpen(false);
      } else {
        createError(result.error ?? "Failed to rename key");
      }
    });
  }

  return (
    <>
      <TableRow className="border-border transition-colors hover:bg-muted/20">
        <TableCell>
          <span className="text-sm font-medium text-foreground">
            {apiKey.name}
          </span>
        </TableCell>

        <TableCell>
          <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {apiKey.keyPrefix}
          </code>
        </TableCell>

        <TableCell>
          {apiKey.routeScope.length === 0 ? (
            <span className="text-xs text-muted-foreground">All routes</span>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="cursor-default border-border text-[10px] text-muted-foreground"
                >
                  {apiKey.routeScope.length} routes
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="border-border bg-popover text-xs">
                <div className="space-y-1">
                  {apiKey.routeScope.map((id) => (
                    <div key={id} className="font-mono">
                      {routeMap[id] ?? id}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {apiKey.lastUsedAt
              ? formatDistanceToNow(apiKey.lastUsedAt, { addSuffix: true })
              : "Never"}
          </div>
        </TableCell>

        <TableCell>
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              isExpired ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <Calendar className="h-3 w-3" />
            {apiKey.expiresAt
              ? isExpired
                ? `Expired ${formatDistanceToNow(apiKey.expiresAt, { addSuffix: true })}`
                : formatDistanceToNow(apiKey.expiresAt, { addSuffix: true })
              : "Never"}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            <StatusDot status={status} />
            <span
              className={cn(
                "text-xs",
                status === "healthy" && "text-chart-2",
                status === "error" && "text-destructive",
                status === "inactive" && "text-muted-foreground",
              )}
            >
              {isExpired ? "Expired" : apiKey.enabled ? "Active" : "Disabled"}
            </span>
          </div>
        </TableCell>

        <TableCell className="pr-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                disabled={isPending}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Key options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-border bg-popover"
            >
              {isExpired && (
                <>
                  <DropdownMenuItem
                    disabled
                    className="text-xs text-muted-foreground"
                  >
                    This key is expired
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                </>
              )}
              <DropdownMenuItem onClick={handleToggle} className="text-sm">
                {apiKey.enabled ? "Disable key" : "Enable key"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="text-sm"
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-sm text-destructive focus:text-destructive"
              >
                Delete key
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Rename dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Rename Key</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border-border bg-secondary text-foreground"
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="border-border bg-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isPending || !editName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete API Key"
        description={`Are you sure you want to delete the key "${apiKey.name}"? This action is irreversible and any applications using this key will immediately lose access.`}
        onConfirm={handleDelete}
        confirmLabel={isPending ? "Deleting..." : "Delete Key"}
        destructive={true}
      />
    </>
  );
}
