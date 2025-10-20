/**
 * Mapeadores para converter entre o formato do código (PT) e Firestore (EN)
 */

import { Filme, FilmeCadastro } from '../types';

/**
 * Converte filme do Firestore (EN) para o formato da aplicação (PT)
 */
export const filmeFirestoreParaApp = (doc: any): Filme => {
  console.log('🎬 Convertendo filme do Firestore:', doc.title || doc.id);
  console.log('   userRatings:', doc.userRatings);
  console.log('   averageUserRating:', doc.averageUserRating);
  
  // Usa a média do banco se existir, senão calcula localmente
  const mediaCalculada = doc.averageUserRating !== undefined 
    ? doc.averageUserRating 
    : calcularMediaAvaliacoes(doc.userRatings || []);
  
  console.log('   Média final:', mediaCalculada);
  
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
    avaliacoesUsuarios: (doc.userRatings || []).map((ur: any) => ({
      usuario: ur.user || '',
      email: ur.email || ur.user || '',
      nota: typeof ur.rating === 'string' ? parseFloat(ur.rating) : (ur.rating || 0),
      assistido: doc.watched || false,
      comentario: ur.comment || '',
    })),
    mediaAvaliacaoUsuarios: mediaCalculada,
  };
};

/**
 * Converte filme da aplicação (PT) para Firestore (EN)
 */
export const filmeAppParaFirestore = (filme: FilmeCadastro): any => {
  return {
    title: filme.titulo,
    genre: filme.genero,
    year: filme.ano,
    duration: filme.duracao,
    imdbRating: filme.notaImdb,
    metascore: filme.metascore,
    synopsis: filme.sinopse,
    poster: filme.poster || '',
    ratings: filme.avaliacoes.map((av) => ({
      Source: av.fonte,
      Value: av.valor,
    })),
    user: filme.usuario,
    watched: filme.assistido,
  };
};

/**
 * Converte usuário do Firestore (EN) para a aplicação (PT)
 */
export const usuarioFirestoreParaApp = (doc: any): any => {
  const nome = doc.name || doc.nome || doc.email?.split('@')[0] || 'Usuário';
  
  return {
    id: doc.id,
    nome,
    email: doc.email || '',
  };
};

/**
 * Converte usuário da aplicação (PT) para Firestore (EN)
 */
export const usuarioAppParaFirestore = (usuario: any): any => {
  return {
    name: usuario.nome,
    email: usuario.email,
  };
};

/**
 * Calcula média de avaliações
 */
const calcularMediaAvaliacoes = (avaliacoes: any[]): number => {
  if (!avaliacoes || avaliacoes.length === 0) {
    console.log('📊 Sem avaliações para calcular média');
    return 0;
  }
  
  console.log('📊 Calculando média de', avaliacoes.length, 'avaliações:', avaliacoes);
  
  const soma = avaliacoes.reduce((acc, av) => {
    // Converte string para número se necessário
    const rating = typeof av.rating === 'string' ? parseFloat(av.rating) : (av.rating || 0);
    console.log('  - Avaliação:', av.user || av.email, '→', rating, `(tipo: ${typeof av.rating})`);
    return acc + rating;
  }, 0);
  
  const media = Math.round((soma / avaliacoes.length) * 10) / 10;
  console.log('📊 Média calculada:', media, '(soma:', soma, '/ total:', avaliacoes.length, ')');
  
  return media;
};

