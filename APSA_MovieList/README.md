# 🎬 APSA MovieList

A full-stack movie management system with user ratings and integration with external APIs (TMDB and OMDB).

## 📋 About

A full-stack application for registering, listing, and rating movies, with:
- 🔐 Authentication via JWT + MongoDB
- 🎥 Automatic movie search (TMDB)
- ⭐ Rating system (0–10, half-point steps)
- 📊 External ratings (IMDb, Rotten Tomatoes, Metacritic)
- 💬 Comments on ratings
- 👥 View ratings from all users

## 🏗️ Architecture

```
APSA_MovieList/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
│
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   └── types/
│   └── package.json
│
└── README.md
```

## 🚀 Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **React Router** (navigation)
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose** (database)
- **JWT** (authentication)
- **Axios** (external APIs)
- **Redis** (cache — optional)
- **Joi** (validation)
- **Helmet** + **CORS** (security)

### External APIs
- **TMDB** — The Movie Database (search and details)
- **OMDB** — Open Movie Database (ratings)

## ⚙️ Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB 7+
- npm or yarn
- API keys (TMDB and OMDB)

### 2. Clone the repository

```bash
git clone <repository-url>
cd APSA_MovieList
```

### 3. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_ENABLED=true
MONGODB_URI=mongodb://localhost:27017/apsa-movielist

# JWT
JWT_SECRET=your-secret-key-here

# External APIs
TMDB_API_KEY=your_tmdb_bearer_token
OMDB_API_KEY=your_omdb_key

# Redis (optional)
REDIS_ENABLED=false

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 4. Configure the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```env
# Backend API
VITE_API_URL=http://localhost:3001/api
```

## 🎯 Running the Project

### Backend

```bash
cd backend
npm run dev
```

Server running at: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm run dev
```

App running at: `http://localhost:5173`

## 📱 Features

### Authentication
- ✅ Login with email/password
- ✅ User registration
- ✅ Password recovery
- ✅ Logout

### Movies
- ✅ Automatic search (TMDB)
- ✅ Add movie with auto-fill from API
- ✅ Edit movies
- ✅ Delete movies
- ✅ List with filters

### Ratings
- ✅ Star system (0–10, half-point)
- ✅ Optional comments
- ✅ View all users' ratings
- ✅ Average rating
- ✅ External ratings (IMDb, Rotten Tomatoes, Metacritic)

## 🔒 Security

- ✅ API keys kept on the backend (not exposed to the frontend)
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Configured CORS
- ✅ Helmet (security headers)
- ✅ Input validation (Joi)

## 📦 Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

Production files will be in `frontend/dist/`

## 🐳 Docker (Optional)

```bash
cd backend
docker-compose up -d
```

## 📄 Additional Documentation

- `backend/README.md` — detailed API documentation
- `backend/DEPLOY.md` — backend deployment guide

## 👨‍💻 Author

**Arthur Tragante**

---

⭐ If this project was useful, leave a star!
