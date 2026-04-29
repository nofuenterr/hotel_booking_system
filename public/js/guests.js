// ── GUESTS ──

import api from './api.js';
import { toast, openModal, closeModal, formatDate, emptyState, loading, toggleLoadMore, friendlyError } from './ui.js';
import { refreshGuestSelector } from './app.js';

let guestsCursor = null;
let guestsSort = 'newest';
let guestsSearch = '';

// ── SECTION TEMPLATE ──

export const guestsSection = () => {
  const section = document.createElement('div');
  section.className = 'page-section active';
  section.id = 'sectionGuests';

  // Page header
  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Guests';
  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Manage hotel guests';
  titleWrap.append(title, subtitle);

  const newBtn = document.createElement('button');
  newBtn.className = 'btn btn-primary';
  newBtn.textContent = '+ New Guest';
  newBtn.addEventListener('click', openCreateGuest);

  header.append(titleWrap, newBtn);

  // Filters
  const filtersBar = document.createElement('div');
  filtersBar.className = 'filters-bar';

  const searchInput = document.createElement('input');
  searchInput.className = 'input';
  searchInput.id = 'guestsSearchInput';
  searchInput.placeholder = 'Search by name...';
  searchInput.style.width = '200px';
  searchInput.addEventListener('input', () => onGuestsSearch(searchInput.value));

  const sortSelect = document.createElement('select');
  sortSelect.className = 'select';
  [
    ['newest',         'Newest'],
    ['oldest',         'Oldest'],
    ['first_name_asc', 'First Name A–Z'],
    ['first_name_desc','First Name Z–A'],
    ['last_name_asc',  'Last Name A–Z'],
    ['last_name_desc', 'Last Name Z–A'],
  ].forEach(([value, label]) => {
    const opt = new Option(label, value);
    sortSelect.appendChild(opt);
  });
  sortSelect.addEventListener('change', () => onGuestsSort(sortSelect.value));

  filtersBar.append(searchInput, sortSelect);

  // Table
  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-wrap';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['#', 'Name', 'Email', 'Phone', 'Joined'].forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  tbody.id = 'guestsTbody';
  const initRow = document.createElement('tr');
  const initCell = document.createElement('td');
  initCell.colSpan = 5;
  initCell.appendChild(loading());
  initRow.appendChild(initCell);
  tbody.appendChild(initRow);

  table.append(thead, tbody);
  tableWrap.appendChild(table);

  // Load more
  const loadMoreWrap = document.createElement('div');
  loadMoreWrap.className = 'load-more-wrap';
  loadMoreWrap.id = 'guestsLoadMoreWrap';
  loadMoreWrap.style.display = 'none';

  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'btn btn-ghost';
  loadMoreBtn.textContent = 'Load More';
  loadMoreBtn.addEventListener('click', () => loadGuests(true));
  loadMoreWrap.appendChild(loadMoreBtn);

  section.append(header, filtersBar, tableWrap, loadMoreWrap);
  return section;
};

// ── RENDER TABLE ──

export const renderGuestsTable = (guests, append = false) => {
  const tbody = document.getElementById('guestsTbody');
  if (!tbody) return;

  if (!append) tbody.innerHTML = '';

  if (!guests?.length) {
    if (!append) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.appendChild(emptyState('No guests found'));
      row.appendChild(cell);
      tbody.appendChild(row);
    }
    return;
  }

  guests.forEach((g) => {
    const tr = document.createElement('tr');

    [
      g.id,
      `${g.first_name} ${g.last_name}`,
      g.email,
      g.phone || '—',
      formatDate(g.created_at),
    ].forEach((text) => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });

    tr.addEventListener('click', () => showGuestDetail(g.id));
    tbody.appendChild(tr);
  });
};

// ── LOAD ──

export const loadGuests = async (append = false) => {
  const params = { sort: guestsSort };
  if (guestsSearch) params.search = guestsSearch;
  if (append && guestsCursor) params.cursor = guestsCursor;

  try {
    const result = await api.getGuests(params);
    guestsCursor = result.nextCursor;
    renderGuestsTable(result.data, append);
    toggleLoadMore('guestsLoadMore', result.hasNextPage);
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── DETAIL ──

const showGuestDetail = async (id) => {
  try {
    const g = await api.getGuest(id);
    const isAdmin = document.body.dataset.mode === 'admin';

    const title = document.getElementById('detailModalTitle');
    title.textContent = `Guest #${g.id}`;

    const body = document.getElementById('detailModalBody');
    body.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'detail-card';

    const grid = document.createElement('div');
    grid.className = 'detail-grid';

    [
      ['First Name',    g.first_name],
      ['Last Name',     g.last_name],
      ['Email',         g.email],
      ['Phone',         g.phone || '—'],
      ['Member Since',  formatDate(g.created_at)],
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
    body.appendChild(card);

    if (isAdmin) {
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:.5rem;justify-content:flex-end';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-ghost btn-sm';
      editBtn.textContent = 'Edit Guest';
      editBtn.addEventListener('click', () => {
        closeModal('detailModal');
        openEditGuest(g);
      });

      actions.appendChild(editBtn);
      body.appendChild(actions);
    }

    openModal('detailModal');
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── CREATE / EDIT ──

export const openCreateGuest = () => {
  document.getElementById('guestModalTitle').textContent = 'Create Guest';
  document.getElementById('guestFormSubmitBtn').textContent = 'Create Guest';
  document.getElementById('guestForm').reset();
  document.getElementById('guestFormId').value = '';
  openModal('guestModal');
};

const openEditGuest = (g) => {
  document.getElementById('guestModalTitle').textContent = 'Edit Guest';
  document.getElementById('guestFormSubmitBtn').textContent = 'Save Changes';
  document.getElementById('guestFormId').value = g.id;
  document.getElementById('guestFirstName').value = g.first_name;
  document.getElementById('guestLastName').value = g.last_name;
  document.getElementById('guestEmail').value = g.email;
  document.getElementById('guestPhone').value = g.phone || '';
  openModal('guestModal');
};

export const submitGuestForm = async (e) => {
  e.preventDefault();

  const id = document.getElementById('guestFormId').value;
  const body = {
    first_name: document.getElementById('guestFirstName').value.trim(),
    last_name:  document.getElementById('guestLastName').value.trim(),
    email:      document.getElementById('guestEmail').value.trim(),
    phone:      document.getElementById('guestPhone').value.trim() || undefined,
  };

  try {
    if (id) {
      await api.updateGuest(id, body);
      toast('Guest updated', 'success');
    } else {
      await api.createGuest(body);
      toast('Guest created', 'success');
    }
    closeModal('guestModal');
    guestsCursor = null;
    await loadGuests();
    await refreshGuestSelector();
  } catch (err) {
    toast(friendlyError(err), 'error');
  }
};

// ── FILTER / SORT ──

const onGuestsSearch = (val) => {
  guestsSearch = val;
  guestsCursor = null;
  loadGuests();
};

const onGuestsSort = (val) => {
  guestsSort = val;
  guestsCursor = null;
  loadGuests();
};