// ── ROOMS ──

import api from './api.js';
import { toast, openModal, closeModal, formatDate, formatPrice, emptyState, loading, toggleLoadMore, friendlyError, createMultiSelect } from './ui.js';

let roomsCursor = null;
let roomsSort = 'newest';
let roomsFilters = {};

// Holds the getSelected() reference for the type multi-select
let getRoomTypeSelected = () => [];

// ── SECTION TEMPLATE ──

export const roomsSection = (isAdmin = false) => {
  const section = document.createElement('div');
  section.className = 'page-section active';
  section.id = 'sectionRooms';

  // Page header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Rooms';
  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Browse available rooms';
  titleWrap.append(title, subtitle);
  header.appendChild(titleWrap);

  if (isAdmin) {
    const newBtn = document.createElement('button');
    newBtn.className = 'btn btn-primary';
    newBtn.textContent = '+ New Room';
    newBtn.addEventListener('click', openCreateRoom);
    header.appendChild(newBtn);
  }

  // Filters bar
  const filtersBar = document.createElement('div');
  filtersBar.className = 'filters-bar';

  const searchInput = document.createElement('input');
  searchInput.className = 'input';
  searchInput.id = 'roomsSearchInput';
  searchInput.placeholder = 'Room number...';
  searchInput.style.width = '160px';
  searchInput.addEventListener('input', onRoomsFilter);

  const typeMultiSelect = createMultiSelect({
    placeholder: 'All Types',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'double', label: 'Double' },
      { value: 'suite',  label: 'Suite'  },
      { value: 'deluxe', label: 'Deluxe' },
    ],
    onChange: () => onRoomsFilter(),
  });
  getRoomTypeSelected = typeMultiSelect.getSelected;

  const minPrice = document.createElement('input');
  minPrice.className = 'input';
  minPrice.id = 'roomsMinPrice';
  minPrice.type = 'number';
  minPrice.placeholder = 'Min price';
  minPrice.style.width = '110px';
  minPrice.addEventListener('input', onRoomsFilter);

  const maxPrice = document.createElement('input');
  maxPrice.className = 'input';
  maxPrice.id = 'roomsMaxPrice';
  maxPrice.type = 'number';
  maxPrice.placeholder = 'Max price';
  maxPrice.style.width = '110px';
  maxPrice.addEventListener('input', onRoomsFilter);

  // Availability — opens a dedicated modal instead of inline date pickers
  const availBtn = document.createElement('button');
  availBtn.className = 'btn btn-ghost';
  availBtn.textContent = 'Availability';
  availBtn.id = 'roomsAvailBtn';
  availBtn.addEventListener('click', () => openModal('availabilityModal'));

  const sortSelect = document.createElement('select');
  sortSelect.className = 'select';
  [
    ['newest',      'Newest'],
    ['oldest',      'Oldest'],
    ['price_asc',   'Price Low–High'],
    ['price_desc',  'Price High–Low'],
    ['number_asc',  'Number A–Z'],
    ['number_desc', 'Number Z–A'],
  ].forEach(([value, label]) => sortSelect.appendChild(new Option(label, value)));
  sortSelect.addEventListener('change', () => onRoomsSort(sortSelect.value));

  filtersBar.append(
    searchInput,
    typeMultiSelect.el,
    minPrice,
    maxPrice,
    availBtn,
    sortSelect,
  );

  // Cards grid
  const grid = document.createElement('div');
  grid.className = 'cards-grid';
  grid.id = 'roomsGrid';
  grid.appendChild(loading());

  // Load more
  const loadMoreWrap = document.createElement('div');
  loadMoreWrap.className = 'load-more-wrap';
  loadMoreWrap.id = 'roomsLoadMoreWrap';
  loadMoreWrap.style.display = 'none';

  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'btn btn-ghost';
  loadMoreBtn.textContent = 'Load More';
  loadMoreBtn.addEventListener('click', () => loadRooms(true));
  loadMoreWrap.appendChild(loadMoreBtn);

  section.append(header, filtersBar, grid, loadMoreWrap);
  return section;
};

