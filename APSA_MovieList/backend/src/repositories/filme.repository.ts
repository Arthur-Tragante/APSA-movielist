import { firestore } from '../config/firebase.config';
import { COLECOES_FIRESTORE } from '../constants/api.constants';
import { Filme, CriarFilmeDTO, AtualizarFilmeDTO } from '../types';

/**
 * Repository para operações de filmes no Firestore
 */
class FilmeRepository {
  private colecao = firestore.collection(COLECOES_FIRESTORE.FILMES);

  /**
   * Busca todos os filmes de um usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Filme[]> {
    const snapshot = await this.colecao
      .where('usuario', '==', emailUsuario)
      .orderBy('criadoEm', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Filme[];
  }

  /**
   * Busca filme por ID
   */
  async buscarPorId(id: string): Promise<Filme | null> {
    const doc = await this.colecao.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Filme;
  }

  /**
   * Cria um novo filme
   */
  async criar(emailUsuario: string, dadosFilme: CriarFilmeDTO): Promise<string> {
    const agora = new Date().toISOString();

    const docRef = await this.colecao.add({
      ...dadosFilme,
      usuario: emailUsuario,
      criadoEm: agora,
      atualizadoEm: agora,
      avaliacoesUsuarios: [],
      mediaAvaliacaoUsuarios: 0,
    });

    return docRef.id;
  }

  /**
   * Atualiza um filme existente
   */
  async atualizar(id: string, dadosFilme: AtualizarFilmeDTO): Promise<void> {
    const agora = new Date().toISOString();

    await this.colecao.doc(id).update({
      ...dadosFilme,
      atualizadoEm: agora,
    });
  }

  /**
   * Deleta um filme
   */
  async deletar(id: string): Promise<void> {
    await this.colecao.doc(id).delete();
  }

  /**
   * Adiciona ou atualiza avaliação de usuário
   */
  async atualizarAvaliacaoUsuario(
    idFilme: string,
    emailUsuario: string,
    nomeUsuario: string,
    nota: number,
    comentario?: string
  ): Promise<void> {
    const filme = await this.buscarPorId(idFilme);

    if (!filme) {
      throw new Error('Filme não encontrado');
    }

    const avaliacoesAtualizadas = [...(filme.avaliacoesUsuarios || [])];
    const indiceExistente = avaliacoesAtualizadas.findIndex(
      (av) => av.email === emailUsuario
    );

    if (indiceExistente > -1) {
      avaliacoesAtualizadas[indiceExistente].nota = nota;
      avaliacoesAtualizadas[indiceExistente].comentario = comentario;
    } else {
      avaliacoesAtualizadas.push({
        usuario: nomeUsuario,
        email: emailUsuario,
        nota,
        assistido: filme.assistido,
        comentario,
      });
    }

    // Calcula média
    const soma = avaliacoesAtualizadas.reduce((acc, av) => acc + av.nota, 0);
    const media = avaliacoesAtualizadas.length > 0 
      ? Number((soma / avaliacoesAtualizadas.length).toFixed(2))
      : 0;

    await this.colecao.doc(idFilme).update({
      avaliacoesUsuarios: avaliacoesAtualizadas,
      mediaAvaliacaoUsuarios: media,
      atualizadoEm: new Date().toISOString(),
    });
  }

  /**
   * Remove avaliação de usuário
   */
  async removerAvaliacaoUsuario(idFilme: string, emailUsuario: string): Promise<void> {
    const filme = await this.buscarPorId(idFilme);

    if (!filme) {
      throw new Error('Filme não encontrado');
    }

    const avaliacoesAtualizadas = (filme.avaliacoesUsuarios || []).filter(
      (av) => av.email !== emailUsuario
    );

    // Recalcula média
    const soma = avaliacoesAtualizadas.reduce((acc, av) => acc + av.nota, 0);
    const media = avaliacoesAtualizadas.length > 0 
      ? Number((soma / avaliacoesAtualizadas.length).toFixed(2))
      : 0;

    await this.colecao.doc(idFilme).update({
      avaliacoesUsuarios: avaliacoesAtualizadas,
      mediaAvaliacaoUsuarios: media,
      atualizadoEm: new Date().toISOString(),
    });
  }
}

export default new FilmeRepository();

