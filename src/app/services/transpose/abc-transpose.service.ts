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
    let keyLine = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('K:')) {
        keyLine = line;
        const k = AbcKey.fromKeyLine(line.substr(2), new AbcKey(Note.C));
        console.log(k.keyInAbc(), k);
        const newKey = k.transposeKey(up, preferSharp);
        console.log(newKey.keyInAbc(), newKey);
      } else if (keyLine.length > 0) {

      } else {
        newLines.push(line);
      }
    }
    const r = newLines.join('\n');
    return r;
  }
}
