// __tests__/user.test.js

const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../database'); // your SQLite database instance
const app = require('../app');     // your Express app with routes

beforeAll((done) => {
  // Ensure users table exists before tests
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `, done);
});

afterAll((done) => {
  // Clear users after each test to isolate tests
  db.run('DELETE FROM users', done);
});

describe('User + Auth Integration Tests', () => {
  let token;

  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'tester', email: 'test@example.com', password: 'pass123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message || res.text).toMatch(/user created/i);
  });

  test('Login with valid credentials returns JWT', async () => {
    // Register first
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'tester', email: 'test@example.com', password: 'pass123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

  test('GET /api/user/me without token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/user/me');
    expect(res.statusCode).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });


  test('GET /user/me with token returns user info', async () => {

    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);
    console.log(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('username', 'tester');
  });





  test('GET /api/user/:id returns public user info', async () => {
    // Decode user id from token
    const decoded = jwt.decode(token);

    const res = await request(app).get(`/api/user/${decoded.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'tester');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });


  test('GET /profile with invalid token returns 403 Forbidden', async () => {
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
      .send({ username: 'tester2', email: 'test2@example.com', password: 'pass123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test2@example.com', password: 'pass123' });

    const userToken = loginRes.body.token;

    // Update profile
    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'tester2_updated', email: 'test2_updated@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'tester2_updated');
    expect(res.body).toHaveProperty('email', 'test2_updated@example.com');
  });

  test('PUT /api/user/me with invalid email returns 400', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test2_updated@example.com', password: 'pass123' });

    const userToken = loginRes.body.token;

    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'tester2_updated', email: 'invalid-email' });

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/invalid email/i);
  });

  test('PUT /api/user/me without token returns 401', async () => {
    const res = await request(app)
      .put('/api/user/me')
      .send({ username: 'tester', email: 'test@example.com' });

    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch(/unauthorized/i);
  });
});
