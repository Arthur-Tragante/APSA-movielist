import { SerieModel } from '../models';
import { Serie, CriarSerieDTO, AtualizarSerieDTO, Episodio, AvaliacaoEpisodio } from '../types';
import { serieMongoParaApp, serieAppParaMongo, atualizacaoSerieParaMongo } from '../utils/mappers.util';

/**
 * Repository para operações de séries no MongoDB
 */
class SerieRepository {

  /**
   * Busca todas as séries de um usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Serie[]> {
    const series = await SerieModel.find({ user: emailUsuario }).sort({ createdAt: -1 }).lean();

    return series.map((serie) => 
      serieMongoParaApp({ id: serie._id.toString(), ...serie })
    );
  }

  /**
   * Busca série por ID
   */
  async buscarPorId(id: string): Promise<Serie | null> {
    const serie = await SerieModel.findById(id).lean();

    if (!serie) {
      return null;
    }

    return serieMongoParaApp({ id: serie._id.toString(), ...serie });
  }

  /**
   * Busca todas as séries do sistema
   */
  async buscarTodas(): Promise<Serie[]> {
    const series = await SerieModel.find().lean();
    return series.map((serie) =>
      serieMongoParaApp({ id: serie._id.toString(), ...serie })
    );
  }

  /**
   * Cria uma nova série
   */
  async criar(emailUsuario: string, dadosSerie: CriarSerieDTO): Promise<string> {
    const agora = new Date().toISOString();
    
    // Converte para formato do MongoDB (EN)
    const serieMongo = serieAppParaMongo({
      ...dadosSerie,
      usuario: emailUsuario,
    });

    const novaSerie = new SerieModel({
      ...serieMongo,
      user: emailUsuario,
      createdAt: agora,
      updatedAt: agora,
      userRatings: [],
      averageUserRating: 0,
    });
    
    await novaSerie.save();

    return novaSerie._id.toString();
  }

  /**
   * Atualiza uma série existente
   */
  async atualizar(id: string, dadosSerie: AtualizarSerieDTO): Promise<void> {
    const agora = new Date().toISOString();
    
    // Converte para formato do MongoDB (EN)
    const dadosMongo = atualizacaoSerieParaMongo(dadosSerie);

    await SerieModel.findByIdAndUpdate(id, {
      ...dadosMongo,
      updatedAt: agora,
    });
  }

  /**
   * Deleta uma série
   */
  async deletar(id: string): Promise<void> {
    await SerieModel.findByIdAndDelete(id);
  }

