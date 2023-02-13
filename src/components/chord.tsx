import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

type ChordProps = {
  chord: string;
  id: number;
};
export default function Chord({ chord, id }: ChordProps) {
  console.log("chord",chord)
  return (
    <>
      <span
        id={`${id}-tooltip`}
        className="text-blue-500"
        data-tooltip-content={`${chord} Chord tooltip here`}
        clickable
      >
        {chord}
      </span>
      <Tooltip anchorId={`${id}-tooltip`} />
    </>
  );
}
