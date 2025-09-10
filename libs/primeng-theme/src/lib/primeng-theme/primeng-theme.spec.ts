import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimengTheme } from './primeng-theme';

describe('PrimengTheme', () => {
  let component: PrimengTheme;
  let fixture: ComponentFixture<PrimengTheme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimengTheme],
    }).compileComponents();

    fixture = TestBed.createComponent(PrimengTheme);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
