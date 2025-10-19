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

