import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconDoor,
  IconPhotoOff,
  IconRotateClockwise,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Room } from "../types";
import { useRouter } from "next/navigation";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function photoUrls(photos?: any[]): string[] {
  if (!photos) return [];
  return photos
    .map((p) => {
      if (typeof p === "string" && p) return p;
      if (p && typeof p === "object" && typeof p.url === "string") return p.url;
      return null;
    })
    .filter((u): u is string => Boolean(u));
}

interface RoomDetailProps {
  room?: Room;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function RoomDetail({
  room,
  isLoading,
  isError,
  error,
  onRetry,
}: RoomDetailProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading room">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="aspect-21/9 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            <Skeleton className="h-8 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="space-y-6">
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          onClick={router.back}
        >
          <IconArrowLeft className="size-4" />
          Back to rooms
        </Button>
        <div
          role="alert"
          className="flex flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center"
        >
          <p className="text-base font-semibold text-destructive">
            Room not found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error?.message || "Could not load room."}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-4 gap-2"
            >
              <IconRotateClockwise className="size-4" />
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  const photos = photoUrls(room.photos);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={router.back}>
          <IconArrowLeft className="size-4" />
          Back to rooms
        </Button>
        <span className="text-xs text-muted-foreground">Room #{room.id}</span>
      </div>

      {photos.length > 0 ?
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-muted">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="relative aspect-16/10 md:col-span-2 md:aspect-auto md:h-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[0]}
                alt={room.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden flex-col gap-2 md:flex">
              {photos.slice(1, 3).map((url, idx) => (
                <div
                  key={idx}
                  className="relative h-39 overflow-hidden bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${room.name} ${idx + 2}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
              {photos.length <= 1 && (
                <div className="flex h-full items-center justify-center bg-muted/50 text-xs text-muted-foreground">
                  No additional photos
                </div>
              )}
            </div>
          </div>
        </div>
      : <div className="flex aspect-21/9 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border/70 bg-muted/40 text-muted-foreground">
          <IconPhotoOff className="size-8" />
          <p className="text-xs">No photos uploaded for this room</p>
        </div>
      }

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {room.name}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <IconUsers className="size-4" />
                {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <IconDoor className="size-4" />
                {room.total_rooms} {room.total_rooms === 1 ? "unit" : "units"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              About this room
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {room.description || "No description provided for this room."}
            </p>
          </div>

          {room.amenities && room.amenities.length > 0 && (
            <div className="border-t border-border/60 pt-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {room.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs text-foreground"
                  >
                    <IconCheck className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-20 border border-border/70 bg-card p-6 shadow-xs">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">Base rate</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    {idr.format(room.base_price)}
                  </span>
                  <span className="text-xs text-muted-foreground">/ night</span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-muted/40 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max Capacity</span>
                  <span className="font-medium text-foreground">
                    {room.capacity} guests
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Inventory</span>
                  <span className="font-medium text-foreground">
                    {room.total_rooms} units
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
