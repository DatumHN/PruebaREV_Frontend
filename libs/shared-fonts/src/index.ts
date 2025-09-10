// Export MuseoSans font CSS for global usage
export const MUSEO_SANS_FONT_CSS = './lib/shared-fonts/shared-fonts.scss';

// Font family configuration for Tailwind and other CSS frameworks
export const MUSEO_SANS_FONT_FAMILY = [
  'MuseoSans',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'sans-serif',
];

// Available font weights
export const MUSEO_SANS_WEIGHTS = {
  thin: 100,
  light: 300,
  medium: 500,
  bold: 700,
  black: 900,
} as const;
