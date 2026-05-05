"use client";

import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSidebar } from "./sidebar-context";

const pageTitles: Record<string, string> = {
  "/overview": "Overview",
  "/routes": "Routes",
  "/keys": "API Keys",
  "/logs": "Request Logs",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  const activePath =
    Object.keys(pageTitles).find((path) => pathname.startsWith(path)) ??
    "/overview";
  const title = pageTitles[activePath];

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <StatusDot status="healthy" />
          <span className="text-xs text-muted-foreground">Gateway Online</span>
        </div>

        <ThemeToggle />

      
      </div>
    </header>
  );
}
