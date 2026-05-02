/* ============================================================
   Intrakore — Tooltip Component
   Converted from Tooltip.vue (reka-ui) → vanilla JS

   Usage (HTML attribute API):
     <button data-tooltip="Save changes">Save</button>
     <button data-tooltip="Delete record" data-tooltip-placement="bottom">Delete</button>
     <button data-tooltip="Pending approval" data-tooltip-delay="1000">Approve</button>
     <button data-tooltip-disabled="true">No tooltip</button>

   Placement values: top (default) | bottom | left | right
   Delay: milliseconds (default 500 — matches hoverDelay: 0.5 prop)
   ============================================================ */

;(function () {
  'use strict'

  // ── Constants ──────────────────────────────────────────────
  var DEFAULT_DELAY = 500   // matches hoverDelay: 0.5 (seconds → ms)
  var SIDE_OFFSET   = 4     // px gap between trigger and tooltip (side-offset="4")

  // ── State ──────────────────────────────────────────────────
  var tooltipEl    = null
  var showTimer    = null
  var hideTimer    = null
  var activeTarget = null

  // ── Build singleton tooltip element ───────────────────────
  function buildTooltip () {
    if (tooltipEl) return

    tooltipEl = document.createElement('div')
    tooltipEl.className = 'ik-tooltip'
    tooltipEl.setAttribute('role', 'tooltip')
    tooltipEl.setAttribute('aria-hidden', 'true')

    var body = document.createElement('div')
    body.className = 'ik-tooltip__body'
    tooltipEl.appendChild(body)

    // Arrow SVG — matches TooltipArrow :width="8" :height="4"
    var arrowWrap = document.createElement('div')
    arrowWrap.className = 'ik-tooltip__arrow'
    arrowWrap.innerHTML =
      '<svg width="8" height="4" viewBox="0 0 8 4" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="0,0 8,0 4,4" />' +
      '</svg>'
    tooltipEl.appendChild(arrowWrap)

    document.body.appendChild(tooltipEl)

    // Hide on scroll / resize
    window.addEventListener('scroll', hideTooltip, { passive: true, capture: true })
    window.addEventListener('resize', hideTooltip, { passive: true })
  }

  // ── Show ───────────────────────────────────────────────────
  function showTooltip (target) {
    var text      = target.getAttribute('data-tooltip')
    var placement = target.getAttribute('data-tooltip-placement') || 'top'
    var delay     = parseInt(target.getAttribute('data-tooltip-delay') || DEFAULT_DELAY, 10)
    var disabled  = target.getAttribute('data-tooltip-disabled') === 'true'

    if (disabled || !text) return

    clearTimeout(hideTimer)
    clearTimeout(showTimer)

    showTimer = setTimeout(function () {
      buildTooltip()

      activeTarget = target
      target.setAttribute('aria-describedby', 'ik-tooltip')
      tooltipEl.id = 'ik-tooltip'

      // Set text
      tooltipEl.querySelector('.ik-tooltip__body').textContent = text

      // Set placement
      tooltipEl.setAttribute('data-placement', placement)

      // Show offscreen first to measure
      tooltipEl.style.visibility = 'hidden'
      tooltipEl.classList.add('ik-tooltip--visible')
      tooltipEl.setAttribute('aria-hidden', 'false')

      position(target, placement)

      tooltipEl.style.visibility = ''
    }, delay)
  }

  // ── Hide ───────────────────────────────────────────────────
  function hideTooltip () {
    clearTimeout(showTimer)
    clearTimeout(hideTimer)

    if (activeTarget) {
      activeTarget.removeAttribute('aria-describedby')
      activeTarget = null
    }

    if (!tooltipEl) return

    tooltipEl.classList.remove('ik-tooltip--visible')
    tooltipEl.setAttribute('aria-hidden', 'true')

    hideTimer = setTimeout(function () {
      if (tooltipEl) {
        tooltipEl.style.left = '-9999px'
        tooltipEl.style.top  = '-9999px'
      }
    }, 150)
  }

  // ── Position ───────────────────────────────────────────────
  function position (target, placement) {
    if (!tooltipEl) return

    var rect   = target.getBoundingClientRect()
    var ttRect = tooltipEl.getBoundingClientRect()
    var scroll = { x: window.scrollX, y: window.scrollY }

    var top  = 0
    var left = 0

    switch (placement) {
      case 'bottom':
        top  = rect.bottom + SIDE_OFFSET + scroll.y
        left = rect.left + (rect.width / 2) - (ttRect.width / 2) + scroll.x
        break
      case 'left':
        top  = rect.top + (rect.height / 2) - (ttRect.height / 2) + scroll.y
        left = rect.left - ttRect.width - SIDE_OFFSET + scroll.x
        break
      case 'right':
        top  = rect.top + (rect.height / 2) - (ttRect.height / 2) + scroll.y
        left = rect.right + SIDE_OFFSET + scroll.x
        break
      case 'top':
      default:
        top  = rect.top - ttRect.height - SIDE_OFFSET + scroll.y
        left = rect.left + (rect.width / 2) - (ttRect.width / 2) + scroll.x
        break
    }

    // Clamp to viewport
    var vw = window.innerWidth
    left = Math.max(8, Math.min(left, vw - ttRect.width - 8 + scroll.x))

    tooltipEl.style.top  = top  + 'px'
    tooltipEl.style.left = left + 'px'
  }

  // ── Delegation: attach listeners to document ───────────────
  function onMouseEnter (e) {
    var target = e.target.closest('[data-tooltip]')
    if (target) showTooltip(target)
  }

  function onMouseLeave (e) {
    var target = e.target.closest('[data-tooltip]')
    if (target) hideTooltip()
  }

  function onFocus (e) {
    var target = e.target.closest('[data-tooltip]')
    if (target) showTooltip(target)
  }

  function onBlur (e) {
    var target = e.target.closest('[data-tooltip]')
    if (target) hideTooltip()
  }

  function onKeyDown (e) {
    if (e.key === 'Escape') hideTooltip()
  }

  // ── Init ───────────────────────────────────────────────────
  function init () {
    document.addEventListener('mouseover',  onMouseEnter)
    document.addEventListener('mouseout',   onMouseLeave)
    document.addEventListener('focusin',    onFocus)
    document.addEventListener('focusout',   onBlur)
    document.addEventListener('keydown',    onKeyDown)
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()
