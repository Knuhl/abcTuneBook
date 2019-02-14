import { Note, NoteAccidental, NotesHelper } from './note';
import { TuneNote } from './tune-note';

export class AbcKey {
  private note: Note;
  private accidental: number; // b -1, '' 0 , # 1
  private mode: string; // MAJ MIN MIX DOR ...
  private additions: string; // clef=bass...
  private additionalAccidentals: TuneNote[] = [];
  private changedNotes = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  static fromKeyLine(abcKey: string, previousKey: AbcKey): AbcKey {
    const keyRegex = /^\s*([CDEFGAB])\s*([#b]?)\s*((?:m|maj|ion|min|aeo|mix|dor|phr|lyd|loc)[^\s]*)?[\s$]*/i;
    const keyAccidentalsRegex = /([\^_=]+[CDEFGAB]{1})(?=\s|$|[\^_=])/ig;
    const additionalsRegex = /\s*(?:\s*[\^_=]+[CDEFGAB]{1})*\s*(.*)/i;
    const keyMatch = abcKey.match(keyRegex);
    if (!keyMatch || !keyMatch[1] || keyMatch[1].length < 1) {
      if (!previousKey) {
        return null;
      }

      const keyAccidentalsMatch = abcKey.match(keyAccidentalsRegex);
      if (!keyAccidentalsMatch || keyAccidentalsMatch.length < 1) {
        return null;
      } else {
        const add = keyAccidentalsMatch.map(acc => TuneNote.fromAbc(acc));
        const additionsMatch = abcKey.match(additionalsRegex);
        const additions = additionsMatch && additionsMatch[1] ? additionsMatch[1] : '';
        const newKey = new AbcKey(previousKey.note, previousKey.accidental, previousKey.mode, add, additions);
        return newKey;
      }

    } else {
      const rest = abcKey.substr(keyMatch[0].length);
      const keyAccidentalsMatch = rest.match(keyAccidentalsRegex);
      const additionsMatch = rest.match(additionalsRegex);
      let additionalAccidentals: TuneNote[] = [];
      if (keyAccidentalsMatch) {
        additionalAccidentals = keyAccidentalsMatch.map(a => TuneNote.fromAbc(a));
      }
      const acc = keyMatch[2] ? keyMatch[2].toUpperCase() : '';
      const r = new AbcKey(NotesHelper.stringToNote(keyMatch[1] ? keyMatch[1] : ''),
        acc === 'B' ? -1 : (acc === '#' ? 1 : 0),
        keyMatch[3],
        additionalAccidentals,
        additionsMatch[1]);
      return r;
    }
  }

  constructor(note: Note, accidental?: number, mode?: string, additionalAccidentals?: TuneNote[], additions?: string) {
    this.note = note ? note : Note.C;
    this.accidental = accidental ? accidental : 0;
    this.setMode(mode ? mode : '');
    this.setChangedNotesOfKey();
    if (additionalAccidentals) {
      this.applyAdditionalKeyAccidentals(additionalAccidentals);
    }
    this.additions = additions ? additions : '';
  }

  keyInAbc(): string {
    return (NotesHelper.noteToString(this.note) +
      NotesHelper.accidentalToKeyString(this.accidental) +
      (this.mode === 'MAJ' ? '' : (this.mode === 'MIN' ? 'm' : (' ' + this.mode.toLowerCase()))) +
      ' ' +
      this.additionalAccidentals.map(n => n.toAdditionalAccidental()).join(' ') +
      ' ' +
      this.additions).trim();
  }

  transposeKey(up: boolean, preferSharp?: boolean): AbcKey {
    let note = this.note;
    let accidental = this.accidental;

    if (up) {
      if (this.accidental < 0) {
        // from b to neutral
        accidental = 0;
      } else if (this.accidental === 0) {
        if (this.note === Note.E || this.note === Note.B) {
          note++;
        } else if (preferSharp) {
          // from neutral to #
          accidental++;
        } else {
          // from neutral to next b
          note++;
          accidental = -1;
        }
      } else {
        // from # to neutral
        accidental = 0;
        note++;
      }
    } else {
      if (this.accidental < 0) {
        // from b to neutral
        accidental = 0;
        note--;
      } else if (this.accidental === 0) {
        if (this.note === Note.F || this.note === Note.C) {
          note--;
        } else if (preferSharp) {
          // from neutral to prev #
          accidental++;
          note--;
        } else {
          // from neutral to b
          accidental = -1;
        }
      } else {
        // from # to neutral
        accidental = 0;
      }
    }

    if (note > Note.B) { note = Note.C; } else if (note < Note.C) { note = Note.B; }

    const newKey = new AbcKey(note, accidental, this.mode, null, this.additions);

    const additionalAccidentals: TuneNote[] = [];
    for (let i = 0; i < this.additionalAccidentals.length; i++) {
      const cur = this.additionalAccidentals[i];
      // TODO: Consolidate
      const next = cur.transpose(up);
      additionalAccidentals.push(next);
    }
    newKey.applyAdditionalKeyAccidentals(additionalAccidentals);

    return newKey;
  }

  noteInKey(note: TuneNote): TuneNote {
    const keyAccidentalsForNote = this.changedNotes[note.note];
    let newAccidentals = null;
    if (note.accidental === null) {
      if (keyAccidentalsForNote !== 0) {
        newAccidentals = keyAccidentalsForNote;
      }
    } else if (note.accidental === NoteAccidental.Neutral && keyAccidentalsForNote !== 0) {
      newAccidentals = NoteAccidental.Neutral;
    } else {
      newAccidentals = keyAccidentalsForNote + note.accidental;
      if (newAccidentals > NoteAccidental.DblSharp) {
        newAccidentals = NoteAccidental.DblSharp;
      } else if (newAccidentals < NoteAccidental.DblFlat) {
        newAccidentals = NoteAccidental.DblFlat;
      }
    }
    return new TuneNote(note.note, newAccidentals, note.octave);
  }

  abcNoteInKey(note: TuneNote): TuneNote {
    const keyAccidentalsForNote = this.changedNotes[note.note];
    const abcNote = new TuneNote(note.note, note.accidental, note.octave);
    if (abcNote.accidental === null && keyAccidentalsForNote !== 0) {
      abcNote.accidental = NoteAccidental.Neutral;
    } else if (keyAccidentalsForNote !== 0) {
      if (abcNote.accidental === keyAccidentalsForNote) {
        abcNote.accidental = null;
      } else {
        // e.g. _g in f#
        if (abcNote.accidental === NoteAccidental.Flat) {
          return this.abcNoteInKey(new TuneNote(NotesHelper.fixNote(abcNote.note - 1), NoteAccidental.Sharp, note.octave));
        } else if (abcNote.accidental === NoteAccidental.Sharp) {
          return this.abcNoteInKey(new TuneNote(NotesHelper.fixNote(abcNote.note + 1), NoteAccidental.Flat, note.octave));
        }
        abcNote.accidental = abcNote.accidental - keyAccidentalsForNote;
      }
    }

    if (abcNote.accidental === NoteAccidental.Neutral && keyAccidentalsForNote === 0) {
      abcNote.accidental = null;
    }
    return abcNote;
  }

  applyAdditionalKeyAccidentals(additionalAccidentals: TuneNote[]) {
    if (!additionalAccidentals) { return; }
    if (this.additionalAccidentals && this.additionalAccidentals.length > 0) {
      throw new Error('additional accidentals already set');
    }
    this.additionalAccidentals = [];
    for (let i = 0; i < additionalAccidentals.length; i++) {
      const n = additionalAccidentals[i];
      if (n.note in Note && n.accidental in NoteAccidental) {
        if (n.accidental === NoteAccidental.Neutral) {
          this.changedNotes[n.note] = 0;
        } else {
          this.changedNotes[n.note] += n.accidental;
          if (this.changedNotes[n.note] > NoteAccidental.DblSharp) {
            this.changedNotes[n.note] = NoteAccidental.DblSharp;
          } else if (this.changedNotes[n.note] < NoteAccidental.DblFlat) {
            this.changedNotes[n.note] = NoteAccidental.DblFlat;
          }
        }
        this.additionalAccidentals.push(n);
      }
    }
  }

  private setMode(mode: string) {
    if (!mode || mode.length < 1) {
      this.mode = 'MAJ';
    } else if (mode.toUpperCase() === 'M') {
      this.mode = 'MIN';
    } else if (mode.length < 3) {
      this.mode = 'MAJ';
    } else {
      this.mode = mode.substr(0, 3).toUpperCase();
      if (this.mode === 'ION') {
        this.mode = 'MAJ';
      } else if (this.mode === 'AEO') {
        this.mode = 'MIN';
      }
    }
  }

  private setChangedNotesOfKey() {
    const accidentals = NotesHelper.accidentalCountOfKey(this.note, this.accidental, this.mode);

    // sharps
    if (accidentals > 0) {
      const sharpTable = {
        1: 3, // fis
        2: 0, // cis
        3: 4, // gis
        4: 1, // dis
        5: 5, // ais
        6: 2, // eis
        7: 6 // his
      };
      for (let i = 1; i <= accidentals; i++) {
        this.changedNotes[sharpTable[i]]++;
      }
    }

    // flats
    if (accidentals < 0) {
      const flatTable = {
        1: 6, // b
        2: 2, // es
        3: 5, // as
        4: 1, // des
        5: 4, // ges
        6: 0, // ces
        7: 3 // fes
      };
      for (let i = 1; i <= Math.abs(accidentals); i++) {
        this.changedNotes[flatTable[i]]--;
      }
    }
  }
}
