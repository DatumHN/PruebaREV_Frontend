import nx from '@nx/eslint-plugin';
import eslintPluginPrettier from 'eslint-plugin-prettier';

import baseConfig from '../../eslint.config.mjs';

export default [
  // This object contains the global ignores
  {
    ignores: ['**/*.spec.ts', '**/test-setup.ts'],
  },

  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],

  // Consolidate the Prettier and TypeScript rules into one object
  {
    files: ['**/*.ts'],
    // Remove the languageOptions block here, as it's handled by the base file
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: [
                'scope:feature',
                'scope:ui',
                'scope:data',
                'scope:util',
              ],
            },
            {
              sourceTag: 'scope:feature',
              onlyDependOnLibsWithTags: [
                'scope:ui',
                'scope:data',
                'scope:util',
              ],
            },
            { sourceTag: 'scope:ui', onlyDependOnLibsWithTags: ['scope:util'] },
            {
              sourceTag: 'scope:data',
              onlyDependOnLibsWithTags: ['scope:util'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
];
