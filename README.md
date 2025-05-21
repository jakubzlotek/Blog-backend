# Blog-backend

![Node.js CI](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A RESTful API backend for a blogging platform, built with Node.js and Express. It supports user authentication, post creation, comments, likes, and user profile management. The backend uses a SQLite database and is designed to work with the companion frontend available at [Blog-frontend repository](https://github.com/jakubzlotek/Blog-frontend).

## Table of Contents

- [Blog-backend](#blog-backend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Server](#running-the-server)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Auth](#auth)
    - [Users](#users)
    - [Posts](#posts)
    - [Comments](#comments)
    - [Likes](#likes)
    - [Error Handling](#error-handling)
  - [Testing](#testing)
    - [Running Tests](#running-tests)
    - [Test Structure](#test-structure)
    - [What is Tested?](#what-is-tested)
    - [Example](#example)

## Features

- User registration and authentication (JWT-based)
- Create, read, update, and delete blog posts
- Comment on posts
- Like posts (no unlike functionality)
- User profile management
- File upload support for avatars
- RESTful API structure

## Project Structure

```
Blog-backend/
├── app.js                # Main application entry point
├── database.js           # Database connection and setup
├── database.db           # SQLite database file
├── controllers/          # Route controllers
├── middlewares/          # Express middlewares (e.g., auth)
├── models/               # Data models
├── routes/               # API route definitions
├── uploads/              # Uploaded files (e.g., avatars)
├── tests/                # Automated tests
```

## Getting Started
## Environment Variables

Create a `.env` file in the root directory and set the following variables:

```
PORT=3000
JWT_SECRET=your_jwt_secret
```

You can change the `PORT` as needed. `JWT_SECRET` is required for authentication.

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Installation

1. Clone the repository:
   ```powershell
   git clone <your-repo-url>
   cd Blog-backend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. (Optional) Initialize the database:
   ```powershell
   # If you need to reset or initialize the database
   sqlite3 database.db < databaseSchema.sql
   ```

4. (Optional) Run tests to verify setup:
   ```powershell
   npm test
   ```

### Running the Server

```powershell
npm start
```

The server will start on `http://localhost:3000` by default (or the port you set in `.env`).

## API Endpoints

All endpoints are prefixed with `/api/`.

### Authentication

- All protected routes require a JWT token in the `Authorization` header as `Bearer <token>`.

### Auth

- `POST /api/auth/register` — Register a new user
    - Example:
      ```bash
      curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"test","password":"pass"}'
      ```
- `POST /api/auth/login` — Login and receive a JWT
    - Example:
      ```bash
      curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"test","password":"pass"}'
      ```

### Users

- `GET /api/users/:id` — Get user profile
- `PUT /api/users/:id` — Update user profile

### Posts

- `GET /api/posts` — List all posts
- `POST /api/posts` — Create a new post
- `GET /api/posts/:id` — Get a single post
- `PUT /api/posts/:id` — Update a post
- `DELETE /api/posts/:id` — Delete a post

### Comments

- `POST /api/comments` — Add a comment
- `GET /api/comments/:postId` — Get comments for a post

### Likes

- `POST /api/likes` — Like a post

### Error Handling

All errors are returned in JSON format:

```json
{
  "success": false,
  "message": "Error message here."
}
```

## Testing

Automated tests are provided for core API functionality, including authentication, users, posts, comments, and likes. Tests are written using [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest) to simulate HTTP requests and verify API responses.

### Running Tests

To run all tests:

```powershell
npm test
```

### Test Structure

- All test files are located in the `tests/` directory.
- Each main feature (users, posts, comments, likes) has a corresponding test file:
  - `tests/user.test.js`
  - `tests/post.test.js`
  - `tests/comment.test.js`
  - `tests/like.test.js`

### What is Tested?

- User registration, login, and authentication
- Creating, updating, retrieving, and deleting posts
- Adding and retrieving comments
- Liking posts
- Authorization and error handling (e.g., invalid tokens, missing fields)

### Example

You can run a specific test file with:

```powershell
npx jest tests/user.test.js
```

Test output will show which endpoints and scenarios pass or fail, helping ensure the API works as expected.