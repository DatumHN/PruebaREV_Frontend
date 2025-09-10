import {
  LucideAngularModule,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-angular';
import {
  Component,
  inject,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthStateService, AuthRequest } from '@revfa/auth-shared';
import { ContactCardComponent } from '../components/contact-card/contact-card.component';
import { FeatureCardComponent } from '../components/feature-card/feature-card.component';
import {
  HeroCarouselComponent,
  type CarouselSlide,
} from '../components/hero-carousel/hero-carousel.component';
import type { ContactCardData } from '../components/contact-card/contact-card.component';
import type { FeatureCardData } from '../components/feature-card/feature-card.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ContactCardComponent,
    FeatureCardComponent,
    HeroCarouselComponent,
    LucideAngularModule,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent {
  myForm: FormGroup;
  newsletterForm: FormGroup;
  mostrarClave = false;
  mobileMenuOpen = false;
  newsletterSubmitSuccess = false;
  newsletterSubmitError = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authState = inject(AuthStateService);

  // Authentication signals
  isLoading = this.authState.isLoading;
  authError = this.authState.error;
  isAuthenticated = this.authState.isAuthenticated;

  contactCards: ContactCardData[] = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Dirección',
      content: 'Alameda Manuel Enrique Araujo 235, San Salvador',
      link: 'https://maps.app.goo.gl/E4ixERp3uVzbG8FZ9',
      type: 'address',
    },
    {
      icon: 'fas fa-envelope',
      title: 'Correo electrónico',
      content: 'info@rnpn.gob.sv',
      type: 'email',
    },
    {
      icon: 'fas fa-phone',
      title: 'Teléfono',
      content: '+(503) 2521 9300',
      type: 'phone',
    },
    {
      icon: 'fab fa-whatsapp',
      title: 'WhatsApp',
      content: '+(503) 7800 000',
      link: 'https://wa.me/5037800000',
      type: 'whatsapp',
    },
  ];

  carouselSlides: CarouselSlide[] = [
    {
      image: '/assets/carrousel/3.png',
      title: 'Edificio emblemático RNPN',
      subtitle:
        'Enmarca el compromiso con la protección de datos y la ciudadanía salvadoreña.',
      alt: 'REVFA Sistema - Edificio RNPN',
    },
    {
      image: '/assets/carrousel/11.png',
      title: 'Facilidades Modernas RNPN',
      subtitle:
        'Tecnología de vanguardia al servicio de los ciudadanos salvadoreños.',
      alt: 'RNPN Modern Facilities',
    },
    {
      image: '/assets/carrousel/2.png',
      title: 'Atención Ciudadana RNPN',
      subtitle:
        'Espacios diseñados para brindar un servicio eficiente y cálido.',
      alt: 'RNPN Citizen Service Area',
    },
  ];

  featureCards: FeatureCardData[] = [
    {
      title: 'DUI',
      description: `El Documento Único de identidad, es el documento oficial,
        suficiente y necesario para identificar fehacientemente a toda persona
        natural, salvadoreña, en todo acto público o privado, tanto dentro del
        país, como en el extranjero`,
      image: '/assets/dui/2.jpeg',
      layout: 'left',
    },
    {
      title: 'Kioscos automáticos',
      description: `El Registro Nacional de las Personas Naturales (RNPN) ha
        iniciado con la instalación de Kioscos automáticos que permitirá la
        emisión automática del Documento Único de Identidad (DUI), gestionando
        la captura de datos biométricos y demográficos.`,
      image: '/assets/dui/3.jpeg',
      layout: 'right',
      backgroundColor: 'primary',
    },
    {
      title: 'Partida de Nacimiento',
      description: `Se han entregado 30,000 partidas a menores de edad quienes
        gozan de la automatización de solicitud del proceso.`,
      image: '/assets/dui/5.jpg',
      layout: 'left',
      backgroundColor: 'primary',
    },
  ];

  constructor() {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.myForm.get('email');
  }

  get clave() {
    return this.myForm.get('clave');
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleMostrarContrasena() {
    this.mostrarClave = !this.mostrarClave;
  }

  // Mobile menu toggle
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // New dropdown state management
  dropdownOpen = false;
  dropdownHoverTimeout: any = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const dropdownContainer = document.querySelector('.dropdown-container');
    if (
      dropdownContainer &&
      !dropdownContainer.contains(event.target as Node)
    ) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeDropdown();
  }

  openDropdown() {
    clearTimeout(this.dropdownHoverTimeout);
    this.dropdownHoverTimeout = setTimeout(() => {
      this.dropdownOpen = true;
      const dropdownContainer = document.querySelector('.dropdown-container');
      if (dropdownContainer) {
        dropdownContainer.classList.add('dropdown-open');
      }
    }, 300);
  }

  closeDropdown() {
    clearTimeout(this.dropdownHoverTimeout);
    this.dropdownHoverTimeout = setTimeout(() => {
      this.dropdownOpen = false;
      const dropdownContainer = document.querySelector('.dropdown-container');
      if (dropdownContainer) {
        dropdownContainer.classList.remove('dropdown-open');
      }
    }, 500);
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

  async login() {
    if (this.myForm.valid) {
      const credentials: AuthRequest = {
        username: this.email?.value,
        password: this.clave?.value,
      };

      try {
        console.log(
          'LandingPage: Starting login process for user:',
          credentials.username,
        );
        await this.authState.login(credentials);
        console.log(
          'LandingPage: Login completed, checking authentication state...',
        );

        // Verify authentication state before proceeding
        const isAuthenticated = this.authState.isAuthenticated();
        const user = this.authState.user();
        console.log(
          'LandingPage: Auth state - isAuthenticated:',
          isAuthenticated,
          'user:',
          user?.username || 'no username',
        );

        // Trigger success animation or feedback
        this.loginSuccess = true;

        // Extended delay to ensure all storage operations complete before navigation
        // This is critical in Module Federation environments where apps may be isolated
        setTimeout(() => {
          this.loginSuccess = false;

          // Get returnUrl from query params or default to /inicio
          const returnUrl =
            this.route.snapshot.queryParams['returnUrl'] || '/inicio';

          console.log(
            'LandingPage: About to navigate to',
            returnUrl,
            'after storage completion delay',
          );

          this.router.navigate([returnUrl]);
        }, 1000);
      } catch (error) {
        // Error handling with more detailed feedback
        console.error('Login failed:', error);
        this.loginError = true;
        setTimeout(() => {
          this.loginError = false;
        }, 3000);
      }
    } else {
      // Advanced validation feedback
      this.myForm.markAllAsTouched();
      this.validateAllFormFields();
    }
  }

  // Enhance form validation with detailed field-level feedback
  validateAllFormFields() {
    Object.keys(this.myForm.controls).forEach((field) => {
      const control = this.myForm.get(field);
      if (control) {
        control.markAsTouched({ onlySelf: true });
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  // Signals for login state feedback
  loginSuccess = false;
  loginError = false;

  clearAuthError() {
    this.authState.clearError();
  }

  onNewsletterSubmit() {
    if (this.newsletterForm.valid) {
      // Reset previous states
      this.newsletterSubmitSuccess = false;
      this.newsletterSubmitError = false;

      // Simulate API call
      const email = this.newsletterForm.get('email')?.value;
      console.log('Newsletter subscription for:', email);

      // Simulate success response (you would replace this with actual API call)
      setTimeout(() => {
        this.newsletterSubmitSuccess = true;
        this.newsletterForm.reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
          this.newsletterSubmitSuccess = false;
        }, 5000);
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      this.newsletterForm.markAllAsTouched();
    }
  }
}
