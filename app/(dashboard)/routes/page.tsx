import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { RouteTable } from "@/components/routes/route-table";
import { RouteFilters } from "@/components/routes/route-filters";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";
import { getRoutes } from "@/lib/queries/routes";
import { getServerUser } from "@/lib/get-server-user";
import { unauthorized } from "next/navigation";

export const metadata = {
  title: "Routes",
  description: "Manage your API gateway routing configuration and transforms.",
};

interface RoutesPageProps {
  searchParams: Promise<{
    search?: string;
    method?: string;
    status?: string;
  }>;
}

// The table is wrapped in Suspense so filter changes show a skeleton
// while the new server query runs -- avoids full-page loading states.
async function FilteredRouteTable({
  search,
  method,
  status,
  isAdmin
}: {
  search?: string;
  method?: string;
    status?: string;
    isAdmin: boolean
}) {
  const routes = await getRoutes({ search, method, status });
  return <RouteTable routes={routes} isAdmin={isAdmin} />;
}

export default async function RoutesPage({ searchParams }: RoutesPageProps) {
  const { search, method, status } = await searchParams;
  const user = await getServerUser();
  if (!user) return unauthorized();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Routes"
        subtitle="Manage your gateway routing configuration"
        action={
          <Link href="/routes/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Route
            </Button>
          </Link>
        }
      />

      <RouteFilters />

      <Suspense
        key={`${search}-${method}-${status}`}
        fallback={<DataTableSkeleton rows={8} cols={7} />}
      >
        <FilteredRouteTable search={search} method={method} status={status} isAdmin={user.role === "ADMIN"} />
      </Suspense>
    </div>
  );
}