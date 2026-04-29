INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, status, created_at) VALUES
  (1, 1, '2026-01-01', '2026-01-05', 'confirmed', NOW() - INTERVAL '70 days'),
  (2, 2, '2026-01-03', '2026-01-07', 'pending', NOW() - INTERVAL '69 days'),
  (3, 3, '2026-01-05', '2026-01-10', 'confirmed', NOW() - INTERVAL '68 days'),
  (4, 4, '2026-01-08', '2026-01-12', 'cancelled', NOW() - INTERVAL '67 days'),
  (5, 5, '2026-01-10', '2026-01-14', 'pending', NOW() - INTERVAL '66 days'),

  (6, 1, '2026-01-06', '2026-01-09', 'confirmed', NOW() - INTERVAL '65 days'),
  (7, 2, '2026-01-10', '2026-01-14', 'confirmed', NOW() - INTERVAL '64 days'),
  (8, 3, '2026-01-12', '2026-01-16', 'pending', NOW() - INTERVAL '63 days'),
  (9, 4, '2026-01-15', '2026-01-20', 'confirmed', NOW() - INTERVAL '62 days'),
  (10, 5, '2026-01-16', '2026-01-19', 'cancelled', NOW() - INTERVAL '61 days'),

  (11, 6, '2026-02-01', '2026-02-05', 'confirmed', NOW() - INTERVAL '60 days'),
  (12, 7, '2026-02-02', '2026-02-06', 'pending', NOW() - INTERVAL '59 days'),
  (13, 8, '2026-02-04', '2026-02-08', 'confirmed', NOW() - INTERVAL '58 days'),
  (14, 9, '2026-02-06', '2026-02-11', 'pending', NOW() - INTERVAL '57 days'),
  (15, 10, '2026-02-08', '2026-02-13', 'cancelled', NOW() - INTERVAL '56 days'),

  (16, 11, '2026-03-01', '2026-03-05', 'confirmed', NOW() - INTERVAL '55 days'),
  (17, 12, '2026-03-03', '2026-03-08', 'pending', NOW() - INTERVAL '54 days'),
  (18, 13, '2026-03-05', '2026-03-10', 'confirmed', NOW() - INTERVAL '53 days'),
  (19, 14, '2026-03-07', '2026-03-12', 'pending', NOW() - INTERVAL '52 days'),
  (20, 15, '2026-03-09', '2026-03-14', 'cancelled', NOW() - INTERVAL '51 days'),

  (21, 16, '2026-04-01', '2026-04-06', 'confirmed', NOW() - INTERVAL '50 days'),
  (22, 17, '2026-04-02', '2026-04-07', 'pending', NOW() - INTERVAL '49 days'),
  (23, 18, '2026-04-04', '2026-04-09', 'confirmed', NOW() - INTERVAL '48 days'),
  (24, 19, '2026-04-06', '2026-04-11', 'cancelled', NOW() - INTERVAL '47 days'),
  (25, 20, '2026-04-08', '2026-04-13', 'confirmed', NOW() - INTERVAL '46 days'),

  (1, 6, '2026-05-01', '2026-05-05', 'confirmed', NOW() - INTERVAL '45 days'),
  (2, 7, '2026-05-03', '2026-05-08', 'pending', NOW() - INTERVAL '44 days'),
  (3, 8, '2026-05-05', '2026-05-10', 'confirmed', NOW() - INTERVAL '43 days'),
  (4, 9, '2026-05-07', '2026-05-12', 'pending', NOW() - INTERVAL '42 days'),
  (5, 10, '2026-05-09', '2026-05-14', 'cancelled', NOW() - INTERVAL '41 days');