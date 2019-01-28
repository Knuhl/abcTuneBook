import { Component, OnInit, Input } from '@angular/core';
import { Tune } from '../../models/tune';
import { Tunebook } from 'src/models/tunebook';
import { MessageService } from '../message.service';
import { TunebookService } from '../tunebook.service';
import { TunebookParserService } from '../tunebook-parser.service';

@Component({
  selector: 'app-tunebook',
  templateUrl: './tunebook.component.html',
  styleUrls: ['./tunebook.component.scss']
})
export class TunebookComponent implements OnInit {
  private _selectedTunebook: Tunebook;
  @Input('selectedTunebook') set selectedTunebook(value: Tunebook) {
    this._selectedTunebook = value;
    this.messageService.trace('selected tunebook', value);
  }
  get selectedTunebook(): Tunebook {
    return this._selectedTunebook;
  }

  listCollapsed: boolean;
  tunebookTune: Tune;
  selectedTune: Tune;

  constructor(
    private messageService: MessageService,
    private tunebookService: TunebookService,
    private parser: TunebookParserService) { }

  ngOnInit() {
  }

  selectTune(tune: Tune): void {
    this.messageService.trace('Tune selected', tune);
    this.selectedTune = tune;
  }

  showTunebookTune() {
    const abc = this.parser.getTunebookAbc(this.selectedTunebook);
    this.tunebookTune = new Tune(this.selectedTunebook.title, abc);
    this.selectTune(this.tunebookTune);
  }

  createTune() {
    if (!this._selectedTunebook) { return; }
    const newTune = this.parser.createTune(this._selectedTunebook);
    this.selectTune(newTune);
  }

  deleteTune(tune: Tune) {
    if (!tune || !this.selectedTunebook) { return; }
    const i = this.selectedTunebook.tunes.indexOf(tune);
    if (i < 0) { return; }
    this.selectedTunebook.tunes.splice(i, 1);
    this.selectTune(null);
  }

  saveTunebook(tunebook: Tunebook): void {
    if (tunebook) {
      this.messageService.trace('Saving Tunebook', tunebook);
      if (tunebook.onlyLocal) {
        // insert
        this.tunebookService.createTunebook(tunebook)
          .subscribe((result: number) => this.messageService.trace('Tunebook inserted to id ' + result));
      } else {
        // update
        this.tunebookService.updateTunebook(tunebook)
          .subscribe((_ => this.messageService.trace('tunebook updated')));
      }
    }
  }
}
