import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppconfigurationService {
  baseUrl: string;

  constructor() {
    // base-url for php-backend
    this.baseUrl = 'http://localhost/';
   }
}
