/**
 * Intrakore Design System — Button.js
 * Runtime class computation for Button.vue.
 *
 * Replaces the buttonClasses, slotClasses computed properties in Button.vue.
 * Depends on: custom.js (window.IK must be loaded first)
 *
 * Usage in Vue (replaces the entire buttonClasses computed):
 *   import { getButtonClasses, getSlotClasses, getLoadingClasses } from './Button.js'
 *
 *   const buttonClasses = computed(() =>
 *     getButtonClasses({
 *       theme: props.theme,
 *       variant: props.variant,
 *       size: props.size,
 *       isDisabled: isDisabled.value,
 *       isIconButton: isIconButton.value,
 *     })
 *   )
 */

/* ── Valid values ────────────────────────────────────────────────────────────
   Mirrors the TypeScript types from types.ts
   ─────────────────────────────────────────────────────────────────────────── */

const BUTTON_THEMES   = ['gray', 'blue', 'green', 'red', 'blueprint']
const BUTTON_VARIANTS = ['solid', 'subtle', 'outline', 'ghost']
const BUTTON_SIZES    = ['sm', 'md', 'lg', 'xl', '2xl']

/* ── Token map ───────────────────────────────────────────────────────────────
   All resolved CSS variable references used in Button.css.
   Useful for passing button colors into JS-driven elements.
   ─────────────────────────────────────────────────────────────────────────── */

const BUTTON_TOKENS = {
  // Blueprint theme (Intrakore primary)
  blueprint: {
    solid:   { color: 'var(--ink-blueprint-1)',  bg: 'var(--surface-blueprint-7)' },
    subtle:  { color: 'var(--ink-blueprint-4)',  bg: 'var(--surface-blueprint-2)' },
    outline: { color: 'var(--ink-blueprint-4)',  bg: 'var(--surface-white)', border: 'var(--outline-blueprint-2)' },
    ghost:   { color: 'var(--ink-blueprint-4)',  bg: 'transparent' },
    focus:   'var(--outline-blueprint-2)',
    disabled: { bg: 'var(--surface-blueprint-1)', color: 'var(--ink-blueprint-2)' },
  },
  // Gray theme
  gray: {
    solid:   { color: 'var(--ink-white)',   bg: 'var(--surface-gray-7)' },
    subtle:  { color: 'var(--ink-gray-8)',  bg: 'var(--surface-gray-2)' },
    outline: { color: 'var(--ink-gray-8)',  bg: 'var(--surface-white)', border: 'var(--outline-gray-2)' },
    ghost:   { color: 'var(--ink-gray-8)',  bg: 'transparent' },
    focus:   'var(--outline-gray-3)',
    disabled: { bg: 'var(--surface-gray-2)', color: 'var(--ink-gray-4)' },
  },
  // Blue theme
  blue: {
    solid:   { color: 'var(--ink-white)',   bg: 'var(--blue-500)' },
    subtle:  { color: 'var(--ink-blue-3)',  bg: 'var(--surface-blue-2)' },
    outline: { color: 'var(--ink-blue-3)',  bg: 'var(--surface-white)', border: 'var(--outline-blue-1)' },
    ghost:   { color: 'var(--ink-blue-3)',  bg: 'transparent' },
    focus:   'var(--blue-400)',
    disabled: { bg: 'var(--surface-blue-2)', color: 'var(--ink-blue-3)' },
  },
  // Green theme
  green: {
    solid:   { color: 'var(--ink-white)',   bg: 'var(--surface-green-3)' },
    subtle:  { color: 'var(--green-800)',   bg: 'var(--surface-green-2)' },
    outline: { color: 'var(--green-800)',   bg: 'var(--surface-white)', border: 'var(--outline-green-2)' },
    ghost:   { color: 'var(--green-800)',   bg: 'transparent' },
    focus:   'var(--outline-green-2)',
    disabled: { bg: 'var(--surface-green-2)', color: 'var(--ink-green-2)' },
  },
  // Red theme
  red: {
    solid:   { color: 'var(--ink-white)',  bg: 'var(--surface-red-5)' },
    subtle:  { color: 'var(--red-700)',    bg: 'var(--surface-red-2)' },
    outline: { color: 'var(--red-700)',    bg: 'var(--surface-white)', border: 'var(--outline-red-1)' },
    ghost:   { color: 'var(--red-700)',    bg: 'transparent' },
    focus:   'var(--outline-red-2)',
    disabled: { bg: 'var(--surface-red-2)', color: 'var(--ink-red-2)' },
  },
}

