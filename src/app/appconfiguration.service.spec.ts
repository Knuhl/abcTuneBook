import { TestBed } from '@angular/core/testing';

import { AppconfigurationService } from './appconfiguration.service';

describe('AppconfigurationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppconfigurationService = TestBed.get(AppconfigurationService);
    expect(service).toBeTruthy();
  });
});
