import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Tunebook } from 'src/models/tunebook';
import { MessageService } from '../message.service';
import { TunebookService } from '../tunebook.service';

@Component({
  selector: 'app-tunebooks-list',
  templateUrl: './tunebooks-list.component.html',
  styleUrls: ['./tunebooks-list.component.scss']
})
export class TunebooksListComponent implements OnInit {
  @Output() tunebookSelected = new EventEmitter<Tunebook>();

  tunebooks: Tunebook[];
  selectedTunebook: Tunebook;

  constructor(private messageService: MessageService, private tunebookService: TunebookService) { }

  ngOnInit() {
    this.getTunebookTitles();
  }

  getTunebookTitles() {
    this.messageService.trace('Getting Tunebook Titles');
    this.tunebookService.getTunebookTitles().subscribe(titles => {
      this.messageService.trace('Received Tunebook Titles', titles);
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
      this.tunebookService.getTunebook(book.id).subscribe(dbTunebook => {
        this.messageService.trace('Received Tunebook to id: ' + book.id, dbTunebook);
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
    this.selectedTunebook = tunebook;
    this.tunebookSelected.emit(tunebook);
  }

  createTunebook(): void {
    // TODO: create locally, on save -> insert
    this.messageService.trace('Creating new Tunebook locally');
    const tunebook = new Tunebook(NaN, '(empty)', []);
    tunebook.onlyLocal = true;
    this.tunebooks.push(tunebook);
    this.selectTunebook(tunebook);
    // this.tunebookService.createTunebook('(empty)', 'X:1\r\nT:Title\r\nK:E\r\ny\r\n\r\n')
    //   .subscribe(id => {
    //     if (id >= 0) {
    //       this.getTunebookTitles();
    //       const f = this.tunebooks.find(book => book.id === id);
    //       this.loadAndSelectTunebook(f);
    //     }
    //   });
  }

  deleteTunebook(tunebook: Tunebook) {
    this.messageService.trace('deleting tunebook', tunebook);
    if (!tunebook) { return; }
    if (!tunebook.onlyLocal) {
      this.tunebookService.deleteTunebook(tunebook.id)
        .subscribe(_ => {
          this.messageService.trace('tunebook deleted', tunebook);
          this.removeTunebookFromList(tunebook);
        });
    } else {
      this.removeTunebookFromList(tunebook);
    }
  }

  removeTunebookFromList(tunebook: Tunebook) {
    const i = this.tunebooks.indexOf(tunebook);
    if (i >= 0) {
      this.tunebooks.splice(i, 1);
    }
    if (this.selectedTunebook === tunebook) {
      this.loadAndSelectTunebook(this.tunebooks[0]);
    }
  }
}
