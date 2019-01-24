import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { Tune } from '../../models/tune';
import { Observable, Subject, pipe } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TuneService } from '../tune.service';

@Component({
  selector: 'app-tune',
  templateUrl: './tune.component.html',
  styleUrls: ['./tune.component.scss']
})
export class TuneComponent implements OnInit {
  private _tune: Tune;
  private abcInputSubject = new Subject<string>();
  private abcInputObservable: Observable<string>;
  currentAbcValue = '';

  @HostBinding('class') hostClasses = 'flex-grow-1 row mx-0';

  constructor(private tuneService: TuneService) { }

  ngOnInit() {
    this.abcInputObservable = this.abcInputSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );
    this.abcInputObservable.subscribe((abc: string) => this.renderAbc(abc));
  }

  get tune() {
    return this._tune;
  }

  @Input()
  set tune(tune: Tune) {
    this.renderAbc(null);
    if (tune) {
      this.currentAbcValue = tune.abc;
      this.abcInputSubject.next(tune.abc);
    }
    this._tune = tune;
  }

  onAbcInput(abc: string) {
    this.abcInputSubject.next(abc);
  }

  renderAbc(abc: string) {
    const renderElement = document.getElementById('abc-paper');
    if (!renderElement) { return; }
    const spinnerHtml = '<div class="text-center mt-5"><i class="fas fa-spinner fa-spin" style="font-size: 15vh;"></i></div>';
    if (abc) {
      renderElement.innerHTML = spinnerHtml;
      ABCJS.renderAbc(renderElement, abc,
      {
        responsive: 'resize',
        warnings_id: 'abc-warnings'
      });
    } else {
      renderElement.innerHTML = spinnerHtml;
    }
  }

  saveAbc() {
    this._tune.abc = this.currentAbcValue;
    // TODO: Save to Tunebook
  }

  resetAbc() {
    this.currentAbcValue = this._tune.abc;
    this.renderAbc(this.currentAbcValue);
  }
}
