import { useState } from 'react';
import { apiExternaService } from '../services';
import { ResultadoFilmeTMDB } from '../types';

/**
 * Hook customizado para buscar informações de filmes em APIs externas
 */
export const useApiExterna = () => {
  const [resultados, setResultados] = useState<ResultadoFilmeTMDB[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscarPorTitulo = async (titulo: string) => {
    if (!titulo) {
      setResultados([]);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const resultadosBusca = await apiExternaService.buscarFilmesPorTitulo(titulo);
      setResultados(resultadosBusca);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      setErro('Erro ao buscar filmes');
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  };

  const buscarInformacoesCompletas = async (idTMDB: string) => {
    setCarregando(true);
    setErro(null);

    try {
      const info = await apiExternaService.buscarInformacoesCompletas(idTMDB);
      return info;
    } catch (error) {
      console.error('Erro ao buscar informações completas:', error);
      setErro('Erro ao buscar informações do filme');
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const limparResultados = () => {
    setResultados([]);
  };

  return {
    resultados,
    buscarPorTitulo,
    buscarInformacoesCompletas,
    limparResultados,
    carregando,
    erro,
  };
};

