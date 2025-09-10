import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistryApprove } from './registry-approve';

describe('RegistryApprove', () => {
  let component: RegistryApprove;
  let fixture: ComponentFixture<RegistryApprove>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistryApprove],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistryApprove);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
