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
  static fixNote(note: Note): Note {
    if (note > Note.B) {
      return this.fixNote(note - 7);
    } else if (note < Note.C) {
      return this.fixNote(note + 7);
    }
    return note;
  }

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

  static accidentalCountOfKey(note: Note, accidental: number, mode: string): number {
    const acc = accidental > 0 ? '#' : (accidental < 0 ? 'B' : '');
    const key = NotesHelper.noteToString(note) + acc + mode.toUpperCase();
    switch (key) {
      case 'C#MAJ':
      case 'A#MIN':
      case 'G#MIX':
      case 'D#DOR':
      case 'E#PHR':
      case 'F#LYD':
      case 'B#LOC':
        return 7;
      case 'F#MAJ':
      case 'D#MIN':
      case 'C#MIX':
      case 'G#DOR':
      case 'A#PHR':
      case 'BLYD':
      case 'E#LOC':
        return 6;
      case 'BMAJ':
      case 'G#MIN':
      case 'F#MIX':
      case 'C#DOR':
      case 'D#PHR':
      case 'ELYD':
      case 'A#LOC':
        return 5;
      case 'EMAJ':
      case 'C#MIN':
      case 'BMIX':
      case 'F#DOR':
      case 'G#PHR':
      case 'ALYD':
      case 'D#LOC':
        return 4;
      case 'AMAJ':
      case 'F#MIN':
      case 'EMIX':
      case 'BDOR':
      case 'C#PHR':
      case 'DLYD':
      case 'G#LOC':
        return 3;
      case 'DMAJ':
      case 'BMIN':
      case 'AMIX':
      case 'EDOR':
      case 'F#PHR':
      case 'GLYD':
      case 'C#LOC':
        return 2;
      case 'GMAJ':
      case 'EMIN':
      case 'DMIX':
      case 'ADOR':
      case 'BPHR':
      case 'CLYD':
      case 'F#LOC':
        return 1;
      case 'CMAJ':
      case 'AMIN':
      case 'GMIX':
      case 'DDOR':
      case 'EPHR':
      case 'FLYD':
      case 'BLOC':
        return 0;
      case 'FMAJ':
      case 'DMIN':
      case 'CMIX':
      case 'GDOR':
      case 'APHR':
      case 'BBLYD':
      case 'ELOC':
        return -1;
      case 'BBMAJ':
      case 'GMIN':
      case 'FMIX':
      case 'CDOR':
      case 'DPHR':
      case 'EBLYD':
      case 'ALOC':
        return -2;
      case 'EBMAJ':
      case 'CMIN':
      case 'BBMIX':
      case 'FDOR':
      case 'GPHR':
      case 'ABLYD':
      case 'DLOC':
        return -3;
      case 'ABMAJ':
      case 'FMIN':
      case 'EBMIX':
      case 'BBDOR':
      case 'CPHR':
      case 'DBLYD':
      case 'GLOC':
        return -4;
      case 'DBMAJ':
      case 'BBMIN':
      case 'ABMIX':
      case 'EBDOR':
      case 'FPHR':
      case 'GBLYD':
      case 'CLOC':
        return -5;
      case 'GBMAJ':
      case 'EBMIN':
      case 'DBMIX':
      case 'ABDOR':
      case 'BBPHR':
      case 'CBLYD':
      case 'FLOC':
        return -6;
      case 'CBMAJ':
      case 'ABMIN':
      case 'GBMIX':
      case 'DBDOR':
      case 'EBPHR':
      case 'FBLYD':
      case 'BBLOC':
        return -7;
      default:
        break;
    }
    // TODO reeval
    if (acc === '#') {
      // e.g. G#, try as Ab
      const nextNote = NotesHelper.fixNote(note + 1);
      return NotesHelper.accidentalCountOfKey(nextNote, -1, mode);
    } else if (acc === 'B') {
      const prevNote = NotesHelper.fixNote(note - 1);
      return NotesHelper.accidentalCountOfKey(prevNote, 1, mode);
    } else {
      throw new Error('could not evaluate count of sharps/flats in key ' + key);
    }
  }
}
