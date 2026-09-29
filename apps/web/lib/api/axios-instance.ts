import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// Server-side calls (next-auth authorize) use the API_URL service binding
// injected by Vercel; the browser goes through the same-origin /api rewrite.
const baseURL =
  typeof window === "undefined" ?
    process.env.NEXT_PUBLIC_API_URL
  : "http://localhost:4000";

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
