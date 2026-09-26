import { base } from "next/dist/build/webpack/config/blocks/base";

// lib/api-endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
  },
  permissions: {
    base: "/api/permissions",
    set: (userRole: string) => `/api/roles/${userRole}/permissions`,
  },
  roles: {
    base: "/api/roles",
  },
} as const;
