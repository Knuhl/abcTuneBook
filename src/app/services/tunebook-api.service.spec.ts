import { TestBed } from '@angular/core/testing';

import { TunebookApiService } from './tunebook-api.service';

describe('TunebookService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TunebookApiService = TestBed.get(TunebookApiService);
    expect(service).toBeTruthy();
  });
});
