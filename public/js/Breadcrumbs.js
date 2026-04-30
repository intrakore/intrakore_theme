/**
 * Intrakore Design System — Breadcrumbs.js
 * Runtime utilities for Breadcrumbs.vue.
 *
 * Replaces the dynamic :class bindings on crumb items.
 * Depends on: custom.js (window.IK must be loaded first)
 *
 * Icon note:
 *   LucideEllipsis is imported from 'lucide-vue-next' in the original.
 *   This is a DIRECT Lucide equivalent — replace with:
 *   <Icon name="ellipsis" class="ik-breadcrumbs__overflow-icon" />
 *   via Icon.vue + spritePlugin (no custom SVG needed).
 */

/* ── Token map ───────────────────────────────────────────────────────────────
   All color tokens used in Breadcrumbs.css.
   ─────────────────────────────────────────────────────────────────────────── */

const BREADCRUMBS_TOKENS = {
  /* Crumb text */
  activeColor:       'var(--ink-blueprint-3)',  /* last crumb */
  inactiveColor:     'var(--ink-blueprint-2)',  /* all others */
  inactiveHover:     'var(--ink-blueprint-3)',  /* hover state */

  /* Separator "/" */
  separatorColor:    'var(--ink-blueprint-2)',

  /* Overflow ellipsis icon */
  overflowIconColor: 'var(--ink-blueprint-2)',

  /* Focus ring */
  focusRing:         'var(--outline-blueprint-2)',
}

/* ── getCrumbClasses ─────────────────────────────────────────────────────────
   Replaces the dynamic :class on each router-link / <a> / <button>.

   Original in template:
     :class="[
       i == crumbs.length - 1
         ? 'text-ink-blueprint-3'
         : 'text-ink-blueprint-2 hover:text-ink-blueprint-3',
     ]"

   Usage in Vue:
     :class="getCrumbClasses(i, crumbs.length)"
   ─────────────────────────────────────────────────────────────────────────── */

function getCrumbClasses(index, totalLength) {
  const isActive = index === totalLength - 1
  return [
    'ik-breadcrumb',
    isActive ? 'ik-breadcrumb--active' : 'ik-breadcrumb--inactive',
  ]
}

/* ── Class map ───────────────────────────────────────────────────────────────
   Original Tailwind → IK CSS class reference.
   ─────────────────────────────────────────────────────────────────────────── */

const BREADCRUMBS_CLASS_MAP = {

  // Root
  'flex min-w-0 items-center': 'ik-breadcrumbs',

  // Overflow
  'h-7': 'ik-breadcrumbs__overflow-dropdown',
  'w-4 text-ink-blueprint-2': 'ik-breadcrumbs__overflow-icon',
  'ml-1 mr-0.5 text-base text-ink-blueprint-2': 'ik-breadcrumbs__overflow-separator',

  // Crumbs container
  'flex min-w-0 items-center text-ellipsis whitespace-nowrap': 'ik-breadcrumbs__list',

  // Crumb base — shared by router-link, <a>, <button>
  'flex items-center rounded px-0.5 py-1 text-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-blueprint-2': 'ik-breadcrumb',

  // Crumb states
  'text-ink-blueprint-3': 'ik-breadcrumb--active',
  'text-ink-blueprint-2 hover:text-ink-blueprint-3': 'ik-breadcrumb--inactive',

  // Separator
  'mx-0.5 text-base text-ink-blueprint-2': 'ik-breadcrumb__separator',
}

/* ── Icon replacement guide ──────────────────────────────────────────────────
   Original import in Breadcrumbs.vue:
     import { Ellipsis as LucideEllipsis } from 'lucide-vue-next'

   This uses lucide-vue-next directly (not the sprite system).
   Replace with Icon.vue via sprite for consistency:

   In template, replace:
     <LucideEllipsis class="w-4 text-ink-blueprint-2" />
   With:
     <Icon name="ellipsis" class="ik-breadcrumbs__overflow-icon" />

   Note: 'lucide-vue-next' and '~icons/lucide/*' both use Lucide icons
   but via different mechanisms. The sprite approach (Icon.vue) is preferred
   for Intrakore as it keeps the icon system unified.
   ─────────────────────────────────────────────────────────────────────────── */

const BREADCRUMBS_ICON_MAP = {
  LucideEllipsis: {
    lucideName: 'ellipsis',
    action: 'REPLACE',
    original: "import { Ellipsis as LucideEllipsis } from 'lucide-vue-next'",
    replacement: '<Icon name="ellipsis" class="ik-breadcrumbs__overflow-icon" />',
    note: 'Direct Lucide equivalent. Switch from lucide-vue-next to Icon.vue + sprite.',
  },
}

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module:
     import { getCrumbClasses, BREADCRUMBS_TOKENS } from './Breadcrumbs.js'

   Global:
     window.IK.breadcrumbs.getCrumbClasses(i, crumbs.length)
     window.IK.breadcrumbs.tokens.activeColor
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.breadcrumbs = {
    tokens: BREADCRUMBS_TOKENS,
    classMap: BREADCRUMBS_CLASS_MAP,
    iconMap: BREADCRUMBS_ICON_MAP,
    getCrumbClasses,
  }
}

export {
  BREADCRUMBS_TOKENS,
  BREADCRUMBS_CLASS_MAP,
  BREADCRUMBS_ICON_MAP,
  getCrumbClasses,
}
