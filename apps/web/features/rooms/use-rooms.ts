import { useQuery } from "@tanstack/react-query";
import { roomApi } from "./room-api";

export const roomKeys = {
  all: ["room"] as const,
  list: () => [...roomKeys.all, "list"] as const,
  detail: (id?: string) => [...roomKeys.all, "detail", id] as const,
};

export function useRoom() {
  return useQuery({
    queryKey: roomKeys.list(),
    queryFn: roomApi.list,
  });
}

export function useRoomDetail(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomApi.detail(id),
    enabled: !!id,
  });
}
