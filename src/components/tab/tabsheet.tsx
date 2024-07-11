import ChordText from "@/components/tab/chordtext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useEffect, useMemo, useState } from "react";
import reactStringReplace from "react-string-replace";
import { isMobile } from "react-device-detect";
import useChords from "@/hooks/useChords";

type TabSheetProps = {
  plainTab: string;
  fontSize: number;
  transposition: number;
};

export default function TabSheet({
  plainTab,
  fontSize,
  transposition,
}: TabSheetProps) {
  const { width } = useWindowDimensions();
  const [formattedTab, setFormattedTab] = useState("");

  const [inversions, setInversions] = useState<{ [key: string]: number }>({});

  const { chords, transposedChords } = useChords(plainTab, transposition);

  let chordElements: Map<string, JSX.Element> = new Map();
  for (let chord of Object.keys(inversions).sort()) {
    chordElements.set(
      chord,
      <ChordText
        transposedChord={transposedChords[chord]}
        fontSize={fontSize}
        inversion={inversions[chord] ?? 0}
      />
    );
  }

  const increaseInversion = (chord: string) => {
    if (!isMobile) {
      setInversions((old) => {
        let value = { ...old };
        value[chord] += 1;
        return value;
      });
    }
  };

  const insertChordTags = (line: string): string => {
    return line.replace(/\b([^ \n]+)/g, "[ch]$1[/ch]");
  };

  const [lineCutoff, setLineCutoff] = useState(40);
  useEffect(() => {
    setLineCutoff(Math.floor((width + 16) / (fontSize * 0.67)));
  }, [width, fontSize]);

  useEffect(() => {
    setInversions(() => {
      let newValue = {};
      Object.assign(newValue, ...chords.map((k) => ({ [k]: 0 })));
      return newValue;
    });
  }, [chords, transposition]);

  useEffect(() => {
    setFormattedTab(
      plainTab.replace(
        /\[tab\]([\s\S]+?)\[\/tab\]/g,
        (_match, fencedTab: string) => {
          let lines = fencedTab.split("\n");
          let repeatTruncate = true;
          // keep truncating lines until all lines are below the cutoff
          while (repeatTruncate) {
            let truncatedLines: string[] = [];
            repeatTruncate = false;

            lines = lines.map((line: string) => {
              let chordline = line.includes("[ch]") || line.includes("[/ch]");

              // working line excludes chord tags
              let workingLine = line
                .replace(/\[ch\]/g, "")
                .replace(/\[\/ch\]/g, "");

              const postCutoff = workingLine.slice(lineCutoff);
              if (postCutoff) {
                // reinsert chord tags if necessary
                if (chordline) {
                  truncatedLines.push(insertChordTags(postCutoff));
                } else {
                  truncatedLines.push(postCutoff);
                }

                repeatTruncate = postCutoff.length > lineCutoff;
              }

              // reinsert chord tags if necessary
              if (chordline) {
                return insertChordTags(workingLine.slice(0, lineCutoff));
              } else {
                return workingLine.slice(0, lineCutoff);
              }
            });

            if (truncatedLines.length > 0) {
              lines = [...lines, "", ...truncatedLines];
            }
          }
          return lines.join("\n");
        }
      )
    );
  }, [lineCutoff, plainTab]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* {[...chordElements.keys()].length > 0 && (
        <div className="flex p-3 border border-gray-200 rounded-xl">
          <div
            className="flex-grow w-0 flex flex-wrap gap-2"
            style={{ fontSize: `${fontSize}px` }}
          >
            {[...chordElements.entries()].map(([chord, element]) => (
              <pre>
                <span onClick={() => increaseInversion(chord)}>{element}</span>
              </pre>
            ))}
          </div>
        </div>
      )} */}
      <div className="w-fit">
        <pre
          className="whitespace-pre-wrap"
          style={{ fontSize: `${fontSize}px` }}
        >
          {reactStringReplace(
            formattedTab,
            /\[ch\](.+?)\[\/ch\]/gm,
            (chord) => (
              <span onClick={() => increaseInversion(chord)}>
                {chordElements.get(chord)}
              </span>
            )
          )}
        </pre>
      </div>
    </div>
  );
}
