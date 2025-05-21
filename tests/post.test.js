const request = require('supertest');
const jwt = require('jsonwebtoken');
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

describe('Post Integration Tests', () => {
  beforeEach(async () => {
    // Clean up posts and users before each test to avoid ID and user conflicts
    await new Promise((resolve) => db.run('DELETE FROM posts', resolve));
    await new Promise((resolve) => db.run('DELETE FROM users', resolve));

    // Use a unique email for each test run
    const uniqueEmail = `postuser_${Date.now()}_${Math.random()}@example.com`;

    // Register and login a user to get a token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'postuser', email: uniqueEmail, password: 'pass123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'pass123' });

    userToken = loginRes.body.token;

    // Always create a post for delete tests and set postId
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Delete Me', content: 'This post will be deleted.' });

    // Get the postId of the created post
    const postsRes = await request(app).get('/api/posts');
    const post = postsRes.body.posts.find(p => p.title === 'Delete Me');
    postId = post.id;
  });

  test('GET /api/posts returns array', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  test('POST /api/posts creates a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test Post', content: 'This is a test post.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/post created/i);
  });

  test('POST /api/posts without token returns 401', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'No Auth', content: 'Should fail.' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/unauthorized/i);
  });

  test('POST /api/posts with missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/posts/:id returns the post', async () => {
    // Create a post first
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Find Me', content: 'Find this post by ID.' });

    // Find the post ID
    const postsRes = await request(app).get('/api/posts');
    const post = postsRes.body.posts.find(p => p.title === 'Find Me');
    expect(post).toBeDefined();

    const res = await request(app).get(`/api/posts/${post.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.post).toHaveProperty('title', 'Find Me');
  });

  test('GET /api/posts/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/api/posts/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/post not found/i);
  });

  test('DELETE /api/posts/:id by non-owner returns 403', async () => {
    // Register another user with a unique email
    const otherEmail = `otheruser_${Date.now()}_${Math.random()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'otheruser', email: otherEmail, password: 'pass123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: otherEmail, password: 'pass123' });

    const otherToken = loginRes.body.token;

    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  test('DELETE /api/posts/:id by owner deletes post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/post deleted/i);
  });

  test('DELETE /api/posts/:id with invalid id returns 404', async () => {
    const res = await request(app)
      .delete('/api/posts/999999')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/post not found/i);
  });

  test('GET /api/posts/search?query=Test returns posts', async () => {
    // Create a post to search for
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Searchable', content: 'Search for this post.' });

    const res = await request(app).get('/api/posts/search?query=Searchable');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.some(p => p.title === 'Searchable')).toBe(true);
  });

  test('GET /api/posts/search with no query returns 400', async () => {
    const res = await request(app).get('/api/posts/search');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/query is required/i);
  });

  test('POST /api/posts/:id/like without token returns 401', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/unauthorized/i);
  });
});