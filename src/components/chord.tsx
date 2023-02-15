import { useEffect, useState } from "react";
import { Tooltip, TooltipWrapper } from "react-tooltip";

type ChordProps = {
  chord: string;
  id: number;
};
export default function Chord({ chord, id }: ChordProps) {
  const [isMounted, setIsMounted] = useState(false); // Need this for the react-tooltip

  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <>
      <TooltipWrapper tooltipId={`tooltip-${id}`}>
        <span className="text-blue-500">{chord}</span>
      </TooltipWrapper>
      {isMounted && (
        <Tooltip
          id={`tooltip-${id}`}
          content={`${chord} Chord tooltip here`}
          clickable
        />
      )}
    </>
  );
}
