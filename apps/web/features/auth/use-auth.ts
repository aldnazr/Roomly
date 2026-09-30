import { useQuery } from "@tanstack/react-query";
import { authApi } from "./auth-api";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useMe() {
  return useQuery({ queryKey: authKeys.me(), queryFn: authApi.me });
}
