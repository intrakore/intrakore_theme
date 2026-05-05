/**
 * TextInput — Intrakore Design System
 * Vanilla JS equivalent of the Vue TextInput component.
 *
 * Usage:
 *   const input = new TextInput(containerEl, {
 *     type: 'email',
 *     size: 'md',
 *     variant: 'subtle',
 *     label: 'Email address',
 *     placeholder: 'you@example.com',
 *     description: 'We never share your email.',
 *     required: true,
 *     debounce: 300,
 *     onChange: (value) => console.log(value),
 *   })
 *
 *   // Prefix / suffix icons
 *   input.setPrefix('<svg ...>...</svg>')
 *   input.setSuffix('<svg ...>...</svg>')
 *
 *   // Programmatic value
 *   input.setValue('hello@world.com')
 *   input.getValue()   // → 'hello@world.com'
 *
 *   // Error / disable
 *   input.setError('This field is required.')
 *   input.clearError()
 *   input.setDisabled(true)
 *
 *   // Destroy
 *   input.destroy()
 */

'use strict'

/* ─── Tiny debounce util ──────────────────────────────────────────────── */
function debounce(fn, wait) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
}

/* ─── ID generator ────────────────────────────────────────────────────── */
let _idCounter = 0
function uid(prefix = 'ti') {
  return `${prefix}-${++_idCounter}`
}

/* ─── TextInput class ─────────────────────────────────────────────────── */
class TextInput {
  /**
   * @param {HTMLElement} container  - The element this component renders into.
   * @param {object}      options
   * @param {string}      [options.type='text']
   * @param {'sm'|'md'|'lg'|'xl'} [options.size='sm']
   * @param {'subtle'|'outline'|'ghost'} [options.variant='subtle']
   * @param {string}      [options.label]
   * @param {string}      [options.description]
   * @param {string}      [options.placeholder]
   * @param {string|number} [options.value]
   * @param {boolean}     [options.disabled=false]
   * @param {boolean}     [options.required=false]
   * @param {string|string[]} [options.error]   - Error message(s). Clears description.
   * @param {number}      [options.debounce=0]  - ms to debounce onChange.
   * @param {function}    [options.onChange]    - Called with the current string value.
   * @param {string}      [options.id]          - Explicit id for the <input>. Auto-generated if omitted.
   */
  constructor(container, options = {}) {
    if (!(container instanceof HTMLElement)) {
      throw new TypeError('TextInput: first argument must be an HTMLElement.')
    }

    this._container = container
    this._opts = Object.assign(
      {
        type: 'text',
        size: 'sm',
        variant: 'subtle',
        disabled: false,
        required: false,
        debounce: 0,
      },
      options,
    )

    /* Stable IDs */
    this._inputId = this._opts.id || uid('text-input')
    this._labelId = `${this._inputId}-label`
    this._descId  = `${this._inputId}-description`
    this._errorId = `${this._inputId}-error`

    /* Internal state */
    this._value   = String(this._opts.value ?? '')
    this._error   = this._normaliseError(this._opts.error)
    this._prefix  = null   // HTML string
    this._suffix  = null   // HTML string

    /* Build DOM */
    this._render()

    /* Wire onChange (with optional debounce) */
    if (typeof this._opts.onChange === 'function') {
      this._emitChange = this._opts.debounce
        ? debounce(this._opts.onChange, this._opts.debounce)
        : this._opts.onChange
    } else {
      this._emitChange = null
    }

    this._attachListeners()
  }

  /* ── Public API ─────────────────────────────────────────────────────── */

  /** Returns the current value. */
  getValue() {
    return this._inputEl ? this._inputEl.value : this._value
  }

  /** Programmatically set the value. */
  setValue(val) {
    this._value = String(val ?? '')
    if (this._inputEl) this._inputEl.value = this._value
  }

  /** Show an error message (hides description). Pass null/'' to clear. */
  setError(msg) {
    this._error = this._normaliseError(msg)
    this._updateErrorState()
  }

  /** Clear any active error. */
  clearError() {
    this.setError(null)
  }

  /** Enable or disable the input. */
  setDisabled(bool) {
    this._opts.disabled = !!bool
    this._updateDisabledState()
  }

