import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config';
import { MENSAGENS_ERRO } from '../constants/mensagens.constants';

/**
 * Rate limiter global
 */
export const rateLimiterGlobal = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    sucesso: false,
    erro: MENSAGENS_ERRO.RATE_LIMIT_EXCEDIDO,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para APIs externas (mais restritivo)
 */
export const rateLimiterApiExterna = rateLimit({
  windowMs: 60000, // 1 minuto
  max: 20, // 20 requisições por minuto
  message: {
    sucesso: false,
    erro: 'Muitas buscas em APIs externas. Aguarde 1 minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para criação de recursos
 */
export const rateLimiterCriacao = rateLimit({
  windowMs: 60000, // 1 minuto
  max: 10, // 10 criações por minuto
  message: {
    sucesso: false,
    erro: 'Muitas criações. Aguarde 1 minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

