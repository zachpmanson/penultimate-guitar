export namespace ChordDB {
  export type ChordPosition = {
    frets: number[];
    fingers: number[];
    barres?: number[];
    baseFret: number;
    capo?: boolean;
    midi: number[];
  };

  export type Chord = {
    key: string;
    suffix: string;
    positions: ChordPosition[];
  };

  export type Tunings = {
    [key: string]: string[];
  };

  export type Main = {
    strings: number;
    fretsOnChord: number;
    name: string;
    numberOfChords?: number;
    tunings?: {
      standard: string[];
    };
  };

  export type Chords = {
    [key: string]: Chord[];
  };

  export type GuitarChords = {
    main: Main;
    tunings: Tunings;
    keys: string[];
    suffixes: string[];
    chords: Chords;
  };
}
