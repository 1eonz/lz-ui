/**
 * 这里使用 ESLint 8 的配置格式，原因是 Dumi/Father 生态中仍有大量插件依赖这一格式。
 * 升级到 ESLint 9 时，需要一次性验证 dumi、father 和 TypeScript parser 的兼容性，
 * 不在组件开发中途拆分 lint 配置，避免出现“规则变了但组件代码没变”的噪音。
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: [
    'dist',
    'docs-dist',
    'coverage',
    'playwright-report',
    'test-results',
    'node_modules',
    '*.config.cjs',
  ],
};
