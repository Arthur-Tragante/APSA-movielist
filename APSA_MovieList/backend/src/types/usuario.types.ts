/**
 * Tipos relacionados a usuários
 */

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}

export interface UsuarioAutenticado {
  uid: string;
  email: string;
  nome?: string;
}

