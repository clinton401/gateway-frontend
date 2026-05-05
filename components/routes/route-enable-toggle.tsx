"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleRouteEnabled } from "@/actions/routes";
import useCreateToast from "@/hooks/use-create-toast";
import { cn } from "@/lib/utils";

interface RouteEnableToggleProps {
  routeId: string;
  enabled: boolean;
  isAdmin: boolean; // 🟢 Add this prop
}

export function RouteEnableToggle({
  routeId,
  enabled,
  isAdmin,
}: RouteEnableToggleProps) {
  const [isPending, startTransition] = useTransition();
  const { createSuccess, createError } = useCreateToast();

  function handleChange(checked: boolean) {
    // Failsafe: prevent execution even if a user bypasses the disabled UI attribute
    if (!isAdmin) return;

    startTransition(async () => {
      const result = await toggleRouteEnabled(routeId, checked);
      if (result.success) {
        createSuccess(checked ? "Route enabled" : "Route disabled");
      } else {
        createError(result.error ?? "Failed to update route");
      }
    });
  }

  return (
    <div className={cn("flex items-center gap-2", !isAdmin && "opacity-60")}>
      <Label className="text-xs text-muted-foreground">
        {enabled ? "Enabled" : "Disabled"}
      </Label>
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        // 🟢 Disable if a network request is pending OR if they lack permissions
        disabled={isPending || !isAdmin}
      />
    </div>
  );
}
