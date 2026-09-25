import { useQueries, useQuery } from "@tanstack/react-query";
import { roleApi } from "./role-api";
import { permissionKeys } from "../permissions/use-permissions";
import { permissionApi } from "../permissions/permission-api";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
};

export const useRoles = () =>
  useQuery({
    queryKey: roleKeys.list(),
    queryFn: roleApi.list,
  });

export function useRoleDetail() {
  const [permissionsQuery, rolesQuery] = useQueries({
    queries: [
      { queryKey: permissionKeys.list(), queryFn: permissionApi.list },
      { queryKey: roleKeys.list(), queryFn: roleApi.list },
    ],
  });

  return {
    permissions: permissionsQuery.data,
    roles: rolesQuery.data,
    isLoading: permissionsQuery.isLoading || rolesQuery.isLoading,
    isError: permissionsQuery.isError || rolesQuery.isError,
    error: permissionsQuery.error ?? rolesQuery.error,
  };
}
