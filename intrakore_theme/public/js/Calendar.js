/* ============================================================
   Intrakore — Calendar Component
   Converted from Calendar.vue + all sub-components → vanilla JS

   Covers:
     - Calendar root (view switching, nav, keyboard shortcuts)
     - CalendarMonthly (month grid, drag-and-drop)
     - CalendarWeekly (week grid, full-day row, timed events)
     - CalendarDaily (day grid, full-day row, timed events)
     - CalendarMonthEvent (click, dblclick, popover, delete shortcut)
     - CalendarWeekDayEvent (resize, reposition, drag)
     - CalendarTimeMarker (live current time line)
     - ShowMoreCalendarEvent (+N more button)
     - EventModalContent (read-only popover)
     - NewEventModal (create/edit dialog)
     - useCalendarData (event grouping, sorting, overlap)
     - useEventBase (shared event state machine)
     - useEventModal (new event form state)

   Usage:
     IKCalendar.create(el, { events: [...], config: {...} })

   Events dispatched on the host element:
     ik:calendar-create  → { detail: event }
     ik:calendar-update  → { detail: event }
     ik:calendar-delete  → { detail: eventID }
     ik:calendar-range   → { detail: { view, startDate, endDate } }

   Config options (all optional):
     scrollToHour      : number  (default 15)
     disableModes      : string[] (e.g. ['Day'])
     defaultMode       : 'Month' | 'Week' | 'Day'  (default 'Month')
     isEditMode        : boolean (default false)
     eventIcons        : {}
     hourHeight        : number  (default 50)
     enableShortcuts   : boolean (default true)
     showIcon          : boolean (default true)
     timeFormat        : '12h' | '24h'  (default '12h')
     weekends          : string[] (default ['sunday'])
     noBorder          : boolean (default false)
   ============================================================ */

