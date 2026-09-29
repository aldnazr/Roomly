import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "./user-api";
import { UserCreatePayload } from "./types";

export const userKeys = {
  all: ["user"] as const,
  detail: () => [...userKeys.all, "detail"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export function useUser() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: userApi.list,
  });
}

export function useUserDetail(id?: string) {
  return useQuery({
    queryKey: userKeys.detail(),
    queryFn: () => userApi.detail(id!),
    enabled: !!id,
  });
}

export function useUserCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => userApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}

export function useUserDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}
