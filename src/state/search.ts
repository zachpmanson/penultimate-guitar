import { create } from "zustand";

type SearchState = {
  searchText: string;
};

type SearchActions = {
  setSearchText: (t: string) => void;
};

export const useSearchStore = create<SearchState & SearchActions>()((set) => ({
  searchText: "",
  setSearchText: (searchText: string) => set({ searchText }),
}));
