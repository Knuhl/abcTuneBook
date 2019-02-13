import { Note, NoteAccidental, NotesHelper } from './note';

export class TuneNote {
  note: Note;
  accidental?: NoteAccidental;
  octave: number;

  static fromAbc(noteAbc: string): TuneNote {
    let accidentals;
    let n = Note.C;
    let octave = 0;
    while (noteAbc.length > 0) {
      switch (noteAbc[0]) {
        case '^':
          accidentals = accidentals === NoteAccidental.Sharp ? NoteAccidental.DblSharp : NoteAccidental.Sharp;
          break;
        case '_':
          accidentals = accidentals === NoteAccidental.Flat ? NoteAccidental.DblFlat : NoteAccidental.Flat;
          break;
        case '=':
          accidentals = NoteAccidental.Neutral;
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

  constructor(note: Note, accidental?: NoteAccidental, octave?: number) {
    this.note = note;
    if (accidental in NoteAccidental) {
      this.accidental = accidental;
    } else {
      this.accidental = null;
    }
    if (!octave) {
      octave = 0;
    }
    this.octave = octave;
  }

  toAbc(): string {
    return NotesHelper.noteToAbc(this.note, this.accidental, this.octave);
  }

  toAdditionalAccidental(): string {
    let r = NotesHelper.accidentalToString(this.accidental);
    r += NotesHelper.noteToString(this.note).toLowerCase();
    return r;
  }

  transpose(up: boolean): TuneNote {
    const newNote = new TuneNote(this.note, this.accidental, this.octave);
    if (up) {
      if (newNote.accidental !== null) {
        if ((newNote.accidental >= NoteAccidental.Sharp) ||
          ((newNote.accidental === NoteAccidental.Neutral) && (newNote.note === Note.E || newNote.note === Note.B))) {
          newNote.note++;
          newNote.accidental = null;
        } else {
          newNote.accidental++;
        }
      } else {
        if (newNote.note === Note.E || newNote.note === Note.B) {
          newNote.note++;
        } else {
          newNote.accidental = NoteAccidental.Sharp;
        }
      }
      if (newNote.note > Note.B) {
        newNote.octave++;
        newNote.note = Note.C;
      }
    } else {
      if (newNote.accidental !== null) {
        if ((newNote.accidental <= NoteAccidental.Flat) ||
          ((newNote.accidental === NoteAccidental.Neutral) && (newNote.note === Note.F || newNote.note === Note.C))) {
          newNote.note--;
          newNote.accidental = null;
        } else {
          newNote.accidental--;
        }
      } else {
        if (newNote.note === Note.F || newNote.note === Note.C) {
          newNote.note--;
        } else {
          newNote.accidental = NoteAccidental.Flat;
        }
      }
      if (newNote.note < Note.C) {
        newNote.octave--;
        newNote.note = Note.B;
      }
    }
    return newNote;
  }
}
