INSERT INTO rooms (room_number, room_type, price_per_night, created_at) VALUES
  ('101', 'single', 99.99, NOW() - INTERVAL '90 days'),
  ('102', 'double', 149.99, NOW() - INTERVAL '89 days'),
  ('103', 'single', 95.00, NOW() - INTERVAL '88 days'),
  ('104', 'double', 155.00, NOW() - INTERVAL '87 days'),
  ('105', 'deluxe', 210.00, NOW() - INTERVAL '86 days'),

  ('201', 'suite', 299.99, NOW() - INTERVAL '85 days'),
  ('202', 'deluxe', 199.99, NOW() - INTERVAL '84 days'),
  ('203', 'single', 110.00, NOW() - INTERVAL '83 days'),
  ('204', 'double', 165.00, NOW() - INTERVAL '82 days'),
  ('205', 'suite', 320.00, NOW() - INTERVAL '81 days'),

  ('301', 'single', 89.99, NOW() - INTERVAL '80 days'),
  ('302', 'double', 145.50, NOW() - INTERVAL '79 days'),
  ('303', 'deluxe', 225.00, NOW() - INTERVAL '78 days'),
  ('304', 'suite', 350.00, NOW() - INTERVAL '77 days'),
  ('305', 'single', 92.50, NOW() - INTERVAL '76 days'),

  ('401', 'suite', 399.99, NOW() - INTERVAL '75 days'),
  ('402', 'suite', 375.00, NOW() - INTERVAL '74 days'),
  ('403', 'double', 180.00, NOW() - INTERVAL '73 days'),
  ('404', 'single', 105.00, NOW() - INTERVAL '72 days'),
  ('405', 'deluxe', 240.00, NOW() - INTERVAL '71 days');