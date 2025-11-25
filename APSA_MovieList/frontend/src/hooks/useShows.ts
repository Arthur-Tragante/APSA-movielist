/**
 * Hook para gerenciar estado de séries
 */

import { useState, useEffect, useCallback } from 'react';
import { Show } from '../types';
import { showService } from '../services';

export const useShows = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarShows = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await showService.buscarTodos();
      setShows(dados);
    } catch (erro: any) {
      console.error('Erro ao buscar séries:', erro);
      setErro(erro.message || 'Erro ao buscar séries');
      setShows([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Carrega apenas uma vez na montagem do componente
  useEffect(() => {
    carregarShows();
  }, [carregarShows]);

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
    erro,
    recarregar: carregarShows,
    buscarPorId,
  };
};







