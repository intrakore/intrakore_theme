/* ============================================================
   Intrakore — Rating Component
   Converted from Rating.vue → vanilla JS

   Usage (attribute API — auto-initialised on DOMContentLoaded):

     <div
       data-ik-rating
       data-rating-value="3"
       data-rating-from="5"
       data-rating-size="md"
       data-rating-label="Quality"
       data-rating-readonly="false"
       data-rating-name="quality_score"
     ></div>

   Props mapped:
     data-rating-value    → modelValue  (default 0)
     data-rating-from     → rating_from (default 5)
     data-rating-size     → size: sm | md | lg | xl (default md)
     data-rating-label    → label text (optional)
     data-rating-readonly → true | false (default false)
     data-rating-name     → emitted in change event detail (optional)

   Events:
     The host element dispatches a custom 'ik:rating-change' event
     on every rating selection:
       el.addEventListener('ik:rating-change', (e) => {
         console.log(e.detail.value, e.detail.name)
       })

   Programmatic API:
     IKRating.create(el, opts)   — mount on an existing element
     IKRating.getValue(el)       — get current rating value
     IKRating.setValue(el, val)  — set rating value externally
     IKRating.initAll()          — scan and mount all [data-ik-rating]
   ============================================================ */

;(function (global) {
  'use strict'

  // ── Feather "star" path — matches FeatherIcon name="star" ──
  // Feather star: 5-point polygon with inner/outer radius
  var STAR_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
    'aria-hidden="true" focusable="false">' +
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 ' +
    '12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" ' +
    'stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>'

  // ── Internal store: el → instance ──────────────────────────
  var instances = new WeakMap()

  // ── Read options from element attributes ───────────────────
  function readOpts (el) {
    return {
      value   : parseInt(el.getAttribute('data-rating-value')    || '0',    10),
      from    : parseInt(el.getAttribute('data-rating-from')     || '5',    10),
      size    : el.getAttribute('data-rating-size')              || 'md',
      label   : el.getAttribute('data-rating-label')             || '',
      readonly: el.getAttribute('data-rating-readonly')          === 'true',
      name    : el.getAttribute('data-rating-name')              || '',
    }
  }

  // ── Build the DOM for one rating widget ────────────────────
  function buildDOM (el, opts) {
    el.className = 'ik-rating'
    el.innerHTML = ''             // clear before (re)build

    // Label
    if (opts.label) {
      var label = document.createElement('label')
      label.className = 'ik-rating__label'
      label.textContent = opts.label
      el.appendChild(label)
    }

    // Stars row
    var row = document.createElement('div')
    row.className = 'ik-rating__stars'

    for (var i = 1; i <= opts.from; i++) {
      var wrap = document.createElement('div')
      wrap.className = 'ik-rating__star-wrap'
      wrap.setAttribute('data-index', i)

      var star = document.createElement('span')
      star.className = buildStarClass(i, opts.value, 0, opts.size, opts.readonly)
      star.setAttribute('role', opts.readonly ? 'img' : 'button')
      star.setAttribute('aria-label', 'Star ' + i + ' of ' + opts.from)
      if (!opts.readonly) {
        star.setAttribute('tabindex', '0')
      }
      star.innerHTML = STAR_SVG

      wrap.appendChild(star)
      row.appendChild(wrap)
    }

    el.appendChild(row)
  }

  // ── Compute class string for a star at index ───────────────
  function buildStarClass (index, rating, hovered, size, readonly) {
    var classes = [
      'ik-rating__star',
      'ik-rating__star--' + size,
    ]

    // Hovered-but-not-rated takes priority (index <= hovered && index > rating)
    if (hovered > 0 && index <= hovered && index > rating) {
      classes.push('ik-rating__star--hovered')
    } else if (index <= rating) {
      // Rated (index <= rating.value) → fill-yellow-500
      classes.push('ik-rating__star--rated')
    }

    if (readonly) {
      classes.push('ik-rating__star--readonly')
    } else {
      classes.push('ik-rating__star--interactive')
    }

    return classes.join(' ')
  }

  // ── Refresh all star classes after state change ─────────────
  function refreshStars (el, instance) {
    var wraps = el.querySelectorAll('.ik-rating__star-wrap')
    wraps.forEach(function (wrap) {
      var index = parseInt(wrap.getAttribute('data-index'), 10)
      var star  = wrap.querySelector('.ik-rating__star')
      if (star) {
        star.className = buildStarClass(
          index,
          instance.rating,
          instance.hovered,
          instance.opts.size,
          instance.opts.readonly
        )
      }
    })
  }

  // ── Attach events for an interactive rating ─────────────────
  function attachEvents (el, instance) {
    if (instance.opts.readonly) return

    var row = el.querySelector('.ik-rating__stars')
    if (!row) return

    // Mouseover on row — find closest star-wrap
    row.addEventListener('mouseover', function (e) {
      var wrap = e.target.closest('.ik-rating__star-wrap')
      if (!wrap) return
      var index = parseInt(wrap.getAttribute('data-index'), 10)
      instance.hovered = index
      refreshStars(el, instance)
    })

    // Mouseleave on row — reset hover
    row.addEventListener('mouseleave', function () {
      instance.hovered = 0
      refreshStars(el, instance)
    })

    // Click on star-wrap — mark rating
    row.addEventListener('click', function (e) {
      var wrap = e.target.closest('.ik-rating__star-wrap')
      if (!wrap) return
      var index = parseInt(wrap.getAttribute('data-index'), 10)
      markRating(el, instance, index)
    })

    // Keyboard: Enter / Space on focusable star
    row.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return
      var wrap = e.target.closest('.ik-rating__star-wrap')
      if (!wrap) return
      e.preventDefault()
      var index = parseInt(wrap.getAttribute('data-index'), 10)
      markRating(el, instance, index)
    })
  }

  // ── Mark rating (equivalent to markRating() in Vue) ─────────
  function markRating (el, instance, index) {
    if (instance.opts.readonly) return
    instance.rating = index

    // Sync attribute
    el.setAttribute('data-rating-value', index)

    refreshStars(el, instance)

    // Dispatch custom event — equivalent to emit('update:modelValue', value)
    var event = new CustomEvent('ik:rating-change', {
      bubbles: true,
      detail: {
        value: index,
        name : instance.opts.name,
      },
    })
    el.dispatchEvent(event)
  }

  // ── Public API ─────────────────────────────────────────────
  var IKRating = {

    /**
     * Mount a rating widget on el.
     * @param {HTMLElement} el
     * @param {object}      overrides  - same keys as data-rating-* attrs
     * @returns instance object
     */
    create: function (el, overrides) {
      var opts = Object.assign(readOpts(el), overrides || {})

      var instance = {
        opts   : opts,
        rating : opts.value,
        hovered: 0,
      }

      buildDOM(el, opts)
      attachEvents(el, instance)
      instances.set(el, instance)

      return instance
    },

    /**
     * Get the current numeric rating of a mounted element.
     * @param {HTMLElement} el
     * @returns {number}
     */
    getValue: function (el) {
      var inst = instances.get(el)
      return inst ? inst.rating : 0
    },

    /**
     * Programmatically set the rating value.
     * Mirrors the watch(() => props.modelValue) in Vue.
     * @param {HTMLElement} el
     * @param {number}      value
     */
    setValue: function (el, value) {
      var inst = instances.get(el)
      if (!inst) return
      inst.rating = value
      el.setAttribute('data-rating-value', value)
      refreshStars(el, inst)
    },

    /**
     * Scan the document for [data-ik-rating] and mount all.
     */
    initAll: function () {
      var els = document.querySelectorAll('[data-ik-rating]')
      els.forEach(function (el) {
        if (!instances.has(el)) {
          IKRating.create(el)
        }
      })
    },
  }

  // ── Expose globally ────────────────────────────────────────
  global.IKRating = IKRating

  // ── Auto-init on DOM ready ─────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', IKRating.initAll)
  } else {
    IKRating.initAll()
  }

})(window)
