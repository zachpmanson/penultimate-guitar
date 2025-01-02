import ChordText from "@/components/tab/chordtext";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useChords from "./useChords";
import useWindowDimensions from "./useWindowDimensions";

export default function useFormattedTab(
  plainTab: string,
  transposition: number,
  fontSize: number,
) {
  const { chords, transposedChords } = useChords(plainTab, transposition);

  const { width } = useWindowDimensions();

  const [formattedTab, setFormattedTab] = useState("");

  const [inversions, setInversions] = useState<{ [key: string]: number }>({});

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

  const cycleInversion = (chord: string) => {
    if (!isMobile) {
      setInversions((old) => {
        let value = { ...old };
        value[chord] += 1;
        return value;
      });
    }
  };

  let chordElements: Map<string, JSX.Element> = new Map();
  for (let chord of Object.keys(inversions).sort()) {
    // check chord exists, when switching between versions of the same song some renders might not have all chords
    if (transposedChords[chord]) {
      chordElements.set(
        chord,
        <ChordText
          transposedChord={transposedChords[chord]}
          fontSize={fontSize}
          inversion={inversions[chord] ?? 0}
        />,
      );
    }
  }

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
        },
      ),
    );
  }, [lineCutoff, plainTab]);

  return {
    cycleInversion,
    formattedTab,
    chordElements,
  };
}

const insertChordTags = (line: string): string => {
  return line.replace(/\b([^ \n]+)/g, "[ch]$1[/ch]");
};
