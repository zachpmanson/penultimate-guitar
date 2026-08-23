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
  isMobile,
  onCycle,
}: {
  transposedChord: TransposedChord;
  fontSize: number;
  inversion: number;
  isMobile: boolean;
  onCycle?: () => void;
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
  const closeTimer = useRef<number | null>(null);

  const openPopup = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setShowPopup(true);
  };

  const closePopup = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // The cycle button lives in a portal OUTSIDE the chord span, so moving the
    // pointer/tap from the chord to the button crosses the span's boundary and
    // fires onMouseLeave/onBlur. Delay the close so the button's own
    // enter/click handlers can cancel it — otherwise the popup vanishes the
    // moment you try to cycle inversions.
    closeTimer.current = window.setTimeout(() => setShowPopup(false), 150);
  };

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
        onMouseEnter={openPopup}
        onMouseLeave={closePopup}
        onFocus={openPopup}
        onBlur={closePopup}
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
              className="pointer-events-none relative bg-white border-black border-2 rounded"
            >
              <div className="text-center chord text-black px-8 pt-1 pb-0.5">
                <span className="font-bold mr-2">{`${transposedChord.key}${transposedChord.simpleSuffix}`}</span>
                <span>
                  ({(inversion % (positions?.length ?? 0)) + 1}/{positions?.length})
                </span>
              </div>
              <Chord chord={chordObj} instrument={instrument} lite={true} />
              {isMobile && onCycle && (positions?.length ?? 0) > 1 ? (
                <button
                  type="button"
                  aria-label="Cycle to the next chord inversion"
                  className="pointer-events-auto absolute top-1.5 right-1.5 rounded-full bg-gray-200 text-black hover:bg-gray-300 px-2 py-1 text-sm font-bold leading-none select-none"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={openPopup}
                  onMouseLeave={closePopup}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Tapping the button can blur the chord span (and thus
                    // close the popup); refocus it so the popup stays open
                    // across the inversion switch.
                    inputRef.current?.focus();
                    onCycle();
                  }}
                >
                  ⟳
                </button>
              ) : null}
            </div>,
            // portal root must exist in _document.tsx
            (typeof document !== "undefined" && document.getElementById("portal-root")) || document.body
          )
        : null}
    </>
  );
}
