import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { axiosInstance } from "@/lib/api/axios-instance";
import { PermissionResponse, SetPermissionPayload } from "./types";

export const permissionApi = {
  list: async () =>
    (
      await axiosInstance.get<PermissionResponse>(
        API_ENDPOINTS.permissions.base,
      )
    ).data,
  set: async (userRole: string, payload: SetPermissionPayload) =>
    await axiosInstance.put(API_ENDPOINTS.permissions.set(userRole), payload),
};
