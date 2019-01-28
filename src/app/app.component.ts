import { Component } from '@angular/core';
import { Tunebook } from 'src/models/tunebook';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'abcTuneBook';
  selectedTunebook: Tunebook;
}
