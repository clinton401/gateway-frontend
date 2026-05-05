"use client";

import { useTransition } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteRoute } from "@/actions/routes";
import useCreateToast from "@/hooks/use-create-toast";
import { useRouter } from "next/navigation";

interface RouteDeleteButtonProps {
  routeId: string;
  routePath: string;
  isAdmin: boolean; // 🟢 1. Add the role prop
}

export function RouteDeleteButton({
  routeId,
  routePath,
  isAdmin,
}: RouteDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
    const { createError } = useCreateToast();
    const router = useRouter();

  // 🟢 2. If they are not an admin, render absolutely nothing.
  if (!isAdmin) {
    return null;
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRoute(routeId);
      if (!result?.success) {
        createError(result?.error ?? "Failed to delete route");
      }
        router.replace("/routes");
        
      // Note: If successful, the server action triggers redirect('/routes'),
      // so we don't need a success toast here because the page unmounts immediately.
    });
  }

  return (
    <ConfirmDialog
      title="Delete Route"
      description={`This will permanently delete ${routePath} and all associated request logs. Traffic to this route will stop immediately.`}
      triggerLabel={isPending ? "Deleting..." : "Delete Route"}
      confirmLabel="Delete Route"
      destructive
      onConfirm={handleDelete}
    />
  );
}
