const db = require('../database');

const User = {
  findByEmail: (email, callback) => {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      callback
    );
  },

  findByUsername: (username, callback) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      callback
    );
  },

  // opcjonalnie: uniwersalne wyszukiwanie po email lub username
  findByUsernameOrEmail: (identifier, callback) => {
    db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [identifier, identifier],
      callback
    );
  },

  create: (username, email, password, callback) => {
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password],
      callback
    );
  },

  findById: (id, callback) => {
    db.get(
      'SELECT id, username, email FROM users WHERE id = ?',
      [id],
      callback
    );
  },

  update: (id, username, email, callback) => {
    db.run(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, id],
      callback
    );
  }
};

module.exports = User;