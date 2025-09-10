const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
const rnpnTailwindPreset = {
  // Prefijo temporal para coexistencia con PrimeNG
  prefix: 'tw-',

  // Configuración de purga/contenido base - será extendida por cada app
  content: [],

  // Safelist crítico para proteger clases dinámicas
  safelist: [
    // REMOVER: Ya no necesitamos proteger PrimeNG classes
    // { pattern: /^p-/ },
    // { pattern: /^pi-/ },

    // Clases Tailwind prefijadas con variantes comunes
    {
      pattern:
        /^tw-(bg|text|border)-(red|blue|green|gray|indigo)-(100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'focus', 'active', 'disabled', 'group-hover'],
    },
    {
      pattern: /^tw-(p|m|px|py|mx|my)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32)$/,
    },
    {
      pattern: /^tw-(flex|grid|hidden|block|inline|absolute|relative|fixed)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl', 'group-hover'],
    },
    // Proteger clases de grupo y hover de grupo
    'tw-group',
    'tw-group-hover:tw-opacity-100',
    'tw-group-hover:tw-visible',
    'tw-group-hover:tw-opacity-0',
    'tw-group-hover:tw-invisible',
    {
      pattern: /^tw-(opacity)-(0|10|20|30|40|50|60|70|80|90|100)$/,
      variants: ['hover', 'focus', 'group-hover'],
    },
    {
      pattern: /^tw-(visible|invisible)$/,
      variants: ['group-hover', 'hover', 'focus'],
    },
    {
      pattern:
        /^tw-(transition|duration|ease)-(all|opacity|transform|colors)(-100|-200|-300|-500|-700|-1000)?$/,
      variants: ['group-hover'],
    },
    // Clases específicas del proyecto RNPN
    'tw-text-rnpn-primary',
    'tw-bg-rnpn-primary',
    'tw-border-rnpn-primary',
    // Form validation states RNPN
    'tw-border-rnpn-primary-500',
    'focus:tw-ring-rnpn-primary-500',
    'focus:tw-border-rnpn-primary-500',
    // Stepper component RNPN colors
    'tw-bg-rnpn-primary-500',
    'tw-text-rnpn-primary-600',
    'hover:tw-border-rnpn-primary-400',
    'hover:tw-text-rnpn-primary-500',
    'hover:tw-text-rnpn-primary-600',
  ],

  theme: {
    extend: {
      // CSS Variables compartidas entre PrimeNG y Tailwind
      colors: {
        rnpn: {
          primary: {
            50: 'var(--rnpn-primary-50, #e1e4ff)',
            100: 'var(--rnpn-primary-100, #c3c9ff)',
            200: 'var(--rnpn-primary-200, #9aa5ff)',
            300: 'var(--rnpn-primary-300, #687eff)',
            400: 'var(--rnpn-primary-400, #2112c9)',
            500: 'var(--rnpn-primary-500, #050e5b)',
            600: 'var(--rnpn-primary-600, #040a48)',
            700: 'var(--rnpn-primary-700, #030735)',
            800: 'var(--rnpn-primary-800, #020422)',
            900: 'var(--rnpn-primary-900, #01010f)',
            DEFAULT: 'var(--rnpn-primary-500, #050e5b)',
          },
        },
        surface: {
          0: 'var(--surface-0, #ffffff)',
          50: 'var(--surface-50, #f8fafc)',
          100: 'var(--surface-100, #f1f5f9)',
          200: 'var(--surface-200, #e2e8f0)',
          300: 'var(--surface-300, #cbd5e1)',
          400: 'var(--surface-400, #94a3b8)',
          500: 'var(--surface-500, #64748b)',
          600: 'var(--surface-600, #475569)',
          700: 'var(--surface-700, #334155)',
          800: 'var(--surface-800, #1e293b)',
          900: 'var(--surface-900, #0f172a)',
          950: 'var(--surface-950, #020617)',
        },
      },

      fontFamily: {
        'museo-sans': [
          'MuseoSans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        sans: [
          'MuseoSans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ], // Default sans font
      },

      // Espaciado personalizado para coincidir con PrimeNG
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },

      // Shadows personalizados
      boxShadow: {
        rnpn: '0 5px 15px rgba(0, 0, 0, 0.08)',
        'rnpn-lg': '0 20px 40px rgba(0, 0, 0, 0.2)',
      },
    },
  },

  plugins: [
    // Plugin para componentes reutilizables
    plugin(function ({ addComponents }) {
      addComponents({
        // Botones estilo RNPN
        '.tw-btn-rnpn': {
          '@apply tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors tw-duration-200':
            {},
          'background-color': 'var(--rnpn-primary-500)',
          color: 'var(--surface-0)',
          '&:hover': {
            'background-color': 'var(--rnpn-primary-400)',
          },
          '&:disabled': {
            opacity: '0.6',
            cursor: 'not-allowed',
          },
        },

        '.tw-btn-rnpn-outline': {
          '@apply tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors tw-duration-200 tw-border-2':
            {},
          'border-color': 'var(--rnpn-primary-500)',
          color: 'var(--rnpn-primary-500)',
          'background-color': 'transparent',
          '&:hover': {
            'background-color': 'var(--rnpn-primary-500)',
            color: 'var(--surface-0)',
          },
        },

        // Cards estilo RNPN
        '.tw-card-rnpn': {
          '@apply tw-bg-white tw-rounded-lg tw-p-6 tw-border tw-border-gray-200':
            {},
          'box-shadow': 'var(--rnpn-shadow, 0 5px 15px rgba(0, 0, 0, 0.08))',
        },

        // Layout helpers
        '.tw-container-rnpn': {
          '@apply tw-w-full tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8':
            {},
        },
      });
    }),

    // Plugin para animaciones
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.tw-animate-fade-in': {
          animation: 'fadeIn 0.3s ease-in-out',
        },
        '.tw-animate-slide-up': {
          animation: 'slideUp 0.4s ease-out',
        },
      });

      addUtilities({
        '@keyframes fadeIn': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        '@keyframes slideUp': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      });
    }),
  ],
};

module.exports = rnpnTailwindPreset;
