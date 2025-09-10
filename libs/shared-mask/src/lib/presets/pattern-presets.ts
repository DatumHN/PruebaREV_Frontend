// Predefined mask patterns for common use cases

import { PresetPattern, MaskType } from '../models/mask.models';

export const DOCUMENT_PATTERNS: PresetPattern[] = [
  {
    type: MaskType.DOCUMENT,
    name: 'DUI El Salvador',
    regex: '^\\d{8}-\\d{1}$',
    format: '00000000-0',
    placeholder: '00000000-0',
    example: '12345678-9',
  },
  {
    type: MaskType.DOCUMENT,
    name: 'NIT El Salvador',
    regex: '^\\d{4}-\\d{6}-\\d{3}-\\d{1}$',
    format: '0000-000000-000-0',
    placeholder: '0000-000000-000-0',
    example: '1234-567890-123-4',
  },
  {
    type: MaskType.DOCUMENT,
    name: 'Passport',
    regex: '^[A-Z]{1,2}\\d{6,9}$',
    format: 'AA000000000',
    placeholder: 'AA000000000',
    example: 'AB1234567',
  },
  {
    type: MaskType.DOCUMENT,
    name: 'License Plate',
    regex: '^[A-Z]{1,3}-\\d{3,4}$',
    format: 'AAA-0000',
    placeholder: 'AAA-0000',
    example: 'ABC-1234',
  },
];

export const PHONE_PATTERNS: PresetPattern[] = [
  {
    type: MaskType.PHONE,
    name: 'El Salvador Mobile',
    regex: '^[67]\\d{3}-\\d{4}$',
    format: '0000-0000',
    placeholder: '0000-0000',
    example: '7234-5678',
  },
  {
    type: MaskType.PHONE,
    name: 'El Salvador Landline',
    regex: '^2\\d{3}-\\d{4}$',
    format: '0000-0000',
    placeholder: '0000-0000',
    example: '2234-5678',
  },
  {
    type: MaskType.PHONE,
    name: 'International',
    regex: '^\\+\\d{1,3}\\s\\d{4}-\\d{4}$',
    format: '+000 0000-0000',
    placeholder: '+000 0000-0000',
    example: '+503 7234-5678',
  },
  {
    type: MaskType.PHONE,
    name: 'US Phone',
    regex: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
    format: '(000) 000-0000',
    placeholder: '(000) 000-0000',
    example: '(555) 123-4567',
  },
];

export const NUMERIC_PATTERNS: PresetPattern[] = [
  {
    type: MaskType.NUMERIC,
    name: 'Percentage',
    regex: '^\\d{1,3}(\\.\\d{1,2})?%$',
    format: '00.00%',
    placeholder: '00.00%',
    example: '15.50%',
  },
  {
    type: MaskType.NUMERIC,
    name: 'Decimal Number',
    regex: '^\\d+(\\.\\d{1,2})?$',
    format: '0.00',
    placeholder: '0.00',
    example: '123.45',
  },
  {
    type: MaskType.NUMERIC,
    name: 'Integer',
    regex: '^\\d+$',
    format: '0',
    placeholder: '0',
    example: '12345',
  },
  {
    type: MaskType.NUMERIC,
    name: 'Positive/Negative Number',
    regex: '^-?\\d+(\\.\\d{1,2})?$',
    format: '-0.00',
    placeholder: '0.00',
    example: '-123.45',
  },
];

export const CURRENCY_PATTERNS: PresetPattern[] = [
  {
    type: MaskType.CURRENCY,
    name: 'USD Dollar',
    regex: '^\\$\\d{1,}(\\.\\d{2})?$',
    format: '$0.00',
    placeholder: '$0.00',
    example: '$1,234.56',
  },
  {
    type: MaskType.CURRENCY,
    name: 'EUR Euro',
    regex: '^€\\d{1,}(\\.\\d{2})?$',
    format: '€0.00',
    placeholder: '€0.00',
    example: '€1,234.56',
  },
  {
    type: MaskType.CURRENCY,
    name: 'Colón Costa Rica',
    regex: '^₡\\d{1,}(\\.\\d{2})?$',
    format: '₡0.00',
    placeholder: '₡0.00',
    example: '₡1,234.56',
  },
];

