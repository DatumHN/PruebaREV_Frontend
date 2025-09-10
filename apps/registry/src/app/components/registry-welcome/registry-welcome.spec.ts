import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RegistryWelcome } from './registry-welcome';

describe('RegistryWelcome', () => {
  let component: RegistryWelcome;
  let fixture: ComponentFixture<RegistryWelcome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegistryWelcome,
        RouterTestingModule, // <-- Importante para RouterLink
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistryWelcome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
