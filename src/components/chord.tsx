import { Tooltip, TooltipWrapper } from "react-tooltip";

type ChordProps = {
  chord: string;
  id: number;
};
export default function Chord({ chord, id }: ChordProps) {
  return (
    <>
      <TooltipWrapper tooltipId={`tooltip-${id}`}>
        <span className="text-blue-500">{chord}</span>
      </TooltipWrapper>
      <Tooltip
        key={id}
        id={`tooltip-${id}`}
        content={`${chord} Chord tooltip here`}
        clickable
      />
    </>
  );
}
