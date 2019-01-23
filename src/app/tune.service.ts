import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tune } from 'src/models/tune';
import { Tunebook } from 'src/models/tunebook';

@Injectable({
  providedIn: 'root'
})
export class TuneService {

  constructor(private http: HttpClient) { }

  getTunebook(): Observable<Tunebook> {
    return this.http.get('/assets/tuneBook.abc', { responseType: 'text' }).pipe(
      map((s: string) => this.createTunebook(s)),
    );
  }

  createTunebook(fileContent: string): Tunebook {
    const lines = fileContent.replace('\r\n', '\n').split('\n');
    const tunes = [];
    let currentTune = '';
    let id = 0;
    let tuneId = NaN;
    let title = '(no name)';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length < 1) {
        continue;
      }
      if (line.startsWith('%abcTuneBook.id=')) {
        id = parseInt(line.substring('%abcTuneBook.id='.length).trim(), 10);
        continue;
      } else if (line.startsWith('%abcTuneBook.title=')) {
        title = line.substring('%abcTuneBook.title='.length).trim();
        continue;
      } else if (line.toUpperCase().startsWith('X:')) {
        if (currentTune.length > 0) {
          tunes.push(new Tune(tuneId, currentTune.trim()));
        }
        currentTune = '';
        tuneId = parseInt(line.substring('X:'.length).trim(), 10);
      }
      currentTune += lines[i];
    }
    if (currentTune.length > 0) {
      tunes.push(new Tune(tuneId, currentTune));
    }
    return new Tunebook(id, title, tunes);
  }
}
