/**
 * Intrakore Design System — Alert.js
 * Runtime utilities for Alert.vue.
 *
 * Replaces:
 *   - classes computed  (background per theme/variant)
 *   - icon computed     (icon component + color class per theme)
 *
 * Icon imports — all from Lucide via ~icons/lucide/* :
 *   LucideWarning   → lucide: triangle-alert  (yellow)
 *   LucideInfo      → lucide: info            (blue)
 *   LucideCircleX   → lucide: circle-x        (red)
 *   LucideCheck     → lucide: circle-check    (green)
 *   LucideX         → lucide: x               (dismiss button)
 *   All 5 are direct Lucide equivalents — no custom SVGs needed.
 */

/* ── Token map ───────────────────────────────────────────────────────────────
   All color tokens used in Alert.css.
   ─────────────────────────────────────────────────────────────────────────── */

const ALERT_TOKENS = {
  /* Subtle backgrounds */
  subtleBg: {
    default: 'var(--surface-gray-2)',
    yellow:  'var(--surface-amber-1)',
    blue:    'var(--surface-blue-1)',
    red:     'var(--surface-red-3)',
    green:   'var(--surface-clearing-2)',
  },

  /* Outline variant */
  outlineBorder: 'var(--outline-gray-4)',

  /* Icon colors */
  iconColor: {
    yellow: 'var(--ink-amber-2)',
    blue:   'var(--ink-blue-2)',
    red:    'var(--ink-red-3)',
    green:  'var(--ink-clearing-2)',
  },

  /* Text */
  titleColor:       'var(--ink-gray-9)',
  descriptionColor: 'var(--ink-gray-6)',
  dismissColor:     'var(--ink-gray-6)',
  dismissHover:     'var(--ink-gray-9)',
}

/* ── getAlertClasses ─────────────────────────────────────────────────────────
   Replaces the classes computed in Alert.vue.

   Original:
     const classes = computed(() => {
       const subtleBgs = {
         yellow: "bg-surface-amber-1",
         blue:   "bg-surface-blue-1",
         red:    "bg-surface-red-3",
         green:  "bg-surface-clearing-2",
       }
       if (props.variant == "outline") return "border border-outline-gray-4"
       return props.theme ? subtleBgs[props.theme] : "bg-surface-gray-2"
     })

   Usage in Vue (replaces :class="classes"):
     :class="getAlertClasses({ theme: props.theme, variant: props.variant })"
   ─────────────────────────────────────────────────────────────────────────── */

function getAlertClasses({ theme = null, variant = 'subtle' } = {}) {
  const base = 'ik-alert'

  if (variant === 'outline') {
    return [base, 'ik-alert--outline']
  }

  const classes = [base, 'ik-alert--subtle']
  if (theme) classes.push(`ik-alert--${theme}`)
  return classes
}

/* ── getAlertIconClasses ─────────────────────────────────────────────────────
   Replaces the icon.css part of the icon computed in Alert.vue.

   Original:
     const icon = computed(() => {
       const data = {
         yellow: { component: LucideWarning, css: 'text-ink-amber-2' },
         blue:   { component: LucideInfo,    css: 'text-ink-blue-2'  },
         red:    { component: LucideCircleX, css: 'text-ink-red-3'   },
         green:  { component: LucideCheck,   css: 'text-ink-clearing-2' },
       }
       return props.theme ? data[props.theme] : null
     })

   Usage in Vue (replaces :class="icon.css"):
     :class="getAlertIconClasses(props.theme)"
   ─────────────────────────────────────────────────────────────────────────── */

function getAlertIconClasses(theme = null) {
  if (!theme) return 'ik-alert__icon'
  return `ik-alert__icon ik-alert__icon--${theme}`
}

/* ── Icon map ────────────────────────────────────────────────────────────────
   Maps each theme to its Lucide icon name.
   All icons are direct Lucide equivalents — use via Icon.vue + spritePlugin.

   Original imports in Alert.vue:
     import LucideX       from "~icons/lucide/x"             → dismiss button
     import LucideInfo    from "~icons/lucide/info"           → blue
     import LucideCircleX from "~icons/lucide/circle-x"      → red
     import LucideCheck   from "~icons/lucide/circle-check"  → green
     import LucideWarning from "~icons/lucide/triangle-alert" → yellow

   All 5 are in the Lucide sprite — no custom SVGs needed.
   In Vue, replace component :is="icon.component" with:
     <Icon :name="ALERT_ICON_MAP[props.theme]" :class="getAlertIconClasses(props.theme)" />
   ─────────────────────────────────────────────────────────────────────────── */

const ALERT_ICON_MAP = {
  yellow: 'triangle-alert',   /* LucideWarning  */
  blue:   'info',             /* LucideInfo     */
  red:    'circle-x',         /* LucideCircleX  */
  green:  'circle-check',     /* LucideCheck    */
  dismiss: 'x',               /* LucideX        */
}

/* ── Class map ───────────────────────────────────────────────────────────────
   Original Tailwind → IK CSS class reference.
   ─────────────────────────────────────────────────────────────────────────── */

const ALERT_CLASS_MAP = {
  // Base
  'grid grid-cols-[auto_1fr_auto] gap-3 rounded-md px-4 py-3.5 text-base items-start': 'ik-alert',

  // Subtle variant backgrounds
  'bg-surface-gray-2':     'ik-alert--subtle',
  'bg-surface-amber-1':    'ik-alert--subtle ik-alert--yellow',
  'bg-surface-blue-1':     'ik-alert--subtle ik-alert--blue',
  'bg-surface-red-3':      'ik-alert--subtle ik-alert--red',
  'bg-surface-clearing-2': 'ik-alert--subtle ik-alert--green',

  // Outline variant
  'border border-outline-gray-4': 'ik-alert--outline',

  // Icon colors
  'text-ink-amber-2':    'ik-alert__icon ik-alert__icon--yellow',
  'text-ink-blue-2':     'ik-alert__icon ik-alert__icon--blue',
  'text-ink-red-3':      'ik-alert__icon ik-alert__icon--red',
  'text-ink-clearing-2': 'ik-alert__icon ik-alert__icon--green',

  // Content
  'grid gap-2':          'ik-alert__body',
  'col-span-2':          'ik-alert__body--full',
  'text-ink-gray-9':     'ik-alert__title',
  'text-ink-gray-6 prose-sm': 'ik-alert__description',

  // Dismiss
  'size-4': 'ik-alert__dismiss svg',
}

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module:
     import { getAlertClasses, getAlertIconClasses, ALERT_ICON_MAP } from './Alert.js'

   Global:
     window.IK.alert.getClasses({ theme: 'blue', variant: 'subtle' })
     window.IK.alert.iconMap.blue  // → 'info'
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.alert = {
    tokens: ALERT_TOKENS,
    iconMap: ALERT_ICON_MAP,
    classMap: ALERT_CLASS_MAP,
    getClasses: getAlertClasses,
    getIconClasses: getAlertIconClasses,
  }
}

export {
  ALERT_TOKENS,
  ALERT_ICON_MAP,
  ALERT_CLASS_MAP,
  getAlertClasses,
  getAlertIconClasses,
}
