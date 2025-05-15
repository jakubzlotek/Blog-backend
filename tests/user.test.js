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

  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: uniqueUsername, email: uniqueEmail, password: 'pass123' });

    expect(res.statusCode).toBe(201);
    expect(res.text).toMatch(/user created/i);
  });

  test('Login with valid credentials returns JWT', async () => {
    // Register first
    await request(app)
      .post('/api/auth/register')
      .send({ username: uniqueUsername, email: uniqueEmail, password: 'pass123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'pass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

  test('GET /api/user/me without token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/user/me');
    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  test('GET /api/user/me with token returns user info', async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({ username: uniqueUsername, email: uniqueEmail, password: 'pass123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'pass123' });

    token = loginRes.body.token;

    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', uniqueEmail);
    expect(res.body).toHaveProperty('username', uniqueUsername);
  });

  test('GET /api/user/:id returns public user info', async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({ username: uniqueUsername, email: uniqueEmail, password: 'pass123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'pass123' });

    token = loginRes.body.token;
    const decoded = jwt.decode(token);

    const res = await request(app).get(`/api/user/${decoded.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', uniqueUsername);
    expect(res.body).toHaveProperty('email', uniqueEmail);
  });

  test('GET /api/user/me with invalid token returns 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe('Forbidden');
  });

  test('PUT /api/user/me updates user profile', async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({ username: uniqueUsername, email: uniqueEmail, password: 'pass123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'pass123' });

    const userToken = loginRes.body.token;

    // Update profile
    const updatedEmail = `updated_${uniqueEmail}`;
    const updatedUsername = `updated_${uniqueUsername}`;
    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: updatedUsername, email: updatedEmail });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', updatedUsername);
    expect(res.body).toHaveProperty('email', updatedEmail);
  });

  test('PUT /api/user/me with invalid email returns 400', async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({ username: uniqueUsername, email: uniqueEmail, password: 'pass123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'pass123' });

    const userToken = loginRes.body.token;

    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: uniqueUsername, email: 'invalid-email' });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/invalid email/i);
  });

  test('PUT /api/user/me without token returns 401', async () => {
    const res = await request(app)
      .put('/api/user/me')
      .send({ username: uniqueUsername, email: uniqueEmail });

    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch(/unauthorized/i);
  });
});