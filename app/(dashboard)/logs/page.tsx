import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LogFilters } from "@/components/logs/log-filters";
import { LogTableServer } from "@/components/logs/log-table-server";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";
import { getRoutes } from "@/lib/queries/routes";
import { getServerUser } from "@/lib/get-server-user";
import { forbidden, unauthorized } from "next/navigation";

export const metadata = {
  title: "Request Logs",
  description: "Inspect and filter real-time traffic flowing through your gateway endpoints.",
};

interface LogsPageProps {
  searchParams: Promise<{
    search?: string;
    routeId?: string;
    status?: string;
    rateLimited?: string;
    page?: string;
  }>;
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const { search, routeId, status, rateLimited, page } = await searchParams;
  const [routes, user] = await Promise.all([getRoutes(), getServerUser()]);

  if (!user) return unauthorized();
  if(user.role !== "ADMIN") return forbidden();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Request Logs"
        subtitle="Inspect all traffic flowing through the gateway"
      />

      <LogFilters routes={routes} />

      <Suspense
        key={`${search}-${routeId}-${status}-${rateLimited}-${page}`}
        fallback={<DataTableSkeleton rows={12} cols={7} />}
      >
        <LogTableServer
          search={search}
          routeId={routeId}
          status={status}
          rateLimited={rateLimited}
          page={page}
        />
      </Suspense>
    </div>
  );
}
