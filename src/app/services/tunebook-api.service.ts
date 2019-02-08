import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AppconfigurationService } from './appconfiguration.service';
import { MessageService } from './message.service';
import { Tunebook } from '../models/tunebook';

@Injectable({
  providedIn: 'root'
})
export class TunebookApiService {

  constructor(private messageService: MessageService,
    private http: HttpClient,
    private config: AppconfigurationService) { }

  getTunebookTitles(): Observable<Tunebook[]> {
    const url = this.config.baseUrl + 'api/tunebook/read.php';
    this.messageService.trace('reading tunebook titles from ' + url);
    return this.http.get(url).pipe(
      tap(r => this.messageService.trace('received HTTP Result for tunebook titles', r)),
      catchError(this.handleError('getTunebookTitles')),
      map((result: any) => {
        if (result.records) {
          return result.records.map((v: any) => new Tunebook(v.id, v.title, ''));
        } else {
          this.messageService.warn('received empty tunebook titles result');
        }
        return [];
      })
    );
  }

  getTunebook(id: number): Observable<Tunebook> {
    const url = this.config.baseUrl + 'api/tunebook/read_one.php?id=' + id;
    this.messageService.trace('reading single tunebook from ' + url);
    return this.http.get(url).pipe(
      tap(r => this.messageService.trace('received HTTP Result for single tunebook', r)),
      catchError(this.handleError('getTunebook')),
      map((result: any) => {
        if (result.records && result.records.length > 0) {
          const tunebook = result.records[0];
          return new Tunebook(tunebook.id, tunebook.title, tunebook.abc);
        } else {
          this.messageService.warn('received empty (single) tunebook result');
        }
        return null;
      })
    );
  }

  createTunebook(tunebook: Tunebook): Observable<number> {
    const url = this.config.baseUrl + 'api/tunebook/create.php';
    const parameter = JSON.stringify({ title: tunebook.title, abc: tunebook.abc });
    this.messageService.trace('sending create request', url, parameter);
    return this.http.post(url, parameter).pipe(
      tap(r => this.messageService.trace('received HTTP Result for tunebook creation', r)),
      catchError(this.handleError('createTunebook')),
      map((result: any) => {
        if (result && result.id && result.id >= 0) {
          tunebook.onlyLocal = false;
          tunebook.abcLoaded = true;
          tunebook.id = result.id;
          return result.id;
        }
        throw new Error('received invalid id from tunebook-creation');
      })
    );
  }

  updateTunebook(tunebook: Tunebook): Observable<any> {
    const url = this.config.baseUrl + 'api/tunebook/update.php';
    const parameter = JSON.stringify({ id: tunebook.id, title: tunebook.title, abc: tunebook.abc });
    this.messageService.trace('sending update request', url, parameter);
    return this.http.post(url, parameter).pipe(
      tap(r => this.messageService.trace('received HTTP Result for tunebook update', r)),
      catchError(this.handleError('updateTunebook')),
      tap(_ => tunebook.abcLoaded = true)
    );
  }

  deleteTunebook(id: number): Observable<any> {
    const url = this.config.baseUrl + 'api/tunebook/delete.php';
    const parameter = JSON.stringify({ id: id });
    this.messageService.trace('sending delete request', url, parameter);
    return this.http.post(url, parameter).pipe(
      tap(r => this.messageService.trace('received HTTP Result for tunebook deletion', r)),
      catchError(this.handleError('deleteTunebook'))
    );
  }

  private handleError<T>(operation = 'operation ??') {
    return (error: any): Observable<T> => {
      const msg = (error.statusText ? ('"' + error.statusText + '"') : 'Unknown Error') + ' at operation "' + operation + '"';
      if (error.message) {
        this.messageService.error(msg + ': ' + error.message, error);
      } else {
        this.messageService.error(msg, error);
      }
      return of();
    };
  }
}
