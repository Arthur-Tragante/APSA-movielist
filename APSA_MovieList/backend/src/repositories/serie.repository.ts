import { SerieModel } from '../models';
import { Serie, CriarSerieDTO, AtualizarSerieDTO, Episodio, AvaliacaoEpisodio } from '../types';
import { serieMongoParaApp, serieAppParaMongo, atualizacaoSerieParaMongo } from '../utils/mappers.util';

/**
 * Repository para operações de séries (MongoDB)
 */
class SerieRepository {

  /**
   * Busca todas as séries de um usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Serie[]> {
    const series = await SerieModel.find({ user: emailUsuario }).sort({ createdAt: -1 }).lean();
    return series.map((serie) => serieMongoParaApp({ id: serie._id.toString(), ...serie }));
  }

  /**
   * Busca série por ID
   */
  async buscarPorId(id: string): Promise<Serie | null> {
    const serie = await SerieModel.findById(id).lean();
    if (!serie) return null;
    return serieMongoParaApp({ id: serie._id.toString(), ...serie });
  }

  /**
   * Busca todas as séries do sistema
   */
  async buscarTodas(): Promise<Serie[]> {
    const series = await SerieModel.find().lean();
    return series.map((serie) => serieMongoParaApp({ id: serie._id.toString(), ...serie }));
  }

  /**
   * Cria uma nova série
   */
  async criar(emailUsuario: string, dadosSerie: CriarSerieDTO): Promise<string> {
    const agora = new Date().toISOString();
    const serieMongo = serieAppParaMongo({ ...dadosSerie, usuario: emailUsuario });

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
    const dadosMongo = atualizacaoSerieParaMongo(dadosSerie);
    await SerieModel.findByIdAndUpdate(id, { ...dadosMongo, updatedAt: agora });
  }

  /**
   * Deleta uma série
   */
  async deletar(id: string): Promise<void> {
    await SerieModel.findByIdAndDelete(id);
  }

