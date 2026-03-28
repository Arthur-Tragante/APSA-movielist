/**
 * Mapeadores para converter entre formato da aplicação (PT) e MongoDB (EN)
 */

/**
 * Converte filme do MongoDB (EN) para formato da aplicação (PT)
 */
export const filmeMongoParaApp = (doc: any): any => {
  // Calcula média das avaliações dos usuários
  const avaliacoesUsuarios = (doc.userRatings || []).map((ur: any) => ({
    usuario: ur.user || '',
    email: ur.email || ur.user || '',
    nota: ur.rating || 0,
    assistido: doc.watched || false,
    comentario: ur.comment || '',
  }));

  const notasValidas = avaliacoesUsuarios
    .map((av: any) => av.nota)
    .filter((nota: number) => nota > 0);
  
  const mediaAvaliacaoUsuarios = notasValidas.length > 0
    ? notasValidas.reduce((acc: number, nota: number) => acc + nota, 0) / notasValidas.length
    : undefined;

  return {
    id: doc.id,
    titulo: doc.title || '',
    genero: doc.genre || '',
    ano: doc.year || '',
    duracao: doc.duration || '',
    notaImdb: doc.imdbRating || 'N/A',
    metascore: doc.metascore || 'N/A',
    sinopse: doc.synopsis || '',
    poster: doc.poster || '',
    avaliacoes: (doc.ratings || []).map((r: any) => ({
      fonte: r.Source || '',
      valor: r.Value || '',
    })),
    usuario: doc.user || '',
    assistido: doc.watched || false,
    criadoEm: doc.createdAt,
    atualizadoEm: doc.updatedAt,
    avaliacoesUsuarios,
    mediaAvaliacaoUsuarios,
  };
};

/**
 * Converte filme da aplicação (PT) para MongoDB (EN)
 */
export const filmeAppParaMongo = (filme: any): any => {
  const mongoData: any = {
    title: filme.titulo,
    genre: filme.genero,
    year: filme.ano,
    duration: filme.duracao,
    imdbRating: filme.notaImdb,
    metascore: filme.metascore,
    synopsis: filme.sinopse,
    poster: filme.poster,
    ratings: (filme.avaliacoes || []).map((av: any) => ({
      Source: av.fonte,
      Value: av.valor,
    })),
    user: filme.usuario,
    watched: filme.assistido,
  };

  if (filme.avaliacoesUsuarios) {
    mongoData.userRatings = filme.avaliacoesUsuarios.map((av: any) => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));
  }

  return mongoData;
};

/**
 * Converte atualização parcial de filme da aplicação (PT) para MongoDB (EN)
 */
export const atualizacaoFilmeParaMongo = (dados: any): any => {
  const mongoData: any = {};

  if (dados.titulo !== undefined) mongoData.title = dados.titulo;
  if (dados.genero !== undefined) mongoData.genre = dados.genero;
  if (dados.ano !== undefined) mongoData.year = dados.ano;
  if (dados.duracao !== undefined) mongoData.duration = dados.duracao;
  if (dados.notaImdb !== undefined) mongoData.imdbRating = dados.notaImdb;
  if (dados.metascore !== undefined) mongoData.metascore = dados.metascore;
  if (dados.sinopse !== undefined) mongoData.synopsis = dados.sinopse;
  if (dados.assistido !== undefined) mongoData.watched = dados.assistido;

  if (dados.avaliacoes) {
    mongoData.ratings = dados.avaliacoes.map((av: any) => ({
      Source: av.fonte,
      Value: av.valor,
    }));
  }

  if (dados.avaliacoesUsuarios) {
    mongoData.userRatings = dados.avaliacoesUsuarios.map((av: any) => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));
  }

  return mongoData;
};

/**
 * Converte série do MongoDB (EN) para formato da aplicação (PT)
 */
