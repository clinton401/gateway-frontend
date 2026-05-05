"use client";

import { Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import Link from "next/link";

interface KeyRevealProps {
  apiKey: string;
}

export function KeyReveal({ apiKey }: KeyRevealProps) {
  return (
    <div className="animate-in fade-in zoom-in-95 space-y-8 duration-300">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-green-900/50 bg-green-950/30">
          <Check className="h-6 w-6 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Key Created Successfully
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Copy this key now. It will not be shown again.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-3">
          <code className="break-all font-mono text-sm text-foreground">
            {apiKey}
          </code>
          <CopyButton value={apiKey} className="ml-4 shrink-0" />
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-yellow-900/40 bg-yellow-950/20 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
          <p className="text-sm text-yellow-500/90">
            This is the only time this key will be visible. We store only a
            hash. If you lose it, delete this key and create a new one.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/keys">
          <Button className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90">
            Done
          </Button>
        </Link>
      </div>
    </div>
  );
}
