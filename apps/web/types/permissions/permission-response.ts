export interface PermissionResponse {
  data: PermissionResponseDetail[];
}

export interface PermissionResponseDetail {
  slug: string;
  name: string;
  description: string;
}
