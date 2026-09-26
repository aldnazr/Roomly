import { useQueries, useQuery } from "@tanstack/react-query";
import { permissionKeys } from "../permissions/use-permissions";
import { permissionApi } from "../permissions/permission-api";
import { userApi } from "./user-api";

export const userKeys = {
  all: ["user"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export const useUser = () =>
  useQuery({
    queryKey: userKeys.list(),
    queryFn: userApi.list,
  });
