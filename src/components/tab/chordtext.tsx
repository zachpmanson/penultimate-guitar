import { useGlobal } from "@/contexts/Global/context";
import Chord from "@tombatossals/react-chords/lib/Chord";

type ChordProps = {
  chord: string;
  transposition: number;
  fontSize: number;
  inversion: number;
};

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

export default function ChordText({
  chord,
  transposition,
  fontSize,
  inversion,
}: ChordProps) {
  const { chords: chordsDB } = useGlobal();
  let keys = chordsDB?.keys;

  let matches = chord.match(/^[A-Z][#b]?/);
  let key = matches ? matches[0] : "N/A";
  let suffix = chord.replace(/^[A-Z][#b]?/g, "");

  let transposedKey = key;
  if (keys && transposition !== 0 && chord !== "N.C.") {
    key = KEY_MAP[key];
    if (transposition < 0) {
      transposition = keys.length - (Math.abs(transposition) % keys.length);
    }
    let currentIndex = keys.findIndex((i) => i === key);
    transposedKey = keys[(currentIndex + transposition) % keys.length];
  }

  if (keys && suffix.includes("/") && transposition !== 0) {
    let [start, bassNote] = suffix.split("/");
    bassNote = KEY_MAP[bassNote];
    let currentIndex = keys.findIndex((i) => i === bassNote);
    transposedKey = keys[(currentIndex + transposition) % keys.length];

    suffix = `${start}/${transposedKey}`;
  }

  let simpleSuffix = suffix.split("/")[0];

  let chordSuffix = chordsDB?.suffixes
    ? getSuffix(simpleSuffix, chordsDB?.suffixes)
    : "major";

  if (GODS_MISTAKES.includes(transposedKey)) {
    transposedKey = KEY_MAP[transposedKey];
  }

  let chordsDBConvertedKey = KEY_MAP[transposedKey] ?? transposedKey;
  let positions = chordsDB?.chords[
    chordsDBConvertedKey.replace("#", "sharp")
  ]?.find((c) => c.suffix === chordSuffix)?.positions;
  let chordObj = positions
    ? positions[inversion % positions.length]
    : undefined;
  const size = fontSize * 12;

  return (
    <span className="group relative w-max">
      <span
        className={`bg-gray-200 font-bold chord z-10 relative ${
          chordObj && "cursor-pointer"
        }`}
      >{`${transposedKey}${suffix}`}</span>

      {chordObj && (
        <div
          style={{
            width: size,
            top: -size - 5,
            left: -size / 2.5,
          }}
          className="pointer-events-none absolute z-50 bg-white opacity-0 transition-opacity group-hover:opacity-100 border-black border-2 rounded"
        >
          <div className="text-center chord">
            <span className="font-bold mr-2">
              {`${transposedKey}${simpleSuffix}`}
            </span>
            <span>
              ({(inversion % (positions?.length ?? 0)) + 1}/{positions?.length})
            </span>
          </div>
          <Chord chord={chordObj} instrument={instrument} lite={true} />
        </div>
      )}
    </span>
  );
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
