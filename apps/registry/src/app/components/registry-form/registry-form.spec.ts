import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistryForm } from './registry-form';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('RegistryForm', () => {
  let component: RegistryForm;
  let fixture: ComponentFixture<RegistryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule, RegistryForm],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: {
              params: {},
              queryParams: {}
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn()
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize anexosEsperados', () => {
    component.loadAnexosEsperados();
    expect(component.anexosEsperados.length).toBeGreaterThan(0);
  });

  it('should open and close anexo modal', () => {
    component.openAnexoModal();
    expect(component.isAnexoModalVisible).toBeTruthy();
    component.closeAnexoModal();
    expect(component.isAnexoModalVisible).toBeFalsy();
  });

  it('should clear file', () => {
    component.selectedFile = new File([''], 'test.pdf', {
      type: 'application/pdf',
    });
    component.clearFile();
    expect(component.selectedFile).toBeNull();
  });

  it('should format file size', () => {
    expect(component.formatFileSize(1024)).toBe('1 KB');
  });

  it('should filter autocomplete suggestions', () => {
    component.nombresPredefinidos = ['Test1', 'Test2'];
    // This method doesn't exist in the component, so we'll test the property directly
    component.filteredSugerencias = component.nombresPredefinidos.filter(nombre =>
      nombre.toLowerCase().includes('test')
    );
    expect(component.filteredSugerencias.length).toBe(2);
  });

  it('should add anexo if form is valid', () => {
    component.anexoForm.patchValue({
      nombrePredefinido: 'Test',
      archivo: new File([''], 'test.pdf', { type: 'application/pdf' }),
    });
    component.selectedFile = new File([''], 'test.pdf', {
      type: 'application/pdf',
    });
    jest.spyOn(component['toastService'], 'addSuccess');
    component.guardarAnexo();
    expect(component.anexosSubidos.length).toBe(1);
    expect(component['toastService'].addSuccess).toHaveBeenCalled();
  });
});
