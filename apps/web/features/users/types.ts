export interface UserResponse {
  data: User[];
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface UserDetailResponse {
  data: User;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
  role: string;
}
