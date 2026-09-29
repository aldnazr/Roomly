export interface SetRoleRequest {
  permissions: string[];
}

export interface RoleResponse {
  data: Role[];
}

export interface Role {
  slug: string;
  name: string;
  description: string;
  permissions: string[];
}
