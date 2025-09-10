const {createGlobPatternsForDependencies} = require('@nx/angular/tailwind');
const {join} = require('path');
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
    // Include all microfrontend source files for Module Federation
    join(__dirname, '../landing/src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../auth/src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../registry/src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../admin/src/**/!(*.stories|*.spec).{ts,html}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [

    plugin(function ({addComponents, theme}) {
      addComponents({
        '.cards-section': {
          '@apply flex flex-wrap gap-4 py-5 w-full max-w-4xl mx-auto': {},
        },
        '.card-custom': {
          '@apply flex-grow flex-shrink-0 transition-all duration-300 ease-in-out border-none rounded-2xl cursor-pointer relative overflow-hidden h-36 flex items-center justify-center z-10':
            {},
          'flex-basis': '200px',
          background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
          'box-shadow': '0 5px 15px rgba(0, 0, 0, 0.08)',
          'background-size': '200% 100%',
          'background-position': 'left center',
          animation: 'slideInUp 0.6s ease-out both',

          '&:hover': {
            'flex-grow': '6',
            'background-image':
              'linear-gradient(to right, #2112c9 0%, #687eff 51%, #050e5b 100%)',
            'background-position': 'right center',
            'box-shadow': '0 20px 40px rgba(0, 0, 0, 0.2)',
            'z-index': '50',
          },
        },
        '.card-custom-body': {
          '@apply flex flex-col items-center justify-center text-center px-4 py-5 relative z-20 transition-all duration-300 h-full':
            {},
          color: 'rgb(5, 14, 91)',
        },
        '.card-custom:hover .card-custom-body': {
          '@apply text-white': {},
        },
        '.card-icon': {
          '@apply flex items-center justify-center mb-2 transition-all duration-300 mx-auto':
            {},
        },
        '.card-custom:hover .card-icon': {
          transform: 'translateY(-2px) scale(1)',
        },
        '.card-custom-title': {
          '@apply text-sm font-semibold leading-tight m-0 flex justify-center items-center transition-all duration-300':
            {},
          'min-height': '40px',
        },
        '.card-custom:hover .card-custom-title': {
          '@apply text-white text-base font-bold': {},
        },
        '.miss-image': {
          '@apply max-w-full h-auto': {},
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

      plugin(function ({addComponents}) {
        addComponents({
          '@media (max-width: 768px)': {
            '.cards-section': {
              '@apply flex-col': {},
            },
            '.card-custom': {
              '@apply h-32': {},
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
              '@apply text-xs': {},
            },
            '.miss-image': {
              '@apply mt-8': {},
            },
          },
        });
      })

    }),],
};
