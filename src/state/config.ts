import { Mode } from "@/models/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ConfigState = {
  mode: Mode;
};

type ConfigActions = {
  setMode: (mode: Mode) => void;
};

export const useConfigStore = create<ConfigState & ConfigActions>()(
  persist(
    (set) => ({
      mode: "default",
      setMode: (mode: Mode) => set(() => ({ mode })),
    }),
    {
      name: "config-storage", // name of the item in the storage (must be unique)
    }
  )
);
