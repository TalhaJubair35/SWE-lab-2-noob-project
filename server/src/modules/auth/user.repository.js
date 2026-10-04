import db from '../../db/connection.js';

export const findByEmail = (email) => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

export const findById = (id) => {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
};

export const create = ({ name, email, passwordHash, role }) => {
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name, email, passwordHash, role);

  return result.lastInsertRowid;
};

export default { findByEmail, findById, create };
