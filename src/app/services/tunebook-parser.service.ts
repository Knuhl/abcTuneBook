import { Injectable } from '@angular/core';
import { Tune } from '../models/tune';
import { Tunebook } from '../models/tunebook';

@Injectable({
  providedIn: 'root'
})
export class TunebookParserService {

  constructor() { }

  parseTunes(abc: string): Tune[] {
    const lines = abc.replace(/'\r'/g, '').split('\n');
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
      currentTune += lines[i] + '\n';
    }
    if (currentTune.length > 0) {
      currentTune = currentTune.trim();
      tunes.push(new Tune(this.parseTuneTitle(currentTune), currentTune));
    }
    return tunes;
  }

  getAbcOfTunes(tunes: Tune[]): string {
    if (!tunes || tunes.length < 1) {
      return null;
    }
    let result = '';
    for (let i = 0; i < tunes.length; i++) {
      const tune = tunes[i];
      if (!tune || !tune.abc) {
        continue;
      }
      result += tune.abc.trim() + '\n\n';
    }
    return result;
  }

  parseTuneTitle(abc: string): string {
    let title = '(no name)';
    for (let i = 0; i < (abc.length - 3); i++) {
      if (abc.charAt(i) === 'T' && abc.charAt(i + 1) === ':') {
        title = '';
        i += 2;
        while (i < abc.length && abc.charAt(i) !== '\n') { title += abc.charAt(i++); }
        break;
      }
    }
    return title;
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
        'y'].join('\n');
    }
    const newTune = new Tune(title, abc);
    tunebook.tunes.push(newTune);
    return newTune;
  }
}
