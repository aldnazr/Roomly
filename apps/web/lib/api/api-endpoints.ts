import { base } from "next/dist/build/webpack/config/blocks/base";

// lib/api-endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
  },
  permissions: {
    base: "/api/permissions",
  },
  roles: {
    base: "/api/roles",
    permission: (slug: string) => `/api/roles/${slug}/permissions`,
  },
} as const;
