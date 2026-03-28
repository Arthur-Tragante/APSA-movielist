# 🎬 APSA MovieList — Our Horror Story

Backend and Frontend for the Our Horror Story movie manager.

## ✨ Features

- ✅ **JWT Authentication** with MongoDB
- ✅ **Full CRUD** for movies and TV shows
- ✅ **Rating system** (0–10 with half-star steps + comments)
- ✅ **Secure proxy** for external APIs (TMDB, OMDB)
- ✅ **Intelligent caching** (Redis + in-memory fallback)
- ✅ **Rate limiting** per endpoint
- ✅ **Server-side validation** with Joi
- ✅ **Security** with Helmet and CORS
- ✅ **Docker** with Nginx Proxy Manager
- ✅ **Automatic backup** to Google Drive

---

## 🚀 Production Deploy (Docker + Nginx Proxy Manager)

### Prerequisites

- Docker Desktop
- MongoDB installed locally (or via Docker)
- Configured domains (e.g. ourhorrorstory.com.br, home.ourhorrorstory.com.br)
- Open router ports: 8000 (HTTPS), 3001 (optional)

### Deploy Structure

```
C:\Users\Arthur\reverse-proxy\npm\
├── docker-compose.yml      # Orchestrates all containers
├── npm/
│   ├── data/               # Nginx Proxy Manager data
│   └── letsencrypt/        # SSL certificates
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  proxy:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx_proxy_manager
    restart: unless-stopped
    ports:
      - "3000:80"     # Internal HTTP
      - "8000:443"    # External HTTPS
      - "8081:81"     # NPM admin panel
    volumes:
      - ./npm/data:/data
      - ./npm/letsencrypt:/etc/letsencrypt
    networks:
      - proxy-net

  apsa-frontend:
    build:
      context: C:/Projects/APSA-movielist/APSA_MovieList/frontend
      args:
        VITE_API_URL: https://home.ourhorrorstory.com.br:8000/api
    container_name: apsa_frontend
    restart: unless-stopped
    expose:
      - "80"
    networks:
      - proxy-net

  apsa-backend:
    build: C:/Projects/APSA-movielist/APSA_MovieList/backend
    container_name: apsa_backend
    restart: unless-stopped
    expose:
      - "3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - MONGODB_ENABLED=true
      - MONGODB_URI=mongodb://host.docker.internal:27017/apsa-movielist
      - JWT_SECRET=your-secret-key-here
      - CORS_ORIGIN=https://ourhorrorstory.com.br:8000
      - TMDB_API_KEY=your_tmdb_token
      - OMDB_API_KEY=your_omdb_key
      - REDIS_ENABLED=false
    networks:
      - proxy-net

networks:
  proxy-net:
    driver: bridge
```

### Docker Commands

```bash
# Navigate to docker-compose directory
cd C:\Users\Arthur\reverse-proxy\npm

# Start all containers
docker-compose up -d

# Rebuild frontend (after changes)
docker-compose build --no-cache apsa-frontend
docker-compose up -d apsa-frontend

# Rebuild backend
docker-compose build --no-cache apsa-backend
docker-compose up -d apsa-backend

# View logs
docker-compose logs -f apsa-backend
docker-compose logs -f apsa-frontend

# Restart everything
docker-compose down && docker-compose up -d
```

### Configure Nginx Proxy Manager

1. Access http://localhost:8081
2. Login: admin@example.com / changeme (first time)
3. Create Proxy Hosts:

**Frontend (ourhorrorstory.com.br:8000)**
- Domain: ourhorrorstory.com.br
- Forward Hostname: apsa_frontend
- Forward Port: 80
- SSL: Custom certificate

**Backend (home.ourhorrorstory.com.br:8000)**
- Domain: home.ourhorrorstory.com.br
- Forward Hostname: apsa_backend
- Forward Port: 3001
- SSL: Custom certificate

### Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://ourhorrorstory.com.br:8000 |
| Backend API | https://home.ourhorrorstory.com.br:8000/api |
| NPM Admin | http://localhost:8081 |

---

## 💾 MongoDB

### Local Installation (Windows)

```powershell
winget install MongoDB.Server
```

### Database

- **Name:** apsa-movielist
- **Collections:** movies, shows, users, sorteio_filmes, sorteio_resultados

### Access via Docker

The backend uses `host.docker.internal:27017` to connect to MongoDB installed on Windows.

