import ChordText from "@/components/tab/chordtext";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import { useConfigStore } from "src/state/config";
import useChords from "./useChords";
import useWindowDimensions from "./useWindowDimensions";

export default function useFormattedTab(plainTab: string, transposition: number, fontSize: number) {
  const { chords, transposedChords } = useChords(plainTab, transposition);
  const { debugMode } = useConfigStore();

  const { width } = useWindowDimensions();

  const [inversions, setInversions] = useState<{ [key: string]: number }>({});

  const lineCutoff = useMemo(() => Math.floor((width + 16) / (fontSize * 0.67)), [width, fontSize]);

  const formattedTab = useMemo(() => {
    let truncatedLines = recusivelyTruncate(plainTab, lineCutoff, debugMode);
    return truncatedLines;
  }, [plainTab, lineCutoff, debugMode]);

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
        <ChordText transposedChord={transposedChords[chord]} fontSize={fontSize} inversion={inversions[chord] ?? 0} />
      );
    }
  }

  return {
    cycleInversion,
    formattedTab,
    chordElements,
  };
}

function recusivelyTruncate(plainTab: string, lineCutoff: number, debugMode: boolean = false) {
  // this is incomplete... attempting to pad lines first so all lines are the same length. This is sort of not a good solution since this should be done on a [tab] tag group basis ... move this inside the replcae function

  const truncatedTab = plainTab.replace(/\[tab\]([\s\S]+?)\[\/tab\]/g, (_match, fencedTab: string) => {
    let lines = fencedTab.split("\n");

    const longestLine = Math.max(...lines.map((l) => stripTags(l).length));
    const paddedLines = lines.map((l) => {
      if (hasChords(l)) {
        return insertChordTags(rightPad(stripTags(l), longestLine));
      } else {
        return rightPad(l, longestLine);
      }
    });

    let repeatTruncate = true;
    // keep truncating lines until all lines are below the cutoff
    while (repeatTruncate) {
      let truncatedLines: string[] = [];
      repeatTruncate = false;

      lines = paddedLines.map((line: string) => {
        let chordline = hasChords(line);

        // working line excludes chord tags
        let workingLine = stripTags(line);

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
    if (debugMode) {
      lines.unshift("START TAB GROUP");
      lines.push("END TAB GROUP");
    }
    return lines.join("\n");
  });
  const finalTab = debugMode ? truncatedTab.replace(/ /g, "·") : truncatedTab;

  return finalTab;
}
function hasChords(line: string): boolean {
  return line.includes("[ch]") || line.includes("[/ch]");
}
function rightPad(str: string, length: number, pad: string = " ") {
  return str.length >= length ? str : pad.repeat(length - str.length) + str;
}

function stripTags(line: string): string {
  return line.replace(/\[ch\]/g, "").replace(/\[\/ch\]/g, "");
}

function insertChordTags(line: string): string {
  return line.replace(/\b([^ \n]+)/g, "[ch]$1[/ch]");
}
