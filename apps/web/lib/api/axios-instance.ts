import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// Server-side calls (next-auth authorize) use the API_URL service binding
// injected by Vercel; NEXT_PUBLIC_API_URL covers local dev. The browser uses
// same-origin /api so the Vercel rewrite proxies to the API service.
const baseURL =
  typeof window === "undefined" ?
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL ?? "";

export const axiosInstance = axios.create({
  baseURL,
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
