import { Injectable, isDevMode } from '@angular/core';
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
    ctx.debug = isDevMode();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('K:')) {
        const sourceKey = AbcKey.fromKeyLine(line.substr(2), ctx.currentTargetKey, ctx.debug);
        const transposedKey = sourceKey.transposeKey(up, preferSharp);
        ctx.currentSourceKey = sourceKey;
        ctx.currentTargetKey = transposedKey;
        newLines.push('K:' + transposedKey.keyInAbc());
      } else if (line[1] === ':') {
        // TODO: filter out N: directives
        newLines.push(line);
      } else if (line === '%%startchordpro') {
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
            const sourceKey = AbcKey.fromKeyLine(keyPart, ctx.currentTargetKey, ctx.debug);
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
    if (ctx.debug) {
      console.log(abc + '\ntransposed to\n' + r);
    }
    return r;
  }

  private transposeLine(line: string, ctx: TransposeContext): string {
    if (ctx.debug) {
      console.log('transposing ' + line);
    }
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
      if (ctx.debug) {
        console.log('ignoring char', line[offset]);
      }
      return new NoteResult(1, line[offset]);
    }

    // TODO: chords with ".."
    // TODO: chordProMode = only care for chords
    // TODO: K:Cb A --> K:C _A in Cb A is Ab, should became A not Ab!
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

    if (ctx.debug) {
      console.log('note ' +
        abcNote.toAbc() +
        ' in key ' +
        ctx.currentSourceKey.keyInAbc() +
        ' is ' +
        abcNoteInSourceKey.toAbc() +
        ', transposed ' +
        transposedNote.toAbc());
    }
    const transposedNoteInKey = ctx.currentTargetKey.abcNoteInKey(transposedNote);
    const r = transposedNoteInKey.toAbc();

    if (ctx.debug) {
      console.log('note ' + transposedNote.toAbc() + ' in key ' + ctx.currentTargetKey.keyInAbc() + ' is ' + r);
    }

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
    console.log(chordString);
    return new NoteResult(i - offset + 1, '"' + chordString + '"');
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
  debug = false;
}
