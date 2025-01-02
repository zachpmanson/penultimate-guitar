import useFormattedTab from "@/hooks/useFormattedTab";
import reactStringReplace from "react-string-replace";

export default function TabSheet({
  plainTab,
  fontSize,
  transposition,
}: {
  plainTab: string;
  fontSize: number;
  transposition: number;
}) {
  const { formattedTab, chordElements, cycleInversion } = useFormattedTab(
    plainTab,
    transposition,
    fontSize
  );
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-fit">
        <pre
          className="whitespace-pre-wrap"
          style={{ fontSize: `${fontSize}px` }}
        >
          {reactStringReplace(
            formattedTab,
            /\[ch\](.+?)\[\/ch\]/gm,
            (chord) => (
              <span onClick={() => cycleInversion(chord)}>
                {chordElements.get(chord)}
              </span>
            )
          )}
        </pre>
      </div>
    </div>
  );
}
