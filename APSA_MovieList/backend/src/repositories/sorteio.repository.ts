import { SorteioFilmeModel, SorteioResultadoModel, ISorteioFilme, ISorteioResultado } from '../models/sorteio.model';

/**
 * Repository para gerenciar filmes do sorteio
 */
class SorteioRepository {
  /**
   * Busca todos os filmes do sorteio
   */
  async buscarTodosFilmes(): Promise<ISorteioFilme[]> {
    return await SorteioFilmeModel.find().sort({ criadoEm: 1 });
  }

  /**
   * Adiciona um filme ao sorteio
   */
  async adicionarFilme(dados: { titulo: string; usuario: string; email: string }): Promise<ISorteioFilme> {
    const filme = new SorteioFilmeModel(dados);
    return await filme.save();
  }

  /**
   * Remove um filme do sorteio
   */
  async removerFilme(id: string): Promise<boolean> {
    const resultado = await SorteioFilmeModel.findByIdAndDelete(id);
    return resultado !== null;
  }

  /**
   * Verifica se um usuário já adicionou filme
   */
  async usuarioJaAdicionou(email: string): Promise<boolean> {
    const count = await SorteioFilmeModel.countDocuments({ email });
    return count > 0;
  }

  /**
   * Limpa todos os filmes do sorteio
   */
  async limparFilmes(): Promise<void> {
    await SorteioFilmeModel.deleteMany({});
  }

  /**
   * Busca o último resultado do sorteio
   */
  async buscarUltimoResultado(): Promise<ISorteioResultado | null> {
    return await SorteioResultadoModel.findOne().sort({ timestamp: -1 });
  }

  /**
   * Salva resultado do sorteio
   */
  async salvarResultado(dados: { allPicks: string[]; winner: string }): Promise<ISorteioResultado> {
    const resultado = new SorteioResultadoModel(dados);
    return await resultado.save();
  }

  /**
   * Limpa resultado do sorteio
   */
  async limparResultado(): Promise<void> {
    await SorteioResultadoModel.deleteMany({});
  }
}

export default new SorteioRepository();
