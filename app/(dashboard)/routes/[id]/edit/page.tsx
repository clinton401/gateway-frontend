import { forbidden, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RouteForm } from "@/components/routes/route-form";
import { RouteDeleteButton } from "@/components/routes/route-delete-button";
import { getRouteById } from "@/lib/queries/routes";
import type { Metadata } from "next";
import { getServerUser } from "@/lib/get-server-user";

interface EditRoutePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditRoutePageProps): Promise<Metadata> {
  const { id } = await params;
  const route = await getRouteById(id);

  if (!route) {
    return {
      title: "Route Not Found",
    };
  }

  return {
    title: `Edit ${route.path}`,
    description: `Modify routing rules, transforms, and security for ${route.path}.`,
  };
}

export default async function EditRoutePage({ params }: EditRoutePageProps) {
  const { id } = await params;
  const [route, user] = await Promise.all([getRouteById(id), getServerUser()]);

  if (!route) notFound();

  const isAdmin = user?.role === "ADMIN";
  if (!isAdmin) return forbidden();

  return (
    <div className="space-y-6">
      <Link
        href={`/routes/${id}`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to route details
      </Link>

      <PageHeader title={route.path} subtitle="Modify route configuration" />

      <RouteForm initialData={route} />

      <div className="flex justify-start pt-2 pb-16">
        <RouteDeleteButton routeId={route.id} routePath={route.path}  isAdmin={isAdmin}/>
      </div>
    </div>
  );
}
