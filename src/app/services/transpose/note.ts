export enum Note {
  C = 0,
  D = 1,
  E = 2,
  F = 3,
  G = 4,
  A = 5,
  B = 6
}

export enum NoteAccidental {
  DblFlat = -2,
  Flat = -1,
  Neutral = 0,
  Sharp = 1,
  DblSharp = 2,
}

export class NotesHelper {
  static stringToNote(note: string): Note {
    switch (note.toUpperCase()) {
      case 'C':
        return Note.C;
      case 'D':
        return Note.D;
      case 'E':
        return Note.E;
      case 'F':
        return Note.F;
      case 'G':
        return Note.G;
      case 'A':
        return Note.A;
      case 'H':
      case 'B':
        return Note.B;
    }
    return null;
  }

  static isAccidental(c: string): boolean {
    switch (c) {
      case '^':
      case '_':
      case '=':
        return true;
      default:
        return false;
    }
  }

  static stringToAccidental(c: string): NoteAccidental {
    switch (c) {
      case '^':
        return NoteAccidental.Sharp;
      case '_':
        return NoteAccidental.Flat;
      case '=':
        return NoteAccidental.Neutral;
      default:
        return null;
    }
  }

  static accidentalToString(n: NoteAccidental): string {
    switch (n) {
      case NoteAccidental.Sharp:
        return '^';
      case NoteAccidental.DblSharp:
        return '^^';
      case NoteAccidental.Flat:
        return '_';
      case NoteAccidental.DblFlat:
        return '__';
      case NoteAccidental.Neutral:
        return '=';
    }
    return '';
  }

  static accidentalToKeyString(n: NoteAccidental): string {
    switch (n) {
      case NoteAccidental.Sharp:
        return '#';
      case NoteAccidental.Flat:
        return 'b';
    }
    return '';
  }

  static isNoteChar(c: string): boolean {
    switch (c.toUpperCase()) {
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
      case 'A':
      case 'H':
      case 'B':
        return true;
      default: return false;
    }
  }

  static noteToString(note: Note): string {
    switch (note) {
      case Note.D:
        return 'D';
      case Note.E:
        return 'E';
      case Note.F:
        return 'F';
      case Note.G:
        return 'G';
      case Note.A:
        return 'A';
      case Note.B:
        return 'B';
      default:
        return 'C';
    }
  }

  static noteToAbc(note: Note, accidental?: NoteAccidental, octave?: number): string {
    if (!octave) { octave = 0; }

    let r = NotesHelper.accidentalToString(accidental);
    r += NotesHelper.noteToString(note);
    if (octave > 0) {
      r = r.toLowerCase();
      octave--;
    }
    const octaveChar = octave > 0 ? '\'' : ',';
    for (let i = 0; i < Math.abs(octave); i++) {
      r += octaveChar;
    }
    return r;
  }

  static isOctaveChar(c: string): boolean {
    return NotesHelper.stringToOctave(c) !== 0;
  }

  static stringToOctave(c: string): number {
    switch (c) {
      case '\'':
        return 1;
      case ',':
        return -1;
      default:
        return 0;
    }
  }

  static isAbcNoteBeginning(c: string): boolean {
    return NotesHelper.isAccidental(c) || NotesHelper.isNoteChar(c);
  }

  static isAbcNoteChar(c: string): boolean {
    return NotesHelper.isAbcNoteBeginning(c) || NotesHelper.isOctaveChar(c);
  }

  static isAbcChordBeginning(c: string): boolean {
    return c === '"';
  }
}
