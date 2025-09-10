import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedMask } from './shared-mask';

describe('SharedMask', () => {
  let component: SharedMask;
  let fixture: ComponentFixture<SharedMask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedMask],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedMask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
