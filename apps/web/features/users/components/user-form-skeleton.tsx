import { Skeleton } from "@/components/ui/skeleton";

export function UserFormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Memuat data pengguna">
      <Skeleton className="h-52 w-full rounded-4xl" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Skeleton className="h-125 w-full rounded-4xl" />
        <Skeleton className="h-72 w-full rounded-4xl" />
      </div>
    </div>
  );
}
