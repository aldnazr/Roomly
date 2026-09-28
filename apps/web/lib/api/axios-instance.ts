import axios from "axios";
import { getSession, signOut } from "next-auth/react";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  const session = await getSession();
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ redirectTo: "/login" });
    }
    return Promise.reject(error);
  },
);
