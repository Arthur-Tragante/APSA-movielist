/**
 * Constantes da aplicação (collections e cookies)
 */

export const COLECOES = {
  FILMES: 'movies',
  USUARIOS: 'users',
  SERIES: 'shows',
} as const;

export const COOKIES = {
  TOKEN: 'Token',
  EMAIL: 'Email',
  NOME: 'Name',
} as const;

export const VALIDADE_COOKIE_DIAS = 7;
