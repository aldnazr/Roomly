import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { axiosInstance } from "@/lib/api/axios-instance";
import { RoleResponse } from "./types";

export const roleApi = {
  list: async () =>
    (await axiosInstance.get<RoleResponse>(API_ENDPOINTS.roles.base)).data,
};
