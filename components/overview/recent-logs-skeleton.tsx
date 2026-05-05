import { Skeleton } from "@/components/ui/skeleton";

export function RecentLogsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
