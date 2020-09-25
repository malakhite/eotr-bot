module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'import/extensions': [
      'error',
      {
        ignorePackages: true,
        pattern: {
          ts: 'never',
        },
      },
    ],
    'import/prefer-default-export': 'off',
    semi: 'off',
    '@typescript-eslint/semi': 'error',
  },
};
