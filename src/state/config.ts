import { ChordDB } from "@/models/chorddb.models";
import { Mode } from "@/models/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ConfigState = {
  mode: Mode;
  guitarChords?: ChordDB.GuitarChords;
  debugMode: boolean;
};

type ConfigActions = {
  setMode: (mode: Mode) => void;
  setGuitarChords: (chords: ChordDB.GuitarChords) => void;
  setDebugMode: (debugMode: boolean) => void;
};

export const useConfigStore = create<ConfigState & ConfigActions>()(
  persist(
    (set) => ({
      mode: "default",
      setMode: (mode: Mode) => set(() => ({ mode })),

      guitarChords: undefined,
      setGuitarChords: (chords: ChordDB.GuitarChords) => set(() => ({ guitarChords: chords })),
      debugMode: false,
      setDebugMode: (debugMode: boolean) => set(() => ({ debugMode })),
    }),
    {
      name: "config-storage", // name of the item in the storage (must be unique)
    }
  )
);
