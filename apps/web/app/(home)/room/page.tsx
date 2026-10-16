"use client";

import { Button } from "@/components/ui/button";
import { RoomList } from "@/features/rooms/components/room-list";
import { RoomListSkeleton } from "@/features/rooms/components/room-list-skeleton";
import { useRoom } from "@/features/rooms/use-rooms";
import Link from "next/link";

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
        <Button render={<Link href={'/room/create'}/>}>Create Room</Button>
      </div>

      {isLoading ?
        <RoomListSkeleton />
      : <RoomList
          rooms={rooms}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
        />
      }
    </div>
  );
}
