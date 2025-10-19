import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { COLECOES } from '../constants';
import { Usuario } from '../types';

/**
 * Repository para operações de usuários no Firestore
 * Responsável apenas por queries e manipulação de dados
 */
class UsuarioRepository {
  private colecao = collection(db, COLECOES.USUARIOS);

  /**
   * Busca usuário por email
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const q = query(this.colecao, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Usuario;
    }

    return null;
  }

  /**
   * Busca todos os usuários
   */
  async buscarTodos(): Promise<Usuario[]> {
    const querySnapshot = await getDocs(this.colecao);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })) as Usuario[];
  }

  /**
   * Cria um novo usuário
   */
  async criar(usuario: Omit<Usuario, 'id'>): Promise<string> {
    const docRef = await addDoc(this.colecao, usuario);
    return docRef.id;
  }
}

export default new UsuarioRepository();

