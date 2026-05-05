import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute h-10 w-10 animate-pulse rounded-full border-2 border-primary/20" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-foreground">Loading GatewayOS</p>
          <p className="text-xs text-muted-foreground">Preparing your control plane...</p>
        </div>
      </div>
    </div>
  );
}
