import { Note, NotesHelper } from './note';
import { AbcKey } from './abc-key';

export class TuneNote {
  note: Note;
  accidentals: number;
  octave: number;

  static fromAbc(noteAbc: string): TuneNote {
    let accidentals = 0;
    let n = Note.C;
    let octave = 0;
    while (noteAbc.length > 0) {
      switch (noteAbc[0]) {
        case '^':
          accidentals++;
          break;
        case '_':
          accidentals--;
          break;
        case 'c':
        case 'C':
          n = Note.C;
          if (noteAbc[0].toLowerCase() === noteAbc[0]) { octave++; }
          break;
        case 'd':
        case 'D':
          n = Note.D;
          if (noteAbc[0].toLowerCase() === noteAbc[0]) { octave++; }
          break;
        case 'e':
        case 'E':
          n = Note.E;
          if (noteAbc[0].toLowerCase() === noteAbc[0]) { octave++; }
          break;
        case 'f':
        case 'F':
          n = Note.F;
          if (noteAbc[0].toLowerCase() === noteAbc[0]) { octave++; }
          break;
        case 'g':
        case 'G':
          n = Note.G;
          if (noteAbc[0].toLowerCase() === noteAbc[0]) { octave++; }
          break;
        case 'a':
        case 'A':
          n = Note.A;
          if (noteAbc[0].toLowerCase() === noteAbc[0]) { octave++; }
          break;
        case 'b':
        case 'B':
        case 'h':
        case 'H':
          n = Note.B;
          if (noteAbc[0].toLowerCase() === noteAbc[0]) { octave++; }
          break;
        case '\'':
          octave++;
          break;
        case ',':
          octave--;
          break;
      }
      noteAbc = noteAbc.substr(1);
    }

    return new TuneNote(n, accidentals, octave);
  }

  constructor(note: Note, accidentals: number, octave: number) {
    this.note = note;
    this.accidentals = accidentals;
    this.octave = octave;
  }

  toAbc(): string {
    return NotesHelper.noteToAbc(this.note, this.accidentals, this.octave);
  }

  toAdditionalAccidental(): string {
    const dbl = Math.abs(this.accidentals) > 1;
    const accChar = this.accidentals === 0 ? '=' : (this.accidentals > 0 ? '^' : '_');
    let r = accChar;
    if (dbl) {
      r += accChar;
    }
    r += NotesHelper.noteToString(this.note).toLowerCase();
    return r;
  }

  transpose(up: boolean): TuneNote {
    const newNote = new TuneNote(this.note, this.accidentals, this.octave);
    if (up) {
      if (newNote.accidentals < 1) {
        if (newNote.note === Note.E || newNote.note === Note.B) {
          newNote.note++;
          newNote.accidentals = 0;
        } else {
          newNote.accidentals++;
        }
      } else {
        newNote.note++;
        newNote.accidentals = 0;
      }
      if (newNote.note > Note.B) {
        newNote.octave++;
        newNote.note = Note.C;
      }
    } else {
      if (newNote.accidentals > -1) {
        if (newNote.note === Note.F || newNote.note === Note.C) {
          newNote.note--;
          newNote.accidentals = 0;
        } else {
          newNote.accidentals--;
        }
      } else {
        newNote.note--;
        newNote.accidentals = 0;
      }
      if (newNote.note < Note.C) {
        newNote.octave--;
        newNote.note = Note.B;
      }
    }
    return newNote;
  }
}
