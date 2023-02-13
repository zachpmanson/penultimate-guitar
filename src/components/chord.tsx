import { Tooltip, TooltipWrapper } from 'react-tooltip';
import "react-tooltip/dist/react-tooltip.css";

type ChordProps = {
  chord: string;
  id: number;
};
export default function Chord({ chord, id }: ChordProps) {
  console.log("chord",chord, "id",id)
  return (
    <>
      <TooltipWrapper tooltipId={`tooltip-${id}`} >
        <span
          className="text-blue-500"
          >
          {chord}
        </span>
      </TooltipWrapper>
      <Tooltip id={`tooltip-${id}`} content={`${chord} Chord tooltip here`} />
    </>
  );
}
