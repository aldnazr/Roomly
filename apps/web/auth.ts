import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { axiosInstance } from "./lib/api/axios-instance";
import { API_ENDPOINTS } from "./lib/api/api-endpoints";
import { authApi } from "./features/auth/auth-api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        try {
          const response = await authApi.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          const { accessToken, expiresIn, user } = response.data;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken,
            expiresAt: Date.now() + expiresIn * 1000,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.expiresAt = user.expiresAt;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.accessToken = token.accessToken as string;

      return session;
    },
  },
});
