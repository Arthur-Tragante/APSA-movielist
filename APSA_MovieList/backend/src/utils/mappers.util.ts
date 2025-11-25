/**
 * Mapeadores para converter entre formato da aplicação (PT) e Firestore (EN)
 */

/**
 * Converte filme do Firestore (EN) para formato da aplicação (PT)
 */
export const filmeFirestoreParaApp = (doc: any): any => {
  return {
    id: doc.id,
    titulo: doc.title || '',
    genero: doc.genre || '',
    ano: doc.year || '',
    duracao: doc.duration || '',
    notaImdb: doc.imdbRating || 'N/A',
    metascore: doc.metascore || 'N/A',
    sinopse: doc.synopsis || '',
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
  };
};

/**
 * Converte filme da aplicação (PT) para Firestore (EN)
 */
export const filmeAppParaFirestore = (filme: any): any => {
  const firestoreData: any = {
    title: filme.titulo,
    genre: filme.genero,
    year: filme.ano,
    duration: filme.duracao,
    imdbRating: filme.notaImdb,
    metascore: filme.metascore,
    synopsis: filme.sinopse,
    ratings: (filme.avaliacoes || []).map((av: any) => ({
      Source: av.fonte,
      Value: av.valor,
    })),
    user: filme.usuario,
    watched: filme.assistido,
  };

  if (filme.avaliacoesUsuarios) {
    firestoreData.userRatings = filme.avaliacoesUsuarios.map((av: any) => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));
  }

  return firestoreData;
};

/**
 * Converte atualização parcial de filme da aplicação (PT) para Firestore (EN)
 */
export const atualizacaoFilmeParaFirestore = (dados: any): any => {
  const firestoreData: any = {};

  if (dados.titulo) firestoreData.title = dados.titulo;
  if (dados.genero) firestoreData.genre = dados.genero;
  if (dados.ano) firestoreData.year = dados.ano;
  if (dados.duracao) firestoreData.duration = dados.duracao;
  if (dados.notaImdb) firestoreData.imdbRating = dados.notaImdb;
  if (dados.metascore) firestoreData.metascore = dados.metascore;
  if (dados.sinopse) firestoreData.synopsis = dados.sinopse;
  if (dados.assistido !== undefined) firestoreData.watched = dados.assistido;
  
  if (dados.avaliacoes) {
    firestoreData.ratings = dados.avaliacoes.map((av: any) => ({
      Source: av.fonte,
      Value: av.valor,
    }));
  }

  if (dados.avaliacoesUsuarios) {
    firestoreData.userRatings = dados.avaliacoesUsuarios.map((av: any) => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));
  }

  return firestoreData;
};

/**
 * Converte série do Firestore (EN) para formato da aplicação (PT)
 */
export const serieFirestoreParaApp = (doc: any): any => {
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
        dateLançamento: ep.releaseDate || '',
        avaliações: (ep.ratings || []).map((av: any) => ({
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
 * Converte série da aplicação (PT) para Firestore (EN)
 */
export const serieAppParaFirestore = (serie: any): any => {
  const firestoreData: any = {
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
        releaseDate: ep.dateLançamento || '',
        ratings: (ep.avaliações || []).map((av: any) => ({
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
    firestoreData.userRatings = serie.avaliacoesUsuarios.map((av: any) => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));
  }

  return firestoreData;
};

/**
 * Converte atualização parcial de série da aplicação (PT) para Firestore (EN)
 */
export const atualizacaoSerieParaFirestore = (dados: any): any => {
  const firestoreData: any = {};

  if (dados.titulo) firestoreData.title = dados.titulo;
  if (dados.tituloOriginal) firestoreData.originalTitle = dados.tituloOriginal;
  if (dados.genero) firestoreData.genre = dados.genero;
  if (dados.ano) firestoreData.year = dados.ano;
  if (dados.temporadas) firestoreData.seasons = dados.temporadas;
  if (dados.notaImdb) firestoreData.imdbRating = dados.notaImdb;
  if (dados.metascore) firestoreData.metascore = dados.metascore;
  if (dados.sinopse) firestoreData.synopsis = dados.sinopse;
  if (dados.poster) firestoreData.poster = dados.poster;
  if (dados.assistido !== undefined) firestoreData.watched = dados.assistido;
  
  if (dados.avaliacoes) {
    firestoreData.ratings = dados.avaliacoes.map((av: any) => ({
      Source: av.fonte,
      Value: av.valor,
    }));
  }

  if (dados.temporadasEpisodios) {
    firestoreData.seasonEpisodes = dados.temporadasEpisodios.map((temp: any) => ({
      seasonNumber: temp.numero,
      episodes: (temp.episodios || []).map((ep: any) => ({
        episodeNumber: ep.numero,
        title: ep.titulo,
        synopsis: ep.sinopse || '',
        releaseDate: ep.dateLançamento || '',
        ratings: (ep.avaliações || []).map((av: any) => ({
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
    firestoreData.userRatings = dados.avaliacoesUsuarios.map((av: any) => ({
      user: av.usuario,
      email: av.email,
      rating: av.nota,
      comment: av.comentario || '',
    }));
  }

  return firestoreData;
};

