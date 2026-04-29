// ── BOOKINGS ──

import api from './api.js';
import { toast, openModal, closeModal, formatDate, badge, emptyState, loading, toggleLoadMore, weatherCodeDesc, friendlyError, createMultiSelect, formatPrice } from './ui.js';

let bookingsCursor    = null;
let myBookingsCursor  = null;
let bookingsSort      = 'newest';
let bookingsStatuses  = [];   // array for multi-select

// Holds the getSelected() reference for the status multi-select
let getStatusSelected = () => [];

// Tracks whether we're viewing all bookings (admin) or a guest's bookings
let activeGuestId = null;

// ── SECTION TEMPLATE ──

export const bookingsSection = (isAdmin = false, hasGuest = false) => {
  const section = document.createElement('div');
  section.className = 'page-section active';
  section.id = 'sectionBookings';

  // Page header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Bookings';
  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = isAdmin ? 'All hotel bookings' : 'Your bookings';
  titleWrap.append(title, subtitle);

  const newBtn = document.createElement('button');
  newBtn.className = 'btn btn-primary';
  newBtn.textContent = '+ New Booking';
  newBtn.addEventListener('click', openCreateBooking);

  header.append(titleWrap, newBtn);

  // Filters bar — only shown when there is data to filter
  // (admin always has data; guest mode only when a guest is selected)
  const showFilters = isAdmin || hasGuest;

  if (showFilters) {
    const filtersBar = document.createElement('div');
    filtersBar.className = 'filters-bar';

    const statusMultiSelect = createMultiSelect({
      placeholder: 'All Statuses',
      options: [
        { value: 'pending',   label: 'Pending'   },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      onChange: (selected) => onBookingsStatusFilter(selected),
    });
    getStatusSelected = statusMultiSelect.getSelected;
    filtersBar.appendChild(statusMultiSelect.el);

    const sortSelect = document.createElement('select');
    sortSelect.className = 'select';
    [
      ['newest',             'Newest'],
      ['oldest',             'Oldest'],
      ['check_in_date_asc',  'Check-In ↑'],
      ['check_in_date_desc', 'Check-In ↓'],
      ['check_out_date_asc', 'Check-Out ↑'],
      ['check_out_date_desc','Check-Out ↓'],
    ].forEach(([value, label]) => sortSelect.appendChild(new Option(label, value)));
    sortSelect.addEventListener('change', () => onBookingsSort(sortSelect.value, isAdmin));
    filtersBar.appendChild(sortSelect);

    section.appendChild(header);
    section.appendChild(filtersBar);
  } else {
    section.appendChild(header);
  }
  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-wrap';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  ['#', 'Guest', 'Room', 'Check-In', 'Check-Out', 'Status', 'Actions'].forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  tbody.id = 'bookingsTbody';

  const initRow = document.createElement('tr');
  const initCell = document.createElement('td');
  initCell.colSpan = 7;
  initCell.appendChild(loading());
  initRow.appendChild(initCell);
  tbody.appendChild(initRow);

  table.append(thead, tbody);
  tableWrap.appendChild(table);

  // Load more
  const loadMoreWrap = document.createElement('div');
  loadMoreWrap.className = 'load-more-wrap';
  loadMoreWrap.id = 'bookingsLoadMoreWrap';
  loadMoreWrap.style.display = 'none';

  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'btn btn-ghost';
  loadMoreBtn.textContent = 'Load More';
  loadMoreBtn.addEventListener('click', () => {
    if (activeGuestId) {
      loadMyBookings(activeGuestId, true);
    } else {
      loadBookings(true);
    }
  });
  loadMoreWrap.appendChild(loadMoreBtn);

  section.append(tableWrap, loadMoreWrap);
  return section;
};

// ── RENDER TABLE ──

export const renderBookingsTable = (bookings, append = false) => {
  const tbody = document.getElementById('bookingsTbody');
  if (!tbody) return;

  if (!append) tbody.innerHTML = '';

  if (!bookings?.length) {
    if (!append) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7;
      cell.appendChild(emptyState('No bookings found'));
      row.appendChild(cell);
      tbody.appendChild(row);
    }
    return;
  }

  const isAdmin = document.body.dataset.mode === 'admin';

  bookings.forEach((b) => {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => showBookingDetail(b.booking_id));

    // ID
    const tdId = document.createElement('td');
    tdId.textContent = b.booking_id;

    // Guest — shown in both admin and guest mode
    const tdGuest = document.createElement('td');
    tdGuest.textContent = b.first_name && b.last_name
      ? `${b.first_name} ${b.last_name}`
      : '—';

    // Room
    const tdRoom = document.createElement('td');
    tdRoom.textContent = b.room_number || '—';

    // Check-in
    const tdCheckIn = document.createElement('td');
    tdCheckIn.textContent = formatDate(b.check_in_date);

    // Check-out
    const tdCheckOut = document.createElement('td');
    tdCheckOut.textContent = formatDate(b.check_out_date);

    // Status
    const tdStatus = document.createElement('td');
    tdStatus.appendChild(badge(b.status));

    // Actions
    const tdActions = document.createElement('td');
    const tdActionsWrapper = document.createElement('div');
    tdActionsWrapper.style.cssText = 'display:flex;gap:.4rem;align-items:center';
    tdActionsWrapper.addEventListener('click', (e) => e.stopPropagation());

    if (isAdmin) {
      const updateBtn = document.createElement('button');
      updateBtn.className = 'btn btn-ghost btn-sm';
      updateBtn.textContent = 'Update';
      updateBtn.addEventListener('click', () => openUpdateBooking(b.booking_id, b.status));
      tdActionsWrapper.appendChild(updateBtn);
    }

    if (b.status === 'pending') {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-danger btn-sm';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => cancelBookingById(b.booking_id));
      tdActionsWrapper.appendChild(cancelBtn);
    }

    tdActions.appendChild(tdActionsWrapper);

    tr.append(tdId, tdGuest, tdRoom, tdCheckIn, tdCheckOut, tdStatus, tdActions);
    tbody.appendChild(tr);
  });
};

