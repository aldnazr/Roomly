import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RoomListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading rooms"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden border border-border/60 bg-card p-0 shadow-xs"
        >
          <Skeleton className="aspect-16/10 w-full rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-3/5 rounded-md" />
              <Skeleton className="h-5 w-1/4 rounded-md" />
            </div>
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
            <div className="mt-2 flex items-center gap-3 pt-3 border-t border-border/50">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        </Card>
      ))}
      <span className="sr-only">Loading rooms…</span>
    </div>
  );
}
