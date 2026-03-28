/**
 * Repository de séries - gerencia interação com a API Backend
 */

import apiClient from '../services/api.client';
import { ShowCadastro, Show, ShowEdicao } from '../types';

const BASE_URL = '/series';

/**
 * Cria uma nova série
 */
export const criar = async (show: ShowCadastro): Promise<string> => {
  const response = await apiClient.post(BASE_URL, show);
  return response.data.dados.id || response.data.dados._id;
};

/**
 * Busca todas as séries
 */
export const buscarTodos = async (): Promise<Show[]> => {
  const response = await apiClient.get(BASE_URL);
  return response.data.dados || [];
};

/**
 * Busca série por ID
 */
export const buscarPorId = async (id: string): Promise<Show | null> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data.dados || null;
  } catch (error) {
    return null;
  }
};

/**
 * Atualiza série existente
 */
export const atualizar = async (id: string, show: Partial<ShowEdicao>): Promise<void> => {
  await apiClient.put(`${BASE_URL}/${id}`, show);
};

/**
 * Deleta série
 */
export const deletar = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};

export default {
  criar,
  buscarTodos,
  buscarPorId,
  atualizar,
  deletar,
};

