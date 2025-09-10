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

  theme: {
    extend: {
      // Extensiones específicas del Landing
    },
  },

  plugins: [
    // Plugins específicos del Landing
  ],
};
