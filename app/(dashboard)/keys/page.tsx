import Link from "next/link";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { KeyTable } from "@/components/keys/key-table";
import { getApiKeys } from "@/lib/queries/keys";
import { getRoutes } from "@/lib/queries/routes";
import { getServerUser } from "@/lib/get-server-user";
import { forbidden, unauthorized } from "next/navigation";

export const metadata = {
  title: "API Keys",
  description: "Manage secure access credentials and scoped permissions for your API routes.",
};

export default async function ApiKeysPage() {
  const [keys, routes, user] = await Promise.all([getApiKeys(), getRoutes(), getServerUser()]);

  if (!user) return unauthorized();
  if(user.role !== "ADMIN") return forbidden();

  // Build a map of routeId → path so the table row tooltip can show paths
  const routeMap = Object.fromEntries(routes.map((r) => [r.id, r.path]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        subtitle="Manage access credentials for gateway routes"
        action={
          <Link href="/keys/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </Link>
        }
      />

      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-primary/80">
          API keys are hashed on creation. The plaintext key is shown once and
          never stored.
        </p>
      </div>

      <KeyTable apiKeys={keys} routeMap={routeMap} />
    </div>
  );
}
