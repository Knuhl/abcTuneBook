import { TestBed } from '@angular/core/testing';

import { AbcTransposeService } from './abc-transpose.service';

describe('AbcTransposeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AbcTransposeService = TestBed.get(AbcTransposeService);
    expect(service).toBeTruthy();
  });
});
