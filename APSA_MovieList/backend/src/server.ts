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

    // Inicia servidor
    const server = app.listen(env.PORT, () => {
      console.log('');
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📡 Rodando em: http://localhost:${env.PORT}`);
      console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${env.PORT}/api/health`);
      console.log('');
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} recebido. Encerrando servidor...`);

      server.close(async () => {
        console.log('✅ Servidor HTTP encerrado');

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

