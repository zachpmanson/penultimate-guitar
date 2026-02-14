import { useConfigStore } from "@/state/config";
import { TransposedChord } from "@/types/tab";
import Chord from "@tombatossals/react-chords/lib/Chord";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

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
  const [showPopup, setShowPopup] = useState(false);
  const [popupStyle, setPopupStyle] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!showPopup) return;
    const handleScrollOrResize = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      setPopupStyle({ top: rect.top + window.scrollY - size, left: rect.left + window.scrollX + rect.width / 2 });
    };

    handleScrollOrResize();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [showPopup, size]);

  return (
    <>
      <span
        className="group w-max"
        ref={inputRef}
        tabIndex={0}
        onTouchStart={() => inputRef.current?.focus()}
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
        onFocus={() => setShowPopup(true)}
        onBlur={() => setShowPopup(false)}
      >
        <span
          className={`bg-gray-200 dark:bg-gray-600 font-bold rounded-md chord z-10 relative ${
            chordObj && "cursor-pointer"
          }`}
        >
          {fullTransposedChord}
        </span>
      </span>

      {chordObj && showPopup && popupStyle
        ? ReactDOM.createPortal(
            <div
              style={{
                position: "absolute",
                width: size,
                top: popupStyle.top,
                // left: popupStyle.left,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
              }}
              className="pointer-events-none bg-white border-black border-2 rounded"
            >
              <div className="text-center chord text-black">
                <span className="font-bold mr-2">{`${transposedChord.key}${transposedChord.simpleSuffix}`}</span>
                <span>
                  ({(inversion % (positions?.length ?? 0)) + 1}/{positions?.length})
                </span>
              </div>
              <Chord chord={chordObj} instrument={instrument} lite={true} />
            </div>,
            // portal root must exist in _document.tsx
            (typeof document !== "undefined" && document.getElementById("portal-root")) || document.body
          )
        : null}
    </>
  );
}
