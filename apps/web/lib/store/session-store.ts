import { create } from "zustand";

interface SessionState {
  open: boolean;
  showSessionExpired: () => void;
  hideSessionExpired: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  open: false,
  showSessionExpired: () => set({ open: true }),
  hideSessionExpired: () => set({ open: false }),
}));
