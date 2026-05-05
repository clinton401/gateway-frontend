import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RouteForm } from "@/components/routes/route-form";
import type { Metadata } from "next";
import { getServerUser } from "@/lib/get-server-user";
import { forbidden, unauthorized } from "next/navigation";

export const metadata: Metadata = {
  title: "New Route",
  description: "Deploy a new API endpoint with custom path matching and upstream routing.",
};

export default async function NewRoutePage() {
  const user = await getServerUser();
  if (!user) return unauthorized();
  if(user.role !== "ADMIN") return forbidden();
  return (
    <div className="space-y-6">
      <Link
        href="/routes"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to routes
      </Link>

      <PageHeader
        title="New Route"
        subtitle="Configure a new endpoint on the gateway"
      />

      <RouteForm />
    </div>
  );
}
