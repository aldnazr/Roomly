import { axiosInstance } from "@/lib/api/axios-instance";
import { RoomDetailResponse, RoomResponse } from "./types";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";

export const roomApi = {
  list: async () =>
    (await axiosInstance.get<RoomResponse>(API_ENDPOINTS.room.list)).data,
  detail: async (id: string) =>
    (await axiosInstance.get<RoomDetailResponse>(API_ENDPOINTS.room.detail(id)))
      .data,
  create: async () =>
    (await axiosInstance.post(API_ENDPOINTS.room.create)).data,
  update: async (id: string) =>
    (await axiosInstance.patch(API_ENDPOINTS.room.update(id))).data,
  delete: async (id: string) =>
    (await axiosInstance.delete(API_ENDPOINTS.room.delete(id))).data,
};
