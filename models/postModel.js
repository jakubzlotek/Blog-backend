const db = require("../database");

const Post = {
  findAll: (callback) => {
    db.all(
      `SELECT 
         posts.id, 
         posts.title, 
         posts.content, 
         posts.user_id, 
         posts.created_at, 
         users.username 
       FROM posts
       JOIN users ON posts.user_id = users.id
       ORDER BY posts.created_at DESC`,
      (err, rows) => {
        // rows to tablica obiektów, każdy odpowiada jednemu wierszowi
        callback(err, rows);
      }
    );
  },

  findAllPaginated: (page = 1, limit = 10, callback) => {
    const offset = (page - 1) * limit;
    db.all(
      `SELECT 
         posts.id, 
         posts.title, 
         posts.content, 
         posts.user_id, 
         posts.created_at, 
         users.username 
       FROM posts
       JOIN users ON posts.user_id = users.id
       ORDER BY posts.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, rows) => {
        callback(err, rows);
      }
    );
  },

  findById: (id, callback) => {
    db.get(
      `SELECT 
         posts.id, 
         posts.title, 
         posts.content, 
         posts.user_id, 
         posts.created_at, 
         users.username 
       FROM posts
       JOIN users ON posts.user_id = users.id
       WHERE posts.id = ?`,
      [id],
      (err, row) => {
        callback(err, row);
      }
    );
  },

  create: (title, content, userId, callback) => {
    // Po wykonaniu INSERT, funkcja run() udostępnia this.lastID
    db.run(
      `INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)`,
      [title, content, userId],
      function (err) {
        // this.lastID to id nowo wstawionego wiersza
        if (err) {
          return callback(err);
        }
        callback(null, this.lastID);
      }
    );
  },

  delete: (id, callback) => {
    db.run(
      `DELETE FROM posts WHERE id = ?`,
      [id],
      function (err) {
        // this.changes to liczba usuniętych wierszy (opcjonalnie można zwrócić)
        callback(err);
      }
    );
  },

  search: (query, callback) => {
    const hashtags = query.match(/#[\w]+/g) || [];
    const plainText = query.replace(/#[\w]+/g, "").trim();

    let sql = `SELECT 
                 posts.id, 
                 posts.title, 
                 posts.content, 
                 posts.user_id, 
                 posts.created_at, 
                 users.username 
               FROM posts
               JOIN users ON posts.user_id = users.id
               WHERE `;
    let params = [];

    if (hashtags.length > 0) {
      sql += hashtags.map(() => "content LIKE ?").join(" AND ");
      params = hashtags.map((tag) => `%${tag}%`);
    } else {
      sql += "(title LIKE ? OR content LIKE ?)";
      params.push(`%${plainText}%`, `%${plainText}%`);
    }
    sql += " ORDER BY posts.created_at DESC";

    db.all(sql, params, (err, rows) => {
      callback(err, rows);
    });
  },
};

module.exports = Post;