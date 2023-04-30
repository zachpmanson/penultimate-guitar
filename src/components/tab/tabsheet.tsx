import ChordText from "@/components/tab/chordtext";
import useWindowDimensions from "@/hooks/windowdimensions";
import { useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";

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
  const isMobile = width <= 768;
  const [formattedTab, setFormattedTab] = useState("");
  const [inversions, setInversions] = useState<{ [key: string]: number }>({});

  let chordElements: { [key: string]: JSX.Element } = {};
  for (let chord of Object.keys(inversions)) {
    chordElements[chord] = (
      <ChordText
        chord={chord}
        transposition={transposition}
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
    const allChords = plainTab.match(/\[ch\](.*?)\[\/ch\]/gm);
    const allUniqueChords = [
      ...new Set(
        allChords?.map((c) => c.replace("[ch]", "").replace("[/ch]", ""))
      ),
    ];
    setInversions(() => {
      let newValue = {};
      Object.assign(newValue, ...allUniqueChords.map((k) => ({ [k]: 0 })));
      return newValue;
    });
  }, [plainTab, transposition]);

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
    <div className="tab m-auto w-fit max-w-[100%]">
      <pre
        className="max-w-[100%] whitespace-pre-wrap"
        style={{ fontSize: `${fontSize}px` }}
      >
        {reactStringReplace(formattedTab, /\[ch\](.+?)\[\/ch\]/gm, (match) => (
          <span onClick={() => increaseInversion(match)}>
            {chordElements[match]}
          </span>
        ))}
      </pre>
    </div>
  );
}
