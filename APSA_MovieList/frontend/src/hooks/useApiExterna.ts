import { useState, useCallback, useRef } from 'react';
import { apiExternaService } from '../services';
import { ResultadoFilmeTMDB } from '../types';

/**
 * Hook customizado para buscar informações de filmes em APIs externas
 */
export const useApiExterna = () => {
  const [resultados, setResultados] = useState<ResultadoFilmeTMDB[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const buscarPorTitulo = useCallback(async (titulo: string) => {
    // Limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!titulo || titulo.length < 2) {
      setResultados([]);
      setErro(null);
      return;
    }

    setCarregando(true);
    setErro(null);

    // Debounce de 500ms
    timeoutRef.current = setTimeout(async () => {
      try {
        const resultadosBusca = await apiExternaService.buscarFilmesPorTitulo(titulo);
        setResultados(resultadosBusca);
        setErro(null);
      } catch (error: any) {
        console.error('Erro ao buscar filmes:', error);
        
        // Tratamento específico para rate limit
        if (error.response?.status === 429) {
          setErro('Muitas buscas. Aguarde alguns segundos...');
        } else if (error.message === 'Network Error') {
          setErro('Erro de conexão. Verifique o backend.');
        } else {
          setErro('Erro ao buscar filmes. Tente novamente.');
        }
        setResultados([]);
      } finally {
        setCarregando(false);
      }
    }, 500);
  }, []);

  const buscarInformacoesCompletas = async (idTMDB: string) => {
    setCarregando(true);
    setErro(null);

    try {
      const info = await apiExternaService.buscarInformacoesCompletas(idTMDB);
      return info;
    } catch (error: any) {
      console.error('Erro ao buscar informações completas:', error);
      
      // Tratamento específico para rate limit
      if (error.response?.status === 429) {
        setErro('Muitas requisições. Aguarde alguns segundos...');
      } else if (error.message === 'Network Error') {
        setErro('Erro de conexão. Verifique o backend.');
      } else {
        setErro('Erro ao buscar informações do filme');
      }
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const limparResultados = () => {
    setResultados([]);
    setErro(null);
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

