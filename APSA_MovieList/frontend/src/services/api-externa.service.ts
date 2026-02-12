import apiClient from './api.client';
import { ResultadoFilmeTMDB, DetalhesFilmeTMDB, ResultadoSerieTMDB, DetalhesSerieTMDB } from '../types';

/**
 * Service para integração com APIs externas através do backend
 * 
 * SEGURANÇA: As chaves de API ficam no backend, não expostas no frontend
 */
class ApiExternaService {
  /**
   * Busca filmes no TMDB por título (via backend)
   */
  async buscarFilmesPorTitulo(titulo: string): Promise<ResultadoFilmeTMDB[]> {
    if (!titulo) return [];

    try {
      const response = await apiClient.get('/buscar/filme', {
        params: { titulo },
      });

      return response.data.dados || [];
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      return [];
    }
  }

  /**
   * Busca detalhes de um filme no TMDB por ID (via backend)
   */
  async buscarDetalhesFilmeTMDB(
    id: string,
    idioma: 'pt-BR' | 'en-US' = 'pt-BR'
  ): Promise<DetalhesFilmeTMDB | null> {
    if (!id) return null;

    try {
      const response = await apiClient.get(`/buscar/detalhes/${id}`, {
        params: { idioma },
      });

      return response.data.dados || null;
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      return null;
    }
  }

  /**
   * Busca ratings de um filme no OMDB por IMDb ID (via backend)
   */
  async buscarRatingsOMDB(imdbId: string) {
    if (!imdbId) return null;

    try {
      const response = await apiClient.get(`/buscar/ratings/${imdbId}`);
      return response.data.dados || null;
    } catch (error) {
      console.error('Erro ao buscar ratings:', error);
      return null;
    }
  }

  /**
   * Busca informações completas de um filme combinando TMDB e OMDB (via backend)
   */
  async buscarInformacoesCompletas(idTMDB: string) {
    try {
      const [detalhesPt, detalhesEn] = await Promise.all([
        this.buscarDetalhesFilmeTMDB(idTMDB, 'pt-BR'),
        this.buscarDetalhesFilmeTMDB(idTMDB, 'en-US'),
      ]);

      if (!detalhesPt || !detalhesEn) {
        return null;
      }

      // Busca ratings do OMDB se houver IMDb ID
      let ratingsData = null;
      if (detalhesEn.imdb_id) {
        ratingsData = await this.buscarRatingsOMDB(detalhesEn.imdb_id);
      }

      return {
        tituloPt: detalhesPt.title,
        tituloEn: detalhesEn.title,
        duracao: detalhesEn.runtime,
        generos: detalhesPt.genres?.map((g: any) => g.name).join(', ') || '',
        ano: detalhesPt.release_date?.split('-')[0] || '',
        sinopse: detalhesPt.overview || '',
        avaliacoes: ratingsData?.avaliacoes || [],
        notaImdb: ratingsData?.notaImdb || 'N/A',
        votosImdb: ratingsData?.votosImdb || 'N/A',
        metascore: ratingsData?.metascore || 'N/A',
      };
    } catch (error) {
      console.error('Erro ao buscar informações completas:', error);
      return null;
    }
  }

  /**
   * Busca séries no TMDB por título (via backend)
   */
  async buscarSeriesPorTitulo(titulo: string): Promise<ResultadoSerieTMDB[]> {
    if (!titulo) return [];

    try {
      const response = await apiClient.get('/buscar/serie', {
        params: { titulo },
      });

      return response.data.dados || [];
    } catch (error) {
      console.error('Erro ao buscar séries:', error);
      return [];
    }
  }

  /**
   * Busca detalhes de uma série no TMDB por ID (via backend)
   */
  async buscarDetalhesSerieTMDB(
    id: string,
    idioma: 'pt-BR' | 'en-US' = 'pt-BR'
  ): Promise<DetalhesSerieTMDB | null> {
    try {
      const response = await apiClient.get(`/buscar/serie/detalhes/${id}`, {
        params: { idioma },
      });

      return response.data.dados || null;
    } catch (error) {
      console.error('Erro ao buscar detalhes da série:', error);
      return null;
    }
  }

  /**
   * Busca informações completas de uma série combinando TMDB e OMDB (via backend)
   */
  async buscarInformacoesCompletasSerie(idTMDB: string) {
    try {
      const [detalhesPt, detalhesEn] = await Promise.all([
        this.buscarDetalhesSerieTMDB(idTMDB, 'pt-BR'),
        this.buscarDetalhesSerieTMDB(idTMDB, 'en-US'),
      ]);

      if (!detalhesPt || !detalhesEn) {
        return null;
      }

      // Busca ratings do OMDB se houver IMDb ID
      let ratingsData = null;
      const imdbId = detalhesEn.external_ids?.imdb_id;
      if (imdbId) {
        ratingsData = await this.buscarRatingsOMDB(imdbId);
      }

      return {
        tituloPt: detalhesPt.name,
        tituloEn: detalhesEn.name,
        temporadas: detalhesPt.number_of_seasons,
        generos: detalhesPt.genres?.map((g: any) => g.name).join(', ') || '',
        ano: detalhesPt.first_air_date?.split('-')[0] || '',
        sinopse: detalhesPt.overview || '',
        avaliacoes: ratingsData?.avaliacoes || [],
        notaImdb: ratingsData?.notaImdb || 'N/A',
        votosImdb: ratingsData?.votosImdb || 'N/A',
        metascore: ratingsData?.metascore || 'N/A',
      };
    } catch (error) {
      console.error('Erro ao buscar informações completas da série:', error);
      return null;
    }
  }
}

export default new ApiExternaService();

