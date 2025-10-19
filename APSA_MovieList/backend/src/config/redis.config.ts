import { createClient } from 'redis';

/**
 * Configuração do Redis para cache
 */
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;

export const initializeRedis = async () => {
  if (!REDIS_ENABLED) {
    console.warn('Redis desabilitado. Cache em memória será usado.');
    return null;
  }

  try {
    redisClient = createClient({
      url: REDIS_URL,
      password: process.env.REDIS_PASSWORD,
    });

    redisClient.on('error', (err) => {
      console.error('Erro no Redis:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Erro ao conectar no Redis:', error);
    console.warn('Continuando sem Redis. Cache em memória será usado.');
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
};

