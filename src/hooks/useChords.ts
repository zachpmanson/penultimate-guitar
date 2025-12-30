import { useConfigStore } from "@/state/config";
import { TransposedChord } from "@/types/tab";
import { useMemo, useState } from "react";

/**
 * For chords that shouldn't exist but somehow do
 */
const GODS_MISTAKES = ["H"];

const KEY_MAP: { [key: string]: string } = {
  A: "A",
  "A#": "Bb",
  Bb: "Bb",
  B: "B",
  H: "B", // exists in some German songs, see tab/1684995
  C: "C",
  "C#": "C#",
  Db: "C#",
  D: "D",
  "D#": "Eb",
  E: "E",
  F: "F",
  "F#": "F#",
  Gb: "F#",
  G: "G",
  "G#": "Ab",
  Ab: "Ab",
};

const instrument = {
  strings: 6,
  fretsOnChord: 4,
  name: "Guitar",
  keys: [],
  tunings: {
    standard: ["E", "A", "D", "G", "B", "E"],
  },
};

export default function useChords(plainTab: string, transposition: number = 0) {
  const { guitarChords: chordsDB } = useConfigStore();
  let keys = chordsDB?.keys;

  const allChords = useMemo(() => {
    return plainTab.match(/\[ch\](.*?)\[\/ch\]/gm);
  }, [plainTab]);

  const chords = useMemo(() => {
    return [...new Set(allChords?.map((c) => c.replace("[ch]", "").replace("[/ch]", "")))];
  }, [allChords]);

  const transposedChords = useMemo(() => {
    function transposeChord(chord: string, transposition: number): TransposedChord {
      let matches = chord.match(/^[A-Z][#b]?/);
      let key = matches ? matches[0] : "N/A";
      let suffix = chord.replace(/^[A-Z][#b]?/g, "");

      let transposedKey = key;

      // tranpose the key
      if (keys && transposition !== 0 && chord !== "N.C.") {
        key = KEY_MAP[key];
        if (transposition < 0) {
          transposition = keys.length - (Math.abs(transposition) % keys.length);
        }
        let keyIndex = keys.findIndex((i) => i === key);
        transposedKey = keys[(keyIndex + transposition) % keys.length];
      }

      let [simpleSuffix, bassNote] = suffix.split("/");
      let transposedBassNote = bassNote;

      // if transpose the bass note
      if (keys && bassNote && transposition !== 0) {
        bassNote = KEY_MAP[bassNote];

        let bassIndex = keys.findIndex((i) => i === bassNote);
        transposedBassNote = keys[(bassIndex + transposition) % keys.length];
      }

      let chordSuffix = chordsDB?.suffixes ? getSuffix(simpleSuffix, chordsDB?.suffixes) : "major";

      if (GODS_MISTAKES.includes(transposedKey)) {
        transposedKey = KEY_MAP[transposedKey];
      }
      let chordsDBConvertedKey = KEY_MAP[transposedKey] ?? transposedKey;

      const fullTransposedChord = `${transposedKey}${simpleSuffix}${
        bassNote?.length > 0 ? `/${transposedBassNote}` : ""
      }`;
      return {
        fullChord: fullTransposedChord,
        chordDbChord: chordsDBConvertedKey.replace("#", "sharp"),
        simpleSuffix: simpleSuffix, // TODO check if needed
        fullSuffix: chordSuffix,
        key: transposedKey,
      };
    }

    return Object.fromEntries(chords.map((chord) => [chord, transposeChord(chord, transposition)]));
  }, [chords, transposition, chordsDB?.suffixes, keys]);

  return {
    chords: chords,
    transposedChords: transposedChords,
  };
}

const SUBS = {
  "": "major",
  m: "minor",
  sus: "sus4",
};
/**
 * @param chordSuffix
 * @param SUFFIXES list of proper suffixes
 * @returns the proper suffix of the chord
 */
function getSuffix(chordSuffix: string, SUFFIXES: string[]) {
  let FULL_SUFFIX_MAP: { [key: string]: string } = {
    ...SUBS,
  };
  for (let suffix of SUFFIXES) {
    FULL_SUFFIX_MAP[suffix] = suffix;
  }
  chordSuffix = FULL_SUFFIX_MAP[chordSuffix];
  for (let suffix of Object.values(FULL_SUFFIX_MAP)) {
    if (suffix === chordSuffix) {
      return suffix;
    }
  }
  return "major";
}
