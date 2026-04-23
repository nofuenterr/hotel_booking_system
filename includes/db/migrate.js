const fs = require('fs');
const path = require('path');
const db = require('./db.js');

const run = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    await db.query(sql);
    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await db.end();
  }
};

run();