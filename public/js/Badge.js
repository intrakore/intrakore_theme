/**
 * Intrakore Design System — Badge.js
 * Runtime utilities for Badge.vue.
 *
 * Replaces the classes computed in Badge.vue.
 * Depends on: custom.js (window.IK must be loaded first)
 *
 * Usage in Vue (replaces :class="classes"):
 *   import { getBadgeClasses, getBadgeSlotClasses } from './Badge.js'
 *
 *   const classes = computed(() =>
 *     getBadgeClasses({
 *       theme: props.theme,
 *       variant: props.variant,
 *       size: props.size,
 *     })
 *   )
 */

/* ── Valid values ────────────────────────────────────────────────────────────
   Mirrors BadgeProps from types.ts
   ─────────────────────────────────────────────────────────────────────────── */

const BADGE_THEMES   = ['gray', 'blueprint', 'blue', 'green', 'orange', 'red']
const BADGE_VARIANTS = ['solid', 'subtle', 'outline', 'ghost']
const BADGE_SIZES    = ['sm', 'md', 'lg', 'xl']

/* ── Token map ───────────────────────────────────────────────────────────────
   All color tokens used in Badge.css per theme × variant.
   ─────────────────────────────────────────────────────────────────────────── */

const BADGE_TOKENS = {
  gray: {
    solid:   { color: 'var(--ink-white)',       bg: 'var(--surface-gray-7)' },
    subtle:  { color: 'var(--ink-gray-6)',       bg: 'var(--surface-gray-2)' },
    outline: { color: 'var(--ink-gray-6)',       bg: 'transparent', border: 'var(--outline-gray-1)' },
    ghost:   { color: 'var(--ink-gray-6)',       bg: 'transparent' },
  },
  blueprint: {
    solid:   { color: 'var(--ink-blueprint-1)', bg: 'var(--surface-blueprint-7)' },
    subtle:  { color: 'var(--ink-blueprint-4)', bg: 'var(--surface-blueprint-2)' },
    outline: { color: 'var(--ink-blueprint-4)', bg: 'transparent', border: 'var(--outline-blueprint-2)' },
    ghost:   { color: 'var(--ink-blueprint-4)', bg: 'transparent' },
  },
  blue: {
    solid:   { color: 'var(--ink-blue-1)',      bg: 'var(--surface-blue-2)' },
    subtle:  { color: 'var(--ink-blue-2)',      bg: 'var(--surface-blue-2)' },
    outline: { color: 'var(--ink-blue-2)',      bg: 'transparent', border: 'var(--outline-blue-1)' },
    ghost:   { color: 'var(--ink-blue-2)',      bg: 'transparent' },
  },
  green: {
    solid:   { color: 'var(--ink-green-1)',     bg: 'var(--surface-green-3)' },
    subtle:  { color: 'var(--ink-green-3)',     bg: 'var(--surface-green-2)' },
    outline: { color: 'var(--ink-green-3)',     bg: 'transparent', border: 'var(--outline-green-2)' },
    ghost:   { color: 'var(--ink-green-3)',     bg: 'transparent' },
  },
  orange: {
    solid:   { color: 'var(--ink-amber-1)',     bg: 'var(--surface-amber-2)' },
    subtle:  { color: 'var(--ink-amber-3)',     bg: 'var(--surface-amber-1)' },
    outline: { color: 'var(--ink-amber-3)',     bg: 'transparent', border: 'var(--outline-amber-2)' },
    ghost:   { color: 'var(--ink-amber-3)',     bg: 'transparent' },
  },
  red: {
    solid:   { color: 'var(--ink-red-1)',       bg: 'var(--surface-red-4)' },
    subtle:  { color: 'var(--ink-red-4)',       bg: 'var(--surface-red-2)' },
    outline: { color: 'var(--ink-red-4)',       bg: 'transparent', border: 'var(--outline-red-2)' },
    ghost:   { color: 'var(--ink-red-4)',       bg: 'transparent' },
  },
}

/* ── Size token map ──────────────────────────────────────────────────────────
   Height, padding and font size per size value.
   ─────────────────────────────────────────────────────────────────────────── */

const BADGE_SIZE_TOKENS = {
  sm: { height: '1rem',    padding: '0 0.375rem', fontSize: 'var(--text-xs-size)'   },
  md: { height: '1.25rem', padding: '0 0.375rem', fontSize: 'var(--text-xs-size)'   },
  lg: { height: '1.5rem',  padding: '0 0.5rem',   fontSize: 'var(--text-sm-size)'   },
  xl: { height: '1.75rem', padding: '0 0.5rem',   fontSize: 'var(--text-base-size)' },
}

/* ── getBadgeClasses ─────────────────────────────────────────────────────────
   Replaces the classes computed in Badge.vue.

   Original:
     const classes = computed(() => {
       let variantClasses = { subtle: subtleClasses, solid: solidClasses, ... }[props.variant]
       let sizeClasses = { sm: 'h-4 text-xs px-1.5', ... }[props.size]
       return [variantClasses, sizeClasses]
     })

   Usage in Vue:
     :class="getBadgeClasses({ theme: props.theme, variant: props.variant, size: props.size })"
   ─────────────────────────────────────────────────────────────────────────── */

