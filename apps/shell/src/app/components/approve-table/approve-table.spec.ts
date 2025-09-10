import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproveTable } from './approve-table';

describe('ApproveTable', () => {
  let component: ApproveTable;
  let fixture: ComponentFixture<ApproveTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
