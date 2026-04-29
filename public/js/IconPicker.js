/**
 * Intrakore Design System — IconPicker.js
 * Runtime utilities for the Icon component family.
 *
 * Covers: IconPicker.vue · Icon.vue · spritePlugin.ts
 *         + all custom SVG icons in /icons/
 *
 * Depends on: custom.js (window.IK must be loaded first)
 */

/* ── Token map ───────────────────────────────────────────────────────────────
   Color tokens used in IconPicker component.
   ─────────────────────────────────────────────────────────────────────────── */

const ICON_PICKER_TOKENS = {
  /* Input */
  inputTextColor:       'var(--ink-gray-8)',
  inputPlaceholder:     'var(--ink-gray-4)',

  /* Trigger */
  triggerIconColor:     'var(--ink-gray-5)',

  /* Variants */
  subtleBg:             'var(--surface-gray-2)',
  subtleHoverBg:        'var(--surface-gray-3)',
  outlineBorder:        'var(--outline-gray-2)',
  focusBorder:          'var(--outline-gray-4)',
  focusRing:            'var(--outline-gray-3)',

  /* Dropdown */
  dropdownBg:           'var(--surface-modal)',
  dropdownShadow:       'var(--shadow-2xl)',
  emptyTextColor:       'var(--ink-gray-5)',

  /* Icon grid */
  iconBtnHoverBg:       'var(--surface-gray-3)',
  iconBtnSelectedBg:    'var(--surface-gray-3)',
}

/* ── Variant class map ───────────────────────────────────────────────────────
   Replaces the variantClasses computed in IconPicker.vue.

   Original computed:
     const variantClasses = computed(() => {
       const borderCss = 'border focus-within:border-outline-gray-4 ...'
       return { subtle: `${borderCss} bg-surface-gray-2 ...`, ... }[props.variant]
     })

   Usage in Vue:
     :class="IK_ICON_PICKER_VARIANTS[props.variant]"
   ─────────────────────────────────────────────────────────────────────────── */

const IK_ICON_PICKER_VARIANTS = {
  subtle:  'ik-icon-picker__anchor--subtle',
  outline: 'ik-icon-picker__anchor--outline',
  ghost:   'ik-icon-picker__anchor--ghost',
}

/* ── Custom icon registry ────────────────────────────────────────────────────
   Documents every icon in /icons/index.ts — what it is, whether it can be
   replaced by Lucide, and what the replacement is.

   KEEP = must stay as custom SVG
   REPLACE = safe to swap to Lucide via Icon.vue + spritePlugin
   ─────────────────────────────────────────────────────────────────────────── */

