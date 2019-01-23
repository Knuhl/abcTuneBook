import { Component, OnInit } from '@angular/core';
import { Tune } from '../../models/tune';
import { TuneService } from '../tune.service';
import { Tunebook } from 'src/models/tunebook';

@Component({
  selector: 'app-tunebook',
  templateUrl: './tunebook.component.html',
  styleUrls: ['./tunebook.component.scss']
})
export class TunebookComponent implements OnInit {
  tunebook: Tunebook;
  selectedTune: Tune;

  constructor(private tuneService: TuneService) { }

  ngOnInit() {
    this.getTunebook();
  }

  getTunebook(): void {
    this.tuneService.getTunebook().subscribe(tunebook => this.tunebook = tunebook);
  }

  onSelect(tune: Tune): void {
    this.selectedTune = tune;
  }

}
