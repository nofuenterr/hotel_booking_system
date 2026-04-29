// ── UI UTILITIES ──

export const toast = (message, type = 'default') => {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
};

export const openModal = (id) => document.getElementById(id).classList.add('open');
export const closeModal = (id) => document.getElementById(id).classList.remove('open');

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPrice = (price) => {
  if (price == null) return '—';
  return `£${parseFloat(price).toFixed(2)}`;
};

export const badge = (status) => {
  const map = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled',
  };
  const span = document.createElement('span');
  span.className = `badge ${map[status] || ''}`;
  span.textContent = status;
  return span;
};

export const emptyState = (message = 'No items found') => {
  const div = document.createElement('div');
  div.className = 'empty-state';
  const p = document.createElement('p');
  p.textContent = message;
  div.appendChild(p);
  return div;
};

export const loading = () => {
  const div = document.createElement('div');
  div.className = 'loading';
  div.textContent = 'Loading...';
  return div;
};

export const toggleLoadMore = (btnId, show) => {
  const wrap = document.getElementById(`${btnId}Wrap`);
  if (wrap) wrap.style.display = show ? 'flex' : 'none';
};

export const weatherCodeDesc = (code) => {
  if (code === 0)  return 'Clear sky';
  if (code <= 3)   return 'Partly cloudy';
  if (code <= 9)   return 'Overcast';
  if (code <= 19)  return 'Foggy';
  if (code <= 29)  return 'Drizzle';
  if (code <= 39)  return 'Rain';
  if (code <= 49)  return 'Freezing rain';
  if (code <= 59)  return 'Snow';
  if (code <= 69)  return 'Rain showers';
  if (code <= 79)  return 'Snow showers';
  if (code <= 89)  return 'Thunderstorm';
  return 'Heavy storm';
};

export const weatherCodeIcon = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3)  return '⛅';
  if (code <= 9)  return '☁️';
  if (code <= 29) return '🌫️';
  if (code <= 49) return '🌧️';
  if (code <= 69) return '❄️';
  if (code <= 89) return '⛈️';
  return '🌩️';
};

// ── FRIENDLY ERROR MESSAGES ──
export const friendlyError = (err) => {
  if (err.errors?.length) return err.errors.join(', ');

  const msg = err.message || '';

  if (err.status === 409 || msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already exists')) {
    if (msg.toLowerCase().includes('email')) return 'A guest with that email already exists.';
    return 'A record with that value already exists.';
  }

  if (err.status === 404) return 'The requested record was not found.';
  if (err.status === 400) return msg || 'Invalid request. Please check your input.';
  if (err.status === 422) return msg || 'Validation failed. Please check your input.';

  return msg || 'Something went wrong. Please try again.';
};

// ── MULTI-SELECT COMPONENT ──
//
// Usage:
//   const { el, getSelected } = createMultiSelect({
//     placeholder: 'All Types',
//     options: [{ value: 'single', label: 'Single' }, ...],
//     onChange: (selectedValues) => { ... },
//   });
//   filtersBar.appendChild(el);
//
// getSelected() returns the current array of selected values at any time.

export const createMultiSelect = ({ placeholder, options, onChange }) => {
  let selected = new Set();

  const wrapper = document.createElement('div');
  wrapper.className = 'multi-select';

  // Trigger button
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'multi-select-trigger';

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'multi-select-trigger-label';
  triggerLabel.textContent = placeholder;

  const caret = document.createElement('span');
  caret.className = 'multi-select-caret';
  caret.textContent = '▼';

  trigger.append(triggerLabel, caret);

  // Dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'multi-select-dropdown';

  const updateTriggerLabel = () => {
    if (selected.size === 0) {
      triggerLabel.textContent = placeholder;
      triggerLabel.classList.remove('has-selection');
    } else if (selected.size === 1) {
      const val = [...selected][0];
      const opt = options.find((o) => o.value === val);
      triggerLabel.textContent = opt ? opt.label : `${selected.size} selected`;
      triggerLabel.classList.add('has-selection');
    } else {
      triggerLabel.textContent = `${selected.size} selected`;
      triggerLabel.classList.add('has-selection');
    }
  };

  options.forEach(({ value, label }) => {
    const optionEl = document.createElement('label');
    optionEl.className = 'multi-select-option';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = value;

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selected.add(value);
        optionEl.classList.add('checked');
      } else {
        selected.delete(value);
        optionEl.classList.remove('checked');
      }
      updateTriggerLabel();
      onChange([...selected]);
    });

    const labelText = document.createTextNode(label);
    optionEl.append(checkbox, labelText);
    dropdown.appendChild(optionEl);
  });

  wrapper.append(trigger, dropdown);

  // Open / close
  const close = () => {
    trigger.classList.remove('open');
    dropdown.classList.remove('open');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    // Close all other open multi-selects first
    document.querySelectorAll('.multi-select-dropdown.open').forEach((d) => {
      d.classList.remove('open');
      d.previousElementSibling?.classList.remove('open');
    });
    if (!isOpen) {
      trigger.classList.add('open');
      dropdown.classList.add('open');
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) close();
  });

  return {
    el: wrapper,
    getSelected: () => [...selected],
  };
};

// ── MODAL CLOSE ON BACKDROP CLICK ──
// Also handles [data-close] buttons delegated from document
document.addEventListener('click', (e) => {
  // data-close buttons (close button + cancel buttons in HTML)
  const closeTarget = e.target.closest('[data-close]');
  if (closeTarget) {
    closeModal(closeTarget.dataset.close);
    return;
  }

  // clicking the backdrop itself
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
  }
});