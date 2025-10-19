import dotenv from 'dotenv';

dotenv.config();

/**
 * Configurações de ambiente validadas
 */
export const env = {
  // Servidor
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
  
  // APIs Externas
  TMDB_API_KEY: process.env.TMDB_API_KEY || '',
  OMDB_API_KEY: process.env.OMDB_API_KEY || '',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Cache TTL
  CACHE_TTL_TMDB: parseInt(process.env.CACHE_TTL_TMDB || '86400', 10),
  CACHE_TTL_OMDB: parseInt(process.env.CACHE_TTL_OMDB || '86400', 10),
};

/**
 * Valida variáveis de ambiente obrigatórias
 */
export const validateEnv = () => {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente faltando: ${missing.join(', ')}`);
  }

  // Aviso para APIs externas (opcional)
  if (!process.env.TMDB_API_KEY) {
    console.warn('⚠️ TMDB_API_KEY não configurada - Busca de filmes estará limitada');
  }
  if (!process.env.OMDB_API_KEY) {
    console.warn('⚠️ OMDB_API_KEY não configurada - Ratings externos não estarão disponíveis');
  }
};

