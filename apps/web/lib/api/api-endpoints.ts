import { base } from "next/dist/build/webpack/config/blocks/base";

// lib/api-endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
  },
  permission: {
    base: "/api/permissions",
    set: (userRole: string) => `/api/roles/${userRole}/permissions`,
  },
  role: {
    base: "/api/roles",
  },
  user: {
    list: "/api/users",
    detail: (id: string) => `/api/users/${id}`,
    create: "/api/users",
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
  },
} as const;
