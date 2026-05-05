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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RouteDTO as Route } from "@/types";

interface LogFiltersProps {
  routes: Route[];
}

export function LogFilters({ routes }: LogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";
  const routeId = searchParams.get("routeId") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const rateLimited = searchParams.get("rateLimited") ?? "false";

  const hasActiveFilters =
    search !== "" ||
    routeId !== "all" ||
    status !== "all" ||
    rateLimited === "true";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "" || value === "all" || value === "false") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      // Reset page on filter change
      params.delete("page");

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
        "flex flex-wrap items-center gap-3",
        isPending && "opacity-60 transition-opacity",
      )}
    >
      <div className="relative min-w-[240px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by path..."
          defaultValue={search}
          onChange={(e) => updateParam("search", e.target.value)}
          className="h-9 border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      <Select value={routeId} onValueChange={(v) => updateParam("routeId", v)}>
        <SelectTrigger className="h-9 w-[180px] border-border bg-secondary text-muted-foreground">
          <SelectValue placeholder="All Routes" />
        </SelectTrigger>
        <SelectContent className="border-border bg-popover">
          <SelectItem value="all">All Routes</SelectItem>
          {routes.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.path}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => updateParam("status", v)}>
        <SelectTrigger className="h-9 w-[145px] border-border bg-secondary text-muted-foreground">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent className="border-border bg-popover">
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="2xx">2xx Success</SelectItem>
          <SelectItem value="4xx">4xx Client Error</SelectItem>
          <SelectItem value="5xx">5xx Server Error</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary px-3">
        <Switch
          id="rate-limited"
          checked={rateLimited === "true"}
          onCheckedChange={(checked) =>
            updateParam("rateLimited", checked ? "true" : "false")
          }
        />
        <Label
          htmlFor="rate-limited"
          className="cursor-pointer text-xs text-muted-foreground"
        >
          Rate Limited Only
        </Label>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
