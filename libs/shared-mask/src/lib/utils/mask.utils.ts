// Utility functions for mask functionality

import { MaskType } from '../models/mask.models';

/**
 * Format utilities for different data types
 */
export class MaskUtils {
  /**
   * Format number as currency
   */
  static formatCurrency(value: string, currency = '$', decimals = 2): string {
    const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(numValue)) return '';

    return (
      currency +
      numValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    );
  }

  /**
   * Format number as percentage
   */
  static formatPercentage(value: string, decimals = 2): string {
    const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(numValue)) return '';

    return numValue.toFixed(decimals) + '%';
  }

  /**
   * Format phone number
   */
  static formatPhone(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) return value;

    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  }

  /**
   * Format date string
   */
  static formatDate(value: string, format = 'DD/MM/YYYY'): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 8) return value;

    const day = cleaned.slice(0, 2);
    const month = cleaned.slice(2, 4);
    const year = cleaned.slice(4, 8);

    switch (format.toLowerCase()) {
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`;
      case 'mm/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-mm-dd':
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  }

  /**
   * Clean input to remove unwanted characters
   */
  static cleanInput(value: string, allowedChars?: RegExp): string {
    if (allowedChars) {
      return value.replace(allowedChars, '');
    }
    // Default: remove non-printable characters
    return value.replace(/[^\x20-\x7E]/g, '');
  }

  /**
   * Extract digits only
   */
  static extractDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

  /**
   * Extract alphanumeric only
   */
  static extractAlphanumeric(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Capitalize first letter of each word
   */
  static titleCase(value: string): string {
    return value.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
    );
  }

  /**
   * Convert to uppercase
   */
  static upperCase(value: string): string {
    return value.toUpperCase();
  }

  /**
   * Convert to lowercase
   */
  static lowerCase(value: string): string {
    return value.toLowerCase();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate DUI (El Salvador document)
   */
  static isValidDUI(dui: string): boolean {
    const duiRegex = /^\d{8}-\d{1}$/;
    return duiRegex.test(dui);
  }

  /**
   * Generate placeholder from pattern
   */
  static generatePlaceholder(pattern: string): string {
    return pattern
      .replace(/\\d/g, '0')
      .replace(/\\w/g, 'A')
      .replace(/\+/g, '+')
      .replace(/\{.*?\}/g, '')
      .replace(/[()]/g, '')
      .replace(/\^|\$/g, '');
  }

  /**
   * Get mask type from pattern
   */
  static detectMaskType(pattern: string): MaskType {
    if (pattern.includes('\\d') && pattern.includes('-')) {
      if (pattern.includes('{8}') && pattern.includes('{1}')) {
        return MaskType.DOCUMENT; // Likely DUI
      }
      return MaskType.PHONE;
    }

    if (pattern.includes('%')) return MaskType.CURRENCY;
    if (pattern.includes('$')) return MaskType.CURRENCY;
    if (pattern.includes('/') || pattern.includes('-')) return MaskType.DATE;
    if (pattern.includes('\\d')) return MaskType.NUMERIC;

    return MaskType.CUSTOM;
  }

  /**
   * Create example value from pattern
   */
  static createExample(pattern: string): string {
    return pattern
      .replace(/\^/, '')
      .replace(/\$$/, '')
      .replace(/\\d\{(\d+)\}/g, (match, count) => '1'.repeat(parseInt(count)))
      .replace(/\\d/g, '1')
      .replace(/\\w/g, 'A')
      .replace(/\+/g, '+')
      .replace(/[()]/g, '')
      .slice(0, 20); // Limit length
  }

  /**
   * Calculate cursor position after formatting
   */
  static calculateCursorPosition(
    oldValue: string,
    newValue: string,
    oldPosition: number,
  ): number {
    let newPosition = oldPosition;

    // Simple calculation - can be enhanced
    const lengthDiff = newValue.length - oldValue.length;
    newPosition = Math.min(newPosition + lengthDiff, newValue.length);
    newPosition = Math.max(newPosition, 0);

    return newPosition;
  }

  /**
   * Debounce function utility
   */
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number,
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
}
