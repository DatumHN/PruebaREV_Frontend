/**
 * MuseoSans Font Configuration
 * Provides font family and weight constants for the REVFA project
 */

export const MUSEO_SANS_FONT_FAMILY = [
  'MuseoSans',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'sans-serif',
];

export const MUSEO_SANS_WEIGHTS = {
  thin: 100,
  light: 300,
  medium: 500,
  bold: 700,
  black: 900,
} as const;

export type MuseoSansWeight =
  (typeof MUSEO_SANS_WEIGHTS)[keyof typeof MUSEO_SANS_WEIGHTS];
