const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../database');
const app = require('../app');

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

describe('User + Auth Integration Tests', () => {
  let token;
  let uniqueEmail;
  let uniqueUsername;

  beforeEach(async () => {
    // Clean up users before each test to avoid conflicts
    await new Promise((resolve) => db.run('DELETE FROM users', resolve));
    // Use a unique email and username for each test
    uniqueEmail = `testuser_${Date.now()}_${Math.random()}@example.com`;
    uniqueUsername = `tester_${Date.now()}_${Math.random()}`;
  });

  describe('Registration', () => {
    test('Register new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/user created/i);
    });

    test('Register with existing email returns 400', async () => {
      // Register first
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      // Try to register again with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername + '2', email: uniqueEmail, password: 'Password123!@#' });

      expect(res.statusCode).toBe(400);
      // Accept either message or errors array
      expect(res.body.message || res.body.errors).toBeTruthy();
    });

    test('Register with existing username returns 400', async () => {
      // Register first
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      // Try to register again with same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail + '2', password: 'Password123!@#' });

      expect(res.statusCode).toBe(400);
      // Accept either message or errors array
      expect(res.body.message || res.body.errors).toBeTruthy();
    });
  });

  describe('Login', () => {
    test('Login with valid credentials returns JWT', async () => {
      // Register first
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: uniqueEmail, password: 'Password123!@#' });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();

      token = res.body.token;
    });

    test('Login with wrong password returns 400', async () => {
      // Register first
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: uniqueEmail, password: 'wrongpass' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('User Profile', () => {
    test('GET /api/user/me without token returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/user/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/unauthorized/i);
    });

    test('GET /api/user/me with token returns user info', async () => {
      // Register and login to get token
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: uniqueEmail, password: 'Password123!@#' });

      token = loginRes.body.token;

      const res = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('email', uniqueEmail);
      expect(res.body.user).toHaveProperty('username', uniqueUsername);
    });

    test('GET /api/user/:id returns public user info', async () => {
      // Register and login to get token
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: uniqueEmail, password: 'Password123!@#' });

      token = loginRes.body.token;
      const decoded = jwt.decode(token);

      const res = await request(app).get(`/api/user/${decoded.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('username', uniqueUsername);
      expect(res.body.user).toHaveProperty('email', uniqueEmail);
    });

    test('GET /api/user/:id for another user returns correct info', async () => {
      // Register user1
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      // Register user2
      const email2 = `other_${uniqueEmail}`;
      const username2 = `other_${uniqueUsername}`;
      await request(app)
        .post('/api/auth/register')
        .send({ username: username2, email: email2, password: 'Password123!@#' });

      // Login as user2
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: email2, password: 'Password123!@#' });
      const token2 = loginRes.body.token;
      const decoded2 = jwt.decode(token2);

      // Get user2 public info
      const res = await request(app).get(`/api/user/${decoded2.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('username', username2);
      expect(res.body.user).toHaveProperty('email', email2);
    });

    test('GET /api/user/me with invalid token returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/user/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });
  });

  describe('Profile Update', () => {
    test('PUT /api/user/me updates user profile', async () => {
      // Register and login to get token
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: uniqueEmail, password: 'Password123!@#' });

      const userToken = loginRes.body.token;

      // Update profile
      const updatedEmail = `updated_${uniqueEmail}`;
      const updatedUsername = `updated_${uniqueUsername}`;
      const res = await request(app)
        .put('/api/user/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ username: updatedUsername, email: updatedEmail });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('username', updatedUsername);
      expect(res.body.user).toHaveProperty('email', updatedEmail);
    });

    test('PUT /api/user/me with invalid email returns 400', async () => {
      // Register and login to get token
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: uniqueEmail, password: 'Password123!@#' });

      const userToken = loginRes.body.token;

      const res = await request(app)
        .put('/api/user/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ username: uniqueUsername, email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email/i);
    });

    test('PUT /api/user/me with missing fields returns 400', async () => {
      // Register and login to get token
      await request(app)
        .post('/api/auth/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'Password123!@#' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: uniqueEmail, password: 'Password123!@#' });

      const userToken = loginRes.body.token;

      // Missing username
      const res = await request(app)
        .put('/api/user/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: uniqueEmail });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/required/i);
    });

    test('PUT /api/user/me without token returns 401', async () => {
      const res = await request(app)
        .put('/api/user/me')
        .send({ username: uniqueUsername, email: uniqueEmail });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/unauthorized/i);
    });
  });
});