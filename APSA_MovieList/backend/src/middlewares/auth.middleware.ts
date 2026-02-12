import { Response, NextFunction } from 'express';
import { RequisicaoAutenticada } from '../types';
import { UsuarioModel } from '../models/usuario.model';
import { firestore } from '../config/firebase.config';
import { env } from '../config/env.config';

/**
 * Busca usuário no Firestore
 */
const buscarUsuarioFirestore = async (email: string) => {
  if (!firestore) return null;

  const snapshot = await firestore
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    _id: doc.id,
    email: data.email,
    nome: data.nome || data.name || email.split('@')[0],
  };
};

/**
 * Middleware de autenticação
 * Valida se o email existe no Firestore ou MongoDB (dependendo da config)
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

    let usuario: { _id: string; email: string; nome: string } | null = null;

    if (env.MONGODB_ENABLED) {
      // Busca no MongoDB
      const mongoUser = await UsuarioModel.findOne({ email: userEmail }).lean();
      if (mongoUser) {
        usuario = {
          _id: mongoUser._id.toString(),
          email: mongoUser.email,
          nome: mongoUser.nome || mongoUser.name || userEmail.split('@')[0],
        };
      }
    } else {
      // Busca no Firestore
      usuario = await buscarUsuarioFirestore(userEmail);
    }

    if (!usuario) {
      return res.status(403).json({
        sucesso: false,
        erro: 'Usuário não autorizado. Email não encontrado na base de dados.',
      });
    }

    // Adiciona informações do usuário na requisição
    req.usuario = {
      uid: usuario._id,
      email: usuario.email,
      nome: usuario.nome,
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

