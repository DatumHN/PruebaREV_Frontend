import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMask]',
  standalone: true,
})
export class MaskDirective implements OnInit {
  @Input() appMask = '';
  @Input() placeholder = '';

  private previousValue = '';
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private control = inject(NgControl);
  private regexPattern: RegExp | null = null;

  ngOnInit(): void {
    this.initializeRegexPattern();
  }

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const value = event.target.value;

    if (!this.regexPattern) {
      return;
    }

    // Validate against regex pattern
    const isValid = this.regexPattern.test(value);

    // Apply visual feedback for invalid input
    if (value && !isValid) {
      this.renderer.addClass(this.el.nativeElement, 'invalid-mask');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'invalid-mask');
    }

    this.previousValue = value;
  }

  @HostListener('blur', ['$event'])
  onBlur(event: any): void {
    const value = event.target.value;

    if (!this.regexPattern || !value) {
      return;
    }

    // Final validation on blur
    const isValid = this.regexPattern.test(value);

    if (!isValid && this.control && this.control.control) {
      // Mark control as invalid if pattern doesn't match
      this.control.control.setErrors({
        pattern: {
          requiredPattern: this.appMask,
          actualValue: value,
        },
      });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow control keys
    const controlKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];

    if (controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }
  }

  private initializeRegexPattern(): void {
    if (!this.appMask) {
      console.warn('No mask pattern provided');
      return;
    }

    try {
      // Convert regex string to RegExp object
      // Handle both formats:
      // 1. With delimiters: "/^\\d{2}-\\d{8}-\\d{1}$/"
      // 2. Without delimiters: "^\\d{2}-\\d{8}-\\d{1}$"
      const patternString = this.appMask.trim();

      // Remove regex delimiters if present
      const cleanedPattern = patternString.replace(/^\/(.+)\/$/, '$1');

      // Create RegExp object
      this.regexPattern = new RegExp(cleanedPattern);

      console.log('✅ Mask initialized successfully:', {
        original: patternString,
        cleaned: cleanedPattern,
        regex: this.regexPattern,
      });

      // Test with simple patterns for debugging
      this.testPatternWithSamples(this.regexPattern, cleanedPattern);
    } catch (error) {
      console.error('❌ Invalid regex pattern in mask:', {
        originalMask: this.appMask,
        error: error,
      });
      this.regexPattern = null;
    }
  }

  private testPatternWithSamples(regex: RegExp, pattern: string): void {
    // Test samples based on common patterns
    const testCases: { [key: string]: string[] } = {
      // Numbers pattern
      '\\d+|[0-9]+': ['123', '456789', 'abc'],
      // DUI pattern
      '\\d{8}-\\d{1}': ['12345678-9', '1234567-8', '123456789'],
      // General alphanumeric
      '[a-zA-Z0-9]+': ['Test123', 'abc', '123', '!!!'],
    };

    Object.keys(testCases).forEach((key) => {
      if (pattern.includes(key.split('|')[0])) {
        const samples = testCases[key];
        console.log(
          `🧪 Testing pattern "${pattern}" with samples:`,
          samples.map((sample) => ({
            input: sample,
            valid: regex.test(sample),
          })),
        );
      }
    });
  }
}
