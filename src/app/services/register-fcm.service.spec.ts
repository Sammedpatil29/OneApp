import { TestBed } from '@angular/core/testing';

import { RegisterFcmService } from './register-fcm.service';

describe('RegisterFcmService', () => {
  let service: RegisterFcmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterFcmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
