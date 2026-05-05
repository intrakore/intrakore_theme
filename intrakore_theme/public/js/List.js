/**
 * Intrakore Design System — List.js
 * Vanilla JS equivalent of the frappe-ui ListView component system.
 *
 * Converts: ListView.vue · ListRow.vue · ListRows.vue · ListHeader.vue
 *           ListHeaderItem.vue · ListRowItem.vue · ListEmptyState.vue
 *           ListFooter.vue · ListGroups.vue · ListGroupHeader.vue
 *           ListGroupRows.vue · ListSelectBanner.vue · utils.js
 *
 * Usage:
 *   const list = new IKListView(containerEl, {
 *     columns: [{ key: 'name', label: 'Name', width: 2 }, ...],
 *     rows: [{ name: 'Row 1', status: 'Active' }, ...],
 *     rowKey: 'name',
 *     options: {
 *       selectable: true,
 *       resizeColumn: false,
 *       rowHeight: 40,
 *       showTooltip: true,
 *       getRowRoute: (row) => `/app/lead/${row.name}`,
 *       onRowClick: (row) => console.log(row),
 *       emptyState: { title: 'No Data', description: 'Nothing here yet.' },
 *     },
 *     onSelectionChange: (selections) => console.log([...selections]),
 *     onActiveRowChange: (row) => console.log(row),
 *   })
 *
 *   list.setRows(newRows)
 *   list.setColumns(newColumns)
 *   list.getSelections()       // → Set of selected rowKeys
 *   list.clearSelections()
 *   list.selectAll()
 *   list.destroy()
 */

'use strict'

/* ─── utils.js ────────────────────────────────────────────────────────────── */

const alignmentMap = {
  left:   'ik-list-row-item--justify-start',
  start:  'ik-list-row-item--justify-start',
  center: 'ik-list-row-item--justify-center',
  middle: 'ik-list-row-item--justify-center',
  right:  'ik-list-row-item--justify-end',
  end:    'ik-list-row-item--justify-end',
}

const headerAlignmentMap = {
  left:   'ik-list-header-item--justify-start',
  start:  'ik-list-header-item--justify-start',
  center: 'ik-list-header-item--justify-center',
  middle: 'ik-list-header-item--justify-center',
  right:  'ik-list-header-item--justify-end',
  end:    'ik-list-header-item--justify-end',
  between: 'ik-list-header-item--justify-between',
}

function getGridTemplateColumns(columns, withCheckbox = true) {
  const checkboxWidth = withCheckbox ? '14px ' : ''
  const columnsWidth = columns
    .map((col) => {
      const width = col.width || 1
      return typeof width === 'number' ? `${width}fr` : width
    })
    .join(' ')
  return checkboxWidth + columnsWidth
}

function defaultTrue(value)  { return value === undefined ? true  : value }
function defaultFalse(value) { return value === undefined ? false : value }

/* ─── IKListView ──────────────────────────────────────────────────────────── */

class IKListView {
  /**
   * @param {HTMLElement} container
   * @param {object} props
   */
  constructor(container, props = {}) {
    if (!(container instanceof HTMLElement)) {
      throw new TypeError('IKListView: first argument must be an HTMLElement.')
    }

    this._container = container
    this._props     = this._normaliseProps(props)

    /* Internal state */
    this._selections = new Set()
    this._activeRow  = null
    this._grouped    = false

    this._render()
  }

  /* ── Public API ─────────────────────────────────────────────────────────── */

  getSelections()    { return new Set(this._selections) }
  clearSelections()  { this._selections.clear(); this._syncSelectionUI(); this._syncBanner() }
  selectAll()        { this._toggleAllRows(true) }

  setRows(rows) {
    this._props.rows = rows || []
    this._grouped = this._isGrouped()
    this._rerenderBody()
  }

  setColumns(columns) {
    this._props.columns = columns || []
    this._rerenderHeader()
    this._rerenderBody()
  }

  destroy() {
    this._container.innerHTML = ''
  }

  /* ── Private: prop normalisation ────────────────────────────────────────── */

