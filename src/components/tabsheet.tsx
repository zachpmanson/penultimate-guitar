import Chord from "@/components/chord";
import useWindowDimensions from "@/hooks/windowdimensions";
import reactStringReplace from "react-string-replace";

type TabSheetProps = {
  plainTab: string;
};

export default function TabSheet({ plainTab }: TabSheetProps) {
  let formattedTab: string = plainTab
    .replace(/\[tab\]/g, "")
    .replace(/\[\/tab\]/g, "");

  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const maxLineLen = Math.max(
    ...plainTab.split("\n").map((l: string) => l.length)
  );

  const fontSize = isMobile
    ? Math.min(14, (3 * width) / maxLineLen)
    : Math.min(14, (1.5 * width) / maxLineLen);

  console.log(
    "width:",
    width,
    "fontsize:",
    Math.min(14, (1.5 * width) / maxLineLen)
  );

  return (
    <div className="tab m-auto w-fit" style={{ fontSize: fontSize }}>
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
