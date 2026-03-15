import axios from 'axios';
import { env } from '../config/env.config';
import { API_URLS, CACHE_PREFIXES } from '../constants/api.constants';
import { MENSAGENS_ERRO } from '../constants/mensagens.constants';
import {
  ResultadoBusca,
  DetalhesFilme,
  RespostaOMDB,
} from '../types';
import cacheService from './cache.service';

/**
 * Service para integração com APIs externas (TMDB e OMDB)
 */
class ApiExternaService {
  /**
   * Busca filmes no TMDB
   */
  async buscarFilme(titulo: string): Promise<ResultadoBusca[]> {
    const chaveCache = `${CACHE_PREFIXES.TMDB_SEARCH}${titulo.toLowerCase()}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    try {
      const resposta = await axios.get(API_URLS.TMDB_SEARCH, {
        params: {
          query: titulo,
          language: 'pt-BR',
          include_adult: false,
        },
        headers: {
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      // Retorna os resultados no formato original do TMDB (compatível com frontend)
      const resultados = resposta.data.results.slice(0, 10);

      // Salva no cache
      await cacheService.definir(
        chaveCache,
        JSON.stringify(resultados),
        env.CACHE_TTL_TMDB
      );

      return resultados;
    } catch (erro) {
      console.error('Erro ao buscar filme no TMDB:', erro);
      throw new Error(MENSAGENS_ERRO.ERRO_BUSCAR_TMDB);
    }
  }

  /**
   * Busca detalhes de um filme específico no TMDB
   */
  async buscarDetalhesFilme(idTmdb: number, idioma: string = 'pt-BR'): Promise<DetalhesFilme | null> {
    const chaveCache = `${CACHE_PREFIXES.TMDB_MOVIE}${idTmdb}_${idioma}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    try {
      const resposta = await axios.get(`${API_URLS.TMDB_MOVIE_DETAILS}/${idTmdb}`, {
        params: {
          language: idioma,
        },
        headers: {
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      // Retorna os dados no formato original do TMDB (compatível com frontend)
      const filme = resposta.data;

      // Salva no cache
      await cacheService.definir(
        chaveCache,
        JSON.stringify(filme),
        env.CACHE_TTL_TMDB
      );

      return filme;
    } catch (erro) {
      console.error('Erro ao buscar detalhes do filme:', erro);
      return null;
    }
  }

  /**
   * Busca ratings no OMDB
   */
  async buscarRatings(imdbId: string): Promise<{
    notaImdb: string;
    votosImdb: string;
    metascore: string;
    avaliacoes: Array<{ fonte: string; valor: string }>;
  }> {
    const chaveCache = `${CACHE_PREFIXES.OMDB_RATINGS}${imdbId}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    try {
      const resposta = await axios.get(API_URLS.OMDB_BASE, {
        params: {
          apikey: env.OMDB_API_KEY,
          i: imdbId,
        },
      });

      const dados: RespostaOMDB = resposta.data;

      if (dados.Response === 'False') {
        throw new Error('Filme não encontrado no OMDB');
      }

      const ratings = {
        notaImdb: dados.imdbRating || 'N/A',
        votosImdb: dados.imdbVotes || 'N/A',
        metascore: dados.Metascore || 'N/A',
        avaliacoes: dados.Ratings
          ? dados.Ratings.map((r) => ({
              fonte: r.Source,
              valor: r.Value,
            }))
          : [],
      };

      // Salva no cache
      await cacheService.definir(
        chaveCache,
        JSON.stringify(ratings),
        env.CACHE_TTL_OMDB
      );

      return ratings;
    } catch (erro) {
      console.error('Erro ao buscar ratings no OMDB:', erro);
      return {
        notaImdb: 'N/A',
        votosImdb: 'N/A',
        metascore: 'N/A',
        avaliacoes: [],
      };
    }
  }

  /**
   * Busca séries no TMDB
   */
  async buscarSerie(titulo: string): Promise<ResultadoBusca[]> {
    const chaveCache = `${CACHE_PREFIXES.TMDB_SEARCH_SERIES}${titulo.toLowerCase()}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    try {
      const resposta = await axios.get(API_URLS.TMDB_SEARCH_SERIES, {
        params: {
          query: titulo,
          language: 'pt-BR',
          include_adult: false,
        },
        headers: {
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      // Retorna os resultados no formato original do TMDB (compatível com frontend)
      const resultados = resposta.data.results.slice(0, 10);

      // Salva no cache
      await cacheService.definir(
        chaveCache,
        JSON.stringify(resultados),
        env.CACHE_TTL_TMDB
      );

      return resultados;
    } catch (erro) {
      console.error('Erro ao buscar série no TMDB:', erro);
      throw new Error(MENSAGENS_ERRO.ERRO_BUSCAR_TMDB);
    }
  }

  /**
   * Busca detalhes de uma série específica no TMDB
   */
  async buscarDetalhesSerie(idTmdb: number, idioma: string = 'pt-BR'): Promise<DetalhesFilme | null> {
    const chaveCache = `${CACHE_PREFIXES.TMDB_SERIES}${idTmdb}_${idioma}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    try {
      const resposta = await axios.get(`${API_URLS.TMDB_SERIES_DETAILS}/${idTmdb}`, {
        params: {
          language: idioma,
          append_to_response: 'external_ids',
        },
        headers: {
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      // Retorna os dados no formato original do TMDB (compatível com frontend)
      const serie = resposta.data;

      // Salva no cache
      await cacheService.definir(
        chaveCache,
        JSON.stringify(serie),
        env.CACHE_TTL_TMDB
      );

      return serie;
    } catch (erro) {
      console.error('Erro ao buscar detalhes da série:', erro);
      return null;
    }
  }
  /**
   * Busca episódios de uma temporada de uma série no TMDB
   */
  async buscarEpisodiosTemporada(idTmdb: number, numeroTemporada: number, idioma: string = 'pt-BR'): Promise<any> {
    const chaveCache = `${CACHE_PREFIXES.TMDB_SEASON}${idTmdb}_${numeroTemporada}_${idioma}`;

    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    try {
      const resposta = await axios.get(
        `${API_URLS.TMDB_SEASON_DETAILS}/${idTmdb}/season/${numeroTemporada}`,
        {
          params: {
            language: idioma,
          },
          headers: {
            Authorization: `Bearer ${env.TMDB_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const dados = resposta.data;

      const episodios = (dados.episodes || []).map((ep: any) => ({
        numero: ep.episode_number,
        titulo: ep.name || `Episódio ${ep.episode_number}`,
        sinopse: ep.overview || '',
        dataLancamento: ep.air_date || '',
        duracao: ep.runtime || null,
        notaTmdb: ep.vote_average || 0,
        votosTmdb: ep.vote_count || 0,
        imagem: ep.still_path ? `${API_URLS.TMDB_IMAGE_BASE}${ep.still_path}` : null,
      }));

      const resultado = {
        idTmdb: dados.id,
        nomeTemporada: dados.name || `Temporada ${numeroTemporada}`,
        sinopse: dados.overview || '',
        poster: dados.poster_path ? `${API_URLS.TMDB_IMAGE_BASE}${dados.poster_path}` : null,
        dataLancamento: dados.air_date || '',
        numeroTemporada: dados.season_number,
        episodios,
      };

      await cacheService.definir(
        chaveCache,
        JSON.stringify(resultado),
        env.CACHE_TTL_TMDB
      );

      return resultado;
    } catch (erro) {
      console.error('Erro ao buscar episódios da temporada no TMDB:', erro);
      return null;
    }
  }
}

export default new ApiExternaService();

