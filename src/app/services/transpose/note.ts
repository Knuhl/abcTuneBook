export enum Note {
  C = 0,
  D = 1,
  E = 2,
  F = 3,
  G = 4,
  A = 5,
  B = 6
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
        return true;
      default:
        return false;
    }
  }

  static stringToAccidental(c: string): number {
    switch (c) {
      case '^':
        return 1;
      case '_':
        return -1;
      default:
        return 0;
    }
  }

  static accidentalToKeyString(n: number): string {
    if (n < 0) { return 'b'; }
    if (n > 0) { return '#'; }
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

  static noteToAbc(note: Note, accidentals?: number, octave?: number): string {
    if (!accidentals) { accidentals = 0; }
    if (!octave) { octave = 0; }

    const dbl = Math.abs(accidentals) > 1;
    const accChar = accidentals > 0 ? '^' : '_';
    let r = '';
    if (accidentals !== 0) {
      r = accChar;
      if (dbl) {
        r += accChar;
      }
    }
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
}
