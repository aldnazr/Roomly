export interface MeResponse {
  data: MeData;
}

export interface MeData {
  id: number;
  username: string;
  name: string;
  email: string;
  role: MeRole;
  permissions: string[];
}

export interface MeRole {
  slug: string;
  name: string;
  description: string;
}
