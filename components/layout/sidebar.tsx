"use client";

import {
  LayoutDashboard,
  GitBranch,
  Key,
  ScrollText,
  Settings,
  Shield,
  LogOut,
  FlaskConical,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SidebarNav } from "./sidebar-nav";
import { useSidebar } from "./sidebar-context";
import { useLogout } from "@/hooks/use-logout";
import { User } from "@/lib/get-server-user";

interface SidebarProps {
  user: User
}

const controlPlaneItems = [
  { title: "Overview", href: "/overview", icon: LayoutDashboard },
  { title: "Routes", href: "/routes", icon: GitBranch },
  { title: "API Keys", href: "/keys", icon: Key },
  { title: "Logs", href: "/logs", icon: ScrollText },
  { title: "Playground", href: "/playground", icon: FlaskConical },
];

const systemItems = [{ title: "Settings", href: "/settings", icon: Settings }];

function SidebarContent({ user }: SidebarProps) {
  const { run: logout, isPending } = useLogout();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground">GatewayOS</span>
      </div>

      <div className="h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-6 px-4 py-6">
        <div>
          <h3 className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Control Plane
          </h3>
          <SidebarNav items={controlPlaneItems} />
        </div>
        <div>
          <h3 className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            System
          </h3>
          <SidebarNav items={systemItems} />
        </div>
      </nav>

      {/* User footer with Avatar & Alert Dialog */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of GatewayOS?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to re-enter your credentials to access your
                  routing configurations and control plane.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => logout()}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? "Signing out..." : "Sign out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-sidebar lg:flex">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile: Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-60 border-r border-border bg-sidebar p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent user={user} />
        </SheetContent>
      </Sheet>
    </>
  );
}
