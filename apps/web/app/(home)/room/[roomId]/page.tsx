"use client";

import { useRoomDetail } from "@/features/rooms/use-rooms";
import { RoomDetail } from "@/features/rooms/components/room-detail";
import { useParams } from "next/navigation";

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data, isLoading, isError, error, refetch } = useRoomDetail(roomId);

  return (
    <RoomDetail
      room={data?.data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
    />
  );
}