  /**
   * Inject HTML into the prefix slot.
   * Pass null to remove.
   */
  setPrefix(html) {
    this._prefix = html || null
    this._syncPrefixSuffix()
  }

  /**
   * Inject HTML into the suffix slot.
   * Pass null to remove.
   */
  setSuffix(html) {
    this._suffix = html || null
    this._syncPrefixSuffix()
  }

  /** Tear down: remove DOM and listeners. */
  destroy() {
    if (this._inputEl) {
      this._inputEl.removeEventListener('input',  this._handleChange)
      this._inputEl.removeEventListener('change', this._handleChange)
    }
    this._container.innerHTML = ''
  }

  /* ── Private: initial render ────────────────────────────────────────── */

  _render() {
    const { label, description, required, disabled } = this._opts
    const hasLabel       = !!label
    const hasDescription = !!description && !this._error.length
    const hasError       = !!this._error.length
    const hasLabeling    = hasLabel || hasDescription || hasError

    /* Root wrapper */
    const wrapper = document.createElement('div')
    if (hasLabeling) {
      wrapper.className = 'text-input-wrapper'
    }

    /* ── Label ── */
    if (hasLabel) {
      const labelEl = document.createElement('label')
      labelEl.id        = this._labelId
      labelEl.htmlFor   = this._inputId
      labelEl.className = 'text-input-label'
      labelEl.textContent = label

      if (required) {
        const star = document.createElement('span')
        star.setAttribute('aria-hidden', 'true')
        star.className   = 'required-star'
        star.textContent = ' *'
        labelEl.appendChild(star)

        const srOnly = document.createElement('span')
        srOnly.className   = 'sr-only'
        srOnly.textContent = '(required)'
        labelEl.appendChild(srOnly)
      }

      wrapper.appendChild(labelEl)
    }

    /* ── Field row ── */
    const fieldRow = document.createElement('div')
    fieldRow.className = 'text-input-field'
    if (disabled) fieldRow.classList.add('is-disabled')

    /* Prefix */
    this._prefixEl = document.createElement('div')
    this._prefixEl.className = `text-input-prefix size-${this._opts.size}`
    this._prefixEl.style.display = 'none'
    fieldRow.appendChild(this._prefixEl)

    /* Input */
    const inputEl = document.createElement('input')
    inputEl.id          = this._inputId
    inputEl.type        = this._opts.type
    inputEl.value       = this._value
    inputEl.disabled    = !!disabled
    inputEl.placeholder = this._opts.placeholder || ''
    inputEl.setAttribute('data-slot', 'control')
    inputEl.setAttribute('data-size', this._opts.size)
    inputEl.setAttribute('data-variant', this._opts.variant)
    inputEl.setAttribute('data-state', hasError ? 'invalid' : 'valid')

    if (required) {
      inputEl.required = true
      inputEl.setAttribute('aria-required', 'true')
    }
    if (disabled) {
      inputEl.setAttribute('data-disabled', 'true')
    }
    if (hasError) {
      inputEl.setAttribute('aria-invalid', 'true')
      inputEl.setAttribute('aria-errormessage', this._errorId)
    }
    if (hasDescription) {
      inputEl.setAttribute('aria-describedby', this._descId)
    }

    /* CSS classes */
    inputEl.className = this._buildInputClasses()

    this._inputEl = inputEl
    fieldRow.appendChild(inputEl)

    /* Suffix */
    this._suffixEl = document.createElement('div')
    this._suffixEl.className = `text-input-suffix size-${this._opts.size}`
    this._suffixEl.style.display = 'none'
    fieldRow.appendChild(this._suffixEl)

    wrapper.appendChild(fieldRow)

    /* ── Description ── */
    this._descEl = document.createElement('p')
    this._descEl.id        = this._descId
    this._descEl.className = 'text-input-description'
    this._descEl.textContent = description || ''
    this._descEl.style.display = hasDescription ? '' : 'none'
    wrapper.appendChild(this._descEl)

    /* ── Error ── */
    this._errorEl = document.createElement('div')
    this._errorEl.id        = this._errorId
    this._errorEl.className = 'text-input-error'
    this._errorEl.setAttribute('role', 'alert')
    this._syncErrorEl()
    wrapper.appendChild(this._errorEl)

    /* Mount */
    this._container.innerHTML = ''
    this._container.appendChild(wrapper)
    this._wrapper  = wrapper
    this._fieldRow = fieldRow
  }

