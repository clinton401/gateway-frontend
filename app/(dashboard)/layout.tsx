import { getServerUser } from "@/lib/get-server-user";
import { unauthorized } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SidebarProvider } from "@/components/layout/sidebar-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user) return unauthorized();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar user={user} />
        <div className="flex flex-1 flex-col min-w-0 lg:ml-60">
          <TopBar />
          <DashboardShell>{children}</DashboardShell>
        </div>
      </div>
    </SidebarProvider>
  );
}
