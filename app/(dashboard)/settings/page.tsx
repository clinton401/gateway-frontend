import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { HealthMonitor } from "@/components/settings/health-monitor";
import { AccountSection } from "@/components/settings/account-section";
import { DangerZone } from "@/components/settings/danger-zone";
import { getGatewaySettings } from "@/lib/queries/settings";
import { getServerUser } from "@/lib/get-server-user";
import type { Metadata } from "next";
import { unauthorized } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure gateway system settings, account preferences, and deployment health.",
};

export default async function SettingsPage() {
  // 1. Fetch user first to determine permissions
  const user = await getServerUser();
  if (!user) return unauthorized();

  const isAdmin = user.role === "ADMIN";

  // 2. 🟢 Prevent over-fetching: Only query gateway settings if the user is an Admin
  const settings = isAdmin ? await getGatewaySettings() : null;

  return (
    <div className="max-w-3xl space-y-12 pb-24">
      {/* Dynamically adjust the subtitle based on the user's role */}
      <PageHeader
        title="Settings"
        subtitle={
          isAdmin
            ? "Configure your gateway deployment"
            : "Manage your account settings"
        }
      />

      {/* ADMIN ONLY: General Settings & Health Monitor */}
      {isAdmin && settings && (
        <>
          <GeneralSettingsForm
            defaultValues={{
              gateway_name: settings.gateway_name ?? "Production Gateway",
              gateway_url: settings.gateway_url ?? "http://localhost:8001",
            }}
          />

          <Separator className="bg-border" />

          <HealthMonitor gatewayUrl={settings.gateway_url} />

          <Separator className="bg-border" />
        </>
      )}

      {/* EVERYONE: Account Section */}
      <AccountSection user={user} />

      {/* ADMIN ONLY: Danger Zone (Flushing Redis, Circuit Breakers, etc.) */}
      {isAdmin && (
        <>
          <Separator className="bg-border" />
          <DangerZone />
        </>
      )}
    </div>
  );
}
