import { FilmeModel } from '../models';
import { Filme, CriarFilmeDTO, AtualizarFilmeDTO } from '../types';
import { filmeMongoParaApp, filmeAppParaMongo, atualizacaoFilmeParaMongo } from '../utils/mappers.util';
import { firestore } from '../config/firebase.config';
import { env } from '../config/env.config';

const COLECAO_FILMES = 'movies';

/**
 * Repository para operações de filmes (MongoDB ou Firestore)
 */
class FilmeRepository {

  /**
   * Busca todos os filmes de um usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Filme[]> {
    if (env.MONGODB_ENABLED) {
      const filmes = await FilmeModel.find({ user: emailUsuario }).sort({ createdAt: -1 }).lean();
      return filmes.map((filme) => 
        filmeMongoParaApp({ id: filme._id.toString(), ...filme })
      );
    }

    if (!firestore) return [];
    const snapshot = await firestore.collection(COLECAO_FILMES)
      .where('user', '==', emailUsuario)
      .get();
    return snapshot.docs.map(doc => filmeMongoParaApp({ id: doc.id, ...doc.data() }));
  }

  /**
   * Busca filme por ID
   */
  async buscarPorId(id: string): Promise<Filme | null> {
    if (env.MONGODB_ENABLED) {
      const filme = await FilmeModel.findById(id).lean();
      if (!filme) return null;
      return filmeMongoParaApp({ id: filme._id.toString(), ...filme });
    }

    if (!firestore) return null;
    const doc = await firestore.collection(COLECAO_FILMES).doc(id).get();
    if (!doc.exists) return null;
    return filmeMongoParaApp({ id: doc.id, ...doc.data() });
  }

  /**
   * Busca todos os filmes do sistema
   */
  async buscarTodos(): Promise<Filme[]> {
    if (env.MONGODB_ENABLED) {
      const filmes = await FilmeModel.find().sort({ createdAt: -1 }).lean();
      return filmes.map((filme) => filmeMongoParaApp({ id: filme._id.toString(), ...filme }));
    }

    if (!firestore) return [];
    const snapshot = await firestore.collection(COLECAO_FILMES).get();
    return snapshot.docs.map(doc => filmeMongoParaApp({ id: doc.id, ...doc.data() }));
  }

  /**
   * Cria um novo filme
   */
  async criar(emailUsuario: string, dadosFilme: CriarFilmeDTO): Promise<string> {
    const agora = new Date().toISOString();
    
    const filmeMongo = filmeAppParaMongo({
      ...dadosFilme,
      usuario: emailUsuario,
    });

    if (env.MONGODB_ENABLED) {
      const novoFilme = new FilmeModel({
        ...filmeMongo,
        user: emailUsuario,
        createdAt: agora,
        updatedAt: agora,
        userRatings: [],
        averageUserRating: 0,
      });
      await novoFilme.save();
      return novoFilme._id.toString();
    }

    if (!firestore) throw new Error('Firestore não disponível');
    const docRef = await firestore.collection(COLECAO_FILMES).add({
      ...filmeMongo,
      user: emailUsuario,
      createdAt: agora,
      updatedAt: agora,
      userRatings: [],
      averageUserRating: 0,
    });
    return docRef.id;
  }

  /**
   * Atualiza um filme existente
   */
  async atualizar(id: string, dadosFilme: AtualizarFilmeDTO): Promise<void> {
    const agora = new Date().toISOString();
    const dadosMongo = atualizacaoFilmeParaMongo(dadosFilme);

    if (env.MONGODB_ENABLED) {
      await FilmeModel.findByIdAndUpdate(id, { ...dadosMongo, updatedAt: agora });
      return;
    }

    if (!firestore) throw new Error('Firestore não disponível');
    await firestore.collection(COLECAO_FILMES).doc(id).update({ ...dadosMongo, updatedAt: agora });
  }

  /**
   * Deleta um filme
   */
  async deletar(id: string): Promise<void> {
    if (env.MONGODB_ENABLED) {
      await FilmeModel.findByIdAndDelete(id);
      return;
    }

    if (!firestore) throw new Error('Firestore não disponível');
    await firestore.collection(COLECAO_FILMES).doc(id).delete();
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

    const userRatings = avaliacoesAtualizadas.map(av => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));

    if (env.MONGODB_ENABLED) {
      await FilmeModel.findByIdAndUpdate(idFilme, {
        userRatings,
        averageUserRating: media,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    if (!firestore) throw new Error('Firestore não disponível');
    await firestore.collection(COLECAO_FILMES).doc(idFilme).update({
      userRatings,
      averageUserRating: media,
      updatedAt: new Date().toISOString(),
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

    const userRatings = avaliacoesAtualizadas.map(av => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));

    if (env.MONGODB_ENABLED) {
      await FilmeModel.findByIdAndUpdate(idFilme, {
        userRatings,
        averageUserRating: media,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    if (!firestore) throw new Error('Firestore não disponível');
    await firestore.collection(COLECAO_FILMES).doc(idFilme).update({
      userRatings,
      averageUserRating: media,
      updatedAt: new Date().toISOString(),
    });
  }
}

export default new FilmeRepository();

