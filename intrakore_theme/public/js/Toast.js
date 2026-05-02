/* ============================================================
   Intrakore — Toast Component
   Converted from Toast.vue (reka-ui) → vanilla JS

   Usage:
     IKToast.show('Record saved successfully')
     IKToast.show('Something went wrong', { type: 'error' })
     IKToast.show('3 items imported', {
       type: 'success',
       duration: 4000,
       action: { label: 'Undo', onClick: () => undoImport() }
     })
     IKToast.show('Session expiring', { closable: false })

   Options:
     type      : 'success' | 'warning' | 'error' | 'info' (default: 'info')
     duration  : ms before auto-dismiss (default: 5000). 0 = persistent
     closable  : show × button (default: true)
     action    : { label: string, altText?: string, onClick: fn }
     icon      : SVG string to use as custom icon HTML
   ============================================================ */

;(function (global) {
  'use strict'

  // ── SVG icons (inline replacements for lucide-vue-next + CircleCheckIcon) ──
  var ICONS = {
    success:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',

    warning:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' +
      '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>',

    error:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="10"/>' +
      '<path d="m12 8 0 4"/><path d="M12 16h.01"/></svg>',

    info:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="10"/>' +
      '<path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',

    close:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  }

  // ── State ──────────────────────────────────────────────────
  var viewport = null

  // ── Build viewport (singleton) ─────────────────────────────
  function buildViewport () {
    if (viewport) return
    viewport = document.createElement('ol')
    viewport.className = 'ik-toast-viewport'
    viewport.setAttribute('aria-live', 'polite')
    viewport.setAttribute('aria-label', 'Notifications')
    viewport.setAttribute('role', 'region')
    document.body.appendChild(viewport)
  }

  // ── Build a single toast element ───────────────────────────
  function buildToastEl (message, opts) {
    var type     = opts.type     || 'info'
    var closable = opts.closable !== false
    var action   = opts.action   || null
    var icon     = opts.icon     || null

    var toast = document.createElement('li')
    toast.className = 'ik-toast'
    toast.setAttribute('role', 'status')
    toast.setAttribute('aria-live', 'off')
    toast.setAttribute('aria-atomic', 'true')
    toast.setAttribute('data-state', 'open')
    toast.setAttribute('tabindex', '0')

    // ── Body (icon + message) ──
    var body = document.createElement('div')
    body.className = 'ik-toast__body'

    // Icon
    var iconEl = document.createElement('div')
    iconEl.className = 'ik-toast__icon ik-toast__icon--' + type
    iconEl.innerHTML = icon || ICONS[type] || ICONS.info
    body.appendChild(iconEl)

    // Message column
    var msgCol = document.createElement('div')
    msgCol.style.cssText = 'display:flex;flex-direction:column;flex-grow:1;overflow:hidden'

    var msgEl = document.createElement('div')
    msgEl.className = 'ik-toast__message'
    msgEl.innerHTML = message
    msgCol.appendChild(msgEl)
    body.appendChild(msgCol)
    toast.appendChild(body)

    // ── Actions row ──
    var actions = document.createElement('div')
    actions.className = 'ik-toast__actions'

    if (action) {
      var actionBtn = document.createElement('button')
      actionBtn.className = 'ik-toast__action'
      actionBtn.textContent = action.label
      actionBtn.setAttribute('aria-label', action.altText || action.label)
      actionBtn.addEventListener('click', function () {
        if (typeof action.onClick === 'function') action.onClick()
        dismiss(toast)
      })
      actions.appendChild(actionBtn)
    }

    if (closable) {
      var closeBtn = document.createElement('button')
      closeBtn.className = 'ik-toast__close'
      closeBtn.setAttribute('aria-label', 'Close notification')
      closeBtn.innerHTML = ICONS.close
      closeBtn.addEventListener('click', function () {
        dismiss(toast)
      })
      actions.appendChild(closeBtn)
    }

    toast.appendChild(actions)

    // ── Swipe to dismiss (touch) ──
    attachSwipe(toast)

    return toast
  }

  // ── Dismiss animation → remove ─────────────────────────────
  function dismiss (toast) {
    if (toast.getAttribute('data-state') === 'closed') return
    toast.setAttribute('data-state', 'closed')

    toast.addEventListener('animationend', function handler () {
      toast.removeEventListener('animationend', handler)
      if (toast.parentNode) toast.parentNode.removeChild(toast)
    })
  }

  // ── Touch swipe-down to dismiss ────────────────────────────
  function attachSwipe (toast) {
    var startY   = 0
    var currentY = 0
    var swiping  = false

    toast.addEventListener('touchstart', function (e) {
      startY   = e.touches[0].clientY
      currentY = startY
      swiping  = true
    }, { passive: true })

    toast.addEventListener('touchmove', function (e) {
      if (!swiping) return
      currentY = e.touches[0].clientY
      var deltaY = currentY - startY
      if (deltaY < 0) return
      toast.setAttribute('data-swipe', 'move')
      toast.style.setProperty('--ik-swipe-y', deltaY + 'px')
    }, { passive: true })

    toast.addEventListener('touchend', function () {
      if (!swiping) return
      swiping = false
      var deltaY = currentY - startY
      if (deltaY > 60) {
        toast.setAttribute('data-swipe', 'end')
        toast.addEventListener('animationend', function handler () {
          toast.removeEventListener('animationend', handler)
          if (toast.parentNode) toast.parentNode.removeChild(toast)
        })
      } else {
        toast.setAttribute('data-swipe', 'cancel')
        toast.style.removeProperty('--ik-swipe-y')
        setTimeout(function () {
          toast.removeAttribute('data-swipe')
        }, 260)
      }
    }, { passive: true })
  }

  // ── Public API ─────────────────────────────────────────────
  var IKToast = {
    /**
     * Show a toast notification.
     * @param {string} message  - HTML or plain text message
     * @param {object} opts
     * @param {string}   opts.type      - 'success' | 'warning' | 'error' | 'info'
     * @param {number}   opts.duration  - ms (default 5000, 0 = persistent)
     * @param {boolean}  opts.closable  - show close button (default true)
     * @param {object}   opts.action    - { label, altText, onClick }
     * @param {string}   opts.icon      - custom SVG HTML string
     * @returns {HTMLElement} the toast element
     */
    show: function (message, opts) {
      opts = opts || {}
      buildViewport()

      var toast    = buildToastEl(message, opts)
      var duration = (opts.duration !== undefined) ? opts.duration : 5000
      var closable = opts.closable !== false

      viewport.appendChild(toast)

      // Auto-dismiss — matches: closable ? duration : 0
      // If closable=false AND duration=0 → persistent (no auto-dismiss)
      if (duration > 0 && (closable || duration)) {
        setTimeout(function () {
          dismiss(toast)
        }, duration)
      }

      return toast
    },

    /** Programmatically dismiss a toast returned from show() */
    dismiss: dismiss,

    /** Convenience wrappers */
    success: function (msg, opts) {
      return this.show(msg, Object.assign({}, opts, { type: 'success' }))
    },
    warning: function (msg, opts) {
      return this.show(msg, Object.assign({}, opts, { type: 'warning' }))
    },
    error: function (msg, opts) {
      return this.show(msg, Object.assign({}, opts, { type: 'error' }))
    },
    info: function (msg, opts) {
      return this.show(msg, Object.assign({}, opts, { type: 'info' }))
    },
  }

  // ── Expose globally ────────────────────────────────────────
  global.IKToast = IKToast

  // ── Frappe integration: hook into frappe.show_alert ────────
  function hookFrappe () {
    if (typeof frappe === 'undefined') return

    var original = frappe.show_alert
    frappe.show_alert = function (opts, seconds) {
      var message   = typeof opts === 'string' ? opts : (opts.message || opts.msg || '')
      var indicator = typeof opts === 'object' ? (opts.indicator || 'info') : 'info'

      var typeMap = {
        green  : 'success',
        blue   : 'info',
        orange : 'warning',
        red    : 'error',
        yellow : 'warning',
      }

      IKToast.show(message, {
        type    : typeMap[indicator] || 'info',
        duration: (seconds || 5) * 1000,
      })
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookFrappe)
  } else {
    hookFrappe()
  }

})(window)
