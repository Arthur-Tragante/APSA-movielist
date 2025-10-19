import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env.config';
import routes from './routes';
import { rateLimiterGlobal, tratarErros, rotaNaoEncontrada } from './middlewares';

/**
 * Cria e configura a aplicação Express
 */
export const createApp = (): Application => {
  const app = express();

  // Segurança
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Compressão de respostas
  app.use(compression());

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging de requisições
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Rate limiting global
  app.use(rateLimiterGlobal);

  // Rotas principais
  app.use('/api', routes);

  // Rota raiz
  app.get('/', (_req, res) => {
    res.json({
      sucesso: true,
      mensagem: 'API Moicanos Toolkit',
      versao: '1.0.0',
      documentacao: '/api/health',
    });
  });

  // Tratamento de rotas não encontradas
  app.use(rotaNaoEncontrada);

  // Tratamento global de erros
  app.use(tratarErros);

  return app;
};

