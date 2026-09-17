import { axiosInstance } from "@/lib/axios-instance";
import { ApiError } from "@/types/api-error";
import { LoginResponse } from "@/types/auth/login-response";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useLogin() {
  return useMutation<
    LoginResponse,
    AxiosError<ApiError>,
    { email: string; password: string }
  >({
    mutationFn: (credentials) =>
      axiosInstance
        .post<LoginResponse>("/api/auth/login", credentials)
        .then((res) => res.data),
    onSuccess: ({ data }) => {
      // ponytail: token di sessionStorage; pindah ke httpOnly cookie saat ada refresh token
      sessionStorage.setItem("roomly_access_token", data.accessToken);
    },
  });
}
