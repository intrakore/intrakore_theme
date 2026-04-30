/**
 * Intrakore Design System — Tree.js
 * Runtime utilities for Tree.vue (recursive tree component).
 *
 * Replaces:
 *   - Dynamic :class on node label (hasChildren ? '' : 'pl-3.5')
 *   - linePadding computation (stays in JS — can't be done in CSS)
 *   - Default options reference
 *
 * Icon note:
 *   FeatherIcon is imported in Tree.vue for chevron-down and chevron-right.
 *   Both are DIRECT Lucide equivalents — replace with Icon.vue + sprite:
 *     <Icon name="chevron-down"  class="ik-tree-node__icon" />
 *     <Icon name="chevron-right" class="ik-tree-node__icon" />
 *
 * Depends on: custom.js (window.IK must be loaded first)
 */

/* ── Default options ─────────────────────────────────────────────────────────
   Matches the withDefaults() in Tree.vue.
   Centralised here so Yaseen can reference them from JS if needed.
   ─────────────────────────────────────────────────────────────────────────── */

const TREE_DEFAULT_OPTIONS = {
  rowHeight:             '25px',
  indentWidth:           '20px',
  showIndentationGuides: true,
  defaultCollapsed:      true,
}

/* ── Token map ───────────────────────────────────────────────────────────────
   All color tokens used in Tree.css.
   ─────────────────────────────────────────────────────────────────────────── */

const TREE_TOKENS = {
  indentGuideColor: 'var(--outline-blueprint-2)',
  labelFontSize:    'var(--text-base-size)',
  iconHeight:       '0.875rem',
  leafIndent:       '0.875rem',
}

/* ── getLabelClasses ─────────────────────────────────────────────────────────
   Replaces the inline :class on the label div in Tree.vue.

   Original:
     <div class="text-base truncate" :class="hasChildren ? '' : 'pl-3.5'">

   Usage in Vue:
     :class="getTreeLabelClasses(hasChildren)"
   ─────────────────────────────────────────────────────────────────────────── */

function getTreeLabelClasses(hasChildren = false) {
  return [
    'ik-tree-node__label',
    hasChildren
      ? 'ik-tree-node__label--parent'
      : 'ik-tree-node__label--leaf',
  ]
}

/* ── computeLinePadding ──────────────────────────────────────────────────────
   Replaces the linePadding computation in Tree.vue onMounted.
   This MUST stay in JS — it reads the DOM element's clientWidth at runtime.

   Original in Tree.vue:
     onMounted(() => {
       if (iconRef.value?.clientWidth)
         linePadding.value = iconRef.value.clientWidth / 2 + 'px'
     })

   Usage — call this in onMounted, pass the icon element ref:
     onMounted(() => {
       linePadding.value = computeTreeLinePadding(iconRef.value)
     })
   ─────────────────────────────────────────────────────────────────────────── */

function computeTreeLinePadding(iconElement) {
  if (!iconElement?.clientWidth) return '0px'
  return iconElement.clientWidth / 2 + 'px'
}

/* ── Icon replacement guide ──────────────────────────────────────────────────
   Original imports in Tree.vue:
     import FeatherIcon from '../FeatherIcon.vue'

   Used as:
     <FeatherIcon v-if="hasChildren && !isCollapsed" name="chevron-down" class="h-3.5" />
     <FeatherIcon v-else-if="hasChildren"            name="chevron-right" class="h-3.5" />

   Replace with Icon.vue + Lucide sprite:
     <Icon v-if="hasChildren && !isCollapsed" name="chevron-down"  class="ik-tree-node__icon" />
     <Icon v-else-if="hasChildren"            name="chevron-right" class="ik-tree-node__icon" />
   ─────────────────────────────────────────────────────────────────────────── */

const TREE_ICON_MAP = {
  'chevron-down': {
    action: 'REPLACE',
    lucideName: 'chevron-down',
    original: '<FeatherIcon name="chevron-down" class="h-3.5" />',
    replacement: '<Icon name="chevron-down" class="ik-tree-node__icon" />',
    note: 'Direct Lucide equivalent.',
  },
  'chevron-right': {
    action: 'REPLACE',
    lucideName: 'chevron-right',
    original: '<FeatherIcon name="chevron-right" class="h-3.5" />',
    replacement: '<Icon name="chevron-right" class="ik-tree-node__icon" />',
    note: 'Direct Lucide equivalent.',
  },
}

/* ── Class map ───────────────────────────────────────────────────────────────
   Original Tailwind → IK CSS class reference.
   ─────────────────────────────────────────────────────────────────────────── */

const TREE_CLASS_MAP = {
  // Node row
  'flex items-center cursor-pointer gap-1': 'ik-tree-node',

  // Icon
  'h-3.5': 'ik-tree-node__icon',

  // Label
  'text-base truncate':          'ik-tree-node__label',
  'pl-3.5':                      'ik-tree-node__label--leaf',

  // Children container
  'flex [children]':             'ik-tree-children',

  // Indent guide
  'border-r border-outline-blueprint-2': 'ik-tree-guide',

  // Children list
  'w-full':                      'ik-tree-list',
}

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module:
     import { getTreeLabelClasses, computeTreeLinePadding, TREE_DEFAULT_OPTIONS } from './Tree.js'

   Global:
     window.IK.tree.getLabelClasses(hasChildren)
     window.IK.tree.computeLinePadding(iconRef.value)
     window.IK.tree.defaultOptions
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.tree = {
    defaultOptions:     TREE_DEFAULT_OPTIONS,
    tokens:             TREE_TOKENS,
    iconMap:            TREE_ICON_MAP,
    classMap:           TREE_CLASS_MAP,
    getLabelClasses:    getTreeLabelClasses,
    computeLinePadding: computeTreeLinePadding,
  }
}

export {
  TREE_DEFAULT_OPTIONS,
  TREE_TOKENS,
  TREE_ICON_MAP,
  TREE_CLASS_MAP,
  getTreeLabelClasses,
  computeTreeLinePadding,
}
