import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Tunebook } from 'src/models/tunebook';
import { KeyValue } from '@angular/common';
import { AppconfigurationService } from './appconfiguration.service';
import { MessageService } from './message.service';
import { TunebookParserService } from './tunebook-parser.service';

@Injectable({
  providedIn: 'root'
})
export class TunebookService {

  constructor(private messageService: MessageService,
    private tuneParser: TunebookParserService,
    private http: HttpClient,
    private config: AppconfigurationService) { }

  getTunebookTitles(): Observable<KeyValue<number, string>[]> {
    const url = this.config.baseUrl + 'api/tunebook/read.php';
    this.messageService.trace('reading tunebook titles from ' +  url);
    return this.http.get(url).pipe(
      tap(r => this.messageService.trace('received HTTP Result for tunebook titles', r)),
      catchError(this.handleError('getTunebookTitles', [])),
      map((result: any) => {
        const r = [];
        if (result.records) {
          return result.records.map((v: any) => ({key: v.id, value: v.title}));
        } else {
          this.messageService.warn('received empty tunebook titles result');
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
    this.messageService.trace('reading single tunebook from ' +  url);
    return this.http.get(url).pipe(
      tap(r => this.messageService.trace('received HTTP Result for single tunebook', r)),
      catchError(this.handleError('getTunebook', [])),
      map((result: any) => {
        if (result.records && result.records.length > 0) {
          const tunebook = result.records[0];
          return new Tunebook(tunebook.id, tunebook.title, this.tuneParser.parseTunes(tunebook.abc));
        } else {
          this.messageService.warn('received empty (single) tunebook result');
        }
        return null;
      })
    );
  }

  createTunebook(title: string, abc: string): Observable<number> {
    const url = this.config.baseUrl + 'api/tunebook/create.php';
    const parameter = JSON.stringify({title: title, abc: abc});
    this.messageService.trace('sending create request', url, parameter);
    return this.http.post(url, parameter).pipe(
      tap(r => this.messageService.trace('received HTTP Result for tunebook creation', r)),
      catchError(this.handleError('createTunebook', [])),
      map((result: any) => {
        if (result && result.id && result.id >= 0) {
          return result.id;
        }
        return -1;
      })
    );
  }

  updateTunebook(tunebook: Tunebook): Observable<boolean> {
    const url = this.config.baseUrl + 'api/tunebook/update.php';
    const tunebookAbc = this.tuneParser.getTunebookAbc(tunebook);
    const parameter = JSON.stringify({id: tunebook.id, title: tunebook.title, abc: tunebookAbc});
    this.messageService.trace('sending update request', url, parameter);
    return this.http.post(url, parameter).pipe(
      tap(r => this.messageService.trace('received HTTP Result for tunebook update', r)),
      catchError(this.handleError('updateTunebook', [])),
      map((result: any) => {
        if (result) {
          return true;
        }
        return false;
      })
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.messageService.error(operation, error);
      return of(result as T);
    };
  }
}
