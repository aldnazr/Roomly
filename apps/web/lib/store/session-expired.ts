import { create } from "zustand";

export const useSessionExpired = create<{ open: boolean }>(() => ({
  open: false,
}));

export const showSessionExpired = () =>
  useSessionExpired.setState({ open: true });

export const hideSessionExpired = () =>
  useSessionExpired.setState({ open: false });
