import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { axiosInstance } from "@/lib/api/axios-instance";
import { PermissionResponse } from "./types";

export const permissionApi = {
  list: async () =>
    (
      await axiosInstance.get<PermissionResponse>(
        API_ENDPOINTS.permissions.base,
      )
    ).data,
};
