import { Response, NextFunction } from 'express';
import { RequisicaoAutenticada } from '../types';
import { UsuarioModel } from '../models/usuario.model';

/**
 * Middleware de autenticação simplificado
 * Valida se o email existe na collection users do MongoDB
 */
export const autenticar = async (
  req: RequisicaoAutenticada,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pega email do header X-User-Email
    const userEmail = req.headers['x-user-email'] as string;
    
    
    if (!userEmail) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Email de usuário não fornecido no header X-User-Email',
      });
    }

    // Verifica se o usuário existe no MongoDB
    const usuario = await UsuarioModel.findOne({ email: userEmail }).lean();
    
    
    if (!usuario) {
      return res.status(403).json({
        sucesso: false,
        erro: 'Usuário não autorizado. Email não encontrado na base de dados.',
      });
    }

    // Adiciona informações do usuário na requisição
    req.usuario = {
      uid: usuario._id.toString(),
      email: usuario.email,
      nome: usuario.nome || usuario.name || usuario.email.split('@')[0],
    };

    return next();
  } catch (erro) {
    console.error('🔐 AUTH - Erro no middleware:', erro);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno no servidor',
    });
  }
};