  _normaliseProps(props) {
    const o = props.options || {}
    return {
      columns : props.columns  || [],
      rows    : props.rows     || [],
      rowKey  : props.rowKey   || 'name',
      options : {
        getRowRoute    : o.getRowRoute    || null,
        onRowClick     : o.onRowClick     || null,
        showTooltip    : defaultTrue(o.showTooltip),
        selectionText  : o.selectionText  || ((n) => n === 1 ? '1 row selected' : `${n} rows selected`),
        enableActive   : defaultFalse(o.enableActive),
        selectable     : defaultTrue(o.selectable),
        resizeColumn   : defaultFalse(o.resizeColumn),
        rowHeight      : o.rowHeight || 40,
        emptyState     : o.emptyState || { title: 'No Data', description: 'No data available.' },
      },
      onSelectionChange : props.onSelectionChange || null,
      onActiveRowChange : props.onActiveRowChange || null,
    }
  }

  /* ── Private: initial render ────────────────────────────────────────────── */

  _render() {
    this._grouped = this._isGrouped()

    /* Root — .ik-list */
    this._rootEl = document.createElement('div')
    this._rootEl.className = 'ik-list'

    /* Inner — .ik-list__inner */
    this._innerEl = document.createElement('div')
    this._innerEl.className = 'ik-list__inner'

    /* Header */
    this._headerEl = this._buildHeader()
    this._innerEl.appendChild(this._headerEl)

    /* Body */
    this._bodyEl = document.createElement('div')
    this._rerenderBody()
    this._innerEl.appendChild(this._bodyEl)

    /* Select banner */
    this._bannerEl = this._buildSelectBanner()
    this._innerEl.appendChild(this._bannerEl)

    this._rootEl.appendChild(this._innerEl)
    this._container.innerHTML = ''
    this._container.appendChild(this._rootEl)
  }

  /* ── Private: header ────────────────────────────────────────────────────── */

  _buildHeader() {
    const { columns, options } = this._props
    const header = document.createElement('div')
    header.className = 'ik-list-header'
    header.style.gridTemplateColumns = getGridTemplateColumns(columns, options.selectable)

    if (options.selectable) {
      const cb = this._buildCheckbox(this._allRowsSelected(), false, (e) => {
        e.stopPropagation()
        this._toggleAllRows(!this._allRowsSelected())
      })
      cb.classList.add('ik-list-header__checkbox')
      this._headerCheckbox = cb
      header.appendChild(cb)
    }

    columns.forEach((col) => {
      header.appendChild(this._buildHeaderItem(col))
    })

    return header
  }

  _buildHeaderItem(col) {
    const wrap = document.createElement('div')
    wrap.className = [
      'ik-list-header-item',
      col.align ? headerAlignmentMap[col.align] : 'ik-list-header-item--justify-between',
    ].join(' ')

    const label = document.createElement('div')
    label.className = 'ik-list-header-item__label'
    const text = document.createElement('div')
    text.className = 'ik-list-header-item__label-text'
    text.textContent = col.label || ''
    label.appendChild(text)
    wrap.appendChild(label)

    if (this._props.options.resizeColumn) {
      const resizerWrap = document.createElement('div')
      resizerWrap.className = 'ik-list-header-item__resizer-wrap'
      const resizerHandle = document.createElement('div')
      resizerHandle.className = 'ik-list-header-item__resizer-handle'
      resizerWrap.appendChild(resizerHandle)
      wrap.appendChild(resizerWrap)
      this._attachResizer(resizerWrap, col, wrap)
    }

    return wrap
  }

  _rerenderHeader() {
    const newHeader = this._buildHeader()
    this._innerEl.replaceChild(newHeader, this._headerEl)
    this._headerEl = newHeader
  }

  /* ── Private: body ──────────────────────────────────────────────────────── */

  _rerenderBody() {
    const { rows, options } = this._props
    this._bodyEl.innerHTML = ''

    if (!rows.length) {
      this._bodyEl.appendChild(this._buildEmptyState())
      return
    }

    if (this._grouped) {
      this._bodyEl.appendChild(this._buildGroups())
    } else {
      this._bodyEl.appendChild(this._buildRows(rows))
    }
  }

  /* ── Private: rows ──────────────────────────────────────────────────────── */

  _buildRows(rows) {
    const wrapper = document.createElement('div')
    wrapper.className = 'ik-list-rows'
    rows.forEach((row, idx) => {
      wrapper.appendChild(this._buildRow(row, idx === rows.length - 1, rows))
    })
    return wrapper
  }