  /**
   * Adiciona ou atualiza avaliação de usuário
   */
  async atualizarAvaliacaoUsuario(
    idSerie: string,
    emailUsuario: string,
    nomUsuario: string,
    nota: number,
    comentario?: string
  ): Promise<void> {
    const serie = await this.buscarPorId(idSerie);

    if (!serie) {
      throw new Error('Série não encontrada');
    }

    const avaliacoesAtualizadas = [...(serie.avaliacoesUsuarios || [])];
    const indiceExistente = avaliacoesAtualizadas.findIndex(
      (av) => av.email === emailUsuario
    );

    if (indiceExistente > -1) {
      avaliacoesAtualizadas[indiceExistente].nota = nota;
      avaliacoesAtualizadas[indiceExistente].comentario = comentario;
    } else {
      avaliacoesAtualizadas.push({
        usuario: nomUsuario,
        email: emailUsuario,
        nota,
        assistido: serie.assistido,
        comentario,
      });
    }

    // Calcula média
    const soma = avaliacoesAtualizadas.reduce((acc, av) => acc + av.nota, 0);
    const media = avaliacoesAtualizadas.length > 0 
      ? Number((soma / avaliacoesAtualizadas.length).toFixed(2))
      : 0;

    await SerieModel.findByIdAndUpdate(idSerie, {
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
  async removerAvaliacaoUsuario(idSerie: string, emailUsuario: string): Promise<void> {
    const serie = await this.buscarPorId(idSerie);

    if (!serie) {
      throw new Error('Série não encontrada');
    }

    const avaliacoesAtualizadas = (serie.avaliacoesUsuarios || []).filter(
      (av) => av.email !== emailUsuario
    );

    // Recalcula média
    const soma = avaliacoesAtualizadas.reduce((acc, av) => acc + av.nota, 0);
    const media = avaliacoesAtualizadas.length > 0 
      ? Number((soma / avaliacoesAtualizadas.length).toFixed(2))
      : 0;

    await SerieModel.findByIdAndUpdate(idSerie, {
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
   * Adiciona um episódio a uma série
   */
  async adicionarEpisodio(idSerie: string, numeroTemporada: number, episodio: Episodio): Promise<void> {
    const serie = await this.buscarPorId(idSerie);

    if (!serie) {
      throw new Error('Série não encontrada');
    }

    const temporadasEpisodios = [...(serie.temporadasEpisodios || [])];
    
    // Busca ou cria a temporada
    let temporada = temporadasEpisodios.find(t => t.numero === numeroTemporada);
    
    if (!temporada) {
      temporada = {
        numero: numeroTemporada,
        episodios: [],
      };
      temporadasEpisodios.push(temporada);
    }

    // Verifica se o episódio já existe
    const indiceEpisodio = temporada.episodios.findIndex(e => e.numero === episodio.numero);
    
    if (indiceEpisodio > -1) {
      // Atualiza o episódio existente mantendo as avaliações
      temporada.episodios[indiceEpisodio] = {
        ...episodio,
        avaliacoesEpisodio: temporada.episodios[indiceEpisodio].avaliacoesEpisodio || [],
      };
    } else {
      // Adiciona novo episódio
      temporada.episodios.push(episodio);
    }

    // Ordena os episódios por número
    temporada.episodios.sort((a, b) => a.numero - b.numero);

    await SerieModel.findByIdAndUpdate(idSerie, {
      temporadasEpisodios: temporadasEpisodios.map(t => ({
        numero: t.numero,
        episodios: t.episodios,
      })),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Remove um episódio de uma série
   */
  async removerEpisodio(idSerie: string, numeroTemporada: number, numeroEpisodio: number): Promise<void> {
    const serie = await this.buscarPorId(idSerie);

    if (!serie) {
      throw new Error('Série não encontrada');
    }

    const temporadasEpisodios = [...(serie.temporadasEpisodios || [])];
    
    const indiceTemporada = temporadasEpisodios.findIndex(t => t.numero === numeroTemporada);
    
    if (indiceTemporada === -1) {
      throw new Error('Temporada não encontrada');
    }

    const temporada = temporadasEpisodios[indiceTemporada];
    temporada.episodios = temporada.episodios.filter(e => e.numero !== numeroEpisodio);

    // Remove temporada se não houver episódios
    if (temporada.episodios.length === 0) {
      temporadasEpisodios.splice(indiceTemporada, 1);
    }

    await SerieModel.findByIdAndUpdate(idSerie, {
      temporadasEpisodios: temporadasEpisodios,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Avalia um episódio
   */
  async avaliarEpisodio(
    idSerie: string,
    numeroTemporada: number,
    numeroEpisodio: number,
    emailUsuario: string,
    nomeUsuario: string,
    nota: number,
    comentario?: string
  ): Promise<void> {
    const serie = await this.buscarPorId(idSerie);

    if (!serie) {
      throw new Error('Série não encontrada');
    }

    const temporadasEpisodios = [...(serie.temporadasEpisodios || [])];
    
    const indiceTemporada = temporadasEpisodios.findIndex(t => t.numero === numeroTemporada);
    
    if (indiceTemporada === -1) {
      throw new Error('Temporada não encontrada');
    }

    const temporada = temporadasEpisodios[indiceTemporada];
    const episodio = temporada.episodios.find(e => e.numero === numeroEpisodio);

    if (!episodio) {
      throw new Error('Episódio não encontrado');
    }

    const avaliacoesEpisodio = [...(episodio.avaliacoesEpisodio || [])];
    const indiceAvaliacao = avaliacoesEpisodio.findIndex(av => av.email === emailUsuario);
    const agora = new Date().toISOString();

    const novaAvaliacao: AvaliacaoEpisodio = {
      usuario: nomeUsuario,
      email: emailUsuario,
      nota,
      comentario,
      criadoEm: indiceAvaliacao > -1 ? avaliacoesEpisodio[indiceAvaliacao].criadoEm : agora,
      atualizadoEm: agora,
    };

    if (indiceAvaliacao > -1) {
      avaliacoesEpisodio[indiceAvaliacao] = novaAvaliacao;
    } else {
      avaliacoesEpisodio.push(novaAvaliacao);
    }

    episodio.avaliacoesEpisodio = avaliacoesEpisodio;

    await SerieModel.findByIdAndUpdate(idSerie, {
      temporadasEpisodios: temporadasEpisodios,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Remove avaliação de um episódio
   */
  async removerAvaliacaoEpisodio(
    idSerie: string,
    numeroTemporada: number,
    numeroEpisodio: number,
    emailUsuario: string
  ): Promise<void> {
    const serie = await this.buscarPorId(idSerie);

    if (!serie) {
      throw new Error('Série não encontrada');
    }

    const temporadasEpisodios = [...(serie.temporadasEpisodios || [])];
    
    const indiceTemporada = temporadasEpisodios.findIndex(t => t.numero === numeroTemporada);
    
    if (indiceTemporada === -1) {
      throw new Error('Temporada não encontrada');
    }

    const temporada = temporadasEpisodios[indiceTemporada];
    const episodio = temporada.episodios.find(e => e.numero === numeroEpisodio);

    if (!episodio) {
      throw new Error('Episódio não encontrado');
    }

    episodio.avaliacoesEpisodio = (episodio.avaliacoesEpisodio || []).filter(av => av.email !== emailUsuario);

    await SerieModel.findByIdAndUpdate(idSerie, {
      temporadasEpisodios: temporadasEpisodios,
      updatedAt: new Date().toISOString(),
    });
  }
}

export default new SerieRepository();
