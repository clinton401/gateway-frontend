"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