  _buildRow(row, isLast, allRows) {
    const { options, columns, rowKey } = this._props
    const isSelected = this._selections.has(row[rowKey])
    const isActive   = options.enableActive && this._activeRow === row.name
    const isHoverable = !!(options.getRowRoute || options.onRowClick)

    const roundedClass = this._getRoundedClass(row, allRows)

    /* Outer element — router-link becomes <a>, otherwise div */
    const outer = document.createElement(options.getRowRoute ? 'a' : 'div')
    outer.className = [
      'ik-list-row',
      roundedClass,
      isSelected || isActive ? 'ik-list-row--selected' : '',
      row.disabled            ? 'ik-list-row--disabled' : '',
      isHoverable && !row.disabled ? 'ik-list-row--hoverable' : '',
    ].filter(Boolean).join(' ')

    if (options.getRowRoute && !row.disabled) {
      const route = options.getRowRoute(row)
      if (typeof route === 'string' && route.startsWith('http')) {
        outer.href = route
      } else {
        outer.href = route
      }
    }

    if (row.disabled) {
      outer.setAttribute('aria-disabled', 'true')
      outer.tabIndex = -1
    }

    /* Inner grid */
    const grid = document.createElement('div')
    grid.className = 'ik-list-row__grid' + (row.disabled ? ' ik-list-row__grid--disabled' : '')
    const rowHeight = typeof options.rowHeight === 'number'
      ? `${options.rowHeight}px`
      : options.rowHeight
    grid.style.height = rowHeight
    grid.style.gridTemplateColumns = getGridTemplateColumns(columns, options.selectable)

    /* Checkbox cell */
    if (options.selectable) {
      const cbCell = document.createElement('div')
      cbCell.className = 'ik-list-row__checkbox-cell'
      cbCell.addEventListener('click', (e) => e.stopPropagation())
      cbCell.addEventListener('dblclick', (e) => e.stopPropagation())
      const cb = this._buildCheckbox(isSelected, row.disabled, (e) => {
        this._handleCheckboxClick(e, row, allRows)
      })
      cbCell.appendChild(cb)
      grid.appendChild(cbCell)
    }

    /* Column cells */
    columns.forEach((col, i) => {
      const cell = document.createElement('div')
      cell.className = i === 0 ? 'ik-list-row__cell ik-list-row__cell--first' : 'ik-list-row__cell ik-list-row__cell--rest'
      cell.appendChild(this._buildRowItem(col, row, row[col.key]))
      grid.appendChild(cell)
    })

    outer.appendChild(grid)

    /* Divider */
    if (!isLast) {
      const divider = document.createElement('div')
      const isRounded = roundedClass === 'ik-list-row--rounded' || roundedClass?.includes('rounded-b')
      divider.className = 'ik-list-row__divider ' + (isRounded ? 'ik-list-row__divider--inset' : 'ik-list-row__divider--flush')
      outer.appendChild(divider)
    }

    /* Row click */
    outer.addEventListener('click', (e) => {
      if (row.disabled) return
      if (options.onRowClick) options.onRowClick(row, e)
      if (options.enableActive) {
        this._activeRow = this._activeRow === row.name ? null : row.name
        this._syncSelectionUI()
        if (this._props.onActiveRowChange) this._props.onActiveRowChange(this._activeRow)
      }
    })

    return outer
  }

  _buildRowItem(col, row, item) {
    const wrap = document.createElement('div')
    wrap.className = ['ik-list-row-item', alignmentMap[col.align] || 'ik-list-row-item--justify-start'].join(' ')

    const label = document.createElement('div')
    label.className = 'ik-list-row-item__label'

    const value = item && typeof item === 'object' ? (item.label || '') : (item ?? '')
    label.textContent = String(value)

    if (col.getLabel) label.textContent = col.getLabel({ row }) || ''

    wrap.appendChild(label)
    return wrap
  }

  /* ── Private: groups ────────────────────────────────────────────────────── */

  _buildGroups() {
    const wrapper = document.createElement('div')
    wrapper.className = 'ik-list-groups'

    this._props.rows.forEach((group) => {
      wrapper.appendChild(this._buildGroupHeader(group))
      wrapper.appendChild(this._buildGroupRows(group))
    })

    return wrapper
  }

