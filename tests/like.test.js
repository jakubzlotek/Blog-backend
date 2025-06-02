const request = require('supertest');
const db = require('../database');
const app = require('../app');

let userToken;
let postId;

beforeAll((done) => {
  // Clean up all tables before running tests
  db.run('DELETE FROM likes', () => {
    db.run('DELETE FROM posts', () => {
      db.run('DELETE FROM users', done);
    });
  });
});

afterAll((done) => {
  // Clean up likes, posts, and users
  db.run('DELETE FROM likes', () => {
    db.run('DELETE FROM posts', () => {
      db.run('DELETE FROM users', done);
    });
  });
});

describe('Like Integration Tests', () => {
  beforeAll(async () => {
    // Register and login a user to get a token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'likeuser', email: 'likeuser@example.com', password: 'Password123!@#' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'likeuser@example.com', password: 'Password123!@#' });

    userToken = loginRes.body.token;

    // Create a post to like
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Likeable Post', content: 'This post will be liked.' });

    // Get the post ID
    const postsRes = await request(app).get('/api/posts');
    const post = postsRes.body.posts.find(p => p.title === 'Likeable Post');
    postId = post.id;
  });

  test('GET /api/posts/:id/like returns array', async () => {
    const res = await request(app).get(`/api/posts/${postId}/like`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.likes)).toBe(true);
  });

  test('POST /api/posts/:id/like adds a like', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/like added/i);
  });

  test('POST /api/posts/:id/like without token returns 401', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/unauthorized/i);
  });

  test('POST /api/posts/:id/like with invalid post id returns 404', async () => {
    const res = await request(app)
      .post('/api/posts/999999/like')
      .set('Authorization', `Bearer ${userToken}`);


    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});