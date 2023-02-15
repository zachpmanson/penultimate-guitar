type ChordProps = {
  chord: string;
  id: number;
  transposition: number;
};

const sharpNotes = [
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
];
const flatNotes = [
  "A",
  "Bb",
  "B",
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
];

export default function Chord({ chord, id, transposition }: ChordProps) {
  let transposedChord = chord;
  // console.log(chord);
  if (transposition !== 0) {
    // transposedChord = chord.replace(/[A-Z][^#b]/g, (match) => {
    //   let currentIndex = sharpNotes.findIndex((i) => i === match);
    //   return sharpNotes[(currentIndex + transposition) % sharpNotes.length];
    // });

    if (chord.includes("#")) {
      transposedChord = chord.replace(/([A-Z]#)/g, (match) => {
        let currentIndex = sharpNotes.findIndex((i) => i === match);
        return sharpNotes[(currentIndex + transposition) % sharpNotes.length];
      });
    } else if (chord.includes("b")) {
      transposedChord = chord.replace(/([A-Z]b)/g, (match) => {
        let currentIndex = flatNotes.findIndex((i) => i === match);
        return flatNotes[(currentIndex + transposition) % flatNotes.length];
      });
    } else {
      transposedChord = chord.replace(/([A-Z]+)/g, (match) => {
        let currentIndex = flatNotes.findIndex((i) => i === match);
        return flatNotes[(currentIndex + transposition) % flatNotes.length];
      });
    }
  }

  return (
    <>
      <span
        id={`tooltip-${id}`}
        className="text-blue-500"
        data-tooltip-variant="success"
      >
        {transposedChord}
      </span>
    </>
  );
}
