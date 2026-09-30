import { axiosInstance } from "@/lib/api/axios-instance";
import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { LoginRequest, LoginResponse, MeResponse } from "./types";

export const authApi = {
  login: async (payload: LoginRequest) =>
    (await axiosInstance.post<LoginResponse>(API_ENDPOINTS.auth.login, payload))
      .data,
  me: async () =>
    (await axiosInstance.get<MeResponse>(API_ENDPOINTS.auth.me)).data,
};
