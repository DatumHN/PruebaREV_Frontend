import { Injectable } from '@angular/core';
import { MaskType, PresetPattern, MaskPattern } from '../models/mask.models';

@Injectable({
  providedIn: 'root',
})
export class PatternRegistryService {
  private patterns = new Map<string, MaskPattern>();

  constructor() {
    this.initializePresets();
  }

  /**
   * Initialize predefined patterns
   */
  private initializePresets(): void {
    const presets: PresetPattern[] = [
      // Document patterns
      {
        type: MaskType.DOCUMENT,
        name: 'DUI El Salvador',
        regex: '^\\d{8}-\\d{1}$',
        placeholder: '00000000-0',
        example: '12345678-9',
      },
      {
        type: MaskType.DOCUMENT,
        name: 'Tax ID',
        regex: '^\\d{4}-\\d{6}-\\d{3}-\\d{1}$',
        placeholder: '0000-000000-000-0',
        example: '1234-567890-123-4',
      },

      // Phone patterns
      {
        type: MaskType.PHONE,
        name: 'El Salvador Phone',
        regex: '^\\d{4}-\\d{4}$',
        placeholder: '0000-0000',
        example: '2234-5678',
      },
      {
        type: MaskType.PHONE,
        name: 'International Phone',
        regex: '^\\+\\d{1,3}\\s\\d{4}-\\d{4}$',
        placeholder: '+000 0000-0000',
        example: '+503 2234-5678',
      },

      // Numeric patterns
      {
        type: MaskType.NUMERIC,
        name: 'Percentage',
        regex: '^\\d{1,3}(\\.\\d{1,2})?%$',
        placeholder: '00.00%',
        example: '15.50%',
      },
      {
        type: MaskType.CURRENCY,
        name: 'USD Currency',
        regex: '^\\$\\d{1,}(\\.\\d{2})?$',
        placeholder: '$0.00',
        example: '$1,234.56',
      },

      // Date patterns
      {
        type: MaskType.DATE,
        name: 'Date DD/MM/YYYY',
        regex: '^\\d{2}\\/\\d{2}\\/\\d{4}$',
        placeholder: 'DD/MM/YYYY',
        example: '25/12/2023',
      },
      {
        type: MaskType.DATE,
        name: 'Date MM-DD-YYYY',
        regex: '^\\d{2}-\\d{2}-\\d{4}$',
        placeholder: 'MM-DD-YYYY',
        example: '12-25-2023',
      },
    ];

    presets.forEach((preset) => this.registerPreset(preset));
  }

  /**
   * Register a preset pattern
   */
  registerPreset(preset: PresetPattern): void {
    const pattern: MaskPattern = {
      id: `${preset.type}_${preset.name.replace(/\s+/g, '_').toLowerCase()}`,
      name: preset.name,
      regex: new RegExp(preset.regex),
      placeholder: preset.placeholder,
      example: preset.example,
      description: `${preset.type} pattern: ${preset.name}`,
    };

    if (preset.format) {
      pattern.format = preset.format;
    }

    this.patterns.set(pattern.id, pattern);
  }

  /**
   * Register a custom pattern
   */
  registerCustomPattern(id: string, pattern: MaskPattern): void {
    this.patterns.set(id, pattern);
  }

  /**
   * Get pattern by ID
   */
  getPattern(id: string): MaskPattern | undefined {
    return this.patterns.get(id);
  }

  /**
   * Get all patterns of a specific type
   */
  getPatternsByType(type: MaskType): MaskPattern[] {
    return Array.from(this.patterns.values()).filter((pattern) =>
      pattern.id.startsWith(type),
    );
  }

  /**
   * Get all registered patterns
   */
  getAllPatterns(): MaskPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Search patterns by name or description
   */
  searchPatterns(query: string): MaskPattern[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.patterns.values()).filter(
      (pattern) =>
        pattern.name.toLowerCase().includes(lowerQuery) ||
        pattern.description?.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Remove a pattern
   */
  removePattern(id: string): boolean {
    return this.patterns.delete(id);
  }

  /**
   * Check if pattern exists
   */
  hasPattern(id: string): boolean {
    return this.patterns.has(id);
  }

  /**
   * Get pattern suggestions based on input value
   */
  suggestPattern(value: string): MaskPattern[] {
    const suggestions: MaskPattern[] = [];

    for (const pattern of this.patterns.values()) {
      if (pattern.regex.test(value)) {
        suggestions.push(pattern);
      }
    }

    return suggestions.slice(0, 5); // Return top 5 matches
  }
}
