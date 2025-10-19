/**
 * Tipos relacionados a usuários
 */

export interface Usuario {
  id?: string;
  nome: string;
  email: string;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosRegistro {
  nome: string;
  email: string;
  senha: string;
}

