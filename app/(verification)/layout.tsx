import { getServerUser } from "@/lib/get-server-user";
import { Shield } from "lucide-react";
import { unauthorized } from "next/navigation";

export default async function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
    }) {
    const user = await getServerUser();
    if (!user) return unauthorized();
    
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          GatewayOS
        </span>
      </div>
      <div className="w-full max-w-100 rounded-xl border border-border bg-card p-8">
        {children}
      </div>
    </div>
  );
}
