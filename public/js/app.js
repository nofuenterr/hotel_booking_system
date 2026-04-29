// ── APP ──

import api from './api.js';
import { toast, openModal, closeModal, formatDate, weatherCodeDesc, weatherCodeIcon } from './ui.js';
import { guestsSection, loadGuests, submitGuestForm, openCreateGuest } from './guests.js';
import { roomsSection, loadRooms, wireAvailabilityModal } from './rooms.js';
import { bookingsSection, loadBookings, loadMyBookings, submitBookingForm, submitUpdateBooking } from './bookings.js';
import { submitRoomForm, openCreateRoom } from './rooms.js';

let currentMode    = 'guest';
let currentGuestId = null;

// ── WEATHER ──

const loadWeather = async () => {
  try {
    const data = await api.getWeatherToday();
    const temp = data?.current?.temperature_2m;
    const code = data?.current?.weather_code;

    if (temp != null) {
      document.getElementById('weatherTemp').textContent = `${Math.round(temp)}°C`;
      document.getElementById('weatherDesc').textContent = weatherCodeDesc(code);
      document.getElementById('weatherIcon').textContent = weatherCodeIcon(code);
    }
  } catch {
    document.getElementById('weatherDesc').textContent = 'Unavailable';
  }
};

// ── GUEST SELECTOR ──

export const refreshGuestSelector = async () => {
  const sel = document.getElementById('guestSelectorSelect');
  if (!sel) return;

  try {
    const result = await api.getGuests({ limit: 50 });
    const guests = result.data || [];
    const prev = sel.value;

    sel.innerHTML = '';
    sel.appendChild(new Option('— Select a guest —', ''));

    guests.forEach((g) => {
      sel.appendChild(new Option(`${g.first_name} ${g.last_name} (#${g.id})`, g.id));
    });

    if (prev) sel.value = prev;
  } catch {
    // Silently fail — selector is non-critical
  }
};

// ── SIDEBAR ──

const renderSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = '';

  if (currentMode === 'admin') {
    renderAdminSidebar(sidebar);
  } else {
    renderGuestSidebar(sidebar);
  }
};

const renderAdminSidebar = (sidebar) => {
  const label = document.createElement('p');
  label.className = 'sidebar-label';
  label.textContent = 'Manage';
  sidebar.appendChild(label);

  [
    { section: 'guests',   icon: '👤', label: 'Guests' },
    { section: 'rooms',    icon: '🛏', label: 'Rooms' },
    { section: 'bookings', icon: '📋', label: 'Bookings' },
  ].forEach(({ section, icon, label }) => {
    sidebar.appendChild(createNavItem(section, icon, label));
  });
};

const renderGuestSidebar = (sidebar) => {
  // Guest selector
  const selectorWrap = document.createElement('div');
  selectorWrap.className = 'guest-selector';

  const selectorLabel = document.createElement('label');
  selectorLabel.textContent = 'Current Guest';

  const select = document.createElement('select');
  select.className = 'select';
  select.id = 'guestSelectorSelect';
  select.style.width = '100%';
  select.appendChild(new Option('— Select a guest —', ''));
  select.addEventListener('change', () => onGuestSelect(select.value));

  selectorWrap.append(selectorLabel, select);
  sidebar.appendChild(selectorWrap);

  // Browse nav
  const browseLabel = document.createElement('p');
  browseLabel.className = 'sidebar-label';
  browseLabel.textContent = 'Browse';
  sidebar.appendChild(browseLabel);
  sidebar.appendChild(createNavItem('rooms', '🛏', 'Rooms'));

  // Account nav
  const accountLabel = document.createElement('p');
  accountLabel.className = 'sidebar-label';
  accountLabel.textContent = 'My Account';
  sidebar.appendChild(accountLabel);
  sidebar.appendChild(createNavItem('my-bookings', '📋', 'My Bookings'));
  sidebar.appendChild(createNavItem('my-profile',  '👤', 'My Profile'));

  // Divider
  const hr = document.createElement('hr');
  hr.className = 'sidebar-divider';
  sidebar.appendChild(hr);

  // Register button
  const registerBtn = createNavItem(null, '➕', 'Register as Guest');
  registerBtn.addEventListener('click', openCreateGuest);
  sidebar.appendChild(registerBtn);

  refreshGuestSelector();
};

const createNavItem = (section, icon, label) => {
  const btn = document.createElement('button');
  btn.className = 'nav-item';
  if (section) btn.dataset.section = section;

  const iconSpan = document.createElement('span');
  iconSpan.className = 'nav-icon';
  iconSpan.textContent = icon;

  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;

  btn.append(iconSpan, labelSpan);

  if (section) {
    btn.addEventListener('click', () => navigateTo(section));
  }

  return btn;
};

// ── NAVIGATE ──

