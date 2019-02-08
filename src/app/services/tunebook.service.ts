import { Injectable } from '@angular/core';
import { Tunebook } from '../models/tunebook';
import { Tune } from '../models/tune';
import { TunebookParserService } from './tunebook-parser.service';
import { TunebookApiService } from './tunebook-api.service';
import { MessageService } from './message.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TunebookService {

  private _currentTunebook: Tunebook;
  private _tunebookSubject: BehaviorSubject<Tunebook> = new BehaviorSubject<Tunebook>(null);
  get currentTunebook(): Observable<Tunebook> {
    return this._tunebookSubject.asObservable();
  }

  private _currentTune: Tune;
  private _tuneSubject: BehaviorSubject<Tune> = new BehaviorSubject<Tune>(null);
  get currentTune(): Observable<Tune> {
    return this._tuneSubject.asObservable();
  }

  constructor(private parser: TunebookParserService,
    private tunebookApiService: TunebookApiService,
    private messageService: MessageService) {
    this._tunebookSubject
      .pipe(tap(tb => this.messageService.trace('tunebook changed', tb)))
      .subscribe(tb => this._currentTunebook = tb);
    this._tuneSubject
      .pipe(tap(t => this.messageService.trace('tune changed', t)))
      .subscribe(t => this._currentTune = t);
  }

  setTunebook(value: Tunebook) {
    if (value) {
      value.tunes = this.parser.parseTunes(value.abc);
    }
    this._tunebookSubject.next(value);
  }

  setTune(value: Tune) {
    this._tuneSubject.next(value);
  }

  setTuneToTunebookTune() {
    if (!this._currentTunebook) { return; }
    const abc = this.parser.getAbcOfTunes(this._currentTunebook.tunes);
    const tune = new Tune(this._currentTunebook.title, abc);
    tune.isTunebookTune = true;
    this.setTune(tune);
  }

  saveCurrentTune(): void {
    if (!this._currentTune || !this._currentTunebook) { return; }

    if (this._currentTune.isTunebookTune) {
      this._currentTunebook.abc = this._currentTune.abc;

      // generate tunes out of new abc
      this._currentTunebook.tunes = this.parser.parseTunes(this._currentTunebook.abc);

      // force reload
      this._tunebookSubject.next(this._currentTunebook);

      // reset to tunebook tune
      this.setTuneToTunebookTune();
    } else {
      // set title in tune
      this.parser.updateTitle(this._currentTune);

      const title = this._currentTune.title;
      const abc = this._currentTune.abc;

      // generate new abc for tunebook
      this._currentTunebook.abc = this.parser.getAbcOfTunes(this._currentTunebook.tunes);

      this.resetCurrentTunebookAndReselectTune(title, abc);
    }
  }

  saveCurrentTunebook(): void {
    this.saveCurrentTune();
    if (!this._currentTunebook) { return; }
    this._currentTunebook.abc = this.parser.getAbcOfTunes(this._currentTunebook.tunes);
    if (this._currentTunebook.onlyLocal) {
      // insert
      this.tunebookApiService.createTunebook(this._currentTunebook)
        .subscribe((result: number) => {
          this.messageService.trace('Tunebook inserted to id ' + result);
          this.messageService.info('Tunebook created');
        });
    } else {
      // update
      this.tunebookApiService.updateTunebook(this._currentTunebook)
        .subscribe((_ => this.messageService.info('Tunebook updated')));
    }
  }

  resetCurrentTunebook(): void {
    if (!this._currentTunebook) { return; }
    const title = this._currentTune.title;
    const abc = this._currentTune.abc;
    this.resetCurrentTunebookAndReselectTune(title, abc);
  }

  private resetCurrentTunebookAndReselectTune(title: string, abc: string) {
    // regenerate tunes array
    this._currentTunebook.tunes = this.parser.parseTunes(this._currentTunebook.abc);

    // find the saved tune and reset currentTune
    let tuneToSelect = null;
    if (title && abc) {
      for (let i = 0; i < this._currentTunebook.tunes.length; i++) {
        const tune = this._currentTunebook.tunes[i];
        if (tune.title === title && abc.startsWith(tune.abc)) {
          tuneToSelect = tune;
          break;
        }
      }
    }

    this._tunebookSubject.next(this._currentTunebook);
    this.setTune(tuneToSelect);
  }
}