  /* ── Private: class builder (mirrors Vue computed) ──────────────────── */

  _buildInputClasses() {
    const { size, variant, disabled } = this._opts
    const hasError   = !!this._error.length
    const effectiveVariant = disabled ? 'disabled' : variant
    const hasPrefix  = !!this._prefix
    const hasSuffix  = !!this._suffix

    const classes = ['text-input']

    classes.push(`size-${size}`)
    classes.push(effectiveVariant === 'disabled' ? 'is-disabled' : `variant-${variant}`)

    if (hasPrefix) classes.push('has-prefix')
    if (hasSuffix) classes.push('has-suffix')
    if (hasError)  classes.push('is-invalid')

    return classes.join(' ')
  }

  /* ── Private: event wiring ──────────────────────────────────────────── */

  _attachListeners() {
    this._handleChange = (e) => {
      this._value = e.target.value
      if (this._emitChange) this._emitChange(this._value)
    }
    this._inputEl.addEventListener('input',  this._handleChange)
    this._inputEl.addEventListener('change', this._handleChange)
  }

  /* ── Private: DOM sync helpers ──────────────────────────────────────── */

  _updateErrorState() {
    const hasError = !!this._error.length
    const { description } = this._opts

    /* ARIA on input */
    if (hasError) {
      this._inputEl.setAttribute('aria-invalid', 'true')
      this._inputEl.setAttribute('aria-errormessage', this._errorId)
      this._inputEl.removeAttribute('aria-describedby')
      this._inputEl.setAttribute('data-state', 'invalid')
    } else {
      this._inputEl.removeAttribute('aria-invalid')
      this._inputEl.removeAttribute('aria-errormessage')
      if (description) {
        this._inputEl.setAttribute('aria-describedby', this._descId)
      }
      this._inputEl.setAttribute('data-state', 'valid')
    }

    /* CSS class */
    this._inputEl.className = this._buildInputClasses()

    /* Show/hide description vs error */
    this._descEl.style.display  = (!hasError && description) ? '' : 'none'
    this._syncErrorEl()
  }

  _updateDisabledState() {
    const { disabled, variant } = this._opts
    this._inputEl.disabled = !!disabled

    if (disabled) {
      this._inputEl.setAttribute('data-disabled', 'true')
      this._fieldRow.classList.add('is-disabled')
    } else {
      this._inputEl.removeAttribute('data-disabled')
      this._fieldRow.classList.remove('is-disabled')
    }

    this._inputEl.className = this._buildInputClasses()
  }

  _syncPrefixSuffix() {
    /* Prefix */
    if (this._prefix) {
      this._prefixEl.innerHTML      = this._prefix
      this._prefixEl.style.display  = ''
    } else {
      this._prefixEl.innerHTML      = ''
      this._prefixEl.style.display  = 'none'
    }

    /* Suffix */
    if (this._suffix) {
      this._suffixEl.innerHTML      = this._suffix
      this._suffixEl.style.display  = ''
    } else {
      this._suffixEl.innerHTML      = ''
      this._suffixEl.style.display  = 'none'
    }

    /* Update padding classes */
    this._inputEl.className = this._buildInputClasses()
  }

  _syncErrorEl() {
    this._errorEl.innerHTML = ''
    if (this._error.length) {
      this._error.forEach((msg) => {
        const p = document.createElement('p')
        p.textContent = msg
        this._errorEl.appendChild(p)
      })
      this._errorEl.style.display = ''
    } else {
      this._errorEl.style.display = 'none'
    }
  }

  /* ── Util ─────────────────────────────────────────────────────────────  */

  _normaliseError(raw) {
    if (!raw) return []
    return Array.isArray(raw) ? raw.filter(Boolean) : [String(raw)]
  }
}

/* ─── Export ──────────────────────────────────────────────────────────── */
// ESM
export { TextInput }
export default TextInput

// CJS / UMD fallback
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextInput
  module.exports.TextInput = TextInput
}
