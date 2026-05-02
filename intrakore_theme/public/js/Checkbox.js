/**
 * Intrakore Design System — Checkbox.js
 * Runtime utilities for Checkbox.vue.
 *
 * Replaces:
 *   - inputClasses computed
 *   - labelClasses computed
 *   - wrapper :class bindings
 *
 * Depends on: custom.js (window.IK must be loaded first)
 */

/* ── Token map ───────────────────────────────────────────────────────────────
   All color tokens used in Checkbox.css.
   ─────────────────────────────────────────────────────────────────────────── */

const CHECKBOX_TOKENS = {
  /* Wrapper interactive states */
  wrapperHoverBg:       'var(--surface-blueprint-2)',
  wrapperFocusBg:       'var(--surface-blueprint-3)',
  wrapperActiveBg:      'var(--surface-blueprint-3)',
  wrapperFocusRing:     'var(--outline-blueprint-2)',

  /* Input enabled */
  inputBorder:          'var(--outline-blueprint-4)',
  inputHoverBorder:     'var(--outline-blueprint-3)',
  inputColor:           'var(--blueprint-500)',
  inputBg:              'var(--surface-white)',

  /* Input disabled */
  inputDisabledBorder:  'var(--outline-blueprint-1)',
  inputDisabledBg:      'var(--surface-blueprint-2)',
  inputDisabledColor:   'var(--ink-blueprint-1)',

  /* Input standalone (no padding wrapper) */
  inputActiveBg:        'var(--surface-blueprint-1)',
  inputFocusRing:       'var(--outline-blueprint-2)',

  /* Label */
  labelEnabledColor:    'var(--ink-blueprint-4)',
  labelDisabledColor:   'var(--ink-blueprint-2)',
}

/* ── getWrapperClasses ───────────────────────────────────────────────────────
   Replaces the wrapper :class bindings in Checkbox.vue.

   Original:
     :class="{
       'px-2.5 py-1.5': padding && size === 'sm',
       'px-3 py-2': padding && size === 'md',
       'focus-within:bg-surface-blueprint-3 ...': padding && !disabled,
     }"

   Usage in Vue:
     :class="getCheckboxWrapperClasses({ size, padding, disabled })"
   ─────────────────────────────────────────────────────────────────────────── */

function getCheckboxWrapperClasses({
  size = 'sm',
  padding = false,
  disabled = false,
} = {}) {
  const classes = ['ik-checkbox-wrapper']

  if (padding) {
    classes.push(
      size === 'sm'
        ? 'ik-checkbox-wrapper--padded-sm'
        : 'ik-checkbox-wrapper--padded-md'
    )
    if (!disabled) {
      classes.push('ik-checkbox-wrapper--interactive')
    }
  }

  return classes
}

/* ── getInputClasses ─────────────────────────────────────────────────────────
   Replaces the inputClasses computed in Checkbox.vue.

   Original:
     const inputClasses = computed(() => {
       let baseClasses    = disabled ? '...' : '...'
       let interactionClasses = disabled ? '' : padding ? 'focus:ring-0' : '...'
       let sizeClasses    = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4' }[props.size]
       return [baseClasses, interactionClasses, sizeClasses]
     })

   Usage in Vue:
     :class="getCheckboxInputClasses({ size, padding, disabled })"
   ─────────────────────────────────────────────────────────────────────────── */

function getCheckboxInputClasses({
  size = 'sm',
  padding = false,
  disabled = false,
} = {}) {
  const classes = [
    'ik-checkbox',
    `ik-checkbox--${size}`,
  ]

  if (disabled) {
    classes.push('ik-checkbox--disabled')
  } else {
    classes.push('ik-checkbox--enabled')
    // standalone = no padding wrapper — input handles its own focus ring
    classes.push(padding ? 'ik-checkbox--padded' : 'ik-checkbox--standalone')
  }

  return classes
}

