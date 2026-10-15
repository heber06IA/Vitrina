import js from '@eslint/js';
import globals from 'globals';

export default [
  // Generated bundles and dependencies are not linted; edit src/js/ instead.
  { ignores: ['assets/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['tests/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'none' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      // DOM text is set with textContent; innerHTML would reopen the door to XSS.
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Usa textContent o los helpers de marketplace/dom.js.' },
        { property: 'outerHTML', message: 'Usa textContent o los helpers de marketplace/dom.js.' },
      ],
    },
  },
];
