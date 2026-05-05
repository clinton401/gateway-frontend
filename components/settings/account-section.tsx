"use client";

import { useTransition, useState } from "react";
import { LogOut, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogout } from "@/hooks/use-logout";
import { deleteAccount } from "@/actions/settings";
import useCreateToast from "@/hooks/use-create-toast";

interface AccountSectionProps {
  user: {
    name: string;
    email: string;
  } | null;
}

export function AccountSection({ user }: AccountSectionProps) {
  const { run: logout, isPending: isLoggingOut } = useLogout();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const { createError } = useCreateToast();

  const canConfirmDelete =
    confirmEmail.trim().toLowerCase() === user?.email?.toLowerCase();

  function handleDeleteAccount() {
    if (!canConfirmDelete) return;
    startTransition(async () => {
      const result = await deleteAccount();
      if (result && !result.success) {
        createError(result.error ?? "Failed to delete account");
        setDeleteOpen(false);
      }
      // On success, deleteAccount calls redirect() -- no manual navigation
    });
  }

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Account</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your session and account.
        </p>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {/* Current user */}
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {user?.name ?? "Unknown"}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Sign out this device */}
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Sign Out</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sign out of your current session on this device.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout(false)}
            disabled={isLoggingOut}
            className="border-border bg-secondary text-foreground hover:bg-accent"
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-3.5 w-3.5" />
            )}
            Sign Out
          </Button>
        </div>

        {/* Sign out everywhere */}
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Sign Out Everywhere
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Revoke all active sessions across every device.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout(true)}
            disabled={isLoggingOut}
            className="border-border bg-secondary text-foreground hover:bg-accent"
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-3.5 w-3.5" />
            )}
            Sign Out Everywhere
          </Button>
        </div>

        {/* Delete account */}
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Delete Account
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete account confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-foreground">
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action is permanent and cannot be undone. All your data will
              be deleted immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-xs text-muted-foreground">
              Type{" "}
              <span className="font-mono text-foreground">{user?.email}</span>{" "}
              to confirm
            </Label>
            <Input
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={user?.email}
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              autoComplete="off"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setConfirmEmail("");
              }}
              className="border-border bg-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={!canConfirmDelete || isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
