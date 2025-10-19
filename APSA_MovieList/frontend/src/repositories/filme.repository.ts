import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { COLECOES } from '../constants';
import { Filme, FilmeCadastro, FilmeEdicao } from '../types';

/**
 * Repository para operações de filmes no Firestore
 * Responsável apenas por queries e manipulação de dados
 */
class FilmeRepository {
  private colecao = collection(db, COLECOES.FILMES);

  /**
   * Busca todos os filmes
   */
  async buscarTodos(): Promise<Filme[]> {
    const querySnapshot = await getDocs(this.colecao);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })) as Filme[];
  }

  /**
   * Busca um filme por ID
   */
  async buscarPorId(id: string): Promise<Filme | null> {
    const docRef = doc(this.colecao, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Filme;
    }

    return null;
  }

  /**
   * Busca filmes com filtros personalizados
   */
  async buscarComFiltros(filtros: QueryConstraint[]): Promise<Filme[]> {
    const q = query(this.colecao, ...filtros);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })) as Filme[];
  }

  /**
   * Busca filmes por usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Filme[]> {
    const q = query(this.colecao, where('usuario', '==', emailUsuario));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })) as Filme[];
  }

  /**
   * Cria um novo filme
   */
  async criar(filme: FilmeCadastro): Promise<string> {
    const docRef = await addDoc(this.colecao, filme);
    return docRef.id;
  }

  /**
   * Atualiza um filme existente
   */
  async atualizar(id: string, filme: Partial<FilmeEdicao>): Promise<void> {
    const docRef = doc(this.colecao, id);
    await updateDoc(docRef, filme);
  }

  /**
   * Deleta um filme
   */
  async deletar(id: string): Promise<void> {
    const docRef = doc(this.colecao, id);
    await deleteDoc(docRef);
  }
}

export default new FilmeRepository();

