import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppconfigurationService {
  baseUrl: string;

  constructor() {
    // git update-index --assume-unchanged src/app/appconfiguration.service.ts
    // -> git won't track this file, --no-assume-unchanged to revert

    // base-url for php-backend
    this.baseUrl = 'http://localhost/';
   }
}