const navigateTo = (section) => {
  const isAdmin = currentMode === 'admin';
  const main    = document.getElementById('mainContent');

  document.querySelectorAll('.nav-item[data-section]').forEach((el) => {
    el.classList.toggle('active', el.dataset.section === section);
  });

  main.innerHTML = '';

  switch (section) {
    case 'guests':
      main.appendChild(guestsSection());
      loadGuests();
      break;

    case 'rooms':
      main.appendChild(roomsSection(isAdmin));
      loadRooms();
      break;

    case 'bookings':
      main.appendChild(bookingsSection(true));
      loadBookings();
      break;

    case 'my-bookings':
      main.appendChild(bookingsSection(false, !!currentGuestId));
      if (currentGuestId) {
        loadMyBookings(currentGuestId);
      } else {
        const tbody = document.getElementById('bookingsTbody');
        if (tbody) {
          tbody.innerHTML = '';
          const row  = document.createElement('tr');
          const cell = document.createElement('td');
          cell.colSpan = 7;
          cell.style.textAlign = 'center';
          cell.style.padding = '2rem';
          cell.style.color = 'var(--text-muted)';
          cell.textContent = 'Select a guest from the sidebar to view bookings.';
          row.appendChild(cell);
          tbody.appendChild(row);
        }
      }
      break;

    case 'my-profile':
      renderMyProfile(main);
      break;
  }
};

// ── MY PROFILE ──

const renderMyProfile = async (main) => {
  main.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'My Profile';
  titleWrap.appendChild(title);
  header.appendChild(titleWrap);

  if (!currentGuestId) {
    const registerBtn = document.createElement('button');
    registerBtn.className = 'btn btn-primary';
    registerBtn.textContent = 'Register as Guest';
    registerBtn.addEventListener('click', openCreateGuest);
    header.appendChild(registerBtn);

    const card = document.createElement('div');
    card.className = 'detail-card';
    card.style.textAlign = 'center';
    card.style.color = 'var(--text-muted)';
    card.style.padding = '3rem 1rem';

    const msg = document.createElement('p');
    msg.textContent = 'Select a guest from the sidebar to view your profile.';
    card.appendChild(msg);

    main.append(header, card);
    return;
  }

  try {
    const g = await api.getGuest(currentGuestId);

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-ghost';
    editBtn.textContent = 'Edit Profile';
    editBtn.addEventListener('click', () => {
      // Re-use guest edit modal via guests module
      import('./guests.js').then(({ openCreateGuest: _, ...mod }) => {
        // Populate the shared guest modal manually
        document.getElementById('guestModalTitle').textContent = 'Edit Profile';
        document.getElementById('guestFormSubmitBtn').textContent = 'Save Changes';
        document.getElementById('guestFormId').value = g.id;
        document.getElementById('guestFirstName').value = g.first_name;
        document.getElementById('guestLastName').value = g.last_name;
        document.getElementById('guestEmail').value = g.email;
        document.getElementById('guestPhone').value = g.phone || '';
        openModal('guestModal');
      });
    });

    header.append(titleWrap, editBtn);

    const card = document.createElement('div');
    card.className = 'detail-card';

    const grid = document.createElement('div');
    grid.className = 'detail-grid';

    [
      ['First Name',   g.first_name],
      ['Last Name',    g.last_name],
      ['Email',        g.email],
      ['Phone',        g.phone || '—'],
      ['Member Since', formatDate(g.created_at)],
    ].forEach(([label, value]) => {
      const item = document.createElement('div');
      item.className = 'detail-item';
      const lbl = document.createElement('label');
      lbl.textContent = label;
      const p = document.createElement('p');
      p.textContent = value;
      item.append(lbl, p);
      grid.appendChild(item);
    });

    card.appendChild(grid);
    main.append(header, card);
  } catch (err) {
    toast(err.message || 'Failed to load profile', 'error');
  }
};

// ── GUEST SELECT ──

const onGuestSelect = (id) => {
  currentGuestId = id ? parseInt(id) : null;

  const activeNav = document.querySelector('.nav-item.active');
  const section   = activeNav?.dataset.section;

  if (section === 'my-bookings') navigateTo('my-bookings');
  if (section === 'my-profile')  navigateTo('my-profile');
};

// ── MODE SWITCH ──

const setMode = (mode) => {
  currentMode = mode;
  document.body.dataset.mode = mode;

  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  renderSidebar();
  navigateTo(mode === 'admin' ? 'guests' : 'rooms');
};

// ── FORM WIRING ──
// Forms in the static HTML are wired here so that modules don't need globals

const wireFormListeners = () => {
  document.getElementById('guestForm')
    .addEventListener('submit', submitGuestForm);

  document.getElementById('roomForm')
    .addEventListener('submit', submitRoomForm);

  document.getElementById('bookingForm')
    .addEventListener('submit', submitBookingForm);

  document.getElementById('updateBookingForm')
    .addEventListener('submit', submitUpdateBooking);
};

// ── MODE TOGGLE WIRING ──

const wireModeToggle = () => {
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });
};

// ── INIT ──

document.addEventListener('DOMContentLoaded', () => {
  document.body.dataset.mode = 'guest';
  wireFormListeners();
  wireModeToggle();
  wireAvailabilityModal();
  loadWeather();
  renderSidebar();
  navigateTo('rooms');
});