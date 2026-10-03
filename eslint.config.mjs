import noUnsanitized from 'eslint-plugin-no-unsanitized';
export default [{
  files: ['**/*.js'],
  plugins: {'no-unsanitized': noUnsanitized},
  rules: {
    'no-unsanitized/property': 'error',
    'no-unsanitized/method': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  }
}];
