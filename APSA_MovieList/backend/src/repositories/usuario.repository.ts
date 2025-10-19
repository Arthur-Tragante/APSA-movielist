import { firestore } from '../config/firebase.config';
import { COLECOES_FIRESTORE } from '../constants/api.constants';
import { Usuario } from '../types';

/**
 * Repository para operações de usuários no Firestore
 */
class UsuarioRepository {
  private colecao = firestore.collection(COLECOES_FIRESTORE.USUARIOS);

  /**
   * Busca usuário por ID
   */
  async buscarPorId(id: string): Promise<Usuario | null> {
    const doc = await this.colecao.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Usuario;
  }

  /**
   * Busca usuário por email
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const snapshot = await this.colecao
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Usuario;
  }

  /**
   * Cria um novo usuário
   */
  async criar(uid: string, nome: string, email: string): Promise<void> {
    await this.colecao.doc(uid).set({
      nome,
      email,
      criadoEm: new Date().toISOString(),
    });
  }

  /**
   * Atualiza um usuário existente
   */
  async atualizar(id: string, dados: Partial<Omit<Usuario, 'id' | 'criadoEm'>>): Promise<void> {
    await this.colecao.doc(id).update(dados);
  }

  /**
   * Verifica se usuário existe
   */
  async existe(email: string): Promise<boolean> {
    const usuario = await this.buscarPorEmail(email);
    return usuario !== null;
  }
}

export default new UsuarioRepository();

