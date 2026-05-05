import { notFound, unauthorized } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRouteWithLogs, getRouteStats } from "@/lib/queries/routes";
import { RouteDetailTabs } from "@/components/routes/route-detail-tabs";
import { RouteEnableToggle } from "@/components/routes/route-enable-toggle";
import { RouteSidebarCards } from "@/components/routes/route-sidebar-cards";
import { cn } from "@/lib/utils";
import { getMethodColor } from "@/lib/method-colors";
import { getServerUser } from "@/lib/get-server-user";
import { getRoute } from "@/lib/queries/routes";
import type { Metadata } from "next";

interface RouteDetailPageProps {
  params: Promise<{ id: string }>;
}


export async function generateMetadata({
  params,
}: RouteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const route = await getRoute(id);

  if (!route) {
    return {
      title: "Route Not Found",
    };
  }

  return {
    title: `${route.method} ${route.path}`,
    description: `Detailed configuration and traffic metrics for ${route.path}.`,
  };
}

export default async function RouteDetailPage({
  params,
}: RouteDetailPageProps) {
  const { id } = await params;
  const [{ route, logs }, stats, user] = await Promise.all([
    getRouteWithLogs(id, 20),
    getRouteStats(id),
    getServerUser()
  ]);

  if(!user) return unauthorized();

  if (!route) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/routes"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to routes
      </Link>

      {/* Page header */}
      {/* Page header */}
      {/* 🟢 1. Change to flex-col default, add gap-4, and snap to flex-row on sm screens */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        {/* 🟢 2. Add w-full so the truncation works correctly when stacked on mobile */}
        <div className="flex w-full items-center gap-3 min-w-0 sm:w-auto">
          <h1 className="truncate font-mono text-xl font-semibold text-foreground">
            {route.path}
          </h1>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 px-1.5 text-xs",
              getMethodColor(route.method),
            )}
          >
            {route.method}
          </Badge>
        </div>

        {/* 🟢 3. The buttons stay in a row, but push to the left on mobile */}
        <div className="flex shrink-0 items-center gap-3">
          <Link href={`/routes/${route.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-secondary text-foreground hover:bg-accent"
            >
              <Settings className="mr-2 h-3.5 w-3.5" />
              Edit Route
            </Button>
          </Link>
          {/* Enable toggle is interactive -- must be a client component */}
          <RouteEnableToggle routeId={route.id} enabled={route.enabled}  isAdmin={user.role === "ADMIN"}/>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 ">
          <RouteDetailTabs route={route} logs={logs} stats={stats} />
        </div>
        <div className="space-y-4">
          <RouteSidebarCards route={route} />
        </div>
      </div>
    </div>
  );
}
