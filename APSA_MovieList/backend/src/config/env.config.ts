import dotenv from 'dotenv';

dotenv.config();

/**
 * Configurações de ambiente validadas
 */
export const env = {
  // Servidor
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB
  MONGODB_ENABLED: process.env.MONGODB_ENABLED === 'true',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/apsa-movielist',
  
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
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'apsa-movielist-secret-change-me',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Cache TTL
  CACHE_TTL_TMDB: parseInt(process.env.CACHE_TTL_TMDB || '86400', 10),
  CACHE_TTL_OMDB: parseInt(process.env.CACHE_TTL_OMDB || '86400', 10),

  // Email (SMTP)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

/**
 * Valida variáveis de ambiente obrigatórias
 */
export const validateEnv = () => {
  const required: string[] = [];

  // Se MongoDB estiver habilitado, exige MONGODB_URI
  if (process.env.MONGODB_ENABLED === 'true') {
    required.push('MONGODB_URI');
  }

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
  
  console.log('✅ Sistema configurado com MongoDB + JWT');
};

