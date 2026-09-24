import { useQuery } from "@tanstack/react-query";
import { roleApi } from "./role-api";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
};

export const useRoles = () =>
  useQuery({
    queryKey: roleKeys.list(),
    queryFn: roleApi.list,
  });
