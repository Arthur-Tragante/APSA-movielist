import mongoose from 'mongoose';
import { env } from './env.config';

/**
 * Configuração do MongoDB
 */
export const connectMongoDB = async (): Promise<void> => {
  if (!env.MONGODB_ENABLED) {
    console.log('⚠️ MongoDB desabilitado (MONGODB_ENABLED=false)');
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    
    console.log('✅ MongoDB conectado com sucesso');
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ Erro na conexão MongoDB:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });
    
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  if (!env.MONGODB_ENABLED) return;

  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar MongoDB:', error);
  }
};

export default mongoose;
