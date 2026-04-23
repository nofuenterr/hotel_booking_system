const fs = require('fs');
const path = require('path');
const db = require('./db.js');

const seedFiles = [
  '001_guests.sql',
  '002_rooms.sql',
  '003_bookings.sql'
];

const run = async () => {
  try {
    for (const file of seedFiles) {
      const sql = fs.readFileSync(path.join(__dirname, '../../database/seeds', file), 'utf8');
      await db.query(sql);
      console.log(`Seeded: ${file}`);
    }
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await db.end();
  }
};

run();