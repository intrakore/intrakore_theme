/**
 * Intrakore Design System — List.js
 * Runtime utilities for the List component family.
 *
 * Covers: List · ListRow · ListRows · ListHeader · ListHeaderItem
 *         ListRowItem · ListEmptyState · ListFooter · ListGroups
 *         ListGroupHeader · ListGroupRows · ListSelectBanner
 *
 * Replaces: utils.js (getGridTemplateColumns, alignmentMap)
 * Depends on: custom.js (window.IK must be loaded first)
 */

/* ── Alignment map ───────────────────────────────────────────────────────────
   Replaces the alignmentMap export from utils.js.
   Maps column.align values to Intrakore CSS classes.

   Original utils.js:
     export const alignmentMap = {
       left:   'justify-start',
       start:  'justify-start',
       center: 'justify-center',
       middle: 'justify-center',
       right:  'justify-end',
       end:    'justify-end',
     }

   Usage in Vue templates (replace Tailwind class with IK class):
     :class="IK_LIST.alignmentMap[column.align]"
   ─────────────────────────────────────────────────────────────────────────── */

const IK_LIST_ALIGNMENT = {
  // Header item alignment
  header: {
    left:    'ik-list-header-item--start',
    start:   'ik-list-header-item--start',
    center:  'ik-list-header-item--center',
    middle:  'ik-list-header-item--center',
    right:   'ik-list-header-item--end',
    end:     'ik-list-header-item--end',
    default: 'ik-list-header-item--between',
  },
  // Row item alignment
  row: {
    left:   'ik-list-row-item--start',
    start:  'ik-list-row-item--start',
    center: 'ik-list-row-item--center',
    middle: 'ik-list-row-item--center',
    right:  'ik-list-row-item--end',
    end:    'ik-list-row-item--end',
  },
}

/* ── Grid template columns ───────────────────────────────────────────────────
   Direct replacement for getGridTemplateColumns from utils.js.
   Logic is identical — only the function is re-exported here so components
   can import from List.js instead of utils.js.

   Original utils.js:
     export function getGridTemplateColumns(columns, withCheckbox = true) {
       let checkBoxWidth = withCheckbox ? '14px ' : ''
       let columnsWidth = columns.map((col) => {
         let width = col.width || 1
         if (typeof width === 'number') return width + 'fr'
         return width
       }).join(' ')
       return checkBoxWidth + columnsWidth
     }
   ─────────────────────────────────────────────────────────────────────────── */

function getGridTemplateColumns(columns, withCheckbox = true) {
  const checkBoxWidth = withCheckbox ? '14px ' : ''
  const columnsWidth = columns
    .map((col) => {
      const width = col.width || 1
      if (typeof width === 'number') return width + 'fr'
      return width
    })
    .join(' ')
  return checkBoxWidth + columnsWidth
}

/* ── Token map ───────────────────────────────────────────────────────────────
   Color and size tokens used across the List component family.
   Useful for passing colors into JS-driven elements (charts, canvas, etc.)
   ─────────────────────────────────────────────────────────────────────────── */

const LIST_TOKENS = {
  /* Header */
  headerBg:              'var(--surface-blueprint-2)',
  headerTextColor:       'var(--ink-blueprint-4)',

  /* Group header */
  groupToggleHoverBg:    'var(--surface-blueprint-1)',
  groupIconColor:        'var(--ink-blueprint-3)',
  groupDividerColor:     'var(--outline-gray-modals)',

  /* Row states */
  rowSelectedBg:         'var(--surface-gray-2)',
  rowHoverBg:            'var(--surface-gray-1)',
  rowHoverSelectedBg:    'var(--surface-gray-3)',

  /* Row cells */
  cellFirstColor:        'var(--ink-gray-9)',
  cellRestColor:         'var(--ink-gray-7)',

  /* Row dividers */
  rowDividerInset:       'var(--outline-gray-1)',
  rowDividerFlush:       'var(--surface-gray-2)',

  /* Column resizer */
  resizerHoverColor:     'var(--blueprint-400)',

  /* Select banner */
  bannerBg:              'var(--surface-white)',
  bannerBorderColor:     'var(--outline-gray-2)',
  bannerTextColor:       'var(--ink-gray-9)',
  bannerBtnColor:        'var(--ink-gray-7)',
  bannerShadow:          'var(--shadow-2xl)',

  /* Empty state */
  emptyTitleColor:       'var(--ink-gray-8)',
  emptyDescColor:        'var(--ink-gray-5)',
}

