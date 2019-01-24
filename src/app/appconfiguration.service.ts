import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppconfigurationService {
  baseUrl: string;

  constructor() {
    // TODO: put config out of repo but configurable
    this.baseUrl = 'http://localhost/';
   }
}
