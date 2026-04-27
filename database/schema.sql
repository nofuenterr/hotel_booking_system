CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT guests_first_name_not_blank CHECK (TRIM(first_name) <> ''),
  CONSTRAINT guests_last_name_not_blank CHECK (TRIM(last_name) <> ''),
  CONSTRAINT guests_email_not_blank CHECK (TRIM(email) <> ''),
  CONSTRAINT guests_phone_not_blank CHECK (phone IS NULL OR TRIM(phone) <> '')
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  price_per_night NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rooms_room_number_not_blank CHECK (TRIM(room_number) <> ''),
  CONSTRAINT rooms_valid_room_type CHECK (room_type IN ('single','double','suite','deluxe')),
  CONSTRAINT rooms_price_positive CHECK (price_per_night > 0)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  weather JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_unique_room_dates UNIQUE (room_id, check_in_date, check_out_date),
  CONSTRAINT bookings_check_out_after_check_in CHECK (check_out_date > check_in_date),
  CONSTRAINT bookings_valid_status CHECK (status IN ('pending','cancelled','confirmed'))
);