/**
 * Intrakore Design System — Sidebar.js
 * Runtime token values for the Sidebar component family.
 *
 * Covers: Sidebar · SidebarHeader · SidebarItem · SidebarSection
 *
 * Depends on: custom.js (window.IK must be loaded first)
 * Load order in hooks.py:
 *   app_include_js = ["custom.js", "Sidebar.js"]
 *
 * Usage in Vue (when not using CSS classes):
 *   import { SIDEBAR_TOKENS, getSidebarToken } from './Sidebar.js'
 */

/* ── Token map ───────────────────────────────────────────────────────────────
   These mirror the CSS custom properties used in Sidebar.css.
   Useful for passing colors into canvas, charts, or JS-rendered elements
   that cannot use CSS variables directly.
   ─────────────────────────────────────────────────────────────────────────── */

const SIDEBAR_TOKENS = {

  /* Colors */
  background:        'var(--surface-menu-bar)',
  borderColor:       'var(--outline-blueprint-1)',

  /* Item states */
  itemActive:        'var(--surface-blueprint-7)',
  itemHover:         'var(--surface-blueprint-6)',

  /* Header states */
  headerOpen:        'var(--surface-blueprint-7)',
  headerHover:       'var(--surface-blueprint-6)',
  logoFallbackBg:    'var(--surface-blueprint-7)',

  /* Text & icons */
  textColor:         'var(--ink-blueprint-1)',
  iconColor:         'var(--ink-blueprint-1)',

  /* Section divider */
  dividerColor:      'var(--outline-blueprint-2)',

  /* Shadows */
  shadowActive:      'var(--shadow-sm)',

  /* Sizing */
  widthExpanded:     '15rem',   /* 240px — w-60 */
  widthCollapsed:    '3rem',    /* 48px  — w-12 */
  headerHeight:      '3rem',   /* 48px  — h-12 */
  logoSize:          '2rem',    /* 32px  — w-8 h-8 */
  iconSize:          '1rem',    /* 16px  — size-4 */

  /* Transitions */
  transitionDuration:  '300ms',
  transitionEasing:    'ease-in-out',
  sectionEasingLeave:  'cubic-bezier(0, 1, 0.5, 1)',
  sectionMaxHeight:    '200px',

  /* Typography */
  titleSize:    'var(--text-base-size)',   /* 14px */
  subtitleSize: 'var(--text-sm-size)',     /* 13px */
  labelSize:    'var(--text-sm-size)',     /* 13px */
  suffixSize:   'var(--text-sm-size)',     /* 13px */
}

/* ── Resolved token getter ───────────────────────────────────────────────────
   Resolves a sidebar token to its actual hex/px value using window.IK.
   Falls back to the CSS variable string if IK is not loaded.

   Usage:
     getSidebarToken('itemActive')
     // → '#000FCC' in light mode, '#000B99' in dark mode
   ─────────────────────────────────────────────────────────────────────────── */

function getSidebarToken(key) {
  const token = SIDEBAR_TOKENS[key]
  if (!token) {
    console.warn(`[Sidebar.js] Unknown token key: "${key}"`)
    return null
  }

  // If it's a CSS variable reference, resolve via IK if available
  if (token.startsWith('var(--') && typeof window !== 'undefined' && window.IK) {
    const varName = token.replace(/^var\(--/, '').replace(/\)$/, '')
    const el = document.documentElement
    const resolved = getComputedStyle(el).getPropertyValue(`--${varName}`).trim()
    return resolved || token
  }

  return token
}

/* ── CSS class map ───────────────────────────────────────────────────────────
   Maps original Tailwind classes from the Vue templates to their
   Intrakore CSS equivalents. Used by the class migration script.
   ─────────────────────────────────────────────────────────────────────────── */

