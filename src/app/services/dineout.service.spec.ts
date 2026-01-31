import { TestBed } from '@angular/core/testing';

import { DineoutService } from './dineout.service';

describe('DineoutService', () => {
  let service: DineoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DineoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
