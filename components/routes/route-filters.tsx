"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RouteFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";
  const method = searchParams.get("method") ?? "all";
  const status = searchParams.get("status") ?? "all";

  const hasActiveFilters =
      search !== "" || method !== "all" || status !== "all";
    
const updateParam = useCallback(
  // 🟢 1. Broaden the accepted type to handle null/undefined from UI components
  (key: string, value: string | null | undefined) => {
    const params = new URLSearchParams(searchParams.toString());

    // 🟢 2. Safely handle falsy values alongside your custom "all" logic
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  },
  [searchParams, pathname, router],
);

  function clearFilters() {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row",
        isPending && "opacity-60 transition-opacity",
      )}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by path or upstream..."
          defaultValue={search}
          onChange={(e) => updateParam("search", e.target.value)}
          className="border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      <div className="flex gap-2">
        <Select value={method} onValueChange={(v) => updateParam("method", v)}>
          <SelectTrigger className="w-[145px] border-border bg-secondary text-muted-foreground">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover">
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="ALL">ALL</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger className="w-[145px] border-border bg-secondary text-muted-foreground">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
