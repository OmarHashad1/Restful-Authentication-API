# RESTful Authentication API

A production-ready REST API featuring a complete authentication system built with Node.js, Express, and MongoDB.

## Postman Collection

Test all API endpoints using the Postman collection:

[Open in Postman](https://orange-sunset-814265-0106.postman.co/workspace/d~69e99eb5-8f28-449c-99fa-07cebf415a52/collection/45541974-dc6a69c4-f78c-41fa-bc67-358fcecd6420?action=share&creator=45541974&active-environment=45541974-c8a76f32-e7cb-41d1-afc7-a7bddfd664f6)

---

## Features

- JWT authentication (access + refresh tokens)
- Token whitelist with TTL auto-expiry
- Google OAuth sign-in
- Password change with token invalidation
- Phone number encryption at rest
- Winston logging
- Input validation with Joi

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Argon2, Winston
**Frontend:** React, Vite, Tailwind CSS

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Clone the repository

```bash
git clone <repo-url>
cd Restful-Authentication-API
```

2. Install dependencies for both backend and frontend

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Set up environment variables

```bash
cd backend
cp .env.example .env
```

Fill in the values in `.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (e.g. `3000`) |
| `URI` | MongoDB connection string |
| `IV_LENGTH` | Encryption IV length (e.g. `16`) |
| `ENCRYPTION_SECRET_KEY` | 32-character secret for phone number encryption |
| `USER_ACCESS_TOKEN_SIGNATURE` | Secret for user access tokens |
| `USER_REFRESH_TOKEN_SIGNATURE` | Secret for user refresh tokens |
| `ADMIN_ACCESS_TOKEN_SIGNATURE` | Secret for admin access tokens |
| `ADMIN_REFRESH_TOKEN_SIGNATURE` | Secret for admin refresh tokens |
| `TOKEN_CARRY` | Token prefix (e.g. `Bearer`) |
| `CLIENT_ID` | Google OAuth client ID |
| `SMTP_USER` | Email address for SMTP |
| `SMTP_PASS` | Email app password for SMTP |

### Running the App

#### Option 1 — VS Code (Recommended)

Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac) to start both servers simultaneously.

#### Option 2 — Terminal

```bash
# Backend
cd backend && npm run dev

# Frontend (separate terminal)
cd frontend && npm run dev
```

---

## API Endpoints

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Login and receive tokens |
| GET | `/refresh-token` | No | Get new access token (send refresh token in `Authorization` header) |
| POST | `/signup/google` | No | Sign in with Google |
| POST | `/change-password` | Yes | Change password |
| GET | `/logout` | No | Logout (send refresh token in `Authorization` header) |

### User — `/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | Yes | Get current user profile |
| PATCH | `/update-profile` | Yes | Update profile information |

### Authorization Header

Protected routes require:
```
Authorization: Bearer <accessToken>
```
