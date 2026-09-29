"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionApi } from "./permission-api";
import { SetPermissionPayload } from "./types";
import { roleKeys } from "../roles/use-roles";

export const permissionKeys = {
  all: ["permission"] as const,
  list: () => [...permissionKeys.all, "list"] as const,
};

export function usePermission() {
  return useQuery({
    queryKey: permissionKeys.list(),
    queryFn: permissionApi.list,
  });
}

export function useSetPermission(userRole: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SetPermissionPayload) =>
      permissionApi.set(userRole, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleKeys.list() }),
  });
}
