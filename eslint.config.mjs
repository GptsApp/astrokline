import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const sourceFiles = ['**/*.{js,jsx,ts,tsx,mjs,cjs}'];

export default [
  {
    ignores: [
      '.next/**',
      '.open-next/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'node_modules/**',
      'public/**',
      '.source/**',
      'scripts/**',
      'test*.js',
      'test*.ts',
      'refactor_kline.js',
      'next-env.d.ts',
      'src/config/db/migrations/**',
      'src/lib/astrology/astronomy-engine.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  {
    files: sourceFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      'prefer-const': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: sourceFiles,
    ...reactPlugin.configs.flat.recommended,
  },
  {
    files: sourceFiles,
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: sourceFiles,
    ...nextPlugin.configs['core-web-vitals'],
  },
  {
    files: sourceFiles,
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'no-empty-pattern': 'off',
      'no-useless-catch': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
