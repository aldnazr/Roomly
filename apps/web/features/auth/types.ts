import { User } from "../users/types";

export type LoginRequest = { email: string; password: string };

export type LoginResponse = {
  data: {
    accessToken: string;
    expiresIn: number;
    user: User;
  };
};
