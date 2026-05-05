import { PlaygroundClient } from "@/components/playground/playground-client";
import { getRoutes } from "@/lib/queries/routes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "Test and debug your gateway middleware, transforms, and routing in a safe sandbox.",
};

export default async function PlaygroundPage() {
  const routes = await getRoutes();
  const enabledRoutes = routes.filter((r) => r.enabled);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Playground
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simulate a request through the gateway pipeline and watch each stage
          process it in real time.
        </p>
      </div>

      <PlaygroundClient
        routes={[...enabledRoutes, ...routes.filter((r) => !r.enabled)]}
      />
    </div>
  );
}
