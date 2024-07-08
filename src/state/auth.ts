import { create } from "zustand";

type AuthStore = {
  userId: string;
};

type AuthActions = {
  setUserId: (userId: string) => void;
};

export const useAuthStore = create<AuthStore & AuthActions>()((set) => ({
  userId: "",
  setUserId: (userId: string) => set({ userId }),
}));
