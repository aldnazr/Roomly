export interface SetRoleRequest {
  permissions: string[];
}
export interface RoleResponse {
  data: RoleResponseDetail[];
}

export interface RoleResponseDetail {
  slug: string;
  name: string;
  description: string;
  permissions: string[];
}
