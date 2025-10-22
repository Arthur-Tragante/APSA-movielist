/**
 * Service de séries - lógica de negócio
 */

import * as showRepository from '../repositories/show.repository';
import { ShowCadastro, Show, ShowEdicao, AvaliacaoUsuarioShow } from '../types';
import { firestore } from '../config/firebase.config';

/**
 * Cria uma nova série
 */
export const criar = async (show: ShowCadastro): Promise<string> => {
  return await showRepository.criar(show);
};

/**
 * Busca todas as séries
 */
export const buscarTodos = async (): Promise<Show[]> => {
  return await showRepository.buscarTodos();
};

/**
 * Busca série por ID
 */
export const buscarPorId = async (id: string): Promise<Show | null> => {
  return await showRepository.buscarPorId(id);
};

/**
 * Atualiza série existente
 */
export const atualizar = async (id: string, show: Partial<ShowEdicao>): Promise<void> => {
  await showRepository.atualizar(id, show);
};

/**
 * Deleta série
 */
export const deletar = async (id: string): Promise<void> => {
  await showRepository.deletar(id);
};

/**
 * Atualiza avaliação de usuário
 */
const atualizarAvaliacaoUsuario = async (
  idShow: string,
  emailUsuario: string,
  nomeUsuario: string,
  nota: number,
  assistido: boolean,
  comentario?: string
): Promise<void> => {
  const showRef = firestore.collection('shows').doc(idShow);
  const showDoc = await showRef.get();

  if (!showDoc.exists) {
    throw new Error('Série não encontrada');
  }

  const showData = showDoc.data();
  let userRatings = showData?.userRatings || [];

  const indiceExistente = userRatings.findIndex(
    (av: any) => av.email === emailUsuario || av.user === nomeUsuario
  );

  const novaAvaliacao: AvaliacaoUsuarioShow = {
    user: nomeUsuario,
    email: emailUsuario,
    rating: nota,
    comment: comentario || '',
  };

  if (indiceExistente >= 0) {
    userRatings[indiceExistente] = novaAvaliacao;
  } else {
    userRatings.push(novaAvaliacao);
  }

  const soma = userRatings.reduce((acc: number, av: any) => acc + (av.rating || 0), 0);
  const media = userRatings.length > 0 ? Math.round((soma / userRatings.length) * 10) / 10 : 0;

  await showRef.update({
    userRatings,
    averageUserRating: media,
    watched: assistido,
    updatedAt: new Date().toISOString(),
  });
};

export default {
  criar,
  buscarTodos,
  buscarPorId,
  atualizar,
  deletar,
  atualizarAvaliacaoUsuario,
};

