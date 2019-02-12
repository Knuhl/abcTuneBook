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
            const sourceKey = AbcKey.fromKeyLine(keyPart, ctx.currentTargetKey);
            const transposedKey = sourceKey.transposeKey(up, preferSharp);
            ctx.currentLineTransposed += '[K:' + transposedKey.keyInAbc() + ']';
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
    console.log(abc + '\ntransposed to\n' + r);
    return r;
  }

  private transposeLine(line: string, ctx: TransposeContext): string {
    console.log('transposing ' + line);
    let newLine = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const r = this.transposeNote(line, i, ctx);
      newLine += r.result;
      i += (r.traversed - 1);
    }
    return newLine;
  }

  private transposeNote(line: string, offset: number, ctx: TransposeContext): NoteResult {
    if (!NotesHelper.isAbcNoteBeginning(line[offset])) {
      console.log('no note char', line[offset]);
      return new NoteResult(1, line[offset]);
    }

    // TODO: chords with ".."
    // TODO: chordProMode = only care for chords
    // TODO: K:Cb A --> K:C _A in Cb A is Ab, should became A not Ab!

    const noteInAbcKey = new TuneNote(Note.C, 0, 0);
    let hasNote = false;
    let i = offset;
    for (; i < line.length; i++) {
      const c = line[i];
      if (NotesHelper.isAccidental(c)) {
        if (hasNote) { break; } // accidental belongs to next note
        noteInAbcKey.accidentals += NotesHelper.stringToAccidental(c);
      } else if (NotesHelper.isNoteChar(c)) {
        if (hasNote) { break; } // next note
        noteInAbcKey.note = NotesHelper.stringToNote(c);
        if (c === c.toLowerCase()) {
          noteInAbcKey.octave++;
        }
        hasNote = true;
      } else if (NotesHelper.isOctaveChar(c)) {
        noteInAbcKey.octave += NotesHelper.stringToOctave(c);
      } else {
        break;
      }
    }

    const transposedNote = noteInAbcKey.transpose(ctx.up);
    const r = ctx.currentTargetKey.abcRepresentationOfNote(transposedNote);

    return new NoteResult(i - offset, r);
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
  currentTargetKey: AbcKey = new AbcKey(Note.C);
  chordProMode = false;
  currentLineTransposed = '';
  up = true;
  preferSharp = true;
}
