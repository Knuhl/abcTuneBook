import { Injectable } from '@angular/core';
import { Tune } from 'src/models/tune';
import { Tunebook } from 'src/models/tunebook';

@Injectable({
  providedIn: 'root'
})
export class TunebookParserService {

  constructor() { }

  parseTunes(abc: string): Tune[] {
    const lines = abc.replace('\r\n', '\n').split('\n');
    const tunes = [];
    let currentTune = '';
    let tuneId = NaN;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length < 1) {
        continue;
      }
      if (line.toUpperCase().startsWith('X:')) {
        if (currentTune.length > 0) {
          currentTune = currentTune.trim();
          tunes.push(new Tune(tuneId, this.parseTuneTitle(currentTune), currentTune));
        }
        currentTune = '';
        tuneId = parseInt(line.substring('X:'.length).trim(), 10);
      } else if (currentTune.length === 0) {
        // ignore everything before the first 'X:'
        continue;
      }
      currentTune += lines[i] + '\r\n';
    }
    if (currentTune.length > 0) {
      currentTune = currentTune.trim();
      tunes.push(new Tune(tuneId, this.parseTuneTitle(currentTune), currentTune));
    }
    return tunes;
  }

  parseTuneTitle(abc: string): string {
    const header = ABCJS.parseOnly(abc, { header_only: true });
    return header.length > 0 && header[0].metaText.title ? header[0].metaText.title : '(no title)';
  }

  updateTitle(tune: Tune): void {
    if (tune) {
      const newTitle = this.parseTuneTitle(tune.abc);
      tune.title = newTitle;
    }
  }

  getTunebookAbc(tunebook: Tunebook): string {
    if (!tunebook || !tunebook.tunes || tunebook.tunes.length < 1) {
      return null;
    }
    let result = '';
    for (let i = 0; i < tunebook.tunes.length; i++) {
      const tune = tunebook.tunes[i];
      if (!tune || !tune.abc) {
        continue;
      }
      result += tune.abc.trim() + '\r\n\r\n';
    }
    return result;
  }
}