  _buildGroupHeader(group) {
    const wrap = document.createElement('div')
    wrap.className = 'ik-list-group-header'

    /* Toggle button */
    const btn = document.createElement('button')
    btn.className = 'ik-list-group-header__toggle'
    btn.type = 'button'

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    icon.setAttribute('viewBox', '0 0 16 16')
    icon.setAttribute('fill', 'currentColor')
    icon.className = 'ik-list-group-header__icon' + (group.collapsed ? ' ik-list-group-header__icon--collapsed' : '')
    icon.innerHTML = '<path d="M8 10L3 5h10l-5 5z"/>'
    btn.appendChild(icon)

    btn.addEventListener('click', () => {
      group.collapsed = !group.collapsed
      icon.classList.toggle('ik-list-group-header__icon--collapsed', group.collapsed)
      rowsEl.style.display = group.collapsed ? 'none' : ''
    })

    wrap.appendChild(btn)

    /* Label */
    const content = document.createElement('div')
    content.className = 'ik-list-group-header__content'
    const label = document.createElement('span')
    label.className = 'ik-list-group-header__label'
    label.textContent = group.group || ''
    content.appendChild(label)
    wrap.appendChild(content)

    /* Divider */
    const divider = document.createElement('div')
    divider.className = 'ik-list-group-header__divider'
    wrap.appendChild(divider)

    /* Store reference for toggle */
    var rowsEl = document.createElement('div') // placeholder, replaced below
    wrap._rowsEl = rowsEl

    return wrap
  }

  _buildGroupRows(group) {
    const wrap = document.createElement('div')
    wrap.className = 'ik-list-group-rows'
    if (group.collapsed) wrap.style.display = 'none'

    if (group.rows?.length) {
      const rowsWrapper = this._buildRows(group.rows)
      wrap.appendChild(rowsWrapper)
    }

    return wrap
  }

  /* ── Private: empty state ───────────────────────────────────────────────── */

  _buildEmptyState() {
    const { emptyState } = this._props.options
    const wrap = document.createElement('div')
    wrap.className = 'ik-list-empty'

    const title = document.createElement('div')
    title.className = 'ik-list-empty__title'
    title.textContent = emptyState.title || 'No Data'
    wrap.appendChild(title)

    const desc = document.createElement('div')
    desc.className = 'ik-list-empty__description'
    desc.textContent = emptyState.description || ''
    wrap.appendChild(desc)

    return wrap
  }

  /* ── Private: select banner ─────────────────────────────────────────────── */

  _buildSelectBanner() {
    const wrap = document.createElement('div')
    wrap.className = 'ik-list-select-banner'
    wrap.style.display = 'none'

    const inner = document.createElement('div')
    inner.className = 'ik-list-select-banner__inner'

    const left = document.createElement('div')
    left.className = 'ik-list-select-banner__left'

    const info = document.createElement('div')
    info.className = 'ik-list-select-banner__selection-info'

    this._bannerText = document.createElement('div')
    this._bannerText.textContent = ''
    info.appendChild(this._bannerText)
    left.appendChild(info)
    inner.appendChild(left)

    /* Buttons */
    const buttons = document.createElement('div')
    buttons.className = 'ik-list-select-banner__buttons'

    const selectAllBtn = document.createElement('button')
    selectAllBtn.className = 'ik-list-select-banner__select-all-btn ik-btn ik-btn--gray--ghost ik-btn--sm'
    selectAllBtn.textContent = 'Select all'
    selectAllBtn.addEventListener('click', () => this._toggleAllRows(true))

    const clearBtn = document.createElement('button')
    clearBtn.className = 'ik-btn ik-btn--gray--ghost ik-btn--sm ik-btn--icon'
    clearBtn.innerHTML = '&times;'
    clearBtn.addEventListener('click', () => this._toggleAllRows(false))

    buttons.appendChild(selectAllBtn)
    buttons.appendChild(clearBtn)
    inner.appendChild(buttons)
    wrap.appendChild(inner)

    return wrap
  }

  _syncBanner() {
    const size = this._selections.size
    if (size > 0) {
      this._bannerEl.style.display = ''
      this._bannerText.textContent = this._props.options.selectionText(size)
    } else {
      this._bannerEl.style.display = 'none'
    }
  }

  /* ── Private: checkbox ──────────────────────────────────────────────────── */

  _buildCheckbox(checked, disabled, onChange) {
    const label = document.createElement('label')
    label.style.display = 'flex'
    label.style.alignItems = 'center'
    label.style.cursor = disabled ? 'not-allowed' : 'pointer'

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = !!checked
    input.disabled = !!disabled
    input.addEventListener('click', onChange)

    label.appendChild(input)
    return label
  }

  /* ── Private: selection logic ───────────────────────────────────────────── */