/* ── getButtonClasses ────────────────────────────────────────────────────────
   Main class computation function.
   Replaces the entire buttonClasses computed in Button.vue.

   Returns an array of CSS class strings to apply to <button>.

   @param {object} options
   @param {'gray'|'blue'|'green'|'red'|'blueprint'} options.theme
   @param {'solid'|'subtle'|'outline'|'ghost'} options.variant
   @param {'sm'|'md'|'lg'|'xl'|'2xl'} options.size
   @param {boolean} options.isDisabled
   @param {boolean} options.isIconButton
   @returns {string[]}
   ─────────────────────────────────────────────────────────────────────────── */

function getButtonClasses({
  theme = 'blueprint',
  variant = 'subtle',
  size = 'sm',
  isDisabled = false,
  isIconButton = false,
} = {}) {
  const classes = [
    'ik-btn',
    `ik-btn--${size}`,
    `ik-btn--${theme}--focus`,
  ]

  // Icon button modifier
  if (isIconButton) {
    classes.push('ik-btn--icon')
  }

  // Disabled or active variant
  if (isDisabled) {
    classes.push('ik-btn--disabled')
    classes.push(`ik-btn--${theme}--${variant}`)
  } else {
    classes.push(`ik-btn--${theme}--${variant}`)
  }

  return classes
}

/* ── getSlotClasses ──────────────────────────────────────────────────────────
   Returns the class for icon slots (prefix, suffix, icon).
   Replaces the slotClasses computed in Button.vue.

   Original:
     let classes = { sm: 'h-4', md: 'h-4.5', lg: 'h-5', xl: 'h-6', '2xl': 'h-6' }[props.size]

   Usage:
     :class="getSlotClasses(props.size)"
   ─────────────────────────────────────────────────────────────────────────── */

function getSlotClasses(size = 'sm') {
  return 'ik-btn__slot'
}

/* ── getLoadingClasses ───────────────────────────────────────────────────────
   Returns the class for the LoadingIndicator component inside button.
   Replaces the inline :class object on LoadingIndicator in Button.vue.

   Original:
     :class="{
       'h-3 w-3': size == 'sm',
       'h-[13.5px] w-[13.5px]': size == 'md',
       ...
     }"

   Usage:
     :class="getLoadingClasses(props.size)"
   ─────────────────────────────────────────────────────────────────────────── */

function getLoadingClasses(size = 'sm') {
  return `ik-btn__loading`
}

/* ── Class map ───────────────────────────────────────────────────────────────
   Full mapping of original Tailwind class strings → IK CSS classes.
   Reference for migration script.
   ─────────────────────────────────────────────────────────────────────────── */

