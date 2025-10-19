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
import { filmeFirestoreParaApp, filmeAppParaFirestore } from '../utils/mappers.util';

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
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => 
      filmeFirestoreParaApp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Busca um filme por ID
   */
  async buscarPorId(id: string): Promise<Filme | null> {
    const docRef = doc(this.colecao, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return filmeFirestoreParaApp({ id: docSnap.id, ...docSnap.data() });
    }

    return null;
  }

  /**
   * Busca filmes com filtros personalizados
   */
  async buscarComFiltros(filtros: QueryConstraint[]): Promise<Filme[]> {
    const q = query(this.colecao, ...filtros);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => 
      filmeFirestoreParaApp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Busca filmes por usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Filme[]> {
    const q = query(this.colecao, where('user', '==', emailUsuario));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => 
      filmeFirestoreParaApp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Cria um novo filme
   */
  async criar(filme: FilmeCadastro): Promise<string> {
    const filmeFirestore = filmeAppParaFirestore(filme);
    const docRef = await addDoc(this.colecao, filmeFirestore);
    return docRef.id;
  }

  /**
   * Atualiza um filme existente
   */
  async atualizar(id: string, filme: Partial<FilmeEdicao>): Promise<void> {
    const docRef = doc(this.colecao, id);
    
    // Converte campos PT para EN
    const dadosFirestore: any = {};
    if (filme.titulo) dadosFirestore.title = filme.titulo;
    if (filme.genero) dadosFirestore.genre = filme.genero;
    if (filme.ano) dadosFirestore.year = filme.ano;
    if (filme.duracao) dadosFirestore.duration = filme.duracao;
    if (filme.notaImdb) dadosFirestore.imdbRating = filme.notaImdb;
    if (filme.metascore) dadosFirestore.metascore = filme.metascore;
    if (filme.sinopse) dadosFirestore.synopsis = filme.sinopse;
    if (filme.assistido !== undefined) dadosFirestore.watched = filme.assistido;
    if (filme.avaliacoes) {
      dadosFirestore.ratings = filme.avaliacoes.map(av => ({
        Source: av.fonte,
        Value: av.valor,
      }));
    }
    if (filme.avaliacoesUsuarios) {
      dadosFirestore.userRatings = filme.avaliacoesUsuarios.map(av => ({
        user: av.usuario,
        email: av.email,
        rating: av.nota,
        comment: av.comentario || '',
      }));
    }
    
    await updateDoc(docRef, dadosFirestore);
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