export const DATE_PATTERNS: PresetPattern[] = [
  {
    type: MaskType.DATE,
    name: 'DD/MM/YYYY',
    regex: '^\\d{2}\\/\\d{2}\\/\\d{4}$',
    format: 'DD/MM/YYYY',
    placeholder: 'DD/MM/YYYY',
    example: '25/12/2023',
  },
  {
    type: MaskType.DATE,
    name: 'MM/DD/YYYY',
    regex: '^\\d{2}\\/\\d{2}\\/\\d{4}$',
    format: 'MM/DD/YYYY',
    placeholder: 'MM/DD/YYYY',
    example: '12/25/2023',
  },
  {
    type: MaskType.DATE,
    name: 'YYYY-MM-DD',
    regex: '^\\d{4}-\\d{2}-\\d{2}$',
    format: 'YYYY-MM-DD',
    placeholder: 'YYYY-MM-DD',
    example: '2023-12-25',
  },
  {
    type: MaskType.DATE,
    name: 'DD-MM-YYYY',
    regex: '^\\d{2}-\\d{2}-\\d{4}$',
    format: 'DD-MM-YYYY',
    placeholder: 'DD-MM-YYYY',
    example: '25-12-2023',
  },
  {
    type: MaskType.DATE,
    name: 'Time HH:MM',
    regex: '^([01]?\\d|2[0-3]):[0-5]\\d$',
    format: 'HH:MM',
    placeholder: 'HH:MM',
    example: '14:30',
  },
  {
    type: MaskType.DATE,
    name: 'Time HH:MM:SS',
    regex: '^([01]?\\d|2[0-3]):[0-5]\\d:[0-5]\\d$',
    format: 'HH:MM:SS',
    placeholder: 'HH:MM:SS',
    example: '14:30:45',
  },
];

export const CUSTOM_PATTERNS: PresetPattern[] = [
  {
    type: MaskType.CUSTOM,
    name: 'Email',
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    format: 'user@domain.com',
    placeholder: 'user@domain.com',
    example: 'john.doe@example.com',
  },
  {
    type: MaskType.CUSTOM,
    name: 'URL',
    regex:
      '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    format: 'https://www.example.com',
    placeholder: 'https://www.example.com',
    example: 'https://www.google.com',
  },
  {
    type: MaskType.CUSTOM,
    name: 'ZIP Code',
    regex: '^\\d{5}(-\\d{4})?$',
    format: '00000-0000',
    placeholder: '00000-0000',
    example: '12345-6789',
  },
  {
    type: MaskType.CUSTOM,
    name: 'Credit Card',
    regex: '^\\d{4}-\\d{4}-\\d{4}-\\d{4}$',
    format: '0000-0000-0000-0000',
    placeholder: '0000-0000-0000-0000',
    example: '4532-1234-5678-9012',
  },
  {
    type: MaskType.CUSTOM,
    name: 'IP Address',
    regex:
      '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    format: '000.000.000.000',
    placeholder: '000.000.000.000',
    example: '192.168.1.1',
  },
];

// Export all patterns as a single collection
export const ALL_PRESET_PATTERNS: PresetPattern[] = [
  ...DOCUMENT_PATTERNS,
  ...PHONE_PATTERNS,
  ...NUMERIC_PATTERNS,
  ...CURRENCY_PATTERNS,
  ...DATE_PATTERNS,
  ...CUSTOM_PATTERNS,
];

// Pattern lookup by name
export const PATTERN_LOOKUP: { [key: string]: PresetPattern } =
  ALL_PRESET_PATTERNS.reduce(
    (acc, pattern) => {
      const key = `${pattern.type}_${pattern.name.replace(/\s+/g, '_').toLowerCase()}`;
      acc[key] = pattern;
      return acc;
    },
    {} as { [key: string]: PresetPattern },
  );

// Quick access functions
export const getPatternByType = (type: MaskType): PresetPattern[] => {
  return ALL_PRESET_PATTERNS.filter((p) => p.type === type);
};

export const getPatternByName = (name: string): PresetPattern | undefined => {
  return ALL_PRESET_PATTERNS.find(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  );
};

export const searchPatterns = (query: string): PresetPattern[] => {
  const lowerQuery = query.toLowerCase();
  return ALL_PRESET_PATTERNS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) || p.example.includes(query),
  );
};
