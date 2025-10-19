/**
 * URLs das APIs externas
 */
export const API_URLS = {
  TMDB_BASE: 'https://api.themoviedb.org/3',
  TMDB_SEARCH: 'https://api.themoviedb.org/3/search/movie',
  TMDB_MOVIE_DETAILS: 'https://api.themoviedb.org/3/movie',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
  OMDB_BASE: 'http://www.omdbapi.com/',
};

/**
 * Coleções do Firestore
 */
export const COLECOES_FIRESTORE = {
  FILMES: 'filmes',
  USUARIOS: 'usuarios',
};

/**
 * Prefixos de cache Redis
 */
export const CACHE_PREFIXES = {
  TMDB_SEARCH: 'tmdb:search:',
  TMDB_MOVIE: 'tmdb:movie:',
  OMDB_RATINGS: 'omdb:ratings:',
  FILME: 'filme:',
  FILMES_USUARIO: 'filmes:usuario:',
};

