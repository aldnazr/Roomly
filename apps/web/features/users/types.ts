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

export interface UserDetailResponse {
  data: UserDetail;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
  role: string;
}
