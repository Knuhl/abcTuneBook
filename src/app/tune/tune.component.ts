import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { Tune } from '../../models/tune';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MessageService } from '../message.service';
import { TunebookService } from '../tunebook.service';
import { TunebookParserService } from '../tunebook-parser.service';

@Component({
  selector: 'app-tune',
  templateUrl: './tune.component.html',
  styleUrls: ['./tune.component.scss']
})
export class TuneComponent implements OnInit {
  @HostBinding('class') hostClasses = 'flex-grow-1';

  private abcInputSubject = new Subject<string>();
  private abcInputObservable: Observable<string>;

  private _currentAbcValue = '';
  get currentAbcValue() {
    return this._currentAbcValue;
  }
  set currentAbcValue(abc: string) {
    this._currentAbcValue = abc;
    this.abcInputSubject.next(abc);
  }

  private _tune: Tune;
  get tune() {
    return this._tune;
  }
  @Input()
  set tune(tune: Tune) {
    this.renderAbc(null);
    if (tune) {
      this.currentAbcValue = tune.abc;
    }
    this._tune = tune;
  }

  constructor(private messageService: MessageService, private tunebookService: TunebookService,
    private tunebookParser: TunebookParserService) { }

  ngOnInit() {
    this.abcInputObservable = this.abcInputSubject.pipe(
      debounceTime(300)
    );
    this.abcInputObservable.subscribe((abc: string) => this.renderAbc(abc));
  }

  renderAbc(abc: string) {
    this.messageService.trace('rendering abc with abcjs', abc);
    const renderElement = document.getElementById('abc-paper');
    if (!renderElement) {
      if (abc) {
        this.messageService.warn('DOM is not built yet, can\'t render abc, retrying after 0ms (begin invoke)', 'abc-paper');
        setTimeout(() => this.renderAbc(abc), 0);
      }
      return;
    }
    const spinnerHtml = '<div class="text-center mt-5"><i class="fas fa-spinner fa-spin" style="font-size: 15vh;"></i></div>';
    if (abc) {
      renderElement.innerHTML = spinnerHtml;
      this.messageService.trace('showing spinner, calling abcjs');
      ABCJS.renderAbc(renderElement, abc,
      {
        responsive: 'resize',
        warnings_id: 'abc-warnings',
        paddingtop: 0,
      });
    } else {
      this.messageService.trace('received empty abc-string, showing spinner');
      renderElement.innerHTML = spinnerHtml;
    }
  }

  saveAbc() {
    this._tune.abc = this.currentAbcValue;
    this.tunebookParser.updateTitle(this._tune);
    this.messageService.trace('saved tune', this._tune);
    // TODO: Save Tunebook
  }

  resetAbc() {
    this.currentAbcValue = this._tune.abc;
    this.tunebookParser.updateTitle(this._tune);
    this.renderAbc(this.currentAbcValue);
    this.messageService.trace('reset tune abc', this._tune);
  }
}
