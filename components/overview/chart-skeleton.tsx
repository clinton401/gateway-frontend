import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  height?: string;
}

export function ChartSkeleton({ height = "h-[340px]" }: ChartSkeletonProps) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${height}`}>
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="flex h-full items-end gap-2 pb-8">
        {Array.from({ length: 24 }).map((_, i) => {
          // Senior Move: Deterministic math creates a nice "wave" pattern
          // that looks like real chart data, but is 100% pure for SSR.
          const pseudoRandomHeight = 20 + Math.abs(Math.sin(i * 0.5) * 60);

          return (
            <Skeleton
              key={i}
              className="flex-1 rounded-sm"
              style={{ height: `${pseudoRandomHeight}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
