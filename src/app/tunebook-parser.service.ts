import { Injectable } from '@angular/core';
import { Tune } from 'src/models/tune';
import { Tunebook } from 'src/models/tunebook';
import { empty } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TunebookParserService {

  constructor() { }

  parseTunes(abc: string): Tune[] {
    const lines = abc.replace('\r\n', '\n').split('\n');
    const tunes = [];
    let currentTune = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length < 1) {
        continue;
      }
      if (line.toUpperCase().startsWith('X:')) {
        if (currentTune.length > 0) {
          currentTune = currentTune.trim();
          tunes.push(new Tune(this.parseTuneTitle(currentTune), currentTune));
        }
        currentTune = '';
      } else if (currentTune.length === 0) {
        // ignore everything before the first 'X:'
        continue;
      }
      currentTune += lines[i] + '\r\n';
    }
    if (currentTune.length > 0) {
      currentTune = currentTune.trim();
      tunes.push(new Tune(this.parseTuneTitle(currentTune), currentTune));
    }
    return tunes;
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

  createTune(tunebook: Tunebook, title?: string, abc?: string) {
    if (!tunebook) { return; }
    if (!title || title.length < 1) { title = '(no name)'; }
    if (!abc || abc.length < 1) {
      abc = [
        'X:',
        'T:(no name)',
        'L:1/4',
        'Q:120',
        'K:C',
        'y'].join('\r\n');
    }
    const newTune = new Tune(title, abc);
    tunebook.tunes.push(newTune);
    return newTune;
  }
}
