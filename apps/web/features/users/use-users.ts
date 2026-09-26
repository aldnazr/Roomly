import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "./user-api";
import { UserCreatePayload } from "./types";

export const userKeys = {
  all: ["user"] as const,
  list: () => [...userKeys.all, "list"] as const,
  delete: () => [...userKeys.all, "delete"] as const,
};

export const useUser = () =>
  useQuery({
    queryKey: userKeys.list(),
    queryFn: userApi.list,
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
    mutationKey: userKeys.delete(),
    mutationFn: ({ id }: { id: string }) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
};
