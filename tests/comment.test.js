const request = require('supertest');
const db = require('../database');
const app = require('../app');

let userToken;
let postId;
let commentId;

beforeAll((done) => {
  db.run('DELETE FROM likes', () => {
    db.run('DELETE FROM comments', () => {
      db.run('DELETE FROM posts', () => {
        db.run('DELETE FROM users', done);
      });
    });
  });
});

afterAll((done) => {
  db.run('DELETE FROM likes', () => {
    db.run('DELETE FROM comments', () => {
      db.run('DELETE FROM posts', () => {
        db.run('DELETE FROM users', done);
      });
    });
  });
});

describe('Comment Integration Tests', () => {
  beforeEach(async () => {
    await new Promise((resolve) => db.run('DELETE FROM comments', resolve));
    await new Promise((resolve) => db.run('DELETE FROM posts', resolve));
    await new Promise((resolve) => db.run('DELETE FROM users', resolve));

    const uniqueEmail = `commentuser_${Date.now()}_${Math.random()}@example.com`;

    await request(app)
      .post('/api/auth/register')
      .send({ username: 'commentuser', email: uniqueEmail, password: 'Password123!@#' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: uniqueEmail, password: 'Password123!@#' });

    userToken = loginRes.body.token;

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Post for Comments', content: 'This post will have comments.' });

    const postsRes = await request(app).get('/api/posts');
    const post = postsRes.body.posts.find(p => p.title === 'Post for Comments');
    postId = post.id;
  });

  test('POST /api/posts/:id/comments adds a comment', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'This is a test comment.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/comment added/i);
  });

  test('GET /api/posts/:id/comments returns comments array', async () => {
    // Add a comment first
    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Another test comment.' });

    const res = await request(app).get(`/api/posts/${postId}/comments`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.comments)).toBe(true);
    expect(res.body.comments.some(c => c.content === 'Another test comment.')).toBe(true);

    // Save commentId for delete test
    commentId = res.body.comments.find(c => c.content === 'Another test comment.').id;
  });

  test('POST /api/posts/:id/comments without token returns 401', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .send({ content: 'Should not work.' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/unauthorized/i);
  });

  test('POST /api/posts/:id/comments with missing content returns 400', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/content is required/i);
  });

  // Only run this test if deleteComment is implemented and route is correct
  test('DELETE /api/posts/:id/comments deletes comment', async () => {
    // Add a comment to delete
    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Comment to delete.' });

    const commentsRes = await request(app).get(`/api/posts/${postId}/comments`);
    const comment = commentsRes.body.comments.find(c => c.content === 'Comment to delete.');

    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${comment.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/comment deleted/i);

    // Verify comment is deleted
    const verifyRes = await request(app).get(`/api/posts/${postId}/comments`);
    expect(verifyRes.body.comments.some(c => c.content === 'Comment to delete.')).toBe(false);
  });
});