;(function (global) {
  'use strict'

  // ── Color map (replaces calendarUtils.colorMap) ─────────────────────────
  var colorMap = {
    green  : { color: '#16a34a', bg: '#dcfce7', bgHover: '#bbf7d0', bgActive: '#16a34a', text: '#14532d', subtext: '#166534', textActive: '#fff', subtextActive: '#d1fae5', border: '#16a34a', borderActive: '#fff' },
    blue   : { color: '#2563eb', bg: '#dbeafe', bgHover: '#bfdbfe', bgActive: '#2563eb', text: '#1e3a8a', subtext: '#1d4ed8', textActive: '#fff', subtextActive: '#dbeafe', border: '#2563eb', borderActive: '#fff' },
    red    : { color: '#dc2626', bg: '#fee2e2', bgHover: '#fecaca', bgActive: '#dc2626', text: '#7f1d1d', subtext: '#991b1b', textActive: '#fff', subtextActive: '#fee2e2', border: '#dc2626', borderActive: '#fff' },
    violet : { color: '#7c3aed', bg: '#ede9fe', bgHover: '#ddd6fe', bgActive: '#7c3aed', text: '#4c1d95', subtext: '#5b21b6', textActive: '#fff', subtextActive: '#ede9fe', border: '#7c3aed', borderActive: '#fff' },
    amber  : { color: '#d97706', bg: '#fef3c7', bgHover: '#fde68a', bgActive: '#d97706', text: '#78350f', subtext: '#92400e', textActive: '#fff', subtextActive: '#fef3c7', border: '#d97706', borderActive: '#fff' },
    pink   : { color: '#db2777', bg: '#fce7f3', bgHover: '#fbcfe8', bgActive: '#db2777', text: '#831843', subtext: '#9d174d', textActive: '#fff', subtextActive: '#fce7f3', border: '#db2777', borderActive: '#fff' },
    cyan   : { color: '#0891b2', bg: '#cffafe', bgHover: '#a5f3fc', bgActive: '#0891b2', text: '#164e63', subtext: '#155e75', textActive: '#fff', subtextActive: '#cffafe', border: '#0891b2', borderActive: '#fff' },
  }

  var colorMapDark = {
    green  : { color: '#4ade80', bg: '#14532d', bgHover: '#166534', bgActive: '#4ade80', text: '#dcfce7', subtext: '#bbf7d0', textActive: '#14532d', subtextActive: '#dcfce7', border: '#4ade80', borderActive: '#14532d' },
    blue   : { color: '#60a5fa', bg: '#1e3a8a', bgHover: '#1d4ed8', bgActive: '#60a5fa', text: '#dbeafe', subtext: '#bfdbfe', textActive: '#1e3a8a', subtextActive: '#dbeafe', border: '#60a5fa', borderActive: '#1e3a8a' },
    red    : { color: '#f87171', bg: '#7f1d1d', bgHover: '#991b1b', bgActive: '#f87171', text: '#fee2e2', subtext: '#fecaca', textActive: '#7f1d1d', subtextActive: '#fee2e2', border: '#f87171', borderActive: '#7f1d1d' },
    violet : { color: '#a78bfa', bg: '#4c1d95', bgHover: '#5b21b6', bgActive: '#a78bfa', text: '#ede9fe', subtext: '#ddd6fe', textActive: '#4c1d95', subtextActive: '#ede9fe', border: '#a78bfa', borderActive: '#4c1d95' },
    amber  : { color: '#fbbf24', bg: '#78350f', bgHover: '#92400e', bgActive: '#fbbf24', text: '#fef3c7', subtext: '#fde68a', textActive: '#78350f', subtextActive: '#fef3c7', border: '#fbbf24', borderActive: '#78350f' },
    pink   : { color: '#f472b6', bg: '#831843', bgHover: '#9d174d', bgActive: '#f472b6', text: '#fce7f3', subtext: '#fbcfe8', textActive: '#831843', subtextActive: '#fce7f3', border: '#f472b6', borderActive: '#831843' },
    cyan   : { color: '#22d3ee', bg: '#164e63', bgHover: '#155e75', bgActive: '#22d3ee', text: '#cffafe', subtext: '#a5f3fc', textActive: '#164e63', subtextActive: '#cffafe', border: '#22d3ee', borderActive: '#164e63' },
  }

  // ── Time arrays (replaces twelveHoursFormat / twentyFourHoursFormat) ────
  var twelveHoursFormat = (function () {
    var arr = []
    for (var h = 0; h < 24; h++) {
      var suffix = h < 12 ? 'AM' : 'PM'
      var display = h === 0 ? 12 : h > 12 ? h - 12 : h
      arr.push(display + ':00 ' + suffix)
    }
    return arr
  })()

  var twentyFourHoursFormat = (function () {
    var arr = []
    for (var h = 0; h < 24; h++) {
      arr.push(String(h).padStart(2, '0') + ':00')
    }
    return arr
  })()

  var daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  var monthList = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December']

  // ── calendarUtils functions ──────────────────────────────────────────────

  function parseDate(date) {
    var d = new Date(date)
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }

  function parseDateWithDay(date) {
    var d = new Date(date)
    return daysList[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0')
  }

  function parseDateEventPopupFormat(date) {
    var d = new Date(date)
    var options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }
    return d.toLocaleDateString(undefined, options)
  }

  function calculateMinutes(time) {
    if (!time) return 0
    var parts = time.split(':')
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
  }

  function convertMinutesToHours(minutes) {
    if (minutes > 1440) minutes = 1440
    if (minutes < 0) minutes = 0
    var h = Math.floor(minutes / 60)
    var m = minutes % 60
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00'
  }

  function calculateDiff(fromTime, toTime) {
    return calculateMinutes(toTime) - calculateMinutes(fromTime)
  }

  function handleSeconds(time) {
    if (!time) return time
    var parts = time.split(':')
    return parts.length >= 2 ? parts[0] + ':' + parts[1] : time
  }

  function formatMonthYear(month, year) {
    return monthList[month] + ' ' + year
  }

  function formattedDuration(fromTime, toTime, format) {
    if (!fromTime || !toTime) return ''
    var fmt = format === '24h' ? twentyFourHoursFormat : twelveHoursFormat
    var fMins = calculateMinutes(fromTime)
    var tMins = calculateMinutes(toTime)
    var fIdx = Math.floor(fMins / 60)
    var tIdx = Math.floor(tMins / 60)
    return (fmt[fIdx] || fromTime) + ' - ' + (fmt[tIdx] || toTime)
  }

  function isWeekend(date, config) {
    var weekends = (config && config.weekends) ? config.weekends : ['sunday']
    var day = new Date(date).getDay()
    var dayName = daysList[day].toLowerCase()
    return weekends.indexOf(dayName) !== -1
  }

  function getCalendarDates(month, year) {
    var firstDay = new Date(year, month, 1)
    var startDay = firstDay.getDay()
    var dates = []
    for (var i = startDay - 1; i >= 0; i--) {
      dates.push(new Date(year, month, -i))
    }
    var daysInMonth = new Date(year, month + 1, 0).getDate()
    for (var d = 1; d <= daysInMonth; d++) {
      dates.push(new Date(year, month, d))
    }
    var remaining = 42 - dates.length
    for (var r = 1; r <= remaining; r++) {
      dates.push(new Date(year, month + 1, r))
    }
    // trim to 35 or 42
    if (dates.length > 35 && dates[35] && new Date(dates[35]).getMonth() !== month) {
      dates = dates.slice(0, 35)
    }
    return dates
  }

  function groupBy(arr, fn) {
    return arr.reduce(function (acc, item) {
      var key = fn(item)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  }

  function findOverlappingEventsCount(events) {
    events.forEach(function (event, i) {
      var hallNumber = 0
      for (var j = 0; j < i; j++) {
        var prev = events[j]
        if (event.startTime < prev.endTime && event.endTime > prev.startTime) {
          hallNumber++
        }
      }
      event.hallNumber = hallNumber
    })
    return events
  }

  function sortMonthlyEvents(events) {
    var fullDay = events.filter(function (e) { return e.isFullDay })
    var timed = events.filter(function (e) { return !e.isFullDay }).sort(function (a, b) {
      if (a.fromTime !== b.fromTime) return calculateMinutes(a.fromTime) - calculateMinutes(b.fromTime)
      return calculateMinutes(a.toTime) - calculateMinutes(b.toTime)
    })
    return fullDay.concat(timed)
  }

  // ── useCalendarData equivalent ───────────────────────────────────────────

  function getTimedEvents(events, view) {
    var grouped = groupBy(events, function (e) { return e.date })
    var result = {}
    Object.keys(grouped).forEach(function (key) {
      var value = grouped[key]
      if (view === 'Month') {
        result[key] = sortMonthlyEvents(value)
      } else {
        var filtered = value.filter(function (e) { return !e.isFullDay })
        filtered.forEach(function (t) {
          t.startTime = calculateMinutes(t.fromTime)
          t.endTime = calculateMinutes(t.toTime)
        })
        filtered.sort(function (a, b) { return a.startTime - b.startTime })
        result[key] = findOverlappingEventsCount(filtered)
      }
    })
    return result
  }

  function getFullDayEvents(events) {
    var fullDay = events.filter(function (e) { return e.isFullDay })
    return groupBy(fullDay, function (e) { return e.date })
  }

  // ── Color resolver (replaces useEventBase.color()) ──────────────────────

  function getTheme() {
    var attr = document.documentElement.getAttribute('data-theme')
    if (attr) return attr
    return document.documentElement.classList.contains('htw-dark') ? 'dark' : 'light'
  }

  function resolveColor(colorValue) {
    var map = getTheme() === 'dark' ? colorMapDark : colorMap
    if (!colorValue || !colorValue.startsWith('#')) return map[colorValue] || map['green']
    var values = Object.values(map)
    for (var i = 0; i < values.length; i++) {
      if (values[i].color === colorValue) return values[i]
    }
    return map['green']
  }

  function applyEventBgStyle(el, color) {
    var c = resolveColor(color || 'green')
    el.style.setProperty('--bg', c.bg)
    el.style.setProperty('--text', c.text)
    el.style.setProperty('--subtext', c.subtext)
    el.style.setProperty('--text-active', c.textActive)
    el.style.setProperty('--subtext-active', c.subtextActive)
    el.style.setProperty('--bg-hover', c.bgHover)
    el.style.setProperty('--bg-active', c.bgActive)
  }

  function applyEventBorderStyle(el, color) {
    var c = resolveColor(color || 'green')
    el.style.setProperty('--border', c.border)
    el.style.setProperty('--border-active', c.borderActive)
  }

  // ── SVG icons (Feather) ──────────────────────────────────────────────────
  var SVG = {
    x:          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    'edit-2':   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    'trash-2':  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    calendar:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    user:       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    clock:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'map-pin':  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    'chevron-left':  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    'chevron-right': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    'chevron-down':  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    'chevron-up':    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
  }

  function icon(name) {
    return SVG[name] || ''
  }

  // ── DOM helpers ──────────────────────────────────────────────────────────

  function el(tag, cls, attrs) {
    var e = document.createElement(tag)
    if (cls) e.className = cls
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]) })
    return e
  }

  function dispatch(hostEl, name, detail) {
    hostEl.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }))
  }

  // ════════════════════════════════════════════════════════════════
  // EVENT POPOVER (EventModalContent)
  // ════════════════════════════════════════════════════════════════

  function buildEventPopover(calendarEvent, date, isEditMode, onClose, onEdit, onDelete) {
    var wrap = el('div', 'ik-calendar-event-modal')

    // Actions row
    var actions = el('div', 'ik-calendar-event-modal__actions')

    var closeBtn = el('span', 'ik-calendar-event-modal__action-btn')
    closeBtn.innerHTML = icon('x')
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); onClose() })
    actions.appendChild(closeBtn)

    if (isEditMode) {
      var editBtn = el('span', 'ik-calendar-event-modal__action-btn')
      editBtn.innerHTML = icon('edit-2')
      editBtn.addEventListener('click', function (e) { e.stopPropagation(); onEdit() })
      actions.appendChild(editBtn)

      var delBtn = el('span', 'ik-calendar-event-modal__action-btn')
      delBtn.innerHTML = icon('trash-2')
      delBtn.addEventListener('click', function (e) { e.stopPropagation(); onDelete() })
      actions.appendChild(delBtn)
    }
    wrap.appendChild(actions)

    // Title
    var title = el('div', 'ik-calendar-event-modal__title')
    title.textContent = calendarEvent.title || 'New Event'
    wrap.appendChild(title)

    // Details
    var details = el('div', 'ik-calendar-event-modal__details')

    function detailRow(iconName, text) {
      if (!text) return
      var row = el('div', 'ik-calendar-event-modal__detail-row')
      var ico = el('span')
      ico.innerHTML = icon(iconName)
      row.appendChild(ico)
      var span = el('span', 'ik-calendar-event-modal__detail-text')
      span.textContent = text
      row.appendChild(span)
      details.appendChild(row)
    }

    detailRow('calendar', parseDateEventPopupFormat(date))
    if (calendarEvent.participant) detailRow('user', calendarEvent.participant)
    if (calendarEvent.fromTime && calendarEvent.toTime) detailRow('clock', calendarEvent.fromTime + ' - ' + calendarEvent.toTime)
    if (calendarEvent.venue) detailRow('map-pin', calendarEvent.venue)

    wrap.appendChild(details)
    return wrap
  }

  // ── Lightweight inline popover (replaces Popover component) ─────────────

  var activePopover = null

  function showPopover(anchorEl, content) {
    closePopover()
    var pop = el('div', 'ik-popover')
    pop.style.cssText = 'position:fixed;z-index:500;background:transparent;'
    pop.appendChild(content)
    document.body.appendChild(pop)
    activePopover = pop

    var rect = anchorEl.getBoundingClientRect()
    pop.style.left = Math.max(8, rect.left - pop.offsetWidth - 8) + 'px'
    pop.style.top = rect.top + 'px'

    // Reposition after paint
    requestAnimationFrame(function () {
      var pw = pop.offsetWidth
      var left = rect.left - pw - 8
      if (left < 8) left = rect.right + 8
      pop.style.left = left + 'px'
    })

    setTimeout(function () {
      document.addEventListener('click', closePopover, { once: true })
    }, 0)
  }

  function closePopover() {
    if (activePopover && activePopover.parentNode) {
      activePopover.parentNode.removeChild(activePopover)
    }
    activePopover = null
  }

  // ════════════════════════════════════════════════════════════════
  // NEW/EDIT EVENT MODAL (NewEventModal)
  // ════════════════════════════════════════════════════════════════

  function openEventModal(eventData, isNew, onSubmit) {
    var overlay = el('div', 'ik-dialog-overlay')
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;'

    var dialog = el('div', 'ik-dialog')
    dialog.style.cssText = 'background:var(--surface-modal,#fff);border-radius:0.5rem;padding:1.5rem;width:400px;max-width:90vw;'

    var heading = el('h2')
    heading.style.cssText = 'font-size:1.125rem;font-weight:600;margin-bottom:1rem;'
    heading.textContent = isNew ? 'New Event' : 'Edit Event'
    dialog.appendChild(heading)

    var state = {
      title     : eventData.title || '',
      date      : eventData.date || '',
      participant: eventData.participant || '',
      fromDate  : eventData.fromDate || '',
      toDate    : eventData.toDate || '',
      fromTime  : eventData.fromTime || '',
      toTime    : eventData.toTime || '',
      venue     : eventData.venue || '',
      color     : eventData.color || 'green',
      isFullDay : !!eventData.isFullDay,
      id        : eventData.id || '',
    }

    function field(label, inputEl) {
      var wrap = el('div')
      wrap.style.marginBottom = '0.75rem'
      var lbl = el('label')
      lbl.style.cssText = 'display:block;font-size:0.75rem;margin-bottom:0.25rem;color:var(--ink-gray-6);'
      lbl.textContent = label
      wrap.appendChild(lbl)
      wrap.appendChild(inputEl)
      return wrap
    }

    function input(type, value, onChange) {
      var inp = el('input')
      inp.type = type
      inp.value = value
      inp.style.cssText = 'width:100%;border:1px solid var(--outline-gray-1);border-radius:0.25rem;padding:0.375rem 0.5rem;font-size:0.875rem;box-sizing:border-box;'
      inp.addEventListener('input', function () { onChange(inp.value) })
      return inp
    }

    var titleInp = input('text', state.title, function (v) { state.title = v })
    dialog.appendChild(field('Title', titleInp))

    var dateInp = input('date', state.date, function (v) { state.date = v; state.fromDate = v; state.toDate = v })
    dialog.appendChild(field('Date', dateInp))

    var participantInp = input('text', state.participant, function (v) { state.participant = v })
    dialog.appendChild(field('Person', participantInp))

    var fromTimeWrap = field('Start Time', input('time', state.fromTime, function (v) { state.fromTime = v }))
    dialog.appendChild(fromTimeWrap)

    var toTimeWrap = field('End Time', input('time', state.toTime, function (v) { state.toTime = v }))
    dialog.appendChild(toTimeWrap)

    var venueInp = input('text', state.venue, function (v) { state.venue = v })
    dialog.appendChild(field('Venue', venueInp))

    // Color select
    var colorSel = el('select')
    colorSel.style.cssText = 'width:100%;border:1px solid var(--outline-gray-1);border-radius:0.25rem;padding:0.375rem 0.5rem;font-size:0.875rem;text-transform:capitalize;'
    Object.keys(colorMap).forEach(function (c) {
      var opt = el('option')
      opt.value = c
      opt.textContent = c
      opt.style.textTransform = 'capitalize'
      if (c === state.color) opt.selected = true
      colorSel.appendChild(opt)
    })
    colorSel.addEventListener('change', function () { state.color = colorSel.value })
    dialog.appendChild(field('Color', colorSel))

    // Full day checkbox
    var fullDayWrap = el('div')
    fullDayWrap.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;'
    var fullDayCb = el('input')
    fullDayCb.type = 'checkbox'
    fullDayCb.checked = state.isFullDay
    fullDayCb.addEventListener('change', function () {
      state.isFullDay = fullDayCb.checked
      fromTimeWrap.style.display = state.isFullDay ? 'none' : ''
      toTimeWrap.style.display = state.isFullDay ? 'none' : ''
    })
    if (state.isFullDay) { fromTimeWrap.style.display = 'none'; toTimeWrap.style.display = 'none' }
    var fullDayLabel = el('label')
    fullDayLabel.textContent = 'Full Day Event?'
    fullDayLabel.style.fontSize = '0.875rem'
    fullDayWrap.appendChild(fullDayCb)
    fullDayWrap.appendChild(fullDayLabel)
    dialog.appendChild(fullDayWrap)

    // Error
    var errorEl = el('div')
    errorEl.style.cssText = 'color:var(--ink-red-2,red);font-size:0.75rem;margin-bottom:0.5rem;'
    dialog.appendChild(errorEl)

    // Actions
    var actionsRow = el('div')
    actionsRow.style.cssText = 'display:flex;justify-content:flex-end;gap:0.5rem;'

    var cancelBtn = el('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.style.cssText = 'padding:0.375rem 0.75rem;border-radius:0.25rem;border:1px solid var(--outline-gray-1);background:transparent;cursor:pointer;font-size:0.875rem;'
    cancelBtn.addEventListener('click', function () { document.body.removeChild(overlay) })
    actionsRow.appendChild(cancelBtn)

    var submitBtn = el('button')
    submitBtn.textContent = 'Submit'
    submitBtn.style.cssText = 'padding:0.375rem 0.75rem;border-radius:0.25rem;border:none;background:var(--surface-blueprint-5,#000fce);color:#fff;cursor:pointer;font-size:0.875rem;'
    submitBtn.addEventListener('click', function () {
      // Validate
      if (!state.date) { errorEl.textContent = 'Date is required'; return }
      if (!state.fromTime && !state.isFullDay) { errorEl.textContent = 'Start Time is required'; return }
      if (!state.toTime && !state.isFullDay) { errorEl.textContent = 'End Time is required'; return }
      if (!state.isFullDay && calculateDiff(state.fromTime, state.toTime) <= 0) {
        errorEl.textContent = 'Start time must be less than End Time'; return
      }
      errorEl.textContent = ''

      if (state.isFullDay) { state.fromTime = ''; state.toTime = '' }
      else { state.fromTime = handleSeconds(state.fromTime); state.toTime = handleSeconds(state.toTime) }

      state.fromDateTime = state.fromDate + ' ' + state.fromTime
      state.toDateTime = state.toDate + ' ' + state.toTime

      if (!state.id) {
        state.id = '#' + Math.random().toString(36).substring(3, 9)
      }

      document.body.removeChild(overlay)
      onSubmit(state)
    })
    actionsRow.appendChild(submitBtn)
    dialog.appendChild(actionsRow)

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) document.body.removeChild(overlay)
    })
  }

  // ════════════════════════════════════════════════════════════════
  // TIME MARKER
  // ════════════════════════════════════════════════════════════════

  function buildTimeMarker(date, minuteHeight) {
    var wrap = el('div', 'ik-calendar-time-marker')
    var line = el('div', 'ik-calendar-time-marker__line')

    var tooltip = el('div')
    tooltip.appendChild(line)
    wrap.appendChild(tooltip)

    function update() {
      var now = new Date()
      if (new Date(date).toDateString() !== now.toDateString()) {
        wrap.style.display = 'none'
        return
      }
      wrap.style.display = ''
      var top = (now.getHours() * 60 + now.getMinutes()) * minuteHeight
      wrap.style.top = top + 'px'
    }

    update()
    var interval = setInterval(update, 60000)
    wrap._interval = interval

    return wrap
  }

  // ════════════════════════════════════════════════════════════════
  // MONTH EVENT (CalendarMonthEvent)
  // ════════════════════════════════════════════════════════════════

  function buildMonthEvent(calendarEvent, date, config, calendarActions) {
    var wrap = el('div', 'ik-calendar-event')
    applyEventBgStyle(wrap, calendarEvent.color)
    applyEventBorderStyle(wrap, calendarEvent.color)

    if (calendarEvent.fromTime) {
      var border = el('div', 'ik-calendar-event__border')
      wrap.appendChild(border)
    }

    var inner = el('div')
    inner.style.cssText = 'position:relative;display:flex;height:100%;user-select:none;align-items:flex-start;gap:0.5rem;overflow:hidden;'

    var titleEl = el('p', 'ik-calendar-event__title' + (!calendarEvent.title ? ' ik-calendar-event__title--italic' : ''))
    titleEl.textContent = calendarEvent.title || '[No title]'
    inner.appendChild(titleEl)
    wrap.appendChild(inner)

    var clickTimer = null
    var preventClick = false

    wrap.addEventListener('click', function (e) {
      e.stopPropagation()
      if (preventClick) { preventClick = false; return }
      if (e.detail === 1) {
        clickTimer = setTimeout(function () {
          showPopover(wrap, buildEventPopover(
            calendarEvent, date, config.isEditMode,
            function () { closePopover() },
            function () { closePopover(); openEventModal(calendarEvent, false, function (updated) { calendarActions.updateEventState(updated) }) },
            function () { closePopover(); calendarActions.deleteEvent(calendarEvent.id) }
          ))
        }, 200)
      }
    })

    wrap.addEventListener('dblclick', function (e) {
      e.preventDefault()
      clearTimeout(clickTimer)
      if (!config.isEditMode) return
      openEventModal(calendarEvent, false, function (updated) { calendarActions.updateEventState(updated) })
    })

    if (config.isEditMode) {
      wrap.setAttribute('draggable', 'true')
    }

    return wrap
  }

  // ════════════════════════════════════════════════════════════════
  // WEEK/DAY EVENT (CalendarWeekDayEvent)
  // ════════════════════════════════════════════════════════════════

  function buildWeekEvent(calendarEvent, date, config, calendarActions, minuteHeight, activeView) {
    var isFullDay = calendarEvent.isFullDay
    var height15Min = minuteHeight * 15
    var heightThreshold = 40
    var minimumHeight = 32.5

    // Container (position:absolute for timed, inline for full-day)
    var container = el('div')

    if (!isFullDay) {
      var diff = calculateDiff(calendarEvent.fromTime, calendarEvent.toTime)
      var height = diff * minuteHeight
      if (height < heightThreshold) height = minimumHeight
      var top = calculateMinutes(calendarEvent.fromTime) * minuteHeight
      var hallNumber = calendarEvent.hallNumber || 0
      var width = (93 - hallNumber * 20) + '%'
      var left = (hallNumber * 20) + '%'
      container.style.cssText = 'position:absolute;top:' + top + 'px;left:' + left + ';width:' + width + ';height:' + height + 'px;transition:all 0.1s ease;'
    } else {
      container.style.cssText = 'flex-shrink:0;margin:0 1px;'
    }

    // Inner event element
    var inner = el('div', 'ik-calendar-week-event')
    inner.style.cssText = 'height:100%;width:100%;cursor:pointer;'
    applyEventBgStyle(inner, calendarEvent.color)
    applyEventBorderStyle(inner, calendarEvent.color)

    var innerContent = el('div', 'ik-calendar-week-event__inner')

    if (calendarEvent.fromTime) {
      var border = el('div', 'ik-calendar-event__border')
      border.style.height = '100%'
      innerContent.appendChild(border)
    }

    var textCol = el('div')
    textCol.style.cssText = 'display:flex;flex-direction:column;gap:0.125rem;overflow:hidden;width:fit-content;'

    var titleEl = el('p', 'ik-calendar-week-event__title line-clamp-1')
    titleEl.textContent = calendarEvent.title || '[No title]'
    textCol.appendChild(titleEl)

    if (!isFullDay) {
      var timeEl = el('p', 'ik-calendar-week-event__time')
      timeEl.textContent = formattedDuration(calendarEvent.fromTime, calendarEvent.toTime, config.timeFormat)
      textCol.appendChild(timeEl)
    }

    innerContent.appendChild(textCol)
    inner.appendChild(innerContent)

    // Resize handle
    if (config.isEditMode && !isFullDay) {
      var resizeHandle = el('div', 'ik-calendar-week-event__resize-handle')
      resizeHandle.addEventListener('mousedown', function (e) {
        e.stopPropagation()
        var startY = e.clientY
        var origHeight = container.offsetHeight
        var origToTime = calendarEvent.toTime

        function onMouseMove(ev) {
          var diffY = ev.clientY - startY
          var newH = Math.max(minimumHeight, Math.round((origHeight + diffY) / height15Min) * height15Min)
          container.style.height = newH + 'px'
          var newEndMinutes = calculateMinutes(calendarEvent.fromTime) + Math.round(newH / minuteHeight)
          calendarEvent.toTime = convertMinutesToHours(Math.min(newEndMinutes, 1440))
          timeEl && (timeEl.textContent = formattedDuration(calendarEvent.fromTime, calendarEvent.toTime, config.timeFormat))
        }

        function onMouseUp() {
          if (origToTime !== calendarEvent.toTime) calendarActions.updateEventState(calendarEvent)
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('mouseup', onMouseUp)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
      })
      inner.appendChild(resizeHandle)
    }

    container.appendChild(inner)

    // Click → popover
    var clickTimer = null
    inner.addEventListener('click', function (e) {
      e.preventDefault()
      if (e.detail === 1) {
        clickTimer = setTimeout(function () {
          showPopover(inner, buildEventPopover(
            calendarEvent, date, config.isEditMode,
            function () { closePopover() },
            function () { closePopover(); openEventModal(calendarEvent, false, function (u) { calendarActions.updateEventState(u) }) },
            function () { closePopover(); calendarActions.deleteEvent(calendarEvent.id) }
          ))
        }, 200)
      }
    })

    inner.addEventListener('dblclick', function (e) {
      e.preventDefault()
      clearTimeout(clickTimer)
      if (!config.isEditMode) return
      openEventModal(calendarEvent, false, function (u) { calendarActions.updateEventState(u) })
    })

    // Reposition (drag within grid)
    if (config.isEditMode) {
      inner.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return
        var prevY = e.clientY
        var rect = container.getBoundingClientRect()
        var isRepositioning = false
        var updatedFromTime = calendarEvent.fromTime
        var updatedToTime = calendarEvent.toTime
        var updatedDate = calendarEvent.date
        var origFromTime = calendarEvent.fromTime
        var origToTime = calendarEvent.toTime
        var origDate = calendarEvent.date

        function onMove(ev) {
          closePopover()
          isRepositioning = true
          inner.style.cursor = 'grabbing'

          if (!isFullDay) {
            var diffY = ev.clientY - prevY
            var grid = inner.closest('[data-time-grid]')
            if (grid) {
              var gRect = grid.getBoundingClientRect()
              if (ev.clientY < gRect.top) diffY = gRect.top - rect.top
              if (ev.clientY > gRect.bottom) diffY = gRect.bottom - rect.bottom
            }
            diffY = Math.round(diffY / height15Min) * height15Min
            container.style.transform = 'translateY(' + diffY + 'px)'
            updatedFromTime = convertMinutesToHours(calculateMinutes(calendarEvent.fromTime) + Math.round(diffY / minuteHeight))
            updatedToTime = convertMinutesToHours(calculateMinutes(calendarEvent.toTime) + Math.round(diffY / minuteHeight))
          }
        }

        function onUp(ev) {
          inner.style.cursor = 'pointer'
          container.style.transform = ''

          if (isRepositioning) {
            var updated = false
            if (updatedFromTime !== origFromTime || updatedToTime !== origToTime) {
              calendarEvent.fromTime = updatedFromTime
              calendarEvent.toTime = updatedToTime
              calendarEvent.fromDateTime = calendarEvent.fromDate + ' ' + updatedFromTime
              calendarEvent.toDateTime = calendarEvent.toDate + ' ' + updatedToTime
              updated = true
            }
            if (updated) calendarActions.updateEventState(calendarEvent)
          }

          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('mouseup', onUp)
        }

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
      })
    }

    // Time marker
    var marker = buildTimeMarker(date, minuteHeight)
    container.appendChild(marker)

    return container
  }

  // ════════════════════════════════════════════════════════════════
  // MONTHLY VIEW
  // ════════════════════════════════════════════════════════════════

  function renderMonthly(hostEl, events, currentMonth, currentMonthDates, config, calendarActions) {
    hostEl.innerHTML = ''
    var wrapper = el('div', 'ik-calendar-monthly')

    // Day header row
    var header = el('div', 'ik-calendar-monthly__days-header')
    daysList.forEach(function (d) {
      var span = el('span', 'ik-calendar-monthly__day-label')
      span.textContent = d
      header.appendChild(span)
    })
    wrapper.appendChild(header)

    // Timed events map (Month view = all events grouped + sorted)
    var timedEventsMap = getTimedEvents(events, 'Month')

    // Grid
    var rowCount = currentMonthDates.length > 35 ? 6 : 5
    var maxEventsInCell = rowCount === 6 ? 1 : 2
    var grid = el('div', 'ik-calendar-monthly__grid ik-calendar-monthly__grid--' + rowCount + '-rows' + (!config.noBorder ? ' ik-calendar-monthly__grid--bordered' : ''))

    currentMonthDates.forEach(function (date, i) {
      var cell = el('div', 'ik-calendar-monthly__cell' +
        (config.noBorder ? ' ik-calendar-monthly__cell--border-sides' + (i % 7 === 0 ? ' ik-calendar-monthly__cell--no-border-left' : '') : ' ik-calendar-monthly__cell--bordered') +
        (isWeekend(date, config) ? ' ik-calendar-monthly__cell--weekend' : ''))

      cell.addEventListener('dragover', function (e) { e.preventDefault() })
      cell.addEventListener('dragenter', function (e) { e.preventDefault() })
      cell.addEventListener('drop', function (e) {
        var id = e.dataTransfer.getData('calendarEventID')
        if (!id) return
        var evt = events.find(function (ev) { return ev.id === id })
        if (!evt || parseDate(date) === evt.date) return
        evt.date = parseDate(date)
        evt.fromDate = evt.date; evt.toDate = evt.date
        evt.fromDateTime = evt.date + ' ' + evt.fromTime
        evt.toDateTime = evt.date + ' ' + evt.toTime
        calendarActions.updateEventState(evt)
      })
      cell.addEventListener('click', function (e) {
        calendarActions.handleCellClick(e, date)
      })

      // Date number
      var isToday = date.toDateString() === new Date().toDateString()
      var isCurrentMonth = date.getMonth() === currentMonth

      var dateRow = el('div', 'ik-calendar-monthly__date-row ' + (isToday ? 'ik-calendar-monthly__date-row--today' : 'ik-calendar-monthly__date-row--normal'))
      dateRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;'
      var placeholder = el('div')
      dateRow.appendChild(placeholder)

      var dateNum = el('div', 'ik-calendar-monthly__date-num' +
        (isToday ? ' ik-calendar-monthly__date-num--today' : (isCurrentMonth ? ' ik-calendar-monthly__date-num--current-month' : ' ik-calendar-monthly__date-num--other-month')))
      dateNum.textContent = date.getDate()
      dateNum.addEventListener('click', function (e) {
        e.stopPropagation()
        calendarActions.updateActiveView('Day', date,
          date.getMonth() < currentMonth,
          date.getMonth() > currentMonth)
      })
      dateRow.appendChild(dateNum)
      cell.appendChild(dateRow)

      // Events
      var dateKey = parseDate(date)
      var cellEvents = timedEventsMap[dateKey] || []

      var eventsWrap = el('div')
      eventsWrap.style.cssText = 'display:flex;flex-direction:column;width:100%;'

      if (cellEvents.length <= maxEventsInCell) {
        cellEvents.forEach(function (calendarEvent) {
          var eventEl = buildMonthEvent(calendarEvent, date, config, calendarActions)
          eventEl.style.marginBottom = '0.5rem'
          if (config.isEditMode) {
            eventEl.addEventListener('dragstart', function (e) {
              e.target.style.opacity = '0.5'
              e.dataTransfer.dropEffect = 'move'
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('calendarEventID', calendarEvent.id)
            })
            eventEl.addEventListener('dragend', function (e) { e.target.style.opacity = '1' })
          }
          eventsWrap.appendChild(eventEl)
        })
      } else {
        // Show up to maxEventsInCell then "+N more"
        cellEvents.slice(0, maxEventsInCell).forEach(function (calendarEvent) {
          eventsWrap.appendChild(buildMonthEvent(calendarEvent, date, config, calendarActions))
        })
        var moreBtn = el('button', 'ik-calendar-show-more')
        moreBtn.textContent = (cellEvents.length - maxEventsInCell) + ' more'
        moreBtn.addEventListener('click', function (e) {
          e.stopPropagation()
          calendarActions.updateActiveView('Day', date)
        })
        eventsWrap.appendChild(moreBtn)
      }

      cell.appendChild(eventsWrap)
      grid.appendChild(cell)
    })

    wrapper.appendChild(grid)
    hostEl.appendChild(wrapper)
  }

  // ════════════════════════════════════════════════════════════════
  // WEEK/DAY SHARED: timed grid column
  // ════════════════════════════════════════════════════════════════

  function buildTimedColumn(date, events, config, calendarActions, minuteHeight, timeArray, isFirst, isLast, activeView) {
    var col = el('div', 'ik-calendar-weekly__col' +
      (isFirst ? ' ik-calendar-weekly__col--first calendar-column' : '') +
      (!isLast || !config.noBorder ? ' ik-calendar-weekly__col--right-border' : '') +
      (isWeekend(date, config) ? ' ik-calendar-weekly__col--weekend' : ''))
    col.setAttribute('data-date-attr', date)
    col.setAttribute('data-time-grid', '')

    // Hour cells
    timeArray.forEach(function (time, i) {
      var cell = el('div', 'ik-calendar-weekly__hour-cell')
      cell.setAttribute('data-time-attr', i === 0 ? '' : time)
      cell.addEventListener('click', function (e) {
        calendarActions.handleCellClick(e, date, time)
      })
      var inner = el('div', 'ik-calendar-weekly__hour-cell-inner' + (i !== timeArray.length - 1 ? ' ik-calendar-weekly__hour-cell-inner--bordered' : ''))
      inner.style.height = config.hourHeight + 'px'
      cell.appendChild(inner)
      col.appendChild(cell)
    })

    // Timed events
    var timedMap = getTimedEvents(events, 'Week')
    var colEvents = timedMap[parseDate(date)] || []
    colEvents.forEach(function (calendarEvent) {
      col.appendChild(buildWeekEvent(calendarEvent, date, config, calendarActions, minuteHeight, activeView))
    })

    // Time marker
    col.appendChild(buildTimeMarker(date, minuteHeight))

    return col
  }

  // ════════════════════════════════════════════════════════════════
  // WEEKLY VIEW
  // ════════════════════════════════════════════════════════════════

  function renderWeekly(hostEl, events, weeklyDates, config, calendarActions) {
    hostEl.innerHTML = ''
    var minuteHeight = config.hourHeight / 60
    var timeArray = config.timeFormat === '24h' ? twentyFourHoursFormat : twelveHoursFormat
    var fullDayMap = getFullDayEvents(events)

    var wrapper = el('div', 'ik-calendar-weekly')

    // ── Day header ──
    var headerRow = el('div', 'ik-calendar-weekly__header')
    var spacer = el('div', 'ik-calendar__time-spacer')
    headerRow.appendChild(spacer)
    var headerGrid = el('div')
    headerGrid.style.cssText = 'display:grid;width:100%;grid-template-columns:repeat(7,1fr);'
    weeklyDates.forEach(function (date) {
      var isToday = new Date(date).toDateString() === new Date().toDateString()
      var span = el('span', 'ik-calendar-weekly__day-label')
      span.addEventListener('click', function () { calendarActions.updateActiveView('Day', date) })
      if (isToday) {
        span.textContent = daysList[new Date(date).getDay()]
        var badge = el('span', 'ik-calendar-weekly__today-badge')
        badge.textContent = new Date(date).getDate()
        span.appendChild(badge)
      } else {
        span.textContent = parseDateWithDay(date)
      }
      headerGrid.appendChild(span)
    })
    headerRow.appendChild(headerGrid)
    wrapper.appendChild(headerRow)

    // ── Full-day row ──
    var maxFullDay = weeklyDates.reduce(function (max, d) {
      return Math.max(max, (fullDayMap[parseDate(d)] || []).length)
    }, 0)
    var showCollapsable = maxFullDay > 3
    var isCollapsed = true

    var fullDayRow = el('div', 'ik-calendar-weekly__fullday-row ' + (config.noBorder ? 'ik-calendar-weekly__fullday-row--no-border' : 'ik-calendar-weekly__fullday-row--bordered'))
    var allDayLabel = el('div', 'ik-calendar-weekly__allday-label')
    var allDayText = el('div', 'ik-calendar-weekly__allday-text')
    allDayText.textContent = 'All day'
    allDayLabel.appendChild(allDayText)

    if (showCollapsable) {
      allDayLabel.style.cursor = 'pointer'
      var chevronEl = el('span')
      chevronEl.innerHTML = icon('chevron-up')
      allDayLabel.appendChild(chevronEl)
      allDayLabel.addEventListener('click', function () {
        isCollapsed = !isCollapsed
        chevronEl.innerHTML = icon(isCollapsed ? 'chevron-down' : 'chevron-up')
        refreshFullDayGrid()
      })
    }

    fullDayRow.appendChild(allDayLabel)

    var fullDayGrid = el('div', 'ik-calendar-weekly__fullday-grid')
    fullDayRow.appendChild(fullDayGrid)
    wrapper.appendChild(fullDayRow)

    function refreshFullDayGrid() {
      fullDayGrid.innerHTML = ''
      weeklyDates.forEach(function (date, idx) {
        var cell = el('div')
        cell.style.cssText = 'display:flex;flex-direction:column;gap:0.25rem;padding:0.25rem 0;width:100%;cursor:pointer;'
        cell.setAttribute('data-date-attr', date)
        cell.addEventListener('click', function (e) {
          calendarActions.handleCellClick(e, date, '', true)
        })

        var dayEvents = fullDayMap[parseDate(date)] || []
        var visibleEvents = (!showCollapsable || !isCollapsed) ? dayEvents : dayEvents.slice(0, 2)
        visibleEvents.forEach(function (calendarEvent, i) {
          cell.appendChild(buildWeekEvent({ ...calendarEvent, idx: i }, date, config, calendarActions, minuteHeight, 'Week'))
        })
        if (showCollapsable && isCollapsed && dayEvents.length > 2) {
          var moreBtn = el('button', 'ik-calendar-more-btn')
          moreBtn.textContent = (dayEvents.length - 2) + ' more'
          moreBtn.addEventListener('click', function (e) { e.stopPropagation(); isCollapsed = false; refreshFullDayGrid() })
          cell.appendChild(moreBtn)
        }
        fullDayGrid.appendChild(cell)
      })
    }

    refreshFullDayGrid()

    // ── Timed grid ──
    var gridWrapper = el('div', 'ik-calendar-weekly__grid-wrapper' + (!config.noBorder ? ' ik-calendar-weekly__grid-wrapper--bordered' : ''))

    var innerFlex = el('div')
    innerFlex.style.cssText = 'display:flex;'

    // Time labels column
    var timeCol = el('div', 'ik-calendar__time-column')
    for (var t = 0; t < 24; t++) {
      var lbl = el('span', 'ik-calendar__time-label')
      lbl.style.height = config.hourHeight + 'px'
      timeCol.appendChild(lbl)
    }
    innerFlex.appendChild(timeCol)

    // Now line (bg-[#F79596])
    var nowLine = el('div', 'ik-calendar-weekly__now-line')
    function updateNowLine() {
      var now = new Date()
      nowLine.style.top = ((now.getHours() * 60 + now.getMinutes()) * minuteHeight) + 'px'
    }
    updateNowLine()
    setInterval(updateNowLine, 60000)

    // 7-col timed grid
    var timedGrid = el('div', 'ik-calendar-weekly__timed-grid')
    timedGrid.style.cssText = 'position:relative;'
    timedGrid.appendChild(nowLine)

    weeklyDates.forEach(function (date, idx) {
      timedGrid.appendChild(buildTimedColumn(
        date, events, config, calendarActions, minuteHeight, timeArray,
        idx === 0, idx === weeklyDates.length - 1, 'Week'
      ))
    })

    innerFlex.appendChild(timedGrid)
    gridWrapper.appendChild(innerFlex)
    wrapper.appendChild(gridWrapper)
    hostEl.appendChild(wrapper)

    // Scroll to hour
    requestAnimationFrame(function () {
      var scrollTo = config.scrollToHour || new Date().getHours()
      gridWrapper.scrollTop = scrollTo * 60 * minuteHeight - 10
    })
  }

  // ════════════════════════════════════════════════════════════════
  // DAILY VIEW
  // ════════════════════════════════════════════════════════════════

  function renderDaily(hostEl, events, currentDate, config, calendarActions) {
    hostEl.innerHTML = ''
    var minuteHeight = config.hourHeight / 60
    var timeArray = config.timeFormat === '24h' ? twentyFourHoursFormat : twelveHoursFormat
    var fullDayMap = getFullDayEvents(events)
    var dayEvents = fullDayMap[parseDate(currentDate)] || []
    var showCollapsable = dayEvents.length > 4
    var isCollapsed = true

    var wrapper = el('div', 'ik-calendar-daily')

    // ── Full-day row ──
    var fullDayRow = el('div', 'ik-calendar-daily__fullday-row ' + (config.noBorder ? 'ik-calendar-daily__fullday-row--no-border' : 'ik-calendar-daily__fullday-row--bordered'))

    var allDayLabel = el('div', 'ik-calendar-daily__allday-label')
    var allDayText = el('div', 'ik-calendar-daily__allday-text')
    allDayText.textContent = 'All day'
    allDayLabel.appendChild(allDayText)
    if (showCollapsable) {
      allDayLabel.style.cursor = 'pointer'
      var chevronEl = el('span')
      chevronEl.innerHTML = icon(isCollapsed ? 'chevron-down' : 'chevron-up')
      allDayLabel.appendChild(chevronEl)
      allDayLabel.addEventListener('click', function () {
        isCollapsed = !isCollapsed
        chevronEl.innerHTML = icon(isCollapsed ? 'chevron-down' : 'chevron-up')
        refreshDayFullDay()
      })
    }
    fullDayRow.appendChild(allDayLabel)

    var fullDayEventsWrap = el('div', 'ik-calendar-daily__fullday-events')
    fullDayEventsWrap.setAttribute('data-date-attr', currentDate)
    fullDayEventsWrap.addEventListener('click', function (e) {
      calendarActions.handleCellClick(e, currentDate, '', true)
    })
    fullDayRow.appendChild(fullDayEventsWrap)
    wrapper.appendChild(fullDayRow)

    function refreshDayFullDay() {
      fullDayEventsWrap.innerHTML = ''
      var visible = (!showCollapsable || !isCollapsed) ? dayEvents : dayEvents.slice(0, 4)
      visible.forEach(function (calendarEvent, i) {
        var ev = buildWeekEvent({ ...calendarEvent, idx: i }, currentDate, config, calendarActions, minuteHeight, 'Day')
        ev.addEventListener('click', function (e) { e.stopPropagation() })
        fullDayEventsWrap.appendChild(ev)
      })
      if (showCollapsable && isCollapsed && dayEvents.length > 4) {
        var moreBtn = el('button', 'ik-calendar-more-btn')
        moreBtn.textContent = (dayEvents.length - 4) + ' more'
        moreBtn.addEventListener('click', function (e) { e.stopPropagation(); isCollapsed = false; refreshDayFullDay() })
        fullDayEventsWrap.appendChild(moreBtn)
      }
    }
    refreshDayFullDay()

    // ── Timed grid ──
    var outerH = el('div')
    outerH.style.cssText = 'height:100%;overflow:hidden;'

    var gridWrapper = el('div', 'ik-calendar-daily__grid-wrapper ' + (config.noBorder ? 'ik-calendar-daily__grid-wrapper--no-border' : 'ik-calendar-daily__grid-wrapper--bordered'))

    var timeCol = el('div', 'ik-calendar__time-column')
    for (var h = 0; h < 24; h++) {
      var lbl = el('span', 'ik-calendar__time-label')
      lbl.style.height = config.hourHeight + 'px'
      timeCol.appendChild(lbl)
    }
    gridWrapper.appendChild(timeCol)

    var colWrap = el('div')
    colWrap.style.cssText = 'display:grid;height:100%;width:100%;grid-template-columns:1fr;padding-bottom:0.5rem;'

    var col = el('div', 'ik-calendar-daily__col calendar-column' + (!config.noBorder ? ' ik-calendar-daily__col--right-border' : ''))
    col.setAttribute('data-time-grid', '')

    timeArray.forEach(function (time, i) {
      var cell = el('div', 'ik-calendar-daily__hour-cell')
      cell.setAttribute('data-time-attr', i === 0 ? '' : time)
      cell.addEventListener('click', function (e) {
        calendarActions.handleCellClick(e, currentDate, time)
      })
      var inner = el('div', 'ik-calendar-daily__hour-cell-inner' + (i !== timeArray.length - 1 ? ' ik-calendar-daily__hour-cell-inner--bordered' : ''))
      inner.style.height = config.hourHeight + 'px'
      cell.appendChild(inner)
      col.appendChild(cell)
    })

    // Timed events
    var timedMap = getTimedEvents(events, 'Day')
    var timedEvents = timedMap[parseDate(currentDate)] || []
    timedEvents.forEach(function (calendarEvent) {
      col.appendChild(buildWeekEvent(calendarEvent, currentDate, config, calendarActions, minuteHeight, 'Day'))
    })

    col.appendChild(buildTimeMarker(currentDate, minuteHeight))
    colWrap.appendChild(col)
    gridWrapper.appendChild(colWrap)
    outerH.appendChild(gridWrapper)
    wrapper.appendChild(outerH)
    hostEl.appendChild(wrapper)

    requestAnimationFrame(function () {
      var scrollTo = config.scrollToHour || new Date().getHours()
      gridWrapper.scrollTop = scrollTo * 60 * minuteHeight - 10
    })
  }

  // ════════════════════════════════════════════════════════════════
  // CALENDAR ROOT
  // ════════════════════════════════════════════════════════════════

  var instances = new WeakMap()

  var IKCalendar = {

    create: function (hostEl, opts) {
      opts = opts || {}

      var defaultConfig = {
        scrollToHour   : 15,
        disableModes   : [],
        defaultMode    : 'Month',
        isEditMode     : false,
        eventIcons     : {},
        hourHeight     : 50,
        enableShortcuts: true,
        showIcon       : true,
        timeFormat     : '12h',
        weekends       : ['sunday'],
        noBorder       : false,
      }
      var config = Object.assign({}, defaultConfig, opts.config || {})

      var events = (opts.events || []).map(function (ev) {
        var e = Object.assign({}, ev)
        e.date = e.fromDate
        e.fromDateTime = e.fromDate + ' ' + e.fromTime
        e.toDateTime = e.toDate + ' ' + e.toTime
        if (e.fromTime) e.fromTime = handleSeconds(e.fromTime)
        if (e.toTime) e.toTime = handleSeconds(e.toTime)
        return e
      })

      var activeView = config.defaultMode
      var today = new Date()
      var currentYear = today.getFullYear()
      var currentMonth = today.getMonth()
      var currentMonthDates = []
      var datesInWeeks = []
      var currentWeekIdx = 0
      var currentDateIdx = 0
      var lastRangeKey = ''

      var allModes = [
        { label: 'Day', value: 'Day' },
        { label: 'Week', value: 'Week' },
        { label: 'Month', value: 'Month' },
      ]
      var enabledModes = allModes.filter(function (m) {
        return config.disableModes.indexOf(m.value) === -1
      })

      // ── Computed dates ────────────────────────────────────────
      function recomputeDates() {
        currentMonthDates = getCalendarDates(currentMonth, currentYear)
        datesInWeeks = []
        var copy = currentMonthDates.slice()
        while (copy.length) { datesInWeeks.push(copy.splice(0, 7)) }
      }

      function findCurrentWeek(date) {
        var d = new Date(date)
        return datesInWeeks.findIndex(function (week) {
          return week.find(function (w) { return new Date(w).toDateString() === d.toDateString() })
        })
      }

      function findIndexOfDate(date) {
        var d = new Date(date)
        return currentMonthDates.findIndex(function (m) {
          return new Date(m).toDateString() === d.toDateString()
        })
      }

      recomputeDates()
      currentDateIdx = findIndexOfDate(today)
      if (currentDateIdx < 0) currentDateIdx = 0
      currentWeekIdx = findCurrentWeek(today)
      if (currentWeekIdx < 0) currentWeekIdx = 0

      // ── Current month/year label ──────────────────────────────
      function getLabel() {
        if (activeView === 'Day') {
          var d = currentMonthDates[currentDateIdx]
          return d ? new Date(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : formatMonthYear(currentMonth, currentYear)
        }
        if (activeView !== 'Week') return formatMonthYear(currentMonth, currentYear)
        var weekDates = datesInWeeks[currentWeekIdx] || []
        if (!weekDates.length) return formatMonthYear(currentMonth, currentYear)
        var months = [...new Set(weekDates.map(function (d) { return new Date(d).getMonth() }))]
        var short = monthList.map(function (m) { return m.slice(0, 3) })
        if (months.length === 1) return formatMonthYear(months[0], new Date(weekDates[0]).getFullYear())
        return short[months[0]] + ' - ' + short[months[months.length - 1]] + ' ' + new Date(weekDates[0]).getFullYear()
      }

      // ── CRUD ──────────────────────────────────────────────────
      var calendarActions = {
        createNewEvent: function (event) {
          event.fromDateTime = event.fromDate + ' ' + event.fromTime
          event.toDateTime = event.toDate + ' ' + event.toTime
          events.push(event)
          render()
          dispatch(hostEl, 'ik:calendar-create', event)
        },
        updateEventState: function (event) {
          event.fromDateTime = event.fromDate + ' ' + event.fromTime
          event.toDateTime = event.toDate + ' ' + event.toTime
          var idx = events.findIndex(function (e) { return e.id === event.id })
          if (idx !== -1) events[idx] = event
          render()
          dispatch(hostEl, 'ik:calendar-update', event)
        },
        deleteEvent: function (id) {
          var idx = events.findIndex(function (e) { return e.id === id })
          if (idx !== -1) events.splice(idx, 1)
          render()
          dispatch(hostEl, 'ik:calendar-delete', id)
        },
        handleCellClick: function (e, date, time, isFullDay) {
          time = time || ''; isFullDay = !!isFullDay
          if (!config.isEditMode) return
          var newEvent = {
            date: parseDate(new Date(date)),
            fromDate: parseDate(new Date(date)),
            toDate: parseDate(new Date(date)),
            fromTime: time,
            toTime: time ? convertMinutesToHours(calculateMinutes(time) + 60) : '',
            isFullDay: isFullDay,
            title: '', participant: '', venue: '', color: 'green',
          }
          openEventModal(newEvent, true, function (event) {
            calendarActions.createNewEvent(event)
          })
        },
        updateActiveView: function (view, date, isPreviousMonth, isNextMonth) {
          activeView = view
          if (date) {
            if (isPreviousMonth) decrementMonth()
            if (isNextMonth) incrementMonth()
            recomputeDates()
            currentDateIdx = findIndexOfDate(date)
            if (currentDateIdx < 0) currentDateIdx = 0
            currentWeekIdx = findCurrentWeek(date)
            if (currentWeekIdx < 0) currentWeekIdx = 0
          }
          render()
        },
      }

      // ── Navigation ────────────────────────────────────────────
      function incrementMonth() {
        currentMonth++
        if (currentMonth > 11) { currentMonth = 0; currentYear++ }
        recomputeDates()
        currentDateIdx = currentMonthDates.findIndex(function (d) { return new Date(d).getMonth() === currentMonth })
        if (currentDateIdx < 0) currentDateIdx = 0
        currentWeekIdx = findCurrentWeek(currentMonthDates[currentDateIdx])
        if (currentWeekIdx < 0) currentWeekIdx = 0
      }

      function decrementMonth() {
        if (currentMonth === 0) { currentMonth = 11; currentYear-- } else { currentMonth-- }
        recomputeDates()
        currentDateIdx = currentMonthDates.findLastIndex(function (d) { return new Date(d).getMonth() === currentMonth })
        if (currentDateIdx < 0) currentDateIdx = 0
        currentWeekIdx = findCurrentWeek(currentMonthDates[currentDateIdx])
        if (currentWeekIdx < 0) currentWeekIdx = 0
      }

      function increment() {
        if (activeView === 'Month') { incrementMonth() }
        else if (activeView === 'Week') {
          currentWeekIdx++
          if (currentWeekIdx >= datesInWeeks.length) { incrementMonth(); currentWeekIdx = 0 }
        }
        else { currentDateIdx++; if (currentDateIdx >= currentMonthDates.length || new Date(currentMonthDates[currentDateIdx]).getMonth() !== currentMonth) { incrementMonth() } }
        render()
      }

      function decrement() {
        if (activeView === 'Month') { decrementMonth() }
        else if (activeView === 'Week') {
          currentWeekIdx--
          if (currentWeekIdx < 0) { decrementMonth(); currentWeekIdx = datesInWeeks.length - 1 }
        }
        else { currentDateIdx--; if (currentDateIdx < 0 || new Date(currentMonthDates[currentDateIdx]).getMonth() !== currentMonth) { decrementMonth() } }
        render()
      }

      function setCalendarDate(d) {
        var dt = d ? new Date(d) : new Date()
        if (dt.toString() === 'Invalid Date') return
        currentYear = dt.getFullYear()
        currentMonth = dt.getMonth()
        recomputeDates()
        currentDateIdx = findIndexOfDate(dt)
        if (currentDateIdx < 0) currentDateIdx = 0
        currentWeekIdx = findCurrentWeek(dt)
        if (currentWeekIdx < 0) currentWeekIdx = 0
        render()
      }

      // ── Range change ──────────────────────────────────────────
      function emitRangeChange() {
        var start, end
        var fmt = function (d) { return parseDate(d) }
        if (activeView === 'Day') {
          var d = currentMonthDates[currentDateIdx]
          if (!d) return
          start = fmt(d); end = fmt(d)
        } else if (activeView === 'Week') {
          var wDates = datesInWeeks[currentWeekIdx] || []
          if (!wDates.length) return
          var sorted = wDates.slice().sort(function (a, b) { return a - b })
          start = fmt(sorted[0]); end = fmt(sorted[sorted.length - 1])
        } else {
          start = fmt(new Date(currentYear, currentMonth, 1))
          end = fmt(new Date(currentYear, currentMonth + 1, 0))
        }
        var key = activeView + '-' + start + '-' + end
        if (key === lastRangeKey) return
        lastRangeKey = key
        dispatch(hostEl, 'ik:calendar-range', { view: activeView, startDate: start, endDate: end })
      }

      // ── Render ────────────────────────────────────────────────
      function render() {
        hostEl.innerHTML = ''
        hostEl.className = 'ik-calendar'

        // Header
        var header = el('div', 'ik-calendar__header')

        var left = el('div', 'ik-calendar__header-left')
        var monthBtn = el('button', 'ik-calendar__month-btn')
        monthBtn.innerHTML = getLabel() + ' ' + icon('chevron-down')
        monthBtn.addEventListener('click', function () {
          // Could integrate date picker; for now just toggles to today
        })
        left.appendChild(monthBtn)
        header.appendChild(left)

        var right = el('div', 'ik-calendar__header-right')
        var prevBtn = el('button', 'ik-calendar__nav-btn')
        prevBtn.innerHTML = icon('chevron-left')
        prevBtn.setAttribute('aria-label', 'Previous')
        prevBtn.addEventListener('click', decrement)
        right.appendChild(prevBtn)

        var todayBtn = el('button', 'ik-calendar__nav-btn')
        todayBtn.textContent = 'Today'
        todayBtn.addEventListener('click', function () { setCalendarDate() })
        right.appendChild(todayBtn)

        var nextBtn = el('button', 'ik-calendar__nav-btn')
        nextBtn.innerHTML = icon('chevron-right')
        nextBtn.setAttribute('aria-label', 'Next')
        nextBtn.addEventListener('click', increment)
        right.appendChild(nextBtn)

        // Tab buttons
        var tabs = el('div', 'ik-calendar__tab-buttons')
        enabledModes.forEach(function (mode) {
          var btn = el('button', 'ik-calendar__tab-btn' + (mode.value === activeView ? ' ik-calendar__tab-btn--active' : ''))
          btn.textContent = mode.label
          btn.addEventListener('click', function () { activeView = mode.value; render() })
          tabs.appendChild(btn)
        })
        right.appendChild(tabs)
        header.appendChild(right)
        hostEl.appendChild(header)

        // View area
        var viewEl = el('div')
        viewEl.style.cssText = 'flex:1;overflow:hidden;display:flex;flex-direction:column;'
        hostEl.appendChild(viewEl)

        if (activeView === 'Month') {
          renderMonthly(viewEl, events, currentMonth, currentMonthDates, config, calendarActions)
        } else if (activeView === 'Week') {
          var weekDates = datesInWeeks[currentWeekIdx] || []
          renderWeekly(viewEl, events, weekDates, config, calendarActions)
        } else {
          var currentDate = currentMonthDates[currentDateIdx] || new Date()
          renderDaily(viewEl, events, currentDate, config, calendarActions)
        }

        emitRangeChange()
      }

      // ── Keyboard shortcuts ────────────────────────────────────
      function handleShortcuts(e) {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return
        var key = e.key.toLowerCase()
        if (key === 'm') { activeView = 'Month'; render() }
        else if (key === 'w') { activeView = 'Week'; render() }
        else if (key === 'd') { activeView = 'Day'; render() }
        else if (key === 't') { setCalendarDate() }
        else if (e.key === 'ArrowLeft') { decrement() }
        else if (e.key === 'ArrowRight') { increment() }
      }

      if (config.enableShortcuts) {
        window.addEventListener('keydown', handleShortcuts)
      }

      // Initial render
      render()

      var instance = {
        render: render,
        setEvents: function (newEvents) {
          events = newEvents.map(function (ev) {
            var e = Object.assign({}, ev)
            e.date = e.fromDate
            e.fromDateTime = e.fromDate + ' ' + e.fromTime
            e.toDateTime = e.toDate + ' ' + e.toTime
            if (e.fromTime) e.fromTime = handleSeconds(e.fromTime)
            if (e.toTime) e.toTime = handleSeconds(e.toTime)
            return e
          })
          render()
        },
        setCalendarDate: setCalendarDate,
        destroy: function () {
          if (config.enableShortcuts) window.removeEventListener('keydown', handleShortcuts)
          hostEl.innerHTML = ''
          instances.delete(hostEl)
        },
      }

      instances.set(hostEl, instance)
      return instance
    },

    getInstance: function (el) { return instances.get(el) || null },
  }

  global.IKCalendar = IKCalendar

})(window)
