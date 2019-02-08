import { TestBed } from '@angular/core/testing';

import { TunebookService } from './tunebook.service';

describe('TunebookService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TunebookService = TestBed.get(TunebookService);
    expect(service).toBeTruthy();
  });
});
