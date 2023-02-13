import Chord from "@/components/chord";
import useWindowDimensions from "@/hooks/windowdimensions";
import { useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";

type TabSheetProps = {
  plainTab: string;
};

export default function TabSheet({ plainTab }: TabSheetProps) {
  const { width } = useWindowDimensions();
  const [formattedTab, setFormattedTab] = useState("");
  
  console.log(plainTab);
  // const maxLineLen = Math.max(
  //   ...plainTab.split("\n").map((l: string) => l.length)
  // );

  const insertChordTags = (line: string): string => {
    return line.replace(/\b([^ ]+?)\b/g, "[ch]$1[/ch]");
  };

  const [lineCutoff, setLineCutoff] = useState(40);
  useEffect(() => {
    setLineCutoff(Math.floor(width / 8));
  }, [width]);

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

            lines = [...lines, ...truncatedLines];
          }
          return lines.join("\n");
        }
      )
    );
  }, [lineCutoff, plainTab]);

  return (
    <div className="tab m-auto w-fit text-xs">
      <pre className="max-w-[100vw] overflow-x-scroll">
        {reactStringReplace(
          formattedTab,
          /\[ch\](.+?)\[\/ch\]/g,
          (match, i) => (
            <Chord chord={match} id={i} />
          )
        )}
      </pre>
    </div>
  );
}
