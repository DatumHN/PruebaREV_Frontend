import { EnvironmentProviders } from '@angular/core';

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

export const RNPNTheme = definePreset(Aura, {
  base: {
    font: {
      family:
        'MuseoSans, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    },
  },
  components: {
    stepper: {
      stepNumber: {
        activeBackground: '{primary.color}',
        activeColor: '{surface.0}',
        activeBorderColor: '{primary.color}',
        background: '{surface.0}',
        color: '{surface.400}',
        borderColor: '{surface.400}',
        size: '2.5rem',
        // borderRadius: '0.5rem',
      },
      stepTitle: {
        color: '{surface.400}',
        activeColor: '{surface.800}',
      },
      separator: {
        background: 'transparent',
        activeBackground: 'transparent',
      },
    },
  },
  semantic: {
    primary: {
      50: '#e1e4ff',
      100: '#c3c9ff',
      200: '#9aa5ff',
      300: '#687eff',
      400: '#2112c9',
      500: '#050e5b',
      600: '#040a48',
      700: '#030735',
      800: '#020422',
      900: '#01010f',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#020617',
          100: '#0f172a',
          200: '#1e293b',
          300: '#334155',
          400: '#475569',
          500: '#64748b',
          600: '#94a3b8',
          700: '#cbd5e1',
          800: '#e2e8f0',
          900: '#f1f5f9',
          950: '#f8fafc',
        },
      },
    },
  },
});

export function provideRnpnPrimeNG(): EnvironmentProviders {
  return providePrimeNG({
    theme: {
      preset: RNPNTheme,
      options: {
        prefix: 'rnpn',
        darkModeSelector: '.rnpn-dark',
        cssLayer: {
          name: 'rnpn-theme',
          order: 'tailwind-base, rnpn-theme, tailwind-utilities',
        },
      },
    },
  });
}

export default RNPNTheme;