  _toggleAllRows(select) {
    if (!select || this._allRowsSelected()) {
      this._selections.clear()
    } else {
      const rows = this._grouped
        ? this._props.rows.flatMap(g => g.rows || [])
        : this._props.rows
      rows.forEach((row) => {
        if (!row.disabled) this._selections.add(row[this._props.rowKey])
      })
    }
    this._syncSelectionUI()
    this._syncBanner()
    if (this._props.onSelectionChange) this._props.onSelectionChange(this._selections)
  }

  _handleCheckboxClick(event, row, allRows) {
    if (row.disabled) return
    const value = row[this._props.rowKey]

    if (event.shiftKey && !this._selections.has(value)) {
      const lastSelected = [...this._selections].pop()
      const rows = this._grouped
        ? this._props.rows.flatMap(g => g.rows || [])
        : allRows
      const lastIdx = rows.findIndex(r => r[this._props.rowKey] === lastSelected)
      const curIdx  = rows.findIndex(r => r[this._props.rowKey] === value)
      const start   = Math.min(lastIdx, curIdx)
      const end     = Math.max(lastIdx, curIdx)
      for (let i = start; i <= end; i++) {
        if (!rows[i].disabled) this._selections.add(rows[i][this._props.rowKey])
      }
    } else {
      if (!this._selections.delete(value)) {
        this._selections.add(value)
      }
    }

    this._syncSelectionUI()
    this._syncBanner()
    if (this._props.onSelectionChange) this._props.onSelectionChange(this._selections)
  }

  _syncSelectionUI() {
    /* Update row classes */
    const { rowKey, options } = this._props
    const rows = this._rootEl.querySelectorAll('.ik-list-row')
    rows.forEach((rowEl) => {
      const key = rowEl.dataset.rowKey
      if (!key) return
      const isSelected = this._selections.has(key)
      const isActive   = options.enableActive && this._activeRow === key
      rowEl.classList.toggle('ik-list-row--selected', isSelected || isActive)
    })

    /* Update header checkbox */
    if (this._headerCheckbox) {
      const cb = this._headerCheckbox.querySelector('input')
      if (cb) cb.checked = this._allRowsSelected()
    }
  }

  _allRowsSelected() {
    const rows = this._grouped
      ? this._props.rows.flatMap(g => g.rows || [])
      : this._props.rows
    const total = rows.filter(r => !r.disabled).length
    return total > 0 && this._selections.size === total
  }
  _getRoundedClass(row, allRows) {
  const rowKey = this._props.rowKey
  if (!this._selections.has(row[rowKey])) return 'ik-list-row--rounded'

  const selections = [...this._selections]
  const currentIndex = allRows.findIndex(r => r[rowKey] === row[rowKey])
  const atTop = !selections.includes(allRows[currentIndex - 1]?.[rowKey])
  const atBottom = !selections.includes(allRows[currentIndex + 1]?.[rowKey])

  if (atTop && atBottom) return 'ik-list-row--rounded'
  if (atTop) return 'ik-list-row--rounded-t'
  if (atBottom) return 'ik-list-row--rounded-b'
  return ''
}

  _isGrouped() {
    return this._props.rows.every(r => r.group && Array.isArray(r.rows))
  }

  /* ── Private: column resizer ────────────────────────────────────────────── */

  _attachResizer(resizerWrap, col, columnEl) {
    resizerWrap.addEventListener('mousedown', (e) => {
      const initialX     = e.clientX
      const initialWidth = columnEl.offsetWidth

      const onMouseMove = (e) => {
        document.body.classList.add('select-none')
        document.body.classList.add('cursor-col-resize')
        const handle = resizerWrap.querySelector('.ik-list-header-item__resizer-handle')
        if (handle) handle.style.backgroundColor = 'rgb(199 199 199)'
        let newWidth = initialWidth + (e.clientX - initialX)
        col.width = `${Math.max(50, newWidth)}px`
      }

      const onMouseUp = () => {
        document.body.classList.remove('select-none')
        document.body.classList.remove('cursor-col-resize')
        const handle = resizerWrap.querySelector('.ik-list-header-item__resizer-handle')
        if (handle) handle.style.backgroundColor = ''
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    })
  }
}

/* ─── Exports ─────────────────────────────────────────────────────────────── */
export { IKListView, getGridTemplateColumns, alignmentMap }
export default IKListView

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IKListView
  module.exports.IKListView = IKListView
  module.exports.getGridTemplateColumns = getGridTemplateColumns
  module.exports.alignmentMap = alignmentMap
}
