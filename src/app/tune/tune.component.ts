import { Component, OnInit, HostBinding } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MessageService } from '../services/message.service';
import { TunebookParserService } from '../services/tunebook-parser.service';
import { Tune } from '../models/tune';
import { TunebookService } from '../services/tunebook.service';

@Component({
  selector: 'app-tune',
  templateUrl: './tune.component.html',
  styleUrls: ['./tune.component.scss']
})
export class TuneComponent implements OnInit {
  @HostBinding('class') hostClasses = 'flex-grow-1';

  edit = false;
  tune: Tune;
  showSpinner = true;
  paperIds: string[];

  private abcInput = new Subject<string>();

  private _currentAbcValue = '';
  get currentAbcValue() {
    return this._currentAbcValue;
  }
  set currentAbcValue(abc: string) {
    this._currentAbcValue = abc.replace(/\r/g, '').trim();
    this.abcInput.next(this._currentAbcValue);
  }


  constructor(private messageService: MessageService,
    private tunebookParser: TunebookParserService,
    private tunebookService: TunebookService) {
    this.abcInput.pipe(debounceTime(300)).subscribe((abc: string) => this.renderAbc(abc));
    this.tunebookService.currentTune.subscribe(t => {
      this._currentAbcValue = null;
      this.tune = t;
      if (t) {
        this.showSpinner = true;
        this.currentAbcValue = t.abc;
      }
    });
  }

  ngOnInit() { }

  renderAbc(abc: string) {
    this.messageService.trace('rendering abc with abcjs', abc);
    if (abc) {
      this.messageService.trace('showing spinner, calling abcjs');
      this.showSpinner = true;
      const numberOfTunes = ABCJS.numberOfTunes(abc);
      this.paperIds = [];
      for (let i = 1; i <= numberOfTunes; i++) {
        this.paperIds.push('abcPaper' + i);
      }
      setTimeout(() => {
        ABCJS.renderAbc(this.paperIds, abc,
          {
            responsive: 'resize',
            paddingtop: 0,
            paddingbottom: 80
          });
        this.showSpinner = false;
      }, 0);
    } else {
      this.messageService.trace('received empty abc-string, showing spinner');
      this.showSpinner = true;
    }
  }

  saveAbc() {
    this.tune.abc = this.currentAbcValue;
    this.tunebookService.saveCurrentTune();
    this.messageService.trace('saved tune', this.tune);
  }

  resetAbc() {
    this.currentAbcValue = this.tune.abc;
    this.tunebookParser.updateTitle(this.tune);
    this.renderAbc(this.currentAbcValue);
    this.messageService.trace('reset tune abc', this.tune);
  }
}
