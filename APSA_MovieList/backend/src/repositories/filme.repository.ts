import { FilmeModel } from '../models';
import { Filme, CriarFilmeDTO, AtualizarFilmeDTO } from '../types';
import { filmeMongoParaApp, filmeAppParaMongo, atualizacaoFilmeParaMongo } from '../utils/mappers.util';

/**
 * Repository para operações de filmes no MongoDB
 */
class FilmeRepository {

  /**
   * Busca todos os filmes de um usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Filme[]> {
    const filmes = await FilmeModel.find({ user: emailUsuario }).sort({ createdAt: -1 }).lean();

    return filmes.map((filme) => 
      filmeMongoParaApp({ id: filme._id.toString(), ...filme })
    );
  }

  /**
   * Busca filme por ID
   */
  async buscarPorId(id: string): Promise<Filme | null> {
    const filme = await FilmeModel.findById(id).lean();

    if (!filme) {
      return null;
    }

    return filmeMongoParaApp({ id: filme._id.toString(), ...filme });
  }

  /**
   * Busca todos os filmes do sistema
   */
  async buscarTodos(): Promise<Filme[]> {
    const filmes = await FilmeModel.find().sort({ createdAt: -1 }).lean();
  
    const resultado = filmes.map((filme) => {
      const docParaMapper = { 
        id: filme._id.toString(), 
        ...filme 
      };
     
      const filmeMapeado = filmeMongoParaApp(docParaMapper);
      return filmeMapeado;
    });
    
    return resultado;
  }

  /**
   * Cria um novo filme
   */
  async criar(emailUsuario: string, dadosFilme: CriarFilmeDTO): Promise<string> {
    const agora = new Date().toISOString();
    
    // Converte para formato do MongoDB (EN)
    const filmeMongo = filmeAppParaMongo({
      ...dadosFilme,
      usuario: emailUsuario,
    });

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

  /**
   * Atualiza um filme existente
   */
  async atualizar(id: string, dadosFilme: AtualizarFilmeDTO): Promise<void> {
    const agora = new Date().toISOString();
    
    // Converte para formato do MongoDB (EN)
    const dadosMongo = atualizacaoFilmeParaMongo(dadosFilme);

    await FilmeModel.findByIdAndUpdate(id, {
      ...dadosMongo,
      updatedAt: agora,
    });
  }

  /**
   * Deleta um filme
   */
  async deletar(id: string): Promise<void> {
    await FilmeModel.findByIdAndDelete(id);
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

    await FilmeModel.findByIdAndUpdate(idFilme, {
      userRatings: avaliacoesAtualizadas.map(av => ({
        user: av.usuario,
        email: av.email,
        rating: av.nota,
        comment: av.comentario || '',
      })),
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

    await FilmeModel.findByIdAndUpdate(idFilme, {
      userRatings: avaliacoesAtualizadas.map(av => ({
        user: av.usuario,
        email: av.email,
        rating: av.nota,
        comment: av.comentario || '',
      })),
      averageUserRating: media,
      updatedAt: new Date().toISOString(),
    });
  }
}

export default new FilmeRepository();

