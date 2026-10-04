import db, { seedDatabase } from './connection.js';

await seedDatabase();

console.log('Database seed complete');

export default db;
