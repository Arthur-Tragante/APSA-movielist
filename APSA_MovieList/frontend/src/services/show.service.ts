/**
 * Service de séries - lógica de negócio
 * Comunicação com backend API para persistência em Firebase
 */

import apiClient from './api.client';
import showRepository from '../repositories/show.repository';
import { ShowCadastro, Show, ShowEdicao, Episodio } from '../types';

/**
 * Cria uma nova série via API do backend
 */
export const criar = async (show: ShowCadastro): Promise<string> => {
  try {
    const response = await apiClient.post('/series', {
      titulo: show.titulo,
      tituloOriginal: show.titulo,
      ano: show.ano,
      temporadas: show.temporadas,
      genero: show.genero,
      sinopse: show.sinopse,
      poster: show.poster,
      notaImdb: show.notaImdb,
      votosImdb: 'N/A',
      metascore: show.metascore,
      avaliacoes: show.avaliacoes || [],
      assistido: show.assistido,
      temporadasEpisodios: show.temporadasEpisodios || [],
    });

    return response.data.dados.id;
  } catch (error) {
    console.error('Erro ao criar série:', error);
    throw error;
  }
};

/**
 * Busca todas as séries do usuário via API do backend
 */
export const buscarTodos = async (): Promise<Show[]> => {
  try {
    const response = await apiClient.get('/series');
    return response.data.dados || [];
  } catch (error) {
    console.error('Erro ao buscar séries:', error);
    return [];
  }
};

/**
 * Busca série por ID via API do backend
 */
export const buscarPorId = async (id: string): Promise<Show | null> => {
  try {
    const response = await apiClient.get(`/series/${id}`);
    return response.data.dados || null;
  } catch (error) {
    console.error('Erro ao buscar série:', error);
    return null;
  }
};

/**
 * Atualiza série existente via API do backend
 */
export const atualizar = async (id: string, show: Partial<ShowEdicao>): Promise<void> => {
  try {
    await apiClient.put(`/series/${id}`, show);
  } catch (error) {
    console.error('Erro ao atualizar série:', error);
    throw error;
  }
};

/**
 * Deleta série via API do backend
 */
export const deletar = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/series/${id}`);
  } catch (error) {
    console.error('Erro ao deletar série:', error);
    throw error;
  }
};

/**
 * Atualiza avaliação de usuário via API do backend
 */
export const atualizarAvaliacaoUsuario = async (
  idShow: string,
  emailUsuario: string,
  nomeUsuario: string,
  nota: number,
  comentario?: string
): Promise<void> => {
  try {
    const show = await showRepository.buscarPorId(idShow);

    if (!show) {
      throw new Error('Série não encontrada');
    }

    const avaliacoesAtualizadas = [...(show.avaliacoesUsuarios || [])];
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
        assistido: show.assistido,
        comentario,
      });
    }

    await showRepository.atualizar(idShow, {
      avaliacoesUsuarios: avaliacoesAtualizadas,
    });
  } catch (error) {
    console.error('Erro ao avaliar série:', error);
    throw error;
  }
};

/**
 * Remove avaliação de usuário via API do backend
 */
const removerAvaliacao = async (idShow: string): Promise<void> => {
  try {
    await apiClient.delete(`/series/${idShow}/avaliar`);
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    throw error;
  }
};

/**
 * Adiciona um episódio a uma série
 */
export const adicionarEpisodio = async (
  idShow: string,
  numeroTemporada: number,
  episodio: Episodio
): Promise<void> => {
  try {
    await apiClient.post(`/series/${idShow}/episodios`, {
      numeroTemporada,
      episodio,
    });
  } catch (error) {
    console.error('Erro ao adicionar episódio:', error);
    throw error;
  }
};

/**
 * Remove um episódio de uma série
 */
export const removerEpisodio = async (
  idShow: string,
  numeroTemporada: number,
  numeroEpisodio: number
): Promise<void> => {
  try {
    await apiClient.delete(`/series/${idShow}/episodios/${numeroTemporada}/${numeroEpisodio}`);
  } catch (error) {
    console.error('Erro ao remover episódio:', error);
    throw error;
  }
};

/**
 * Avalia um episódio
 */
export const avaliarEpisodio = async (
  idShow: string,
  numeroTemporada: number,
  numeroEpisodio: number,
  nota: number,
  comentario?: string
): Promise<void> => {
  try {
    await apiClient.post(
      `/series/${idShow}/episodios/${numeroTemporada}/${numeroEpisodio}/avaliar`,
      {
        nota,
        comentario: comentario || '',
      }
    );
  } catch (error) {
    console.error('Erro ao avaliar episódio:', error);
    throw error;
  }
};

/**
 * Remove avaliação de um episódio
 */
export const removerAvaliacaoEpisodio = async (
  idShow: string,
  numeroTemporada: number,
  numeroEpisodio: number
): Promise<void> => {
  try {
    await apiClient.delete(`/series/${idShow}/episodios/${numeroTemporada}/${numeroEpisodio}/avaliar`);
  } catch (error) {
    console.error('Erro ao remover avaliação do episódio:', error);
    throw error;
  }
};

export default {
  criar,
  buscarTodos,
  buscarPorId,
  atualizar,
  deletar,
  atualizarAvaliacaoUsuario,
  removerAvaliacao,
  adicionarEpisodio,
  removerEpisodio,
  avaliarEpisodio,
  removerAvaliacaoEpisodio,
};

