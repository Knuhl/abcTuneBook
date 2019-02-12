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
}
