// TypeScript interfaces and types for mask functionality

export interface MaskPattern {
  id: string;
  name: string;
  regex: RegExp;
  format?: string;
  placeholder?: string;
  example?: string;
  description?: string;
}

export interface MaskConfig {
  pattern: string | RegExp;
  format?: string;
  placeholder?: string;
  showMask?: boolean;
  guide?: boolean;
  keepCharPositions?: boolean;
  pipe?: (value: string) => string;
  transform?: (value: string) => string;
  validate?: (value: string) => boolean;
}

export interface MaskValidationResult {
  isValid: boolean;
  errors: string[];
  formattedValue?: string;
}

export interface CursorPosition {
  start: number;
  end: number;
}

export interface MaskState {
  rawValue: string;
  formattedValue: string;
  isValid: boolean;
  cursorPosition: CursorPosition;
  errors: string[];
}

export enum MaskType {
  NUMERIC = 'numeric',
  DOCUMENT = 'document',
  PHONE = 'phone',
  DATE = 'date',
  CURRENCY = 'currency',
  CUSTOM = 'custom',
}

export interface PresetPattern {
  type: MaskType;
  name: string;
  regex: string;
  format?: string;
  placeholder: string;
  example: string;
}

export interface MaskOptions {
  realTimeFormatting?: boolean;
  autoComplete?: boolean;
  strictMode?: boolean;
  showErrors?: boolean;
  debounceTime?: number;
}
