import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-6 space-y-3"
        >
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
