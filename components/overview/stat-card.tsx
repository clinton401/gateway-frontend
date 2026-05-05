import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
  deltaIntent?: "higher-is-better" | "lower-is-better";
}

export function StatCard({
  label,
  value,
  suffix,
  delta,
  deltaLabel = "vs yesterday",
  deltaIntent = "higher-is-better",
}: StatCardProps) {
  const hasDelta = delta !== undefined && delta !== 0;

  const isPositive = hasDelta && delta > 0;
  const isImprovement = hasDelta
    ? deltaIntent === "higher-is-better"
      ? isPositive
      : !isPositive
    : false;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>

      <div className="mt-3">
        <span className="font-mono text-3xl font-bold text-foreground">
          {value}
          {suffix && (
            <span className="ml-0.5 text-xl font-semibold text-muted-foreground">
              {suffix}
            </span>
          )}
        </span>
      </div>

      {hasDelta ? (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs",
            isImprovement ? "text-green-500" : "text-red-500",
          )}
        >
          {isImprovement ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{Math.abs(delta)}</span>
          <span className="ml-0.5 text-muted-foreground">{deltaLabel}</span>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Minus className="h-3 w-3" />
          <span>No change</span>
        </div>
      )}
    </div>
  );
}
