import { TestBed } from '@angular/core/testing';

import { Logo } from './logo';

describe('Logo', () => {
  let service: Logo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Logo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
