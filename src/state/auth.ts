import { create } from "zustand";

type AuthStore = {
  userId?: string;
};

type AuthActions = {
  setUserId: (userId?: string) => void;
};

export const useAuthStore = create<AuthStore & AuthActions>()((set) => ({
  userId: undefined,
  setUserId: (userId?: string) => set({ userId }),
}));
