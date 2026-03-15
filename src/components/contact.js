/* ==========================================================================
 * Contact Form — Validation, Formspree Submission, Toast Notifications
 * ========================================================================== */

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

/**
 * Custom validation messages per field name.
 */
const VALIDATION_MESSAGES = {
  name: 'Name is required',
  email: 'Please enter a valid email',
  'event-type': 'Please select an event type',
  date: 'Please select a date',
  message: 'Please enter a message',
};

/**
 * Validate all required fields in the form.
 * @param {HTMLFormElement} form
 * @returns {boolean} true if all fields are valid
 */
function validateForm(form) {
  const fields = form.querySelectorAll('.contact__input[required]');
  let isValid = true;

  fields.forEach((field) => {
    const errorEl = field
      .closest('.contact__field')
      ?.querySelector('.contact__error');

    if (!field.validity.valid) {
      field.classList.add('contact__input--error');
      if (errorEl) {
        errorEl.textContent =
          VALIDATION_MESSAGES[field.name] || field.validationMessage;
      }
      isValid = false;
    } else {
      field.classList.remove('contact__input--error');
      if (errorEl) {
        errorEl.textContent = '';
      }
    }
  });

  return isValid;
}

/**
 * Show a toast notification that slides in from the right.
 * @param {'success'|'error'} type
 * @param {string} message
 */
function showToast(type, message) {
  // Remove any existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger slide-in on next frame
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), {
      once: true,
    });
    // Fallback removal if reduced motion disables transition
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 400);
  }, 5000);
}

/**
 * Initialize the contact form: validation + Formspree submission.
 */
export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('.contact__submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    // Disable button while submitting
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        // Clear all error states after reset
        form.querySelectorAll('.contact__input--error').forEach((el) => {
          el.classList.remove('contact__input--error');
        });
        form.querySelectorAll('.contact__error').forEach((el) => {
          el.textContent = '';
        });
        showToast('success', "Message sent! I'll get back to you soon.");
      } else {
        const data = await response.json().catch(() => null);
        const msg =
          data?.errors?.map((err) => err.message).join(', ') ||
          'Something went wrong. Please try again.';
        showToast('error', msg);
      }
    } catch {
      showToast(
        'error',
        'Network error. Please check your connection and try again.'
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry';
      }
    }
  });
}
