const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const rnpnPreset = require('../../libs/tailwind-preset/src/index.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [rnpnPreset],

  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],

  // Safelist específico para Registry (formly grid system)
  safelist: [
    // Grid columns para Formly
    'col-span-1',
    'col-span-2',
    'col-span-3',
    'col-span-4',
    'col-span-5',
    'col-span-6',
    'col-span-7',
    'col-span-8',
    'col-span-9',
    'col-span-10',
    'col-span-11',
    'col-span-12',

    // Responsive grid
    'md:col-span-1',
    'md:col-span-2',
    'md:col-span-3',
    'md:col-span-4',
    'md:col-span-5',
    'md:col-span-6',
    'md:col-span-7',
    'md:col-span-8',
    'md:col-span-9',
    'md:col-span-10',
    'md:col-span-11',
    'md:col-span-12',

    // Grid container
    'grid',
    'grid-cols-12',
    'gap-x-6',
    'mb-4',

    // Prefijo tw- para nuevas clases
    { pattern: /^tw-col-span-/ },
    { pattern: /^tw-grid/ },
  ],

  theme: {
    extend: {
      // Extensiones específicas del Registry
    },
  },

  plugins: [
    // Plugins específicos del Registry - mantenemos componentes existentes temporalmente
    require('tailwindcss/plugin')(function ({ addComponents }) {
      addComponents({
        // Componentes legacy - gradualmente migrarán a prefijo tw-
        '.cards-section, .tw-cards-section': {
          '@apply tw-grid tw-gap-6 tw-py-8 tw-w-full tw-max-w-7xl tw-mx-auto':
            {},
          'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))',
          'justify-items': 'center',
        },
        '.card-custom, .tw-card-custom': {
          '@apply tw-w-full tw-max-w-sm tw-min-w-72 tw-min-h-40 tw-transition-all tw-duration-300 tw-ease-in-out tw-border-none tw-rounded-2xl tw-cursor-pointer tw-relative tw-overflow-hidden tw-flex tw-items-center tw-justify-center tw-shadow-lg':
            {},
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
          'box-shadow': '0 10px 30px rgba(102, 126, 234, 0.3) !important',
          animation: 'slideInUp 0.6s ease-out both',

          '&:hover': {
            transform: 'translateY(-8px) scale(1.02) !important',
            'box-shadow': '0 20px 40px rgba(102, 126, 234, 0.4) !important',
            background:
              'linear-gradient(135deg, #5a6fd8 0%, #6a4c93 100%) !important',
          },
        },
        '.card-custom-body, .tw-card-custom-body': {
          '@apply tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-px-4 tw-py-5 tw-relative tw-z-20 tw-transition-all tw-duration-300 tw-h-full':
            {},
          color: 'var(--rnpn-primary-500)',
        },
        '.card-custom:hover .card-custom-body, .tw-card-custom:hover .tw-card-custom-body':
          {
            '@apply tw-text-white': {},
          },
        '.card-icon, .tw-card-icon': {
          '@apply tw-flex tw-items-center tw-justify-center tw-mb-2 tw-transition-all tw-duration-300 tw-mx-auto':
            {},
        },
        '.card-custom:hover .card-icon, .tw-card-custom:hover .tw-card-icon': {
          transform: 'translateY(-4px) scale(1.1)',
        },
        '.card-custom:hover .card-icon i-lucide, .tw-card-custom:hover .tw-card-icon i-lucide':
          {
            color: 'white !important',
          },
        '.card-custom-title, .tw-card-custom-title': {
          '@apply tw-text-sm tw-font-semibold tw-leading-tight tw-m-0 tw-flex tw-justify-center tw-items-center tw-transition-all tw-duration-300':
            {},
          'min-height': '40px',
          color: 'var(--rnpn-primary-500)',
        },
        '.card-custom:hover .card-custom-title, .tw-card-custom:hover .tw-card-custom-title':
          {
            '@apply tw-text-base tw-font-bold tw-text-white': {},
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

      // Reglas específicas para sobrescribir cualquier estilo legacy
      addComponents({
        // Responsive específico para mobile
        '@media (max-width: 640px)': {
          '.cards-section, .tw-cards-section': {
            'grid-template-columns': 'repeat(1, minmax(260px, 1fr))',
            gap: '1rem',
            padding: '1.5rem 0',
          },
          '.card-custom, .tw-card-custom': {
            '@apply tw-h-36 tw-min-w-60': {},
          },
          '.card-custom:hover, .tw-card-custom:hover': {
            transform: 'translateY(-4px) scale(1.01)',
          },
          '.card-custom:hover .card-icon, .tw-card-custom:hover .tw-card-icon':
            {
              transform: 'translateY(-2px) scale(1.05)',
            },
          '.card-custom:hover .card-custom-title, .tw-card-custom:hover .tw-card-custom-title':
            {
              '@apply tw-text-sm': {},
            },
        },
        // Tablet responsive
        '@media (min-width: 641px) and (max-width: 1024px)': {
          '.cards-section, .tw-cards-section': {
            'grid-template-columns': 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          },
        },
        // Desktop responsive
        '@media (min-width: 1025px)': {
          '.cards-section, .tw-cards-section': {
            'grid-template-columns': 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          },
        },
      });
    }),
  ],
};
