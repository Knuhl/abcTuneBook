import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { TunebookParserService } from '../services/tunebook-parser.service';
import { Tunebook } from '../models/tunebook';
import { Tune } from '../models/tune';
import { TunebookService } from '../services/tunebook.service';

@Component({
  selector: 'app-tunebook',
  templateUrl: './tunebook.component.html',
  styleUrls: ['./tunebook.component.scss']
})
export class TunebookComponent implements OnInit {
  private selectedTunebook: Tunebook;

  listCollapsed: boolean;
  tunebookTune: Tune;
  selectedTune: Tune;

  constructor(
    private messageService: MessageService,
    private parser: TunebookParserService,
    private tunebookService: TunebookService) {
    this.tunebookService.currentTunebook.subscribe(tb => this.selectedTunebook = tb);
    this.tunebookService.currentTune.subscribe(t => this.selectedTune = t);
  }

  ngOnInit() {
  }

  selectTune(tune: Tune): void {
    this.tunebookService.setTune(tune);
  }

  showTunebookTune() {
    this.tunebookService.setTuneToTunebookTune();
  }

  createTune() {
    if (!this.selectedTunebook) { return; }
    const newTune = this.parser.createTune(this.selectedTunebook);
    this.selectTune(newTune);
  }

  deleteTune(tune: Tune) {
    if (!tune || !this.selectedTunebook) { return; }
    const i = this.selectedTunebook.tunes.indexOf(tune);
    if (i < 0) { return; }
    this.selectedTunebook.tunes.splice(i, 1);
    this.selectTune(null);
    this.messageService.info('Tune deleted');
  }

  saveTunebook(): void {
    this.tunebookService.saveCurrentTunebook();
  }
}
