import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "./user-api";
import { UserCreatePayload, UserUpdatePayload } from "./types";

export const userKeys = {
  all: ["user"] as const,
  detail: (id?: string) => [...userKeys.all, "detail", id] as const,
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
    queryKey: userKeys.detail(id),
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

export function useUserUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserUpdatePayload }) =>
      userApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
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
