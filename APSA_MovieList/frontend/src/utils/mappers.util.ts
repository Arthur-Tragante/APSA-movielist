/**
 * Mapeadores para converter entre o formato do código (PT) e Firestore (EN)
 */

import { Filme, FilmeCadastro } from '../types';

/**
 * Converte filme do Firestore (EN) para o formato da aplicação (PT)
 */
export const filmeFirestoreParaApp = (doc: any): Filme => {
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
    avaliacoesUsuarios: (doc.userRatings || []).map((ur: any) => ({
      usuario: ur.user || '',
      email: ur.email || ur.user || '',
      nota: ur.rating || 0,
      assistido: doc.watched || false,
      comentario: ur.comment || '',
    })),
    mediaAvaliacaoUsuarios: calcularMediaAvaliacoes(doc.userRatings || []),
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
  console.log('🔍 Documento do Firestore (usuário):', doc);
  
  const nome = doc.name || doc.nome || doc.email?.split('@')[0] || 'Usuário';
  console.log('📝 Nome mapeado:', nome);
  
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
  if (!avaliacoes || avaliacoes.length === 0) return 0;
  
  const soma = avaliacoes.reduce((acc, av) => acc + (av.rating || 0), 0);
  return Math.round((soma / avaliacoes.length) * 10) / 10;
};

