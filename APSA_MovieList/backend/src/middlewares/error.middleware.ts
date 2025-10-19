import { Request, Response, NextFunction } from 'express';
import { MENSAGENS_ERRO } from '../constants/mensagens.constants';

/**
 * Middleware para tratamento global de erros
 */
export const tratarErros = (
  erro: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Erro capturado:', erro);

  // Erros conhecidos
  if (erro.message === MENSAGENS_ERRO.FILME_NAO_ENCONTRADO) {
    return res.status(404).json({
      sucesso: false,
      erro: erro.message,
    });
  }

  if (erro.message === MENSAGENS_ERRO.USUARIO_NAO_AUTORIZADO) {
    return res.status(403).json({
      sucesso: false,
      erro: erro.message,
    });
  }

  if (
    erro.message.includes('obrigatório') ||
    erro.message.includes('inválido') ||
    erro.message.includes('Nota')
  ) {
    return res.status(400).json({
      sucesso: false,
      erro: erro.message,
    });
  }

  // Erro genérico
  return res.status(500).json({
    sucesso: false,
    erro: MENSAGENS_ERRO.ERRO_INTERNO,
    detalhes: process.env.NODE_ENV === 'development' ? erro.message : undefined,
  });
};

/**
 * Middleware para rotas não encontradas
 */
export const rotaNaoEncontrada = (_req: Request, res: Response) => {
  return res.status(404).json({
    sucesso: false,
    erro: MENSAGENS_ERRO.RECURSO_NAO_ENCONTRADO,
  });
};

