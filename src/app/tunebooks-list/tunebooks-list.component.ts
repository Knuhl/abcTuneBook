import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { TunebookApiService } from '../services/tunebook-api.service';
import { Tunebook } from '../models/tunebook';
import { TunebookService } from '../services/tunebook.service';

@Component({
  selector: 'app-tunebooks-list',
  templateUrl: './tunebooks-list.component.html',
  styleUrls: ['./tunebooks-list.component.scss']
})
export class TunebooksListComponent implements OnInit {

  tunebooks: Tunebook[];
  selectedTunebook: Tunebook;

  constructor(private messageService: MessageService,
    private tunebookApiService: TunebookApiService,
    private tunebookService: TunebookService) {
      this.tunebookService.currentTunebook.subscribe(tb => this.selectedTunebook = tb);
    }

  ngOnInit() {
    this.getTunebookTitles();
  }

  getTunebookTitles() {
    this.messageService.trace('Getting Tunebook Titles');
    this.tunebookApiService.getTunebookTitles().subscribe(titles => {
      this.messageService.info('Received ' + titles.length + ' Tunebook Titles', titles);
      this.tunebooks = titles;

      if (!this.selectedTunebook && titles.length > 0) {
        this.loadAndSelectTunebook(titles[0]);
      }
    });
  }

  loadAndSelectTunebook(book: Tunebook): void {
    this.messageService.trace('Tunebook selected', book);

    if (book && !book.onlyLocal && !book.abcLoaded) {
      this.messageService.trace('Getting Tunebook from API', book);
      this.tunebookApiService.getTunebook(book.id).subscribe(dbTunebook => {
        this.messageService.info('Tunebook "' + dbTunebook.title + '" loaded', book.id, dbTunebook);
        dbTunebook.abcLoaded = true;
        const i = this.tunebooks.findIndex(b => b === book);
        this.tunebooks[i] = dbTunebook;
        this.selectTunebook(dbTunebook);
      });
    } else {
      this.selectTunebook(book);
    }
  }

  selectTunebook(tunebook: Tunebook) {
    this.tunebookService.setTunebook(tunebook);
  }

  createTunebook(): void {
    this.messageService.trace('Creating new Tunebook locally');
    const tunebook = new Tunebook(NaN, '(empty)', '');
    tunebook.onlyLocal = true;
    this.tunebooks.push(tunebook);
    this.selectTunebook(tunebook);
  }

  deleteTunebook(tunebook: Tunebook) {
    this.messageService.trace('deleting tunebook', tunebook);
    if (!tunebook) { return; }
    if (!tunebook.onlyLocal) {
      this.tunebookApiService.deleteTunebook(tunebook.id)
        .subscribe(_ => {
          this.removeTunebookFromList(tunebook);
        });
    } else {
      this.removeTunebookFromList(tunebook);
    }
  }

  removeTunebookFromList(tunebook: Tunebook) {
    this.messageService.info('Tunebook "' + tunebook.title + '" deleted', tunebook);
    const i = this.tunebooks.indexOf(tunebook);
    if (i >= 0) {
      this.tunebooks.splice(i, 1);
    }
    if (this.selectedTunebook === tunebook) {
      this.loadAndSelectTunebook(this.tunebooks[0]);
    }
  }
}
