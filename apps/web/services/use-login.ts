import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { axiosInstance } from "@/lib/axios-instance";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ApiError } from "@/types/api-error";
import { LoginResponse } from "@/types/auth/login-response";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<
    LoginResponse,
    AxiosError<ApiError>,
    { email: string; password: string }
  >({
    mutationFn: (credentials) =>
      axiosInstance
        .post<LoginResponse>(API_ENDPOINTS.auth.login, credentials)
        .then((res) => res.data),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken, data.expiresIn);

      router.refresh();
    },
  });
}
