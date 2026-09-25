"use client";

import { useQuery } from "@tanstack/react-query";
import { permissionApi } from "./permission-api";

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
