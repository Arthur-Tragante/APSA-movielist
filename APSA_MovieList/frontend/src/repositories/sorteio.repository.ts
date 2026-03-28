import apiClient from '../services/api.client';

interface FilmeSorteio {
  id: string;
  titulo: string;
  usuario: string;
  email: string;
}

interface ResultadoSorteio {
  allPicks: string[];
  winner: string;
}

/**
 * Repository para interagir com API de sorteio
 */
class SorteioRepository {
  /**
   * Busca todos os filmes do sorteio
   */
  async buscarFilmes(): Promise<FilmeSorteio[]> {
    const resposta = await apiClient.get('/sorteio/filmes');
    return resposta.data.dados;
  }

  /**
   * Adiciona um filme ao sorteio
   */
  async adicionarFilme(titulo: string): Promise<FilmeSorteio> {
    const resposta = await apiClient.post('/sorteio/filmes', { titulo });
    return resposta.data.dados;
  }

  /**
   * Remove um filme do sorteio
   */
  async removerFilme(id: string): Promise<void> {
    await apiClient.delete(`/sorteio/filmes/${id}`);
  }

  /**
   * Realiza o sorteio
   */
  async sortear(webhook?: string): Promise<{ vencedor: string; sorteios: string[] }> {
    const resposta = await apiClient.post('/sorteio/sortear', { webhook });
    return resposta.data.dados;
  }

  /**
   * Busca o último resultado
   */
  async buscarResultado(): Promise<ResultadoSorteio | null> {
    const resposta = await apiClient.get('/sorteio/resultado');
    return resposta.data.dados;
  }

  /**
   * Limpa o resultado
   */
  async limparResultado(): Promise<void> {
    await apiClient.delete('/sorteio/resultado');
  }

  /**
   * Limpa tudo (filmes e resultado)
   */
  async limparTudo(): Promise<void> {
    await apiClient.delete('/sorteio/limpar-tudo');
  }
}

export default new SorteioRepository();
