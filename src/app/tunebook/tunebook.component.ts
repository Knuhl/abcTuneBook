import { Component, OnInit } from '@angular/core';
import { Tune } from '../../models/tune';
import { TuneService } from '../tune.service';
import { Tunebook } from 'src/models/tunebook';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-tunebook',
  templateUrl: './tunebook.component.html',
  styleUrls: ['./tunebook.component.scss']
})
export class TunebookComponent implements OnInit {
  tunebookTitles: KeyValue<number, string>[];
  selectedTunebook: Tunebook;
  selectedTune: Tune;

  constructor(private tuneService: TuneService) { }

  ngOnInit() {
    this.getTunebookTitles();
  }

  getTunebookTitles() {
    this.tuneService.getTunebookTitles().subscribe(titles => {
      this.tunebookTitles = titles;

      if (!this.selectedTunebook && titles.length > 0) {
        this.onSelectTunebook(titles[0].key);
      }
    });
  }

  onSelectTunebook(id: number): void {
    if (id && id >= 0 && (!this.selectedTunebook || id !== this.selectedTunebook.id)) {
      this.tuneService.getTunebook(id).subscribe(tunebook => this.selectedTunebook = tunebook);
    }
  }

  onSelect(tune: Tune): void {
    this.selectedTune = tune;
  }

  createTunebook(): void {
    console.log('creating tunebook');
  }
}
