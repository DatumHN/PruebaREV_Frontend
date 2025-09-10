import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

import { MaskService } from '../services/mask.service';
import { PatternRegistryService } from '../services/pattern-registry.service';
import type { MaskConfig, MaskOptions, MaskState } from '../models/mask.models';

@Directive({
  selector: '[libAdvancedMask]',
  standalone: true,
})
export class AdvancedMaskDirective implements OnInit, OnDestroy {
  @Input() libAdvancedMask = '';
  @Input() maskFormat = ''; // New input for mask format like '99999999-9'
  @Input() maskOptions: MaskOptions = {
    realTimeFormatting: true,
    autoComplete: false,
    strictMode: false,
    showErrors: true,
    debounceTime: 300,
  };
  @Input() placeholder = '';

  private destroy$ = new Subject<void>();
  private inputSubject = new Subject<string>();
  private validationSubject = new Subject<string>(); // For debounced validation
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private control = inject(NgControl, { optional: true });
  private maskService = inject(MaskService);
  private patternRegistry = inject(PatternRegistryService);

  private currentMaskState: MaskState | null = null;
  private maskConfig: MaskConfig | null = null;
  private regexPattern: RegExp | null = null;

  ngOnInit(): void {
    this.initializeMask();
    this.setupInputDebouncing();
    this.setupValidationDebouncing();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    // Apply real-time formatting immediately (no delay)
    this.processFormatting(value);

    // Trigger debounced validation for red state (300ms delay)
    this.validationSubject.next(value);

    // Legacy debounced input processing (if configured)
    if (this.maskOptions.debounceTime && this.maskOptions.debounceTime > 0) {
      this.inputSubject.next(value);
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent): void {
    const value = (event.target as HTMLInputElement).value;

    // Always validate on blur (when leaving the field)
    this.applyDebouncedValidation(value);
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
      'Control',
      'Alt',
      'Meta',
    ];

    if (controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      // Handle backspace/delete for better UX
      if (event.key === 'Backspace' || event.key === 'Delete') {
        this.handleDeleteKey(event);
      }
      return;
    }

    // In strict mode, prevent invalid character input
    if (this.maskOptions.strictMode && this.maskConfig) {
      this.handleStrictMode(event);
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const currentValue = (event.target as HTMLInputElement).value;
    const start = (event.target as HTMLInputElement).selectionStart || 0;
    const end = (event.target as HTMLInputElement).selectionEnd || 0;

    const newValue =
      currentValue.slice(0, start) + pastedData + currentValue.slice(end);

    // Apply formatting immediately
    this.processFormatting(newValue);

    // Trigger debounced validation
    this.validationSubject.next(newValue);
  }

  private initializeMask(): void {
    // Enhanced debugging for field identification
    const fieldName =
      this.el.nativeElement.name || this.el.nativeElement.id || 'unknown-field';

    console.log(`🔍 Initializing mask for field: ${fieldName}`, {
      libAdvancedMask: this.libAdvancedMask,
      maskLength: this.libAdvancedMask?.length,
      maskType: typeof this.libAdvancedMask,
      placeholder: this.placeholder,
    });

    if (!this.libAdvancedMask || this.libAdvancedMask.trim() === '') {
      console.warn(`⚠️ No mask pattern provided for field: ${fieldName}`);
      return;
    }

    try {
      // First, initialize the regex pattern directly (like the old directive)
      this.initializeRegexPattern();

      // Only create config if regex pattern was successfully created
      if (this.regexPattern) {
        const config: MaskConfig = {
          pattern: this.libAdvancedMask,
          format: this.maskFormat, // Add mask format for pattern detection
          placeholder: this.placeholder,
        };

        if (this.maskOptions.strictMode) {
          config.validate = (value) =>
            this.maskService.validateInput(value, this.maskConfig || config)
              .isValid;
        }

        this.maskConfig = config;

        // Set placeholder if provided
        if (this.placeholder) {
          this.renderer.setProperty(
            this.el.nativeElement,
            'placeholder',
            this.placeholder,
          );
        }

        console.log(`✅ Advanced mask initialized for ${fieldName}:`, {
          pattern: this.libAdvancedMask,
          regexPattern: this.regexPattern,
          config: this.maskConfig,
          options: this.maskOptions,
        });
      } else {
        console.error(
          `❌ Failed to create regex pattern for field: ${fieldName}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to initialize advanced mask for field: ${fieldName}`,
        error,
      );
      this.maskConfig = null;
      this.regexPattern = null;
    }
  }

  private initializeRegexPattern(): void {
    const fieldName =
      this.el.nativeElement.name || this.el.nativeElement.id || 'unknown-field';

    if (!this.libAdvancedMask || this.libAdvancedMask.trim() === '') {
      console.warn(`No mask pattern provided for field: ${fieldName}`);
      return;
    }

    try {
      // Convert regex string to RegExp object
      // Handle both formats:
      // 1. With delimiters: "/^\\d{2}-\\d{8}-\\d{1}$/"
      // 2. Without delimiters: "^\\d{2}-\\d{8}-\\d{1}$"
      const patternString = this.libAdvancedMask.trim();

      // Remove regex delimiters if present
      const cleanedPattern = patternString.replace(/^\/(.+)\/$/, '$1');

      // Additional validation: check if pattern is not empty after cleaning
      if (!cleanedPattern || cleanedPattern.trim() === '') {
        console.error(
          `❌ Empty pattern after cleaning for field: ${fieldName}`,
          {
            original: patternString,
            cleaned: cleanedPattern,
          },
        );
        this.regexPattern = null;
        return;
      }

      // Create RegExp object
      this.regexPattern = new RegExp(cleanedPattern);

      console.log(
        `✅ Regex pattern initialized successfully for ${fieldName}:`,
        {
          original: patternString,
          cleaned: cleanedPattern,
          regex: this.regexPattern.toString(),
        },
      );

      // Test with simple patterns for debugging
      this.testPatternWithSamples(this.regexPattern, cleanedPattern);
    } catch (error) {
      console.error(
        `❌ Invalid regex pattern in mask for field: ${fieldName}:`,
        {
          originalMask: this.libAdvancedMask,
          error: error,
        },
      );
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

  private setupInputDebouncing(): void {
    if (this.maskOptions.debounceTime && this.maskOptions.debounceTime > 0) {
      this.inputSubject
        .pipe(
          debounceTime(this.maskOptions.debounceTime || 300),
          takeUntil(this.destroy$),
        )
        .subscribe((value) => {
          // Legacy debounced processing - just trigger validation after legacy delay
          this.applyDebouncedValidation(value);
        });
    }
  }

  private setupValidationDebouncing(): void {
    // Set up 300ms debounced validation specifically for red state
    this.validationSubject
      .pipe(
        debounceTime(300), // Always 300ms for validation, regardless of maskOptions
        takeUntil(this.destroy$),
      )
      .subscribe((value) => {
        // Only apply red validation after 300ms pause
        this.applyDebouncedValidation(value);
      });
  }

  private processFormatting(value: string): void {
    // Apply immediate formatting without validation state changes
    if (this.maskConfig) {
      try {
        const maskState = this.maskService.processInput(
          value,
          this.maskConfig,
          this.maskOptions,
        );
        this.currentMaskState = maskState;

        // Update input display value for real-time formatting
        if (
          this.maskOptions.realTimeFormatting &&
          maskState.formattedValue !== value
        ) {
          this.updateInputValue(
            maskState.formattedValue,
            maskState.cursorPosition?.start,
          );
        }
      } catch (error) {
        console.error('Error processing formatting:', error);
      }
    }
  }

  private applyDebouncedValidation(value: string): void {
    const fieldName =
      this.el.nativeElement.name || this.el.nativeElement.id || 'unknown-field';

    // Apply validation and visual feedback after 300ms delay
    if (this.regexPattern) {
      const isValid = this.regexPattern.test(value);

      if (value && !isValid) {
        // Show red validation after debounce
        this.renderer.addClass(this.el.nativeElement, 'mask-invalid');
        this.renderer.removeClass(this.el.nativeElement, 'mask-valid');
        console.log(
          `❌ Invalid (after 300ms debounce): ${fieldName} = "${value}"`,
        );
      } else if (value && isValid) {
        // Show valid state
        this.renderer.removeClass(this.el.nativeElement, 'mask-invalid');
        this.renderer.addClass(this.el.nativeElement, 'mask-valid');
        console.log(
          `✅ Valid (after 300ms debounce): ${fieldName} = "${value}"`,
        );
      } else {
        // Clear both classes when value is empty
        this.renderer.removeClass(this.el.nativeElement, 'mask-invalid');
        this.renderer.removeClass(this.el.nativeElement, 'mask-valid');
      }

      // Update form control validation
      if (this.control?.control) {
        if (!isValid && value) {
          this.control.control.setErrors({
            pattern: {
              requiredPattern: this.libAdvancedMask,
              actualValue: value,
            },
          });
        } else {
          // Clear pattern errors but keep other errors
          const currentErrors = this.control.control.errors;
          if (currentErrors?.['pattern']) {
            delete currentErrors['pattern'];
            const hasOtherErrors = Object.keys(currentErrors).length > 0;
            this.control.control.setErrors(
              hasOtherErrors ? currentErrors : null,
            );
          }
        }
      }
    }
  }

  private applyVisualFeedback(maskState: MaskState): void {
    const element = this.el.nativeElement;

    // Remove existing classes
    this.renderer.removeClass(element, 'mask-valid');
    this.renderer.removeClass(element, 'mask-invalid');
    this.renderer.removeClass(element, 'mask-processing');

    if (maskState.rawValue && this.maskOptions.showErrors) {
      if (maskState.isValid) {
        this.renderer.addClass(element, 'mask-valid');
      } else {
        this.renderer.addClass(element, 'mask-invalid');
      }
    }
  }

  private handleDeleteKey(event: KeyboardEvent): void {
    if (!this.maskConfig || !this.maskOptions.realTimeFormatting) return;

    const input = event.target as HTMLInputElement;
    const cursorPos = input.selectionStart || 0;
    const isBackspace = event.key === 'Backspace';

    const result = this.maskService.processDelete(
      input.value,
      cursorPos,
      isBackspace,
    );

    // Update value and cursor position
    this.updateInputValue(result.value);
    setTimeout(() => {
      input.setSelectionRange(result.cursorPosition, result.cursorPosition);
    }, 0);

    event.preventDefault();
  }

  private handleStrictMode(event: KeyboardEvent): void {
    // Implementation for strict mode character validation
    // This would prevent invalid characters from being typed
    const char = event.key;
    if (char.length === 1 && this.maskConfig) {
      const input = event.target as HTMLInputElement;
      const testValue = input.value + char;

      const isValid = this.maskService.validateInput(
        testValue,
        this.maskConfig,
      ).isValid;
      if (!isValid) {
        event.preventDefault();
        console.log('🚫 Character blocked by strict mode:', char);
      }
    }
  }

  private updateInputValue(value: string, cursorPosition?: number): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const currentCursorPos = input.selectionStart || 0;

    this.renderer.setProperty(input, 'value', value);

    // Restore or set cursor position after formatting
    const newCursorPos =
      cursorPosition !== undefined
        ? cursorPosition
        : Math.min(currentCursorPos, value.length);

    // Use setTimeout to ensure the value is updated before setting cursor
    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  /**
   * Public method to get current mask state
   */
  getCurrentState(): MaskState | null {
    return this.currentMaskState;
  }

  /**
   * Public method to update mask pattern dynamically
   */
  updateMask(pattern: string, options?: Partial<MaskOptions>): void {
    this.libAdvancedMask = pattern;
    if (options) {
      this.maskOptions = { ...this.maskOptions, ...options };
    }
    this.initializeMask();
  }
}
