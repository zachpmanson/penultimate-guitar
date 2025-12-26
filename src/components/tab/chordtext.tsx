import { useConfigStore } from "@/state/config";
import { TransposedChord } from "@/types/tab";
import Chord from "@tombatossals/react-chords/lib/Chord";
import { useRef } from "react";

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
  transposedChord,
  fontSize,
  inversion,
}: {
  transposedChord: TransposedChord;
  fontSize: number;
  inversion: number;
}) {
  const { guitarChords: chordsDB } = useConfigStore();

  let positions = chordsDB?.chords[transposedChord.chordDbChord.replace("#", "sharp")]?.find(
    (c) => c.suffix === transposedChord.fullSuffix
  )?.positions;

  let chordObj = positions ? positions[inversion % positions.length] : undefined;

  const fullTransposedChord = transposedChord.fullChord;
  const size = fontSize * 12;

  const inputRef = useRef<HTMLElement>(null);

  return (
    <span className="group w-max" ref={inputRef}>
      <span
        className={`bg-gray-200 dark:bg-gray-600 font-bold rounded-md chord z-10 relative ${
          chordObj && "cursor-pointer"
        }`}
      >
        {fullTransposedChord}
      </span>
      {chordObj && (
        <div
          style={{
            width: size,
            top: inputRef.current ? inputRef.current?.offsetTop - size : 0,
            left: `50%`,
            transform: `translateX(-50%)`,
          }}
          className="pointer-events-none absolute z-50 bg-white  opacity-0 transition-opacity group-hover:opacity-100 border-black border-2 rounded-sm"
        >
          <div className="text-center chord text-black">
            <span className="font-bold mr-2">{`${transposedChord.key}${transposedChord.simpleSuffix}`}</span>
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
