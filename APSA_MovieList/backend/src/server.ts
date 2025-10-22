import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createApp } from './app';
import { env, validateEnv } from './config/env.config';
import { initializeRedis, closeRedis } from './config/redis.config';

/**
 * Inicializa o servidor
 */
const startServer = async () => {
  try {
    // Valida variáveis de ambiente
    validateEnv();
    console.log('✅ Variáveis de ambiente validadas');

    // Inicializa Redis (opcional)
    await initializeRedis();

    // Cria aplicação
    const app = createApp();

    // Verifica se existem certificados SSL
    const sslKeyPath = path.join(__dirname, '../ssl/key.pem');
    const sslCertPath = path.join(__dirname, '../ssl/cert.pem');
    const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

    let server;

    if (hasSSL) {
      // Configuração HTTPS
      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
      };

      server = https.createServer(httpsOptions, app).listen(env.PORT, '0.0.0.0', () => {
        console.log('');
        console.log('🚀 Servidor HTTPS iniciado com sucesso!');
        console.log(`🔒 Rodando em: https://0.0.0.0:${env.PORT}`);
        console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
        console.log(`🔗 Health check: https://localhost:${env.PORT}/api/health`);
        console.log('✅ SSL/TLS habilitado');
        console.log('');
      });
    } else {
      // Fallback para HTTP
      server = http.createServer(app).listen(env.PORT, '0.0.0.0', () => {
        console.log('');
        console.log('🚀 Servidor HTTP iniciado com sucesso!');
        console.log(`📡 Rodando em: http://0.0.0.0:${env.PORT}`);
        console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${env.PORT}/api/health`);
        console.log('⚠️  SSL não encontrado - usando HTTP');
        console.log('');
      });
    }

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} recebido. Encerrando servidor...`);

      server.close(async () => {
        console.log('✅ Servidor encerrado');

        // Fecha conexão Redis
        await closeRedis();
        console.log('✅ Conexões fechadas');

        process.exit(0);
      });

      // Força encerramento após 10 segundos
      setTimeout(() => {
        console.error('⚠️ Forçando encerramento após timeout');
        process.exit(1);
      }, 10000);
    };

    // Listeners de sinais
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Listener de erros não tratados
    process.on('uncaughtException', (erro) => {
      console.error('❌ Erro não capturado:', erro);
      process.exit(1);
    });

    process.on('unhandledRejection', (motivo, promise) => {
      console.error('❌ Promise rejeitada não tratada:', promise, 'motivo:', motivo);
      process.exit(1);
    });
  } catch (erro) {
    console.error('❌ Erro ao iniciar servidor:', erro);
    process.exit(1);
  }
};

// Inicia o servidor
startServer();

