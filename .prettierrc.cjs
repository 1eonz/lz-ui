/**
 * 统一格式的目的不是让代码“看起来整齐”这么简单。
 * 固定的换行、引号和尾逗号可以减少无意义的 diff，让评审把注意力放在行为变化上。
 */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
};
