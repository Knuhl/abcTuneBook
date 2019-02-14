import { Injectable } from '@angular/core';
import { Note, NotesHelper } from './note';
import { TuneNote } from './tune-note';
import { AbcKey } from './abc-key';

@Injectable({
  providedIn: 'root'
})
export class AbcTransposeService {

  constructor() { }

  transpose(abc: string, up: boolean, preferSharp?: boolean): string {
    const lines = abc.split('\n');
    const newLines: string[] = [];
    const ctx = new TransposeContext();
    ctx.up = up;
    ctx.preferSharp = preferSharp;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('K:')) {
        const sourceKey = AbcKey.fromKeyLine(line.substr(2), ctx.currentTargetKey);
        const transposedKey = sourceKey.transposeKey(up, preferSharp);
        ctx.currentSourceKey = sourceKey;
        ctx.currentTargetKey = transposedKey;
        newLines.push('K:' + transposedKey.keyInAbc());
      } else if (line[1] === ':') {
        // only care for K: lines, ignore other header directives
        newLines.push(line);
      } else if (line === '%%beginchordpro') {
        ctx.chordProMode = true;
        newLines.push(line);
      } else if (line === '%%endchordpro') {
        ctx.chordProMode = false;
        newLines.push(line);
      } else {
        ctx.currentLineTransposed = '';
        let inlineKeyChangeIndex = line.indexOf('[K:');
        let partialLine = inlineKeyChangeIndex >= 0 ? line.substr(0, inlineKeyChangeIndex) : line;
        while (partialLine.length > 0) {
          ctx.currentLineTransposed += this.transposeLine(partialLine, ctx);
          if (inlineKeyChangeIndex >= 0) {
            // TODO: why does line.indexOf(']', inlineKeyChangeIndex) not work??
            const keyPartLength = line.substr(inlineKeyChangeIndex).indexOf(']') - 3;
            const keyPart = line.substr(inlineKeyChangeIndex + 3, keyPartLength);
            const sourceKey = AbcKey.fromKeyLine(keyPart, ctx.currentTargetKey);
            const transposedKey = sourceKey.transposeKey(up, preferSharp);
            ctx.currentLineTransposed += '[K:' + transposedKey.keyInAbc() + ']';
            ctx.currentSourceKey = sourceKey;
            ctx.currentTargetKey = transposedKey;
            partialLine = line.substr(inlineKeyChangeIndex + keyPartLength + 4);
            inlineKeyChangeIndex = partialLine.indexOf('[K:');
          } else {
            partialLine = '';
          }
        }
        newLines.push(ctx.currentLineTransposed);
        ctx.currentLineTransposed = '';
      }
    }
    const r = newLines.join('\n');
    return r;
  }

  private transposeLine(line: string, ctx: TransposeContext): string {
    let newLine = '';
    for (let i = 0; i < line.length; i++) {
      const r = this.transposeNext(line, i, ctx);
      newLine += r.result;
      i += (r.traversed - 1);
    }
    return newLine;
  }

  private transposeNext(line: string, offset: number, ctx: TransposeContext): NoteResult {
    if (!ctx.chordProMode && NotesHelper.isAbcNoteBeginning(line[offset])) {
      return this.transposeNote(line, offset, ctx);
    } else if (NotesHelper.isAbcChordBeginning(line[offset])) {
      return this.transposeChord(line, offset, ctx);
    } else {
      return new NoteResult(1, line[offset]);
    }
  }

  private transposeNote(line: string, offset: number, ctx: TransposeContext): NoteResult {
    let hasNote = false;
    let i = offset;
    for (; i < line.length; i++) {
      const c = line[i];
      if (NotesHelper.isAccidental(c)) {
        if (hasNote) { break; } // accidental belongs to next note
      } else if (NotesHelper.isNoteChar(c)) {
        if (hasNote) { break; } // next note
        hasNote = true;
      } else if (NotesHelper.isOctaveChar(c)) {
        continue;
      } else {
        break;
      }
    }

    const noteSubstring = line.substr(offset, i - offset);
    const abcNote = TuneNote.fromAbc(noteSubstring);

    const abcNoteInSourceKey = ctx.currentSourceKey.noteInKey(abcNote);
    const transposedNote = abcNoteInSourceKey.transpose(ctx.up);

    const transposedNoteInKey = ctx.currentTargetKey.abcNoteInKey(transposedNote);
    const r = transposedNoteInKey.toAbc();

    return new NoteResult(i - offset, r);
  }

  private transposeChord(line: string, offset: number, ctx: TransposeContext): NoteResult {
    let i = offset + 1;
    let chordString = '';
    for (; i < line.length; i++) {
      if (NotesHelper.isAbcChordBeginning(line[i])) {
        break;
      }
      chordString += line[i];
    }

    // matches a wrong character in group 1 and the note in group 2, if group 1 is filled then ignore (e.g. maj7 -> a is no note)
    const notesRegex = /([^\s\/CDEFGABH]?)([CDEFGABH]\s*[#b]?)/ig;
    let r = notesRegex.exec(chordString);
    const replacements = [];
    while (r) {
      if ((!r[1] || r[1].length < 1) && (r[2] && r[2].length > 0)) {
        const acc = r[2].length > 1 ? r[2][1].toUpperCase() : '';
        const chordAsKey = new AbcKey(NotesHelper.stringToNote(r[2][0]), acc === 'B' ? -1 : (acc === '#' ? 1 : 0));
        const chordAsKeyTransposed = chordAsKey.transposeKey(ctx.up, ctx.preferSharp);
        const transposed = chordAsKeyTransposed.keyInAbc();
        replacements.push({ i: r.index, l: r[2].length, t: transposed });
      }
      r = notesRegex.exec(chordString);
    }
    let newChordString = '';
    if (replacements.length < 1) {
      newChordString = chordString;
    } else {
      let j = 0;
      for (let repl = 0; repl < replacements.length; repl++) {
        const cur = replacements[repl];
        newChordString += chordString.substr(j, cur.i - j);
        newChordString += cur.t;
        j = cur.i + cur.l;
      }
      newChordString += chordString.substr(j);
    }

    return new NoteResult(i - offset + 1, '"' + newChordString + '"');
  }
}

class NoteResult {
  traversed: number;
  result: string;
  constructor(traversed: number, result: string) {
    this.traversed = traversed;
    this.result = result;
  }
}

class TransposeContext {
  currentSourceKey: AbcKey = new AbcKey(Note.C);
  currentTargetKey: AbcKey = new AbcKey(Note.C);
  chordProMode = false;
  currentLineTransposed = '';
  up = true;
  preferSharp = true;
}
