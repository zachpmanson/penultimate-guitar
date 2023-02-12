import Chord from "@/components/chord";
import useWindowDimensions from "@/hooks/windowdimensions";
import reactStringReplace from "react-string-replace";

type TabSheetProps = {
  plainTab: string;
};

export default function TabSheet({ plainTab }: TabSheetProps) {
  const { width } = useWindowDimensions();

  const maxLineLen = Math.max(
    ...plainTab.split("\n").map((l: string) => l.length)
  );
  const lineCutoff = Math.floor(width / 8);

  const insertChordTags = (line: string): string => {
    return line.replace(/\b([^ ]+?)\b/g, "[ch]$1[/ch]");
  };

  let formattedTab: string = plainTab.replace(
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
  );

  const isMobile = width <= 768;

  const fontSize = isMobile
    ? Math.min(14, (3 * width) / maxLineLen)
    : Math.min(14, (1.5 * width) / maxLineLen);

  console.log(
    "width:",
    width,
    "fontsize:",
    Math.min(14, (1.5 * width) / maxLineLen)
  );

  // console.log(plainTab);
  return (
    <div className="tab m-auto w-fit text-xs">
      {/* <div className="tab m-auto w-fit" style={{ fontSize: fontSize }}> */}
      <pre>
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
