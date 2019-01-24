import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Tune } from 'src/models/tune';
import { Tunebook } from 'src/models/tunebook';
import { KeyValue } from '@angular/common';
import { AppconfigurationService } from './appconfiguration.service';

@Injectable({
  providedIn: 'root'
})
export class TuneService {

  constructor(private http: HttpClient, private config: AppconfigurationService) { }

  getTunebookTitles(): Observable<KeyValue<number, string>[]> {
    const url = this.config.baseUrl + 'api/tunebook/read.php';
    return this.http.get(url).pipe(
      catchError(this.handleError('getTunebookTitles', [])),
      map((result: any) => {
        const r = [];
        if (result.records) {
          return result.records.map((v: any) => ({key: v.id, value: v.title}));
        }
        return r;
      })
    );
    // return this.http.get('/assets/tuneBook.abc', { responseType: 'text' }).pipe(
    //   map((s: string) => this.createTunebook(s)),
    // );
  }

  getTunebook(id: number): Observable<Tunebook> {
    const url = this.config.baseUrl + 'api/tunebook/read_one.php?id=' + id;
    return this.http.get(url).pipe(
      catchError(this.handleError('getTunebook', [])),
      map((result: any) => {
        if (result.records && result.records.length > 0) {
          const tunebook = result.records[0];
          return new Tunebook(tunebook.id, tunebook.title, this.parseTunes(tunebook.abc));
        }
        return null;
      })
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

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
          tunes.push(new Tune(tuneId, currentTune.trim()));
        }
        currentTune = '';
        tuneId = parseInt(line.substring('X:'.length).trim(), 10);
      } else if (currentTune.length === 0) {
        // ignore everything before the first 'X:'
        continue;
      }
      currentTune += lines[i];
    }
    if (currentTune.length > 0) {
      tunes.push(new Tune(tuneId, currentTune));
    }
    return tunes;
  }
}
