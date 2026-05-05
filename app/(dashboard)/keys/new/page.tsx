import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewKeyClient } from "@/components/keys/new-key-client";
import { getRoutes } from "@/lib/queries/routes";
import type { Metadata } from "next";
import { getServerUser } from "@/lib/get-server-user";
import { forbidden, unauthorized } from "next/navigation";

export const metadata: Metadata = {
  title: "Create API Key",
  description: "Generate a new access credential and define route-level permissions.",
};

export default async function NewApiKeyPage() {
  const [routes, user] = await Promise.all([getRoutes(), getServerUser()]);

    if (!user) return unauthorized();
    if(user.role !== "ADMIN") return forbidden();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/keys"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to keys
      </Link>

      {/* NewKeyClient manages the form → reveal transition client-side */}
      <NewKeyClient routes={routes} />
    </div>
  );
}