const BUTTON_CLASS_MAP = {

  // Base
  'inline-flex items-center justify-center gap-2 transition-colors focus:outline-none shrink-0': 'ik-btn',

  // Sizes — text
  'h-7 text-base px-2 rounded':                      'ik-btn--sm',
  'h-8 text-base font-medium px-2.5 rounded':        'ik-btn--md',
  'h-10 text-lg font-medium px-3 rounded-md':        'ik-btn--lg',
  'h-11.5 text-xl font-medium px-3.5 rounded-lg':    'ik-btn--xl',
  'h-13 text-2xl font-medium px-3.5 rounded-xl':     'ik-btn--2xl',

  // Sizes — icon only
  'h-7 w-7 rounded':       'ik-btn--icon ik-btn--sm',
  'h-8 w-8 rounded':       'ik-btn--icon ik-btn--md',
  'h-10 w-10 rounded-md':  'ik-btn--icon ik-btn--lg',
  'h-11.5 w-11.5 rounded-lg': 'ik-btn--icon ik-btn--xl',
  'h-13 w-13 rounded-xl':  'ik-btn--icon ik-btn--2xl',

  // Slot / icon sizes
  'h-4':   'ik-btn__slot',
  'h-4.5': 'ik-btn__slot',
  'h-5':   'ik-btn__slot',
  'h-6':   'ik-btn__slot',

  // Loading sizes
  'h-3 w-3':                 'ik-btn__loading',
  'h-[13.5px] w-[13.5px]':   'ik-btn__loading',
  'h-[15px] w-[15px]':       'ik-btn__loading',
  'h-4.5 w-4.5':             'ik-btn__loading',

  // Blueprint theme (Intrakore default)
  'text-ink-blueprint-1 bg-surface-blueprint-7 hover:bg-surface-blueprint-6 active:bg-surface-blueprint-5': 'ik-btn--blueprint--solid',
  'text-ink-blueprint-4 bg-surface-blueprint-2 hover:bg-surface-blueprint-3 active:bg-surface-blueprint-4': 'ik-btn--blueprint--subtle',
  'text-ink-blueprint-4 bg-surface-white border border-outline-blueprint-2 hover:border-outline-blueprint-3 active:border-outline-blueprint-4 active:bg-surface-blueprint-3': 'ik-btn--blueprint--outline',
  'text-ink-blueprint-4 bg-transparent hover:bg-surface-blueprint-2 active:bg-surface-blueprint-3': 'ik-btn--blueprint--ghost',
  'focus-visible:ring focus-visible:ring-outline-blueprint-2': 'ik-btn--blueprint--focus',
  'bg-surface-blueprint-1 text-ink-blueprint-2': 'ik-btn--blueprint--solid ik-btn--disabled',
  'bg-surface-blueprint-1 text-ink-blueprint-2 border border-outline-blueprint-1': 'ik-btn--blueprint--outline ik-btn--disabled',

  // Gray theme
  'text-ink-white bg-surface-gray-7 hover:bg-surface-gray-6 active:bg-surface-gray-5': 'ik-btn--gray--solid',
  'text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4': 'ik-btn--gray--subtle',
  'text-ink-gray-8 bg-surface-white border border-outline-gray-2 hover:border-outline-gray-3 active:border-outline-gray-3 active:bg-surface-gray-4': 'ik-btn--gray--outline',
  'text-ink-gray-8 bg-transparent hover:bg-surface-gray-3 active:bg-surface-gray-4': 'ik-btn--gray--ghost',
  'focus-visible:ring focus-visible:ring-outline-gray-3': 'ik-btn--gray--focus',

  // Red theme
  'text-ink-white bg-surface-red-5 hover:bg-surface-red-6 active:bg-surface-red-7': 'ik-btn--red--solid',
  'text-red-700 bg-surface-red-2 hover:bg-surface-red-3 active:bg-surface-red-4': 'ik-btn--red--subtle',
  'text-red-700 bg-surface-white border border-outline-red-1 hover:border-outline-red-2 active:border-outline-red-2 active:bg-surface-red-3': 'ik-btn--red--outline',
  'text-red-700 bg-transparent hover:bg-surface-red-3 active:bg-surface-red-4': 'ik-btn--red--ghost',
  'focus-visible:ring focus-visible:ring-outline-red-2': 'ik-btn--red--focus',
}

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module (Vue SPA):
     import { getButtonClasses, getSlotClasses, getLoadingClasses, BUTTON_TOKENS } from './Button.js'

   Global (hooks.py):
     window.IK.button.getClasses({ theme: 'blueprint', variant: 'solid', size: 'sm' })
     window.IK.button.tokens.blueprint.solid
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.button = {
    themes: BUTTON_THEMES,
    variants: BUTTON_VARIANTS,
    sizes: BUTTON_SIZES,
    tokens: BUTTON_TOKENS,
    getClasses: getButtonClasses,
    getSlotClasses,
    getLoadingClasses,
    classMap: BUTTON_CLASS_MAP,
  }
}

export {
  BUTTON_THEMES,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  BUTTON_TOKENS,
  BUTTON_CLASS_MAP,
  getButtonClasses,
  getSlotClasses,
  getLoadingClasses,
}
