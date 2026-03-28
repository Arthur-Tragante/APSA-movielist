import apiClient from '../services/api.client';
import { Filme, FilmeCadastro, FilmeEdicao } from '../types';

/**
 * Repository para operações de filmes via API Backend
 * Responsável apenas por queries e manipulação de dados
 * Backend já retorna os dados no formato português correto
 */
class FilmeRepository {
  private baseUrl = '/filmes';

  /**
   * Busca todos os filmes
   */
  async buscarTodos(): Promise<Filme[]> {
    const response = await apiClient.get(this.baseUrl);
    return response.data.dados;
  }

  /**
   * Busca um filme por ID
   */
  async buscarPorId(id: string): Promise<Filme | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data.dados;
    } catch (error) {
      return null;
    }
  }

  /**
   * Busca filmes com filtros personalizados (mantido para compatibilidade)
   */
  async buscarComFiltros(filtros: any[]): Promise<Filme[]> {
    // Por enquanto, retorna todos os filmes
    // Pode ser implementado com query params no futuro
    return this.buscarTodos();
  }

  /**
   * Busca filmes por usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Filme[]> {
    const response = await apiClient.get(`${this.baseUrl}?user=${emailUsuario}`);
    return response.data.dados;
  }

  /**
   * Cria um novo filme
   */
  async criar(filme: FilmeCadastro): Promise<string> {
    // Adiciona tituloOriginal se não existir (backend requer)
    const payload = {
      ...filme,
      tituloOriginal: filme.titulo,
    };
    
    const response = await apiClient.post(this.baseUrl, payload);
    return response.data.dados.id || response.data.dados._id;
  }

  /**
   * Atualiza um filme existente
   */
  async atualizar(id: string, filme: Partial<FilmeEdicao>): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${id}`, filme);
  }

  /**
   * Deleta um filme
   */
  async deletar(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export default new FilmeRepository();

