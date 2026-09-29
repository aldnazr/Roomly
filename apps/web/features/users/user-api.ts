import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { axiosInstance } from "@/lib/api/axios-instance";
import {
  UserCreatePayload,
  UserDetail,
  UserDetailResponse,
  UserResponse,
} from "./types";

export const userApi = {
  list: async () =>
    (await axiosInstance.get<UserResponse>(API_ENDPOINTS.user.list)).data,
  detail: async (id: string) =>
    (await axiosInstance.get<UserDetailResponse>(API_ENDPOINTS.user.detail(id)))
      .data.data,
  create: async (payload: UserCreatePayload) =>
    await axiosInstance.post(API_ENDPOINTS.user.create, payload),
  update: async (id: string) =>
    await axiosInstance.put(API_ENDPOINTS.user.update(id)),
  delete: async (id: string) =>
    await axiosInstance.delete(API_ENDPOINTS.user.delete(id)),
};
