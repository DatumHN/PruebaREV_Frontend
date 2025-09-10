const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const rnpnPreset = require('../../libs/tailwind-preset/src/index.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [rnpnPreset],

  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
    // Include all microfrontend source files for Module Federation
    join(__dirname, '../landing/src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../registry/src/**/!(*.stories|*.spec).{ts,html}'),
  ],

  theme: {
    extend: {
      // Extensiones específicas del Shell
    },
  },

  plugins: [
    // Plugins específicos del Shell
    require('tailwindcss/plugin')(function ({ addComponents, theme }) {
      addComponents({
        // Componentes específicos del shell - migrando gradualmente a prefijo tw-
        '.cards-section': {
          '@apply tw-flex tw-flex-wrap tw-gap-4 tw-py-5 tw-w-full tw-max-w-4xl tw-mx-auto':
            {},
        },
        '.card-custom': {
          '@apply tw-flex-grow tw-flex-shrink-0 tw-transition-all tw-duration-300 tw-ease-in-out tw-border-none tw-rounded-2xl tw-cursor-pointer tw-relative tw-overflow-hidden tw-h-36 tw-flex tw-items-center tw-justify-center tw-z-10':
            {},
          'flex-basis': '200px',
          background: 'linear-gradient(145deg, var(--surface-0), #f0f4f8)',
          'box-shadow': 'var(--rnpn-shadow)',
          'background-size': '200% 100%',
          'background-position': 'left center',
          animation: 'slideInUp 0.6s ease-out both',

          '&:hover': {
            'flex-grow': '6',
            'background-image':
              'linear-gradient(to right, var(--rnpn-primary-400) 0%, var(--rnpn-primary-300) 51%, var(--rnpn-primary-500) 100%)',
            'background-position': 'right center',
            'box-shadow': 'var(--rnpn-shadow-lg)',
            'z-index': '50',
          },
        },
        '.card-custom-body': {
          '@apply tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-px-4 tw-py-5 tw-relative tw-z-20 tw-transition-all tw-duration-300 tw-h-full':
            {},
          color: 'var(--rnpn-primary-500)',
        },
        '.card-custom:hover .card-custom-body': {
          '@apply tw-text-white': {},
        },
        '.card-icon': {
          '@apply tw-flex tw-items-center tw-justify-center tw-mb-2 tw-transition-all tw-duration-300 tw-mx-auto':
            {},
        },
        '.card-custom:hover .card-icon': {
          transform: 'translateY(-2px) scale(1)',
        },
        '.card-custom-title': {
          '@apply tw-text-sm tw-font-semibold tw-leading-tight tw-m-0 tw-flex tw-justify-center tw-items-center tw-transition-all tw-duration-300':
            {},
          'min-height': '40px',
        },
        '.card-custom:hover .card-custom-title': {
          '@apply tw-text-white tw-text-base tw-font-bold': {},
        },
        '.miss-image': {
          '@apply tw-max-w-full tw-h-auto': {},
        },
      });

      addComponents({
        '@keyframes slideInUp': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      });

      addComponents({
        '@media (max-width: 768px)': {
          '.cards-section': {
            '@apply tw-flex-col': {},
          },
          '.card-custom': {
            '@apply tw-h-32': {},
            flex: '1 1 100%',
          },
          '.card-custom:hover': {
            transform: 'scale(1)',
            'flex-grow': '1',
          },
          '.card-custom:hover .card-icon': {
            transform: 'translateY(-5px) scale(1.1)',
          },
          '.card-custom:hover .card-custom-title': {
            '@apply tw-text-xs': {},
          },
          '.miss-image': {
            '@apply tw-mt-8': {},
          },
        },
      });
    }),
  ],
};
