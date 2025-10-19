import { getRedisClient } from '../config/redis.config';

/**
 * Service para gerenciar cache (Redis ou memória)
 */
class CacheService {
  private memoriaCache = new Map<string, { valor: string; expira: number }>();

  /**
   * Obtém valor do cache
   */
  async obter(chave: string): Promise<string | null> {
    const redisClient = getRedisClient();

    if (redisClient) {
      try {
        return await redisClient.get(chave);
      } catch (erro) {
        console.error('Erro ao buscar no Redis:', erro);
      }
    }

    // Fallback: cache em memória
    const item = this.memoriaCache.get(chave);
    if (item && item.expira > Date.now()) {
      return item.valor;
    }

    if (item) {
      this.memoriaCache.delete(chave);
    }

    return null;
  }

  /**
   * Define valor no cache com TTL
   */
  async definir(chave: string, valor: string, ttlSegundos: number): Promise<void> {
    const redisClient = getRedisClient();

    if (redisClient) {
      try {
        await redisClient.setEx(chave, ttlSegundos, valor);
        return;
      } catch (erro) {
        console.error('Erro ao salvar no Redis:', erro);
      }
    }

    // Fallback: cache em memória
    this.memoriaCache.set(chave, {
      valor,
      expira: Date.now() + ttlSegundos * 1000,
    });
  }

  /**
   * Remove valor do cache
   */
  async remover(chave: string): Promise<void> {
    const redisClient = getRedisClient();

    if (redisClient) {
      try {
        await redisClient.del(chave);
        return;
      } catch (erro) {
        console.error('Erro ao remover do Redis:', erro);
      }
    }

    // Fallback: cache em memória
    this.memoriaCache.delete(chave);
  }

  /**
   * Remove múltiplas chaves por padrão
   */
  async removerPorPadrao(padrao: string): Promise<void> {
    const redisClient = getRedisClient();

    if (redisClient) {
      try {
        const chaves = await redisClient.keys(padrao);
        if (chaves.length > 0) {
          await redisClient.del(chaves);
        }
        return;
      } catch (erro) {
        console.error('Erro ao remover por padrão do Redis:', erro);
      }
    }

    // Fallback: cache em memória
    const chaves = Array.from(this.memoriaCache.keys());
    const regex = new RegExp(padrao.replace('*', '.*'));
    chaves.forEach((chave) => {
      if (regex.test(chave)) {
        this.memoriaCache.delete(chave);
      }
    });
  }

  /**
   * Limpa todo o cache
   */
  async limpar(): Promise<void> {
    const redisClient = getRedisClient();

    if (redisClient) {
      try {
        await redisClient.flushDb();
        return;
      } catch (erro) {
        console.error('Erro ao limpar Redis:', erro);
      }
    }

    // Fallback: cache em memória
    this.memoriaCache.clear();
  }
}

export default new CacheService();

