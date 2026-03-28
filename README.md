# 🎬 APSA MovieList

> Full-stack movie and TV series manager with ratings, external API integration, JWT authentication, and Redis caching — built with React, Node.js, TypeScript and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

---

## Overview

APSA MovieList is a personal watchlist manager that lets a group of users track, rate, and discover movies and TV series together. It proxies external metadata APIs (TMDB, OMDB) through the backend so keys are never exposed on the client, applies Redis caching to avoid redundant API calls, and uses WebSockets to sync the live Sorteio (random-pick) feature across sessions.

**Problem it solves:** managing a shared watchlist between friends across two categories (films and series), with per-user ratings, comments, and a fair random-pick mechanism.

---

## Features

**Movies & TV Shows**
- ✅ Full CRUD for movies and TV series
- ✅ Auto-fill metadata from TMDB on search
- ✅ External ratings from IMDb, Rotten Tomatoes and Metacritic (via OMDB)
- ✅ Per-user star ratings (0–10, half-star steps) with optional comments
- ✅ Aggregate rating across all users

**Sorteio (Random Pick)**
- ✅ Real-time random movie/series picker via WebSocket
- ✅ Persistent draw history

**Infrastructure**
- ✅ JWT authentication (register, login, password recovery)
- ✅ Redis cache with in-memory fallback (TTL per endpoint)
- ✅ Rate limiting per endpoint
- ✅ Server-side validation with Joi
- ✅ Security headers via Helmet + CORS
- ✅ Docker Compose with MongoDB, Redis and the app
- ✅ Automatic daily backup to Google Drive via rclone

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, React Router, Axios |
| **Backend** | Node.js 20, Express 4, TypeScript |
| **Database** | MongoDB 7 + Mongoose |
| **Auth** | JWT (jsonwebtoken) |
| **Cache** | Redis 7 (with in-memory fallback) |
| **Validation** | Joi |
| **Security** | Helmet, CORS, express-rate-limit |
| **Realtime** | WebSocket (ws) |
| **DevOps** | Docker, Docker Compose, Nginx Proxy Manager |
| **External APIs** | TMDB (metadata), OMDB (ratings) |

---

## Architecture

```
APSA_MovieList/
├── frontend/              # React + Vite SPA
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level views
│       ├── hooks/         # Custom React hooks
│       ├── services/      # HTTP layer (Axios)
│       ├── repositories/  # Data access (calls services)
│       └── types/         # TypeScript types
│
└── backend/               # Node.js + Express API
    └── src/
        ├── config/        # MongoDB, Redis, env config
        ├── models/        # Mongoose schemas
        ├── repositories/  # MongoDB access layer
        ├── services/      # Business logic
        ├── controllers/   # HTTP handlers
        ├── middlewares/   # Auth, validation, rate limit, errors
        ├── routes/        # Route definitions
        ├── app.ts         # Express setup
        └── server.ts      # HTTP + WebSocket server
```

**Patterns used:** Repository Pattern, Service Layer, centralized error handling, environment-based configuration.

**Request flow:**
```
Client → Rate Limiter → Auth Middleware → Controller → Service → Repository → MongoDB
                                                    ↘ Redis Cache (for external API calls)
                                                    ↘ TMDB / OMDB Proxy
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+ (or use Docker Compose — see below)
- Redis (optional — falls back to in-memory cache)
- [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- [OMDB API key](https://www.omdbapi.com/apikey.aspx) (free tier available)

### 1. Clone

```bash
git clone https://github.com/Arthur-Tragante/APSA-movielist.git
cd APSA-movielist/APSA_MovieList
```

### 2. Configure the Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
```

Key variables in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/apsa-movielist
JWT_SECRET=replace-with-a-strong-random-secret
TMDB_API_KEY=your_tmdb_bearer_token
OMDB_API_KEY=your_omdb_key
REDIS_ENABLED=false   # set to true if Redis is running
```

### 3. Configure the Frontend

```bash
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

### 4. Run

```bash
# Terminal 1 — backend (http://localhost:3001)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## Docker

The fastest way to run the full stack (app + MongoDB + Redis):

```bash
cd APSA_MovieList/backend
cp .env.example .env    # fill in JWT_SECRET, TMDB_API_KEY, OMDB_API_KEY
docker-compose up -d
```

The `docker-compose.yml` reads secrets from `.env` via `env_file` — no credentials are hardcoded in the compose file.

Services started:

| Service | Port |
|---------|------|
| Backend API | 3001 |
| MongoDB | 27017 |
| Redis | 6379 |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/refresh` | Refresh token |

All other endpoints require `Authorization: Bearer <token>`.

### Movies (`/api/filmes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/filmes` | List user's movies |
| POST | `/api/filmes` | Add movie |
| GET | `/api/filmes/:id` | Get movie |
| PUT | `/api/filmes/:id` | Update movie |
| DELETE | `/api/filmes/:id` | Delete movie |
| POST | `/api/filmes/:id/avaliar` | Rate movie |
| DELETE | `/api/filmes/:id/avaliar` | Remove rating |

### External API Proxy (`/api/buscar`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buscar/filme?titulo=...` | Search TMDB |
| GET | `/api/buscar/detalhes/:tmdbId` | Movie details |
| GET | `/api/buscar/ratings/:imdbId` | OMDB ratings |

Results are cached in Redis (TMDB: 24h, OMDB: 24h).

### TV Shows and Health Check

Equivalent CRUD under `/api/series`. Health check at `GET /api/health`.

---

## Configuration

See [`APSA_MovieList/backend/.env.example`](APSA_MovieList/backend/.env.example) for all available variables with descriptions.

Notable settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | **Required.** Use a strong random value in production |
| `REDIS_ENABLED` | `false` | Enable Redis cache |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Requests per window per IP |
| `CACHE_TTL_TMDB` | `86400` | TMDB cache TTL in seconds |

---

## Security

| Measure | Implementation |
|---------|---------------|
| Auth | JWT with expiry, validated on every request |
| Input validation | Joi schemas on all write endpoints |
| Security headers | Helmet (HSTS, CSP, XSS protection, etc.) |
| CORS | Allowlist-based origin control |
| Rate limiting | express-rate-limit, per-endpoint tuning |
| API key protection | TMDB/OMDB keys never leave the backend |

---

## License

ISC

---

## Author

**Arthur Tragante** — [GitHub](https://github.com/Arthur-Tragante)
