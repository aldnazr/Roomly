import { Skeleton } from "@/components/ui/skeleton";

export function RoleLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-label="Memuat role">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-4xl bg-muted/50 p-1 ring-1 ring-foreground/5"
        >
          <div className="flex min-h-44 items-start gap-4 rounded-[calc(2rem-4px)] bg-card p-5">
            <Skeleton className="size-11 shrink-0 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}