// ── RENDER CARDS ──

export const renderRoomsCards = (rooms, append = false) => {
  const grid = document.getElementById('roomsGrid');
  if (!grid) return;

  if (!append) grid.innerHTML = '';

  if (!rooms?.length) {
    if (!append) grid.appendChild(emptyState('No rooms found'));
    return;
  }

  rooms.forEach((r) => {
    const card = document.createElement('div');
    card.className = 'room-card';

    const number = document.createElement('div');
    number.className = 'room-number';
    number.textContent = r.room_number;

    const type = document.createElement('div');
    type.className = 'room-type';
    type.textContent = r.room_type;

    const price = document.createElement('div');
    price.className = 'room-price';
    price.textContent = formatPrice(r.price_per_night);
    const perNight = document.createElement('span');
    perNight.textContent = ' / night';
    price.appendChild(perNight);

    card.append(number, type, price);
    card.addEventListener('click', () => showRoomDetail(r.id));
    grid.appendChild(card);
  });
};

// ── LOAD ──

export const loadRooms = async (append = false) => {
  const params = { sort: roomsSort, ...roomsFilters };
  if (append && roomsCursor) params.cursor = roomsCursor;

  try {
    const result = await api.getRooms(params);
    roomsCursor = result.nextCursor;
    renderRoomsCards(result.data, append);
    toggleLoadMore('roomsLoadMore', result.hasNextPage);
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── DETAIL ──

const showRoomDetail = async (id) => {
  try {
    const r = await api.getRoom(id);
    const isAdmin = document.body.dataset.mode === 'admin';

    document.getElementById('detailModalTitle').textContent = `Room ${r.room_number}`;

    const body = document.getElementById('detailModalBody');
    body.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'detail-card';

    const grid = document.createElement('div');
    grid.className = 'detail-grid';

    [
      ['Room Number', r.room_number],
      ['Type',        r.room_type],
      ['Price / Night', formatPrice(r.price_per_night)],
      ['Added',       formatDate(r.created_at)],
    ].forEach(([label, value]) => {
      const item = document.createElement('div');
      item.className = 'detail-item';
      const lbl = document.createElement('label');
      lbl.textContent = label;
      const p = document.createElement('p');
      p.textContent = value;
      if (label === 'Type') p.style.textTransform = 'capitalize';
      item.append(lbl, p);
      grid.appendChild(item);
    });

    card.appendChild(grid);
    body.appendChild(card);

    if (isAdmin) {
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:.5rem;justify-content:flex-end';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger btn-sm';
      deleteBtn.textContent = 'Delete Room';
      deleteBtn.addEventListener('click', () => {
        closeModal('detailModal');
        deleteRoom(r.id);
      });

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-ghost btn-sm';
      editBtn.textContent = 'Edit Room';
      editBtn.addEventListener('click', () => {
        closeModal('detailModal');
        openEditRoom(r);
      });

      actions.append(deleteBtn, editBtn);
      body.appendChild(actions);
    }

    openModal('detailModal');
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── CREATE / EDIT ──

export const openCreateRoom = () => {
  document.getElementById('roomModalTitle').textContent = 'Create Room';
  document.getElementById('roomFormSubmitBtn').textContent = 'Create Room';
  document.getElementById('roomForm').reset();
  document.getElementById('roomFormId').value = '';
  openModal('roomModal');
};

const openEditRoom = (r) => {
  document.getElementById('roomModalTitle').textContent = 'Edit Room';
  document.getElementById('roomFormSubmitBtn').textContent = 'Save Changes';
  document.getElementById('roomFormId').value = r.id;
  document.getElementById('roomNumber').value = r.room_number;
  document.getElementById('roomType').value = r.room_type;
  document.getElementById('roomPrice').value = r.price_per_night;
  openModal('roomModal');
};

export const submitRoomForm = async (e) => {
  e.preventDefault();

  const id = document.getElementById('roomFormId').value;
  const body = {
    room_number:     document.getElementById('roomNumber').value.trim(),
    room_type:       document.getElementById('roomType').value,
    price_per_night: parseFloat(document.getElementById('roomPrice').value),
  };

  try {
    if (id) {
      await api.updateRoom(id, body);
      toast('Room updated', 'success');
    } else {
      await api.createRoom(body);
      toast('Room created', 'success');
    }
    closeModal('roomModal');
    roomsCursor = null;
    await loadRooms();
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

const deleteRoom = async (id) => {
  if (!confirm('Delete this room? This cannot be undone.')) return;
  try {
    await api.deleteRoom(id);
    toast('Room deleted', 'success');
    roomsCursor = null;
    await loadRooms();
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── FILTERS ──

const collectBaseFilters = () => {
  const filters = {};
  const search   = document.getElementById('roomsSearchInput')?.value.trim();
  const types    = getRoomTypeSelected();
  const minPrice = document.getElementById('roomsMinPrice')?.value;
  const maxPrice = document.getElementById('roomsMaxPrice')?.value;

  if (search)       filters.search    = search;
  if (types.length) filters.type      = types;
  if (minPrice)     filters.min_price = minPrice;
  if (maxPrice)     filters.max_price = maxPrice;
  return filters;
};

const onRoomsFilter = () => {
  roomsFilters = collectBaseFilters();

  // Preserve active date filters
  const checkIn  = document.getElementById('roomsCheckIn')?.value;
  const checkOut = document.getElementById('roomsCheckOut')?.value;
  if (checkIn && checkOut) {
    roomsFilters.check_in_date  = checkIn;
    roomsFilters.check_out_date = checkOut;
  }

  roomsCursor = null;
  loadRooms();
};

const onAvailabilityFilter = () => {
  const checkIn  = document.getElementById('roomsCheckIn')?.value;
  const checkOut = document.getElementById('roomsCheckOut')?.value;

  if (!checkIn || !checkOut) {
    toast('Please select both check-in and check-out dates.', 'error');
    return;
  }

  if (checkOut <= checkIn) {
    toast('Check-out date must be after check-in date.', 'error');
    return;
  }

  roomsFilters = {
    ...collectBaseFilters(),
    check_in_date:  checkIn,
    check_out_date: checkOut,
  };

  closeModal('availabilityModal');
  updateAvailBtn(checkIn, checkOut);
  roomsCursor = null;
  loadRooms();
};

const clearAvailabilityFilter = () => {
  const checkIn  = document.getElementById('roomsCheckIn');
  const checkOut = document.getElementById('roomsCheckOut');
  if (checkIn)  checkIn.value  = '';
  if (checkOut) checkOut.value = '';

  delete roomsFilters.check_in_date;
  delete roomsFilters.check_out_date;

  updateAvailBtn(null, null);
  roomsCursor = null;
  loadRooms();
  closeModal('availabilityModal');
};

// Updates the filter bar button to reflect whether a date range is active
const updateAvailBtn = (checkIn, checkOut) => {
  const btn = document.getElementById('roomsAvailBtn');
  if (!btn) return;
  if (checkIn && checkOut) {
    btn.textContent = `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
    btn.style.color = 'var(--accent)';
    btn.style.borderColor = 'var(--accent-dim)';
  } else {
    btn.textContent = 'Availability';
    btn.style.color = '';
    btn.style.borderColor = '';
  }
};

// Called once from app.js DOMContentLoaded to wire the availability modal form
export const wireAvailabilityModal = () => {
  document.getElementById('availabilityForm')
    .addEventListener('submit', (e) => { e.preventDefault(); onAvailabilityFilter(); });

  document.getElementById('availabilityClearBtn')
    .addEventListener('click', clearAvailabilityFilter);
};

const onRoomsSort = (val) => {
  roomsSort = val;
  roomsCursor = null;
  loadRooms();
};