import { Note, NotesHelper } from './note';
import { TuneNote } from './tune-note';
import B = Note.B;

export class AbcKey {
  private note: Note;
  private accidental: number; // b -1, '' 0 , # 1
  private mode: string; //MAJ MIN MIX DOR ...
  private additions: string; //clef=bass...
  private additionalAccidentals: TuneNote[] = [];
  private changedNotes = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  }

  static fromKeyLine(abcKey: string, previousKey: AbcKey): AbcKey {
    const keyRegex = /^\s*([CDEFGAB])\s*([#b]?)\s*((?:m|maj|ion|min|aeo|mix|dor|phr|lyd|loc)[^\s]*)?[\s$]/i;
    const keyAccidentalsRegex = /([\^_=]+[CDEFGAB]{1})(?=\s|$|[\^_=])/ig;
    const additionalsRegex = /\s*(?:\s*[\^_=]+[CDEFGAB]{1})*\s*(.*)/i;
    const keyMatch = abcKey.match(keyRegex);
    if (!keyMatch || !keyMatch[1] || keyMatch[1].length < 1) {
      console.log('no key found in ' + abcKey);

      if (!previousKey) {
        return null;
      }

      const keyAccidentalsMatch = abcKey.match(keyAccidentalsRegex);
      if (!keyAccidentalsMatch || keyAccidentalsMatch.length < 1) {
        console.log('no changed key-values found in ' + abcKey);
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
      console.log('matched key values from abc K: line', keyMatch, keyAccidentalsMatch, additionsMatch);
      let additionalAccidentals: TuneNote[] = [];
      if (keyAccidentalsMatch) {
        additionalAccidentals = keyAccidentalsMatch.map(acc => TuneNote.fromAbc(acc));
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

    if (note > Note.B) { note = Note.C; }
    else if (note < Note.C) { note = Note.B; }

    const newKey = new AbcKey(note, accidental, this.mode, null, this.additions);

    const additionalAccidentals: TuneNote[] = [];
    for (let i = 0; i < this.additionalAccidentals.length; i++) {
      const cur = this.additionalAccidentals[i];
      const next = new TuneNote(cur.note, cur.accidentals, cur.octave);
      // TODO: Consolidate
      if (up) {
        if (next.accidentals !== 0) {
          if (this.note !== newKey.note || next.accidentals > 0) {
            next.note++;
            next.accidentals = 0;
          } else {
            next.accidentals++;
          }
        } else {
          if (next.note === Note.E || next.note === Note.B) {
            next.note++;
          } else {
            next.accidentals = 1;
          }
        }
      } else {
        if (next.accidentals !== 0) {
          if (this.note !== newKey.note || next.accidentals < 0) {
            next.note--;
            next.accidentals = 0;
          } else {
            next.accidentals--;
          }
        } else {
          if (next.note === Note.F || next.note === Note.C) {
            next.note--;
          } else {
            next.accidentals = -1;
          }
        }
      }

      if (next.note > B) { next.note = Note.C; }
      else if (next.note < Note.C) { next.note = Note.B; }

      additionalAccidentals.push(next);
    }
    newKey.applyAdditionalKeyAccidentals(additionalAccidentals);

    return newKey;
  }

  noteInKey(note: Note, accidentals: number): string {
    accidentals += this.changedNotes[note];
    const noteString = NotesHelper.noteToString(note);
    if (accidentals === 0) { return noteString; }
    const dbl = Math.abs(accidentals) > 1;
    const accChar = accidentals > 0 ? '^' : '_';
    const r = accChar + (dbl ? accChar : '') + noteString;
    return r;
  }

  applyAdditionalKeyAccidentals(additionalAccidentals: TuneNote[]) {
    if (!additionalAccidentals) { return; }
    if (this.additionalAccidentals && this.additionalAccidentals.length > 0) {
      throw new Error('additional accidentals already set');
    }
    this.additionalAccidentals = [];
    for (let i = 0; i < additionalAccidentals.length; i++) {
      const n = additionalAccidentals[i];
      if (n.note >= 0) {
        if (n.accidentals === 0) {
          this.changedNotes[n.note] = 0;
        } else {
          this.changedNotes[n.note] += n.accidentals;
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
    const acc = this.accidental > 0 ? '#' : (this.accidental < 0 ? 'B' : '');
    const key = NotesHelper.noteToString(this.note) + acc + this.mode;
    let sharps = 0;
    let flats = 0;
    switch (key) {
      case 'C#MAJ':
      case 'A#MIN':
      case 'G#MIX':
      case 'D#DOR':
      case 'E#PHR':
      case 'F#LYD':
      case 'B#LOC':
        sharps = 7;
        break;
      case 'F#MAJ':
      case 'D#MIN':
      case 'C#MIX':
      case 'G#DOR':
      case 'A#PHR':
      case 'BLYD':
      case 'E#LOC':
        sharps = 6;
        break;
      case 'BMAJ':
      case 'G#MIN':
      case 'F#MIX':
      case 'C#DOR':
      case 'D#PHR':
      case 'ELYD':
      case 'A#LOC':
        sharps = 5;
        break;
      case 'EMAJ':
      case 'C#MIN':
      case 'BMIX':
      case 'F#DOR':
      case 'G#PHR':
      case 'ALYD':
      case 'D#LOC':
        sharps = 4;
        break;
      case 'AMAJ':
      case 'F#MIN':
      case 'EMIX':
      case 'BDOR':
      case 'C#PHR':
      case 'DLYD':
      case 'G#LOC':
        sharps = 3;
        break;
      case 'DMAJ':
      case 'BMIN':
      case 'AMIX':
      case 'EDOR':
      case 'F#PHR':
      case 'GLYD':
      case 'C#LOC':
        sharps = 2;
        break;
      case 'GMAJ':
      case 'EMIN':
      case 'DMIX':
      case 'ADOR':
      case 'BPHR':
      case 'CLYD':
      case 'F#LOC':
        sharps = 1;
        break;
      case 'FMAJ':
      case 'DMIN':
      case 'CMIX':
      case 'GDOR':
      case 'APHR':
      case 'BBLYD':
      case 'ELOC':
        flats = 1;
        break;
      case 'BBMAJ':
      case 'GMIN':
      case 'FMIX':
      case 'CDOR':
      case 'DPHR':
      case 'EBLYD':
      case 'ALOC':
        flats = 2;
        break;
      case 'EBMAJ':
      case 'CMIN':
      case 'BBMIX':
      case 'FDOR':
      case 'GPHR':
      case 'ABLYD':
      case 'DLOC':
        flats = 3;
        break;
      case 'ABMAJ':
      case 'FMIN':
      case 'EBMIX':
      case 'BBDOR':
      case 'CPHR':
      case 'DBLYD':
      case 'GLOC':
        flats = 4;
        break;
      case 'DBMAJ':
      case 'BBMIN':
      case 'ABMIX':
      case 'EBDOR':
      case 'FPHR':
      case 'GBLYD':
      case 'CLOC':
        flats = 5;
        break;
      case 'GBMAJ':
      case 'EBMIN':
      case 'DBMIX':
      case 'ABDOR':
      case 'BBPHR':
      case 'CBLYD':
      case 'FLOC':
        flats = 6;
        break;
      case 'CBMAJ':
      case 'ABMIN':
      case 'GBMIX':
      case 'DBDOR':
      case 'EBPHR':
      case 'FBLYD':
      case 'BBLOC':
        flats = 7;
        break;
      default:
        break;
    }
    if (sharps > 0) {
      const sharpTable = {
        1: 3, // fis
        2: 0, // cis
        3: 4, // gis
        4: 1, // dis
        5: 5, // ais
        6: 2, // eis
        7: 6 // his
      };
      for (let i = 1; i <= sharps; i++) {
        this.changedNotes[sharpTable[i]]++;
      }
    }
    if (flats > 0) {
      const flatTable = {
        1: 6, // b
        2: 2, // es
        3: 5, // as
        4: 1, // des
        5: 4, // ges
        6: 0, // ces
        7: 3 // fes
      };
      for (let i = 1; i <= flats; i++) {
        this.changedNotes[flatTable[i]]--;
      }
    }
  }
}
