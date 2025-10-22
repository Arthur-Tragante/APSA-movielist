/**
 * Hook para gerenciar estado de séries
 */

import { useState, useEffect, useCallback } from 'react';
import { Show } from '../types';
import { showService } from '../services';

export const useShows = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarShows();
  }, []);

  const carregarShows = async () => {
    try {
      setCarregando(true);
      const dados = await showService.buscarTodos();
      setShows(dados);
    } catch (erro) {
      console.error('Erro ao buscar séries:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const buscarPorId = useCallback(async (id: string): Promise<Show | null> => {
    try {
      return await showService.buscarPorId(id);
    } catch (erro) {
      console.error('Erro ao buscar série:', erro);
      return null;
    }
  }, []);

  return {
    shows,
    carregando,
    recarregar: carregarShows,
    buscarPorId,
  };
};



