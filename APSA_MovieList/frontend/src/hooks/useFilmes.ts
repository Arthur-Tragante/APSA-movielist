import { useState, useEffect, useCallback } from 'react';
import { filmeService } from '../services';
import { Filme } from '../types';
import { MENSAGENS_ERRO } from '../constants';

/**
 * Hook customizado para gerenciamento de filmes
 */
export const useFilmes = () => {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscarTodos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const filmesData = await filmeService.buscarTodos();
      setFilmes(filmesData);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      setErro(MENSAGENS_ERRO.ERRO_BUSCAR_FILME);
    } finally {
      setCarregando(false);
    }
  }, []);

  const buscarPorId = useCallback(async (id: string): Promise<Filme | null> => {
    try {
      setCarregando(true);
      setErro(null);
      const filme = await filmeService.buscarPorId(id);
      return filme;
    } catch (error) {
      console.error('Erro ao buscar filme:', error);
      setErro(MENSAGENS_ERRO.ERRO_BUSCAR_FILME);
      return null;
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarTodos();
  }, [buscarTodos]);

  return {
    filmes,
    buscarTodos,
    buscarPorId,
    carregando,
    erro,
  };
};

