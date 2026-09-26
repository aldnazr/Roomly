import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { axiosInstance } from "@/lib/api/axios-instance";
import { UserResponse } from "./types";

export const userApi = {
  list: async () =>
    (await axiosInstance.get<UserResponse>(API_ENDPOINTS.user.list)).data,
  create: async () => await axiosInstance.get(API_ENDPOINTS.user.create),
  update: async (id: string) =>
    await axiosInstance.get(API_ENDPOINTS.user.update(id)),
  delete: async (id: string) =>
    await axiosInstance.get(API_ENDPOINTS.user.delete(id)),
};