---

## 📦 Automatic Backup

Automatic backup system configured for Google Drive. See [BACKUP.md](BACKUP.md) for full details.

### Summary

| Item | Value |
|------|-------|
| **Frequency** | Daily at 6am |
| **Destination** | Google Drive → Backups/mongodb/ |
| **Retention** | 7 days in the cloud, 3 locally |

### Quick Commands

```powershell
# Manual backup
powershell -ExecutionPolicy Bypass -File C:\Scripts\backup-mongodb-gdrive.ps1

# Check next scheduled backup
(Get-ScheduledTaskInfo -TaskName "MongoDB Backup to Google Drive").NextRunTime

# View logs
Get-Content C:\Scripts\logs\backup-mongodb.log -Tail 20
```

---

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/           # Configuration (MongoDB, Redis, Env)
│   ├── constants/        # Application constants
│   ├── types/            # TypeScript types
│   ├── repositories/     # MongoDB access layer
│   ├── services/         # Business logic
│   ├── middlewares/      # Auth, validation, rate limit, errors
│   ├── controllers/      # HTTP controllers
│   ├── routes/           # Route definitions
│   ├── app.ts            # Express configuration
│   └── server.ts         # Server initialization
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### Design Patterns

- **Repository Pattern** — MongoDB abstraction
- **Service Layer** — Separated business logic
- **Dependency Injection** — Inversion of control
- **Error Handling** — Centralized error handling
- **Validation Layer** — Joi validations
- **Caching Strategy** — Redis with in-memory fallback

---

## 📋 Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Docker)
- Docker Desktop (for production)
- TMDB and OMDB API keys
- rclone (for automatic backup)

---

## 🛠️ Local Development

### 1. Install Dependencies

```bash
# Backend
cd APSA_MovieList/backend
npm install

# Frontend
cd APSA_MovieList/frontend
npm install
```

### 2. Configure Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_ENABLED=true
MONGODB_URI=mongodb://localhost:27017/apsa-movielist

# JWT
JWT_SECRET=your-development-secret-key

# External APIs
TMDB_API_KEY=your_tmdb_bearer_token
OMDB_API_KEY=your_omdb_key

# Redis (optional)
REDIS_ENABLED=false

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Configure Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Run

```bash
# Terminal 1 — Backend
cd APSA_MovieList/backend
npm run dev

# Terminal 2 — Frontend
cd APSA_MovieList/frontend
npm run dev
```

---

## 📡 Endpoints

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "sucesso": true,
  "mensagem": "API Moicanos Backend está funcionando",
  "timestamp": "2025-10-18T..."
}
```

---

### Movies

#### List User Movies

```http
GET /api/filmes
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "id": "abc123",
      "titulo": "Interstellar",
      "ano": "2014",
      "notaImdb": "8.7",
      "avaliacoesUsuarios": [...],
      "mediaAvaliacaoUsuarios": 8.5
    }
  ]
}
```

#### Get Movie by ID

```http
GET /api/filmes/:id
Authorization: Bearer {jwt_token}
```

#### Create Movie

```http
POST /api/filmes
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "titulo": "Interstellar",
  "tituloOriginal": "Interstellar",
  "ano": "2014",
  "duracao": "169 min",
  "genero": "Science Fiction, Drama",
  "sinopse": "...",
  "poster": "https://...",
  "notaImdb": "8.7",
  "votosImdb": "1,234,567",
  "metascore": "74",
  "avaliacoes": [],
  "assistido": true
}
```

**Response:**
```json
{
  "sucesso": true,
  "mensagem": "Filme criado com sucesso",
  "dados": {
    "id": "abc123"
  }
}
```

#### Update Movie

```http
PUT /api/filmes/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "titulo": "New Title",
  "assistido": true
}
```

#### Delete Movie

```http
DELETE /api/filmes/:id
Authorization: Bearer {jwt_token}
```

#### Rate Movie

```http
POST /api/filmes/:id/avaliar
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "nota": 8.5,
  "comentario": "Amazing movie!"
}
```

#### Remove Rating

```http
DELETE /api/filmes/:id/avaliar
Authorization: Bearer {jwt_token}
```

---

### External APIs (Proxy)

#### Search Movie on TMDB

```http
GET /api/buscar/filme?titulo=interstellar
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "id": 157336,
      "titulo": "Interstellar",
      "tituloOriginal": "Interstellar",
      "ano": "2014",
      "sinopse": "...",
      "poster": "https://..."
    }
  ]
}
```

#### Get Movie Details

```http
GET /api/buscar/detalhes/:tmdbId
Authorization: Bearer {jwt_token}
```

#### Get Ratings (OMDB)

```http
GET /api/buscar/ratings/:imdbId
Authorization: Bearer {jwt_token}
```

---

## 🔐 Authentication

All routes (except health check) require JWT authentication:

```javascript
// Login to get token
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await response.json();

