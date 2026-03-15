/**
 * URLs das APIs externas
 */
export const API_URLS = {
  TMDB_BASE: 'https://api.themoviedb.org/3',
  TMDB_SEARCH: 'https://api.themoviedb.org/3/search/movie',
  TMDB_SEARCH_SERIES: 'https://api.themoviedb.org/3/search/tv',
  TMDB_MOVIE_DETAILS: 'https://api.themoviedb.org/3/movie',
  TMDB_SERIES_DETAILS: 'https://api.themoviedb.org/3/tv',
  TMDB_SEASON_DETAILS: 'https://api.themoviedb.org/3/tv',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
  OMDB_BASE: 'http://www.omdbapi.com/',
};

/**
 * Coleções do MongoDB
 */
export const COLECOES_MONGODB = {
  FILMES: 'filmes',
  SHOWS: 'shows',
  USUARIOS: 'usuarios',
};

/**
 * Prefixos de cache Redis
 */
export const CACHE_PREFIXES = {
  TMDB_SEARCH: 'tmdb:search:',
  TMDB_SEARCH_SERIES: 'tmdb:search:series:',
  TMDB_MOVIE: 'tmdb:movie:',
  TMDB_SERIES: 'tmdb:series:',
  TMDB_SEASON: 'tmdb:season:',
  OMDB_RATINGS: 'omdb:ratings:',
  FILME: 'filme:',
  FILMES_USUARIO: 'filmes:usuario:',
  SERIE: 'serie:',
  SERIES_USUARIO: 'series:usuario:',
};

