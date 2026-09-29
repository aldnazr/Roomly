import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "./user-api";
import { UserCreatePayload } from "./types";

export const userKeys = {
  all: ["user"] as const,
  detail: () => [...userKeys.all, "detail"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export const useUser = () =>
  useQuery({
    queryKey: userKeys.list(),
    queryFn: userApi.list,
  });

export const useUserDetail = (id?: string) =>
  useQuery({
    queryKey: userKeys.detail(),
    queryFn: () => userApi.detail(id!),
    enabled: !!id,
  });

export const useUserCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => userApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
};

export const useUserDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
};
