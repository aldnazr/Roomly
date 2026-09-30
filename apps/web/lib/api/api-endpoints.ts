export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    me: "/api/auth/me",
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
  room: {
    list: "/api/room-types",
    detail: (id: string) => `/api/room-types/${id}`,
    create: "/api/room-types",
    update: (id: string) => `/api/room-types/${id}`,
    delete: (id: string) => `/api/room-types/${id}`,
  },
} as const;
