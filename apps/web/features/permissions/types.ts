export interface PermissionResponse {
  data: Permission[];
}

export interface Permission {
  slug: string;
  name: string;
  description: string;
}

export interface SetPermissionPayload {
  permissions: string[];
}
