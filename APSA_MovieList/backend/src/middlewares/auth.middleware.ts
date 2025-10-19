import { Response, NextFunction } from 'express';
import { auth } from '../config/firebase.config';
import { RequisicaoAutenticada } from '../types';
import { MENSAGENS_ERRO } from '../constants/mensagens.constants';

/**
 * Middleware para validar autenticação via Firebase Auth
 */
export const autenticar = async (
  req: RequisicaoAutenticada,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        sucesso: false,
        erro: MENSAGENS_ERRO.TOKEN_NAO_FORNECIDO,
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        erro: MENSAGENS_ERRO.TOKEN_NAO_FORNECIDO,
      });
    }

    // Verifica token com Firebase Auth
    const tokenDecodificado = await auth.verifyIdToken(token);

    // Adiciona informações do usuário na requisição
    req.usuario = {
      uid: tokenDecodificado.uid,
      email: tokenDecodificado.email || '',
      nome: tokenDecodificado.name,
    };

    return next();
  } catch (erro) {
    console.error('Erro ao validar token:', erro);
    return res.status(401).json({
      sucesso: false,
      erro: MENSAGENS_ERRO.TOKEN_INVALIDO,
    });
  }
};

