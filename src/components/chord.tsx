import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

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
      <span id={`tooltip-${id}`} className="text-blue-500">
        {chord}
      </span>
      {isMounted && (
        <Tooltip
          anchorId={`tooltip-${id}`}
          content={`${chord} Chord tooltip here`}
          clickable
        />
      )}
    </>
  );
}
