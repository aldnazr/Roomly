"use client";

import { useRoom } from "@/features/rooms/use-rooms";
import { RoomList } from "@/features/rooms/components/room-list";
import { RoomListSkeleton } from "@/features/rooms/components/room-list-skeleton";

export default function RoomPage() {
  const { data, isLoading, isError, error, refetch } = useRoom();
  const rooms = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Rooms
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage room inventory, capacity, and nightly rates.
          </p>
        </div>
        {rooms && (
          <span className="self-start rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs text-muted-foreground sm:self-auto">
            {rooms.length} {rooms.length === 1 ? "room type" : "room types"}
          </span>
        )}
      </div>

      {isLoading ? (
        <RoomListSkeleton />
      ) : (
        <RoomList
          rooms={rooms}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
        />
      )}
    </div>
  );
}

