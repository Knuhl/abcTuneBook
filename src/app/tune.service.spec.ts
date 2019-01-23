import { TestBed } from '@angular/core/testing';

import { TuneService } from './tune.service';

describe('TuneService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TuneService = TestBed.get(TuneService);
    expect(service).toBeTruthy();
  });
});
