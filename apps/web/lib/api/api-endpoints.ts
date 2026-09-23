// lib/api-endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
  },
  roles: {
    base: "/api/roles",
    permission: (slug: string) => `/api/roles/${slug}/permissions`,
  },
  permission: "/api/permissions",
} as const;
