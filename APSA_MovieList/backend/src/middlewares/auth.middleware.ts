import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequisicaoAutenticada } from '../types';
import { UsuarioModel } from '../models/usuario.model';
import { env } from '../config/env.config';

/**
 * Middleware de autenticação
 * Aceita JWT no header Authorization (preferencial) ou X-User-Email (legado)
 */
export const autenticar = async (
  req: RequisicaoAutenticada,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Tenta JWT no header Authorization
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
          uid: string;
          email: string;
          nome?: string;
        };

        req.usuario = {
          uid: decoded.uid,
          email: decoded.email,
          nome: decoded.nome || decoded.email.split('@')[0],
        };
        return next();
      } catch {
        return res.status(401).json({
          sucesso: false,
          erro: 'Token inválido ou expirado',
        });
      }
    }

    // 2. Fallback: X-User-Email (legado, para compatibilidade)
    const userEmail = req.headers['x-user-email'] as string;

    if (!userEmail) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Token de autenticação não fornecido',
      });
    }

    if (!env.MONGODB_ENABLED) {
      return res.status(500).json({
        sucesso: false,
        erro: 'MongoDB não está habilitado',
      });
    }

    const mongoUser = await UsuarioModel.findOne({ email: userEmail }).lean();
    if (!mongoUser) {
      return res.status(403).json({
        sucesso: false,
        erro: 'Usuário não autorizado. Email não encontrado na base de dados.',
      });
    }

    req.usuario = {
      uid: mongoUser._id.toString(),
      email: mongoUser.email,
      nome: mongoUser.nome || mongoUser.name || userEmail.split('@')[0],
    };

    return next();
  } catch (erro) {
    console.error('AUTH - Erro no middleware:', erro);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno no servidor',
    });
  }
};
