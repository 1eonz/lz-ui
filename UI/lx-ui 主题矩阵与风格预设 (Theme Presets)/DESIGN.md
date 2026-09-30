---
name: Modern Enterprise Cockpit
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#414755'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727786'
  outline-variant: '#c1c6d7'
  surface-tint: '#0059c7'
  primary: '#0057c2'
  on-primary: '#ffffff'
  primary-container: '#006ef2'
  on-primary-container: '#fefcff'
  inverse-primary: '#afc6ff'
  secondary: '#006780'
  on-secondary: '#ffffff'
  secondary-container: '#76dcff'
  on-secondary-container: '#006077'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004398'
  secondary-fixed: '#b7eaff'
  secondary-fixed-dim: '#6cd3f7'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e61'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  theme-orange: '#F97316'
  theme-green: '#16A34A'
  theme-purple: '#7C3AED'
  theme-cyan: '#0891B2'
  theme-rose: '#E11D48'
  status-success: '#16A34A'
  status-warning: '#F59E0B'
  status-error: '#DC2626'
  status-info: '#2563EB'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

# lx-ui 组件库设计方案

> 版本：v0.1 初稿
> 目标：React PC 中后台内部 UI 组件库，服务 ERP/CRM/商城后台/工作台

## 设计原则

- 统一基础语言，3种风格预设（商务稳重 business、轻盈现代 soft、玻璃液态 glass）
- 6个主题色（海洋蓝 blue #1677FF、活力橙 orange #F97316、翡翠绿 green #16A34A、智慧紫 purple #7C3AED、清透青 cyan #0891B2、品牌玫红 rose #E11D48）
- 语义色：成功 #16A34A、警告 #F59E0B、错误 #DC2626、信息 #2563EB
- 密度模式：comfortable (默认40px控件)、compact (紧凑32px控件)
- 明暗模式：light / dark，配合 CSS 变量 --lx-*
- WCAG 2.2 AA 无障碍，明确焦点可见环
