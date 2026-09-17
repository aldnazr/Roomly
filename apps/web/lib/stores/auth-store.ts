import { User } from "@/types/user";
import Cookies from "js-cookie";
import { persist } from "zustand/middleware";
import { create } from "zustand/react";

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, expiresIn: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, expiresIn) => {
        const expiresDate = new Date(Date.now() + expiresIn * 1000);

        Cookies.set("roomly_access_token", accessToken, {
          expires: expiresDate,
          secure: true,
          sameSite: "strict",
        });
        set({ user, isAuthenticated: true });
      },

      clearAuth: () => {
        Cookies.remove("roomly_access_token");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "user_data",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