/* ── Row state class helper ──────────────────────────────────────────────────
   Replaces the dynamic :class bindings in ListRow.vue.

   Usage in Vue (replaces the original :class array):
     :class="getRowClasses({ isSelected, isActive, isHoverable })"
   ─────────────────────────────────────────────────────────────────────────── */

function getRowClasses({ isSelected = false, isActive = false, isHoverable = false } = {}) {
  return [
    'ik-list-row',
    (isSelected || isActive) ? 'ik-list-row--selected' : '',
    isHoverable ? 'ik-list-row--hoverable' : '',
  ].filter(Boolean)
}

/* ── Row rounded class helper ────────────────────────────────────────────────
   Replaces the roundedClass computed in ListRow.vue.
   Logic is identical to the original — returns the correct IK class.

   Usage:
     :class="getRowRoundedClass({ isSelected, row, list })"
   ─────────────────────────────────────────────────────────────────────────── */

function getRowRoundedClass({ isSelected, row, list }) {
  if (!isSelected) return 'ik-list-row--rounded'

  const selections = [...list.selections]
  let groups = list.rows[0]?.group
    ? list.rows.map((k) => k.rows)
    : [list.rows]

  for (let rows of groups) {
    const currentIndex = rows.findIndex((k) => k === row)
    if (currentIndex === -1) continue
    const atBottom = !selections.includes(rows[currentIndex + 1]?.name)
    const atTop = !selections.includes(rows[currentIndex - 1]?.name)
    const classes = []
    if (atBottom) classes.push('ik-list-row--rounded-b')
    if (atTop) classes.push('ik-list-row--rounded-t')
    return classes.join(' ')
  }

  return 'ik-list-row--rounded'
}

/* ── Row divider class helper ────────────────────────────────────────────────
   Replaces the inline ternary on the divider <div> in ListRow.vue.

   Usage:
     :class="getRowDividerClass(roundedClass)"
   ─────────────────────────────────────────────────────────────────────────── */

function getRowDividerClass(roundedClass) {
  if (roundedClass === 'ik-list-row--rounded' || roundedClass?.includes('rounded-b')) {
    return 'ik-list-row__divider ik-list-row__divider--inset'
  }
  return 'ik-list-row__divider ik-list-row__divider--flush'
}

/* ── Vue transition class map ────────────────────────────────────────────────
   Replaces inline transition class strings in ListSelectBanner.vue.

   Update your <transition> block to use these:
     <transition
       enter-active-class="ik-list-banner-enter-active"
       leave-active-class="ik-list-banner-leave-active"
       enter-from-class="ik-list-banner-enter-from"
       leave-to-class="ik-list-banner-leave-to"
       enter-to-class="ik-list-banner-enter-to"
       leave-from-class="ik-list-banner-leave-from"
     >
   ─────────────────────────────────────────────────────────────────────────── */

const LIST_TRANSITION_CLASSES = {
  enterActiveClass: 'ik-list-banner-enter-active',
  leaveActiveClass: 'ik-list-banner-leave-active',
  enterFromClass:   'ik-list-banner-enter-from',
  leaveToClass:     'ik-list-banner-leave-to',
  enterToClass:     'ik-list-banner-enter-to',
  leaveFromClass:   'ik-list-banner-leave-from',
}

/* ── Exports ─────────────────────────────────────────────────────────────────
   ES module (for Vue SPA):
     import { getGridTemplateColumns, IK_LIST_ALIGNMENT, LIST_TOKENS } from './List.js'

   Global (loaded via hooks.py):
     window.IK.list.getGridTemplateColumns(columns, true)
     window.IK.list.alignment.header['left']
   ─────────────────────────────────────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.IK = window.IK || {}
  window.IK.list = {
    tokens: LIST_TOKENS,
    alignment: IK_LIST_ALIGNMENT,
    getGridTemplateColumns,
    getRowClasses,
    getRowRoundedClass,
    getRowDividerClass,
    transitionClasses: LIST_TRANSITION_CLASSES,
  }
}

export {
  IK_LIST_ALIGNMENT,
  LIST_TOKENS,
  LIST_TRANSITION_CLASSES,
  getGridTemplateColumns,
  getRowClasses,
  getRowRoundedClass,
  getRowDividerClass,
}