function getBadgeClasses({
  theme = 'gray',
  variant = 'subtle',
  size = 'md',
} = {}) {
  return [
    'ik-badge',
    `ik-badge--${size}`,
    `ik-badge--${theme}--${variant}`,
  ]
}

/* ── getBadgeSlotClasses ─────────────────────────────────────────────────────
   Replaces the inline :class on prefix/suffix slot wrappers.

   Original:
     :class="[props.size == 'lg' ? 'max-h-6' : 'max-h-4']"

   Usage in Vue:
     :class="getBadgeSlotClasses(props.size)"
   ─────────────────────────────────────────────────────────────────────────── */

function getBadgeSlotClasses(size = 'md') {
  return 'ik-badge__slot'
  // max-height is handled in CSS via .ik-badge--lg .ik-badge__slot
}

/* ── Class map ───────────────────────────────────────────────────────────────
   Original Tailwind → IK CSS class reference.
   ─────────────────────────────────────────────────────────────────────────── */

const BADGE_CLASS_MAP = {

  // Base
  'inline-flex select-none items-center gap-1 rounded-full whitespace-nowrap': 'ik-badge',

  // Sizes
  'h-4 text-xs px-1.5': 'ik-badge--sm',
  'h-5 text-xs px-1.5': 'ik-badge--md',
  'h-6 text-sm px-2':   'ik-badge--lg',
  'h-7 text-base px-2': 'ik-badge--xl',

  // Slot heights
  'max-h-6': 'ik-badge__slot',  // lg
  'max-h-4': 'ik-badge__slot',  // sm/md/xl

  // Blueprint theme (Intrakore brand)
  'text-ink-blueprint-1 bg-surface-blueprint-7': 'ik-badge--blueprint--solid',
  'text-ink-blueprint-4 bg-surface-blueprint-2': 'ik-badge--blueprint--subtle',
  'text-ink-blueprint-4 bg-transparent border border-outline-blueprint-2': 'ik-badge--blueprint--outline',
  'text-ink-blueprint-4 bg-transparent': 'ik-badge--blueprint--ghost',

  // Gray theme
  'text-ink-white bg-surface-gray-7':  'ik-badge--gray--solid',
  'text-ink-gray-6 bg-surface-gray-2': 'ik-badge--gray--subtle',
  'text-ink-gray-6 bg-transparent border border-outline-gray-1': 'ik-badge--gray--outline',
  'text-ink-gray-6 bg-transparent':    'ik-badge--gray--ghost',

  // Red theme
  'text-ink-red-1 bg-surface-red-4':   'ik-badge--red--solid',
  'text-ink-red-4 bg-surface-red-2':   'ik-badge--red--subtle',
  'text-ink-red-4 bg-transparent border border-outline-red-2': 'ik-badge--red--outline',
  'text-ink-red-4 bg-transparent':     'ik-badge--red--ghost',

  // Green theme
  'text-ink-green-1 bg-surface-green-3': 'ik-badge--green--solid',
  'text-ink-green-3 bg-surface-green-2': 'ik-badge--green--subtle',
  'text-ink-green-3 bg-transparent border border-outline-green-2': 'ik-badge--green--outline',
  'text-ink-green-3 bg-transparent':     'ik-badge--green--ghost',

  // Orange theme
  'text-ink-amber-1 bg-surface-amber-2': 'ik-badge--orange--solid',
  'text-ink-amber-3 bg-surface-amber-1': 'ik-badge--orange--subtle',
  'text-ink-amber-3 bg-transparent border border-outline-amber-2': 'ik-badge--orange--outline',
  'text-ink-amber-3 bg-transparent':     'ik-badge--orange--ghost',

  // Blue theme
  'text-ink-blue-1 bg-surface-blue-2': 'ik-badge--blue--solid',
  'text-ink-blue-2 bg-surface-blue-2': 'ik-badge--blue--subtle',
  'text-ink-blue-2 bg-transparent border border-outline-blue-1': 'ik-badge--blue--outline',
  'text-ink-blue-2 bg-transparent':    'ik-badge--blue--ghost',
}

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module:
     import { getBadgeClasses, getBadgeSlotClasses, BADGE_TOKENS } from './Badge.js'

   Global:
     window.IK.badge.getClasses({ theme: 'blueprint', variant: 'subtle', size: 'md' })
     window.IK.badge.tokens.blueprint.subtle
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.badge = {
    themes: BADGE_THEMES,
    variants: BADGE_VARIANTS,
    sizes: BADGE_SIZES,
    tokens: BADGE_TOKENS,
    sizeTokens: BADGE_SIZE_TOKENS,
    classMap: BADGE_CLASS_MAP,
    getClasses: getBadgeClasses,
    getSlotClasses: getBadgeSlotClasses,
  }
}

export {
  BADGE_THEMES,
  BADGE_VARIANTS,
  BADGE_SIZES,
  BADGE_TOKENS,
  BADGE_SIZE_TOKENS,
  BADGE_CLASS_MAP,
  getBadgeClasses,
  getBadgeSlotClasses,
}