export const serieMongoParaApp = (doc: any): any => {
  return {
    id: doc.id,
    titulo: doc.title || '',
    tituloOriginal: doc.originalTitle || '',
    genero: doc.genre || '',
    ano: doc.year || '',
    temporadas: doc.seasons || '',
    notaImdb: doc.imdbRating || 'N/A',
    metascore: doc.metascore || 'N/A',
    sinopse: doc.synopsis || '',
    poster: doc.poster || '',
    avaliacoes: (doc.ratings || []).map((r: any) => ({
      fonte: r.Source || '',
      valor: r.Value || '',
    })),
    usuario: doc.user || '',
    assistido: doc.watched || false,
    criadoEm: doc.createdAt,
    atualizadoEm: doc.updatedAt,
    avaliacoesUsuarios: (doc.userRatings || []).map((ur: any) => ({
      usuario: ur.user || '',
      email: ur.email || ur.user || '',
      nota: ur.rating || 0,
      assistido: doc.watched || false,
      comentario: ur.comment || '',
    })),
    temporadasEpisodios: (doc.seasonEpisodes || []).map((temp: any) => ({
      numero: temp.seasonNumber,
      episodios: (temp.episodes || []).map((ep: any) => ({
        numero: ep.episodeNumber,
        titulo: ep.title,
        sinopse: ep.synopsis || '',
        dataLancamento: ep.releaseDate || '',
        avaliacoesEpisodio: (ep.ratings || []).map((av: any) => ({
          usuario: av.user,
          email: av.email,
          nota: av.rating,
          comentario: av.comment || '',
          criadoEm: av.createdAt,
          atualizadoEm: av.updatedAt,
        })),
      })),
    })),
  };
};

/**
 * Converte série da aplicação (PT) para MongoDB (EN)
 */
export const serieAppParaMongo = (serie: any): any => {
  const mongoData: any = {
    title: serie.titulo,
    originalTitle: serie.tituloOriginal || '',
    genre: serie.genero,
    year: serie.ano,
    seasons: serie.temporadas,
    imdbRating: serie.notaImdb,
    metascore: serie.metascore,
    synopsis: serie.sinopse,
    poster: serie.poster || '',
    ratings: (serie.avaliacoes || []).map((av: any) => ({
      Source: av.fonte,
      Value: av.valor,
    })),
    user: serie.usuario,
    watched: serie.assistido,
    seasonEpisodes: (serie.temporadasEpisodios || []).map((temp: any) => ({
      seasonNumber: temp.numero,
      episodes: (temp.episodios || []).map((ep: any) => ({
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
    })),
  };

  if (serie.avaliacoesUsuarios) {
    mongoData.userRatings = serie.avaliacoesUsuarios.map((av: any) => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));
  }

  return mongoData;
};

/**
 * Converte atualização parcial de série da aplicação (PT) para MongoDB (EN)
 */
export const atualizacaoSerieParaMongo = (dados: any): any => {
  const mongoData: any = {};

  if (dados.titulo !== undefined) mongoData.title = dados.titulo;
  if (dados.tituloOriginal !== undefined) mongoData.originalTitle = dados.tituloOriginal;
  if (dados.genero !== undefined) mongoData.genre = dados.genero;
  if (dados.ano !== undefined) mongoData.year = dados.ano;
  if (dados.temporadas !== undefined) mongoData.seasons = dados.temporadas;
  if (dados.notaImdb !== undefined) mongoData.imdbRating = dados.notaImdb;
  if (dados.metascore !== undefined) mongoData.metascore = dados.metascore;
  if (dados.sinopse !== undefined) mongoData.synopsis = dados.sinopse;
  if (dados.poster !== undefined) mongoData.poster = dados.poster;
  if (dados.assistido !== undefined) mongoData.watched = dados.assistido;
  
  if (dados.avaliacoes) {
    mongoData.ratings = dados.avaliacoes.map((av: any) => ({
      Source: av.fonte,
      Value: av.valor,
    }));
  }

  if (dados.temporadasEpisodios) {
    mongoData.seasonEpisodes = dados.temporadasEpisodios.map((temp: any) => ({
      seasonNumber: temp.numero,
      episodes: (temp.episodios || []).map((ep: any) => ({
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

  if (dados.avaliacoesUsuarios) {
    mongoData.userRatings = dados.avaliacoesUsuarios.map((av: any) => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));
  }

  return mongoData;
};

