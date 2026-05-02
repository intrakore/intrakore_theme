/* ============================================================
   Intrakore — Divider Component
   Converted from Divider.vue → vanilla JS

   Usage (attribute API — auto-initialised on DOMContentLoaded):

     <!-- Horizontal divider (default) -->
     <div data-ik-divider></div>

     <!-- Vertical divider -->
     <div data-ik-divider data-divider-orientation="vertical"></div>

     <!-- With action button, positioned at start -->
     <div
       data-ik-divider
       data-divider-orientation="horizontal"
       data-divider-position="start"
       data-divider-action-label="Add Section"
       data-divider-action-handler="myHandlerFnName"
     ></div>

     <!-- Inside a flex container -->
     <div data-ik-divider data-divider-flex-item="true"></div>

   Props mapped:
     data-divider-orientation    → orientation: horizontal | vertical  (default: horizontal)
     data-divider-position       → position: center | start | end      (default: center)
     data-divider-flex-item      → flexItem: true | false              (default: false)
     data-divider-action-label   → action.label  (presence triggers action button)
     data-divider-action-handler → window[name] fn OR dispatches 'ik:divider-action'
     data-divider-action-loading → true | false  (default false)

   Events:
     el.addEventListener('ik:divider-action', (e) => {
       console.log(e.detail.label)
     })

   Programmatic API:
     IKDivider.create(el, opts)        — mount on element
     IKDivider.setLoading(el, bool)    — toggle loading state on action button
     IKDivider.initAll()               — scan and mount all [data-ik-divider]
   ============================================================ */

;(function (global) {
  'use strict'

  // ── Internal store: el → instance ──────────────────────────
  var instances = new WeakMap()

  // ── Read options from element attributes ───────────────────
  function readOpts (el) {
    return {
      orientation  : el.getAttribute('data-divider-orientation')     || 'horizontal',
      position     : el.getAttribute('data-divider-position')        || 'center',
      flexItem     : el.getAttribute('data-divider-flex-item')       === 'true',
      actionLabel  : el.getAttribute('data-divider-action-label')    || '',
      actionHandler: el.getAttribute('data-divider-action-handler')  || '',
      actionLoading: el.getAttribute('data-divider-action-loading')  === 'true',
    }
  }

  // ── Build a small outline Button (size="sm" variant="outline") ──
  // Mirrors the <Button :label :loading size="sm" variant="outline"> in Vue
  function buildButton (opts, instance) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'ik-btn'

    if (opts.actionLoading) {
      btn.classList.add('ik-btn--loading')
      var spinner = document.createElement('span')
      spinner.className = 'ik-btn__spinner'
      btn.appendChild(spinner)
      btn.setAttribute('aria-busy', 'true')
      btn.setAttribute('aria-disabled', 'true')
      btn.disabled = true
    }

    var labelSpan = document.createElement('span')
    labelSpan.className = 'ik-btn__label'
    labelSpan.textContent = opts.actionLabel
    btn.appendChild(labelSpan)

    // Click handler — equivalent to @click="props.action?.handler"
    btn.addEventListener('click', function () {
      if (instance.opts.actionLoading) return

      // 1. Try named global function
      if (opts.actionHandler && typeof global[opts.actionHandler] === 'function') {
        global[opts.actionHandler]()
      }

      // 2. Always dispatch custom event — equivalent to emit
      var event = new CustomEvent('ik:divider-action', {
        bubbles: true,
        detail : { label: opts.actionLabel },
      })
      instance.el.dispatchEvent(event)
    })

    return btn
  }

  // ── Build action wrapper <span class="absolute"> ────────────
  function buildActionSpan (opts, instance) {
    var span = document.createElement('span')
    span.className = 'ik-divider__action ik-divider__action--' + opts.position

    span.appendChild(buildButton(opts, instance))
    return span
  }

  // ── Build full divider DOM ──────────────────────────────────
  function buildDOM (el, instance) {
    var opts = instance.opts

    // Tag selection:
    // Vue uses <hr> when no action, <div> when action present
    // Since we can't change the tag after creation, we control
    // appearance via CSS only — the el stays as-is (div or hr in HTML)
    // but we set the correct ARIA role.
    el.innerHTML = ''

    // Classes
    var classes = ['ik-divider', 'ik-divider--' + opts.orientation]

    if (opts.flexItem) {
      classes.push('ik-divider--flex-item')
    } else {
      classes.push('ik-divider--standalone')
    }

    el.className = classes.join(' ')

    // ARIA — <hr> role when no action (decorative separator)
    if (!opts.actionLabel) {
      el.setAttribute('role', 'separator')
      el.setAttribute('aria-orientation', opts.orientation)
    } else {
      // Has action: acts as a div, not a separator
      el.removeAttribute('role')
      el.removeAttribute('aria-orientation')
    }

    // Action button
    if (opts.actionLabel) {
      var actionSpan = buildActionSpan(opts, instance)
      instance.actionSpan = actionSpan
      el.appendChild(actionSpan)
    }
  }

  // ── Update loading state on action button ───────────────────
  function setLoading (el, loading) {
    var instance = instances.get(el)
    if (!instance) return

    instance.opts.actionLoading = loading
    el.setAttribute('data-divider-action-loading', loading ? 'true' : 'false')

    if (!instance.actionSpan) return

    var btn = instance.actionSpan.querySelector('.ik-btn')
    if (!btn) return

    var existingSpinner = btn.querySelector('.ik-btn__spinner')

    if (loading) {
      btn.classList.add('ik-btn--loading')
      btn.setAttribute('aria-busy', 'true')
      btn.setAttribute('aria-disabled', 'true')
      btn.disabled = true
      if (!existingSpinner) {
        var spinner = document.createElement('span')
        spinner.className = 'ik-btn__spinner'
        btn.insertBefore(spinner, btn.firstChild)
      }
    } else {
      btn.classList.remove('ik-btn--loading')
      btn.removeAttribute('aria-busy')
      btn.removeAttribute('aria-disabled')
      btn.disabled = false
      if (existingSpinner) existingSpinner.remove()
    }
  }

  // ── Public API ─────────────────────────────────────────────
  var IKDivider = {

    /**
     * Mount a divider on el.
     * @param {HTMLElement} el
     * @param {object}      overrides  - same keys as readOpts()
     * @returns instance
     */
    create: function (el, overrides) {
      var opts = Object.assign(readOpts(el), overrides || {})

      var instance = {
        el         : el,
        opts       : opts,
        actionSpan : null,
      }

      buildDOM(el, instance)
      instances.set(el, instance)

      return instance
    },

    /**
     * Toggle the loading state on the action button.
     * Mirrors watching props.action.loading reactively in Vue.
     * @param {HTMLElement} el
     * @param {boolean}     loading
     */
    setLoading: function (el, loading) {
      setLoading(el, loading)
    },

    /**
     * Scan document for [data-ik-divider] and mount all.
     */
    initAll: function () {
      var els = document.querySelectorAll('[data-ik-divider]')
      els.forEach(function (el) {
        if (!instances.has(el)) {
          IKDivider.create(el)
        }
      })
    },
  }

  // ── Expose globally ────────────────────────────────────────
  global.IKDivider = IKDivider

  // ── Auto-init on DOM ready ─────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', IKDivider.initAll)
  } else {
    IKDivider.initAll()
  }

})(window)
