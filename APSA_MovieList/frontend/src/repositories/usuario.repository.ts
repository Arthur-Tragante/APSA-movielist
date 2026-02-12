import apiClient from '../services/api.client';
import { Usuario } from '../types';
import { usuarioFirestoreParaApp } from '../utils/mappers.util';

/**
 * Repository para operações de usuários via API Backend
 * Responsável apenas por queries e manipulação de dados
 */
class UsuarioRepository {
  private baseUrl = '/usuarios';

  /**
   * Busca usuário por email
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}?email=${email}`);
      if (response.data.dados && response.data.dados.length > 0) {
        const usuario = response.data.dados[0];
        return usuarioFirestoreParaApp({ id: usuario._id || usuario.id, ...usuario });
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Busca todos os usuários
   */
  async buscarTodos(): Promise<Usuario[]> {
    const response = await apiClient.get(this.baseUrl);
    return (response.data.dados || []).map((usuario: any) => 
      usuarioFirestoreParaApp({ id: usuario._id || usuario.id, ...usuario })
    );
  }

  /**
   * Cria um novo usuário
   */
  async criar(usuario: Omit<Usuario, 'id'>): Promise<string> {
    const response = await apiClient.post(this.baseUrl, usuario);
    return response.data.dados.id || response.data.dados._id;
  }
}

export default new UsuarioRepository();