  /**
   * Helper para salvar dados EN de volta no storage (MongoDB)
   */
  private async salvarDadosSerie(id: string, dadosEN: Record<string, any>): Promise<void> {
    await SerieModel.findByIdAndUpdate(id, dadosEN);
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
    if (!serie) throw new Error('Série não encontrada');

    const avaliacoesAtualizadas = [...(serie.avaliacoesUsuarios || [])];
    const indiceExistente = avaliacoesAtualizadas.findIndex((av) => av.email === emailUsuario);

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

    const soma = avaliacoesAtualizadas.reduce((acc, av) => acc + av.nota, 0);
    const media = avaliacoesAtualizadas.length > 0 
      ? Number((soma / avaliacoesAtualizadas.length).toFixed(2))
      : 0;

    await this.salvarDadosSerie(idSerie, {
      userRatings: avaliacoesAtualizadas.map(av => ({
        user: av.usuario, email: av.email, rating: av.nota, comment: av.comentario || '',
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
    if (!serie) throw new Error('Série não encontrada');

    const avaliacoesAtualizadas = (serie.avaliacoesUsuarios || []).filter(
      (av) => av.email !== emailUsuario
    );

    const soma = avaliacoesAtualizadas.reduce((acc, av) => acc + av.nota, 0);
    const media = avaliacoesAtualizadas.length > 0 
      ? Number((soma / avaliacoesAtualizadas.length).toFixed(2))
      : 0;

    await this.salvarDadosSerie(idSerie, {
      userRatings: avaliacoesAtualizadas.map(av => ({
        user: av.usuario, email: av.email, rating: av.nota, comment: av.comentario || '',
      })),
      averageUserRating: media,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Converte temporadasEpisodios (PT) de volta para seasonEpisodes (EN) para persistência
   */
  private temporadasParaEN(temporadasEpisodios: any[]): any[] {
    return temporadasEpisodios.map(t => ({
      seasonNumber: t.numero,
      episodes: (t.episodios || []).map((ep: any) => ({
        episodeNumber: ep.numero,
        title: ep.titulo,
        synopsis: ep.sinopse || '',
        releaseDate: ep.dataLancamento || '',
        ratings: (ep.avaliacoesEpisodio || []).map((av: any) => ({
          user: av.usuario,
          email: av.email,
          rating: av.nota,
          comment: av.comentario || '',
          createdAt: av.criadoEm,
          updatedAt: av.atualizadoEm,
        })),
      })),
    }));
  }

  /**
   * Adiciona um episódio a uma série
   */
  async adicionarEpisodio(idSerie: string, numeroTemporada: number, episodio: Episodio): Promise<void> {
    const serie = await this.buscarPorId(idSerie);
    if (!serie) throw new Error('Série não encontrada');

    const temporadasEpisodios = [...(serie.temporadasEpisodios || [])];
    
    let temporada = temporadasEpisodios.find(t => t.numero === numeroTemporada);
    if (!temporada) {
      temporada = { numero: numeroTemporada, episodios: [] };
      temporadasEpisodios.push(temporada);
    }

    const indiceEpisodio = temporada.episodios.findIndex(e => e.numero === episodio.numero);
    if (indiceEpisodio > -1) {
      temporada.episodios[indiceEpisodio] = {
        ...episodio,
        avaliacoesEpisodio: temporada.episodios[indiceEpisodio].avaliacoesEpisodio || [],
      };
    } else {
      temporada.episodios.push(episodio);
    }

    temporada.episodios.sort((a, b) => a.numero - b.numero);

    await this.salvarDadosSerie(idSerie, {
      seasonEpisodes: this.temporadasParaEN(temporadasEpisodios),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Remove um episódio de uma série
   */
  async removerEpisodio(idSerie: string, numeroTemporada: number, numeroEpisodio: number): Promise<void> {
    const serie = await this.buscarPorId(idSerie);
    if (!serie) throw new Error('Série não encontrada');

    const temporadasEpisodios = [...(serie.temporadasEpisodios || [])];
    const indiceTemporada = temporadasEpisodios.findIndex(t => t.numero === numeroTemporada);
    if (indiceTemporada === -1) throw new Error('Temporada não encontrada');

    const temporada = temporadasEpisodios[indiceTemporada];
    temporada.episodios = temporada.episodios.filter(e => e.numero !== numeroEpisodio);

    if (temporada.episodios.length === 0) {
      temporadasEpisodios.splice(indiceTemporada, 1);
    }

    await this.salvarDadosSerie(idSerie, {
      seasonEpisodes: this.temporadasParaEN(temporadasEpisodios),
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
    if (!serie) throw new Error('Série não encontrada');

    const temporadasEpisodios = [...(serie.temporadasEpisodios || [])];
    const indiceTemporada = temporadasEpisodios.findIndex(t => t.numero === numeroTemporada);
    if (indiceTemporada === -1) throw new Error('Temporada não encontrada');

    const temporada = temporadasEpisodios[indiceTemporada];
    const episodio = temporada.episodios.find(e => e.numero === numeroEpisodio);
    if (!episodio) throw new Error('Episódio não encontrado');

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

    await this.salvarDadosSerie(idSerie, {
      seasonEpisodes: this.temporadasParaEN(temporadasEpisodios),
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
    if (!serie) throw new Error('Série não encontrada');

    const temporadasEpisodios = [...(serie.temporadasEpisodios || [])];
    const indiceTemporada = temporadasEpisodios.findIndex(t => t.numero === numeroTemporada);
    if (indiceTemporada === -1) throw new Error('Temporada não encontrada');

    const temporada = temporadasEpisodios[indiceTemporada];
    const episodio = temporada.episodios.find(e => e.numero === numeroEpisodio);
    if (!episodio) throw new Error('Episódio não encontrado');

    episodio.avaliacoesEpisodio = (episodio.avaliacoesEpisodio || []).filter(av => av.email !== emailUsuario);

    await this.salvarDadosSerie(idSerie, {
      seasonEpisodes: this.temporadasParaEN(temporadasEpisodios),
      updatedAt: new Date().toISOString(),
    });
  }
}

export default new SerieRepository();
