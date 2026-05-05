"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmailVerified() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-900/50">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Email verified
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is now active. You have full access to the GatewayOS
          control plane.
        </p>
      </div>

      <Button
        onClick={() => router.push("/overview")}
        className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      >
        Open control plane
      </Button>
    </div>
  );
}
