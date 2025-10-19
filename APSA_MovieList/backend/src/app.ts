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

  // Segurança (ajustado para permitir CORS)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // CORS - Múltiplas origens permitidas
  const allowedOrigins = [
    'http://localhost:5173',                    // Desenvolvimento local
    'http://localhost:5174',                    // Desenvolvimento local (porta alternativa)
    'http://localhost:5175',                    // Desenvolvimento local (porta alternativa)
    'https://apsa-movielist.web.app',          // Firebase Hosting
    'https://apsa-movielist.firebaseapp.com',  // Firebase Hosting (alternativo)
    'https://ourhorrorstory.com.br',           // Domínio customizado
    'http://ourhorrorstory.com.br',            // Domínio customizado (HTTP)
    env.CORS_ORIGIN,                            // Configurável via .env
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Permite requisições sem origin (ex: Postman, curl)
        if (!origin) return callback(null, true);
        
        // Permite se estiver na lista ou for ngrok
        if (allowedOrigins.includes(origin) || origin.includes('ngrok')) {
          console.log('✅ CORS permitido para:', origin);
          callback(null, true);
        } else {
          console.warn('⚠️ CORS bloqueado para:', origin);
          callback(new Error('Origem não permitida pelo CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Handler específico para OPTIONS (preflight)
  app.options('*', cors());

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
      mensagem: 'API Our Horror Story',
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

