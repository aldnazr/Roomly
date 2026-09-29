import { useQuery } from "@tanstack/react-query";
import { roomApi } from "./room-api";

export const roomKeys = {
  all: ["room"] as const,
  list: () => [...roomKeys.all, "list"] as const,
  detail: () => [...roomKeys.all, "detail"] as const,
};

export function useRoom() {
  return useQuery({
    queryKey: roomKeys.list(),
    queryFn: roomApi.list,
  });
}

export function useRoomDetail(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(),
    queryFn: () => roomApi.detail(id),
  });
}
