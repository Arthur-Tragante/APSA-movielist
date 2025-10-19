/**
 * Constantes relacionadas às APIs externas
 */

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';
export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const OMDB_BASE_URL = 'https://www.omdbapi.com/';
export const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export const TMDB_BEARER_TOKEN = `Bearer ${TMDB_API_KEY}`;

