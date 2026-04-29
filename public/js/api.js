// ── API LAYER ──

const BASE = '/bookings';

// Serializes params to a query string.
// Arrays are joined as comma-separated values: { type: ['single','double'] } → "type=single,double"
export const buildQuery = (params) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      if (value.length > 0) query.set(key, value.join(','));
    } else if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  }
  return query.toString();
};

const http = async (method, url, body) => {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, message: data.error || data.message || 'Request failed', errors: data.errors };
  }

  return data;
};

const api = {
  // Weather
  getWeatherToday: () => fetch('/weather/today').then((r) => r.json()),

  // Guests
  getGuests:   (params = {}) => http('GET',   `${BASE}/guests?${buildQuery(params)}`),
  getGuest:    (id)          => http('GET',   `${BASE}/guests/${id}`),
  createGuest: (body)        => http('POST',  `${BASE}/guests`, body),
  updateGuest: (id, body)    => http('PATCH', `${BASE}/guests/${id}`, body),

  // Rooms
  getRooms:   (params = {}) => http('GET',    `${BASE}/rooms?${buildQuery(params)}`),
  getRoom:    (id)          => http('GET',    `${BASE}/rooms/${id}`),
  createRoom: (body)        => http('POST',   `${BASE}/rooms`, body),
  updateRoom: (id, body)    => http('PATCH',  `${BASE}/rooms/${id}`, body),
  deleteRoom: (id)          => http('DELETE', `${BASE}/rooms/${id}`),

  // Bookings
  getBookings:      (params = {})        => http('GET',    `${BASE}?${buildQuery(params)}`),
  getGuestBookings: (guestId, params={}) => http('GET',    `${BASE}/guest/${guestId}?${buildQuery(params)}`),
  getBooking:       (id)                 => http('GET',    `${BASE}/${id}`),
  createBooking:    (body)               => http('POST',   `${BASE}`, body),
  updateBooking:    (id, body)           => http('PATCH',  `${BASE}/${id}`, body),
  cancelBooking:    (id)                 => http('DELETE', `${BASE}/${id}`),
};

export default api;