const SIDEBAR_CLASS_MAP = {

  // Sidebar root
  'flex h-full flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-outline-blueprint-1 bg-surface-menu-bar transition-all duration-300 ease-in-out p-2': 'ik-sidebar',
  'w-60': 'ik-sidebar--expanded',
  'w-12': 'ik-sidebar--collapsed',
  'mt-auto flex flex-col gap-2': 'ik-sidebar__footer',

  // Sidebar collapse icon
  'size-4 text-ink-blueprint-1 duration-300 ease-in-out': 'ik-sidebar__collapse-icon',
  'rotate-180': 'ik-sidebar__collapse-icon--rotated',

  // SidebarHeader trigger
  'flex h-12 items-center rounded-md py-2 duration-300 ease-in-out w-[14rem]': 'ik-sidebar-header__trigger',
  'w-auto px-0': 'ik-sidebar-header__trigger--collapsed',
  'bg-surface-blueprint-7 px-2 shadow-sm': 'ik-sidebar-header__trigger--open',
  'hover:bg-surface-blueprint-6 px-2': 'ik-sidebar-header__trigger--expanded',

  // SidebarHeader logo
  'w-8 h-8 rounded overflow-hidden': 'ik-sidebar-header__logo',
  'w-full h-full object-cover': 'ik-sidebar-header__logo img',
  'w-full h-full bg-surface-blueprint-7 flex items-center justify-center text-ink-blueprint-1': 'ik-sidebar-header__logo-fallback',

  // SidebarHeader text
  'flex flex-1 flex-col text-left duration-300 ease-in-out truncate': 'ik-sidebar-header__text',
  'ml-2 w-auto opacity-100': 'ik-sidebar-header__text--visible',
  'ml-0 w-0 overflow-hidden opacity-0': 'ik-sidebar-header__text--hidden',
  'text-base font-medium text-ink-blueprint-1 leading-none': 'ik-sidebar-header__title',
  'mt-1 text-sm text-ink-blueprint-1 leading-none': 'ik-sidebar-header__subtitle',

  // SidebarHeader chevron
  'h-4 w-4 text-ink-blueprint-1': 'ik-sidebar-header__chevron',

  // SidebarItem
  '!w-full focus-visible:ring-0 focus:outline-none': 'ik-sidebar-item',
  '!bg-surface-blueprint-7 shadow-sm': 'ik-sidebar-item--active',
  'hover:bg-surface-blueprint-6': 'ik-sidebar-item--hover',
  'flex w-full items-center justify-between transition-all ease-in-out px-2 py-1': 'ik-sidebar-item__inner',
  'flex items-center truncate': 'ik-sidebar-item__left',
  'grid flex-shrink-0 place-items-center': 'ik-sidebar-item__icon-wrapper',
  'size-4 text-ink-blueprint-1': 'ik-sidebar-item__icon',
  'flex-1 flex-shrink-0 truncate text-sm text-ink-blueprint-1 transition-all ease-in-out': 'ik-sidebar-item__label',
  'ml-2 w-auto opacity-100 [label]': 'ik-sidebar-item__label--visible',
  'ml-0 w-0 overflow-hidden opacity-0 [label]': 'ik-sidebar-item__label--hidden',
  'transition-all ease-in-out [suffix]': 'ik-sidebar-item__suffix',
  'ml-auto w-auto opacity-100': 'ik-sidebar-item__suffix--visible',
  'text-sm text-ink-blueprint-1': 'ik-sidebar-item__suffix-text',

  // SidebarSection
  'flex flex-col mt-2': 'ik-sidebar-section',
  'relative flex items-center gap-1 px-2 py-1.5': 'ik-sidebar-section__header',
  'cursor-pointer': 'ik-sidebar-section__header--collapsible',
  'h-4 text-sm text-ink-blueprint-1 transition-all duration-300 ease-in-out': 'ik-sidebar-section__label',
  'w-auto opacity-100 [section]': 'ik-sidebar-section__label--visible',
  'w-0 overflow-hidden opacity-0 [section]': 'ik-sidebar-section__label--hidden',
  'w-4 h-4 text-ink-blueprint-1 transition-all duration-300 ease-in-out': 'ik-sidebar-section__chevron',
  'rotate-90': 'ik-sidebar-section__chevron--open',
  'absolute top-0 left-0 flex h-full w-full items-center justify-center transition-all duration-300 ease-in-out': 'ik-sidebar-section__divider-wrap',
  'opacity-100 [divider]': 'ik-sidebar-section__divider-wrap--visible',
  'opacity-0 [divider]': 'ik-sidebar-section__divider-wrap--hidden',
  'w-full border-t border-outline-blueprint-2': 'ik-sidebar-section__divider',
  'space-y-0.5': 'ik-sidebar-section__nav',
}

/* ── Vue transition class map ────────────────────────────────────────────────
   Maps Vue <transition> inline class strings to Intrakore CSS classes.
   Update your SidebarSection.vue <transition> block to use these.
   ─────────────────────────────────────────────────────────────────────────── */

const SIDEBAR_TRANSITION_CLASSES = {
  enterActiveClass: 'ik-sidebar-section-enter-active',
  leaveActiveClass: 'ik-sidebar-section-leave-active',
  enterFromClass:   'ik-sidebar-section-enter-from',
  leaveToClass:     'ik-sidebar-section-leave-to',
  enterToClass:     'ik-sidebar-section-enter-to',
  leaveFromClass:   'ik-sidebar-section-leave-from',
}

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module (for Vue SPA / intrakore-ui):
     import { SIDEBAR_TOKENS, getSidebarToken, SIDEBAR_CLASS_MAP } from './Sidebar.js'

   Global (loaded via hooks.py):
     window.IK.sidebar.tokens
     window.IK.sidebar.getToken('itemActive')
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.sidebar = {
    tokens: SIDEBAR_TOKENS,
    getToken: getSidebarToken,
    classMap: SIDEBAR_CLASS_MAP,
    transitionClasses: SIDEBAR_TRANSITION_CLASSES,
  }
}

export {
  SIDEBAR_TOKENS,
  getSidebarToken,
  SIDEBAR_CLASS_MAP,
  SIDEBAR_TRANSITION_CLASSES,
}
