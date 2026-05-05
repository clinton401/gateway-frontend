"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { KeyForm } from "@/components/keys/key-form";
import { KeyReveal } from "@/components/keys/key-reveal";
import type { RouteDTO as Route } from "@/types";

interface NewKeyClientProps {
  routes: Route[];
}

export function NewKeyClient({ routes }: NewKeyClientProps) {
  const [plaintextKey, setPlaintextKey] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title={plaintextKey ? "Key Generated" : "Create API Key"}
        subtitle={
          plaintextKey ? "" : "Generate a new access credential for your routes"
        }
      />

      <div className="rounded-xl border border-border bg-card p-8">
        {plaintextKey ? (
          <KeyReveal apiKey={plaintextKey} />
        ) : (
          <KeyForm routes={routes} onSuccess={setPlaintextKey} />
        )}
      </div>
    </>
  );
}