// ── LOAD ALL BOOKINGS (admin) ──

export const loadBookings = async (append = false) => {
  activeGuestId = null;

  const params = { sort: bookingsSort };
  if (bookingsStatuses.length) params.status = bookingsStatuses; // array → "pending,confirmed" via buildQuery
  if (append && bookingsCursor) params.cursor = bookingsCursor;

  try {
    const result = await api.getBookings(params);
    bookingsCursor = result.nextCursor;
    renderBookingsTable(result.data, append);
    toggleLoadMore('bookingsLoadMore', result.hasNextPage);
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── LOAD GUEST BOOKINGS (guest mode) ──

export const loadMyBookings = async (guestId, append = false) => {
  if (!guestId) return;
  activeGuestId = guestId;

  const params = { sort: bookingsSort };
  if (bookingsStatuses.length) params.status = bookingsStatuses;
  if (append && myBookingsCursor) params.cursor = myBookingsCursor;

  try {
    const result = await api.getGuestBookings(guestId, params);
    myBookingsCursor = result.nextCursor;
    renderBookingsTable(result.data, append);
    toggleLoadMore('bookingsLoadMore', result.hasNextPage);
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── DETAIL ──

const showBookingDetail = async (id) => {
  try {
    const b = await api.getBooking(id);

    document.getElementById('detailModalTitle').textContent = `Booking #${b.booking_id}`;

    const body = document.getElementById('detailModalBody');
    body.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'detail-card';

    const grid = document.createElement('div');
    grid.className = 'detail-grid';

    [
      ['Guest',     `${b.first_name} ${b.last_name}`],
      ['Room',      b.room_number || b.room_id],
      ['Email',      b.email],
      ['Type',      b.room_type],
      ['Phone',      b.phone  || '—'],
      ['Price / night',      formatPrice(b.price_per_night)],
      ['Check-In',  formatDate(b.check_in_date)],
      ['Check-Out', formatDate(b.check_out_date)],
      ['Created',   formatDate(b.created_at)],
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

    // Status with badge
    const statusItem = document.createElement('div');
    statusItem.className = 'detail-item';
    const statusLbl = document.createElement('label');
    statusLbl.textContent = 'Status';
    statusItem.append(statusLbl, badge(b.status));
    grid.appendChild(statusItem);

    card.appendChild(grid);
    body.appendChild(card);

    if (b.weather) {
      const weatherCard = document.createElement('div');
      weatherCard.className = 'detail-card';
      weatherCard.style.marginTop = '.75rem';

      const weatherTitle = document.createElement('p');
      weatherTitle.style.cssText = 'font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin-bottom:.75rem';
      weatherTitle.textContent = 'Weather at Check-In';

      const weatherGrid = document.createElement('div');
      weatherGrid.className = 'detail-grid';

      [
        ['Condition', weatherCodeDesc(b.weather?.daily?.weather_code?.[0])],
        ['Min Temp',  `${b.weather?.daily?.temperature_2m_min?.[0] ?? '—'}°C`],
        ['Max Temp',  `${b.weather?.daily?.temperature_2m_max?.[0] ?? '—'}°C`],
      ].forEach(([label, value]) => {
        const item = document.createElement('div');
        item.className = 'detail-item';
        const lbl = document.createElement('label');
        lbl.textContent = label;
        const p = document.createElement('p');
        p.textContent = value;
        item.append(lbl, p);
        weatherGrid.appendChild(item);
      });

      weatherCard.append(weatherTitle, weatherGrid);
      body.appendChild(weatherCard);
    }

    openModal('detailModal');
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── CREATE BOOKING ──

export const openCreateBooking = async () => {
  try {
    const [guestsRes, roomsRes] = await Promise.all([
      api.getGuests({ limit: 50 }),
      api.getRooms({ limit: 50 }),
    ]);

    const guestSelect = document.getElementById('bookingGuestId');
    const roomSelect  = document.getElementById('bookingRoomId');

    guestSelect.innerHTML = '<option value="">Select guest</option>';
    roomSelect.innerHTML  = '<option value="">Select room</option>';

    (guestsRes.data || []).forEach((g) => {
      guestSelect.appendChild(new Option(`${g.first_name} ${g.last_name}`, g.id));
    });

    (roomsRes.data || []).forEach((r) => {
      roomSelect.appendChild(
        new Option(`Room ${r.room_number} — ${r.room_type} (${parseFloat(r.price_per_night).toFixed(2)}/night)`, r.id)
      );
    });
  } catch (err) {
    toast('Failed to load guests or rooms.', 'error');
  }

  document.getElementById('bookingForm').reset();
  openModal('bookingModal');
};

export const submitBookingForm = async (e) => {
  e.preventDefault();

  const body = {
    guest_id:       parseInt(document.getElementById('bookingGuestId').value),
    room_id:        parseInt(document.getElementById('bookingRoomId').value),
    check_in_date:  document.getElementById('bookingCheckIn').value,
    check_out_date: document.getElementById('bookingCheckOut').value,
  };

  try {
    await api.createBooking(body);
    toast('Booking created', 'success');
    closeModal('bookingModal');
    bookingsCursor   = null;
    myBookingsCursor = null;

    if (activeGuestId) {
      await loadMyBookings(activeGuestId);
    } else {
      await loadBookings();
    }
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── CANCEL ──

const cancelBookingById = async (id) => {
  if (!confirm('Cancel this booking?')) return;
  try {
    await api.cancelBooking(id);
    toast('Booking cancelled', 'success');
    bookingsCursor   = null;
    myBookingsCursor = null;

    if (activeGuestId) {
      await loadMyBookings(activeGuestId);
    } else {
      await loadBookings();
    }
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── UPDATE STATUS (admin) ──

const openUpdateBooking = (id, currentStatus) => {
  document.getElementById('updateBookingId').value = id;
  document.getElementById('updateBookingStatus').value = currentStatus;
  openModal('updateBookingModal');
};

export const submitUpdateBooking = async (e) => {
  e.preventDefault();

  const id     = document.getElementById('updateBookingId').value;
  const status = document.getElementById('updateBookingStatus').value;

  try {
    await api.updateBooking(id, { status });
    toast('Booking updated', 'success');
    closeModal('updateBookingModal');
    bookingsCursor = null;
    await loadBookings();
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── FILTER / SORT ──

const onBookingsStatusFilter = (selected) => {
  bookingsStatuses = selected;

  if (activeGuestId) {
    myBookingsCursor = null;
    loadMyBookings(activeGuestId);
  } else {
    bookingsCursor = null;
    loadBookings();
  }
};

// Sort respects whether we're in guest or admin mode
const onBookingsSort = (val, isAdmin) => {
  bookingsSort = val;

  if (isAdmin || !activeGuestId) {
    bookingsCursor = null;
    loadBookings();
  } else {
    myBookingsCursor = null;
    loadMyBookings(activeGuestId);
  }
};