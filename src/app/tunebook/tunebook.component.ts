import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Tune } from '../../models/tune';
import { Tunebook } from 'src/models/tunebook';
import { KeyValue } from '@angular/common';
import { MessageService } from '../message.service';
import { TunebookService } from '../tunebook.service';

@Component({
  selector: 'app-tunebook',
  templateUrl: './tunebook.component.html',
  styleUrls: ['./tunebook.component.scss']
})
export class TunebookComponent implements OnInit, AfterViewInit {
  tunebookTitles: KeyValue<number, string>[];
  selectedTunebook: Tunebook;
  selectedTune: Tune;

  @ViewChild('sidebar') sidebar: ElementRef;

  constructor(private messageService: MessageService, private tunebookService: TunebookService) { }

  ngOnInit() {
    this.getTunebookTitles();
  }

  ngAfterViewInit(): void { }

  getTunebookTitles() {
    this.messageService.trace('Getting Tunebook Titles');
    this.tunebookService.getTunebookTitles().subscribe(titles => {
      this.messageService.trace('Received Tunebook Titles', titles);
      this.tunebookTitles = titles;

      if (!this.selectedTunebook && titles.length > 0) {
        this.onSelectTunebook(titles[0].key);
      }
    });
  }

  onSelectTunebook(id: number): void {
    this.messageService.trace('Tunebook selected, id: ' + id);
    if (id && id >= 0 && (!this.selectedTunebook || id !== this.selectedTunebook.id)) {
      this.messageService.trace('Getting Tunebook with id ' + id);
      this.tunebookService.getTunebook(id).subscribe(tunebook => {
        this.messageService.trace('Received Tunebook to id: ' + id, tunebook);
        this.selectedTunebook = tunebook;
      });
    } else {
      this.messageService.trace('Same Tunebook as before: ' + id);
    }
  }

  onSelect(tune: Tune): void {
    this.messageService.trace('Tune selected', tune);
    this.selectedTune = tune;
  }

  createTunebook(): void {
    this.messageService.trace('Creating new Tunebook');
  }
}
