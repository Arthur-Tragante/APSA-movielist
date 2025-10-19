import { Request } from 'express';
import { UsuarioAutenticado } from './usuario.types';

/**
 * Tipos relacionados a HTTP
 */

export interface RequisicaoAutenticada extends Request {
  usuario?: UsuarioAutenticado;
}

export interface RespostaAPI<T = unknown> {
  sucesso: boolean;
  mensagem?: string;
  dados?: T;
  erro?: string;
}

export interface RespostaPaginada<T> extends RespostaAPI<T> {
  total?: number;
  pagina?: number;
  limite?: number;
}

