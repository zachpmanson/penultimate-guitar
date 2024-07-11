import { TabDto } from "@/models/models";

export const DEFAULT_TAB: TabDto = {
  taburl: "",
  song: { id: 0, name: "", artist: "" },
  contributors: [],
  capo: 0,
  tab: "",
  version: 0,
  songId: 0,
  rating: 0,
  type: "Tab",
};

export type TransposedChord = {
  fullChord: string;
  chordDbChord: string;
  simpleSuffix: string;
  fullSuffix: string;
  key: string;
};
