import { Injectable } from '@angular/core';
import {
  MaskConfig,
  MaskValidationResult,
  MaskState,
  CursorPosition,
  MaskOptions,
} from '../models/mask.models';

@Injectable({
  providedIn: 'root',
})
export class MaskService {
  /**
   * Processes input value according to mask configuration
   */
  processInput(
    value: string,
    config: MaskConfig,
    options: MaskOptions = {},
  ): MaskState {
    const rawValue = this.cleanInput(value);
    const validationResult = this.validateInput(rawValue, config);

    let formattedValue = rawValue;
    // Apply formatting during typing regardless of validation state
    if (options.realTimeFormatting) {
      formattedValue = this.formatValue(rawValue, config);
    }

    return {
      rawValue,
      formattedValue,
      isValid: validationResult.isValid,
      cursorPosition: this.calculateCursorPosition(value, formattedValue),
      errors: validationResult.errors,
    };
  }

  /**
   * Validates input against regex pattern
   */
  validateInput(value: string, config: MaskConfig): MaskValidationResult {
    if (!value) {
      return { isValid: true, errors: [] };
    }

    const pattern = this.createRegexPattern(config.pattern);
    const isValid = pattern.test(value);

    const result: MaskValidationResult = {
      isValid,
      errors: isValid ? [] : ['Invalid format'],
    };

    if (isValid) {
      result.formattedValue = value;
    }

    return result;
  }

  /**
   * Creates RegExp object from string or RegExp pattern
   */
  createRegexPattern(pattern: string | RegExp): RegExp {
    if (pattern instanceof RegExp) {
      return pattern;
    }

    try {
      // Handle patterns like "/^\\d{2}-\\d{8}-\\d{1}$/" or "^\\d{2}-\\d{8}-\\d{1}$"
      const cleanedPattern = pattern.replace(/^\/(.+)\/$/, '$1');
      return new RegExp(cleanedPattern);
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error);
      return new RegExp('.*'); // Fallback pattern that matches everything
    }
  }

  /**
   * Formats value according to specified format pattern
   */
  formatValue(value: string, config: MaskConfig): string {
    let formatted = value;

    // Apply real-time formatting based on pattern type (even without explicit format)
    formatted = this.applyAutoFormatting(formatted, config);

    // Apply transform if provided
    if (config.transform) {
      formatted = config.transform(formatted);
    }

    return formatted;
  }

  /**
   * Apply auto-formatting based on pattern recognition
   */
  private applyAutoFormatting(value: string, config: MaskConfig): string {
    const pattern = config.pattern.toString().toLowerCase();
    const format = config.format || '';

    console.log(
      `🔄 Auto-formatting check for pattern: "${pattern}" format: "${format}" with value: "${value}"`,
    );

    // DUI formatting (00000000-0) - Enhanced pattern detection using both pattern and format
    const isDUIPattern =
      // Check format template (most reliable)
      /^\d{8}-\d{1}$/.test(format.replace(/9/g, '0')) ||
      format === '99999999-9' ||
      // Check regex pattern (fallback)
      pattern.includes('\\d{8}-\\d{1}') ||
      pattern.includes('\\d{8}\\-\\d{1}') ||
      pattern.includes('d{8}-d{1}') ||
      /\d{8}.*-.*\d{1}/.test(pattern);

    if (isDUIPattern) {
      console.log(
        `✅ DUI pattern detected from ${format ? 'format: ' + format : 'pattern: ' + pattern}, formatting "${value}"`,
      );
      const formatted = this.formatDUI(value);
      console.log(`🎯 DUI formatted result: "${formatted}"`);
      return formatted;
    }

    // Phone formatting (0000-0000)
    if (
      pattern.includes('\\d{4}-\\d{4}') ||
      pattern.includes('\\d{4}\\-\\d{4}') ||
      pattern.includes('d{4}-d{4}') ||
      /\d{4}.*-.*\d{4}/.test(pattern)
    ) {
      return this.formatPhone(value);
    }

    // Date formatting (DD/MM/YYYY)
    if (
      pattern.includes('\\d{2}\\/\\d{2}\\/\\d{4}') ||
      pattern.includes('d{2}/d{2}/d{4}') ||
      /\d{2}.*\/.*\d{2}.*\/.*\d{4}/.test(pattern)
    ) {
      return this.formatDate(value);
    }

    // Currency formatting
    if (
      pattern.includes('\\$') ||
      pattern.includes('€') ||
      pattern.includes('₡')
    ) {
      return this.formatCurrency(value, config);
    }

    // Percentage formatting
    if (pattern.includes('%')) {
      return this.formatPercentage(value);
    }

    return value;
  }

  /**
   * Format DUI (El Salvador document)
   */
  private formatDUI(value: string): string {
    const digits = value.replace(/\D/g, '');

    // Return as-is if less than or equal to 8 digits
    if (digits.length <= 8) {
      return digits;
    }

    // Format as 00000000-0 when we have 9 or more digits
    return `${digits.slice(0, 8)}-${digits.slice(8, 9)}`;
  }

  /**
   * Format phone number
   */
  private formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) {
      return digits;
    }
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
  }

  /**
   * Format date DD/MM/YYYY
   */
  private formatDate(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  }

  /**
   * Format currency
   */
  private formatCurrency(value: string, config: MaskConfig): string {
    const pattern = config.pattern.toString();
    let symbol = '$';

    if (pattern.includes('€')) symbol = '€';
    else if (pattern.includes('₡')) symbol = '₡';

    const digits = value.replace(/[^\d.]/g, '');
    if (!digits) return '';

    const number = parseFloat(digits);
    if (isNaN(number)) return digits;

    return (
      symbol +
      number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  /**
   * Format percentage
   */
  private formatPercentage(value: string): string {
    const digits = value.replace(/[^\d.]/g, '');
    if (!digits) return '';
    return digits + '%';
  }

  /**
   * Removes unwanted characters from input
   */
  private cleanInput(value: string): string {
    // Basic cleaning - remove non-printable characters
    return value.replace(/[^\x20-\x7E]/g, '');
  }

  /**
   * Calculates cursor position after formatting
   */
  private calculateCursorPosition(
    originalValue: string,
    formattedValue: string,
  ): CursorPosition {
    // Simple cursor position calculation - can be enhanced
    const position = Math.min(originalValue.length, formattedValue.length);
    return { start: position, end: position };
  }

  /**
   * Processes backspace/delete operations
   */
  processDelete(
    currentValue: string,
    cursorPos: number,
    isBackspace: boolean,
  ): { value: string; cursorPosition: number } {
    let newValue = currentValue;
    let newPosition = cursorPos;

    if (isBackspace && cursorPos > 0) {
      newValue =
        currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
      newPosition = cursorPos - 1;
    } else if (!isBackspace && cursorPos < currentValue.length) {
      newValue =
        currentValue.slice(0, cursorPos) + currentValue.slice(cursorPos + 1);
      // Position stays the same for delete
    }

    return { value: newValue, cursorPosition: newPosition };
  }
}
