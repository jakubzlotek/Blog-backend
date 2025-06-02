# Blog-backend

![Node.js CI](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A RESTful API backend for a blogging platform, built with Node.js, Express, and SQLite. It supports user authentication, post creation, comments, likes, and user profile management. The backend is designed to work with the companion frontend in [Blog-frontend](../Blog-frontend/).

## Features

- User registration and authentication (JWT-based)
- Create, read, update, and delete blog posts
- Comment on posts (add, list, delete own)
- Like/unlike posts
- User profile management (update profile, upload avatar)
- File upload support for avatars
- RESTful API structure
- Swagger API documentation at `/api-docs`
- SQLite database with schema auto-initialization

## Project Structure

```
Blog-backend/
├── app.js                # Main application entry point
├── database.js           # Database connection and setup
├── database.db           # SQLite database file
├── databaseSchema.sql    # Database schema (auto-applied)
├── controllers/          # Route controllers
├── middlewares/          # Express middlewares (e.g., auth, avatar upload)
├── models/               # Data models
├── routes/               # API route definitions
├── uploads/              # Uploaded files (e.g., avatars)
├── tests/                # Automated tests (Jest + Supertest)
```

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Installation

1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd Blog-backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. (Optional) Initialize the database:
   ```sh
   sqlite3 database.db < databaseSchema.sql
   ```

4. (Optional) Run tests to verify setup:
   ```sh
   npm test
   ```

### Running the Server

```sh
npm start
```

The server will start on [http://localhost:3000](http://localhost:3000) by default.

## Environment Variables

You can create a `.env` file in the root directory to override defaults:

```
PORT=3000
DB_PATH=./database.db
JWT_SECRET=your_jwt_secret
```

## API Endpoints

All endpoints are prefixed with `/api/`.

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive a JWT

### Users

- `GET /api/user/me` — Get current user's profile (JWT required)
- `PUT /api/user/me` — Update current user's profile (JWT required)
- `POST /api/user/me/avatar` — Upload avatar (JWT required, multipart/form-data)
- `GET /api/user/:id` — Get public user info

### Posts

- `GET /api/posts` — List all posts (paginated: `?page=1&limit=10`)
- `POST /api/posts` — Create a new post (JWT required)
- `GET /api/posts/:id` — Get a single post
- `DELETE /api/posts/:id` — Delete a post (JWT required, only owner)
- `GET /api/posts/search?query=...` — Search posts by keyword or hashtag

### Comments

- `GET /api/posts/:id/comments` — Get comments for a post
- `POST /api/posts/:id/comments` — Add a comment (JWT required)
- `DELETE /api/posts/:id/comments/:commentId` — Delete own comment (JWT required)

### Likes

- `GET /api/posts/:id/like` — Get likes for a post
- `POST /api/posts/:id/like` — Like a post (JWT required)
- `DELETE /api/posts/:id/like` — Unlike a post (JWT required)

### Ads

- `GET /api/ads` — Get a list of ads (proxy to fakestoreapi.com, with caching)

### Health

- `GET /api/health` — Health check endpoint

### API Documentation

Swagger UI is available at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

## Error Handling

All errors are returned in JSON format:

```json
{
  "success": false,
  "message": "Error message here."
}
```

## Testing

Automated tests are provided for core API functionality, including authentication, users, posts, comments, and likes. Tests use [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest).

To run all tests:

```sh
npm test
```

Test output will show which endpoints and scenarios pass or fail.

---

MIT License © Jakub Złotek, Oskar Sadkowski, Maciej