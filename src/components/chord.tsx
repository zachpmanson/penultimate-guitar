import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

type ChordProps = {
  chord: string;
  id: number;
};
export default function Chord({ chord, id }: ChordProps) {
  console.log("chord",chord, "id",id)
  return (
    <>
      <span
        id={`${id}-tooltip`}
        className="text-blue-500"
      >
        {chord}
      </span>
      <Tooltip anchorId={`${id}-tooltip`} content="{`${chord} Chord tooltip here`}" clickable></Tooltip>
    </>
  );
}
