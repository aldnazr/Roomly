import { useParams } from "next/navigation";

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();

  return <>{roomId}</>;
}
