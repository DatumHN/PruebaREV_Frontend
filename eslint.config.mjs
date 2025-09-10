import babelParser from '@babel/eslint-parser';
import nx from '@nx/eslint-plugin';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },

  // All TypeScript/JavaScript related rules and parser options are in one block
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.cts',
      '**/*.mts',
    ],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-typescript', '@babel/preset-env'],
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties'],
          ],
        },
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            'libs/src/lib/routing/**',
            '.*tailwind.*config.*js$', // Allow tailwind config files
          ],
          checkDynamicDependenciesExceptions: ['routing', 'registry'],
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
                'scope:feature',
                'scope:ui',
                'scope:data',
                'scope:util',
                'scope:app', // Allow routing library to import from apps for microfrontend routing
              ],
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: [
                'scope:ui',
                'scope:data',
                'scope:util',
              ],
            },
            {
              sourceTag: 'scope:data',
              onlyDependOnLibsWithTags: ['scope:data', 'scope:util'],
            },
            {
              sourceTag: 'scope:util',
              onlyDependOnLibsWithTags: ['scope:util'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['libs/src/lib/routing/routing.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
];
