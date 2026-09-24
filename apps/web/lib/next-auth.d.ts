// types/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    accessToken?: string;
    expiresAt?: number;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      accessToken?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    accessToken?: string;
    expiresAt?: number;
  }
}