/* ── getLabelClasses ─────────────────────────────────────────────────────────
   Replaces the labelClasses computed in Checkbox.vue.

   Original:
     const labelClasses = computed(() => {
       return [
         { sm: 'text-base font-medium', md: 'text-lg font-medium' }[props.size],
         props.disabled ? 'text-ink-blueprint-2' : 'text-ink-blueprint-4',
         'select-none',
       ]
     })

   Usage in Vue:
     :class="getCheckboxLabelClasses({ size, disabled })"
   ─────────────────────────────────────────────────────────────────────────── */

function getCheckboxLabelClasses({ size = 'sm', disabled = false } = {}) {
  return [
    'ik-checkbox__label',
    `ik-checkbox__label--${size}`,
    disabled ? 'ik-checkbox__label--disabled' : 'ik-checkbox__label--enabled',
  ]
}

/* ── Class map ───────────────────────────────────────────────────────────────
   Original Tailwind → IK CSS class reference.
   ─────────────────────────────────────────────────────────────────────────── */

const CHECKBOX_CLASS_MAP = {

  // Wrapper base
  'inline-flex gap-2 rounded transition': 'ik-checkbox-wrapper',

  // Wrapper padding
  'px-2.5 py-1.5': 'ik-checkbox-wrapper--padded-sm',
  'px-3 py-2':     'ik-checkbox-wrapper--padded-md',

  // Wrapper interactive
  'focus-within:bg-surface-blueprint-3 focus-within:ring-2 focus-within:ring-outline-blueprint-2 hover:bg-surface-blueprint-2 active:bg-surface-blueprint-3':
    'ik-checkbox-wrapper--interactive',

  // Input base
  'rounded-sm mt-[1px] bg-surface-white': 'ik-checkbox',

  // Input sizes
  'w-3.5 h-3.5': 'ik-checkbox--sm',
  'w-4 h-4':     'ik-checkbox--md',

  // Input enabled
  'border-outline-blueprint-4 text-blueprint-500 hover:border-outline-blueprint-3 hover:text-blueprint-500 focus:ring-offset-0 focus:border-outline-blueprint-4 active:border-outline-blueprint-4 active:text-blueprint-500 transition':
    'ik-checkbox--enabled',

  // Input disabled
  'border-outline-blueprint-1 bg-surface-blueprint-2 text-ink-blueprint-1':
    'ik-checkbox--disabled',

  // Input interaction modes
  'focus:ring-0': 'ik-checkbox--padded',
  'hover:shadow-sm focus:ring-0 focus-visible:ring-2 focus-visible:ring-outline-blueprint-2 active:bg-surface-blueprint-1':
    'ik-checkbox--standalone',

  // Label base
  'block select-none': 'ik-checkbox__label',

  // Label sizes
  'text-base font-medium': 'ik-checkbox__label--sm',
  'text-lg font-medium':   'ik-checkbox__label--md',

  // Label states
  'text-ink-blueprint-4': 'ik-checkbox__label--enabled',
  'text-ink-blueprint-2': 'ik-checkbox__label--disabled',
}

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module:
     import {
       getCheckboxWrapperClasses,
       getCheckboxInputClasses,
       getCheckboxLabelClasses,
       CHECKBOX_TOKENS,
     } from './Checkbox.js'

   Global:
     window.IK.checkbox.getWrapperClasses({ size: 'sm', padding: true, disabled: false })
     window.IK.checkbox.getInputClasses({ size: 'md', padding: false, disabled: true })
     window.IK.checkbox.getLabelClasses({ size: 'sm', disabled: false })
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.checkbox = {
    tokens: CHECKBOX_TOKENS,
    classMap: CHECKBOX_CLASS_MAP,
    getWrapperClasses: getCheckboxWrapperClasses,
    getInputClasses:   getCheckboxInputClasses,
    getLabelClasses:   getCheckboxLabelClasses,
  }
}

export {
  CHECKBOX_TOKENS,
  CHECKBOX_CLASS_MAP,
  getCheckboxWrapperClasses,
  getCheckboxInputClasses,
  getCheckboxLabelClasses,
}
