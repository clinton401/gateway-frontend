import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "healthy" | "error" | "warning" | "inactive";
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        {
          "bg-green-500": status === "healthy",
          "bg-red-500": status === "error",
          "bg-yellow-500": status === "warning",
          "bg-zinc-500": status === "inactive",
        },
        className
      )}
    />
  );
}
