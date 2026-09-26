export interface UserResponse {
  data: UserDetail[];
}

export interface UserDetail {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}
