import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPdf } from './modal-pdf';

describe('ModalPdf', () => {
  let component: ModalPdf;
  let fixture: ComponentFixture<ModalPdf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPdf],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalPdf);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
