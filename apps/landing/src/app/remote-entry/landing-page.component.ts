import {
  Component,
  OnInit,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent implements OnInit {
  myForm: FormGroup;
  mostrarClave = false;
  mobileMenuOpen = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);

  constructor() {
    this.myForm = this.fb.group({
      email: ['', [Validators.required]],
      clave: ['', [Validators.required]],
    });
  }

  get email() {
    return this.myForm.get('email');
  }

  get clave() {
    return this.myForm.get('clave');
  }

  ngOnInit(): void {}

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleMostrarContrasena() {
    this.mostrarClave = !this.mostrarClave;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  showValidation() {
    this.email?.markAsTouched();
  }

  showValidationClave() {
    this.clave?.markAsTouched();
  }

  onInput() {
    if (this.email?.value) {
      this.email?.markAsTouched();
    }
  }

  onInputclave() {
    if (this.clave?.value) {
      this.clave?.markAsTouched();
    }
  }

  login() {
    this.router.navigate(['/inicio']);
  }
}