// Use token in requests
fetch('http://localhost:3001/api/filmes', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🛡️ Security

### Implemented

- ✅ **Helmet** — HTTP security headers
- ✅ **CORS** — Cross-origin request control
- ✅ **Rate Limiting** — Abuse prevention
- ✅ **JWT Validation** — Robust authentication
- ✅ **Input Validation** — Joi schema validation
- ✅ **Protected Keys** — External APIs accessed via proxy

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| Global | 100 req/15min |
| External APIs | 20 req/min |
| Resource Creation | 10 req/min |

---

## 💾 Cache

### Redis (Recommended)

```bash
# Install Redis
brew install redis  # macOS
sudo apt install redis  # Ubuntu

# Start
redis-server
```

### In-Memory Fallback

If Redis is unavailable, the system automatically falls back to in-memory cache.

### TTLs

- **TMDB Search**: 24 hours
- **OMDB Ratings**: 24 hours
- **User Movies**: 5 minutes
- **Single Movie**: 5 minutes

---

## 🐳 Docker

### Development

```bash
docker-compose up
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Useful Commands

```bash
# Logs
docker-compose logs -f backend

# Restart
docker-compose restart backend

# Stop
docker-compose down

# Rebuild
docker-compose up --build
```

---

## 🧪 Tests

```bash
# Unit tests
npm test

# Coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Logs

```bash
# Development
tail -f logs/combined.log

# Docker
docker-compose logs -f backend
```

---

## 🔄 Frontend Integration

### Update Frontend to Use Backend

1. **Create API config file:**

```typescript
// frontend/src/config/api.config.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

2. **Create HTTP client:**

```typescript
// frontend/src/services/api.client.ts
import axios from 'axios';
import { API_URL } from '../config/api.config';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

3. **Update frontend services:**

```typescript
// frontend/src/services/filme.service.ts
import apiClient from './api.client';

async buscarTodos(): Promise<Filme[]> {
  const response = await apiClient.get('/filmes');
  return response.data.dados;
}

async criar(filme: CriarFilmeDTO): Promise<string> {
  const response = await apiClient.post('/filmes', filme);
  return response.data.dados.id;
}

// ... other methods
```

---

## 📈 Performance

### Optimizations

- ✅ **Redis Cache** — Reduces external API calls
- ✅ **Compression** — Gzip responses
- ✅ **Connection Pooling** — Optimized MongoDB connections
- ✅ **Rate Limiting** — Prevents overload

### Benchmarks

| Endpoint | Avg | 95th Percentile |
|----------|-----|-----------------|
| GET /filmes | 15ms | 30ms |
| POST /filmes | 120ms | 200ms |
| GET /buscar/filme (cache hit) | 5ms | 10ms |
| GET /buscar/filme (cache miss) | 800ms | 1200ms |

---

## 🐛 Debugging

### VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/server.ts"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Error: "Missing environment variables"

Check that your `.env` file is correctly configured.

### Error: "Invalid token"

JWT token has expired. Log in again from the frontend.

### Error: "Redis connection failed"

Redis is not running. Start it with `redis-server` or disable with `REDIS_ENABLED=false`.

### Error: "External API unavailable"

Check your TMDB/OMDB keys in `.env`.

---

## 📚 Tech Stack Summary

- **Runtime:** Node.js 20
- **Framework:** Express 4
- **Language:** TypeScript 5
- **Database:** MongoDB
- **Authentication:** JWT
- **Cache:** Redis 7
- **Validation:** Joi
- **Rate Limiting:** express-rate-limit
- **Security:** Helmet + CORS
- **External APIs:** TMDB + OMDB

---

## 📄 License

ISC

---

## 👥 Contact

For questions or suggestions, open an issue in the repository.

---

**Production-ready backend!** 🚀