const IK_CUSTOM_ICONS = {

  /**
   * CircleCheckIcon.vue
   * Filled circle with checkmark — 16×16 — fill=currentColor
   * Lucide has `circle-check` but it is STROKE, not filled.
   * Decision: KEEP if filled style is required for brand consistency.
   *           REPLACE if stroke is acceptable.
   *
   * Lucide replacement:
   *   <Icon name="circle-check" class="ik-icon ik-icon--sm" />
   */
  CircleCheckIcon: {
    action: 'KEEP or REPLACE',
    lucideName: 'circle-check',
    style: 'filled',
    lucideStyle: 'stroke',
    note: 'Lucide version is stroke. Visually different. Confirm with design.',
  },

  /**
   * DownSolidIcon.vue
   * Filled solid triangle/chevron pointing down — 16×16 — fill=currentColor
   * Used in: ListGroupHeader.vue (group collapse toggle)
   * Lucide only has stroke chevron-down — NO filled triangle equivalent.
   * Decision: KEEP — no suitable Lucide replacement.
   *
   * Already imported in ListGroupHeader.vue as:
   *   import DownSolid from '../../../icons/DownSolidIcon.vue'
   * Keep this import as-is.
   */
  DownSolidIcon: {
    action: 'KEEP',
    lucideName: null,
    style: 'filled triangle',
    lucideStyle: null,
    note: 'No Lucide equivalent. Lucide chevron-down is stroke, not filled triangle.',
  },

  /**
   * GreenCheckIcon.vue
   * Green filled circle with white stroke checkmark — 32×32
   * Has HARDCODED color: fill="#59B179" (= Clearing 500)
   * Decision: KEEP but update hardcoded color to CSS variable.
   *
   * Fix in GreenCheckIcon.vue — replace:
   *   fill="#59B179"
   * with:
   *   :fill="'var(--clearing-500)'"   (Vue binding)
   * or in plain SVG:
   *   fill="var(--clearing-500)"
   */
  GreenCheckIcon: {
    action: 'KEEP + FIX COLOR',
    lucideName: null,
    style: 'filled colored circle',
    hardcodedColor: '#59B179',
    tokenReplacement: 'var(--clearing-500)',
    note: 'Replace hardcoded #59B179 with var(--clearing-500) to support dark mode.',
  },

  /**
   * HelpIcon.vue
   * Filled circle with ? — 16×16 — fill=currentColor
   * Lucide has `circle-help` but it is STROKE.
   * Decision: KEEP if filled style matters. REPLACE if stroke acceptable.
   *
   * Lucide replacement:
   *   <Icon name="circle-help" class="ik-icon ik-icon--sm" />
   */
  HelpIcon: {
    action: 'KEEP or REPLACE',
    lucideName: 'circle-help',
    style: 'filled',
    lucideStyle: 'stroke',
    note: 'Lucide version is stroke. Confirm with design before replacing.',
  },

  /**
   * LightningIcon.vue
   * Filled lightning bolt — 16/17×16 — fill=currentColor
   * Lucide `zap` is STROKE only — no filled equivalent.
   * Decision: KEEP — no suitable Lucide replacement.
   *
   * Lucide replacement (if stroke acceptable):
   *   <Icon name="zap" class="ik-icon ik-icon--sm" />
   */
  LightningIcon: {
    action: 'KEEP',
    lucideName: 'zap',
    style: 'filled',
    lucideStyle: 'stroke',
    note: 'Lucide zap is stroke. If filled is required for brand, keep SVG.',
  },

  /**
   * MaximizeIcon.vue
   * Expand arrows — 16×16 — stroke=currentColor — Feather style
   * Lucide has `maximize-2` — DIRECT equivalent.
   * Decision: REPLACE with Lucide.
   *
   * Replace all usages with:
   *   <Icon name="maximize-2" class="ik-icon ik-icon--sm" />
   * And remove MaximizeIcon.vue import.
   */
  MaximizeIcon: {
    action: 'REPLACE',
    lucideName: 'maximize-2',
    style: 'stroke',
    lucideStyle: 'stroke',
    note: 'Direct Lucide equivalent. Safe to replace everywhere.',
  },

  /**
   * MinimizeIcon.vue
   * Collapse arrows — 16×16 — stroke=currentColor — Feather style
   * Lucide has `minimize-2` — DIRECT equivalent.
   * Decision: REPLACE with Lucide.
   *
   * Replace all usages with:
   *   <Icon name="minimize-2" class="ik-icon ik-icon--sm" />
   * And remove MinimizeIcon.vue import.
   */
  MinimizeIcon: {
    action: 'REPLACE',
    lucideName: 'minimize-2',
    style: 'stroke',
    lucideStyle: 'stroke',
    note: 'Direct Lucide equivalent. Safe to replace everywhere.',
  },

  /**
   * StepsIcon.vue
   * Three circles arranged in a triangle — 16×16 — fill=currentColor
   * No Lucide equivalent exists.
   * Decision: KEEP — unique custom icon.
   */
  StepsIcon: {
    action: 'KEEP',
    lucideName: null,
    style: 'filled circles',
    note: 'No Lucide equivalent. Unique Frappe/Intrakore icon.',
  },
}

/* ── Icon.vue usage guide ────────────────────────────────────────────────────
   Icon.vue renders from the Lucide sprite injected by spritePlugin.
   Size is always controlled by the parent class.

   Standard usage:
     <Icon name="chevron-down" class="ik-icon ik-icon--sm" />
     <Icon name="search"       class="ik-icon ik-icon--sm" />
     <Icon name="maximize-2"   class="ik-icon ik-icon--sm" />
     <Icon name="minimize-2"   class="ik-icon ik-icon--sm" />

   Color is inherited from parent via currentColor.
   To set color, apply text color on parent or the icon:
     <Icon name="chevron-down" class="ik-icon ik-icon--sm" style="color: var(--ink-gray-5)" />

   spritePlugin must be installed in main.js/ts:
     import { spritePlugin } from './icons'
     app.use(spritePlugin)
   ─────────────────────────────────────────────────────────────────────────── */

/* ── Summary of icon decisions ───────────────────────────────────────────────
   REPLACE with Lucide (2 icons):
     MaximizeIcon  → <Icon name="maximize-2" />
     MinimizeIcon  → <Icon name="minimize-2" />

   KEEP as custom SVG (4 icons):
     DownSolidIcon  — no Lucide equivalent (filled triangle)
     GreenCheckIcon — hardcoded brand color, fix to var(--clearing-500)
     LightningIcon  — filled style, no Lucide equivalent
     StepsIcon      — unique, no Lucide equivalent

   CONFIRM WITH DESIGN (2 icons — filled vs stroke matters):
     CircleCheckIcon → Lucide: circle-check (stroke)
     HelpIcon        → Lucide: circle-help  (stroke)
   ─────────────────────────────────────────────────────────────────────────── */

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module:
     import { ICON_PICKER_TOKENS, IK_ICON_PICKER_VARIANTS, IK_CUSTOM_ICONS } from './IconPicker.js'

   Global:
     window.IK.iconPicker.tokens
     window.IK.iconPicker.variants
     window.IK.iconPicker.customIcons
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.iconPicker = {
    tokens: ICON_PICKER_TOKENS,
    variants: IK_ICON_PICKER_VARIANTS,
    customIcons: IK_CUSTOM_ICONS,
  }
}

export {
  ICON_PICKER_TOKENS,
  IK_ICON_PICKER_VARIANTS,
  IK_CUSTOM_ICONS,
}
