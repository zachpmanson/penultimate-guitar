declare module "@tombatossals/react-chords/lib/Chord" {
  export default function Chord({
    chord,
    instrument,
    lite,
  }: {
    chord: import("../models/chorddb.models").ChordDB.ChordPosition;
    instrument: import("../models/chorddb.models").ChordDB.Main;
    lite: boolean;
  }): JSX.Element;
}
