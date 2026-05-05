import { cn } from "@/lib/utils";

interface LogStatusBadgeProps {
  code: number;
}

export function LogStatusBadge({ code }: LogStatusBadgeProps) {
  return (
    <span
      className={cn(
        "font-mono text-xs font-medium",
        code >= 200 && code < 300 && "text-chart-2",
        code >= 400 && code < 500 && "text-chart-3",
        code >= 500 && "text-destructive",
        code < 200 && "text-muted-foreground",
      )}
    >
      {code}
    </span>
  );
}
