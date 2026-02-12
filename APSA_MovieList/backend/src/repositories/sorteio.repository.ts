import { SorteioFilmeModel, SorteioResultadoModel } from '../models/sorteio.model';
import { realtimeDb } from '../config/firebase.config';
import { env } from '../config/env.config';

// Nós no Realtime Database
const NODE_FILMES = 'Movies';
const NODE_RESULTADO = 'SorteioResultado';

/**
 * Repository para gerenciar filmes do sorteio
 * Usa MongoDB quando habilitado, senão Firebase Realtime Database
 */
class SorteioRepository {
  /**
   * Busca todos os filmes do sorteio
   */
  async buscarTodosFilmes(): Promise<any[]> {
    if (env.MONGODB_ENABLED) {
      return await SorteioFilmeModel.find().sort({ criadoEm: 1 });
    }

    if (!realtimeDb) return [];
    const snapshot = await realtimeDb.ref(NODE_FILMES).once('value');
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.entries(data).map(([key, value]: [string, any]) => ({
      _id: key,
      titulo: value.title || '',
      usuario: value.user || '',
      email: value.email || '',
    }));
  }

  /**
   * Adiciona um filme ao sorteio
   */
  async adicionarFilme(dados: { titulo: string; usuario: string; email: string }): Promise<any> {
    if (env.MONGODB_ENABLED) {
      const filme = new SorteioFilmeModel(dados);
      return await filme.save();
    }

    if (!realtimeDb) throw new Error('Firebase Realtime Database não disponível');
    const ref = realtimeDb.ref(NODE_FILMES).push();
    const rtdbData = {
      title: dados.titulo,
      user: dados.usuario,
      email: dados.email,
    };
    await ref.set(rtdbData);
    return { _id: ref.key, ...dados };
  }

  /**
   * Remove um filme do sorteio
   */
  async removerFilme(id: string): Promise<boolean> {
    if (env.MONGODB_ENABLED) {
      const resultado = await SorteioFilmeModel.findByIdAndDelete(id);
      return resultado !== null;
    }

    if (!realtimeDb) return false;
    const ref = realtimeDb.ref(`${NODE_FILMES}/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) return false;
    await ref.remove();
    return true;
  }

  /**
   * Verifica se um usuário já adicionou filme
   */
  async usuarioJaAdicionou(email: string): Promise<boolean> {
    if (env.MONGODB_ENABLED) {
      const count = await SorteioFilmeModel.countDocuments({ email });
      return count > 0;
    }

    if (!realtimeDb) return false;
    const snapshot = await realtimeDb.ref(NODE_FILMES)
      .orderByChild('email')
      .equalTo(email)
      .once('value');
    return snapshot.exists();
  }

  /**
   * Limpa todos os filmes do sorteio
   */
  async limparFilmes(): Promise<void> {
    if (env.MONGODB_ENABLED) {
      await SorteioFilmeModel.deleteMany({});
      return;
    }

    if (!realtimeDb) return;
    await realtimeDb.ref(NODE_FILMES).remove();
  }

  /**
   * Busca o último resultado do sorteio
   */
  async buscarUltimoResultado(): Promise<any | null> {
    if (env.MONGODB_ENABLED) {
      return await SorteioResultadoModel.findOne().sort({ timestamp: -1 });
    }

    if (!realtimeDb) return null;
    const snapshot = await realtimeDb.ref(NODE_RESULTADO).once('value');
    if (!snapshot.exists()) return null;
    const data = snapshot.val();
    return { _id: 'resultado', ...data };
  }

  /**
   * Salva resultado do sorteio
   */
  async salvarResultado(dados: { allPicks: string[]; winner: string }): Promise<any> {
    if (env.MONGODB_ENABLED) {
      const resultado = new SorteioResultadoModel(dados);
      return await resultado.save();
    }

    if (!realtimeDb) throw new Error('Firebase Realtime Database não disponível');
    const resultado = {
      ...dados,
      timestamp: new Date().toISOString(),
    };
    await realtimeDb.ref(NODE_RESULTADO).set(resultado);
    return { _id: 'resultado', ...resultado };
  }

  /**
   * Limpa resultado do sorteio
   */
  async limparResultado(): Promise<void> {
    if (env.MONGODB_ENABLED) {
      await SorteioResultadoModel.deleteMany({});
      return;
    }

    if (!realtimeDb) return;
    await realtimeDb.ref(NODE_RESULTADO).remove();
  }
}

export default new SorteioRepository();
