import { TestBed } from '@angular/core/testing';

import { NutsService } from './nuts.service';

describe('NutsService', () => {
  let service: NutsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NutsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
