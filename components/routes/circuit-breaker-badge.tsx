import { CircuitBreakerState } from "@/types";
import { cn } from "@/lib/utils";

interface CircuitBreakerBadgeProps {
  state: CircuitBreakerState | null | undefined;
}

export function CircuitBreakerBadge({ state }: CircuitBreakerBadgeProps) {
  if (!state) return <span className="text-zinc-600">—</span>;

  const colors = {
    CLOSED: "text-green-500",
    OPEN: "text-red-500",
    HALF_OPEN: "text-yellow-500",
  };

  const bgColors = {
    CLOSED: "bg-green-500",
    OPEN: "bg-red-500",
    HALF_OPEN: "bg-yellow-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-1.5 h-1.5 rounded-full", bgColors[state])} />
      <span className={cn("text-xs font-medium font-mono", colors[state])}>
        {state}
      </span>
    </div>
  );
}
