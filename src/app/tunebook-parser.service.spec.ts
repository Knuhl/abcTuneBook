import { TestBed } from '@angular/core/testing';

import { TunebookParserService } from './tunebook-parser.service';

describe('TunebookParserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TunebookParserService = TestBed.get(TunebookParserService);
    expect(service).toBeTruthy();
  });
});
